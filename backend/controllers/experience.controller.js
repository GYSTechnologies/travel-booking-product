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

    const baseQuery = {
      status: "approved", // ✅ Only approved experiences
    };

    // No filter or 'all' — show all approved
    if (!place || place.toLowerCase() === "all") {
      const allExperiences = await Experience.find(baseQuery).sort({
        createdAt: -1,
      });
      return res.status(200).json(allExperiences);
    }

    // Filter by state, area, or location
    baseQuery.$or = [
      { state: { $regex: place, $options: "i" } },
      { area: { $regex: place, $options: "i" } },
      { location: { $regex: place, $options: "i" } },
    ];

    const experiences = await Experience.find(baseQuery).sort({
      createdAt: -1,
    });

    return res.status(200).json(experiences);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch experiences",
      error: err.message,
    });
  }
};


export const getExperienceById = async (req, res) => {
  try {
    const expId = req.params.id;
    const { date } = req.query;

    const experience = await Experience.findById(expId).populate(
      "host",
      "username email profileImage"
    );

    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    let slotAvailability = [];

    if (date) {
      slotAvailability = experience.slots.map((slot) => {
        const matched = experience.availability.find(
          (entry) =>
            entry.date === date &&
            entry.slot.startTime === slot.startTime &&
            entry.slot.endTime === slot.endTime
        );

        const bookedGuests = matched?.bookedGuests || 0;

        return {
          time: `${slot.startTime} - ${slot.endTime}`,
          startTime: slot.startTime,
          endTime: slot.endTime,
          maxGuests: slot.maxGuests,
          bookedGuests,
          availableGuests: slot.maxGuests - bookedGuests,
        };
      });
    }

    res.status(200).json({
      ...experience.toObject(),
      slotAvailability: date ? slotAvailability : undefined,
    });
  } catch (err) {
    console.error("Error in getExperienceById:", err);
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

export const createExperience = async (req, res) => {
  try {
    const {
      title,
      category,
      location,
      state,
      description,
      duration,
      pricePerHead,
      highlights,
      aboutHost,
      documentTypes,
      slots,
    } = req.body;

    // 🔒 Validate required fields
    if (
      !title ||
      !category ||
      !location ||
      !state ||
      !description ||
      !duration ||
      !pricePerHead
    ) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    // 🧠 Parse and validate slots
    let parsedSlots = [];
    if (!slots) {
      return res.status(400).json({ message: "Slots are required" });
    }

    try {
      parsedSlots = Array.isArray(slots)
        ? slots
        : typeof slots === "string"
        ? JSON.parse(slots)
        : [];

      if (parsedSlots.length === 0) {
        return res
          .status(400)
          .json({ message: "At least one slot is required" });
      }

      // ⏳ Calculate endTime from duration
      function calculateEndTime(startTime, duration) {
        const [hours, minutes] = startTime.split(":").map(Number);
        const durationInMinutes = Math.round(parseFloat(duration) * 60);
        const startDate = new Date(2000, 0, 1, hours, minutes);
        const endDate = new Date(
          startDate.getTime() + durationInMinutes * 60000
        );
        const endHours = String(endDate.getHours()).padStart(2, "0");
        const endMinutes = String(endDate.getMinutes()).padStart(2, "0");
        return `${endHours}:${endMinutes}`;
      }

      var transformedSlots = [];

      for (const slot of parsedSlots) {
        if (!slot.time || !slot.maxGuests) {
          return res.status(400).json({
            message: "Each slot must include time and maxGuests",
          });
        }

        const endTime = calculateEndTime(slot.time, duration);
        transformedSlots.push({
          startTime: slot.time,
          endTime,
          maxGuests: Number(slot.maxGuests),
        });
      }
    } catch (err) {
      return res.status(400).json({ message: "Invalid slots format" });
    }

    // 📸 Upload Images
    const imageFiles = req.files?.images || [];
    if (imageFiles.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    const uploadImagePromises = imageFiles.map((file) =>
      uploadToCloudinary(file.path, "experiences")
    );
    const uploadedImages = await Promise.all(uploadImagePromises);
    const imageUrls = uploadedImages.map((img) => img.secure_url);

    // 📄 Upload Documents
    const docFiles = req.files?.documents || [];
    const docTypes = Array.isArray(documentTypes)
      ? documentTypes
      : documentTypes
      ? [documentTypes]
      : [];

    let docUrls = [];
    if (docFiles.length > 0 && docTypes.length === docFiles.length) {
      for (let i = 0; i < docFiles.length; i++) {
        const cloudRes = await uploadToCloudinary(
          docFiles[i].path,
          "experience_docs"
        );
        docUrls.push({
          docType: docTypes[i],
          url: cloudRes.secure_url,
          status: "pending",
          rejectionReason: "",
        });
      }
    }

    // ✨ Parse Highlights
    const parsedHighlights = highlights
      ? Array.isArray(highlights)
        ? highlights
        : highlights
            .split(",")
            .map((h) => h.trim())
            .filter(Boolean)
      : [];

    // ✅ Create the Experience
    const newExperience = await Experience.create({
      host: req.user._id,
      title,
      category,
      location,
      state,
      description,
      duration,
      pricePerHead: Number(pricePerHead),
      aboutHost,
      highlights: parsedHighlights,
      images: imageUrls,
      documents: docUrls,
      slots: transformedSlots,
      status: "pending",
      rejectionReason: "",
    });

    res.status(201).json({
      message: "Experience created successfully",
      experience: newExperience,
    });
  } catch (error) {
    console.error("CREATE EXPERIENCE ERROR:", error);
    res.status(500).json({
      message: "Failed to create experience",
      error: error.message,
    });
  }
};


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
    highlights,
    aboutHost,
    existingImages,
    documentTypes,
    slots, // ✅ NEW
  } = req.body;

  try {
    const experience = await Experience.findById(id);
    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    if (experience.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // ✅ 1. Handle Images (retain + new)
    let finalImages = [];
    if (existingImages) {
      finalImages =
        typeof existingImages === "string"
          ? [existingImages]
          : [...existingImages];
    }

    const imageFiles = req.files?.images || [];
    if (imageFiles.length > 0) {
      const uploads = await Promise.all(
        imageFiles.map((file) => uploadToCloudinary(file.path, "experiences"))
      );
      finalImages.push(...uploads.map((img) => img.secure_url));
    }

    experience.images = finalImages;

    // ✅ 2. Handle Documents (replace only if not approved)
    if (documentTypes) {
      const docTypes = Array.isArray(documentTypes)
        ? documentTypes
        : [documentTypes];
      const docFiles = Object.values(req.files || {})
        .flat()
        .filter((f) => f.fieldname.startsWith("docFile"));

      for (let i = 0; i < docFiles.length; i++) {
        const docFile = docFiles[i];
        const docType = docTypes[i] || "other";

        const cloudRes = await uploadToCloudinary(
          docFile.path,
          "experience_docs"
        );

        const existingDocIndex = experience.documents.findIndex(
          (doc) => doc.docType === docType
        );

        if (existingDocIndex !== -1) {
          if (experience.documents[existingDocIndex].status !== "approved") {
            experience.documents[existingDocIndex].url = cloudRes.secure_url;
            experience.documents[existingDocIndex].status = "pending";
            experience.documents[existingDocIndex].rejectionReason = "";
          }
        } else {
          experience.documents.push({
            docType,
            url: cloudRes.secure_url,
            status: "pending",
            rejectionReason: "",
          });
        }
      }
    }

    // ✅ 3. Update text fields
    experience.title = title || experience.title;
    experience.category = category || experience.category;
    experience.location = location || experience.location;
    experience.state = state || experience.state;
    experience.description = description || experience.description;
    experience.duration = duration || experience.duration;
    experience.pricePerHead = pricePerHead || experience.pricePerHead;
    experience.aboutHost = aboutHost || experience.aboutHost;
    experience.highlights = highlights
      ? Array.isArray(highlights)
        ? highlights
        : highlights.split(",")
      : experience.highlights;

    // ✅ 4. Update slots if sent
    if (slots) {
      let parsedSlots = [];

      if (typeof slots === "string") {
        parsedSlots = JSON.parse(slots); // stringified JSON from frontend
      } else if (Array.isArray(slots)) {
        parsedSlots = slots;
      }

      if (!parsedSlots.length) {
        return res
          .status(400)
          .json({ message: "At least one slot is required" });
      }

      for (const slot of parsedSlots) {
        if (
          !slot.startTime ||
          !slot.endTime ||
          !slot.maxGuests ||
          isNaN(slot.maxGuests)
        ) {
          return res.status(400).json({
            message: "Each slot must have startTime, endTime, and maxGuests",
          });
        }
      }

      // ✅ Update slots and reset availability if needed
      experience.slots = parsedSlots;
      // Optional: Clear availability if slot time range changed
      experience.availability = [];
      experience.status = "pending"; // Optional reset approval
    }

    await experience.save();
    res
      .status(200)
      .json({ message: "Experience updated successfully", experience });
  } catch (err) {
    console.error("Update Experience Error:", err);
    res
      .status(500)
      .json({ message: "Failed to update experience", error: err.message });
  }
};



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

    // Restrict cancellation within 24 hours
    const now = new Date();
    const experienceDate = new Date(booking.dateTime);
    const hoursBefore = (experienceDate - now) / (1000 * 60 * 60);
    if (hoursBefore < 24) {
      return res.status(400).json({
        message: "Cannot cancel within 24 hours of experience start.",
      });
    }

    // ✅ Cancel booking
    booking.status = "cancelled";
    booking.cancelReason = reason;
    await booking.save();

    // ✅ Refund if paid
    if (booking.razorpayPaymentId) {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
      });

      await razorpay.payments.refund(booking.razorpayPaymentId, {
        amount: booking.totalPrice * 100,
      });
    }

    // ✅ Update Experience availability[]
    const experience = booking.referenceId;
    const { date, slotBooking, guests } = booking;

    const availabilityIndex = experience.availability.findIndex(
      (entry) =>
        entry.date === date &&
        entry.slot.startTime === slotBooking.startTime &&
        entry.slot.endTime === slotBooking.endTime
    );

    if (availabilityIndex !== -1) {
      experience.availability[availabilityIndex].bookedGuests -= guests;

      // Prevent negative value
      if (experience.availability[availabilityIndex].bookedGuests < 0) {
        experience.availability[availabilityIndex].bookedGuests = 0;
      }

      await experience.save();
    }

    // ✅ Notify user
    await bookingCancelledEmail(booking.user.email, {
      username: booking.user.username,
      title: experience.title,
      type: "experience",
      location: experience.location,
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

export const getAvailableExperienceSlots = async (req, res) => {
  try {
    const experienceId = req.params.id;
    const date = req.query.date;

    if (!date) {
      return res.status(400).json({ message: "Date query is required" });
    }

    const experience = await Experience.findById(experienceId);
    if (!experience) {
      return res.status(404).json({ message: "Experience not found" });
    }

    const slots = experience.slots;

    const slotAvailability = slots.map((slot) => {
      const matchingEntry = experience.availability.find(
        (entry) =>
          entry.date === date &&
          entry.slot.startTime === slot.startTime &&
          entry.slot.endTime === slot.endTime
      );

      const bookedGuests = matchingEntry?.bookedGuests || 0;

      return {
        time: `${slot.startTime} - ${slot.endTime}`,
        startTime: slot.startTime,
        endTime: slot.endTime,
        maxGuests: slot.maxGuests,
        bookedGuests,
      };
    });

    return res.status(200).json(slotAvailability);
  } catch (error) {
    console.error("Error fetching experience slots:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
