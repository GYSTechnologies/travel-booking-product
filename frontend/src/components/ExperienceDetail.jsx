import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { MapPin, Star, Shield, Users, Calendar, Clock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { fetchExperienceById, fetchExperienceSlots } from "../api/allAPIs";

const ExperienceDetail = () => {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { token, setBookingData } = useAuth();

  const [experience, setExperience] = useState(null);
  const [formData, setFormData] = useState({
    date: params.get("checkIn") || "",
    guests: Number(params.get("guests")) || 1,
  });

  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedSlotData, setSelectedSlotData] = useState(null);

 
  useEffect(() => {
    const fetchExperience = async () => {
      try {
             const data = await fetchExperienceById(id);
      setExperience(data);

      } catch (err) {
        console.error("Failed to fetch experience detail", err);
      }
    };
    fetchExperience();
  }, [id]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!formData.date) return;
      try {
        const data = await fetchExperienceSlots(id, formData.date);

      setAvailableSlots(data);
      } catch (err) {
        console.error("Failed to fetch slots:", err);
      }
    };

    fetchSlots();
  }, [formData.date]);

  useEffect(() => {
    if (experience && formData.guests > experience.maxGuests) {
      setFormData((prev) => ({ ...prev, guests: experience.maxGuests }));
    }
  }, [formData.guests, experience]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const totalPrice = experience ? experience.pricePerHead * formData.guests : 0;

  if (!experience)
    return (
      <div className="text-center py-12 text-emerald-600 font-semibold">
        Loading experience details...
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

  const guestExceedsSlot =
    selectedSlotData &&
    formData.guests >
      selectedSlotData.maxGuests - selectedSlotData.bookedGuests;

  const isFormComplete =
    formData.date && formData.guests > 0 && selectedSlot && !guestExceedsSlot;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="container mx-auto px-4 py-10">
        {/* Image Slider */}

        {/* Mobile Slider */}
        <div className="block lg:hidden mb-10 rounded-xl overflow-hidden">
          <Slider {...sliderSettings}>
            {experience.images?.slice(0, 5).map((img, idx) => (
              <div key={idx}>
                <img
                  src={img}
                  alt={`experience-slide-${idx}`}
                  className="w-full h-80 object-cover rounded-xl"
                />
              </div>
            ))}
          </Slider>
        </div>

        {/* Desktop Grid View */}

        <div className="hidden lg:grid grid-cols-4 grid-rows-2 gap-3 h-[500px] rounded-2xl overflow-hidden mb-10 shadow-2xl">
          <div className="col-span-2 row-span-2 group overflow-hidden">
            <img
              src={experience.images?.[0]}
              alt="Main"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          {experience.images?.slice(1, 5).map((img, idx) => (
            <div key={idx} className="group overflow-hidden">
              <img
                src={img}
                alt={`experience-${idx}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Side */}
          <div className="flex-1">
            <div className="text-gray-900 max-w-4xl mb-10">
              <h1 className="text-4xl font-bold mb-4 leading-tight">
                {experience.title}
              </h1>
              <div className="flex items-center gap-2 mb-3 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span>
                  {experience.location}, {experience.state}
                </span>
              </div>
              <div className="flex items-center gap-4 text-gray-700">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">
                    {experience.rating || 4.6}
                  </span>
                </div>
                <span>({experience.maxGuests} guests max)</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-bold text-emerald-700 mb-4">
                About This Experience
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {experience.description}
              </p>
            </div>

            {/* Duration & Highlights */}
            <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-xl p-6 mb-6">
              <div className="flex items-center gap-2 text-emerald-700 mb-4">
                <Clock className="w-5 h-5" />
                <span className="font-semibold">
                  Duration: {experience.duration}
                </span>
              </div>
              {experience.highlights?.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold mb-2">Highlights</h3>
                  <ul className="list-disc pl-5 text-gray-700 space-y-1">
                    {experience.highlights.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Host Info */}
            <div className="bg-white/80 backdrop-blur-lg border border-white/20 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-emerald-700 mb-4">
                About the Host
              </h2>
              <div className="flex items-center gap-4">
                <img
                  src={
                    experience.host?.profileImage ||
                    "https://i.pravatar.cc/100?img=58"
                  }
                  alt="host"
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-emerald-200"
                />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {experience.host?.username}
                  </h3>
                  <p className="text-gray-600 mb-2">{experience.host?.email}</p>
                  <div className="flex items-center gap-2 text-sm text-emerald-600">
                    <Shield className="w-4 h-4" />
                    <span>Verified Host</span>
                  </div>
                </div>
              </div>
              {experience.aboutHost && (
                <p className="text-gray-700 mt-4 leading-relaxed">
                  {experience.aboutHost}
                </p>
              )}
            </div>
          </div>

          {/* Booking Box */}
          <div className="w-full lg:w-[420px]">
            <div className="bg-white/95 backdrop-blur-lg border border-white/30 rounded-2xl p-6 sm:p-8 shadow-2xl sticky top-60 transition-all duration-300">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
                  ₹{experience.pricePerHead.toLocaleString()}
                  <span className="text-base font-medium text-gray-500 ml-2">
                    / per person
                  </span>
                </div>
              </div>

              {/* Date Picker Input */}
              <div className="relative group">
                <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  Select Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white hover:border-emerald-300 transition-all duration-200 text-gray-700 font-medium"
                  min={new Date().toISOString().split("T")[0]} // only future dates
                />
              </div>

              {/* Slot Selection UI */}
              {formData.date && (
                <div className="mt-6">
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    Select Time Slot
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                    {availableSlots.map((slot, idx) => {
                      const isFull = slot.bookedGuests >= slot.maxGuests;
                      const availableSpots = slot.maxGuests - slot.bookedGuests;
                      const isSelected = selectedSlot === slot.time;

                      return (
                        <button
                          key={idx}
                          disabled={isFull}
                          onClick={() => {
                            if (!isFull) {
                              setSelectedSlot(slot.time);
                              setSelectedSlotData(slot);
                            }
                          }}
                          className={`rounded-xl py-2 px-3 text-sm font-semibold border text-center transition-all duration-200 ${
                            isFull
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : isSelected
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-md hover:scale-105"
                              : "bg-white text-emerald-600 border-emerald-300 hover:border-emerald-600 hover:bg-emerald-50"
                          }`}
                        >
                          <div className="flex flex-col items-center">
                            <span>{slot.time}</span>
                            <span className="text-xs mt-1">
                              {isFull
                                ? "Full"
                                : `${availableSpots} spot${
                                    availableSpots !== 1 ? "s" : ""
                                  }`}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Guests Input */}
              <div className="relative group mt-6">
                <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Guests
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="guests"
                    min="1"
                    max={
                      selectedSlotData
                        ? selectedSlotData.maxGuests -
                          selectedSlotData.bookedGuests
                        : experience.maxGuests
                    }
                    value={formData.guests}
                    onChange={handleChange}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white hover:border-emerald-300 transition-all duration-200 text-gray-700 font-medium appearance-none"
                    style={{
                      WebkitAppearance: "none",
                      MozAppearance: "textfield",
                    }}
                  />
                </div>
              </div>
              {guestExceedsSlot && (
                <p className="text-red-500 text-sm mt-2">
                  Only{" "}
                  {selectedSlotData.maxGuests - selectedSlotData.bookedGuests}{" "}
                  guest
                  {selectedSlotData.maxGuests -
                    selectedSlotData.bookedGuests !==
                  1
                    ? "s"
                    : ""}{" "}
                  allowed for this slot
                </p>
              )}

              {/* Price Breakdown */}
              {isFormComplete && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 space-y-3 mt-8 text-sm border border-emerald-200">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">
                      ₹{experience.pricePerHead} × {formData.guests} guests
                    </span>
                    <span className="font-semibold text-gray-800">
                      ₹{totalPrice}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Service Fee</span>
                    <span className="font-semibold text-gray-800">
                      ₹{Math.round(totalPrice * 0.1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Taxes</span>
                    <span className="font-semibold text-gray-800">
                      ₹{Math.round(totalPrice * 0.12)}
                    </span>
                  </div>
                  <div className="border-t-2 border-emerald-200 pt-4 font-bold text-xl flex justify-between items-center">
                    <span className="text-emerald-700">Total</span>
                    <span className="text-emerald-700">
                      ₹{Math.round(totalPrice * 1.22)}
                    </span>
                  </div>
                </div>
              )}

              {/* Reserve Button */}
              {/* <button
                // disabled={!isFormComplete}
                disabled={
                  !formData.date ||
                  !selectedSlot ||
                  formData.guests <= 0 ||
                  guestExceedsSlot
                }
                onClick={() => {
                  const bookingDetails = {
                    type: "experience",
                    experienceId: experience._id,
                    experienceTitle: experience.title,
                    date: formData.date,
                    time: selectedSlot, // slot selection added
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
                {isFormComplete
                  ? "Reserve This Experience"
                  : "Fill all fields to reserve"}
              </button> */}
              <button
                disabled={!isFormComplete}
                onClick={() => {
                  const bookingDetails = {
                    type: "experience",
                    experienceId: experience._id,
                    experienceTitle: experience.title,
                    date: formData.date,
                    time: selectedSlot,
                    guests: formData.guests,
                    pricePerPerson: experience.pricePerHead,
                    totalPrice: Math.round(totalPrice * 1.22),
                  };
                  console.log(bookingDetails, "bookingg..");

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
                {isFormComplete
                  ? "Reserve This Experience"
                  : "Fill all fields to reserve"}
              </button>

              <div className="flex justify-center items-center gap-3 text-sm text-gray-600 mt-6 bg-gray-50 rounded-lg p-3">
                <Shield className="w-5 h-5 text-emerald-600" />
                <span>Your data is secure and encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetail;
