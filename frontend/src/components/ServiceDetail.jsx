import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Slider from "react-slick";
import { Calendar, MapPin, Shield, Users, Star, Clock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, setBookingData } = useAuth();

  const [service, setService] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    guests: 1,
  });

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/services/service-detail/${id}`
        );
        setService(res.data);
      } catch (err) {
        console.error("Failed to fetch service:", err);
      }
    };
    fetchService();
  }, [id]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

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
        {/* Image Slider */}
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
              <div className="space-y-6">
                {/* Date */}
                <div className="relative group">
                  <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    Date
                  </label>
                  <div className="relative">
                    <DatePicker
                      selected={formData.date ? new Date(formData.date) : null}
                      onChange={(date) =>
                        setFormData((prev) => ({
                          ...prev,
                          date: date.toISOString().split("T")[0],
                        }))
                      }
                      minDate={new Date()}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white hover:border-emerald-300 transition-all duration-200 text-gray-700 font-medium"
                      placeholderText="Select date"
                      dateFormat="dd/MM/yyyy"
                      showPopperArrow={false}
                      popperClassName="custom-datepicker-popper"
                      calendarClassName="custom-datepicker-calendar"
                    />
                  </div>
                </div>

                {/* Time + Guests */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Time */}
                  <div className="relative group">
                    <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      Time
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white hover:border-emerald-300 transition-all duration-200 text-gray-700 font-medium appearance-none"
                        style={{
                          colorScheme: "light",
                          WebkitAppearance: "none",
                          MozAppearance: "textfield",
                        }}
                      />
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="relative group">
                    <label className=" text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4 text-emerald-600" />
                      Guests
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="guests"
                        min="1"
                        max={service.maxGuests}
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
                </div>
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
              <button
                disabled={
                  !formData.date || !formData.time || formData.guests <= 0
                }
                onClick={() => {
                  const bookingDetails = {
                    type: "service",
                    serviceId: service._id,
                    title: service.title,
                    date: formData.date,
                    time: formData.time,
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
                  formData.date && formData.time
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:scale-105 shadow-lg hover:shadow-xl"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {formData.date && formData.time
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
