
import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import SearchResult from "../components/SearchResult"; // We'll reuse this
import { fetchAllServicesData, searchServices } from "../api/allAPIs";

export default function ServicesPage() {
  const [groupedServices, setGroupedServices] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [searchData, setSearchData] = useState({
    location: "",
    date: "",
    type: "",
  });

  // ✅ Fetch all services and group by category
  // useEffect(() => {
  //   const fetchAllServices = async () => {
  //     try {
  //       const res = await axios.get("http://localhost:4000/api/services/all-services", {
  //         params: { place: "all" },
  //       });

  //       const grouped = res.data.reduce((acc, service) => {
  //         if (!acc[service.category]) acc[service.category] = [];
  //         acc[service.category].push(service);
  //         return acc;
  //       }, {});

  //       setGroupedServices(grouped);
  //     } catch (err) {
  //       console.error("Failed to load services:", err);
  //     }
  //   };

  //   fetchAllServices();
  // }, []);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const data = await fetchAllServicesData();
      const grouped = data.reduce((acc, service) => {
        if (!acc[service.category]) acc[service.category] = [];
        acc[service.category].push(service);
        return acc;
      }, {});
      setGroupedServices(grouped);
    } catch (err) {
      console.error("Failed to load services:", err);
    }
  };
  fetchData();
}, []);


  // ✅ Handle search
  // const handleSearch = async () => {
  //   const { location, date, type } = searchData;
  //   if (!location) return alert("Please enter a location");

  //   try {
  //     const res = await axios.get("http://localhost:4000/api/services/all-services", {
  //       params: { place: location, date, type },
  //     });
  //     setSearchResults(res.data);
  //   } catch (err) {
  //     console.error("Search error:", err);
  //   }
  // };

  const handleSearch = async () => {
  const { location, date, type } = searchData;
  if (!location) return alert("Please enter a location");

  try {
    const results = await searchServices(location, date, type);
    setSearchResults(results);
  } catch (err) {
    console.error("Search error:", err);
  }
};


  return (
    <>
      <Navbar
        searchData={searchData}
        setSearchData={setSearchData}
        handleSearch={handleSearch}
      />

      <div className="max-w-7xl mx-auto px-4 mt-8 space-y-12">
        {searchResults.length > 0 ? (
          <SearchResult
            data={searchResults}
            type="service"
            searchData={searchData}
          />
        ) : (
          Object.entries(groupedServices).map(([category, services]) => (
            <div key={category}>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
                Popular {category} Services
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {services.map((service, index) => (
                  <div key={service._id} className="bg-white p-4 rounded-xl shadow-md">
                    <img
                      src={service.images?.[0] || "https://via.placeholder.com/300"}
                      alt={service.title}
                      className="w-full h-40 object-cover rounded-md mb-3"
                    />
                    <h3 className="font-semibold text-lg truncate">{service.title}</h3>
                    <p className="text-gray-600 text-sm truncate">{service.location}</p>
                    <p className="text-sm font-medium text-emerald-600 mt-1">
                      ₹{service.price}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
