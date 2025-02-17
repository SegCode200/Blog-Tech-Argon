import mongoose from "mongoose"

const postSchema = new mongoose.Schema({
  title:{
    type:String,
    required:true,
    minlength: 5,
  },
  content:{
    type:String,
    required:true,
  },
  createdAt:{ 
    type:Date,
    default: Date.now,
  },
  author:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  contentTypeImage:{
    type:String,
    required:true,
  },

})

export const PostModel = mongoose.model("Post", postSchema)