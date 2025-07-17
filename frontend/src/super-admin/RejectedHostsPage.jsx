import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSuperAdmin } from "../contexts/SuperAdminContext"; // ✅ import context
import { toast } from "react-toastify";
import { fetchRejectedHosts as getRejectedHosts } from "../api/allAPIs"; // centralized import


const RejectedHostsPage = () => {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const { token } = useSuperAdmin(); // ✅ get token

  // const fetchRejectedHosts = async () => {
  //   if (!token) return;
  //   try {
  //     setLoading(true);
  //     const res = await axios.get(
  //       "http://localhost:4000/api/super-admin/hosts/rejected",
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`, // ✅ attach token
  //         },
  //       }
  //     );
  //     setHosts(res.data);
  //   } catch (error) {
  //     console.error("Failed to fetch rejected hosts:", error);
  //     toast.error("Failed to fetch rejected hosts");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchRejectedHosts();
  // }, [token]);

  const fetchRejectedHosts = async () => {
  if (!token) return;
  try {
    setLoading(true);
    const data = await getRejectedHosts(token);
    setHosts(data);
  } catch (error) {
    console.error("Failed to fetch rejected hosts:", error);
    toast.error("Failed to fetch rejected hosts");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchRejectedHosts();
}, [token]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-xl">🚫</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Rejected Hosts</h1>
          </div>
          <p className="text-gray-600">
            Manage and review hosts that have been rejected from the platform
          </p>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
            <p className="text-gray-600 text-lg">Loading rejected hosts...</p>
          </div>
        ) : hosts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-green-600 text-3xl">✅</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Rejected Hosts
            </h3>
            <p className="text-gray-600">
              Great! There are currently no rejected hosts in the system.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Stats Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Total Rejected Hosts:
                  </span>
                  <span className="bg-red-100 text-red-800 text-sm font-semibold px-2 py-1 rounded-full">
                    {hosts.length}
                  </span>
                </div>
                <button
                  onClick={fetchRejectedHosts}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <span className="text-base">🔄</span>
                  Refresh
                </button>
              </div>
            </div>

            {/* Hosts Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {hosts.map((host) => (
                <div
                  key={host._id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-red-600 font-bold text-lg">
                          {host.username?.charAt(0)?.toUpperCase() || "H"}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          {host.username}
                        </h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-full mr-1"></span>
                          Rejected
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">📧</span>
                      <span className="text-sm text-gray-700 font-medium">
                        Email:
                      </span>
                      <span className="text-sm text-gray-900 truncate">
                        {host.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 text-sm">📱</span>
                      <span className="text-sm text-gray-700 font-medium">
                        Phone:
                      </span>
                      <span className="text-sm text-gray-900">
                        {host.phone || "N/A"}
                      </span>
                    </div>
                  </div>

                
                  {/* Rejection Reason */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-start gap-2">
                      <span className="text-red-400 text-sm mt-0.5">⚠️</span>
                      <div className="flex-1">
                        <span className="text-sm text-gray-700 font-medium">
                          Rejection Reason:
                        </span>
                        <p className="text-sm text-red-600 mt-1 bg-red-50 p-2 rounded border-l-2 border-red-200">
                          {host.hostRejectionReason || "Not specified"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RejectedHostsPage;
