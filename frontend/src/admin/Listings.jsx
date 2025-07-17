
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import {
  PlusCircle,
  Trash2,
  Pencil,
  MapPin,
  IndianRupee,
  Package,
  Calendar,
  Users,
} from "lucide-react";
import Loader from "../common/Loader";
import AddListingModal from "../admin/AddHotelModal";

// 🔁 Dynamic API URL generator
// const getApiConfig = (type) => {
//   switch (type) {
//     case "hotel":
//       return {
//         fetchUrl: "http://localhost:4000/api/host/hotels",
//         deleteUrl: (id) => `http://localhost:4000/api/host/hotel-delete/${id}`,
//         dataKey: "hotels",
//       };
//     case "services":
//       return {
//         fetchUrl: "http://localhost:4000/api/services/service-listing",
//         deleteUrl: (id) => `http://localhost:4000/api/services/delete/${id}`,
//         dataKey: "services",
//       };
//     case "experiences":
//       return {
//         fetchUrl: "http://localhost:4000/api/experiences/experiences-listing",
//         deleteUrl: (id) => `http://localhost:4000/api/experiences/delete/${id}`,
//         dataKey: "experiences",
//       };
//     default:
//       return {
//         fetchUrl: "",
//         deleteUrl: () => "",
//         dataKey: "listings",
//       };
//   }
// };

// 🔁 Dynamic fetch/delete URL and dataKey generator based on listing type
 const getApiConfig = (type) => {
  const base = "http://localhost:4000/api";

  switch (type) {
    case "hotel":
      return {
        fetchUrl: `${base}/host/hotels`,
        deleteUrl: (id) => `${base}/host/hotel-delete/${id}`,
        dataKey: "hotels",
      };

    case "services":
      return {
        fetchUrl: `${base}/services/service-listing`,
        deleteUrl: (id) => `${base}/services/delete/${id}`,
        dataKey: "services",
      };

    case "experiences":
      return {
        fetchUrl: `${base}/experiences/experiences-listing`,
        deleteUrl: (id) => `${base}/experiences/delete/${id}`,
        dataKey: "experiences",
      };

    default:
      return {
        fetchUrl: "",
        deleteUrl: () => "",
        dataKey: "listings",
      };
  }
};


const Listings = () => {
  const { token, user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const type = Array.isArray(user?.hostType)
    ? user.hostType[0]
    : user?.hostType || "hotel";

  const { fetchUrl, deleteUrl, dataKey } = getApiConfig(type);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await axios.get(fetchUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setListings(res.data[dataKey] || []);
      } catch (err) {
        console.error("Listings fetch error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token && fetchUrl) fetchListings();
  }, [token, fetchUrl, dataKey]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    setDeletingId(id);
    try {
      await axios.delete(deleteUrl(id), {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      alert("Delete failed");
      console.error("Delete error:", err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case "hotel":
        return <Package className="w-5 h-5" />;
      case "services":
        return <Users className="w-5 h-5" />;
      case "experiences":
        return <Calendar className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  if (loading) return <Loader text="Loading your listings..." />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white">
                {getTypeIcon()}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 capitalize">
                  Your {type}s
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">
                  Manage your {type} listings and bookings
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="group flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-4 sm:px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium w-full sm:w-auto justify-center"
            >
              <PlusCircle size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              <span>Add New {type}</span>
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {listings.length === 0 ? (
            <div className="text-center py-20 text-gray-500 font-medium">No {type}s found</div>
          ) : (
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((item, index) => {
                  const isPending = item.status === "pending";
                  const isRejected = item.status === "rejected";

                  return (
                    <div
                      key={item._id}
                      className={`group rounded-2xl shadow-lg border transition-all duration-500 overflow-hidden transform ${
                        isPending || isRejected
                          ? "bg-gray-100 opacity-70 grayscale hover:scale-100 cursor-not-allowed"
                          : "bg-white hover:-translate-y-2 hover:scale-[1.02]"
                      }`}
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: "slideInUp 0.6s ease-out forwards",
                      }}
                    >
                      {/* Image */}
                      <div className="relative">
                        <img
                          src={item.images?.[0] || "https://via.placeholder.com/300"}
                          alt={item.title}
                          className="w-full h-48 sm:h-52 object-cover transition-transform duration-700"
                        />
                      </div>

                      {/* Content */}
                      <div className="p-4 sm:p-5">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 line-clamp-2">
                          {item.title}
                        </h2>

                        {/* Rejection Reason */}
                        {isRejected && (
                          <p className="text-sm text-red-600 font-medium mb-2">
                            Rejected: {item.rejectionReason || "No reason provided"}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                          <MapPin size={14} className="text-gray-400" />
                          <span className="line-clamp-1">{item.location}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1 text-emerald-600 font-bold">
                            <IndianRupee size={16} />
                            <span className="text-lg">
                              {type === "hotel" ? item.pricePerNight : item.pricePerHead}
                            </span>
                          </div>
                          <span className="text-gray-500 text-sm">
                            {type === "hotel" ? "per night" : "per person"}
                          </span>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditData(item)}
                            className="flex-1 flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded-xl py-2.5 px-3 transition-all duration-200 hover:bg-blue-50 font-medium text-sm"
                            disabled={isPending}
                          >
                            <Pencil size={14} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            disabled={deletingId === item._id || isPending}
                            className="flex-1 flex items-center justify-center gap-2 text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 rounded-xl py-2.5 px-3 transition-all duration-200 hover:bg-red-50 font-medium text-sm disabled:opacity-50"
                          >
                            {deletingId === item._id ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 size={14} />
                            )}
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddListingModal
          token={token}
          type={type}
          onClose={() => setShowAddModal(false)}
          onSuccess={(newItem) => setListings((prev) => [newItem, ...prev])}
        />
      )}
      {editData && (
        <AddListingModal
          token={token}
          type={type}
          editMode
          initialData={editData}
          onClose={() => setEditData(null)}
          onSuccess={(updatedItem) => {
            setListings((prev) =>
              prev.map((l) => (l._id === updatedItem._id ? updatedItem : l))
            );
            setEditData(null);
          }}
        />
      )}

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default Listings;

