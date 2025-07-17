import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { isHost } from "../middlewares/isHost.js";
import upload from "../middlewares/uploadMiddleware.js";
import { checkActiveSubscription } from "../middlewares/checkSubscription.js";
import { checkHostApproval } from "../middlewares/checkHostApproval.js";

import {
  createExperience,
  getHostExperiences,
  updateExperience,
  deleteExperience,
  getSingleExperience,
  getExperienceDashboardStats,
  getExperienceBookingsAndEarnings,
  getExperienceReviews,
  cancelExperienceBookingByHost,
  getAllExperiences,
  getExperienceById,
  getAvailableExperienceSlots,
} from "../controllers/experience.controller.js";

const router = express.Router();

// ================= Experience-> USER SIDE ROUTES =================

// Get all public experiences
router.get("/all-experiences", getAllExperiences);

// =================Experience-> HOST SIDE ROUTES =================

// Create a new experience
router.post(
  "/create-experience",
  protect,
  checkActiveSubscription,
  isHost,
  checkHostApproval, // ✅ added
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "documents", maxCount: 3 },
  ]),
  createExperience
);

// Get all experiences
router.get(
  "/experiences-listing",
  protect,
  checkActiveSubscription,
  isHost,
  checkHostApproval, // ✅ added
  getHostExperiences
);

// Dashboard: Overview stats
router.get(
  "/dashboard/stats",
  protect,
  checkActiveSubscription,
  isHost,
  checkHostApproval, // ✅ added
  getExperienceDashboardStats
);

// Dashboard: Bookings & Earnings
router.get(
  "/dashboard/bookings",
  protect,
  checkActiveSubscription,
  isHost,
  checkHostApproval, // ✅ added
  getExperienceBookingsAndEarnings
);

// Dashboard: Reviews for experiences
router.get(
  "/dashboard/reviews",
  protect,
  checkActiveSubscription,
  isHost,
  checkHostApproval, // ✅ added
  getExperienceReviews
);

// Cancel a booking by host
router.put(
  "/bookings/:id/cancel-by-host",
  protect,
  checkActiveSubscription,
  isHost,
  checkHostApproval, // ✅ added
  cancelExperienceBookingByHost
);

// Update experience
router.put(
  "/update/:id",
  protect,
  checkActiveSubscription,
  isHost,
  checkHostApproval, // ✅ added
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "docFile", maxCount: 5 }, // ✅ for document images (optional)
  ]),
  updateExperience
);

// Get a specific experience by ID (public view)
router.get("/experience-detail/:id", getExperienceById);

// Delete an experience
router.delete(
  "/delete/:id",
  protect,
  checkActiveSubscription,
  isHost,
  checkHostApproval, // ✅ added
  deleteExperience
);

// Get a single experience by ID (for editing)
router.get(
  "/:id",
  protect,
  checkActiveSubscription,
  isHost,
  checkHostApproval, // ✅ added
  getSingleExperience
);

router.get("/:id/slots", getAvailableExperienceSlots);
export default router;
