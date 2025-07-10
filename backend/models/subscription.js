import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, 
    },
    plan: {
      type: String,
      enum: ["trial", "1month", "6months", "1year"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    paymentId: {
      type: String, 
      default: null,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
