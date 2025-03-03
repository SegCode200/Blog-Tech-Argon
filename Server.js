import express from "express"
import cors from "cors"
import env from "dotenv"
import { DatabaseCOnfig } from "./Config/DB.js"
import user from "./router/userRoute.js"
env.config()



const app = express()
app.use(express.json())

app.use(cors())

const PORT = process.env.PORT || 4010

app.use('/api/v1/user',user)

app.listen(PORT,()=>{
  console.clear()
  console.log(`Server running on port ${PORT} 🥶🥶`)
  DatabaseCOnfig()
})
