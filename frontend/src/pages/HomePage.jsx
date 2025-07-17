import React, { useEffect, useState } from "react";
import axios from "axios";
import SearchResults from "../components/SearchResult";
import PopularHotelSection from "../components/PopularHotelSection.jsx";
import PopularServiceSection from "../components/PopularServiceSection.jsx";
import PopularExperienceSection from "../components/PopularExperienceSection.jsx";
import {
  fetchAllHotels,
  fetchAllServices,
  fetchAllExperiences,
} from "../api/allAPIs.js";

export default function HomePage({
  tab,
  searchData,
  setSearchData,
  searchResults,
  hasSearched,
}) {
  const [defaultHotels, setDefaultHotels] = useState({});
  const [defaultServices, setDefaultServices] = useState({});
  const [defaultExperiences, setDefaultExperiences] = useState({});

  // useEffect(() => {
  //   const fetchAllData = async () => {
  //     try {
  //       if (tab === "hotel") {
  //         const res = await axios.get(
  //           "http://localhost:4000/api/host/all-hotels",
  //           {
  //             params: { place: "all" },
  //           }
  //         );

  //         const grouped = res.data.reduce((acc, hotel) => {
  //           if (!acc[hotel.state]) acc[hotel.state] = [];
  //           acc[hotel.state].push(hotel);
  //           return acc;
  //         }, {});

  //         setDefaultHotels(grouped);
  //       }

  //       if (tab === "service") {
  //         const res = await axios.get(
  //           "http://localhost:4000/api/services/all-services",
  //           {
  //             params: { place: "all" },
  //           }
  //         );

  //         const grouped = res.data.reduce((acc, item) => {
  //           if (!acc[item.category]) acc[item.category] = [];
  //           acc[item.category].push(item);
  //           return acc;
  //         }, {});

  //         setDefaultServices(grouped);
  //       }

  //       if (tab === "experience") {
  //         const res = await axios.get(
  //           "http://localhost:4000/api/experiences/all-experiences",
  //           {
  //             params: { place: "all" },
  //           }
  //         );

  //         const grouped = res.data.reduce((acc, item) => {
  //           if (!acc[item.state]) acc[item.state] = [];
  //           acc[item.state].push(item);
  //           return acc;
  //         }, {});

  //         setDefaultExperiences(grouped);
  //       }
  //     } catch (err) {
  //       console.error("Error loading default data:", err);
  //     }
  //   };

  //   fetchAllData();
  // }, [tab]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        if (tab === "hotel") {
          const data = await fetchAllHotels();
          const grouped = data.reduce((acc, hotel) => {
            if (!acc[hotel.state]) acc[hotel.state] = [];
            acc[hotel.state].push(hotel);
            return acc;
          }, {});
          setDefaultHotels(grouped);
        }

        if (tab === "service") {
          const data = await fetchAllServices();
          const grouped = data.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
          }, {});
          setDefaultServices(grouped);
        }

        if (tab === "experience") {
          const data = await fetchAllExperiences();
          const grouped = data.reduce((acc, item) => {
            if (!acc[item.state]) acc[item.state] = [];
            acc[item.state].push(item);
            return acc;
          }, {});
          setDefaultExperiences(grouped);
        }
      } catch (err) {
        console.error("Error loading default data:", err);
      }
    };

    fetchAllData();
  }, [tab]);

  return (
    <div className="max-w-7xl mx-auto px-4 mt-8 space-y-12">
      {hasSearched ? (
        searchResults?.length > 0 ? (
          <SearchResults
            results={searchResults}
            loading={false}
            searchData={searchData}
            type={tab}
          />
        ) : (
          <div className="text-center text-gray-500 text-lg py-20">
            No results found
          </div>
        )
      ) : tab === "hotel" ? (
        <PopularHotelSection
          groupedHotels={defaultHotels}
          searchData={searchData}
        />
      ) : tab === "service" ? (
        <PopularServiceSection
          groupedServices={defaultServices}
          searchData={searchData}
        />
      ) : tab === "experience" ? (
        <PopularExperienceSection
          groupedExperiences={defaultExperiences}
          searchData={searchData}
        />
      ) : null}
    </div>
  );
}
