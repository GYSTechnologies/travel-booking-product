
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

    // ✅ Replace `maxGuests` with slot-based capacity like service
    slots: [
      {
        startTime: {
          type: String, // "11:00"
          required: true,
        },
        endTime: {
          type: String, // "13:00"
          required: true,
        },
        maxGuests: {
          type: Number,
          required: true,
        },
      },
    ],

    // ✅ NEW: Track booked guests for each date + slot
    availability: [
      {
        date: {
          type: String, // "YYYY-MM-DD"
          required: true,
        },
        slot: {
          startTime: String,
          endTime: String,
        },
        bookedGuests: {
          type: Number,
          default: 0,
        },
      },
    ],

    images: {
      type: [String],
      default: [],
    },
    highlights: {
      type: [String],
      default: [],
    },
    aboutHost: {
      type: String,
    },
    rating: {
      type: Number,
      default: 0,
    },

    // ✅ Admin Control
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    documents: [
      {
        docType: String,
        url: String,
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

// ✅ Register both lowercase and capitalized
mongoose.model("experience", experienceSchema);
const Experience = mongoose.model("Experience", experienceSchema);
export default Experience;
