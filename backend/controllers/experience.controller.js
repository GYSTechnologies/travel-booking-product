import Experience from "../models/experience.js";
import cloudinary from "../utils/cloudinary.js";
import Booking from "../models/booking.js"; // if not already imported
import Review from "../models/review.js"; // if not already imported
import Razorpay from "razorpay";
import User from "../models/user.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { hostCancelBooking } from "../utils/sendEmail.js";
import { bookingCancelledEmail } from "../utils/sendEmail.js";


//usr side-----

//all-data fetch
export const getAllExperiences = async (req, res) => {
  try {
    const { place, date } = req.query;

    //No-filter or 'all' — return all
    if (!place || place.toLowerCase() === "all") {
      const allExperiences = await Experience.find().sort({ createdAt: -1 });
      return res.status(200).json(allExperiences);
    }

    // Filter  (state, area, or location)
    const query = {
      $or: [
        { state: { $regex: place, $options: "i" } },
        { area: { $regex: place, $options: "i" } },
        { location: { $regex: place, $options: "i" } },
      ],
    };

    const experiences = await Experience.find(query).sort({ createdAt: -1 });


    return res.status(200).json(experiences);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch experiences",
      error: err.message,
    });
  }
};

// Get Experience by ID...
export const getExperienceById = async (req, res) => {
  try {
    const expId = req.params.id;

    const experience = await Experience.findById(expId).populate(
      "host",
      "username email profileImage"
    );
    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    res.status(200).json(experience);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch experience detail",
      error: err.message,
    });
  }
};


export const filterExperiencesByLocationOrCategory = async (req, res) => {
  try {
    const { location, category, state } = req.query;

    const filter = {};
    if (location) filter.location = new RegExp(location, "i");
    if (category) filter.category = new RegExp(category, "i");
    if (state) filter.state = new RegExp(state, "i");

    const experiences = await Experience.find(filter).sort({ createdAt: -1 });

    res.status(200).json(experiences);
  } catch (err) {
    res.status(500).json({
      message: "Failed to filter experiences",
      error: err.message,
    });
  }
};

// Host side experience

//Create Experience...
export const createExperience = async (req, res) => {
  const {
    title,
    category,
    location,
    state,
    description,
    duration,
    pricePerHead,
    maxGuests,
    highlights,
    aboutHost,
  } = req.body;

  try {

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.path, "experiences")
      );
      const imageResults = await Promise.all(uploadPromises);
      imageUrls = imageResults.map((img) => img.secure_url);
    }

  
    const newExperience = await Experience.create({
      host: req.user._id,
      title,
      category,
      location,
      state,
      description,
      duration,
      pricePerHead,
      maxGuests,
      highlights: highlights ? highlights.split(",") : [],
      aboutHost,
      images: imageUrls,
    });

    res.status(201).json({
      message: "Experience created successfully",
      experience: newExperience,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Experience creation failed", error: error.message });
  }
};

//update expeience
export const updateExperience = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    category,
    location,
    state,
    description,
    duration,
    pricePerHead,
    maxGuests,
    highlights,
    aboutHost,
  } = req.body;

  try {
    const experience = await Experience.findById(id);

    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    // Host ownership check
    if (experience.host.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this experience" });
    }

    if (req.files && req.files.length > 0) {
      console.log("🧾 Files received:", req.files); // 👈 Add this
      try {
        const uploadPromises = req.files.map((file) =>
          uploadToCloudinary(file.path, "experiences")
        );
        const uploadResults = await Promise.all(uploadPromises);
        experience.images = uploadResults.map((img) => img.secure_url);
      } catch (uploadError) {
        console.error("🔥 Cloudinary Upload Error:", uploadError); // 👈 Add this
        return res.status(500).json({
          message: "Image upload failed",
          error: uploadError.message,
        });
      }
    }

    experience.title = title || experience.title;
    experience.category = category || experience.category;
    experience.location = location || experience.location;
    experience.state = state || experience.state;
    experience.description = description || experience.description;
    experience.duration = duration || experience.duration;
    experience.pricePerHead = pricePerHead || experience.pricePerHead;
    experience.maxGuests = maxGuests || experience.maxGuests;
    experience.aboutHost = aboutHost || experience.aboutHost;
    experience.highlights = highlights
      ? Array.isArray(highlights)
        ? highlights
        : highlights.split(",")
      : experience.highlights;

    await experience.save();

    res.status(200).json({
      message: "Experience updated successfully",
      experience,
    });
  } catch (error) {
    console.error("🔥 Experience Update Error:", error);
    res.status(500).json({
      message: "Failed to update experience",
      error: error.message,
    });
  }
};

//Get All Experiences by Host
export const getHostExperiences = async (req, res) => {
  try {
    console.log("Decoded User from Token:", req.user); // 🔍 Add this
    const experiences = await Experience.find({ host: req.user._id });
    res.status(200).json({
      message: "Host experiences fetched successfully",
      count: experiences.length,
      experiences,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch experiences",
      error: err.message,
    });
  }
};


//delete 
export const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;

    const experience = await Experience.findById(id);
    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    if (experience.host.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this experience" });
    }

    await experience.deleteOne();

    res.status(200).json({ message: "Experience deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete experience",
      error: error.message,
    });
  }
};


//single experience
export const getSingleExperience = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);

    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    if (experience.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    res.status(200).json({
      message: "Experience fetched successfully",
      data: experience,
    });
  } catch (error) {
    console.error("Get Single Experience Error:", error.message);
    res
      .status(500)
      .json({ message: "Server error while fetching experience." });
  }
};

//booking and earing controller 
export const getExperienceBookingsAndEarnings = async (req, res) => {
  try {
    const hostId = req.user._id;
    const { range = "30d" } = req.query;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const filterDate = new Date();
    if (range === "today") filterDate.setDate(now.getDate());
    else if (range === "7d") filterDate.setDate(now.getDate() - 7);
    else filterDate.setDate(now.getDate() - 30);


    const experienceIds = (
      await Experience.find({ host: hostId }).select("_id")
    ).map((exp) => exp._id);

    const allBookings = await Booking.find({
      referenceId: { $in: experienceIds },
      type: "experience",
      status: "confirmed",
      createdAt: { $gte: filterDate },
    })
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    const total = allBookings.reduce((sum, b) => sum + b.totalPrice, 0);

    const average =
      allBookings.length > 0 ? (total / allBookings.length).toFixed(2) : 0;

    res.status(200).json({
      message: "Bookings and earnings fetched successfully",
      data: {
        bookings: allBookings,
        earnings: {
          total,
        },
        totalBookings: allBookings.length,
        averagePricePerBooking: average,
      },
    });
  } catch (error) {
    console.error("Experience Bookings Error:", error.message);
    res
      .status(500)
      .json({ message: "Server error while fetching experience bookings." });
  }
};


//dashboard
export const getExperienceDashboardStats = async (req, res) => {
  try {
    const hostId = req.user._id;

    // Total Listings
    const totalListings = await Experience.countDocuments({ host: hostId });

    // All experience IDs
    const experienceIds = (
      await Experience.find({ host: hostId }).select("_id")
    ).map((exp) => exp._id);

    //  Total Bookings
    const totalBookings = await Booking.countDocuments({
      type: "experience",
      referenceId: { $in: experienceIds },
      status: "confirmed",
    });

    // Total Earnings
    const allBookings = await Booking.find({
      type: "experience",
      referenceId: { $in: experienceIds },
      status: "confirmed",
    }).select("totalPrice");

    const totalEarnings = allBookings.reduce(
      (acc, booking) => acc + booking.totalPrice,
      0
    );

    // Average Rating
    const reviews = await Review.find({
      type: "experience",
      referenceId: { $in: experienceIds },
    }).select("rating");

    const ratingTotal = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating =
      reviews.length > 0 ? (ratingTotal / reviews.length).toFixed(1) : 0;

    res.status(200).json({
      message: "Dashboard stats fetched successfully",
      stats: {
        totalListings,
        totalBookings,
        totalEarnings,
        averageRating,
      },
    });
  } catch (error) {
    console.error("Experience Dashboard Stats Error:", error.message);
    res
      .status(500)
      .json({ message: "Server error while loading experience stats." });
  }
};

//review
export const getExperienceReviews = async (req, res) => {
  try {
    const hostExperiences = await Experience.find({
      host: req.user._id,
    }).select("_id");
    const experienceIds = hostExperiences.map((exp) => exp._id);

    const reviews = await Review.find({
      type: "experience",
      referenceId: { $in: experienceIds },
    })
      .populate("user", "username profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Experience reviews fetched successfully",
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error("Experience Reviews Error:", error.message);
    res.status(500).json({ message: "Server error while fetching reviews." });
  }
};



export const cancelExperienceBookingByHost = async (req, res) => {
  try {
    const { reason = "" } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate("user", "username email")
      .populate({
        path: "referenceId",
        model: "Experience",
      });

    if (!booking || booking.type !== "experience") {
      return res
        .status(404)
        .json({ message: "Booking not found or invalid type." });
    }

    if (!booking.referenceId) {
      return res
        .status(400)
        .json({ message: "Experience reference missing in booking." });
    }


    if (booking.referenceId.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized host." });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled." });
    }

    // 24 hour restriction
    const now = new Date();
    const experienceDate = new Date(booking.dateTime);
    const hoursBefore = (experienceDate - now) / (1000 * 60 * 60);

    if (hoursBefore < 24) {
      return res.status(400).json({
        message: "Cannot cancel within 24 hours of experience start.",
      });
    }

    // Cancel booking
    booking.status = "cancelled";
    booking.cancelReason = reason;
    await booking.save();

    if (booking.razorpayPaymentId) {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
      });

      await razorpay.payments.refund(booking.razorpayPaymentId, {
        amount: booking.totalPrice * 100,
      });
    }

    await bookingCancelledEmail(booking.user.email, {
      username: booking.user.username,
      title: booking.referenceId.title,
      type: "experience",
      location: booking.referenceId.location,
      dateTime: experienceDate,
      guests: booking.guests,
      totalPrice: booking.totalPrice,
      reason,
    });

    res.status(200).json({
      message: "Booking cancelled and user notified successfully.",
    });
  } catch (error) {
    console.error("Cancel Experience Booking Error:", error.message);
    res
      .status(500)
      .json({ message: "Server error while cancelling experience booking." });
  }
};
