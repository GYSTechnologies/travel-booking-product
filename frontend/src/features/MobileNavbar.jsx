import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu } from "lucide-react";
import Logo from "../assets/logo1.png";

export default function MobileNavbar({ searchData, handleChange }) {
  const [activeTab, setActiveTab] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const searchRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false); // Close search on outside click
      }
    };

    if (showSearch) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSearch]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setShowSearch(true);
  };

  return (
    <div className="md:hidden w-full sticky top-0 z-50 bg-white shadow-md border-b backdrop-blur-md">
      {/* Top Nav */}
      <div className="flex items-center justify-between px-2 py-1">
        <img src={Logo} alt="Logo" className="h-20 object-contain" />

        <div className="flex items-center space-x-2">
          {["hotels", "experiences", "services"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`text-xs font-semibold capitalize px-1 py-1 rounded-full ${
                activeTab === tab ? "bg-gray-200 text-black" : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Toggle Menu */}
        <div className="relative">
          <button
            className="p-2 border rounded-full"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu size={18} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-50 text-sm text-gray-700">
              <ul>
                <li className="px-4 py-2 hover:bg-gray-100">Profile</li>
                <li className="px-4 py-2 hover:bg-gray-100">Become a Host</li>
                <li className="px-4 py-2 hover:bg-gray-100">Booking History</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Animated Search Section */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            key="search"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden px-4 py-4 bg-white border-t"
          >
            {activeTab === "hotels" ? (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  name="location"
                  value={searchData.location}
                  onChange={handleChange}
                  placeholder="Where to?"
                  className="bg-gray-100 p-2 rounded text-sm"
                />
                <input
                  type="date"
                  name="checkIn"
                  value={searchData.checkIn}
                  onChange={handleChange}
                  className="bg-gray-100 p-2 rounded text-sm"
                />
                <input
                  type="date"
                  name="checkOut"
                  value={searchData.checkOut}
                  onChange={handleChange}
                  className="bg-gray-100 p-2 rounded text-sm"
                />
                <input
                  type="number"
                  name="guests"
                  value={searchData.guests}
                  onChange={handleChange}
                  placeholder="Add guests"
                  min={1}
                  className="bg-gray-100 p-2 rounded text-sm"
                />
              </div>
            ) : activeTab === "experiences" ? (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  name="location"
                  value={searchData.location}
                  onChange={handleChange}
                  placeholder="Location"
                  className="bg-gray-100 p-2 rounded text-sm"
                />
                <input
                  type="date"
                  name="date"
                  value={searchData.date}
                  onChange={handleChange}
                  className="bg-gray-100 p-2 rounded text-sm"
                />
                <input
                  type="number"
                  name="guests"
                  value={searchData.guests}
                  onChange={handleChange}
                  placeholder="Add guests"
                  min={1}
                  className="bg-gray-100 p-2 rounded text-sm"
                />
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  name="location"
                  value={searchData.location}
                  onChange={handleChange}
                  placeholder="City or area"
                  className="bg-gray-100 p-2 rounded text-sm"
                />
                <input
                  type="date"
                  name="date"
                  value={searchData.date}
                  onChange={handleChange}
                  className="bg-gray-100 p-2 rounded text-sm"
                />
                <input
                  type="text"
                  name="type"
                  value={searchData.type}
                  onChange={handleChange}
                  placeholder="Service type"
                  className="bg-gray-100 p-2 rounded text-sm"
                />
              </div>
            )}

            <button className="mt-4 w-full bg-black text-white py-2 rounded-full text-sm font-semibold">
              Search
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
