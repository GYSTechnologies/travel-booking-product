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
const getApiConfig = (type) => {
  switch (type) {
    case "hotel":
      return {
        fetchUrl: "http://localhost:4000/api/host/hotels",
        deleteUrl: (id) => `http://localhost:4000/api/host/hotel-delete/${id}`,
        dataKey: "hotels",
      };
    case "services":
      return {
        fetchUrl: "http://localhost:4000/api/services/service-listing",
        deleteUrl: (id) => `http://localhost:4000/api/services/delete/${id}`,
        dataKey: "services",
      };
    case "experiences":
      return {
        fetchUrl: "http://localhost:4000/api/experiences/experiences-listing",
        deleteUrl: (id) => `http://localhost:4000/api/experiences/delete/${id}`,
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

  // ✅ Robust host type check
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
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8 border border-gray-100 backdrop-blur-sm">
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
              <PlusCircle
                size={20}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
              <span>Add New {type}</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-6">
                {getTypeIcon()}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                No {type}s found
              </h3>
              <p className="text-gray-500 text-center max-w-md px-4">
                Start by adding your first {type} listing to begin receiving
                bookings.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-6 flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
              >
                <PlusCircle size={20} />
                Add Your First {type}
              </button>
            </div>
          ) : (
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {listings.map((item, index) => (
                  <div
                    key={item._id}
                    className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden transform hover:-translate-y-2 hover:scale-[1.02]"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: "slideInUp 0.6s ease-out forwards",
                    }}
                  >
                    {/* Image Container */}
                    <div className="relative overflow-hidden">
                      <img
                        src={
                          item.images?.[0] || "https://via.placeholder.com/300"
                        }
                        alt={item.title}
                        className="w-full h-48 sm:h-52 object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                      {/* Quick Actions Overlay */}
                      <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => setEditData(item)}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-blue-600 hover:bg-blue-50 transition-colors duration-200 shadow-lg hover:shadow-xl"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          disabled={deletingId === item._id}
                          className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-600 hover:bg-red-50 transition-colors duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                        >
                          {deletingId === item._id ? (
                            <div className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-5">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-green-700 transition-colors duration-300">
                        {item.title}
                      </h2>

                      <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="line-clamp-1">{item.location}</span>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1 text-emerald-600 font-bold">
                          <IndianRupee size={16} />
                          <span className="text-lg">
                            {type === "hotel"
                              ? item.pricePerNight
                              : item.pricePerHead}
                          </span>
                        </div>
                        <span className="text-gray-500 text-sm">
                          {type === "hotel" ? "per night" : "per person"}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditData(item)}
                          className="flex-1 flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 rounded-xl py-2.5 px-3 transition-all duration-200 hover:bg-blue-50 font-medium text-sm"
                        >
                          <Pencil size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          disabled={deletingId === item._id}
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
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <AddListingModal
          token={token}
          type={type} // hotel | services | experiences
          onClose={() => setShowAddModal(false)}
          onSuccess={(newItem) => setListings((prev) => [newItem, ...prev])}
        />
      )}

      {/* Edit Modal */}
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
