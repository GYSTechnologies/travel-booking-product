import dotenv from "dotenv";
dotenv.config();
import User from "../models/user.js";
import TempUser from "../models/tempUser.js";

import { generateOTP } from "../utils/generateOTP.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateToken } from "../utils/generateToken.js";

import bcrypt from "bcryptjs";

//user register...
export const registerUser = async (req, res) => {
  const { username, email, password, phone, address, role, hostType } =
    req.body;
  const profileImage = req.file?.path || "";

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    await TempUser.deleteMany({ email });

    const otp = generateOTP();
    const hashedPassword = await bcrypt.hash(password, 10);

    await TempUser.create({
      username,
      email,
      password: hashedPassword,
      phone,
      address,
      profileImage,
      otp,
      role: role || "user", // ✅ use role from frontend
      // hostType: role === "host" ? [hostType] : [], // ✅ save hostType array only if host
      hostType:
        role === "host"
          ? Array.isArray(hostType)
            ? hostType
            : [hostType]
          : [],
    });

    await sendEmail(email, otp);
    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP", error: err.message });
  }
};

//verify otp and user data save into database
export const verifyOtpAndRegister = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const tempUser = await TempUser.findOne({ email });
    if (!tempUser)
      return res
        .status(400)
        .json({ message: "No pending registration for this email" });

    if (tempUser.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    // Create real user
    const { username, password, phone, address, profileImage, role, hostType } =
      tempUser;

    const user = await User.create({
      username,
      email,
      password,
      phone,
      address,
      profileImage,
      role,
      hostType,
    });

    const token = generateToken(user._id);

    // Remove temp data
    await TempUser.deleteMany({ email });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role, // user | host
        profileImage: user.profileImage,
        hostType: user.hostType,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "OTP verification failed", error: err.message });
  }
};

//  user/host are login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role, // user | host
        hostType: user.hostType, 
        profileImage: user.profileImage,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};
