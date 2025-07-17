
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSuperAdmin } from "../contexts/SuperAdminContext";
import { toast } from "react-toastify";
import { fetchApprovedHosts } from "../api/allAPIs";


const ApprovedHostsPage = () => {
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const { token } = useSuperAdmin(); // ✅ get token

  // const fetchApprovedHosts = async () => {
  //   if (!token) return;
  //   try {
  //     setLoading(true);
  //     const res = await axios.get(
  //       "http://localhost:4000/api/super-admin/hosts/approved",
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`, 
  //         },
  //       }
  //     );
  //     // Use `.hosts` only if backend returns { hosts: [...] }
  //     setHosts(Array.isArray(res.data.hosts) ? res.data.hosts : res.data);
  //   } catch (error) {
  //     console.error("Failed to fetch approved hosts:", error);
  //     toast.error("Error fetching approved hosts");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const loadApprovedHosts = async () => {
  if (!token) return;
  try {
    setLoading(true);
    const data = await fetchApprovedHosts(token);
    setHosts(data);
  } catch (err) {
    console.error("Failed to fetch approved hosts:", err);
    toast.error("Error fetching approved hosts");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    loadApprovedHosts();
  }, [token]);

  const formatPlan = (plan) => {
    if (!plan) return "N/A";

    switch (plan) {
      case "1month":
        return "1-month";
      case "6months":
        return "6-months";
      case "1year":
        return "1-year";
      default:
        return plan; // e.g., "trial"
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "N/A";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 p-4 md:p-6 flex flex-col">
      <style>{`
        .smooth-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        
        .smooth-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        .smooth-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #14b8a6, #10b981);
          border-radius: 10px;
          border: 2px solid #f1f5f9;
        }
        
        .smooth-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0f766e, #059669);
        }
        
        .smooth-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #14b8a6 #f1f5f9;
          scroll-behavior: smooth;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes shimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-pulse-scale {
          animation: pulse 2s infinite;
        }

        .shimmer {
          background: linear-gradient(90deg, #f1f5f9 0%, #e2e8f0 50%, #f1f5f9 100%);
          background-size: 200px 100%;
          animation: shimmer 2s infinite;
        }

        .card-hover-effect {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .card-hover-effect:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }

        .info-card {
          transition: all 0.2s ease-in-out;
        }

        .info-card:hover {
          transform: translateX(4px);
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
        }

        .floating-badge {
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }

        .gradient-text {
          background: linear-gradient(135deg, #14b8a6, #10b981, #059669);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Header */}
      <div className="mb-6 flex-shrink-0">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse-scale">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold gradient-text">Approved Hosts</h2>
        </div>
        <p className="text-slate-600 ml-13">
          Manage and monitor all approved host accounts
        </p>
      </div>

      {/* Content - Scrollable Section */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto smooth-scrollbar p-1">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 text-lg font-medium">
                  Loading approved hosts...
                </p>
                <div className="mt-4 flex justify-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          ) : hosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center shadow-lg">
                <svg
                  className="w-12 h-12 text-emerald-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-slate-600 text-xl font-medium">
                No approved hosts found
              </p>
              <p className="text-slate-500 mt-2">
                Approved hosts will appear here once available
              </p>
            </div>
          ) : (
            <div className="pb-6">
              {/* Stats Badge */}
              <div className="mb-6 flex items-center justify-between">
                <div className="bg-white px-6 py-3 rounded-2xl shadow-lg border border-emerald-200 floating-badge">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <span className="text-emerald-700 font-bold text-lg">
                        {hosts.length}
                      </span>
                      <span className="text-slate-600 ml-2">
                        Host{hosts.length !== 1 ? "s" : ""} Approved
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hosts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hosts.map((host, index) => (
                  <div
                    key={host._id}
                    className="group bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden card-hover-effect animate-fadeInUp"
                    style={{
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    {/* Card Header */}
                    <div className="p-6 pb-4 bg-gradient-to-r from-slate-50 to-emerald-50">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          {host.profileImage ? (
                            <img
                              src={host.profileImage}
                              alt={host.username}
                              className="w-14 h-14 object-cover rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                              {host.username.charAt(0).toUpperCase()}
                            </div>
                          )}

                          <div>
                            <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-600 transition-colors duration-300">
                              {truncateText(host.username, 15)}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                              <span className="text-sm text-emerald-600 font-medium">
                                Approved
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-emerald-100 p-2 rounded-xl group-hover:bg-emerald-200 transition-colors duration-300">
                          <svg
                            className="w-5 h-5 text-emerald-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 pt-2">
                      <div className="space-y-3">
                        {/* Email */}
                        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl info-card">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                            <svg
                              className="w-5 h-5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                              Email
                            </p>
                            <p
                              className="text-sm text-slate-700 font-medium truncate"
                              title={host.email}
                            >
                              {truncateText(host.email, 25)}
                            </p>
                          </div>
                        </div>

                        {/* Phone */}
                        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl info-card">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
                            <svg
                              className="w-5 h-5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                              />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                              Phone
                            </p>
                            <p className="text-sm text-slate-700 font-medium truncate">
                              {truncateText(host.phone, 15)}
                            </p>
                          </div>
                        </div>

                        {/* Subscription Plan */}
                        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl info-card">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-md">
                            <svg
                              className="w-5 h-5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.516l2.257-1.13a1 1 0 00.502-1.21L8.684 3.947A1 1 0 007.736 3H5z"
                              />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                              Subscription Plan
                            </p>
                            <p className="text-sm text-slate-700 font-medium truncate">
                              {formatPlan(host.subscription?.plan)}
                            </p>
                          </div>
                        </div>

                        {/* Valid Till */}
                        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl info-card">
                          <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md">
                            <svg
                              className="w-5 h-5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v4m0 0h4m-4 0l4-4m-4 4l4 4"
                              />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                              Valid Till
                            </p>
                            <p className="text-sm text-slate-700 font-medium truncate">
                              {host.subscription?.endDate
                                ? new Date(
                                    host.subscription.endDate
                                  ).toLocaleDateString("en-IN")
                                : "N/A"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="bg-gradient-to-r from-slate-50 to-emerald-50 px-6 py-4 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-slate-500">
                            Active Host
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {host.subscription?._id}
                        </div>
                      </div>
                    </div>

                    {/* Hover Effect Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovedHostsPage;
