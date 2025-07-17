import dotenv from "dotenv";
dotenv.config();

import jwt from "jsonwebtoken";

import User from "../models/user.js";
import TempUser from "../models/tempUser.js";

import { generateOTP } from "../utils/generateOTP.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateToken } from "../utils/generateToken.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

import bcrypt from "bcryptjs";

//user register...
export const registerUser = async (req, res) => {
  const {
    username,
    email,
    password,
    phone,
    address,
    role,
    hostType,
    documentTypes,
  } = req.body;


  const profileFile = req.files?.profileImage?.[0];
  let profileImage = "";

  try {

    const existingUser = await User.findOne({ email });
    if (existingUser) {

      return res.status(400).json({ message: "User already exists" });
    }


    await TempUser.deleteMany({ email });

    
    const otp = generateOTP();
    const hashedPassword = await bcrypt.hash(password, 10);

    if (profileFile) {

      const cloudRes = await uploadToCloudinary(profileFile.path, "profiles");
      profileImage = cloudRes.secure_url;
      
    }

    const uploadedDocs = [];
    const docFiles = req.files?.documents || [];

    if (role === "host" && docFiles.length === 0) {

      return res
        .status(400)
        .json({ message: "KYC documents are required for host" });
    }


    for (let i = 0; i < docFiles.length; i++) {
      const file = docFiles[i];

      const cloudRes = await uploadToCloudinary(file.path, "kyc");

      const docType = Array.isArray(documentTypes)
        ? documentTypes[i]
        : documentTypes;

      if (!docType) {
   
        return res.status(400).json({
          message: `Missing document type for document ${i + 1}`,
        });
      }

      uploadedDocs.push({
        docType,
        url: cloudRes.secure_url,
        status: "pending",
        rejectionReason: "",
      });

    }


    await TempUser.create({
      username,
      email,
      password: hashedPassword,
      phone,
      address,
      profileImage,
      otp,
      role: role || "user",
      hostType:
        role === "host"
          ? Array.isArray(hostType)
            ? hostType
            : [hostType]
          : [],
      isKycSubmitted: role === "host",
      kycDocuments: role === "host" ? uploadedDocs : [],
    });


    await sendEmail(email, otp);

    
    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
   
    res.status(500).json({
      message: "Failed to register user",
      error: err.message || "Unknown error",
    });
  }
};

//verify the otp then save into the data-base
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
    const {
      username,
      password,
      phone,
      address,
      profileImage,
      role,
      hostType,
      kycDocuments,
    } = tempUser;

    const user = await User.create({
      username,
      email,
      password,
      phone,
      address,
      profileImage,
      role,
      hostType,
      isOtpVerified: true,
      isKycSubmitted: role === "host",
      isHostApproved: false,
      kycDocuments: role === "host" ? kycDocuments : [],
    });

    const token = generateToken(user._id);

    await TempUser.deleteMany({ email });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address,
        profileImage: user.profileImage,
        role: user.role,
        hostType: user.hostType,
        isOtpVerified: user.isOtpVerified,
        isKycSubmitted: user.isKycSubmitted,
        kycDocuments: user.kycDocuments,
        isHostApproved: user.isHostApproved,
        hostRejectionReason: user.hostRejectionReason,
        hasActiveSubscription: user.hasActiveSubscription,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "OTP verification failed", error: err.message });
  }
};

//  user/host are login...
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
        phone: user.phone,
        address: user.address,
        profileImage: user.profileImage,
        role: user.role,
        hostType: user.hostType,
        isOtpVerified: user.isOtpVerified,
        isKycSubmitted: user.isKycSubmitted,
        kycDocuments: user.kycDocuments,
        isHostApproved: user.isHostApproved,
        hostRejectionReason: user.hostRejectionReason,
        hasActiveSubscription: user.hasActiveSubscription,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};


//login through mail link...
export const magicLogin = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Token is required." });
  }

  try {
    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Find user
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // ✅ Generate new auth token (valid for longer duration)
    const authToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Magic login successful",
      user,
      token: authToken,
    });
  } catch (err) {
    console.error("❌ Magic login error:", err);
    return res.status(401).json({
      message: "Invalid or expired token",
      error: err.message,
    });
  }
};




export const resubmitHostProfile = async (req, res) => {
  try {
    const hostId = req.user.id;
    const host = await User.findById(hostId);

    if (!host || host.role !== "host") {
      return res.status(404).json({ message: "Host not found" });
    }

    const { username, phone, address, hostType } = req.body;

    if (username) host.username = username;
    if (phone) host.phone = phone;
    if (address) host.address = address;
    if (hostType) {
      host.hostType = Array.isArray(hostType) ? hostType : [hostType];
    }

    // ✅ Upload profile image (like createHotel)
    if (req.files?.profileImage?.[0]) {
      const uploaded = await uploadToCloudinary(req.files.profileImage[0].path, "hosts");
      host.profileImage = uploaded.secure_url;
    }

    // ✅ Upload Aadhaar and PAN files
    const kycDocs = [];

    const aadharFile = req.files?.aadharFile?.[0];
    const panFile = req.files?.panFile?.[0];

    if (aadharFile) {
      const upload = await uploadToCloudinary(aadharFile.path, "kyc");
      kycDocs.push({
        docType: "aadhaar",
        url: upload.secure_url,
        status: "pending",
        rejectionReason: "",
      });
    }

    if (panFile) {
      const upload = await uploadToCloudinary(panFile.path, "kyc");
      kycDocs.push({
        docType: "pan",
        url: upload.secure_url,
        status: "pending",
        rejectionReason: "",
      });
    }

    // ✅ Merge new KYC with old (replace if same docType exists)
    for (let doc of kycDocs) {
      const existing = host.kycDocuments.find(d => d.docType === doc.docType);
      if (existing) {
        existing.url = doc.url;
        existing.status = "pending";
        existing.rejectionReason = "";
      } else {
        host.kycDocuments.push(doc);
      }
    }

    // ✅ Reset approval state
    host.isKycSubmitted = true;
    host.isHostApproved = false;
    host.hostRejectionReason = "";

    // ✅ Count resubmission
    host.resubmissionCount = (host.resubmissionCount || 0) + 1;

    await host.save();

    res.status(200).json({ message: "Profile and KYC resubmitted successfully." });
  } catch (err) {
    console.error("❌ Resubmit error:", err);
    res.status(500).json({
      message: "Failed to resubmit host profile",
      error: err.message,
    });
  }
};
