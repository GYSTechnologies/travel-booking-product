import Razorpay from "razorpay";
import Subscription from "../models/subscription.js";
import User from "../models/user.js";
import { addMonths } from "date-fns";
import { isValidRazorpaySignature } from "../utils/verifyRazorpaySignature.js";
import { sendSubscriptionConfirmationEmail } from "../utils/sendEmail.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createSubPaymentOrder = async (req, res) => {
  try {
    const { plan } = req.body;

    const planPrices = {
      "1month": 299,
      "6months": 1399,
      "1year": 1999,
    };

    const amount = planPrices[plan];
    if (!amount)
      return res.status(400).json({ message: "Invalid subscription plan" });

    const options = {
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("Razorpay order error", err);
    res.status(500).json({ message: "Failed to create Razorpay order" });
  }
};


export const verifySubscriptionPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      email,
    } = req.body;

    const userId = req.user._id;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !plan ||
      !email
    ) {
      return res.status(400).json({ message: "Missing payment or user info" });
    }

    // ✅ Verify Razorpay Signature
    const isValid = isValidRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET
    );

    if (!isValid) {
      return res.status(400).json({ message: "Invalid Razorpay signature" });
    }

    // ✅ Plan Map
    const planMap = {
      "1month": { duration: addMonths(new Date(), 1), price: 299 },
      "6months": { duration: addMonths(new Date(), 6), price: 1399 },
      "1year": { duration: addMonths(new Date(), 12), price: 1999 },
    };

    const selected = planMap[plan];
    if (!selected) return res.status(400).json({ message: "Invalid plan" });

    // ✅ Upsert Subscription
    const newSubscription = await Subscription.findOneAndUpdate(
      { host: userId },
      {
        plan,
        price: selected.price,
        startDate: new Date(),
        endDate: selected.duration,
        paymentId: razorpay_payment_id,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    // // ✅ Update user's `hasActiveSubscription` flag to true
    // await User.findByIdAndUpdate(userId, {
    //   hasActiveSubscription: true,
    // });

    // ✅ Send confirmation email
    await sendSubscriptionConfirmationEmail(email, {
      plan,
      endDate: selected.duration,
      price: selected.price,
    });

    res.status(200).json({
      message: "Subscription payment verified & saved",
      subscription: newSubscription,
    });
  } catch (err) {
    console.error("Subscription verification error", err);
    res
      .status(500)
      .json({ message: "Payment verification failed", error: err.message });
  }
};
