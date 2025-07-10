import { motion } from "framer-motion";
import { User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const UserProfileMenu = () => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        className="p-3 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 rounded-full border border-gray-300 transition-all duration-300 hover:shadow-md hover:border-gray-400"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
      >
        <User size={18} className="text-gray-700" />
      </motion.button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-xl z-50 py-2"
        >
          {!user ? (
            <button
              onClick={() => {
                navigate("/login");
                setOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Login / Register
            </button>
          ) : (
            <>
              <div className="px-4 py-2 text-sm text-gray-600 border-b">
                Hello, {user.name}
              </div>
              <button
                onClick={() => {
                  navigate("/user-profile");
                  setOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Profile
              </button>
              <button
                onClick={() => {
                  navigate("/booking-history");
                  setOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                My Bookings
              </button>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
              >
                Logout
              </button>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default UserProfileMenu;
