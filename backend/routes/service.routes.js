
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { isHost } from "../middlewares/isHost.js";
import upload from "../middlewares/uploadMiddleware.js";
import { checkActiveSubscription } from "../middlewares/checkSubscription.js";
import {
  createService,
  updateService,
  deleteService,
  getSingleService,
  getServiceBookings,
  getServiceReviews,
  cancelServiceBookingByHost,
  getAllServices,
  getServiceById,
  getServiceDashboardStats,
  filterServicesByLocationOrCategory,
  getServiceBookingsAndEarnings,
  getHostServices,
} from "../controllers/service.controller.js";

const router = express.Router();

// ================= USER SIDE ROUTES =================

// Get all public services (e.g. homepage listing)
router.get("/all-services", getAllServices);
router.get("/service-detail/:id", getServiceById);

// Filter/search services (by location or category)
router.get("/search/filter", filterServicesByLocationOrCategory);

// ================= HOST SIDE ROUTES =================


// Create a new service
router.post(
  "/create-service",
  protect,
  checkActiveSubscription,
  isHost,
  upload.array("images"),
  createService
);

// Get all services listed by current host
router.get(
  "/service-listing",
  protect,
  checkActiveSubscription,
  isHost,
  getHostServices
);

// Dashboard: Overview stats
router.get(
  "/dashboard/stats",
  protect,
  checkActiveSubscription,
  isHost,
  getServiceDashboardStats
);

// Dashboard: Service bookings & earnings
router.get(
  "/dashboard/bookings",
  protect,
  checkActiveSubscription,
  isHost,
  getServiceBookingsAndEarnings
);

// Dashboard: Reviews received
router.get(
  "/dashboard/reviews",
  protect,
  checkActiveSubscription,
  isHost,
  getServiceReviews
);

// Host cancels a confirmed booking
router.put(
  "/bookings/:id/cancel-by-host",
  protect,
  checkActiveSubscription,
  isHost,
  cancelServiceBookingByHost
);

// Update a specific service
router.put(
  "/update/:id",
  protect,
  checkActiveSubscription,
  isHost,
  upload.array("images"),
  updateService
);

// Delete a specific service
router.delete(
  "/delete/:id",
  protect,
  checkActiveSubscription,
  isHost,
  deleteService
);

// Get a single service (for edit or frontend view)
router.get("/:id", protect, checkActiveSubscription, isHost, getSingleService);




export default router;
