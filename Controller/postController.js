import { PostModel } from "../Model/postModel.js";
import { UserModel } from "../Model/userModel.js";
import { postValidate } from "../Utils/Schema.js";
import streamifier from "streamifier"
import cloudinary from "../Lib/Cloudinary.js";
import mongoose from "mongoose";


const uploadImageWithRetries = async(image, retries = 3)=> {
  let attempts = 0;
  while (attempts < retries) {
      try {
          const uploadResponse = await new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                  { timeout: 10000 }, // Set timeout here
                  (error, result) => {
                      if (error) {
                        console.log(error)
                          console.error("Cloudinary upload error:", error);
                          reject("Cloudinary upload failed")
                      } else {
                          resolve(result);
                      }
                  }
              );
              streamifier.createReadStream(image.buffer).pipe(stream);
          });
          return uploadResponse.secure_url;
      } catch (error) {
          attempts++;
          console.log(error)
          console.warn(`Upload attempt ${attempts} failed.`);
          if (attempts >= retries) throw error;
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
      }
  }
  return null;
}

export const createPost = async(req, res, next) =>{
  try {
    const {userId} = req.params
    const {title,content} = req.body
    const image = req.file;
    let uploadedImageUrl = null;
    if (image) {
      try {
        uploadedImageUrl = await uploadImageWithRetries(image);
        if (!uploadedImageUrl) {
          return res.status(500).json({message: "Cloudinary upload failed after multiple attempts"})
        }
      } catch (error) {
        return res.status(500).json({message: "Cloudinary upload failed after multiple attempts"})
      }
    }
    if (!userId ||!title ||!content) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const {value,error} = postValidate.validate({
      title:title,
      content: content
    })
    if(error){
      return res.status(402).json({message: error.message[0].toString()})
    }

    const existingUser = await UserModel.findById({_id: userId})
    if(!existingUser){
      return res.status(404).json({message:"User not found"})
    }

    const newPost = new PostModel({
      title: title,
      content: content,
      author:  new mongoose.Types.ObjectId(userId),
      createdAt:  Date.now(),
      contentTypeImage : uploadedImageUrl
    })

    if(!newPost) {
      return res.status(400).json({error: "Failed to create post"})
    }
    await newPost.save()
    return res.status(200).json({status: "success", data: newPost})

  } catch (error) {
    console.log(error)
    return res.status(500).json({message: "Internal Server Error"})
  }
}

export const getAllUserPosts = async(req,res)=>{
  try {
    const {userId} = req.params
    const user = await UserModel.findById({_id:userId})
    if(!user){
      return res.status(404).json({message:"User not found"})
    }
    const posts = await PostModel.find({author:user.id}).sort({createdAt: -1})
    return res.status(201).json({message: "posts found", data: posts});
  } catch (error) {
    return res.status(500).json({message: "Internal Server Error"})
  }
}