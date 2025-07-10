
import React from "react";
import { useNavigate } from "react-router-dom";

const PopularHotelSection = ({ groupedHotels = {}, searchData = {} }) => {
  const navigate = useNavigate();
  const fallbackImage = "https://via.placeholder.com/300x200?text=No+Image";

  const handleClick = (hotelId) => {
    const params = new URLSearchParams({
      checkIn: searchData.checkIn || "",
      checkOut: searchData.checkOut || "",
      guests: searchData.guests || 1,
    }).toString();

    navigate(`/hotel/${hotelId}?${params}`);
  };

  return (
    <div className="space-y-8 sm:space-y-16 py-4 sm:py-8 px-4 sm:px-0">
      {Object.entries(groupedHotels).map(([state, hotels]) => (
        <div key={state} className="relative">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
            <div className="mb-3 sm:mb-0">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                Popular Hotels in {state}
              </h2>
              <div className="w-12 sm:w-16 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
            </div>
            <div className="text-xs sm:text-sm text-gray-500 font-medium">
              {hotels.length} hotels found
            </div>
          </div>

          {/* Hotels Grid */}
          <div className="flex gap-3 sm:gap-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
            {hotels.map((hotel, index) => (
              <div
                key={hotel._id}
                onClick={() => handleClick(hotel._id)}
                className="min-w-[260px] sm:min-w-[280px] lg:min-w-[320px] max-w-sm bg-white/80 backdrop-blur-lg border border-white/20 rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 group cursor-pointer transform hover:-translate-y-1 flex-shrink-0"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Image Container */}
                <div className="relative h-40 sm:h-48 lg:h-56 overflow-hidden rounded-t-xl sm:rounded-t-2xl">
                  <img
                    src={hotel.images?.[0] || fallbackImage}
                    alt={hotel.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-lg">
                    ₹{hotel.pricePerNight}/night
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-emerald-600 transition-colors duration-200">
                    {hotel.title}
                  </h3>
                  <div className="flex items-center text-gray-600 mb-3">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
                    </svg>
                    <p className="text-xs sm:text-sm truncate">{hotel.location}</p>
                  </div>

                  {/* Availability Status */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold ${
                        hotel.availableRooms > 0
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-red-100 text-red-600 border border-red-200"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1.5 sm:mr-2 ${
                          hotel.availableRooms > 0 ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      ></div>
                      {hotel.availableRooms > 0 ? "Available" : "Sold Out"}
                    </div>

                    {/* View Details Button */}
                    <button className="hidden sm:flex text-emerald-600 hover:text-emerald-700 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 items-center">
                      View Details
                      <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Mobile arrow */}
                    <div className="sm:hidden text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Section Divider */}
          {Object.entries(groupedHotels).indexOf([state, hotels]) < Object.entries(groupedHotels).length - 1 && (
            <div className="mt-12 flex justify-center">
              <div className="w-32 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PopularHotelSection;



// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { ArrowRight } from "lucide-react";

// const fallbackImage = "https://via.placeholder.com/400x250?text=Hotel";

// const PopularHotelSection = ({ groupedHotels = {}, searchData = {} }) => {
//   const navigate = useNavigate();

//   const handleClick = (hotelId) => {
//     const params = new URLSearchParams({
//       checkIn: searchData.checkIn || "",
//       checkOut: searchData.checkOut || "",
//       guests: searchData.guests || 1,
//     }).toString();

//     navigate(`/hotel/${hotelId}?${params}`);
//   };

//   return (
//     <div className="space-y-12">
//       {Object.entries(groupedHotels).map(([state, hotels], index) => (
//         <div key={state} className="relative">
//           <h2 className="text-2xl font-bold text-gray-800 mb-4 capitalize">
//             Popular Hotels in {state}
//           </h2>

//           <div className="flex gap-6 overflow-x-auto pb-2">
//             {hotels.map((hotel) => (
//               <div
//                 key={hotel._id}
//                 onClick={() => handleClick(hotel._id)}
//                 className="min-w-[280px] bg-white border border-gray-100 rounded-2xl shadow hover:shadow-lg cursor-pointer transition-all duration-200 group"
//               >
//                 <div className="relative h-48 rounded-t-2xl overflow-hidden">
//                   <img
//                     src={hotel.images?.[0] || fallbackImage}
//                     alt={hotel.title}
//                     className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//                   />
//                   <div className="absolute top-2 left-2 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs font-semibold text-emerald-600">
//                     {hotel.state}
//                   </div>
//                 </div>
//                 <div className="p-4 space-y-1">
//                   <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
//                     {hotel.title}
//                   </h3>
//                   <p className="text-sm text-gray-500 line-clamp-1">
//                     {hotel.location}, {hotel.area}
//                   </p>
//                   <p className="text-sm font-medium text-gray-800 mt-1">
//                     ₹{hotel.pricePerNight} <span className="text-gray-500">/ night</span>
//                   </p>
//                   <p
//                     className={`text-xs font-semibold mt-1 ${
//                       hotel.availableRooms > 0 ? "text-green-600" : "text-red-500"
//                     }`}
//                   >
//                     {hotel.availableRooms > 0 ? "Available" : "Sold Out"}
//                   </p>
//                   <button className="flex items-center gap-1 text-sm text-emerald-600 font-semibold mt-2 group-hover:underline">
//                     View Details <ArrowRight className="w-4 h-4" />
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {index < Object.entries(groupedHotels).length - 1 && (
//             <div className="mt-12 flex justify-center">
//               <div className="w-32 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
//             </div>
//           )}
//         </div>
//       ))}
//     </div>
//   );
// };

// export default PopularHotelSection;
