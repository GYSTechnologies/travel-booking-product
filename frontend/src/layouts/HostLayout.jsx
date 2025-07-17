import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import SidebarHost from "../admin/SidebarHost";
import { useAuth } from "../contexts/AuthContext";
import HostNavbar from "../admin/HostNavbar";

const HostLayout = () => {
  const { user } = useAuth();


  if (!user || user.role !== "host") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* <HostNavbar/> */}
      <SidebarHost />
      <main className="flex-1">
        <div className="bg-white rounded-xl shadow">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default HostLayout;
