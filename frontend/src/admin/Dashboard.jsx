

import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { IndianRupee, Star, Building2, Users, TrendingUp, Award, Calendar, MapPin } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, token, loading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

    const navigate = useNavigate();
  // ✅ Robust hostType extraction
  const hostType = Array.isArray(user?.hostType)
    ? user.hostType[0]
    : user?.hostType || "hotel";

  // ✅ Dynamic API based on hostType
  // const getDashboardStatsUrl = (hostType) => {
  //   switch (hostType) {
  //     case "hotel":
  //       return "http://localhost:4000/api/host/dashboard/stats";
  //     case "services":
  //       return "http://localhost:4000/api/services/dashboard/stats";
  //     case "experiences":
  //       return "http://localhost:4000/api/experiences/dashboard/stats";
  //     default:
  //       return "";
  //   }
  // };
  // Get dashboard stats URL based on host type
 const getDashboardStatsUrl = (hostType) => {
  const base = "http://localhost:4000/api";

  switch (hostType) {
    case "hotel":
      return `${base}/host/dashboard/stats`;
    case "services":
      return `${base}/services/dashboard/stats`;
    case "experiences":
      return `${base}/experiences/dashboard/stats`;
    default:
      return "";
  }
};


  const getTypeIcon = () => {
    switch (hostType) {
      case "hotel":
        return <Building2 className="w-6 h-6" />;
      case "services":
        return <Users className="w-6 h-6" />;
      case "experiences":
        return <Calendar className="w-6 h-6" />;
      default:
        return <Building2 className="w-6 h-6" />;
    }
  };

  const getTypeColor = () => {
    switch (hostType) {
      case "hotel":
        return "from-blue-500 to-indigo-600";
      case "services":
        return "from-purple-500 to-pink-600";
      case "experiences":
        return "from-green-500 to-emerald-600";
      default:
        return "from-blue-500 to-indigo-600";
    }
  };

  useEffect(() => {
    if (!token || !user) return;

    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const url = getDashboardStatsUrl(hostType);
        if (!url) throw new Error("Invalid host type");

        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setStats(res.data.stats);
      } catch (err) {
        console.error("Stats error:", err.message);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [user, token, hostType]); // ✅ added hostType here too

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "host")
    return <Navigate to="/login?type=host" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8 border border-gray-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <div className="relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <div className={`p-4 bg-gradient-to-r ${getTypeColor()} rounded-2xl text-white shadow-lg`}>
                {getTypeIcon()}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                  Welcome back, {user?.username} 👋
                </h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <span>You are hosting:</span>
                  <span className={`capitalize font-semibold px-3 py-1 rounded-full text-sm bg-gradient-to-r ${getTypeColor()} text-white shadow-sm`}>
                    {hostType}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-sm sm:text-base">
              Here's an overview of your {hostType} performance and statistics
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          {loadingStats ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 text-lg">Loading dashboard data...</p>
            </div>
          ) : !stats ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-red-500 text-2xl">⚠️</span>
              </div>
              <p className="text-gray-500 text-lg">Unable to load dashboard data</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Dashboard Overview</h2>
                <p className="text-gray-600">Your business performance at a glance</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <StatCard
                  icon={<Building2 className="text-emerald-500" />}
                  label="Total Listings"
                  value={stats.totalListings}
                  bgColor="bg-emerald-50"
                  borderColor="border-emerald-200"
                  index={0}
                />
                <StatCard
                  icon={<Users className="text-yellow-500" />}
                  label="Total Bookings"
                  value={stats.totalBookings}
                  bgColor="bg-yellow-50"
                  borderColor="border-yellow-200"
                  index={1}
                />
                <StatCard
                  icon={<IndianRupee className="text-blue-500" />}
                  label="Total Earnings"
                  value={`₹${stats.totalEarnings}`}
                  bgColor="bg-blue-50"
                  borderColor="border-blue-200"
                  index={2}
                />
                <StatCard
                  icon={<Star className="text-orange-500" />}
                  label="Average Rating"
                  value={stats.averageRating?.toFixed(1) || "0"}
                  bgColor="bg-orange-50"
                  borderColor="border-orange-200"
                  index={3}
                />
              </div>
            </>
          )}
        </div>

        {/* Quick Actions Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Quick Actions</h2>
            <p className="text-gray-600">Manage your {hostType} business efficiently</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickActionCard
              icon={<TrendingUp className="text-green-500" />}
              title="View Analytics"
              description="Check your performance metrics"
              bgColor="bg-green-50"
              index={0}
              onClick={() => navigate("/host/bookings")}
            />
            <QuickActionCard
              icon={<Award className="text-purple-500" />}
              title="Manage Reviews"
              description="Respond to customer feedback"
              bgColor="bg-purple-50"
              index={1}
              onClick={() => navigate("/host/reviews")}
            />
            <QuickActionCard
              icon={<MapPin className="text-red-500" />}
              title="Update Listings"
              description="Edit your {hostType} information"
              bgColor="bg-red-50"
              index={2}
              onClick={() => navigate("/host/listings")}
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
      animation: "slideInUp 0.6s ease-out forwards"
    }}
  >
    <div className="bg-white p-3 sm:p-4 rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300">
      {icon}
    </div>
    <div className="flex-1">
      <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1">{label}</p>
      <h3 className="text-lg sm:text-2xl font-bold text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
        {value}
      </h3>
    </div>
  </div>
);

const QuickActionCard = ({ icon, title, description, bgColor, index }) => (
  <div 
    className={`${bgColor} rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group border border-gray-100`}
    style={{
      animationDelay: `${(index + 4) * 150}ms`,
      animation: "slideInUp 0.6s ease-out forwards"
    }}
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="bg-white p-2 sm:p-3 rounded-xl shadow-md group-hover:shadow-lg transition-shadow duration-300">
        {icon}
      </div>
      <h3 className="text-base sm:text-lg font-bold text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
        {title}
      </h3>
    </div>
    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{description}</p>
  </div>
);

export default Dashboard;

<style jsx>{`
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
`}</style>