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
      enum: ["photography", "spa", "food", "trainer", "dancer"],
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
    // maxGuests: {
    //   type: Number,
    //   required: true,
    // },
    slots: [
      {
        startTime: {
          type: String, // "11:00"
          required: true,
        },
        endTime: {
          type: String, // "14:00"
          required: true,
        },
        maxGuests: {
          type: Number,
          required: true,
        },
      },
    ],
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

    //add for super admin
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

mongoose.model("service", serviceSchema);
const Service = mongoose.model("Service", serviceSchema);

export default Service;
