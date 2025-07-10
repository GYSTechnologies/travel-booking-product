
import Review from "../models/review.js";
import Hotel from "../models/hotel.js";
import Experience from "../models/experience.js";
import { updateAverageRating } from "../utils/updateAverageRating.js";

export const createReview = async (req, res) => {
  try {
    const { referenceId, type, rating, comment } = req.body;

    if (!["hotel", "experience", "service"].includes(type)) {
      return res.status(400).json({ message: "Invalid review type" });
    }

    // Prevent duplicate reviews
    const existing = await Review.findOne({
      user: req.user._id,
      referenceId,
      type,
    });

    if (existing) {
      return res.status(400).json({ message: "You already reviewed this" });
    }

    const review = await Review.create({
      user: req.user._id,
      referenceId,
      type,
      rating,
      comment,
    });

    await updateAverageRating(referenceId , type);

    res.status(201).json({ message: "Review submitted", review });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit review", error: err.message });
  }
};

export const getReviewsByReference = async (req, res) => {
  const { type, id } = req.params;

  try {
    const reviews = await Review.find({
      referenceId: id,
      type,
    })
      .populate("user", "username")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Failed to get reviews", error: err.message });
  }
};
