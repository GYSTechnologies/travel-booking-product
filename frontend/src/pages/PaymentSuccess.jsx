
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Home, Calendar, Mail, Download, Share2, Star } from "lucide-react";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {

    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-teal-200 to-cyan-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-gradient-to-r from-cyan-200 to-blue-200 rounded-full opacity-20 animate-pulse delay-2000"></div>
      </div>

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 max-w-lg w-full p-8 relative z-10">
        {/* Success Icon with Animation */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircle className="w-14 h-14 text-emerald-600 animate-pulse" />
          </div>
          {/* Ripple Effect */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-24 bg-emerald-200 rounded-full opacity-30 animate-ping"></div>
        </div>

        {/* Success Message */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            🎉 Payment Successful!
          </h1>
          <p className="text-gray-600 text-base sm:text-lg mb-2">
            Your booking is confirmed and ready to go!
          </p>
          <p className="text-sm text-gray-500 mb-6">
            A confirmation email has been sent to your inbox
          </p>
          
          {/* Booking Details Summary */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 mb-6 border border-emerald-100">
            <div className="flex items-center justify-center gap-2 text-emerald-700 mb-2">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Booking Confirmed</span>
            </div>
            <p className="text-xs text-emerald-600">
              Booking ID: #BK{Math.random().toString(36).substr(2, 8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {/* Primary Actions */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
            <button
              onClick={() => navigate("/booking-history")}
              className="flex items-center justify-center gap-2 w-full bg-white text-emerald-600 border-2 border-emerald-600 py-3 rounded-xl font-semibold hover:bg-emerald-50 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Calendar className="w-4 h-4" />
              My Bookings
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="item flex gap-2">
          
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: 'Booking Confirmed!',
                    text: 'My booking has been confirmed successfully!'
                  });
                }
              }}
              className="flex items-center justify-center gap-1 w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 text-sm"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={() => navigate("/review")}
              className="flex items-center justify-center gap-1 w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 text-sm"
            >
              <Star className="w-4 h-4" />
              Review
            </button>
          </div>
        </div>

        {/* Email Confirmation */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
            <Mail className="w-4 h-4" />
            <span>Check your email for booking details</span>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Thank you for choosing us! We hope you have a wonderful experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;