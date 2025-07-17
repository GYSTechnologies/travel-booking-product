import Booking from "../models/booking.js";
import Razorpay from "razorpay";
import Hotel from "../models/hotel.js";
import User from "../models/user.js";
import Review from "../models/review.js";
import Experience from "../models/experience.js";
import Service from "../models/service.js";

import { uploadToCloudinary } from "../utils/cloudinary.js";
import { releaseHotelRooms } from "../utils/bookingCancel.js";
import { userCancelBooking } from "../utils/sendEmail.js";

//cancel booking controller...
export const cancelBookingByUser = async (req, res) => {
  try {
    const { reason = "" } = req.body;

    const booking = await Booking.findById(req.params.id).populate("user");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled" });
    }

    // Dynamically load referenced model
    const Model =
      booking.type === "hotel"
        ? Hotel
        : booking.type === "service"
        ? Service
        : Experience;

    const item = await Model.findById(booking.referenceId);
    const host = await User.findById(item.host);

    const checkDate =
      booking.type === "hotel" ? booking.checkIn : booking.dateTime;
    const hoursBefore = (new Date(checkDate) - new Date()) / (1000 * 60 * 60);

    let refundPercent = 0;
    if (hoursBefore >= 24) refundPercent = 1;
    else if (hoursBefore >= 12) refundPercent = 0.5;
    else if (hoursBefore >= 6) refundPercent = 0.25;

    const refundAmount = Math.round(booking.totalPrice * refundPercent);

    // Update booking status
    booking.status = "cancelled";
    booking.cancelReason = reason;
    await booking.save();

    // Razorpay refund logic
    if (refundAmount > 0 && booking.razorpayPaymentId) {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
      });

      await razorpay.payments.refund(booking.razorpayPaymentId, {
        amount: refundAmount * 100,
      });
    }

    // Release hotel availability
    if (booking.type === "hotel") {
      await releaseHotelRooms(
        booking.referenceId,
        booking.checkIn,
        booking.checkOut,
        booking.rooms
      );
    }

    // ✅ Release service or experience slot availability
    if (booking.type === "service" || booking.type === "experience") {
      const { date, slotBooking, guests } = booking;

      const slotKey = slotBooking?.startTime;
      if (slotKey && date) {
        const availabilityIndex = item.availability.findIndex(
          (entry) =>
            entry.date === date &&
            entry.slot.startTime === slotBooking.startTime &&
            entry.slot.endTime === slotBooking.endTime
        );

        if (availabilityIndex !== -1) {
          item.availability[availabilityIndex].bookedGuests -= guests;

          if (item.availability[availabilityIndex].bookedGuests < 0) {
            item.availability[availabilityIndex].bookedGuests = 0;
          }

          await item.save();
        }
      }
    }

    // Send email to host
    await userCancelBooking(host.email, {
      hostUsername: host.username,
      userUsername: booking.user.username,
      itemTitle: item.title,
      type: booking.type,
      checkDate,
      reason,
      refundAmount,
    });

    res.status(200).json({
      message: `Booking cancelled successfully. ₹${refundAmount} refunded.`,
      refundAmount,
    });
  } catch (err) {
    console.error("Cancel Booking Error:", err.message);
    res.status(500).json({ message: "Server error during cancellation." });
  }
};

//review create...
export const createReview = async (req, res) => {
  try {
    const { referenceId, type, rating, comment } = req.body;
    const userId = req.user._id;

    // Validate type
    if (!["hotel", "service", "experience"].includes(type)) {
      return res.status(400).json({ message: "Invalid review type." });
    }

    // Check booking existence & completion
    const bookingQuery = {
      user: userId,
      paymentStatus: "paid",
      status: "completed",
    };

    bookingQuery[type] = referenceId;

    const booking = await Booking.findOne(bookingQuery);
    if (!booking) {
      return res.status(400).json({
        message: `You can only review after completing your ${type} booking.`,
      });
    }

    // Check duplicate review
    const alreadyReviewed = await Review.findOne({
      user: userId,
      referenceId,
      type,
    });
    if (alreadyReviewed) {
      return res
        .status(400)
        .json({ message: "You already reviewed this item." });
    }

    // Create review
    const review = await Review.create({
      user: userId,
      referenceId,
      type,
      rating,
      comment,
    });

    // Update avg rating
    const allReviews = await Review.find({ referenceId, type });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    if (type === "hotel") {
      await Hotel.findByIdAndUpdate(referenceId, { rating: avgRating });
    } else if (type === "experience") {
      await Experience.findByIdAndUpdate(referenceId, { rating: avgRating });
    } else {
      await Service.findByIdAndUpdate(referenceId, { rating: avgRating });
    }

    res.status(201).json({
      message: `${type} review submitted successfully`,
      review,
    });
  } catch (error) {
    console.error("Review Error:", error.message);
    res.status(500).json({ message: "Server error during review submission." });
  }
};

//user profile h yeh...
export const getUserProfile = async (req, res) => {
  try {
    const user = req.user;

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role,
      profileImage: user.profileImage,
      createdAt: user.createdAt,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch profile", error: err.message });
  }
};

//profile update
export const updateUserProfile = async (req, res) => {
  try {
    const user = req.user;
    const { username, phone, address } = req.body;

    let imageUrl = user.profileImage;

    // ✅ Step 1: Try uploading new profile image if provided
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(
          req.file.path,
          "profiles"
        );
        imageUrl = uploadResult.secure_url;
      } catch (uploadErr) {
        console.error("Cloudinary upload failed:", uploadErr);
        return res.status(500).json({
          message: "Image upload failed",
          error: uploadErr.message,
        });
      }
    }

    // ✅ Step 2: Update only provided fields
    user.username = username || user.username;
    user.phone = phone || user.phone;
    user.address = address || user.address;
    user.profileImage = imageUrl;

    const updatedUser = await user.save();

    // ✅ Step 3: Respond with updated user
    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        role: updatedUser.role,
        profileImage: updatedUser.profileImage,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (err) {
    console.error("UPDATE PROFILE FAILED:", err);
    res.status(500).json({
      message: "Failed to update profile",
      error: err.message,
    });
  }
};

//HOST PROFILE AND UPDATE...
export const getHostProfile = async (req, res) => {
  try {
    const hostId = req.user._id;

    const user = await User.findById(hostId).select(
      "_id username email phone address role profileImage createdAt hostType"
    );

    if (!user || user.role !== "host") {
      return res.status(404).json({ message: "Host not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("GET HOST PROFILE ERROR:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch profile", error: err.message });
  }
};

export const updateHostProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    // Make sure body is actually populated
    const { username, phone, address } = req.body;

    const user = await User.findById(userId);
    if (!user || user.role !== "host") {
      return res.status(404).json({ message: "Host not found" });
    }

    // Profile image (if provided)
    if (req.file) {
      const result = await uploadToCloudinary(req.file.path, "profiles");
      user.profileImage = result.secure_url;
    }

    // Update other fields
    if (username) user.username = username;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    await user.save();

    res.status(200).json({ message: "Profile updated", user });
  } catch (error) {
    res.status(500).json({
      message: "Profile update failed",
      error: error.message,
    });
  }
};
