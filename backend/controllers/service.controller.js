import Service from "../models/service.js";
import Booking from "../models/booking.js";
import mongoose from "mongoose";
import Review from "../models/review.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { bookingCancelledEmail, sendBookingCancelEmail } from "../utils/sendEmail.js";

//user side...
export const getAllServices = async (req, res) => {
  try {
    const { place = "", date, guests = 1, type } = req.query;

    const searchTerm = place.toLowerCase();

    // 📦 Prepare base query (match location, state, or category)
    let query = {
      $or: [
        { state: { $regex: searchTerm, $options: "i" } },
        { location: { $regex: searchTerm, $options: "i" } },
        { category: { $regex: searchTerm, $options: "i" } },
      ],
    };

    // 📂 Filter by type (category) if passed
    if (type) {
      query.category = { $regex: type.toLowerCase(), $options: "i" };
    }

    // ✅ Get matched services
    const services = await Service.find(
      searchTerm === "all" ? {} : query
    );

    // ⏳ If no date, return basic list
    if (!date) {
      return res.status(200).json(services);
    }

    // 🔍 Filter by availability based on guest count
    const filteredServices = [];

    for (const service of services) {
      if (guests > service.maxGuests) continue;

      const existingBookings = await Booking.find({
        referenceId: service._id,
        type: "service",
        date: new Date(date),
      });

      const alreadyBookedGuests = existingBookings.reduce(
        (total, b) => total + b.guests,
        0
      );

      const availableCapacity = service.maxGuests - alreadyBookedGuests;

      if (availableCapacity >= guests) {
        filteredServices.push({
          ...service.toObject(),
          availableCapacity,
        });
      }
    }

    res.status(200).json(filteredServices);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch services",
      error: err.message,
    });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id).populate(
      "host",
      "username email profileImage"
    );

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.status(200).json(service);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch service detail",
      error: err.message,
    });
  }
};


export const filterServicesByLocationOrCategory = async (req, res) => {
  try {
    const { location, category, state } = req.query;

    // Build dynamic filter
    const filter = {};

    if (location) filter.location = new RegExp(location, "i");
    if (category) filter.category = new RegExp(category, "i");
    if (state) filter.state = new RegExp(state, "i");

    const services = await Service.find(filter).sort({ createdAt: -1 });

    res.status(200).json(services);
  } catch (err) {
    res.status(500).json({
      message: "Failed to filter services",
      error: err.message,
    });
  }
};


//HOST SIDE .....



//POST -> create service
export const createService = async (req, res) => {
  try {
    const {
      title,
      category,
      location,
      state,
      description,
      duration,
      pricePerHead,
      maxGuests,
      aboutHost,
      highlights,
    } = req.body;

    if (
      !title ||
      !category ||
      !location ||
      !state ||
      !description ||
      !duration ||
      !pricePerHead ||
      !maxGuests
    ) {
      return res
        .status(400)
        .json({ message: "Please fill all required fields" });
    }

    // ✅ Upload images to Cloudinary
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.path, "services")
      );
      const uploadedImages = await Promise.all(uploadPromises);
      imageUrls = uploadedImages.map((img) => img.secure_url);
    } else {
      return res
        .status(400)
        .json({ message: "At least one image is required" });
    }

    // ✅ Parse highlights as array
    const parsedHighlights = Array.isArray(highlights)
      ? highlights
      : highlights?.split(",").map((h) => h.trim());

    const newService = await Service.create({
      host: req.user._id,
      title,
      category,
      location,
      state,
      description,
      duration,
      pricePerHead: Number(pricePerHead),
      maxGuests: Number(maxGuests),
      images: imageUrls,
      aboutHost,
      highlights: parsedHighlights,
    });

    res.status(201).json({
      message: "Service created successfully",
      service: newService,
    });
  } catch (error) {
    console.error("CREATE SERVICE ERROR:", error);
    res.status(500).json({
      message: "Failed to create service",
      error: error.message,
    });
  }
};

//PUT ->service update...
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch service
    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    // 2. Authorization check
    if (service.host.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this service" });
    }

    // 3. Extract fields
    const {
      title,
      category,
      location,
      state,
      description,
      duration,
      pricePerHead,
      maxGuests,
      aboutHost,
      highlights,
    } = req.body;

    // 4. Update fields conditionally
    service.title = title || service.title;
    service.category = category || service.category;
    service.location = location || service.location;
    service.state = state || service.state;
    service.description = description || service.description;
    service.duration = duration || service.duration;
    service.pricePerHead = pricePerHead || service.pricePerHead;
    service.maxGuests = maxGuests || service.maxGuests;
    service.aboutHost = aboutHost || service.aboutHost;
    service.highlights = highlights || service.highlights;

    // 6. Optional image upload
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.path, "services")
      );
      const uploadedImages = await Promise.all(uploadPromises);
      service.images = uploadedImages.map((img) => img.secure_url);
    }

    // 7. Save and respond
    await service.save();

    res.status(200).json({
      message: "Service updated successfully",
      service,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update service",
      error: error.message,
    });
  }
};

//GET ->all services
export const getHostServices = async (req, res) => {
  try {
    const services = await Service.find({ host: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      message: "Services fetched successfully.",
      total: services.length,
      services,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch your services",
      error: error.message,
    });
  }
};

export const getServiceDashboardStats = async (req, res) => {
  try {
    const hostId = req.user._id;

    // 1. Total Listings
    const totalListings = await Service.countDocuments({ host: hostId });

    // 2. All service IDs
    const serviceIds = (await Service.find({ host: hostId }).select("_id")).map(
      (s) => s._id
    );

    // 3. Total Bookings
    const totalBookings = await Booking.countDocuments({
      type: "service",
      referenceId: { $in: serviceIds },
      status: "confirmed",
    });

    // 4. Total Earnings
    const allBookings = await Booking.find({
      type: "service",
      referenceId: { $in: serviceIds },
      status: "confirmed",
    }).select("totalPrice");

    const totalEarnings = allBookings.reduce(
      (acc, booking) => acc + booking.totalPrice,
      0
    );

    // 5. Average Rating
    const reviews = await Review.find({
      type: "service",
      referenceId: { $in: serviceIds },
    }).select("rating");

    const ratingTotal = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating =
      reviews.length > 0 ? (ratingTotal / reviews.length).toFixed(1) : 0;

    res.status(200).json({
      message: "Service dashboard stats fetched successfully",
      stats: {
        totalListings,
        totalBookings,
        totalEarnings,
        averageRating,
      },
    });
  } catch (error) {
    console.error("Service Dashboard Stats Error:", error.message);
    res
      .status(500)
      .json({ message: "Server error while loading service stats." });
  }
};

//Get -> Single Services
export const getSingleService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate(
      "host",
      "username email profileImage"
    );

    if (!service) {
      return res.status(404).json({ message: "Service not found." });
    }

    res.status(200).json({
      message: "Service fetched successfully.",
      data: service,
    });
  } catch (error) {
    console.error("Get Single Service Error:", error.message);
    res.status(500).json({ message: "Server error while fetching service." });
  }
};

//DELETE -> delete service
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (service.host.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this service" });
    }

    await service.deleteOne();

    res.status(200).json({
      message: "Service deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete service",
      error: error.message,
    });
  }
};

//GET -> service data show...
export const getServiceBookingsWithEarnings = async (req, res) => {
  try {
    const { id } = req.params;
    const { range } = req.query; // '1d', '7d', '30d', etc.
    const hostId = req.user._id;

    const service = await Service.findById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    if (service.host.toString() !== hostId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this service's bookings" });
    }

    // Define time range
    let fromDate = new Date(0);
    if (range) {
      const days = parseInt(range.replace("d", ""));
      fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    }

    const bookings = await Booking.find({
      referenceId: id,
      type: "service",
      createdAt: { $gte: fromDate },
    }).populate("user", "username email");

    const totalEarnings = bookings.reduce((acc, booking) => {
      return booking.status === "confirmed" ? acc + booking.totalPrice : acc;
    }, 0);

    res.status(200).json({
      totalBookings: bookings.length,
      totalEarnings,
      bookings,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch bookings or earnings",
      error: error.message,
    });
  }
};

export const getServiceReviews = async (req, res) => {
  try {
    const hostServices = await Service.find({ host: req.user._id }).select(
      "_id"
    );
    const serviceIds = hostServices.map((s) => s._id);

    const reviews = await Review.find({
      referenceId: { $in: serviceIds },
      type: "services",
    })
      .populate("user", "username email profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Service reviews fetched successfully",
      data: reviews,
    });
  } catch (error) {
    console.error("Get Service Reviews Error:", error.message);
    res.status(500).json({ message: "Server error while fetching reviews" });
  }
};


export const cancelServiceBookingByHost = async (req, res) => {
  try {
    const { reason = "" } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate("user", "email username")
      .populate({
        path: "referenceId",
        model: "Service", 
      });

    if (!booking || booking.type !== "service") {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (!booking.referenceId) {
      return res
        .status(400)
        .json({ message: "Service reference not found in booking." });
    }

    if (booking.referenceId.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized action." });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled." });
    }

    const bookingDate = new Date(booking.dateTime);
    const now = new Date();
    const diffInHours = (bookingDate - now) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return res.status(400).json({
        message: "Cannot cancel booking less than 24 hours in advance.",
      });
    }

    // Cancel booking
    booking.status = "cancelled";
    booking.cancelReason = reason;
    await booking.save();

    // Razorpay refund
    if (booking.razorpayPaymentId) {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
      });

      await razorpay.payments.refund(booking.razorpayPaymentId, {
        amount: booking.totalPrice * 100,
      });
    }

    // Email notification
    await bookingCancelledEmail(booking.user.email, {
      username: booking.user.username,
      title: booking.referenceId.title,
      type: "service",
      location: booking.referenceId.location,
      dateTime: booking.dateTime,
      guests: booking.guests,
      totalPrice: booking.totalPrice,
      reason,
    });

    res.status(200).json({
      message: "Booking cancelled and user notified successfully.",
    });
  } catch (error) {
    console.error("Cancel Service Booking Error:", error.message);
    res.status(500).json({ message: "Server error during cancellation." });
  }
};

export const getServiceBookingsAndEarnings = async (req, res) => {
  try {
    const hostId = req.user._id;
    const { range = "30d" } = req.query;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const filterDate = new Date();
    if (range === "today") filterDate.setDate(now.getDate());
    else if (range === "7d") filterDate.setDate(now.getDate() - 7);
    else filterDate.setDate(now.getDate() - 30);

    // 1. Get all services of this host
    const serviceIds = (await Service.find({ host: hostId }).select("_id")).map(
      (s) => s._id
    );

    // 2. Get all confirmed bookings for these services
    const allBookings = await Booking.find({
      referenceId: { $in: serviceIds },
      type: "service",
      status: "confirmed",
      createdAt: { $gte: filterDate },
    })
      .populate("user", "username email")
      .sort({ createdAt: -1 });

    // 3. Calculate total earnings
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
    console.error("Service Bookings Error:", error.message);
    res
      .status(500)
      .json({ message: "Server error while fetching service bookings." });
  }
};

export const getServiceBookings = async (req, res) => {
  try {
    const services = await Service.find({ host: req.user._id }).select("_id");
    const serviceIds = services.map((s) => s._id);

    const bookings = await Booking.find({
      service: { $in: serviceIds },
      paymentStatus: "paid",
    })
      .populate("user", "username email")
      .populate("service", "title");

    res.status(200).json({
      message: "Service bookings fetched successfully",
      data: bookings,
    });
  } catch (error) {
    console.error("Service Bookings Error:", error.message);
    res.status(500).json({ message: "Error fetching service bookings." });
  }
};
