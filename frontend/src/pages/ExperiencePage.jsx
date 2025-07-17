import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import SearchResult from "../components/SearchResult";
import { searchExperiences,fetchAllExperiences } from "../api/allAPIs";

export default function ExperiencesPage() {
  const [groupedExperiences, setGroupedExperiences] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [searchData, setSearchData] = useState({
    location: "",
    date: "",
    type: "",
  });

  // useEffect(() => {
  //   const fetchAllExperiences = async () => {
  //     try {
  //       const res = await axios.get("http://localhost:4000/api/experiences/all-experiences", {
  //         params: { place: "all" },
  //       });

  //       const grouped = res.data.reduce((acc, exp) => {
  //         if (!acc[exp.state]) acc[exp.state] = [];
  //         acc[exp.state].push(exp);
  //         return acc;
  //       }, {});

  //       setGroupedExperiences(grouped);
  //     } catch (err) {
  //       console.error("Failed to load experiences:", err);
  //     }
  //   };

  //   fetchAllExperiences();
  // }, []);

  useEffect(() => {
    const loadExperiences = async () => {
      try {
        const data = await fetchAllExperiences();
        const grouped = data.reduce((acc, exp) => {
          if (!acc[exp.state]) acc[exp.state] = [];
          acc[exp.state].push(exp);
          return acc;
        }, {});
        setGroupedExperiences(grouped);
      } catch (err) {
        console.error("Failed to load experiences:", err);
      }
    };

    loadExperiences();
  }, []);

  const handleSearch = async () => {
    const { location, date, type } = searchData;
    if (!location) return alert("Please enter a location");

    try {
      // const res = await axios.get("http://localhost:4000/api/experiences/all-experiences", {
      //   params: { place: location, date, type },
      // });
      // setSearchResults(res.data);

      const data = await searchExperiences({ location, date, type });
      setSearchResults(data);
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
            type="experience"
            searchData={searchData}
          />
        ) : (
          Object.entries(groupedExperiences).map(([state, exps]) => (
            <div key={state}>
              <h2 className="text-xl sm:text-2xl font-bold mb-4 text-gray-800">
                Experiences in {state}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {exps.map((exp, index) => (
                  <div
                    key={exp._id}
                    className="bg-white p-4 rounded-xl shadow-md"
                  >
                    <img
                      src={exp.images?.[0] || "https://via.placeholder.com/300"}
                      alt={exp.title}
                      className="w-full h-40 object-cover rounded-md mb-3"
                    />
                    <h3 className="font-semibold text-lg truncate">
                      {exp.title}
                    </h3>
                    <p className="text-gray-600 text-sm truncate">
                      {exp.location}
                    </p>
                    <p className="text-sm font-medium text-emerald-600 mt-1">
                      ₹{exp.price}
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
