import express from "express";
import {
  registerSuperAdmin,
  loginSuperAdmin,

  getAdminDashboardStats,
  
  getPendingHosts,
  getSingleHostDetails,
  approveHost,
  rejectHost,
  getPendingListings,
  approveListing,
  rejectListing,
  getApprovedHosts,
  getRejectedHosts,
  getAllListings,
  getRejectedListings,
  getApprovedListings
} from "../controllers/superadmin.controller.js";

import { verifySuperAdmin } from "../middlewares/verifySuperAdmin.js";

const router = express.Router();

// Optional: Protect register route or allow only via secret
router.post("/register", registerSuperAdmin);
router.post("/login", loginSuperAdmin);

// 🧑‍💻 Only super admin can access
router.use(verifySuperAdmin);


router.get("/dashboard/overview", getAdminDashboardStats);


// 🟢 HOST MANAGEMENT
router.get("/hosts/pending", getPendingHosts); // ✅ all hosts waiting
router.get("/hosts/approved", getApprovedHosts); 
router.get("/hosts/rejected", getRejectedHosts);
router.get("/hosts/:id", getSingleHostDetails); // ✅ single host profile
router.put("/hosts/:id/approve", approveHost); // ✅ approve host
router.put("/hosts/:id/reject", rejectHost); // ✅ reject with reason

// 🟢 LISTING MANAGEMENT (hotel/service/experience)
router.get("/listings/pending", getPendingListings); 
router.get("/listings/approved", getApprovedListings); 
router.get("/listings/rejected", getRejectedListings); 

router.get("/listings/all", getAllListings); // ✅ All listings across types
router.put("/listing/:type/:id/approve", approveListing); // ✅ approve one
router.put("/listing/:type/:id/reject", rejectListing); // ✅ reject one with reason

export default router;
