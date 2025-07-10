import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { isHost } from "../middlewares/isHost.js";
import {
  getSubscriptionStatus,
  startTrial
} from "../controllers/subscription.controller.js";

const router = express.Router();

//subcription routes
router.post("/start-trial", protect, isHost, startTrial);
router.get("/status", protect,isHost, getSubscriptionStatus);

export default router;
