import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSuperAdmin } from "../contexts/SuperAdminContext";
import { toast } from "react-toastify";
import { fetchRejectedListings as getRejectedListings } from "../api/allAPIs"; // centralized import

const RejectedListingsPage = () => {
  const [listings, setListings] = useState({
    hotels: [],
    services: [],
    experiences: [],
  });
  const [typeFilter, setTypeFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const { token } = useSuperAdmin();

  // useEffect(() => {
  //   fetchRejectedListings();
  // }, []);

  // const fetchRejectedListings = async () => {
  //   try {
  //     setLoading(true);
  //     const res = await axios.get(
  //       "http://localhost:4000/api/super-admin/listings/rejected",
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );
  //     setListings(res.data);
  //   } catch (error) {
  //     console.error("Error fetching rejected listings:", error);
  //     toast.error("Failed to fetch rejected listings");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    fetchRejectedListings();
  }, []);

  const fetchRejectedListings = async () => {
    try {
      setLoading(true);
      const data = await getRejectedListings(token);
      setListings(data);
    } catch (error) {
      console.error("Error fetching rejected listings:", error);
      toast.error("Failed to fetch rejected listings");
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "hotel":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
        );
      case "service":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      case "experience":
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        );
      default:
        return (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        );
    }
  };

  const getFilterIcon = (type) => {
    return getTypeIcon(type);
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const getTotalCount = () => {
    if (typeFilter === "all") {
      return (
        listings.hotels.length +
        listings.services.length +
        listings.experiences.length
      );
    }
    return listings[typeFilter]?.length || 0;
  };

  const getAllData = () => {
    if (typeFilter === "all") {
      return [
        ...listings.hotels.map((item) => ({ ...item, type: "hotel" })),
        ...listings.services.map((item) => ({ ...item, type: "service" })),
        ...listings.experiences.map((item) => ({
          ...item,
          type: "experience",
        })),
      ];
    } else {
      const typeMap = {
        hotels: "hotel",
        services: "service",
        experiences: "experience",
      };
      const key = Object.keys(typeMap).find((k) => typeMap[k] === typeFilter);
      return (
        listings[key]?.map((item) => ({ ...item, type: typeFilter })) || []
      );
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6 flex flex-col">
      <style>{`
        .smooth-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .smooth-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        .smooth-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #dc2626, #ef4444);
          border-radius: 10px;
          border: 2px solid #f1f5f9;
        }
        
        .smooth-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #b91c1c, #dc2626);
        }
        
        .smooth-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #dc2626 #f1f5f9;
          scroll-behavior: smooth;
        }
      `}</style>

      {/* Header */}
      <div className="mb-6 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg
              className="w-6 h-6 text-white"
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
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
            Rejected Listings
          </h2>
        </div>
        <p className="text-slate-600 ml-13">
          View and manage all rejected listings
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="mb-6 flex-shrink-0">
        <div className="flex flex-wrap gap-3">
          {[
            { key: "all", label: "All", count: getTotalCount() },
            { key: "hotels", label: "Hotels", count: listings.hotels.length },
            {
              key: "services",
              label: "Services",
              count: listings.services.length,
            },
            {
              key: "experiences",
              label: "Experiences",
              count: listings.experiences.length,
            },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setTypeFilter(filter.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 ${
                typeFilter === filter.key
                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg border-transparent transform scale-105"
                  : "bg-white text-slate-700 hover:bg-slate-50 hover:shadow-md border-slate-200 hover:border-red-300"
              }`}
            >
              <span
                className={
                  typeFilter === filter.key ? "text-white" : "text-slate-500"
                }
              >
                {filter.key === "all" ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                ) : (
                  getFilterIcon(filter.key.slice(0, -1))
                )}
              </span>
              <span>
                {filter.label} ({filter.count})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content - Scrollable Section */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto smooth-scrollbar p-5">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-600 font-medium">
                  Loading rejected listings...
                </p>
              </div>
            </div>
          ) : getAllData().length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-slate-400"
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
              </div>
              <p className="text-slate-500 text-lg font-medium">
                No rejected {typeFilter === "all" ? "listings" : typeFilter}{" "}
                found
              </p>
              <p className="text-slate-400 text-sm mt-1">
                All listings are either approved or pending review
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
              {getAllData().map((item) => (
                <div
                  key={item._id}
                  className="bg-white border border-slate-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover:scale-105 cursor-pointer group relative"
                >
                  {/* Card Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl flex items-center justify-center group-hover:from-red-500 group-hover:to-red-600 transition-all duration-300 flex-shrink-0">
                          <span className="text-slate-600 group-hover:text-white transition-colors duration-300">
                            {getTypeIcon(item.type)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3
                            className="text-lg font-bold text-slate-800 group-hover:text-red-600 transition-colors duration-300 truncate"
                            title={item.title}
                          >
                            {truncateText(item.title, 20)}
                          </h3>
                          <p className="text-sm text-slate-500 capitalize">
                            {item.type}
                          </p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold border flex-shrink-0 bg-red-100 text-red-800 border-red-200">
                        REJECTED
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mb-4">
                      <span className="text-2xl font-bold text-red-600">
                        ₹{item.pricePerNight || item.pricePerHead}
                      </span>
                      <span className="text-slate-500 text-sm ml-1">
                        per {item.type === "hotel" ? "night" : "head"}
                      </span>
                    </div>

                    {/* Location */}
                    <div className="flex items-center space-x-2 text-slate-600 mb-4 min-w-0">
                      <svg
                        className="w-4 h-4 text-slate-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span
                        className="text-sm truncate"
                        title={`${item.state}, ${item.location}`}
                      >
                        <span className="font-medium">
                          {truncateText(item.state, 10)}
                        </span>
                        , {truncateText(item.location, 15)}
                      </span>
                    </div>

                    {/* Host Info */}
                    <div className="flex items-center space-x-2 text-slate-600 mb-4 min-w-0">
                      <svg
                        className="w-4 h-4 text-slate-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <div className="text-sm min-w-0 flex-1">
                        <div
                          className="font-medium truncate"
                          title={item.host?.username || item.host?.name}
                        >
                          {truncateText(
                            item.host?.username || item.host?.name,
                            15
                          )}
                        </div>
                        <div
                          className="text-slate-500 text-xs truncate"
                          title={item.host?.email}
                        >
                          {truncateText(item.host?.email, 20)}
                        </div>
                      </div>
                    </div>

                    {/* Rejection Reason */}
                    {item.rejectionReason && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <p className="text-xs text-red-600 font-medium mb-1">
                          Rejection Reason
                        </p>
                        <p className="text-sm text-red-700">
                          {truncateText(item.rejectionReason, 60)}
                        </p>
                      </div>
                    )}

                    {/* Additional Info */}
                    {item.duration && (
                      <div className="flex items-center space-x-2 text-slate-600 mb-2">
                        <svg
                          className="w-4 h-4 text-slate-400 flex-shrink-0"
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
                        <span className="text-sm">
                          Duration: {item.duration}
                        </span>
                      </div>
                    )}

                    {item.maxGuests && (
                      <div className="flex items-center space-x-2 text-slate-600 mb-2">
                        <svg
                          className="w-4 h-4 text-slate-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                        <span className="text-sm">
                          Max {item.maxGuests} guests
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="bg-gradient-to-r from-red-50 to-red-100 px-6 py-4 border-t border-red-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="text-xs text-red-600">Rejected</span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {item._id}
                      </div>
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RejectedListingsPage;
