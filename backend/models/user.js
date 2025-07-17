import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    phone: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    profileImage: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["user", "host"],
      default: "user",
    },
    hostType: {
      type: [String],
      enum: ["hotel", "services", "experiences"],
      default: [],
    },

    //add for super admin
    isOtpVerified: {
      type: Boolean,
      default: false,
    },

    isKycSubmitted: {
      type: Boolean,
      default: false,
    },

    kycDocuments: [
      {
        docType: {
          type: String, // aadhaar, pan, etc.
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

    isHostApproved: {
      type: Boolean,
      default: false,
    },

    hostRejectionReason: {
      type: String,
      default: "",
    },

    resubmissionCount: {
      type: Number,
      default: 0,
    },

    hasActiveSubscription: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
