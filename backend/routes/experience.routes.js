import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { isHost } from "../middlewares/isHost.js";
import upload from "../middlewares/uploadMiddleware.js";
import {checkActiveSubscription} from "../middlewares/checkSubscription.js"

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
  upload.array("images"),
  createExperience
);

// Get all experiences 
router.get(
  "/experiences-listing",
  protect,
  checkActiveSubscription,
  isHost,
  getHostExperiences
);

// Dashboard: Overview stats
router.get(
  "/dashboard/stats",
  protect,
  checkActiveSubscription,
  isHost,
  getExperienceDashboardStats
);

//  Dashboard: Bookings& Earnings
router.get(
  "/dashboard/bookings",
  protect,
  checkActiveSubscription,
  isHost,
  getExperienceBookingsAndEarnings
);

//  Dashboard: Reviews for experiences
router.get(
  "/dashboard/reviews",
  protect,
  checkActiveSubscription,
  isHost,
  getExperienceReviews
);

// Cancel a booking by host
router.put(
  "/bookings/:id/cancel-by-host",
  protect,
  checkActiveSubscription,
  isHost,
  cancelExperienceBookingByHost
);

// Update experience
router.put(
  "/update/:id",
  protect,
  checkActiveSubscription,
  isHost,
  upload.array("images"),
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
  deleteExperience
);

//  Get a single experience by ID (for editing)
router.get(
  "/:id",
  protect,
  checkActiveSubscription,
  isHost,
  getSingleExperience
);

export default router;
