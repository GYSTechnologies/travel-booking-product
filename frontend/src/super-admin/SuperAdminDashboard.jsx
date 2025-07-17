import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Users,
  CheckCircle,
  Clock,
  Building2,
  Wrench,
  Calendar,
  Crown,
  TrendingUp,
  Settings,
  UserCheck,
} from "lucide-react";

import { fetchDashboardStats } from "../api/allAPIs"; // centralized import

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const fetchStats = async () => {
  //     try {
  //       const token = localStorage.getItem("adminToken");
  //       if (!token || token === "undefined") {
  //         throw new Error("No valid token found");
  //       }

  //       const res = await axios.get("http://localhost:4000/api/super-admin/dashboard/overview", {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       setStats(res.data);
  //     } catch (err) {
  //       console.error("Failed to fetch dashboard stats", err);

  //       if (err.response?.status === 401) {
  //         // Token invalid or expired — logout and redirect
  //         localStorage.removeItem("adminToken");
  //         localStorage.removeItem("adminData");
  //         navigate("/super-admin/login");
  //       }
  //     }
  //   };

  //   fetchStats();
  // }, [navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        if (!token || token === "undefined") {
          throw new Error("No valid token found");
        }

        const data = await fetchDashboardStats(token);
        setStats(data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("adminToken");
          localStorage.removeItem("adminData");
          navigate("/super-admin/login");
        }
      }
    };

    fetchStats();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8 border border-gray-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <div className="relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg">
                <Crown className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  Super Admin Dashboard 👑
                </h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>Platform Overview:</span>
                  <span className="capitalize font-semibold px-3 py-1 rounded-full text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm">
                    Administrator
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-sm sm:text-base">
              Monitor and manage your platform's performance and statistics
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          {!stats ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 text-lg">
                Loading dashboard stats...
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                  Platform Overview
                </h2>
                <p className="text-gray-600">
                  Your platform's performance at a glance
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                  icon={<Users className="text-blue-500" />}
                  label="Total Hosts"
                  value={stats.totalHosts}
                  bgColor="bg-blue-50"
                  borderColor="border-blue-200"
                  index={0}
                />
                <StatCard
                  icon={<CheckCircle className="text-green-500" />}
                  label="Approved Hosts"
                  value={stats.approvedHosts}
                  bgColor="bg-green-50"
                  borderColor="border-green-200"
                  index={1}
                />
                <StatCard
                  icon={<Clock className="text-yellow-500" />}
                  label="Pending Hosts"
                  value={stats.pendingHosts}
                  bgColor="bg-yellow-50"
                  borderColor="border-yellow-200"
                  index={2}
                />
                <StatCard
                  icon={<Building2 className="text-purple-500" />}
                  label="Hotels"
                  value={stats.hotels}
                  bgColor="bg-purple-50"
                  borderColor="border-purple-200"
                  index={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-4 sm:mt-6">
                <StatCard
                  icon={<Wrench className="text-pink-500" />}
                  label="Services"
                  value={stats.services}
                  bgColor="bg-pink-50"
                  borderColor="border-pink-200"
                  index={4}
                />
                <StatCard
                  icon={<Calendar className="text-indigo-500" />}
                  label="Experiences"
                  value={stats.experiences}
                  bgColor="bg-indigo-50"
                  borderColor="border-indigo-200"
                  index={5}
                />
                <StatCard
                  icon={<Crown className="text-orange-500" />}
                  label="Active Subscriptions"
                  value={stats.activeSubscriptions}
                  bgColor="bg-orange-50"
                  borderColor="border-orange-200"
                  index={6}
                />
              </div>
            </>
          )}
        </div>

        {/* Quick Actions Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              Quick Actions
            </h2>
            <p className="text-gray-600">Manage your platform efficiently</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickActionCard
              icon={<UserCheck className="text-green-500" />}
              title="Manage Hosts"
              description="Review and approve host applications"
              bgColor="bg-green-50"
              index={0}
              onClick={() => navigate("/super-admin/hosts")}
            />
            <QuickActionCard
              icon={<TrendingUp className="text-purple-500" />}
              title="View Analytics"
              description="Check platform performance metrics"
              bgColor="bg-purple-50"
              index={1}
              onClick={() => navigate("/super-admin/analytics")}
            />
            <QuickActionCard
              icon={<Settings className="text-red-500" />}
              title="Platform Settings"
              description="Configure system preferences"
              bgColor="bg-red-50"
              index={2}
              onClick={() => navigate("/super-admin/settings")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, bgColor, borderColor, index }) => (
  <div
    className={`${bgColor} ${borderColor} border-2 rounded-2xl p-4 sm:p-6 flex items-center gap-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 cursor-pointer group`}
    style={{
      animationDelay: `${index * 150}ms`,
      animation: "slideInUp 0.6s ease-out forwards",
    }}
  >
    <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">
        {label}
      </p>
      <h3 className="text-lg sm:text-2xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
        {value}
      </h3>
    </div>
  </div>
);

const QuickActionCard = ({
  icon,
  title,
  description,
  bgColor,
  index,
  onClick,
}) => (
  <div
    className={`${bgColor} rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group border border-gray-100`}
    style={{
      animationDelay: `${(index + 7) * 150}ms`,
      animation: "slideInUp 0.6s ease-out forwards",
    }}
    onClick={onClick}
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="bg-white p-2 sm:p-3 rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300">
        {icon}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
        {title}
      </h3>
    </div>
    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
      {description}
    </p>
  </div>
);

export default SuperAdminDashboard;

<style>{`
  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`}</style>;
