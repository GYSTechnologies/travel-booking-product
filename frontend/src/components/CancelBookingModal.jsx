

import React, { useState, useEffect } from "react";

const CancelBookingModal = ({ booking, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");
  const [refund, setRefund] = useState(0);
  const [refundPercent, setRefundPercent] = useState(0);

  // Helper function to calculate hours difference
  const differenceInHours = (date1, date2) => {
    const diffInMs = new Date(date1) - new Date(date2);
    return diffInMs / (1000 * 60 * 60);
  };

  useEffect(() => {
    if (!booking) return;

    const checkDate = booking.type === "hotel" ? booking.checkIn : booking.dateTime;
    const hoursLeft = differenceInHours(new Date(checkDate), new Date());
    let percent = 0;

    if (hoursLeft >= 24) percent = 1;
    else if (hoursLeft >= 12) percent = 0.5;
    else if (hoursLeft >= 6) percent = 0.25;

    const refundAmount = Math.round(booking.totalPrice * percent);
    setRefund(refundAmount);
    setRefundPercent(percent);
  }, [booking]);

  if (!booking) return null;

  const getRefundColor = () => {
    if (refundPercent === 1) return "text-emerald-500";
    if (refundPercent === 0.5) return "text-yellow-500";
    if (refundPercent === 0.25) return "text-orange-500";
    return "text-red-500";
  };

  const getRefundBgColor = () => {
    if (refundPercent === 1) return "bg-emerald-50 border-emerald-100";
    if (refundPercent === 0.5) return "bg-yellow-50 border-yellow-100";
    if (refundPercent === 0.25) return "bg-orange-50 border-orange-100";
    return "bg-red-50 border-red-100";
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-xs sm:max-w-lg mx-auto rounded-2xl shadow-xl relative transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-red-400 to-red-400 text-white p-3 sm:p-6 rounded-t-2xl">
          <h2 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Cancel Booking</h2>
          <p className="text-red-50 text-xs sm:text-sm">
            Please review the cancellation policy before proceeding
          </p>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-white hover:text-red-100 transition-colors"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-3 sm:p-6 space-y-3 sm:space-y-6">
          {/* Refund Summary Card */}
          <div className={`p-2 sm:p-4 rounded-xl border-2 ${getRefundBgColor()}`}>
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-700">Your Refund Amount</span>
              <span className="text-xs text-gray-500">
                {refundPercent === 1 ? "100%" : refundPercent === 0.5 ? "50%" : refundPercent === 0.25 ? "25%" : "0%"} of ₹{booking.totalPrice}
              </span>
            </div>
            <div className={`text-xl sm:text-3xl font-bold ${getRefundColor()}`}>
              ₹{refund}
            </div>
            {refund === 0 && (
              <p className="text-xs sm:text-sm text-red-500 mt-1 sm:mt-2 font-medium">
                ⚠️ No refund available for cancellations within 6 hours
              </p>
            )}
          </div>

          {/* Refund Policy */}
          <div className="bg-gray-50 rounded-xl p-2 sm:p-4 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Refund Policy
            </h3>
            <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-emerald-400 rounded-full"></div>
                <span><strong>100% refund</strong> - 24+ hours before</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full"></div>
                <span><strong>50% refund</strong> - 12-24 hours before</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-400 rounded-full"></div>
                <span><strong>25% refund</strong> - 6-12 hours before</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-400 rounded-full"></div>
                <span><strong>No refund</strong> - Within 6 hours</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2 sm:mt-3 p-2 bg-blue-50 rounded-md border border-blue-100">
              💳 Refunds are processed automatically to your original payment method via Razorpay within 5-7 business days.
            </p>
          </div>

          {/* Cancellation Reason */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
              Reason for cancellation (optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please let us know why you're cancelling. This helps us improve our service."
              className="w-full p-2 sm:p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-300 focus:border-red-400 resize-none transition-all duration-200 text-sm"
              rows={2}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2 sm:pt-4">
            <button
              onClick={onClose}
              className="w-full sm:flex-1 px-4 py-2 sm:py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
            >
              Keep Booking
            </button>
            <button
              onClick={() => onConfirm(reason)}
              className="w-full sm:flex-1 px-4 py-2 sm:py-3 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-lg text-sm sm:text-base"
            >
              Cancel Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal;