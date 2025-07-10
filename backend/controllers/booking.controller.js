import Booking from "../models/booking.js";
import Hotel from "../models/hotel.js";
import Service from "../models/service.js";
import { sendBookingConfirmationEmail } from "../utils/sendEmail.js";


export const createBooking = async (req, res) => {
  try {
    const { hotelId, checkIn, checkOut, guests, rooms, totalPrice } = req.body;

    if (!hotelId || !checkIn || !checkOut || !guests || !rooms || !totalPrice) {
      return res.status(400).json({ message: "Missing booking details" });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    const newBooking = await Booking.create({
      user: req.user._id,
      type: "hotel",
      referenceId: hotelId,
      checkIn,
      checkOut,
      guests,
      rooms,
      totalPrice,
      status: "confirmed",
    });

    res.status(201).json({
      message: "Booking successful",
      booking: newBooking,
    });
  } catch (err) {
    res.status(500).json({ message: "Booking failed", error: err.message });
  }
};




export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate({
        path: "referenceId",
        select: "title location area state images pricePerNight pricePerHead",
        strictPopulate: false,
      })
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to get bookings", error: err.message });
  }
};

