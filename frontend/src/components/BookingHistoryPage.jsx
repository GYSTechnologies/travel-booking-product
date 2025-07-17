
import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import CancelBookingModal from "./CancelBookingModal";
import { fetchMyBookings } from "../api/allAPIs";

const BookingHistoryPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
       const data = await fetchMyBookings(token);
      setBookings(data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        toast.error("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchBookings();
  }, [token]);

  const handleCancel = async (bookingId, reason = "") => {
    try {
const res = await cancelBooking(token, bookingId, reason);
    toast.success(res.message);
    setBookings((prev) =>
      prev.map((b) =>
        b._id === bookingId ? { ...b, status: "cancelled" } : b
      )
    );
    } catch (err) {
      console.error("Cancel error:", err);
      toast.error(err.response?.data?.message || "Failed to cancel booking");
    } finally {
      setSelectedBooking(null);
    }
  };

  const today = new Date();
  const upcoming = bookings.filter((b) => {
    const date = b.checkIn || b.dateTime;
    return new Date(date) > today;
  });
  const past = bookings.filter((b) => {
    const date = b.checkOut || b.dateTime;
    return new Date(date) <= today;
  });

  const renderBookings = (list, isUpcoming) => {
    let filtered = list.filter((b) => b.referenceId); 

    if (filterType !== "all") {
      filtered = filtered.filter((b) => b.type === filterType);
    }

    // Sort by date (nearest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.checkIn || a.dateTime);
      const dateB = new Date(b.checkIn || b.dateTime);
      return isUpcoming ? dateA - dateB : dateB - dateA;
    });

    if (filtered.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          No {isUpcoming ? "upcoming" : "past"} bookings found for{" "}
          <strong>{filterType}</strong>
        </div>
      );
    }

    return (
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        {filtered.map((b) => (
          <div
            key={b._id}
            className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
          >
            <div className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Image Section */}
                <div className="relative flex-shrink-0">
                  <img
                    src={
                      b.referenceId?.images?.[0] || "/api/placeholder/200/150"
                    }
                    alt="Listing"
                    className="w-full sm:w-28 h-28 object-cover rounded-xl"
                  />
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                    <span className="text-xs font-medium text-emerald-600">
                      {b.type === "hotel" ? "Hotel" : "Experience"}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                {/* <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
                    {b.referenceId?.title}
                  </h3>

                  <div className="flex items-center text-gray-600 mb-2">
                    <svg
                      className="w-4 h-4 mr-1 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.244a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <p className="text-sm line-clamp-1">
                      {b.referenceId?.location}, {b.referenceId?.area},{" "}
                      {b.referenceId?.state}
                    </p>
                  </div>

                  <div className="flex items-center text-gray-600 mb-2">
                    <svg
                      className="w-4 h-4 mr-1 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="text-sm font-medium">
                      {b.type === "hotel" ? (
                        <>
                          {format(new Date(b.checkIn), "dd MMM")} →{" "}
                          {format(new Date(b.checkOut), "dd MMM yyyy")}
                        </>
                      ) : (
                        format(new Date(b.dateTime), "dd MMM yyyy, h:mm a")
                      )}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-1 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="12 8c-1.2 0-2.5 0-3.8-1-1.7-1.4-3.2-3.5-3.2-6 0-1.3.3-2.5.9-3.5.5-.8 1.2-1.4 2.1-1.8.5-.2 1.1-.3 1.7-.3 2.5 0 4.5 1.8 4.5 4.5 0 2.5-1.8 4.5-4.5 4.5zM12 12c-1.6 0-3.1.3-4.5.8-1.9.9-3.5 2.4-3.5 4.4 0 .9.3 1.7.8 2.3.5.6 1.3.8 2.2.8h10c.9 0 1.7-.2 2.2-.8.5-.6.8-1.4.8-2.3 0-2-1.6-3.5-3.5-4.4-1.4-.5-2.9-.8-4.5-.8z"
                        />
                      </svg>
                      <span className="text-lg font-bold text-emerald-700">
                        ₹{b.totalPrice}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          b.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : b.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {b.status === "cancelled" && (
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        {b.status === "pending" && (
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        {b.status === "confirmed" && (
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  {isUpcoming && b.status === "confirmed" && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <button
                        // onClick={() => handleCancel(b._id)}
                        onClick={() => setSelectedBooking(b)}
                        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Cancel Booking
                      </button>
                    </div>
                  )}
                </div> */}
                {/* Content Section */}
                <div className="flex-1 min-w-0">
                  {/* {!b.referenceId ? (
                    <div className="text-sm text-red-600 italic">
                      This listing has been deleted or is no longer available.
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
                        {b.referenceId.title}
                      </h3>

                      <div className="flex items-center text-gray-600 mb-2">
                        <svg
                          className="w-4 h-4 mr-1 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.244a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <p className="text-sm line-clamp-1">
                          {b.referenceId.location}, {b.referenceId.area},{" "}
                          {b.referenceId.state}
                        </p>
                      </div>
                    </>
                  )} */}
                  {!b.referenceId ? (
                    <div className="text-sm text-red-600 italic">
                      This listing has been deleted or is no longer available.
                    </div>
                  ) : (
                    <>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
                        {b.referenceId.title}
                      </h3>

                      <div className="flex items-center text-gray-600 mb-2">
                        <svg
                          className="w-4 h-4 mr-1 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.244a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <p className="text-sm line-clamp-1">
                          {b.referenceId.location}, {b.referenceId.area},{" "}
                          {b.referenceId.state}
                        </p>
                      </div>

                      <div className="flex items-center text-gray-600 mb-2">
                        <svg
                          className="w-4 h-4 mr-1 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="text-sm font-medium">
                          {b.type === "hotel" ? (
                            <>
                              {format(new Date(b.checkIn), "dd MMM")} →{" "}
                              {format(new Date(b.checkOut), "dd MMM yyyy")}
                            </>
                          ) : (
                            format(new Date(b.dateTime), "dd MMM yyyy, h:mm a")
                          )}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-1 text-emerald-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8c-1.2 0-2.5 0-3.8-1-1.7-1.4-3.2-3.5-3.2-6 0-1.3.3-2.5.9-3.5.5-.8 1.2-1.4 2.1-1.8.5-.2 1.1-.3 1.7-.3 2.5 0 4.5 1.8 4.5 4.5 0 2.5-1.8 4.5-4.5 4.5zM12 12c-1.6 0-3.1.3-4.5.8-1.9.9-3.5 2.4-3.5 4.4 0 .9.3 1.7.8 2.3.5.6 1.3.8 2.2.8h10c.9 0 1.7-.2 2.2-.8.5-.6.8-1.4.8-2.3 0-2-1.6-3.5-3.5-4.4-1.4-.5-2.9-.8-4.5-.8z"
                            />
                          </svg>
                          <span className="text-lg font-bold text-emerald-700">
                            ₹{b.totalPrice}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              b.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : b.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {b.status === "cancelled" && (
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            {b.status === "pending" && (
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            {b.status === "confirmed" && (
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            {b.status.charAt(0).toUpperCase() +
                              b.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Cancel Button */}
                      {isUpcoming && b.status === "confirmed" && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => setSelectedBooking(b)}
                            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200"
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                            Cancel Booking
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-6 px-4 sm:py-10 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              My Bookings
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Track and manage your reservations
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center px-4 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
              <p className="text-gray-500 text-sm sm:text-base">
                Loading your bookings...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Upcoming Bookings Section */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {["all", "hotel", "service", "experience"].map((type) => (
                <button
                  key={type}
                  className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-colors duration-150 ${
                    filterType === type
                      ? "bg-emerald-600 text-white"
                      : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => setFilterType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 sm:p-8">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-full mr-3">
                  <svg
                    className="w-5 h-5 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                  Upcoming Bookings
                </h2>
              
              </div>
              {renderBookings(upcoming, true)}
            </div>

            {/* Past Bookings Section */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 sm:p-8">
              <div className="flex items-center mb-6">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full mr-3">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
                  Past Bookings
                </h2>

              </div>
              {renderBookings(past, false)}
            </div>
          </div>
        )}
      </div>
      {selectedBooking && (
        <CancelBookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onConfirm={(reason) => handleCancel(selectedBooking._id, reason)}
        />
      )}
    </div>
  );
};

export default BookingHistoryPage;

