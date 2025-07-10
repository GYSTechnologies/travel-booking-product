import Subscription from "../models/subscription.js";
import { addDays, addMonths } from "date-fns";
import { sendTrialActivationEmail } from "../utils/sendEmail.js";



//subcription trail controller
export const startTrial = async (req, res) => {
  try {
    const hostId = req.user._id;

    const existing = await Subscription.findOne({ host: hostId });

    if (existing) {
      return res.status(400).json({
        message: "Trial already used or subscription already exists.",
      });
    }

    const trialSubscription = await Subscription.create({
      host: hostId,
      plan: "trial",
      price: 0,
      startDate: new Date(),
      endDate: addDays(new Date(), 3),
      isActive: true,
    });

      // Send trial activation email
    await sendTrialActivationEmail(email, endDate);

    res.status(200).json({
      message: "Trial activated successfully",
      subscription: trialSubscription,
    });
  } catch (err) {
    console.error("Trial activation error:", err);
    res.status(500).json({ message: "Failed to start trial" });
  }
};



// Get Current Host's Subscription Status
export const getSubscriptionStatus = async (req, res) => {
  const hostId = req.user._id;
  
  const subscription = await Subscription.findOne({ host: hostId });

  if (!subscription)
    return res.status(200).json({ isActive: false, hasUsedTrial: false });

  const now = new Date();
  const isExpired = new Date(subscription.endDate) < now;

  return res.status(200).json({
    isActive: !isExpired && subscription.isActive,
    hasUsedTrial: subscription.plan === "trial",
    plan: subscription.plan,
    endDate: subscription.endDate,
  });
};
