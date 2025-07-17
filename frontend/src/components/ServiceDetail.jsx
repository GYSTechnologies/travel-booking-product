import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Slider from "react-slick";
import {
  Calendar,
  MapPin,
  Shield,
  Users,
  Star,
  Clock,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fetchServiceById, fetchServiceSlots } from "../api/allAPIs";

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, setBookingData } = useAuth();

  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedSlotData, setSelectedSlotData] = useState(null);



  const [service, setService] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    guests: 1,
  });

  // useEffect(() => {
  //   const fetchService = async () => {
  //     try {
  //       const res = await axios.get(
  //         `http://localhost:4000/api/services/service-detail/${id}`
  //       );
  //       setService(res.data);
  //     } catch (err) {
  //       console.error("Failed to fetch service:", err);
  //     }
  //   };
  //   fetchService();
  // }, [id]);

  useEffect(() => {
  const fetchService = async () => {
    try {
      const data = await fetchServiceById(id);
      setService(data);
    } catch (err) {
      console.error("Failed to fetch service:", err);
    }
  };
  fetchService();
}, [id]);


  // const fetchAvailableSlots = async (selectedDate) => {
  //   try {
  //     const res = await axios.get(
  //       `http://localhost:4000/api/services/${id}/slots?date=${selectedDate}`
  //     );
  //     setAvailableSlots(res.data); // Array of { time, maxGuests, bookedGuests }
  //   } catch (err) {
  //     console.error("Failed to fetch slots:", err);
  //   }
  // };

  const fetchAvailableSlots = async (selectedDate) => {
  try {
    const data = await fetchServiceSlots(id, selectedDate);
    setAvailableSlots(data);
  } catch (err) {
    console.error("Failed to fetch slots:", err);
  }
};

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const guestExceedsSlot =
    selectedSlotData && formData.guests > selectedSlotData.maxGuests;

  const totalPrice = formData.guests * (service?.pricePerHead || 0);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1500,
  };

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200 border-t-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-600 font-semibold text-lg">
            Loading service details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-200/30 to-emerald-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-10 relative z-10">
        {/* Mobile Slider */}
        <div className="block lg:hidden mb-10 rounded-2xl overflow-hidden shadow-2xl">
          <Slider {...sliderSettings}>
            {service.images?.map((img, idx) => (
              <div key={idx}>
                <img
                  src={img}
                  alt={`service-slide-${idx}`}
                  className="w-full h-72 object-cover"
                />
              </div>
            ))}
          </Slider>
        </div>

        {/* Desktop Grid */}
        <div className="hidden lg:grid grid-cols-4 grid-rows-2 gap-3 h-[500px] rounded-2xl overflow-hidden mb-10 shadow-2xl">
          <div className="col-span-2 row-span-2 group">
            <img
              src={service.images?.[0]}
              alt="Main"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          {service.images?.slice(1, 5).map((img, idx) => (
            <div key={idx} className="group overflow-hidden">
              <img
                src={img}
                alt={`service-${idx}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Content */}
          <div className="flex-1 space-y-8">
            {/* Title Section */}
            <div className="animate-fade-in">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight text-gray-900 bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text ">
                {service.title}
              </h1>

              <div className="flex items-center gap-2 mb-3 text-gray-600">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <span className="text-lg">
                  {service.location}, {service.state}
                </span>
              </div>

              <div className="flex items-center gap-4 text-gray-700 mb-6">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-lg">
                    {service.rating || 4.5}
                  </span>
                </div>
                <span className="text-gray-500">(132 reviews)</span>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/80">
              <h2 className="text-2xl font-bold text-emerald-700 mb-6 flex items-center gap-2">
                <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                About This Service
              </h2>
              <p className="text-gray-700 leading-relaxed text-lg">
                {service.description}
              </p>
            </div>

            {/* Highlights Section */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/80">
              <h2 className="text-2xl font-bold text-emerald-700 mb-6 flex items-center gap-2">
                <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                Highlights
              </h2>
              <ul className="space-y-3">
                {service.highlights?.map((point, i) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-3 flex-shrink-0"></div>
                    <span className="text-lg">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Host Section */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/30 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-white/80">
              <h2 className="text-2xl font-bold text-emerald-700 mb-6 flex items-center gap-2">
                <div className="w-1 h-8 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                Hosted by
              </h2>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={
                      service.host?.profileImage ||
                      "https://i.pravatar.cc/100?img=68"
                    }
                    alt="host"
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-emerald-200 shadow-lg"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {service.host?.username}
                  </h3>
                  <p className="text-gray-600 mb-3">{service.host?.email}</p>
                  <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full w-fit">
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">Verified Host</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Box */}

          <div className="w-full lg:w-[450px]">
            <div className="bg-white/95 backdrop-blur-lg border border-white/30 rounded-2xl p-8 shadow-2xl sticky top-8 transition-all duration-300">
              {/* Price Header */}
              <div className="text-center mb-8">
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                  ₹{service.pricePerHead.toLocaleString()}
                  <span className="text-lg font-medium text-gray-500 ml-2">
                    / person
                  </span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-8">
                {/* Date Section */}
                <div className="relative group">
                  <label className=" text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    Select Date
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={formData.date ? new Date(formData.date) : null}
                      onChange={(date) => {
                        const selectedDate = date.toISOString().split("T")[0];
                        setFormData((prev) => ({
                          ...prev,
                          date: selectedDate,
                        }));
                        setSelectedSlot(null);
                        fetchAvailableSlots(selectedDate);
                      }}
                      minDate={new Date()}
                      className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white hover:border-emerald-300 transition-all duration-300 text-gray-700 font-medium shadow-sm hover:shadow-md"
                      placeholderText="Choose your preferred date"
                      dateFormat="dd/MM/yyyy"
                      showPopperArrow={false}
                      popperClassName="custom-datepicker-popper"
                      calendarClassName="custom-datepicker-calendar"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Time Slots Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-emerald-600" />
                      Available Time Slots
                    </label>
                    {formData.date && (
                      <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {new Date(formData.date).toLocaleDateString("en-GB", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </span>
                    )}
                  </div>

                  <div className="min-h-[120px] p-4 bg-gray-50 rounded-xl border border-gray-200">
                    {!formData.date ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">
                          Please select a date first
                        </p>
                        <p className="text-sm text-gray-400">
                          Choose a date to see available time slots
                        </p>
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <Clock className="w-12 h-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">
                          No slots available
                        </p>
                        <p className="text-sm text-gray-400">
                          Try selecting a different date
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {availableSlots.map((slot, idx) => {
                          const isFull = slot.bookedGuests >= slot.maxGuests;
                          const isSelected = selectedSlot === slot.time;
                          const availableSpots =
                            slot.maxGuests - slot.bookedGuests;

                          return (
                            <button
                              key={idx}
                              onClick={() => {
                                if (!isFull) {
                                  setSelectedSlot(slot.time);
                                  setSelectedSlotData(slot); // ✅ slot ka pura data store karega
                                }
                              }}
                              className={`
                  relative px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                  ${
                    isFull
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed border-gray-300"
                      : isSelected
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-200"
                      : "bg-white hover:bg-emerald-50 border-gray-200 hover:border-emerald-300 text-gray-700 hover:text-emerald-700 shadow-sm hover:shadow-md"
                  }
                `}
                              disabled={isFull}
                            >
                              <div className="flex flex-col items-center">
                                <span className="font-semibold">
                                  {slot.time}
                                </span>
                                <span
                                  className={`text-xs mt-1 ${
                                    isFull
                                      ? "text-gray-400"
                                      : isSelected
                                      ? "text-emerald-100"
                                      : "text-gray-500"
                                  }`}
                                >
                                  {isFull
                                    ? "Full"
                                    : `${availableSpots} spot${
                                        availableSpots !== 1 ? "s" : ""
                                      }`}
                                </span>
                              </div>

                              {/* Availability indicator */}
                              <div
                                className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                                  isFull
                                    ? "bg-red-500"
                                    : availableSpots <= 2
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Selected slot confirmation */}
                  {selectedSlot && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="flex items-center gap-2 text-emerald-800">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">
                          Selected: {selectedSlot} on{" "}
                          {new Date(formData.date).toLocaleDateString("en-GB")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Guests Input */}
                <div>
                  <label className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-emerald-600" />
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    name="guests"
                    min="1"
                    max="10"
                    value={formData.guests}
                    onChange={handleChange}
                    className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white hover:border-emerald-300 transition-all duration-300 text-gray-700 font-medium shadow-sm hover:shadow-md"
                    placeholder="Enter number of guests"
                  />
                </div>
                {/* {selectedSlotData &&
                  formData.guests > selectedSlotData.maxGuests && (
                    <p className="text-red-600 text-sm mt-2">
                      This slot allows a maximum of {selectedSlotData.maxGuests}{" "}
                      guests.
                    </p>
                  )} */}

                {selectedSlotData &&
                  formData.guests >
                    selectedSlotData.maxGuests -
                      selectedSlotData.bookedGuests && (
                    <p className="text-red-600 text-sm mt-2">
                      Only{" "}
                      {selectedSlotData.maxGuests -
                        selectedSlotData.bookedGuests}{" "}
                      spot
                      {selectedSlotData.maxGuests -
                        selectedSlotData.bookedGuests !==
                      1
                        ? "s"
                        : ""}{" "}
                      left in this slot.
                    </p>
                  )}
              </div>

              {/* Price Summary */}
              {formData.date && formData.guests > 0 && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 space-y-3 mt-8 text-sm border border-emerald-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">
                      ₹{service.pricePerHead} × {formData.guests} guests
                    </span>
                    <span className="font-semibold text-gray-800">
                      ₹{totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Service Fee</span>
                    <span className="font-semibold text-gray-800">
                      ₹{Math.round(totalPrice * 0.1).toLocaleString()}
                    </span>
                  </div>
                  <div className="border-t-2 border-emerald-200 pt-4 font-bold text-xl flex justify-between items-center">
                    <span className="text-emerald-700">Total</span>
                    <span className="text-emerald-700">
                      ₹{Math.round(totalPrice * 1.1).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Reserve Button */}
              {/* <button
                disabled={
                  !formData.date || !selectedSlot  || formData.guests <= 0
                }
                onClick={() => {
                  const bookingDetails = {
                    type: "service",
                    serviceId: service._id,
                    title: service.title,
                    date: formData.date,
                    time: selectedSlot,
                    guests: formData.guests,
                    totalPrice: Math.round(totalPrice * 1.1),
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
                  formData.date && selectedSlot
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:scale-105 shadow-lg hover:shadow-xl"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {formData.date && selectedSlot
                  ? "Reserve Now"
                  : "Fill all fields to reserve"}
              </button> */}

              <button
                disabled={
                  !formData.date ||
                  !selectedSlot ||
                  formData.guests <= 0 ||
                  guestExceedsSlot
                }
                onClick={() => {
                  const bookingDetails = {
                    type: "service",
                    serviceId: service._id,
                    title: service.title,
                    date: formData.date,
                    time: selectedSlot, // ✅ fixed
                    guests: formData.guests,
                    totalPrice: Math.round(totalPrice * 1.1),
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
                  formData.date && selectedSlot
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:scale-105 shadow-lg hover:shadow-xl"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {formData.date && selectedSlot
                  ? "Reserve Now"
                  : "Fill all fields to reserve"}
              </button>

              <div className="flex justify-center items-center gap-3 text-sm text-gray-600 mt-6 bg-gray-50 rounded-lg p-3">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span>Your data is secure and encrypted</span>
              </div>
            </div>
          </div>

          {/* Custom CSS for better date/time styling */}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(45deg, #059669, #0d9488);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(45deg, #047857, #0f766e);
        }
      `}</style>
    </div>
  );
};

export default ServiceDetail;
