import React, { createContext, useContext, useEffect, useState } from "react";

// Create context
const SuperAdminContext = createContext();

// Custom hook to use the context
export const useSuperAdmin = () => useContext(SuperAdminContext);

export const SuperAdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem("adminToken");
    return stored && stored !== "undefined" ? stored : null;
  });
  const [loading, setLoading] = useState(false);

  // Load admin data if token is present
  useEffect(() => {
    if (token) {
      try {
        const storedAdmin = localStorage.getItem("adminData");
        if (storedAdmin && storedAdmin !== "undefined") {
          const parsedAdmin = JSON.parse(storedAdmin);
          setAdmin(parsedAdmin);
        } else {
          // Invalid data, force logout
          logoutAdmin();
        }
      } catch (error) {
        console.error("Error parsing admin data from localStorage:", error);
        logoutAdmin(); // Corrupt data → force logout
      }
    }
  }, [token]);

  // Login and store credentials
  const loginAdmin = (adminData, token) => {
    setAdmin(adminData);
    setToken(token);
    localStorage.setItem("adminToken", token);
    localStorage.setItem("adminData", JSON.stringify(adminData));
  };

  // Logout and clear storage
  const logoutAdmin = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
  };

  return (
    <SuperAdminContext.Provider
      value={{
        admin,
        token,
        loading,
        setLoading,
        loginAdmin,
        logoutAdmin,
        isAuthenticated: !!admin && !!token,
      }}
    >
      {children}
    </SuperAdminContext.Provider>
  );
};
