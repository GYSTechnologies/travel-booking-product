import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "react-datepicker/dist/react-datepicker.css";
import { fetchHotelById, fetchHotelAvailability } from "../api/allAPIs";

import {
  Star,
  MapPin,
  Users,
  Calendar,
  Shield,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Waves,
} from "lucide-react";

import { useAuth } from "../contexts/AuthContext";

const HotelDetail = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { token, setBookingData } = useAuth();

  const [hotel, setHotel] = useState(null);
  const [formData, setFormData] = useState({
    checkIn: params.get("checkIn") || "",
    checkOut: params.get("checkOut") || "",
    rooms: 1,
    guests: params.get("guests") || 1,
  });

  const hasEnoughRooms = hotel?.availableRooms >= formData.rooms;
  const isFullyBooked = hotel?.availableRooms === 0;

  const isFormComplete =
    formData.checkIn && formData.checkOut && formData.rooms && formData.guests;

  // ✅ Check if check-in is before check-out
  const isValidDateRange =
    new Date(formData.checkIn) < new Date(formData.checkOut);

  // ✅ Final flag to control Reserve button
  const isBookingAllowed = isFormComplete && isValidDateRange;

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Get tomorrow's date in YYYY-MM-DD format
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const data = await fetchHotelById(
          id,
          formData.checkIn,
          formData.checkOut
        );
        setHotel(data);
      } catch (err) {
        console.error("Failed to fetch hotel:", err);
      }
    };
    fetchHotel();
  }, [id]);

  // useEffect(() => {
  //   const fetchAvailability = async () => {
  //     if (!formData.checkIn || !formData.checkOut) return;

  //     try {
  //       const res = await axiosInstance.get(
  //         `/host/${id}/availability`,
  //         { params: { checkIn: formData.checkIn, checkOut: formData.checkOut } }
  //       );
  //       setHotel((prev) => ({
  //         ...prev,
  //         availableRooms: res.data.availableRooms,
  //       }));
  //     } catch (err) {
  //       console.error("Failed to fetch availability:", err);
  //     }
  //   };

  //   fetchAvailability();
  // }, [formData.checkIn, formData.checkOut]);
 
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!formData.checkIn || !formData.checkOut) return;

      try {
        const data = await fetchHotelAvailability(
          id,
          formData.checkIn,
          formData.checkOut
        );
        setHotel((prev) => ({
          ...prev,
          availableRooms: data.availableRooms,
        }));
      } catch (err) {
        console.error("Failed to fetch availability:", err);
      }
    };

    fetchAvailability();
  }, [formData.checkIn, formData.checkOut]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  useEffect(() => {
    const requiredRooms = Math.ceil(formData.guests / 2);
    if (requiredRooms > formData.rooms) {
      setFormData((prev) => ({ ...prev, rooms: requiredRooms }));
    }
  }, [formData.guests]);

  const calculateNights = () => {
    if (formData.checkIn && formData.checkOut) {
      const checkIn = new Date(formData.checkIn);
      const checkOut = new Date(formData.checkOut);
      const diffTime = Math.abs(checkOut - checkIn);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };
  const validRoomCount = Math.ceil(formData.guests / 2);
  const totalPrice =
    calculateNights() * hotel?.pricePerNight * validRoomCount || 0;

  const amenityMap = {
    wifi: {
      label: "Free WiFi",
      icon: <Wifi className="w-4 h-4 text-emerald-600" />,
    },
    pool: {
      label: "Swimming Pool",
      icon: <Waves className="w-4 h-4 text-emerald-600" />,
    },
    restaurant: {
      label: "Restaurant",
      icon: <Utensils className="w-4 h-4 text-emerald-600" />,
    },
    parking: {
      label: "Parking",
      icon: <Car className="w-4 h-4 text-emerald-600" />,
    },
    "room service": {
      label: "Room Service",
      icon: <Coffee className="w-4 h-4 text-emerald-600" />,
    },
  };

  const standardKeys = Object.keys(amenityMap);

  // ✅ Normalize host amenities (e.g. lowercase, trimmed)
  const hostAmenities = (hotel?.amenities || []).map((a) =>
    a.toLowerCase().trim()
  );

  // ✅ Find matched amenities from standard list
  const matchedStandardAmenities = standardKeys.map((key) => {
    const matched = hostAmenities.find((h) => h.includes(key)); // fuzzy match
    return {
      label: amenityMap[key].label,
      icon: amenityMap[key].icon,
      available: !!matched,
    };
  });

  // ✅ Find host-added extra amenities that are NOT in standard list
  const extraAmenities = hostAmenities.filter(
    (h) => !standardKeys.some((key) => h.includes(key))
  );

  // ✅ Add them too with green icon & fallback icon
  const additionalAmenities = extraAmenities.map((raw) => ({
    label: raw,
    icon: <Shield className="w-4 h-4 text-emerald-600" />,
    available: true,
  }));

  // ✅ Final full list to render:
  const allAmenitiesToShow = [
    ...matchedStandardAmenities,
    ...additionalAmenities,
  ];

  if (!hotel)
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
          <p className="text-emerald-600 font-semibold text-lg">
            Loading hotel details...
          </p>
        </div>
      </div>
    );

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: true,
    autoplaySpeed: 1350,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="container mx-auto px-4 py-10">
        {/* Mobile Slider */}
        <div className="block lg:hidden mb-10 rounded-xl overflow-hidden shadow-xl">
          <Slider {...sliderSettings}>
            {hotel.images?.slice(0, 5).map((img, idx) => (
              <div key={idx}>
                <img
                  src={img}
                  alt={`hotel-slide-${idx}`}
                  className="w-full h-72 object-cover"
                />
              </div>
            ))}
          </Slider>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid grid-cols-4 grid-rows-2 gap-3 h-[500px] rounded-2xl overflow-hidden mb-10 shadow-2xl">
          <div className="col-span-2 row-span-2">
            <img
              src={hotel.images?.[0]}
              alt="Main"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          {hotel.images?.slice(1, 5).map((img, idx) => (
            <div key={idx} className="overflow-hidden">
              <img
                src={img}
                alt={`hotel-${idx}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left */}
          <div className="flex-1">
            <div className="text-gray-900 max-w-4xl mb-10">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                {hotel.title}
              </h1>
              <div className="flex items-center gap-2 mb-4 text-gray-600">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span className="text-lg">
                  {hotel.location}, {hotel.area}, {hotel.state}
                </span>
              </div>
              <div className="flex items-center gap-6 text-gray-700">
                <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-lg">
                    {hotel.rating || 4.5}
                  </span>
                </div>
                <span className="text-lg">
                  ({hotel.reviews || 127} reviews)
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white/90 backdrop-blur-lg border border-white/30 rounded-2xl p-8 mb-8 shadow-xl hover:shadow-2xl transition-all duration-300">
              <h2 className="text-3xl font-bold text-emerald-700 mb-6 flex items-center gap-3">
                <Shield className="w-8 h-8 text-emerald-600" />
                About This Property
              </h2>

              <p className="text-gray-700 leading-relaxed text-lg">
                {hotel.description}
                {/* Discover a comfortable and memorable stay at our property,
                perfect for families, couples, and solo travelers. Experience
                luxury and comfort in a serene environment with world-class
                amenities. */}
              </p>
            </div>

            {/* Amenities */}
            <div className="bg-white/90 backdrop-blur-lg border border-white/30 rounded-2xl p-8 mb-8 shadow-xl hover:shadow-2xl transition-all duration-300">
              <h2 className="text-3xl font-bold text-emerald-700 mb-8 flex items-center gap-3">
                <Utensils className="w-8 h-8 text-emerald-600" />
                Amenities & Services
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {allAmenitiesToShow.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 border ${
                      item.available
                        ? "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                        : "bg-red-50 border-red-200 hover:bg-red-100"
                    }`}
                  >
                    {item.icon}
                    <span
                      className={`text-sm font-medium ${
                        item.available ? "text-emerald-900" : "text-red-800"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Host Info */}
            <div className="bg-white/90 backdrop-blur-lg border border-white/30 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300">
              <h2 className="text-3xl font-bold text-emerald-700 mb-8 flex items-center gap-3">
                <Users className="w-8 h-8 text-emerald-600" />
                Hosted by
              </h2>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={
                      hotel.host?.profileImage ||
                      "https://i.pravatar.cc/100?img=68"
                    }
                    alt="host"
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-emerald-200 shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                    {hotel.host?.username}
                  </h3>
                  <p className="text-gray-600 mb-3 text-lg">
                    {hotel.host?.email}
                  </p>
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">Verified Host</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Box */}
          <div className="w-full lg:w-[450px]">
            <div className="sticky top-24">
              <div className="bg-white/95 backdrop-blur-lg border border-white/30 rounded-2xl shadow-2xl p-6 sm:p-8 transition-all duration-300">
                <div className="bg-gradient-to-r from-emerald-700 to-teal-600 text-white p-6 rounded-xl mb-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">
                      ₹{hotel.pricePerNight.toLocaleString()}
                      <span className="text-lg font-medium text-white/80 ml-2">
                        / night
                      </span>
                    </div>
                    <p className="text-emerald-100">Best price guaranteed</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Date Inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Check-in */}
                    <div className="relative group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        Check-in
                      </label>
                      <input
                        type="date"
                        name="checkIn"
                        value={formData.checkIn}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white hover:border-emerald-300 transition-all duration-200 text-gray-700 font-medium"
                      />
                    </div>

                    {/* Check-out */}
                    <div className="relative group">
                      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        Check-out
                      </label>
                      <input
                        type="date"
                        name="checkOut"
                        value={formData.checkOut}
                        onChange={handleChange}
                        min={
                          formData.checkIn ||
                          new Date().toISOString().split("T")[0]
                        }
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white hover:border-emerald-300 transition-all duration-200 text-gray-700 font-medium"
                      />
                    </div>
                  </div>
                  {formData.checkIn &&
                    formData.checkOut &&
                    !isValidDateRange && (
                      <p className="text-red-500 text-sm font-medium mt-1">
                        Check-out must be after check-in date.
                      </p>
                    )}

                  {/* Room and Guests */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Rooms
                      </label>
                      <input
                        type="number"
                        name="rooms"
                        min="1"
                        value={formData.rooms}
                        onChange={handleChange}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white hover:border-emerald-300 transition-all duration-200 text-gray-700 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Guests
                      </label>
                      <div className="relative">
                        <Users className="absolute left-3 top-4 w-5 h-5 text-emerald-600" />
                        <input
                          type="number"
                          name="guests"
                          min="1"
                          value={formData.guests}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white hover:border-emerald-300 transition-all duration-200 text-gray-700 font-medium"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Room availability warning */}
                  {!isFullyBooked && !hasEnoughRooms && (
                    <p className="text-red-600 text-sm font-semibold text-center">
                      Only {hotel.availableRooms} rooms available for selected
                      dates.
                    </p>
                  )}

                  {/* Price Details */}
                  {isFormComplete && calculateNights() > 0 && (
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 space-y-4 border border-emerald-200 mt-6 text-sm">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Price Details
                      </h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>
                            ₹{hotel.pricePerNight.toLocaleString()} ×{" "}
                            {calculateNights()} nights × {formData.rooms} rooms
                          </span>
                          <span className="font-medium">
                            ₹{totalPrice.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Service Fee</span>
                          <span>
                            ₹{Math.round(totalPrice * 0.1).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Taxes</span>
                          <span>
                            ₹{Math.round(totalPrice * 0.12).toLocaleString()}
                          </span>
                        </div>
                        <div className="border-t pt-3 font-bold text-lg flex justify-between text-emerald-700">
                          <span>Total</span>
                          <span>
                            ₹{Math.round(totalPrice * 1.22).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reserve Button
                  <button
                    disabled={!isBookingAllowed || !hasEnoughRooms}
                    onClick={() => {
                      if (!isFormComplete) return;
                      const bookingDetails = {
                        hotelId: hotel._id,
                        hotelTitle: hotel.title,
                        checkIn: formData.checkIn,
                        checkOut: formData.checkOut,
                        rooms: formData.rooms,
                        guests: formData.guests,
                        totalPrice: Math.round(totalPrice * 1.22),
                      };

                      if (!token) {
                        setBookingData(bookingDetails);
                        navigate("/login");
                      } else {
                        setBookingData(bookingDetails);
                        navigate("/confirm");
                      }
                    }}
                    className={`mt-8 w-full py-5 text-white font-bold rounded-xl transition-all duration-300 text-lg ${
                      isFormComplete
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:scale-105 shadow-lg hover:shadow-xl"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    {isBookingAllowed
                      ? "Reserve Now"
                      : !isFormComplete
                      ? "Fill all fields to reserve"
                      : "Invalid date range"}
                  </button> */}

                  <button
                    disabled={!isBookingAllowed || !hasEnoughRooms}
                    onClick={() => {
                      if (!isFormComplete || !hasEnoughRooms) return;

                      const bookingDetails = {
                        hotelId: hotel._id,
                        hotelTitle: hotel.title,
                        checkIn: formData.checkIn,
                        checkOut: formData.checkOut,
                        rooms: formData.rooms,
                        guests: formData.guests,
                        totalPrice: Math.round(totalPrice * 1.22),
                      };

                      if (!token) {
                        setBookingData(bookingDetails);
                        navigate("/login");
                      } else {
                        setBookingData(bookingDetails);
                        navigate("/confirm");
                      }
                    }}
                    className={`mt-8 w-full py-5 text-white font-bold rounded-xl transition-all duration-300 text-lg ${
                      isFormComplete && hasEnoughRooms && isValidDateRange
                        ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:scale-105 shadow-lg hover:shadow-xl"
                        : "bg-gray-300 cursor-not-allowed"
                    }`}
                  >
                    {!isFormComplete
                      ? "Fill all fields to reserve"
                      : !isValidDateRange
                      ? "Invalid date range"
                      : !hasEnoughRooms
                      ? `Only ${hotel.availableRooms} rooms available`
                      : "Reserve Now"}
                  </button>

                  {/* Security Note */}
                  <div className="flex justify-center items-center gap-3 text-sm text-gray-600 mt-6 bg-gray-50 rounded-lg p-3">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    <span>Your data is secure and encrypted</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;
