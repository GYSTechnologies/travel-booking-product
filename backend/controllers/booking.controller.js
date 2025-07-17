import Booking from "../models/booking.js";
import Hotel from "../models/hotel.js";
import Service from "../models/service.js";
import dayjs from "dayjs";


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


export const checkHotelAvailability = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { checkIn, checkOut, rooms = 1 } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ message: "Check-in and check-out dates are required." });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    const nights = dayjs(checkOut).diff(dayjs(checkIn), "day");
    if (nights <= 0) {
      return res.status(400).json({ message: "Invalid date range" });
    }

    let isAvailable = true;

    for (let i = 0; i < nights; i++) {
      const date = dayjs(checkIn).add(i, "day").format("YYYY-MM-DD");

      const dayBooking = hotel.availability.find(d => d.date === date);
      const booked = dayBooking ? dayBooking.bookedRooms : 0;

      if (booked + parseInt(rooms) > hotel.availableRooms) {
        isAvailable = false;
        break;
      }
    }

    if (!isAvailable) {
      return res.status(200).json({ available: false, message: "Not enough rooms available for selected dates." });
    }

    return res.status(200).json({ available: true, message: "Rooms available" });
  } catch (err) {
    res.status(500).json({ message: "Failed to check availability", error: err.message });
  }
};
