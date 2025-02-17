import mongoose, { Schema } from 'mongoose';


const userSchema = new Schema(
  {
  name:{
    type: String,
    required: true
  },
  email:{
    type:String,
    required: true,
    unique: true,
    match: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
  },
  password:{
    type:String,
    required:true,
    minlenght:6
  },
  profileImage:{
    type:String
  },
  isVerified:{
    type: Boolean,
    default: false
  },
  OTP:{
    type:Number,
  },
  posts:[
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post"
    }
  ]
},{timestamps:true})

export const UserModel = mongoose.model("User",userSchema)