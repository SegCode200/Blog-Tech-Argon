import mongoose from "mongoose";
import env from "dotenv"
env.config()

const connectionString = process.env.DATABASE_URL 
export const DatabaseCOnfig = async()=>{
  try {
    await mongoose.connect(connectionString).then(()=>{
      console.log(`Connected to MongoDB  💪 ✌️ ✌️`);
    }).catch((error)=>{
      console.log("Error connecting to MongoDB");
      console.error(error);
    })
  } catch (error) {
    console.log("Error connecting to MongoDB")
  }
}