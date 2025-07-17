import dayjs from "dayjs";
import Hotel from "../models/hotel.js";

export const releaseHotelRooms = async (hotelId, checkIn, checkOut, rooms) => {
  const hotel = await Hotel.findById(hotelId);
  if (!hotel || !hotel.availability) return;

  const nights = dayjs(checkOut).diff(dayjs(checkIn), "day");

  for (let i = 0; i < nights; i++) {
    const date = dayjs(checkIn).add(i, "day").format("YYYY-MM-DD");
    const index = hotel.availability.findIndex((d) => d.date === date);

    if (index >= 0) {
      hotel.availability[index].bookedRooms -= rooms;

      if (hotel.availability[index].bookedRooms <= 0) {
        hotel.availability.splice(index, 1); // remove if 0 or negative
      }
    }
  }

  await hotel.save();
};
