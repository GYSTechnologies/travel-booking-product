import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { createBooking, getUserBookings } from "../controllers/booking.controller.js";
import checkBookingConflict from "../middlewares/checkBookingConflict.js";

const router = express.Router();

//Create booking after payment (called from /verify route)
router.post("/", protect, checkBookingConflict, createBooking);

// Get all bookings of current user
router.get("/my-bookings", protect, getUserBookings);

export default router;
