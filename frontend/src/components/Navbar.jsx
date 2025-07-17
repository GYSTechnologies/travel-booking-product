import React, { useEffect, useState } from "react";
import {
  Search,
  Menu,
  Lightbulb,
  Wrench,
  Hotel,
  X,
  User,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../assets/logo1.png";
import { useNavigate, useLocation } from "react-router-dom";
import UserProfileMenu from "./UserProfileMenu";

export default function Navbar({
  handleSearch,
  searchData,
  setSearchData,
  activeTab = "hotel",
  setActiveTab,
  resetSearch, 
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // ❌ Pages where navbar should be minimal
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/otp"; // Add other auth routes if needed

  useEffect(() => {
    if (isAuthPage) return; // 👉 disable scroll effect on auth pages

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAuthPage]);

  const handleChange = (e) => {
    setSearchData({ ...searchData, [e.target.name]: e.target.value });
  };

  const tabs = [
    { key: "hotel", label: "Hotels", icon: Hotel },
    { key: "experience", label: "Experiences", icon: Lightbulb },
    { key: "service", label: "Services", icon: Wrench },
  ];

  return (
    <div className="w-full sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.12)] transition-all duration-300">
      <style>{`
        .custom-date-input {
          position: relative;
          cursor: pointer;
        }

        .custom-date-input::-webkit-calendar-picker-indicator {
          background: transparent;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='4' width='18' height='18' rx='2' ry='2'></rect><line x1='16' y1='2' x2='16' y2='6'></line><line x1='8' y1='2' x2='8' y2='6'></line><line x1='3' y1='10' x2='21' y2='10'></line></svg>");
          background-repeat: no-repeat;
          background-position: center;
          background-size: 16px 16px;
          width: 20px;
          height: 20px;
          cursor: pointer;
          margin-left: 8px;
        }

        .custom-date-input::-webkit-calendar-picker-indicator:hover {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='3' y='4' width='18' height='18' rx='2' ry='2'></rect><line x1='16' y1='2' x2='16' y2='6'></line><line x1='8' y1='2' x2='8' y2='6'></line><line x1='3' y1='10' x2='21' y2='10'></line></svg>");
        }

        .custom-date-input::-webkit-datetime-edit {
          padding: 0;
          margin: 0;
        }

        .custom-date-input::-webkit-datetime-edit-fields-wrapper {
          padding: 0;
        }

        .custom-date-input::-webkit-datetime-edit-text {
          color: #6b7280;
          padding: 0 2px;
        }

        .custom-date-input::-webkit-datetime-edit-month-field,
        .custom-date-input::-webkit-datetime-edit-day-field,
        .custom-date-input::-webkit-datetime-edit-year-field {
          color: #374151;
          font-weight: 500;
          padding: 0 2px;
        }

        .custom-date-input::-webkit-datetime-edit-month-field:hover,
        .custom-date-input::-webkit-datetime-edit-day-field:hover,
        .custom-date-input::-webkit-datetime-edit-year-field:hover {
          background-color: #f3f4f6;
          border-radius: 4px;
        }

        .custom-date-input:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* Firefox specific styles */
        .custom-date-input::-moz-focus-inner {
          border: 0;
        }

        /* Custom calendar dropdown styling */
        .custom-date-input::-webkit-calendar-picker-indicator {
          filter: brightness(0.8);
          transition: all 0.2s ease;
        }

        .custom-date-input:hover::-webkit-calendar-picker-indicator {
          filter: brightness(0.6);
          transform: scale(1.1);
        }
      `}</style>
      {/* Desktop Navbar */}
      <div className="hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <motion.div
              className="pt-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <img
                src={Logo}
                alt="Logo"
                onClick={() => {
                  resetSearch();
                  navigate("/");
                }}
                className="h-35 w-auto object-contain cursor-pointer transition-all duration-300 hover:brightness-110"
              />
            </motion.div>

            {/* Desktop Tabs (Always visible, even on login/register) */}
            <motion.div
              className="flex justify-center space-x-8 pt-4"
              animate={{
                opacity: isScrolled ? 0 : 1,
                y: isScrolled ? -30 : 0,
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <motion.div
                    key={tab.key}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-full cursor-pointer transition-all duration-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md ${
                      activeTab === tab.key
                        ? "text-gray-900 font-semibold bg-gradient-to-r from-gray-100 to-gray-200 shadow-inner"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    onClick={() => {
                      setActiveTab(tab.key);
                      navigate("/");
                    }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <IconComponent size={20} />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Right Nav */}
            <div className="flex items-center gap-3">
              <motion.button
                className="text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 hover:shadow-md"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login?type=host")}
              >
                Become a host
              </motion.button>

              <UserProfileMenu />
            </div>
          </div>
        </div>

        {/* Desktop Search Section (Only on Non-auth pages) */}
        {!isAuthPage && (
          <motion.div
            className={`mx-auto px-4 pb-6 ${
              isScrolled
                ? "fixed top-5 left-1/2 transform -translate-x-1/2 z-40"
                : ""
            }`}
            style={{ width: isScrolled ? "32rem" : "60rem" }}
            initial={false}
            animate={{
              scale: isScrolled ? 0.95 : 1,
              opacity: isScrolled ? 0.95 : 1,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Search Box */}
            <div className="bg-white/95 backdrop-blur-xl border border-gray-300/50 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] hover:shadow-[0_16px_48px_rgba(0,0,0,0.18)] overflow-hidden transition-all duration-300">
              <div className="flex items-center divide-x divide-gray-300/50">
                {/* Where */}
                <div className="flex-1 px-6 py-4 cursor-pointer hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-gray-100/50 relative transition-all duration-300">
                  <label className="text-xs font-semibold text-gray-900 mb-1 block">
                    Where
                  </label>
                  {!isScrolled && (
                    <input
                      id="location"
                      name="location"
                      value={searchData?.location || ""}
                      onChange={handleChange}
                      placeholder="Search destinations"
                      className="text-sm text-gray-600 w-full bg-transparent outline-none placeholder-gray-400"
                    />
                  )}
                </div>

                {/* Date Fields */}
                {activeTab === "hotel" ? (
                  <>
                    <div className="flex-1 px-6 py-4 hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-gray-100/50 transition-all duration-300">
                      <label className="text-xs font-semibold text-gray-900 mb-1 block">
                        {isScrolled ? "In" : "Check-in"}
                      </label>
                      {!isScrolled && (
                        <input
                          type="date"
                          id="checkIn"
                          name="checkIn"
                          value={searchData?.checkIn}
                          onChange={handleChange}
                          min={new Date().toISOString().split("T")[0]}
                          className="text-sm text-gray-600 w-full bg-transparent outline-none custom-date-input"
                          style={{
                            colorScheme: "light",
                            WebkitAppearance: "none",
                            MozAppearance: "textfield",
                          }}
                        />
                      )}
                    </div>

                    <div className="flex-1 px-6 py-4 hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-gray-100/50 transition-all duration-300">
                      <label className="text-xs font-semibold text-gray-900 mb-1 block">
                        {isScrolled ? "Out" : "Check-out"}
                      </label>
                      {!isScrolled && (
                        <input
                          type="date"
                          id="checkOut"
                          name="checkOut"
                          value={searchData?.checkOut}
                          onChange={handleChange}
                          min={
                            searchData?.checkIn ||
                            new Date().toISOString().split("T")[0]
                          }
                          className="text-sm text-gray-600 w-full bg-transparent outline-none custom-date-input"
                          style={{
                            colorScheme: "light",
                            WebkitAppearance: "none",
                            MozAppearance: "textfield",
                          }}
                        />
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 px-6 py-4 hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-gray-100/50 transition-all duration-300">
                    <label className="text-xs font-semibold text-gray-900 mb-1 block">
                      Date
                    </label>
                    {!isScrolled && (
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={searchData?.date}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                        className="text-sm text-gray-600 w-full bg-transparent outline-none custom-date-input"
                        style={{
                          colorScheme: "light",
                          WebkitAppearance: "none",
                          MozAppearance: "textfield",
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Guests / Type */}
                <div className="flex-1 px-6 py-4 hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-gray-100/50 transition-all duration-300">
                  <label
                    htmlFor={activeTab === "service" ? "type" : "guests"}
                    className="text-xs font-semibold text-gray-900 mb-1 block"
                  >
                    {activeTab === "service" ? "Service Type" : "Guests"}
                  </label>
                  {!isScrolled &&
                    (activeTab === "service" ? (
                      <input
                        id="type"
                        name="type"
                        value={searchData?.type || ""}
                        onChange={handleChange}
                        placeholder="Type of service"
                        className="text-sm text-gray-600 w-full bg-transparent outline-none placeholder-gray-400"
                      />
                    ) : (
                      <input
                        type="number"
                        id="guests"
                        name="guests"
                        value={searchData?.guests || ""}
                        onChange={handleChange}
                        placeholder="Add guests"
                        min={1}
                        className="text-sm text-gray-600 w-full bg-transparent outline-none placeholder-gray-400"
                      />
                    ))}
                </div>

                {/* Search Button */}
                <div className="pr-3">
                  <motion.button
                    onClick={handleSearch}
                    className="bg-gradient-to-r from-gray-900 to-black text-white p-4 rounded-full transition-all duration-300 hover:from-black hover:to-gray-900 hover:shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Search size={20} />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Mobile Navbar */}
      <div className="lg:hidden">
        <div className="px-4 pb-1">
          <div className="flex justify-between items-center w-full">
            {/* Mobile Logo */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <img
                src={Logo}
                alt="Logo"
                onClick={() => navigate("/")}
                className="h-25 w-auto object-contain cursor-pointer"
              />
            </motion.div>

            {/* Right Side: Become a Host + User Profile */}
            <div className="flex items-center ">
              <motion.button
                className="text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 px-3 py-3 rounded-full font-medium text-sm transition-all duration-300 hover:shadow-md"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/login?type=host")}
              >
                Become a host
              </motion.button>

              <UserProfileMenu />
            </div>
          </div>

          {/* Mobile Search Bar - Show/Hide on Scroll */}
          <AnimatePresence>
            {!isScrolled && (
              <motion.div
                className="-mt-3"
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.button
                  onClick={() => setIsMobileSearchOpen(true)}
                  className="w-full bg-white border border-gray-300 rounded-2xl shadow-lg p-4 text-left hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center space-x-3">
                    <Search size={20} className="text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Where to?
                      </div>
                      <div className="text-xs text-gray-500">
                        Anywhere • Any week • Add guests
                      </div>
                    </div>
                  </div>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mobile Tabs */}
          <motion.div
            className="flex justify-center space-x-2 mt-2 bg-gray-100 rounded-2xl p-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <motion.button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    navigate("/");
                  }}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl transition-all duration-300 ${
                    activeTab === tab.key
                      ? "bg-white text-gray-900 font-semibold shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/80"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconComponent size={16} />
                  <span className="text-xs font-medium">{tab.label}</span>
                </motion.button>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-semibold">Menu</h2>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  <motion.button
                    className="w-full text-left p-4 hover:bg-gray-100 rounded-xl transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <User size={20} className="text-gray-600" />
                      <span className="font-medium">Profile</span>
                    </div>
                  </motion.button>

                  <motion.button
                    className="w-full text-left p-4 hover:bg-gray-100 rounded-xl transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-3">
                      <Globe size={20} className="text-gray-600" />
                      <span className="font-medium">Language</span>
                    </div>
                  </motion.button>

                  <motion.button
                    className="w-full text-left p-4 hover:bg-gray-100 rounded-xl transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="font-medium">Become a host</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div
            className="lg:hidden fixed inset-0 bg-white z-50"
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
            <div className="p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Search</h2>
                <button
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Location */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-300">
                  <label className="text-xs font-semibold text-gray-900 mb-2 block">
                    Where
                  </label>
                  <input
                    name="location"
                    value={searchData?.location || ""}
                    onChange={handleChange}
                    placeholder="Search destinations"
                    className="text-sm text-gray-800 w-full bg-transparent outline-none placeholder-gray-500"
                  />
                </div>

                {/* Date Fields */}
                {activeTab === "hotel" ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-300">
                      <label className="text-xs font-semibold text-gray-900 mb-2 block">
                        Check-in
                      </label>
                      <input
                        type="date"
                        name="checkIn"
                        value={searchData?.checkIn}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                        className="text-sm text-gray-800 w-full bg-transparent outline-none custom-date-input"
                        style={{
                          colorScheme: "light",
                          WebkitAppearance: "none",
                          MozAppearance: "textfield",
                        }}
                      />
                    </div>
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-300">
                      <label className="text-xs font-semibold text-gray-900 mb-2 block">
                        Check-out
                      </label>
                      <input
                        type="date"
                        name="checkOut"
                        value={searchData?.checkOut}
                        onChange={handleChange}
                        min={
                          searchData?.checkIn ||
                          new Date().toISOString().split("T")[0]
                        }
                        className="text-sm text-gray-800 w-full bg-transparent outline-none custom-date-input"
                        style={{
                          colorScheme: "light",
                          WebkitAppearance: "none",
                          MozAppearance: "textfield",
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-300">
                    <label className="text-xs font-semibold text-gray-900 mb-2 block">
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={searchData?.date}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      className="text-sm text-gray-800 w-full bg-transparent outline-none custom-date-input"
                      style={{
                        colorScheme: "light",
                        WebkitAppearance: "none",
                        MozAppearance: "textfield",
                      }}
                    />
                  </div>
                )}

                {/* Guests or Type */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-300">
                  <label className="text-xs font-semibold text-gray-900 mb-2 block">
                    {activeTab === "service" ? "Service Type" : "Guests"}
                  </label>
                  {activeTab === "service" ? (
                    <input
                      name="type"
                      value={searchData?.type || ""}
                      onChange={handleChange}
                      placeholder="Type of service"
                      className="text-sm text-gray-800 w-full bg-transparent outline-none placeholder-gray-500"
                    />
                  ) : (
                    <input
                      type="number"
                      name="guests"
                      value={searchData?.guests || ""}
                      onChange={handleChange}
                      placeholder="Add guests"
                      className="text-sm text-gray-800 w-full bg-transparent outline-none placeholder-gray-500"
                      min={1}
                    />
                  )}
                </div>

                {/* Search Button */}
                <motion.button
                  onClick={() => {
                    handleSearch();
                    setIsMobileSearchOpen(false);
                  }}
                  className="w-full bg-gradient-to-r from-gray-900 to-black text-white p-4 rounded-2xl font-semibold transition-all duration-300 hover:from-black hover:to-gray-900"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <Search size={20} />
                    <span>Search</span>
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
