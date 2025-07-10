
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createReview,
  getReviewsByReference,
} from "../controllers/review.controller.js";

const router = express.Router();

// Post review
router.post("/", protect, createReview);

//  Get reviews for hotel/experience
router.get("/:type/:id", getReviewsByReference);

export default router;
