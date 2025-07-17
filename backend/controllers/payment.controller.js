import dotenv from "dotenv";
dotenv.config();

import Razorpay from "razorpay";
import crypto from "crypto";
import dayjs from "dayjs";
import Booking from "../models/booking.js";
import Hotel from "../models/hotel.js";
import Service from "../models/service.js";
import Experience from "../models/experience.js";
import { sendBookingConfirmationEmail } from "../utils/sendEmail.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

//create payment booking
export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create order", error: err.message });
  }
};


export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingDetails,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ message: "Missing Razorpay payment fields" });
    }

    if (!bookingDetails) {
      return res.status(400).json({ message: "Missing booking details" });
    }

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    const {
      type,
      referenceId,
      checkIn,
      checkOut,
      date,
      time,
      guests,
      rooms,
      userId,
      userEmail,
      totalPrice: frontendTotalPrice,
    } = bookingDetails;

    let itemTitle = "";
    let location = "";
    const totalPrice = frontendTotalPrice;

    // ====================== ✅ HOTEL LOGIC =======================
    if (type === "hotel") {
      const hotel = await Hotel.findById(referenceId);
      if (!hotel) return res.status(404).json({ message: "Hotel not found" });

      if (!Array.isArray(hotel.availability)) {
        hotel.availability = [];
      }

      const nights = dayjs(checkOut).diff(dayjs(checkIn), "day");
      if (nights <= 0) {
        return res
          .status(400)
          .json({ message: "Invalid check-in/check-out range" });
      }

      // ✅ Step 1: Check availability for each date
      for (let i = 0; i < nights; i++) {
        const date = dayjs(checkIn).add(i, "day").format("YYYY-MM-DD");
        const existing = hotel.availability.find((d) => d.date === date);
        const alreadyBooked = existing ? existing.bookedRooms : 0;

        if (alreadyBooked + parseInt(rooms) > hotel.availableRooms) {
          return res.status(400).json({
            message: `Not enough rooms available on ${date}`,
          });
        }
      }

      // ✅ Step 2: Update availability in Hotel model
      const updatedAvailability = [];

      for (let i = 0; i < nights; i++) {
        const date = dayjs(checkIn).add(i, "day").format("YYYY-MM-DD");
        const index = hotel.availability.findIndex((d) => d.date === date);

        if (index >= 0) {
          hotel.availability[index].bookedRooms += parseInt(rooms);
        } else {
          hotel.availability.push({ date, bookedRooms: parseInt(rooms) });
        }

        // Store date-wise booking info for Booking model
        updatedAvailability.push({ date, bookedRooms: parseInt(rooms) });
      }

      await hotel.save();

      itemTitle = hotel.title;
      location = `${hotel.area}, ${hotel.state}`;

      // ✅ Create booking payload for DB
      var bookingPayload = {
        user: userId,
        referenceId,
        type,
        guests,
        totalPrice,
        status: "confirmed",
        checkIn,
        checkOut,
        rooms,
        availability: updatedAvailability,
      };
    }

    // ====================== ✅ SERVICE LOGIC =======================
    else if (type === "service") {
      const service = await Service.findById(referenceId);
      if (!service)
        return res.status(404).json({ message: "Service not found" });

      itemTitle = service.title;
      location = `${service.location}, ${service.state}`;

      if (!date || !time) {
        return res
          .status(400)
          .json({ message: "Missing booking date or time" });
      }

   

      // ✅ Extract startTime from full time range
      const startTime = time.split(" - ")[0];
      const combinedDateTime = new Date(`${date}T${startTime}`);

      // ✅ Step 1: Find selected slot
      const selectedSlot = service.slots.find(
        (slot) =>
          slot.startTime.trim().slice(0, 5) === startTime.trim().slice(0, 5)
      );


      if (!selectedSlot) {
        return res.status(400).json({ message: "Selected slot not found" });
      }

      // ✅ Step 2: Get all bookings for same slot & date
      const existingBookings = await Booking.find({
        type: "service",
        referenceId,
        status: "confirmed",
        date: date,
        "slotBooking.startTime": selectedSlot.startTime,
        "slotBooking.endTime": selectedSlot.endTime,
      });

      const totalBookedGuests = existingBookings.reduce(
        (sum, b) => sum + b.guests,
        0
      );

      const requestedGuests = parseInt(guests);
      if (totalBookedGuests + requestedGuests > selectedSlot.maxGuests) {
        return res.status(400).json({
          message: `Slot ${time} is fully booked for ${date}`,
        });
      }

      // ✅ Step 3: Save slot info in booking
      var bookingPayload = {
        user: userId,
        referenceId,
        type,
        guests: requestedGuests,
        totalPrice,
        status: "confirmed",
        date,
        dateTime: combinedDateTime,
        slotBooking: {
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          maxGuests: selectedSlot.maxGuests,
        },
      };
    }

    // ====================== ✅ EXPERIENCE LOGIC =======================
    else if (type === "experience") {
      const experience = await Experience.findById(referenceId);
      if (!experience)
        return res.status(404).json({ message: "Experience not found" });

      itemTitle = experience.title;
      location = `${experience.location}, ${experience.state}`;

      if (!date || !time) {
        return res
          .status(400)
          .json({ message: "Missing booking date or time" });
      }


      const startTime = time.split(" - ")[0];
      const combinedDateTime = new Date(`${date}T${startTime}`);

      const selectedSlot = experience.slots.find(
        (slot) =>
          slot.startTime.trim().slice(0, 5) === startTime.trim().slice(0, 5)
      );

      if (!selectedSlot) {
        return res.status(400).json({ message: "Selected slot not found" });
      }

      const requestedGuests = parseInt(guests);

      // ✅ Step 2: Get current availability from DB
      if (!Array.isArray(experience.availability)) {
        experience.availability = [];
      }

      const index = experience.availability.findIndex(
        (entry) =>
          entry.date === date &&
          entry.slot.startTime === selectedSlot.startTime &&
          entry.slot.endTime === selectedSlot.endTime
      );

      const currentlyBooked =
        index !== -1 ? experience.availability[index].bookedGuests : 0;

      if (currentlyBooked + requestedGuests > selectedSlot.maxGuests) {
        return res.status(400).json({
          message: `Slot ${time} on ${date} is fully booked`,
        });
      }

      // ✅ Step 3: Update experience availability
      if (index !== -1) {
        experience.availability[index].bookedGuests += requestedGuests;
      } else {
        experience.availability.push({
          date,
          slot: {
            startTime: selectedSlot.startTime,
            endTime: selectedSlot.endTime,
          },
          bookedGuests: requestedGuests,
        });
      }

      await experience.save();

      // ✅ Step 4: Prepare Booking Payload
      var bookingPayload = {
        user: userId,
        referenceId,
        type,
        guests: requestedGuests,
        totalPrice,
        status: "confirmed",
        date,
        dateTime: combinedDateTime,
        slotBooking: {
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          maxGuests: selectedSlot.maxGuests,
        },
      };
    }

    // ====================== SAVE BOOKING =======================
    const savedBooking = await Booking.create(bookingPayload);

    // ✅ Send Confirmation Email
    if (userEmail) {
      const emailData = {
        title: itemTitle,
        location,
        guests,
        totalPrice,
        type,
      };

      if (type === "hotel") {
        emailData.checkIn = checkIn;
        emailData.checkOut = checkOut;
        emailData.rooms = rooms;
      } else {
        emailData.dateTime = bookingPayload.dateTime;
      }

      await sendBookingConfirmationEmail(userEmail, emailData);
    }

    res.status(200).json({
      message: "Booking confirmed & saved",
      booking: savedBooking,
    });
  } catch (err) {
    console.error("VERIFY PAYMENT ERROR:", err);
    res.status(500).json({
      message: "Payment verification failed",
      error: err.message,
    });
  }
};
