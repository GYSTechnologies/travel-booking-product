import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSuperAdmin } from "../contexts/SuperAdminContext";
import SuperAdminSidebar from "../super-admin/SuperAdminSidebar";

const SuperAdminLayout = () => {
  const { isAuthenticated } = useSuperAdmin();

  if (!isAuthenticated) {
    return <Navigate to="/super-admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Sidebar handles its own mobile/desktop logic */}
      <SuperAdminSidebar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto ">
        <Outlet />
      </main>
    </div>
  );
};

export default SuperAdminLayout;

