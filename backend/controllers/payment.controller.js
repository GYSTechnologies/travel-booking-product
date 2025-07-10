import dotenv from 'dotenv';
dotenv.config();

import Razorpay from "razorpay";
import crypto from "crypto";
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
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
};


//verify booking and save the data in backend...
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingDetails,
    } = req.body;

    // : Validate Razorpay fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing Razorpay payment fields" });
    }

    if (!bookingDetails) {
      return res.status(400).json({ message: "Missing booking details" });
    }

    //Verify Razorpay Signature
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }

    //  Extract Booking Data
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

    // Hotel Booking
    if (type === "hotel") {
      const hotel = await Hotel.findById(referenceId);
      if (!hotel) return res.status(404).json({ message: "Hotel not found" });

      itemTitle = hotel.title;
      location = `${hotel.area}, ${hotel.state}`;
    }

    // Service Booking
    else if (type === "service") {
      const service = await Service.findById(referenceId);
      if (!service) return res.status(404).json({ message: "Service not found" });

      itemTitle = service.title;
      location = `${service.location}, ${service.state}`;
    }

    // Experience Booking
    else if (type === "experience") {
      const experience = await Experience.findById(referenceId);
      if (!experience) return res.status(404).json({ message: "Experience not found" });

      itemTitle = experience.title;
      location = `${experience.area}, ${experience.state}`;
    }

    else {
      return res.status(400).json({ message: "Invalid booking type" });
    }

    //  Save Booking in DB
    const bookingPayload = {
      user: userId,
      referenceId,
      type,
      guests,
      totalPrice,
      status: "confirmed",
    };

    if (type === "hotel") {
      bookingPayload.checkIn = checkIn;
      bookingPayload.checkOut = checkOut;
      bookingPayload.rooms = rooms;
    } else {
      if (!date) {
        return res.status(400).json({ message: "Missing booking date" });
      }

      const combinedDateTime = new Date(`${date}T${time || "12:00"}`);
      bookingPayload.dateTime = combinedDateTime;
    }

    const savedBooking = await Booking.create(bookingPayload);

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
        emailData.dateTime = new Date(`${date}T${time || "12:00"}`);
      }

      await sendBookingConfirmationEmail(userEmail, emailData);
    }

  
    res.status(200).json({
      message: "Booking confirmed & saved",
      booking: savedBooking,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Payment verification failed",
      error: err.message,
    });
  }
};

