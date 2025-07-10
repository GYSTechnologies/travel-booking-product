
import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
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
      enum: ["photography", "spa", "food", "trainer" , "dancer"],
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
    images: {
      type: [String],
      required: true,
    },
    aboutHost: {
      type: String,
      default: "",
    },
    highlights: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);


mongoose.model("service", serviceSchema); 
const Service = mongoose.model("Service", serviceSchema);

export default Service;
