import { createContext, useContext, useState } from "react";
import axios from "axios";
import { searchHotels } from "../api/allAPIs";

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
  const [searchData, setSearchData] = useState({
    location: "",
    checkIn: "",
    checkOut: "",
    date: "",
    type: "",
    guests: "",
  });

  const [searchResults, setSearchResults] = useState([]);

  // const handleSearch = async () => {
  //   const { location, checkIn, checkOut, guests } = searchData;

  //   if (!location) return alert("Please enter a location");

  //   try {
  //     const res = await axios.get("http://localhost:4000/api/host/all-hotels", {
  //       params: {
  //         place: location,
  //         checkIn,
  //         checkOut,
  //         guests: guests || 1,
  //       },
  //     });

  //     setSearchResults(res.data);
  //   } catch (err) {
  //     console.error("Search error:", err);
  //   }
  // };

  const handleSearch = async () => {
  const { location, checkIn, checkOut, guests } = searchData;

  if (!location) return alert("Please enter a location");

  try {
    const data = await searchHotels({ location, checkIn, checkOut, guests });
    setSearchResults(data);
  } catch (err) {
    console.error("Search error:", err);
  }
};

  return (
    <SearchContext.Provider
      value={{ searchData, setSearchData, handleSearch, searchResults, setSearchResults }}
    >
      {children}
    </SearchContext.Provider>
  );
};
