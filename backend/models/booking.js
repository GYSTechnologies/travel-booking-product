
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["hotel", "service", "experience"],
      required: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "type",
    },

    // HOTEL-specific fields
    checkIn: Date,
    checkOut: Date,
    rooms: Number,
    availability: [
      {
        date: {
          type: String, // "YYYY-MM-DD"
          required: true,
        },
        bookedRooms: {
          type: Number,
          default: 0,
        },
      },
    ],

    // SERVICE & EXPERIENCE shared
    date: String, // e.g. "2025-07-21"
    dateTime: Date,
    guests: {
      type: Number,
      default: 1,
    },

    // ✅ Keep the existing field name to avoid breaking changes
    slotBooking: {
      startTime: String,     // e.g., "11:00"
      endTime: String,       // e.g., "14:00"
      maxGuests: Number,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;
