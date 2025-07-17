import React from "react";
import { useSuperAdmin } from "../contexts/SuperAdminContext"; // Adjust path as needed

const SuperAdminProfilePage = () => {
  const { superAdmin } = useSuperAdmin(); // ✅ Correct context access

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-6">Super Admin Profile</h2>
      <div className="bg-white p-6 rounded shadow-md max-w-xl">
        <p className="text-lg">
          <strong>Name:</strong> {superAdmin?.name || "Not Available"}
        </p>
        <p className="text-lg">
          <strong>Email:</strong> {superAdmin?.email}
        </p>
        <p className="text-lg">
          <strong>Role:</strong> {superAdmin?.role}
        </p>
        <p className="text-sm text-gray-500 mt-4">
          This profile is visible only to the super admin.
        </p>
      </div>
    </div>
  );
};

export default SuperAdminProfilePage;
