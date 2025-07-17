import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSuperAdmin } from "../contexts/SuperAdminContext";
import { toast } from "react-toastify";
import {
  fetchPendingListings,
  approveListing,
  rejectListing,
} from "../api/allAPIs"; // centralized API path


const PendingListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [allListings, setAllListings] = useState({
    hotels: [],
    services: [],
    experiences: [],
  });
  const [typeFilter, setTypeFilter] = useState("hotel");
  const [loading, setLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const { token } = useSuperAdmin();

  // const fetchListings = async () => {
  //   if (!token) return;
  //   try {
  //     setLoading(true);
  //     const res = await axios.get(
  //       `http://localhost:4000/api/super-admin/listings/pending?type=${typeFilter}`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     const data = res.data;
  //     setAllListings(data);
  //     const currentData = data[typeFilter + "s"] || [];
  //     setListings(currentData.map((item) => ({ ...item, type: typeFilter })));
  //   } catch (err) {
  //     console.error("Failed to fetch pending listings", err);
  //     toast.error("Failed to load listings");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchListings();
  // }, [typeFilter, token]);

  // const handleApprove = async (id, type) => {
  //   try {
  //     await axios.put(
  //       `http://localhost:4000/api/super-admin/listing/${type}/${id}/approve`,
  //       {},
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     toast.success("Listing approved");
  //     setListings((prev) => prev.filter((item) => item._id !== id));

  //     // Update allListings count
  //     setAllListings((prev) => ({
  //       ...prev,
  //       [type + "s"]: prev[type + "s"].filter((item) => item._id !== id),
  //     }));
  //   } catch (err) {
  //     console.error("Failed to approve listing", err);
  //     toast.error("Approval failed");
  //   }
  // };

  // const handleReject = async (id, type) => {
  //   const reason = prompt("Enter rejection reason:");
  //   if (!reason) return;
  //   try {
  //     await axios.put(
  //       `http://localhost:4000/api/super-admin/listing/${type}/${id}/reject`,
  //       { reason },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );
  //     toast.success("Listing rejected");
  //     setListings((prev) => prev.filter((item) => item._id !== id));

  //     // Update allListings count
  //     setAllListings((prev) => ({
  //       ...prev,
  //       [type + "s"]: prev[type + "s"].filter((item) => item._id !== id),
  //     }));
  //   } catch (err) {
  //     console.error("Failed to reject listing", err);
  //     toast.error("Rejection failed");
  //   }
  // };


const fetchListings = async () => {
  if (!token) return;
  try {
    setLoading(true);
    const data = await fetchPendingListings(token, typeFilter);
    setAllListings(data);
    const currentData = data[typeFilter + "s"] || [];
    setListings(currentData.map((item) => ({ ...item, type: typeFilter })));
  } catch (err) {
    console.error("Failed to fetch pending listings", err);
    toast.error("Failed to load listings");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchListings();
}, [typeFilter, token]);

const handleApprove = async (id, type) => {
  try {
    await approveListing(token, type, id);
    toast.success("Listing approved");
    setListings((prev) => prev.filter((item) => item._id !== id));
    setAllListings((prev) => ({
      ...prev,
      [type + "s"]: prev[type + "s"].filter((item) => item._id !== id),
    }));
  } catch (err) {
    console.error("Failed to approve listing", err);
    toast.error("Approval failed");
  }
};

const handleReject = async (id, type) => {
  const reason = prompt("Enter rejection reason:");
  if (!reason) return;
  try {
    await rejectListing(token, type, id, reason);
    toast.success("Listing rejected");
    setListings((prev) => prev.filter((item) => item._id !== id));
    setAllListings((prev) => ({
      ...prev,
      [type + "s"]: prev[type + "s"].filter((item) => item._id !== id),
    }));
  } catch (err) {
    console.error("Failed to reject listing", err);
    toast.error("Rejection failed");
  }
};



  const handleDocumentClick = (doc) => {
    setSelectedDocument(doc);
    setShowDocumentModal(true);
  };

  const closeDocumentModal = () => {
    setSelectedDocument(null);
    setShowDocumentModal(false);
  };

  const getCounts = () => {
    return {
      hotel: allListings.hotels?.length || 0,
      service: allListings.services?.length || 0,
      experience: allListings.experiences?.length || 0,
    };
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

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const counts = getCounts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Custom Styles */}
      <style>{`
      .smooth-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      .smooth-scrollbar::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 10px;
      }
      .smooth-scrollbar::-webkit-scrollbar-thumb {
        background: linear-gradient(to bottom, #14b8a6, #10b981);
        border-radius: 10px;
        border: 2px solid #f1f5f9;
      }
      .smooth-scrollbar::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(to bottom, #0f766e, #059669);
      }
      .smooth-scrollbar {
        scrollbar-width: thin;
        scrollbar-color: #14b8a6 #f1f5f9;
        scroll-behavior: smooth;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes scaleIn {
        from { opacity: 0; transform: scale(0.95); }
        to { opacity: 1; transform: scale(1); }
      }
      .animate-fadeIn {
        animation: fadeIn 0.3s ease-out;
      }
      .animate-scaleIn {
        animation: scaleIn 0.3s ease-out;
      }
      .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .backdrop-blur {
        backdrop-filter: blur(10px);
      }
    `}</style>

      {/* Main Container */}
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <header className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
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
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  Pending Listings
                </h1>
                <p className="text-slate-600 mt-1">
                  Review and approve pending listings from hosts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-slate-200 shadow-lg">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-slate-700">
                {listings.length} pending approval
                {listings.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </header>

        {/* Filter Tabs */}
        <nav className="mb-8">
          <div className="flex flex-wrap gap-3">
            {["hotel", "service", "experience"].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  typeFilter === type
                    ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg border-transparent transform scale-105"
                    : "bg-white text-slate-700 hover:bg-slate-50 hover:shadow-md border-slate-200 hover:border-teal-300"
                }`}
              >
                <span
                  className={
                    typeFilter === type ? "text-white" : "text-slate-500"
                  }
                >
                  {getTypeIcon(type)}
                </span>
                <span>{type.charAt(0).toUpperCase() + type.slice(1)}s</span>
                {getCounts()[type] > 0 && (
                  <span
                    className={`inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full ml-2 ${
                      typeFilter === type
                        ? "bg-white/30 text-white"
                        : "bg-teal-500 text-white"
                    }`}
                  >
                    {getCounts()[type]}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        <main className="min-h-[60vh] max-h-[80vh] overflow-y-auto p-3 md:p-6 scrollbar-thin scrollbar-thumb-indigo-500 scrollbar-track-gray-200 hover:scrollbar-thumb-indigo-600">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600 font-medium text-sm">
                  Loading pending listings...
                </p>
              </div>
            </div>
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <p className="text-gray-600 font-medium">
                No pending {typeFilter}s found
              </p>
              <p className="text-gray-500 text-sm">
                All {typeFilter}s have been reviewed
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 overflow-hidden group"
                >
                  {/* Mobile Layout */}
                  <div className="lg:hidden">
                    {/* Mobile Image Section */}
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      {item.images?.length > 0 ? (
                        <div className="relative w-full h-full">
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onClick={() =>
                              setSelectedImage({
                                images: item.images,
                                currentIndex: 0,
                              })
                            }
                          />
                          {item.images.length > 1 && (
                            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs">
                              +{item.images.length - 1}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <svg
                            className="w-16 h-16 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                      <div className="absolute top-2 left-2 flex gap-1">
                        <span className="px-2 py-1 bg-indigo-600 text-white rounded-full text-xs font-medium capitalize">
                          {item.type}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Content */}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1 pr-2">
                          {item.title}
                        </h3>
                        <div className="text-right flex-shrink-0">
                          <div className="text-lg font-bold text-green-600">
                            ₹{item.pricePerNight || item.pricePerHead}
                          </div>
                          <div className="text-xs text-gray-500">
                            /{item.type === "hotel" ? "night" : "head"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center text-gray-500 text-xs mb-3">
                        <svg
                          className="w-3 h-3 mr-1"
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
                        {truncateText(item.state, 10)},{" "}
                        {truncateText(item.location, 12)}
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-3">
                        <div className="bg-gray-50 p-2 rounded text-center">
                          <div className="text-xs text-gray-500 mb-1">
                            {item.type === "service"
                              ? "Category"
                              : item.type === "experience"
                              ? "Duration"
                              : "Type"}
                          </div>
                          <div className="text-xs font-medium text-gray-900 truncate">
                            {item.category || item.duration || item.type}
                          </div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded text-center">
                          <div className="text-xs text-gray-500 mb-1">
                            {item.type === "service" ? "Duration" : "Capacity"}
                          </div>
                          <div className="text-xs font-medium text-gray-900">
                            {item.duration ||
                              (item.maxGuests ? `${item.maxGuests}` : "N/A")}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center bg-gray-50 p-2 rounded mb-3">
                        <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          {item.host?.profileImage ? (
                            <img
                              src={item.host.profileImage}
                              alt={item.host.username}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <svg
                              className="w-3 h-3 text-indigo-600"
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
                          )}
                        </div>
                        <div className="ml-2 flex-1 min-w-0">
                          <div className="text-xs font-medium text-gray-900 truncate">
                            {item.host?.username}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {item.host?.email}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                              item.host?.isHostApproved
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {item.host?.isHostApproved ? "✓" : "⏳"}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                              item.host?.isKycSubmitted
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {item.host?.isKycSubmitted ? "KYC" : "No KYC"}
                          </span>
                        </div>
                      </div>

                      {item.highlights?.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs font-medium text-gray-700 mb-1">
                            Highlights:
                          </div>
                          <div className="space-y-1">
                            {item.highlights
                              .slice(0, 2)
                              .map((highlight, idx) => (
                                <div key={idx} className="flex items-start">
                                  <div className="w-1 h-1 bg-indigo-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                                  <span className="text-xs text-gray-600 line-clamp-1">
                                    {highlight}
                                  </span>
                                </div>
                              ))}
                            {item.highlights.length > 2 && (
                              <div className="text-xs text-gray-500 ml-3">
                                +{item.highlights.length - 2} more
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {item.documents?.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs font-medium text-gray-700 mb-1">
                            Documents:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {item.documents.slice(0, 2).map((doc, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleDocumentClick(doc)}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition-colors"
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                {truncateText(doc.docType, 8)}
                              </button>
                            ))}
                            {item.documents.length > 2 && (
                              <span className="text-xs text-gray-500 px-2 py-1">
                                +{item.documents.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {item.aboutHost && (
                        <div className="mb-3">
                          <div className="text-xs font-medium text-gray-700 mb-1">
                            About Host:
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {item.aboutHost}
                          </p>
                        </div>
                      )}

                      <div className="flex justify-between text-xs text-gray-500 mb-3 border-t pt-2">
                        <span>
                          Created:{" "}
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        <span>
                          Updated:{" "}
                          {new Date(item.updatedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(item._id, item.type)}
                          className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-1"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(item._id, item.type)}
                          className="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-1"
                        >
                          <svg
                            className="w-4 h-4"
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
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden lg:flex">
                    {/* Left Side - Image */}
                    <div className="w-80 flex-shrink-0 relative">
                      <div className="h-full bg-gray-100 overflow-hidden">
                        {item.images?.length > 0 ? (
                          <div className="relative w-full h-full">
                            <img
                              src={item.images[0]}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onClick={() =>
                                setSelectedImage({
                                  images: item.images,
                                  currentIndex: 0,
                                })
                              }
                            />
                            {item.images.length > 1 && (
                              <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-sm">
                                +{item.images.length - 1}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <svg
                              className="w-20 h-20 text-gray-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm font-medium capitalize">
                            {item.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Content */}
                    <div className="flex-1 flex flex-col">
                      {/* Header */}
                      <div className="p-5 border-b border-gray-100">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 pr-4">
                            <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                              {item.title}
                            </h2>
                            <div className="flex items-center text-gray-500 text-sm mb-2">
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
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              {truncateText(item.state, 15)},{" "}
                              {truncateText(item.location, 20)}
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {item.description || "No description available"}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-3xl font-bold text-green-600">
                              ₹{item.pricePerNight || item.pricePerHead}
                            </div>
                            <div className="text-gray-500 text-sm">
                              per {item.type === "hotel" ? "night" : "head"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="flex-1 p-5">
                        <div className="grid grid-cols-2 gap-8">
                          {/* Left Column */}
                          <div className="space-y-4">
                            {/* Quick Info */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                                  {item.type === "service"
                                    ? "Category"
                                    : item.type === "experience"
                                    ? "Duration"
                                    : "Type"}
                                </div>
                                <div className="text-sm font-semibold text-gray-900 capitalize">
                                  {item.category || item.duration || item.type}
                                </div>
                              </div>
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">
                                  {item.type === "service"
                                    ? "Duration"
                                    : "Capacity"}
                                </div>
                                <div className="text-sm font-semibold text-gray-900">
                                  {item.duration ||
                                    (item.maxGuests
                                      ? `${item.maxGuests} guests`
                                      : "N/A")}
                                </div>
                              </div>
                            </div>

                            {/* Host Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  {item.host?.profileImage ? (
                                    <img
                                      src={item.host.profileImage}
                                      alt={item.host.username}
                                      className="w-12 h-12 rounded-full object-cover"
                                    />
                                  ) : (
                                    <svg
                                      className="w-6 h-6 text-indigo-600"
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
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold text-gray-900 truncate">
                                    {item.host?.username}
                                  </div>
                                  <div className="text-sm text-gray-500 truncate">
                                    {item.host?.email}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      item.host?.isHostApproved
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {item.host?.isHostApproved
                                      ? "Approved"
                                      : "Pending"}
                                  </span>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      item.host?.isKycSubmitted
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {item.host?.isKycSubmitted
                                      ? "KYC Done"
                                      : "KYC Pending"}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* About Host */}
                            {item.aboutHost && (
                              <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <svg
                                    className="w-4 h-4 text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  About Host
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-3">
                                  {item.aboutHost}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Right Column */}
                          <div className="space-y-4">
                            {/* Highlights */}
                            {item.highlights?.length > 0 && (
                              <div>
                                <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <svg
                                    className="w-4 h-4 text-gray-500"
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
                                  Highlights
                                </div>
                                <div className="space-y-2">
                                  {item.highlights
                                    .slice(0, 4)
                                    .map((highlight, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-start gap-2"
                                      >
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <p className="text-sm text-gray-600">
                                          {highlight}
                                        </p>
                                      </div>
                                    ))}
                                  {item.highlights.length > 4 && (
                                    <div className="text-sm text-gray-500 ml-3.5">
                                      +{item.highlights.length - 4} more
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Documents */}
                            {item.documents?.length > 0 && (
                              <div>
                                <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <svg
                                    className="w-4 h-4 text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                  </svg>
                                  Documents
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {item.documents
                                    .slice(0, 4)
                                    .map((doc, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => handleDocumentClick(doc)}
                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                                      >
                                        <svg
                                          className="w-3 h-3"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                          />
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                          />
                                        </svg>
                                        {truncateText(doc.docType, 12)}
                                      </button>
                                    ))}
                                  {item.documents.length > 4 && (
                                    <span className="text-sm text-gray-500 px-3 py-1.5">
                                      +{item.documents.length - 4} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Timestamps */}
                            <div className="border-t pt-3">
                              <div className="flex justify-between text-sm text-gray-500">
                                <div>
                                  <span className="font-medium">Created:</span>{" "}
                                  {new Date(
                                    item.createdAt
                                  ).toLocaleDateString()}
                                </div>
                                <div>
                                  <span className="font-medium">Updated:</span>{" "}
                                  {new Date(
                                    item.updatedAt
                                  ).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="p-5 bg-gray-50 border-t border-gray-100">
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(item._id, item.type)}
                            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(item._id, item.type)}
                            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <svg
                              className="w-4 h-4"
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
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            {/* Close Button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-all duration-200 group"
            >
              <svg
                className="w-6 h-6 text-white group-hover:scale-110 transition-transform"
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
            </button>

            {/* Image Container */}
            <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={selectedImage.images[selectedImage.currentIndex]}
                alt={`Preview ${selectedImage.currentIndex + 1}`}
                className="w-full h-auto max-h-[70vh] object-contain"
              />

              {/* Navigation */}
              {selectedImage.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setSelectedImage((prev) => ({
                        ...prev,
                        currentIndex:
                          prev.currentIndex === 0
                            ? prev.images.length - 1
                            : prev.currentIndex - 1,
                      }))
                    }
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-all duration-200"
                  >
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={() =>
                      setSelectedImage((prev) => ({
                        ...prev,
                        currentIndex:
                          prev.currentIndex === prev.images.length - 1
                            ? 0
                            : prev.currentIndex + 1,
                      }))
                    }
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-all duration-200"
                  >
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/50 text-white rounded-full text-sm">
                {selectedImage.currentIndex + 1} / {selectedImage.images.length}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {selectedImage.images.length > 1 && (
              <div className="mt-4 flex justify-center gap-2 overflow-x-auto pb-2">
                {selectedImage.images.map((image, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      setSelectedImage((prev) => ({
                        ...prev,
                        currentIndex: idx,
                      }))
                    }
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      idx === selectedImage.currentIndex
                        ? "border-teal-500 scale-110"
                        : "border-white/50 hover:border-white/80"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {showDocumentModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-2 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-h-[98vh] overflow-hidden shadow-2xl border border-slate-200 animate-scaleIn">
            {/* Modal Header */}
            <header className="flex justify-between items-center p-6 border-b border-slate-200 bg-gradient-to-r from-teal-50 to-emerald-50">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-teal-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Document Preview
              </h2>
              <button
                onClick={() => setShowDocumentModal(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors duration-200"
              >
                <svg
                  className="w-6 h-6 text-slate-500"
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
              </button>
            </header>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[calc(98vh-180px)] overflow-y-auto smooth-scrollbar">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="font-semibold text-slate-800 mb-2">
                  Document Information
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Type:</span>
                    <span className="ml-2 font-medium text-slate-800">
                      {selectedDocument.docType}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Format:</span>
                    <span className="ml-2 font-medium text-slate-800">
                      {selectedDocument.url.split(".").pop().toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Document Viewer */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <iframe
                  src={selectedDocument.url}
                  className="w-full border-0 rounded-xl"
                  title="Document Preview"
                  style={{ minHeight: "700px", height: "calc(100vh - 400px)" }}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <footer className="px-6 py-4 bg-slate-50 border-t border-slate-200">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDocumentModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200"
                >
                  Close
                </button>
                <a
                  href={selectedDocument.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-lg hover:from-teal-600 hover:to-emerald-600 transition-all duration-200 font-medium"
                >
                  Open in New Tab
                </a>
              </div>
            </footer>
          </div>
        </div>
      )}
      
    
    </div>
  );
};

export default PendingListingsPage;
