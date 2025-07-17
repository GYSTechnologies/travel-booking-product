import express from "express";
import {
  loginUser,
  registerUser,
  verifyOtpAndRegister,
  magicLogin,
  resubmitHostProfile,
} from "../controllers/auth.controller.js";
import upload from "../middlewares/uploadMiddleware.js";

import { protect } from "../middlewares/authMiddleware.js";
import { checkActiveSubscription } from "../middlewares/checkSubscription.js";

const router = express.Router();

//register host/user
router.post(
  "/register",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "documents", maxCount: 5 },
  ]),
  registerUser
);

// Verifies OTP + saves user
router.post("/verify", verifyOtpAndRegister);
router.post("/login", loginUser);

router.post("/magic-login", magicLogin);

router.patch(
  "/profile-resubmit",
  protect,
  checkActiveSubscription,
  upload.fields([
    { name: "documents", maxCount: 5 },
    { name: "profileImage", maxCount: 1 },
  ]),
  resubmitHostProfile
);

export default router;
