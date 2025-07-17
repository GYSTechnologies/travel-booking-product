import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { isHost } from "../middlewares/isHost.js";
import upload from "../middlewares/uploadMiddleware.js";
import { checkActiveSubscription } from "../middlewares/checkSubscription.js";
import { checkHostApproval } from "../middlewares/checkHostApproval.js";

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
  getAvailableSlotsForService
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
  checkHostApproval, // ✅ added
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "documents", maxCount: 3 },
  ]),
  createService
);

// Get all services listed by current host
router.get(
  "/service-listing",
  protect,
  checkActiveSubscription,
  isHost,
  checkHostApproval, // ✅ added
  getHostServices
);

// Dashboard: Overview stats
router.get(
  "/dashboard/stats",
  protect,
  checkActiveSubscription,
  isHost,
  checkHostApproval, // ✅ added
  getServiceDashboardStats
);

// Dashboard: Service bookings & earnings
router.get(
  "/dashboard/bookings",
  protect,
  checkActiveSubscription,
  isHost,
  checkHostApproval, // ✅ added
  getServiceBookingsAndEarnings
);

// Dashboard: Reviews received
router.get(
  "/dashboard/reviews",
  protect,
  checkActiveSubscription,
  isHost,
  checkHostApproval, // ✅ added
  getServiceReviews
);

// Host cancels a confirmed booking
router.put(
  "/bookings/:id/cancel-by-host",
  protect,
  checkActiveSubscription,
  isHost,
  checkHostApproval, // ✅ added
  cancelServiceBookingByHost
);

// Update a specific service
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
  updateService
);

// Delete a specific service
router.delete(
  "/delete/:id",
  protect,
  checkActiveSubscription,
  isHost,
  checkHostApproval, // ✅ added
  deleteService
);

// Get a single service (for edit or frontend view)
router.get(
  "/:id",
  protect,
  checkActiveSubscription,
  isHost,
  checkHostApproval, // ✅ added
  getSingleService
);


router.get("/:id/slots", getAvailableSlotsForService);


export default router;
