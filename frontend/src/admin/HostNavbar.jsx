import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  LayoutDashboard,
  List,
  CalendarCheck,
  Star,
  LogOut,
  UserCircle,
} from "lucide-react";

const HostNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link
          to="/host/dashboard"
          className="text-xl font-bold text-emerald-600 flex items-center gap-2"
        >
          <LayoutDashboard className="w-6 h-6" />
          Host Panel
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
          <Link to="/host/listings" className="hover:text-emerald-600">
            <List className="inline-block w-4 h-4 mr-1" />
            My Listings
          </Link>
          <Link to="/host/bookings" className="hover:text-emerald-600">
            <CalendarCheck className="inline-block w-4 h-4 mr-1" />
            Bookings
          </Link>
          <Link to="/host/reviews" className="hover:text-emerald-600">
            <Star className="inline-block w-4 h-4 mr-1" />
            Reviews
          </Link>
        </div>

        {/* Profile + Logout */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end text-right">
            <span className="text-sm font-semibold text-gray-800">
              {user?.username}
            </span>
            <span className="text-xs text-gray-500 capitalize">
              {user?.hostType}
            </span>
          </div>
          <UserCircle className="w-8 h-8 text-emerald-500" />
          <button
            onClick={handleLogout}
            className="ml-2 text-sm text-red-500 hover:underline flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default HostNavbar;
