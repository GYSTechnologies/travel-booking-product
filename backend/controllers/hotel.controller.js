import Hotel from "../models/hotel.js";
import Booking from "../models/booking.js";
import Review from "../models/review.js";
import User from "../models/user.js";
import Razorpay from "razorpay";
import dayjs from "dayjs";

import {
  bookingCancelledEmail,
  EarningsReportEmail,
} from "../utils/sendEmail.js";

import { uploadToCloudinary } from "../utils/cloudinary.js";
import { releaseHotelRooms } from "../utils/bookingCancel.js";

//user side only

export const getAllHotels = async (req, res) => {
  try {
    const { place, checkIn, checkOut, guests = 1 } = req.query;

    const hotelQuery = {
      status: "approved", // ✅ show only approved hotels
    };

    if (place && place.toLowerCase() !== "all") {
      hotelQuery.$or = [
        { state: { $regex: place, $options: "i" } },
        { area: { $regex: place, $options: "i" } },
        { location: { $regex: place, $options: "i" } },
      ];
    }

    const hotels = await Hotel.find(hotelQuery);

    // If no dates given, just return hotels directly
    if (!checkIn || !checkOut) {
      return res.status(200).json(hotels);
    }

    const filteredHotels = [];

    for (const hotel of hotels) {
      const overlappingBookings = await Booking.find({
        referenceId: hotel._id,
        type: "hotel",
        $or: [
          {
            checkIn: { $lt: new Date(checkOut) },
            checkOut: { $gt: new Date(checkIn) },
          },
        ],
      });

      const alreadyBookedRooms = overlappingBookings.reduce(
        (total, b) => total + b.rooms,
        0
      );

      const availableRooms = hotel.availableRooms - alreadyBookedRooms;

      if (availableRooms > 0) {
        filteredHotels.push({ ...hotel.toObject(), availableRooms });
      }
    }

    res.status(200).json(filteredHotels);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch hotels", error: err.message });
  }
};


export const getHotelById = async (req, res) => {
  try {
    const { id } = req.params;
    const { checkIn, checkOut } = req.query;

    const hotel = await Hotel.findById(id).populate(
      "host",
      "username email profileImage"
    );

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    // 🟡 No date range provided — return as-is
    if (!checkIn || !checkOut) {
      return res.status(200).json({
        ...hotel.toObject(),
        availableRooms: hotel.availableRooms,
        notice: "No check-in/check-out provided, showing total available rooms",
      });
    }

    const nights = dayjs(checkOut).diff(dayjs(checkIn), "day");
    let maxBookedRooms = 0;

    const hotelAvailability = hotel.availability || []; // ✅ fallback

    for (let i = 0; i < nights; i++) {
      const date = dayjs(checkIn).add(i, "day").format("YYYY-MM-DD");
      const availabilityRecord = hotelAvailability.find((d) => d.date === date);
      if (availabilityRecord) {
        maxBookedRooms = Math.max(
          maxBookedRooms,
          availabilityRecord.bookedRooms
        );
      }
    }

    const availableRooms = hotel.availableRooms - maxBookedRooms;

    res.status(200).json({
      ...hotel.toObject(),
      availableRooms,
      message:
        availableRooms > 0
          ? `${availableRooms} rooms available`
          : "No rooms available for selected dates",
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch hotel detail", error: err.message });
  }
};

//host side

export const createHotel = async (req, res) => {
  const {
    title,
    description,
    state,
    area,
    location,
    pricePerNight,
    availableRooms,
    amenities,
    documentTypes, // 👈 from frontend (["gst", "license", ...])
  } = req.body;

  try {
    // ✅ Upload hotel images
    // ✅ Upload hotel images
    let imageUrls = [];
    const imageFiles = req.files?.images || [];

    if (imageFiles.length > 0) {
      const uploadPromises = imageFiles.map((file) =>
        uploadToCloudinary(file.path, "hotels")
      );
      const imageResults = await Promise.all(uploadPromises);
      imageUrls = imageResults.map((img) => img.secure_url);
    }

    // ✅ Upload documents
    let uploadedDocs = [];
    const docFiles = req.files?.documents || [];

    if (docFiles.length > 0) {
      for (let i = 0; i < docFiles.length; i++) {
        const file = docFiles[i];
        const cloudRes = await uploadToCloudinary(file.path, "hotel_docs");
        uploadedDocs.push({
          docType: documentTypes[i] || "other",
          url: cloudRes.secure_url,
          status: "pending",
          rejectionReason: "",
        });
      }
    }

    // ✅ Create hotel
    const newHotel = new Hotel({
      host: req.user._id,
      title,
      description,
      state,
      area,
      location,
      pricePerNight: Number(pricePerNight),
      availableRooms: Number(availableRooms),
      amenities: amenities ? amenities.split(",") : [],
      images: imageUrls,

      // 🔐 Admin approval logic
      status: "pending",
      rejectionReason: "",
      documents: uploadedDocs,
    });

    await newHotel.save();

    res.status(201).json({
      message: "Hotel created successfully (awaiting admin approval)",
      hotel: newHotel,
    });
  } catch (error) {
    console.error("CREATE HOTEL ERROR:", error);
    res
      .status(500)
      .json({ message: "Hotel creation failed", error: error.message });
  }
};

//hotel update
export const updateHotel = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    state,
    area,
    location,
    pricePerNight,
    availableRooms,
    amenities,
    documentTypes,
    existingImages,
  } = req.body;

  try {
    const hotel = await Hotel.findById(id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    if (hotel.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    // ✅ 1. Handle Hotel Images (retain + new uploads)
    let finalImages = [];

    // Existing image URLs from frontend
    if (existingImages) {
      if (typeof existingImages === "string") {
        finalImages = [existingImages];
      } else {
        finalImages = [...existingImages];
      }
    }

    // New image uploads from "images" field
    const imageFiles = req.files?.images || [];
    if (imageFiles.length > 0) {
      const uploadPromises = imageFiles.map((file) =>
        uploadToCloudinary(file.path, "hotels")
      );
      const uploaded = await Promise.all(uploadPromises);
      const newImageUrls = uploaded.map((img) => img.secure_url);
      finalImages = [...finalImages, ...newImageUrls];
    }

    hotel.images = finalImages;

    // ✅ 2. Update basic hotel fields
    hotel.title = title || hotel.title;
    hotel.description = description || hotel.description;
    hotel.state = state || hotel.state;
    hotel.area = area || hotel.area;
    hotel.location = location || hotel.location;
    hotel.pricePerNight = pricePerNight || hotel.pricePerNight;
    hotel.availableRooms = availableRooms || hotel.availableRooms;
    hotel.amenities = amenities ? amenities.split(",") : hotel.amenities;

    // ✅ 3. Update documents if provided
    if (documentTypes) {
      const docTypes = Array.isArray(documentTypes)
        ? documentTypes
        : [documentTypes];

      const allDocFiles = Object.values(req.files || {})
        .flat()
        .filter((f) => f.fieldname.startsWith("docFile"));

      for (let i = 0; i < allDocFiles.length; i++) {
        const docFile = allDocFiles[i];
        const docType = docTypes[i] || "other";

        const cloudRes = await uploadToCloudinary(docFile.path, "hotel_docs");

        const existingDocIndex = hotel.documents.findIndex(
          (doc) => doc.docType === docType
        );

        if (existingDocIndex !== -1) {
          // Replace only if not approved
          if (hotel.documents[existingDocIndex].status !== "approved") {
            hotel.documents[existingDocIndex].url = cloudRes.secure_url;
            hotel.documents[existingDocIndex].status = "pending";
            hotel.documents[existingDocIndex].rejectionReason = "";
          }
        } else {
          hotel.documents.push({
            docType,
            url: cloudRes.secure_url,
            status: "pending",
            rejectionReason: "",
          });
        }
      }
    }

    await hotel.save();
    res.status(200).json({ message: "Hotel updated successfully", hotel });
  } catch (error) {
    console.error("Update Hotel Error:", error);
    res
      .status(500)
      .json({ message: "Failed to update hotel", error: error.message });
  }
};

export const getHostHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ host: req.user._id });
    res.status(200).json({
      message: "Hotels fetched successfully",
      count: hotels.length,
      hotels,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch host hotels", error: error.message });
  }
};

//get single hotel
export const getSingleHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found." });
    }

    // Ensure the logged-in user is the owner
    if (hotel.host.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized access to this hotel." });
    }

    res.status(200).json({
      message: "Hotel fetched successfully",
      hotel,
    });
  } catch (error) {
    console.error("Get Single Hotel Error:", error.message);
    res.status(500).json({ message: "Server error while fetching hotel." });
  }
};

//delete hotel
export const deleteHotel = async (req, res) => {
  const { id } = req.params;

  try {
    const hotel = await Hotel.findById(id);

    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    if (hotel.host.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized access" });

    await hotel.deleteOne();
    res.status(200).json({ message: "Hotel deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete hotel", error: error.message });
  }
};

//hotel-dashboard
export const getHotelDashboardStats = async (req, res) => {
  try {
    const hostId = req.user._id;

    //  Total Listings
    const totalListings = await Hotel.countDocuments({ host: hostId });

    // All hotels by this host
    const hotelIds = (await Hotel.find({ host: hostId }).select("_id")).map(
      (h) => h._id
    );

    // Total Bookings (confirmed only - since no paymentStatus in schema)
    const totalBookings = await Booking.countDocuments({
      referenceId: { $in: hotelIds },
      type: "hotel",
      status: "confirmed",
    });

    // Total Earnings
    const allBookings = await Booking.find({
      referenceId: { $in: hotelIds },
      type: "hotel",
      status: "confirmed",
    }).select("totalPrice");

    const totalEarnings = allBookings.reduce(
      (acc, booking) => acc + booking.totalPrice,
      0
    );

    // Average Rating
    const reviews = await Review.find({ hotel: { $in: hotelIds } }).select(
      "rating"
    );
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
    console.error("Hotel Dashboard Stats Error:", error.message);
    res.status(500).json({ message: "Server error while loading stats." });
  }
};

//booking and earn controller
export const getHotelBookingsAndEarnings = async (req, res) => {
  try {
    const hostId = req.user._id;
    const { range = "30d" } = req.query;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const filterDate = new Date();
    if (range === "today") filterDate.setDate(now.getDate());
    else if (range === "7d") filterDate.setDate(now.getDate() - 7);
    else filterDate.setDate(now.getDate() - 30);

    const hotelIds = (await Hotel.find({ host: hostId }).select("_id")).map(
      (h) => h._id
    );

    const allBookings = await Booking.find({
      referenceId: { $in: hotelIds },
      type: "hotel",
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
    console.error("Hotel Bookings/Earnings Error:", error.message);
    res.status(500).json({ message: "Server error while fetching earnings." });
  }
};

//review
export const getHotelReviews = async (req, res) => {
  try {
    // Get all hotel IDs owned by this host
    const hostHotels = await Hotel.find({ host: req.user._id }).select("_id");
    const hotelIds = hostHotels.map((h) => h._id);

    // Fetch all reviews related to those hotels
    const reviews = await Review.find({ hotel: { $in: hotelIds } })
      .populate("user", "username profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Reviews fetched successfully",
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Hotel Reviews Error:", error.message);
    res.status(500).json({ message: "Server error while fetching reviews." });
  }
};

//cancel booking- hotel
export const cancelHotelBookingByHost = async (req, res) => {
  try {
    const { reason = "" } = req.body;

    const booking = await Booking.findById(req.params.id)
      .populate("user", "email username")
      .populate({
        path: "referenceId",
        model: "Hotel",
      });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found." });
    }

    if (!booking.referenceId) {
      return res
        .status(400)
        .json({ message: "Hotel reference not found in booking." });
    }

    // 👇 Check host
    if (booking.referenceId.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized action." });
    }
    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking already cancelled." });
    }

    // Only allow if more than 1 day before check-in
    const today = new Date();
    const checkIn = new Date(booking.checkIn);
    const diffInDays = (checkIn - today) / (1000 * 60 * 60 * 24);

    if (diffInDays < 1) {
      return res.status(400).json({
        message: "Cannot cancel booking less than 1 day before check-in.",
      });
    }

    // Cancel and refund
    booking.status = "cancelled";
    await booking.save();

    // Refund via Razorpay
    if (booking.razorpayPaymentId) {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_SECRET,
      });

      await razorpay.payments.refund(booking.razorpayPaymentId, {
        amount: booking.totalPrice * 100,
      });
    }
    // Release hotel availability
    await releaseHotelRooms(
      booking.referenceId._id,
      booking.checkIn,
      booking.checkOut,
      booking.rooms
    );

    // Send cancellation email
    await bookingCancelledEmail(booking.user.email, {
      username: booking.user.username,
      title: booking.referenceId.title,
      type: "hotel",
      location: booking.referenceId.location,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      guests: booking.guests,
      rooms: booking.rooms,
      totalPrice: booking.totalPrice,
      reason,
    });

    res.status(200).json({
      message: "Booking cancelled and user notified successfully.",
    });
  } catch (error) {
    console.error("Cancel Booking Error:", error.message);
    res.status(500).json({ message: "Server error during cancellation." });
  }
};

//hotel 
export const getHotelAvailability = async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut } = req.query;

  try {
    const hotel = await Hotel.findById(id);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    const bookings = await Booking.find({
      type: "hotel",
      referenceId: id,
      $or: [{ checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }],
    });

    let totalBookedRooms = 0;
    bookings.forEach((b) => {
      totalBookedRooms += b.rooms;
    });

    const availableRooms = Math.max(hotel.availableRooms - totalBookedRooms, 0);

    res.status(200).json({ availableRooms });
  } catch (err) {
    res.status(500).json({ message: "Failed to check availability" });
  }
};
