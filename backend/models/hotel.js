
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

    // ✅ Added for per-date room availability tracking
    availability: [
      {
        date: {
          type: String, // Format: "YYYY-MM-DD"
          required: true,
        },
        bookedRooms: {
          type: Number,
          default: 0,
        },
      },
    ],

    // Admin Control
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    documents: [
      {
        docType: {
          type: String,
        },
        url: {
          type: String,
        },
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        rejectionReason: {
          type: String,
          default: "",
        },
      },
    ],
    rejectionReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Use lowercase for refPath: "type" = "hotel"
mongoose.model("hotel", hotelSchema);

const Hotel = mongoose.model("Hotel", hotelSchema);
export default Hotel;
