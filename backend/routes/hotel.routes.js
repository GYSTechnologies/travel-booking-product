import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { isHost } from "../middlewares/isHost.js";
import upload from "../middlewares/uploadMiddleware.js";
import { checkActiveSubscription } from "../middlewares/checkSubscription.js";

import {
  createHotel,
  getSingleHotel,
  updateHotel,
  deleteHotel,
  getHotelDashboardStats,
  getHotelBookingsAndEarnings,
  getHotelReviews,
  cancelHotelBookingByHost,
  getHostHotels,
  getAllHotels,
  getHotelById,
} from "../controllers/hotel.controller.js";

const router = express.Router();

// ================= USER SIDE ROUTES =================

// Get all public hotels (for listing/search)
router.get("/all-hotels", getAllHotels);


// ================= HOST SIDE ROUTES =================

// Create a new hotel listing
router.post(
  "/hotel-create",
  protect,
  checkActiveSubscription,
  isHost,
  upload.array("images"),
  createHotel
);

// Get all hotels owned by the logged-in host
router.get("/hotels", protect, checkActiveSubscription, isHost, getHostHotels);

// Dashboard Home Overview stats
router.get(
  "/dashboard/stats",
  protect,
  checkActiveSubscription,
  isHost,
  getHotelDashboardStats
);

// Bookings & Earnings (filter by date range)
router.get(
  "/dashboard/bookings",
  protect,
  checkActiveSubscription,
  isHost,
  getHotelBookingsAndEarnings
);

// Reviews received for hotels
router.get(
  "/dashboard/reviews",
  protect,
  checkActiveSubscription,
  isHost,
  getHotelReviews
);

//booking cancel routes
router.put(
  "/bookings/:id/cancel-by-host",
  protect,
  checkActiveSubscription,
  isHost,
  cancelHotelBookingByHost
);

// Update  hotel
router.put(
  "/hotel-update/:id",
  protect,
  checkActiveSubscription,
  isHost,
  upload.array("images"),
  updateHotel
);

// Delete a specific hotel
router.delete(
  "/hotel-delete/:id",
  protect,
  checkActiveSubscription,
  isHost,
  deleteHotel
);

// Get a single hotel by ID (for editing)
router.get("/:id", protect, checkActiveSubscription, isHost, getSingleHotel);


//Get hotel detail by ID
router.get("/hotel-detail/:id", getHotelById);

export default router;
