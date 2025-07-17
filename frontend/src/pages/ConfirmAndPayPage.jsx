import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchItemByType,
  checkHotelAvailability,
  createRazorpayOrder,
  verifyPayment,
} from "../api/allAPIs";

import axios from "axios";
import {
  Shield,
  Calendar,
  Users,
  Home,
  MapPin,
  Clock,
  CreditCard,
  Edit2,
} from "lucide-react";

const ConfirmAndPayPage = () => {
  const { bookingData, token, user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [guests, setGuests] = useState(bookingData?.guests);
  const [isEditing, setIsEditing] = useState(false);
  const [rooms, setRooms] = useState(bookingData?.rooms || 1);

  const [selectedSlot, setSelectedSlot] = useState(null);

  const rawCheckIn =
    bookingData?.type === "service"
      ? `${bookingData?.date || ""}T${
          bookingData?.time?.split(" - ")[0] || "12:00"
        }`
      : bookingData?.type === "experience"
      ? `${bookingData?.date || ""}T${
          bookingData?.time?.split(" - ")[0] || "12:00"
        }`
      : bookingData?.checkIn;

  const rawCheckOut =
    bookingData?.type === "service"
      ? `${bookingData.date}T${bookingData.time || "00:00"}`
      : bookingData?.type === "experience"
      ? null
      : bookingData?.checkOut;

  const [checkIn, setCheckIn] = useState(rawCheckIn);
  const [checkOut, setCheckOut] = useState(rawCheckOut);

  const type = bookingData?.type || "hotel";

  useEffect(() => {
    if (!bookingData) return navigate("/");

    // const fetchItem = async () => {
    //   try {
    //     const endpointMap = {
    //       hotel: `/api/host/hotel-detail/${bookingData.hotelId}`,
    //       experience: `/api/experiences/experience-detail/${bookingData.experienceId}`,
    //       service: `/api/services/service-detail/${bookingData.serviceId}`,
    //     };

    //     const res = await axios.get(
    //       `http://localhost:4000${endpointMap[type]}`
    //     );

    //     const responseItem =
    //       res.data.hotel || res.data.experience || res.data.service || res.data;

    //     setItem(responseItem);
    //   } catch (err) {
    //     console.error("Failed to fetch details:", err);
    //   }
    // };

    const fetchItem = async () => {
      try {
        const data = await fetchItemByType(type, bookingData[`${type}Id`]);
        const responseItem =
          data.hotel || data.experience || data.service || data;

        setItem(responseItem);
      } catch (err) {
        console.error("Failed to fetch details:", err);
      }
    };

    fetchItem();
  }, [bookingData, navigate, type]);

  useEffect(() => {
    if (
      (type === "service" || type === "experience") &&
      item?.slots?.length &&
      checkIn
    ) {
      const selectedTime = checkIn.split("T")[1]?.slice(0, 5);
      const matchedSlot = item.slots.find(
        (slot) => slot.startTime === selectedTime
      );

      if (matchedSlot) {
        setSelectedSlot(matchedSlot);
      } else {
        setSelectedSlot(null);
      }
    }
  }, [checkIn, item]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const nights =
    checkIn && checkOut
      ? Math.ceil(
          (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
        )
      : 1;

  const basePrice =
    type === "hotel"
      ? (item?.pricePerNight || 0) * rooms * nights
      : (item?.pricePerHead || 0) * guests;

  const serviceFee = Math.round(basePrice * 0.1);
  const taxes = Math.round(basePrice * 0.12);
  const total = basePrice + serviceFee + taxes;

  const handlePayment = async () => {
    setLoading(true);
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      alert("Razorpay SDK failed to load");
      setLoading(false);
      return;
    }

    // if (type === "hotel") {
    //   const availabilityRes = await axios.get(
    //     `http://localhost:4000/api/host/hotel-detail/${bookingData.hotelId}?checkIn=${checkIn}&checkOut=${checkOut}`
    //   );

    //   const available = availabilityRes.data.availableRooms;
    //   if (rooms > available) {
    //     alert(`Only ${available} rooms available for selected dates.`);
    //     setLoading(false);
    //     return;
    //   }
    // }

    if (type === "hotel") {
  const availability = await checkHotelAvailability(
    bookingData.hotelId,
    checkIn,
    checkOut
  );

  const available = availability.availableRooms;
  if (rooms > available) {
    alert(`Only ${available} rooms available for selected dates.`);
    setLoading(false);
    return;
  }
}


    try {
      // const orderRes = await axios.post(
      //   "http://localhost:4000/api/payment/create-order",
      //   { amount: total },
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );

      const order = await createRazorpayOrder(token, total);

      const datePart = checkIn?.split("T")[0];
      const timePart = checkIn?.split("T")[1]?.slice(0, 5);

      let selectedSlotTime = null;
      if (
        (type === "service" || type === "experience") &&
        item?.slots?.length
      ) {
        selectedSlotTime = item.slots.find(
          (slot) => slot.startTime === timePart
        );
      }

      const bookingDetails = {
        ...bookingData,
        type,
        referenceId:
          bookingData.hotelId ||
          bookingData.serviceId ||
          bookingData.experienceId,
        userId: user?._id,
        userEmail: user?.email,
        guests,
        rooms,
        totalPrice: total,
        ...(type === "hotel" && {
          checkIn,
          checkOut,
        }),
        ...(type === "service" || type === "experience"
          ? {
              date: datePart,
              startTime: timePart,
              endTime: selectedSlotTime?.endTime || null,
            }
          : {}),
      };

      if (type === "service") {
        if (!checkIn || isNaN(new Date(checkIn))) {
          alert("Please select a valid date and time for your booking.");
          setLoading(false);
          return;
        }
      }

      const options = {
        key: "rzp_test_BfK6i6b0E5R9rg",
        amount: order.amount,
        currency: "INR",
        name: "Ghumakad",
        description: `Booking for ${item?.title || "item"}`,
        image: "/logo.png",
        order_id: order.id,
        handler: async function (response) {
          // await axios.post(
          //   "http://localhost:4000/api/payment/verify",
          //   { ...response, bookingDetails },
          //   { headers: { Authorization: `Bearer ${token}` } }
          // );
           await verifyPayment(token, response, bookingDetails);
          navigate("/payment-success");
        },
        prefill: {
          name: user?.username || "",
          email: user?.email || "",
        },
        theme: {
          color: "#10b981",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getTodayDate = () => new Date().toISOString().split("T")[0];
  const isInvalidDate =
    !checkIn ||
    isNaN(new Date(checkIn)) ||
    (type !== "experience" && new Date(checkIn) < new Date(getTodayDate())) ||
    (type === "hotel" && checkOut && new Date(checkOut) <= new Date(checkIn));

  if (!bookingData || !item)
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600 font-medium">
            Loading your booking details...
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Confirm Your {type.charAt(0).toUpperCase() + type.slice(1)} Booking
          </h1>
          <p className="text-gray-600">
            Review your details and complete your payment
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property Card */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <img
                  src={item.images?.[0]}
                  alt={type}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-emerald-600">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Home className="w-6 h-6 text-emerald-600" />
                  {item.title}
                </h2>
                <p className="text-gray-600 flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4" />
                  {item.location || item.area}, {item.state || ""}
                </p>
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                  <p className="text-sm text-emerald-700">
                    <strong>Booked by:</strong> {user?.username}
                  </p>
                  <p className="text-sm text-emerald-700">
                    <strong>Email:</strong> {user?.email}
                  </p>
                </div>
              </div>
            </div>
            {/* Booking Form */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  Booking Details
                </h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                >
                  <Edit2 className="w-4 h-4" />
                  {isEditing ? "Save" : "Edit"}
                </button>
              </div>

              {isEditing ? (
                <div className="grid sm:grid-cols-2 gap-6">
                  {type === "service" ? (
                    <>
                      {/* Service - Date */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-emerald-600" />
                          Date
                        </label>
                        <input
                          type="date"
                          min={getTodayDate()}
                          value={checkIn?.split("T")[0] || getTodayDate()}
                          onChange={(e) => {
                            const timePart = checkIn?.split("T")[1] || "12:00";
                            setCheckIn(`${e.target.value}T${timePart}`);
                          }}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                        />
                      </div>

                      {/* Service - Time */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-emerald-600" />
                          Time
                        </label>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-emerald-600" />
                            Selected Slot
                          </label>
                          <div className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-100 text-gray-700">
                            {selectedSlot
                              ? `${selectedSlot.startTime} - ${selectedSlot.endTime}`
                              : "Not selected"}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : type === "experience" ? (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-5 h-5 text-emerald-600" />
                          <span className="text-sm font-medium">Date:</span>
                          <span className="text-sm">
                            {new Date(checkIn).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Clock className="w-5 h-5 text-emerald-600" />
                          <span className="text-sm font-medium">Time:</span>
                          <span className="text-sm">
                            {selectedSlot
                              ? `${selectedSlot.startTime} - ${selectedSlot.endTime}`
                              : "Not selected"}
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Hotel - Check-in/Check-out */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-emerald-600" />
                          Check-in Date
                        </label>
                        <input
                          type="date"
                          min={getTodayDate()}
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-emerald-600" />
                          Check-out Date
                        </label>
                        <input
                          type="date"
                          min={checkIn}
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                        />
                      </div>
                      {new Date(checkIn) < new Date(getTodayDate()) && (
                        <p className="text-sm text-red-600 -mt-4">
                          Check-in date cannot be in the past.
                        </p>
                      )}
                      {new Date(checkOut) <= new Date(checkIn) && (
                        <p className="text-sm text-red-600 -mt-2">
                          Check-out must be after check-in date.
                        </p>
                      )}
                    </>
                  )}

                  {/* Guests - common for all */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-600" />
                      Number of Guests
                    </label>
                    <input
                      type="number"
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                  </div>
                  {(type === "service" || type === "experience") &&
                    selectedSlot &&
                    guests > selectedSlot.maxGuests && (
                      <p className="text-sm text-red-600 -mt-2">
                        This slot allows a maximum of {selectedSlot.maxGuests}{" "}
                        guests. You have selected {guests}.
                      </p>
                    )}

                  {/* Rooms - only for hotel */}
                  {type === "hotel" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Home className="w-5 h-5 text-emerald-600" />
                        Number of Rooms
                      </label>
                      <input
                        type="number"
                        value={rooms}
                        onChange={(e) => setRooms(parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                  {type === "service" ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium">Date:</span>
                        <span className="text-sm">
                          {new Date(checkIn).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-emerald-600" />
                          Selected Slot
                        </label>
                        <div className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-gray-100 text-gray-700">
                          {selectedSlot
                            ? `${selectedSlot.startTime} - ${selectedSlot.endTime}`
                            : "Not selected"}
                        </div>
                      </div>
                    </div>
                  ) : type === "experience" ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium">Date:</span>
                        <span className="text-sm">
                          {new Date(checkIn).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium">Time:</span>
                        <span className="text-sm">
                          {selectedSlot
                            ? `${selectedSlot.startTime} - ${selectedSlot.endTime}`
                            : "Not selected"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium">Check-in:</span>
                        <span className="text-sm">
                          {new Date(checkIn).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium">Check-out:</span>
                        <span className="text-sm">
                          {new Date(checkOut).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Users className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-medium">Guests:</span>
                      <span className="text-sm">{guests}</span>
                    </div>
                    {type === "hotel" && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Home className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-medium">Rooms:</span>
                        <span className="text-sm">{rooms}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Price Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-6 sticky top-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Price Summary
              </h3>

              <div className="space-y-4 mb-6">
                <SummaryLine
                  label={
                    type === "hotel"
                      ? `₹${item.pricePerNight} × ${nights} nights × ${rooms} rooms`
                      : `₹${item.pricePerHead} × ${guests} guests`
                  }
                  value={`₹${basePrice}`}
                />

                <SummaryLine label="Service Fee" value={`₹${serviceFee}`} />
                <SummaryLine label="Taxes & Fees" value={`₹${taxes}`} />
                <SummaryLine label="Total Amount" value={`₹${total}`} bold />
              </div>

              <button
                onClick={handlePayment}
                disabled={
                  loading ||
                  isInvalidDate ||
                  ((type === "service" || type === "experience") &&
                    selectedSlot &&
                    guests > selectedSlot.maxGuests)
                }
                className="w-full py-4 text-white font-semibold text-lg rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:scale-[1.02] hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-teal-400"></div>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Confirm & Pay
                  </div>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-4">
                <Shield className="w-4 h-4" />
                <span>Your payment is secure & encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable input component
const InputField = ({ label, icon, value, onChange, type = "date" }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
      {icon}
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) =>
        onChange(type === "number" ? parseInt(e.target.value) : e.target.value)
      }
      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
    />
  </div>
);

// Reusable summary line
const SummaryLine = ({ label, value, bold = false }) => (
  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
    <div className={`text-sm ${bold ? "text-lg font-bold" : "text-gray-600"}`}>
      {label}
    </div>
    <div
      className={`font-medium ${
        bold ? "text-emerald-600 text-xl" : "text-gray-900"
      }`}
    >
      {value}
    </div>
  </div>
);

// // Display-only detail
const DisplayDetail = ({ label, value, icon }) => (
  <div className="flex items-center gap-2 text-gray-700">
    <span className="w-4 h-4 text-emerald-600">{icon}</span>
    <span className="text-sm font-medium">{label}:</span>
    <span className="text-sm">{value}</span>
  </div>
);

export default ConfirmAndPayPage;
