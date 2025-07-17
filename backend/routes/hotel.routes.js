import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { isHost } from "../middlewares/isHost.js";
import upload from "../middlewares/uploadMiddleware.js";
import { checkActiveSubscription } from "../middlewares/checkSubscription.js";
import { checkHostApproval } from "../middlewares/checkHostApproval.js";

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
  getHotelAvailability
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
  checkHostApproval, // ✅ added
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "documents", maxCount: 3 },
  ]),
  createHotel
);

// Get all hotels owned by the logged-in host
router.get(
  "/hotels",
  protect,
  checkActiveSubscription,
  isHost,
  checkHostApproval, // ✅ added
  getHostHotels
);

// Dashboard Home Overview stats
router.get(
  "/dashboard/stats",
  protect,
  checkActiveSubscription,
  isHost,
  checkHostApproval, // ✅ added
  getHotelDashboardStats
);

// Bookings & Earnings (filter by date range)
router.get(
  "/dashboard/bookings",
  protect,
  checkActiveSubscription,
  isHost,
  checkHostApproval, // ✅ added
  getHotelBookingsAndEarnings
);

// Reviews received for hotels
router.get(
  "/dashboard/reviews",
  protect,
  checkActiveSubscription,
  isHost,
  checkHostApproval, // ✅ added
  getHotelReviews
);

// Booking cancel route by host
router.put(
  "/bookings/:id/cancel-by-host",
  protect,
  checkActiveSubscription,
  isHost,
  checkHostApproval, // ✅ added
  cancelHotelBookingByHost
);

// Update hotel
router.put(
  "/hotel-update/:id",
  protect,
  checkActiveSubscription,
  isHost,
  checkHostApproval, // ✅ added
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "docFile", maxCount: 5 }, // ✅ for document images (optional)
  ]),
  updateHotel
);

// Delete a specific hotel
router.delete(
  "/hotel-delete/:id",
  protect,
  checkActiveSubscription,
  isHost,
  checkHostApproval, // ✅ added
  deleteHotel
);

// Get a single hotel by ID (for editing)
router.get(
  "/:id",
  protect,
  checkActiveSubscription,
  isHost,
  checkHostApproval, // ✅ added
  getSingleHotel
);

// Get hotel detail by ID (🟢 user-side route – no middleware)
router.get("/hotel-detail/:id", getHotelById);

router.get("/:id/availability", getHotelAvailability);


export default router;
