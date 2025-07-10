import Subscription from "../models/subscription.js";

export const checkActiveSubscription = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const subscription = await Subscription.findOne({ host: userId });

    // No subscription found
    if (!subscription) {
      return res.status(403).json({
        message: "Access denied. No active subscription found.",
      });
    }

    // Expired or inactive
    const now = new Date();
    if (subscription.endDate < now || subscription.isActive === false) {
      return res.status(403).json({
        message: "Your subscription has expired. Please renew to continue.",
      });
    }

    // ✅ All good
    next();
  } catch (err) {
    console.error("Subscription check error:", err);
    res.status(500).json({ message: "Subscription check failed" });
  }
};
