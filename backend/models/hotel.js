import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema(
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
    description: {
      type: String,
    },
    state: {
      type: String,
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true, 
    },
    images: {
      type: [String], 
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    pricePerNight: {
      type: Number,
      required: true,
    },
    availableRooms: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

mongoose.model("hotel", hotelSchema);   // for refPath: "type" = "hotel"
const Hotel = mongoose.model("Hotel", hotelSchema); 

export default Hotel;
