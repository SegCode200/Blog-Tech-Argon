import express from "express"
import { createUser, get0neUser, loginUser, VertifyCode } from "../Controller/userController.js"
import { SendverficationCode } from "../Lib/Email.js";
import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router()

router.route("/create-user").post(upload.single('image'), createUser)
router.route("/verify-user").post(VertifyCode)
router.route("/login-user").post(loginUser)
router.route("/get-one-user").get(get0neUser)
// router.route("/send-otp").get(SendOtp)




export default router