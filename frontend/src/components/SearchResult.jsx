
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ImageCarousel from "../components/ImageCarousel "



const fallbackImage = "https://via.placeholder.com/400x250?text=Listing";

const SearchResults = ({
  results = [],
  loading,
  searchData = {},
  type = "hotel",
}) => {
  const navigate = useNavigate();

  if (loading) {
    return <div className="text-center py-8">Searching {type}s...</div>;
  }

  if (!results || results.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">No {type}s found.</div>
    );
  }

  const handleCardClick = (id) => {
    const params = new URLSearchParams({
      checkIn: searchData.checkIn || "",
      checkOut: searchData.checkOut || "",
      guests: searchData.guests || 1,
    }).toString();

    navigate(`/${type}/${id}?${params}`);
  };

  const getPrice = (item) =>
    type === "hotel" ? item.pricePerNight : item.pricePerHead;

  const getAvailabilityValue = (item) =>
    type === "hotel" ? item.availableRooms : item.maxGuests;

  const getAvailabilityLabel = (item) =>
    getAvailabilityValue(item) > 0 ? "Available" : "Sold Out";

  const getAvailabilityColor = (item) =>
    getAvailabilityValue(item) > 0 ? "text-green-600" : "text-red-500";

  const getUnit = () => (type === "hotel" ? "/ night" : "/ person");

  return (
    <div className="mt-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800 capitalize">
        Search Results for {type}s
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {results.map((item, index) => (
          <motion.div
            key={item._id || index}
            className="bg-white border border-gray-100 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            onClick={() => handleCardClick(item._id)}
          >
            <ImageCarousel
              images={item.images?.length ? item.images : [fallbackImage]}
            />

            <div className="p-4 space-y-1">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {item.title}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-1">
                {item.location}
              </p>

              <p className="text-sm font-medium text-gray-800 mt-1">
                ₹{getPrice(item)}{" "}
                <span className="text-gray-500">{getUnit()}</span>
              </p>

              <p
                className={`text-xs font-semibold mt-1 ${getAvailabilityColor(
                  item
                )}`}
              >
                {getAvailabilityLabel(item)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
