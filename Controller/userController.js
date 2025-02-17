import { UserModel } from "../Model/userModel.js";
import { userValidate } from "../Utils/Schema.js";
import bcrypt from "bcryptjs";
import otpGenerator from "otp-generator";

export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const value = userValidate.validateAsync({
      name: name,
      email: email,
      password: password,
    });
    if (!value) {
      return res.status(400).json({ error: "Invalid input data" });
    }
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
    });
    if (!user) {
      return res.status(500).json({ error: "Failed to create user" });
    }
    return res.status(200).json({ status: "success", data: user });
  } catch (error) {
    return res.status(401).json({ message: "Error while creating user" });
  }
};
