
import Review from "../models/review.js";
import Hotel from "../models/hotel.js";
import Experience from "../models/experience.js";
import Service from "../models/service.js";

export const updateAverageRating = async (referenceId, type) => {
  const reviews = await Review.find({ referenceId, type });

  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  const avgRating = reviews.length ? total / reviews.length : 0;

  if (type === "hotel") {
    await Hotel.findByIdAndUpdate(referenceId, { rating: avgRating });
  } else if (type === "experience") {
    await Experience.findByIdAndUpdate(referenceId, { rating: avgRating });
  } else if (type === "service") {
    await Service.findByIdAndUpdate(referenceId, { rating: avgRating });
  }
};
