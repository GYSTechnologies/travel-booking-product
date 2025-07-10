import Booking from "../models/booking.js";
import Hotel from "../models/hotel.js";

const checkBookingConflict = async (req, res, next) => {
  try {
    const { hotelId, checkIn, checkOut, rooms } = req.body;

    if (!hotelId || !checkIn || !checkOut || !rooms) {
      return res.status(400).json({ message: "Missing booking details" });
    }

    // Get hotel info
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    // Get all bookings for this hotel in the selected date range
    const overlappingBookings = await Booking.find({
      referenceId: hotelId,
      type: "hotel",
      $or: [
        {
          checkIn: { $lt: new Date(checkOut) },
          checkOut: { $gt: new Date(checkIn) }
        }
      ]
    });

    // Sum up already booked rooms
    const alreadyBookedRooms = overlappingBookings.reduce(
      (total, b) => total + b.rooms,
      0
    );

    const availableRooms = hotel.availableRooms - alreadyBookedRooms;

    if (availableRooms < rooms) {
      return res.status(409).json({
        message: `Only ${availableRooms} rooms are available between selected dates`,
      });
    }

    // Pass control if no conflict
    next();
  } catch (err) {
    res.status(500).json({ message: "Booking conflict check failed", error: err.message });
  }
};

export default checkBookingConflict;
