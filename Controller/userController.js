import { UserModel } from "../Model/userModel.js";
import { userValidate } from "../Utils/Schema.js";
import bcrypt from "bcryptjs";
import otpGenerator from "otp-generator";
import {openingMail} from "../Lib/Email.js"
import streamifier from "streamifier"
import cloudinary from "../Lib/Cloudinary.js";
import jwt from 'jsonwebtoken'

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
export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
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
    const {error, value} = userValidate.validate({
      name: name,
      email: email,
      password: password,
    });
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    // return res.status(400).json({ error: "Invalid input data" });

    const existingEmail = await UserModel.findOne({ email: value.email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }
    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(value.password, salt);
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      digits: true,
      lowerCaseAlphabets: false,
    });
    const user = await UserModel.create({
      name: name,
      email: email,
      password: hashedPassword,
      OTP: otp,
      profileImage: uploadedImageUrl
    });
    if (!user) {
      return res.status(500).json({ error: "Failed to create user" });
    }
   await openingMail(email,otp).then(()=>{
     return res.status(200).json({ status: "success", data: user });
   })

  } catch (error) {
    console.log(error)
    return res.status(401).json({ message: "Error while creating user" });
  }
}

export const VertifyCode =async (req,res) =>{
  try {
     const {email,OTP} = req.body;

     const user = await UserModel.findOne({email: email});
     if (!user) {
       return res.status(404).json({message: "User not found"});
     }
     if (user.OTP!== OTP) {
       return res.status(400).json({message: "Invalid OTP"});
     }
     user.isVerified = true;
     user.OTP = null; 
     await user.save();
     return res.status(200).json({message: "User verified successfully"});
  } catch (error) {
    console.log(error)
    return res.status(401).json({ message: "Error while Verifying  user" });
  }
}

export const loginUser = async (req, res) => {
  try {
     const {email, password} = req.body;
     const user = await UserModel.findOne({email: email});
     if (!user) {
       return res.status(404).json({message: "User not found"});
     }
     if (user.isVerified === false || user.OTP !== null) {
       return res.status(400).json({message: "User is not verified"});
     }
     const match = await bcrypt.compare(password, user.password);
     if (!match) {
       return res.status(400).json({message: "Invalid password"});
     }
     
     const token = jwt.sign({ id: user._id }, "Emma Dev", { expiresIn: "1h" });
     return res.status(200).json({ message: "Logged In successfully", token: token });
  } catch (error) {
    console.log(error)
    return res.status(401).json({ message: "Error while Logging In  user" });
  }
}

export const get0neUser =async (req, res) => {
  try {
    const {userId} = req.params
    if (!userId) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({message: "User not found"});
    }
    return res.status(200).json({ status: "success", data: user });
  } catch (error) {
    console.log(error)
    return res.status(401).json({ message: "Error while getting one  user" });
  }
}