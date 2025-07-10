import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  cancelBookingByUser,
  createReview,
  updateHostProfile,
  getHostProfile
} from "../controllers/user.controller.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

//user profile h yeh...
router.get("/profile", protect, upload.single("profileImage"), getUserProfile); 

router.put(
  "/update",
  protect,
  upload.single("profileImage"),
  updateUserProfile
);

router.post("/reviews", protect, createReview);
router.put("/:id/cancel", protect, cancelBookingByUser);

///////////////////////////////////////////////////////////////////////////

// PUT /api/host/profile
router.get("/host-profile", protect, upload.single("profileImage"), getHostProfile); 
router.put("/host-profile-update", protect, upload.single("profileImage"), updateHostProfile);

export default router;
