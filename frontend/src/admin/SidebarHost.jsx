

import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, List, Calendar, Star, User, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const SidebarHost = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg ${
      isActive
        ? "bg-emerald-500 text-white"
        : "text-gray-700 hover:bg-gray-200"
    }`;

  const handleLogout = () => {
    logout();
    navigate("/login?type=host");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-emerald-500 text-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static top-0 left-0 z-40 w-64 bg-white shadow-lg p-4 flex flex-col justify-between h-screen transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div>
          <h2 className="text-2xl font-bold text-emerald-600 mb-6 mt-12 md:mt-0">
            Host Panel
          </h2>

          <nav className="flex flex-col gap-2">
            <NavLink 
              to="/host/dashboard" 
              className={linkClasses}
              onClick={closeMobileMenu}
            >
              <Home size={20} /> Dashboard
            </NavLink>
            <NavLink 
              to="/host/listings" 
              className={linkClasses}
              onClick={closeMobileMenu}
            >
              <List size={20} /> My Listings
            </NavLink>
            <NavLink 
              to="/host/bookings" 
              className={linkClasses}
              onClick={closeMobileMenu}
            >
              <Calendar size={20} /> Bookings
            </NavLink>
            <NavLink 
              to="/host/reviews" 
              className={linkClasses}
              onClick={closeMobileMenu}
            >
              <Star size={20} /> Reviews
            </NavLink>
            <NavLink 
              to="/host/profile" 
              className={linkClasses}
              onClick={closeMobileMenu}
            >
              <User size={20} /> Profile
            </NavLink>
          </nav>
        </div>

        <button
          onClick={() => {
            handleLogout();
            closeMobileMenu();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-100 transition mt-6"
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Content Spacer for Desktop */}
      <div className="hidden md:block  flex-shrink-0"></div>
    </>
  );
};

export default SidebarHost;