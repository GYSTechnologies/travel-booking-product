
import mongoose from "mongoose";

const experienceSchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    pricePerHead: {
      type: Number,
      required: true,
    },
    maxGuests: {
      type: Number,
      required: true,
    },
    images: [String],
    highlights: [String], 
    aboutHost: {
      type: String,
    },
    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// ✅ Register both names for dynamic population
mongoose.model("experience", experienceSchema); // for refPath: "type" = "experience"
const Experience = mongoose.model("Experience", experienceSchema); // main model

export default Experience;
