import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { format } from "date-fns";
import {
  fetchDashboardBookings,
  cancelBookingByHost,
} from "../api/allAPIs";


const BookingTable = () => {
  const { user, token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [range, setRange] = useState("30d");
  const [loading, setLoading] = useState(true);

  const type = user?.hostType?.[0] || "hotel";
//get api
  const getApiUrl = () => {
    const base = "http://localhost:4000/api";
    if (type === "hotel") return `${base}/host/dashboard/bookings`;
    if (type === "services") return `${base}/services/dashboard/bookings`;
    if (type === "experiences") return `${base}/experiences/dashboard/bookings`;
    return "";
  };

  // const fetchBookings = async () => {
  //   setLoading(true);
  //   try {
  //     const res = await axios.get(`${getApiUrl()}?range=${range}`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     setBookings(res.data?.data?.bookings || []);
  //   } catch (err) {
  //     console.error("Error fetching bookings:", err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchBookings = async () => {
  setLoading(true);
  try {
    const bookings = await fetchDashboardBookings(token, type, range);
    setBookings(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err.message);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  if (token && user) fetchBookings();
}, [token, user, range, type]);


  // const handleCancel = async (bookingId) => {
  //   const reason = prompt("Enter reason for cancellation (optional):") || "";
  //   if (!window.confirm("Are you sure you want to cancel this booking?"))
  //     return;

  //   try {
  //     const cancelUrl =
  //       type === "hotel"
  //         ? `http://localhost:4000/api/host/bookings/${bookingId}/cancel-by-host`
  //         : `http://localhost:4000/api/${type}/bookings/${bookingId}/cancel-by-host`;

  //     const res = await axios.put(
  //       cancelUrl,
  //       { reason },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     alert(res.data.message || "Booking cancelled");

  //     setBookings((prev) =>
  //       prev.map((b) =>
  //         b._id === bookingId ? { ...b, status: "cancelled" } : b
  //       )
  //     );
  //   } catch (err) {
  //     alert(err.response?.data?.message || "Error cancelling booking");
  //   }
  // };

  
const handleCancel = async (bookingId) => {
  const reason = prompt("Enter reason for cancellation (optional):") || "";
  if (!window.confirm("Are you sure you want to cancel this booking?")) return;

  try {
    const res = await cancelBookingByHost(token, type, bookingId, reason);
    alert(res.message || "Booking cancelled");

    setBookings((prev) =>
      prev.map((b) =>
        b._id === bookingId ? { ...b, status: "cancelled" } : b
      )
    );
  } catch (err) {
    alert(err.response?.data?.message || "Error cancelling booking");
  }
};
  const today = new Date();

  const upcomingBookings = bookings.filter((b) => {
    if (b.status !== "confirmed") return true;
    if (type === "hotel") return new Date(b.checkOut) >= today;
    return new Date(b.dateTime) >= today;
  });

  const completedBookings = bookings.filter((b) => {
    if (b.status !== "confirmed") return false;
    if (type === "hotel") return new Date(b.checkOut) < today;
    return new Date(b.dateTime) < today;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 capitalize mb-2">
                {type} Bookings
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Manage your booking reservations
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                Filter by:
              </span>
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="bg-white border-2 border-gray-200 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 shadow-sm w-full sm:w-auto"
              >
                <option value="today">Today</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 text-base sm:text-lg font-medium">
                Loading bookings...
              </p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3m-3 3h3m-3 0v-3m-3 3h3m-3 0v-3m-3 3h3m-3 0v-3"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-base sm:text-lg font-medium text-center px-4">
                No bookings found for selected range.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ongoing Bookings */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 flex flex-col">
                  <h3 className="text-xl font-semibold text-blue-700 mb-4">
                    Ongoing / Upcoming Bookings
                  </h3>

                  {upcomingBookings.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-500 italic text-center min-h-[200px]">
                      No ongoing bookings found for the selected range.
                    </div>
                  ) : (
                    <div
                      className="overflow-y-auto space-y-4 pr-2"
                      style={{ maxHeight: "500px" }}
                    >
                      {upcomingBookings.map((b) => (
                        <div
                          key={b._id}
                          className="border border-gray-100 rounded-xl p-4 bg-gray-50 shadow-sm"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold text-gray-800">
                                {b.user?.username || "—"}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {type === "hotel"
                                  ? `${format(
                                      new Date(b.checkIn),
                                      "dd MMM"
                                    )} → ${format(
                                      new Date(b.checkOut),
                                      "dd MMM"
                                    )}`
                                  : format(
                                      new Date(b.dateTime),
                                      "dd MMM, h:mm a"
                                    )}
                              </p>
                            </div>
                            <div className="text-green-700 font-bold text-sm">
                              ₹{b.totalPrice}
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-100 border border-green-200 text-green-700">
                              {b.status}
                            </span>
                            {b.status === "confirmed" && (
                              <button
                                onClick={() => handleCancel(b._id)}
                                className="text-xs px-3 py-1 border border-red-300 text-red-600 rounded-full hover:bg-red-50 transition"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Completed Bookings */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5 flex flex-col">
                  <h3 className="text-xl font-semibold text-green-700 mb-4">
                    Completed Bookings
                  </h3>

                  {completedBookings.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-500 italic text-center min-h-[200px]">
                      No completed bookings found for the selected range.
                    </div>
                  ) : (
                    <div
                      className="overflow-y-auto space-y-4 pr-2"
                      style={{ maxHeight: "500px" }}
                    >
                      {completedBookings.map((b) => (
                        <div
                          key={b._id}
                          className="border border-gray-100 rounded-xl p-4 bg-gray-50 shadow-sm"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-semibold text-gray-800">
                                {b.user?.username || "—"}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {type === "hotel"
                                  ? `${format(
                                      new Date(b.checkIn),
                                      "dd MMM"
                                    )} → ${format(
                                      new Date(b.checkOut),
                                      "dd MMM"
                                    )}`
                                  : format(
                                      new Date(b.dateTime),
                                      "dd MMM, h:mm a"
                                    )}
                              </p>
                            </div>
                            <div className="text-green-700 font-bold text-sm">
                              ₹{b.totalPrice}
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-100 border border-green-200 text-green-700">
                              completed
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingTable;
