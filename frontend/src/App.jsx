import React, { useState } from "react";
import axios from "axios";
import { Routes, Route } from "react-router-dom";

import HomePage from "./pages/HomePage.jsx";
import ExperiencePage from "./pages/ExperiencePage.jsx";
import ServicePage from "./pages/ServicesPage.jsx";
import HotelDetail from "./components/HotelDetail.jsx";
import ConfirmAndPayPage from "./pages/ConfirmAndPayPage.jsx";
import BookingHistoryPage from "./components/BookingHistoryPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import PaymentSuccess from "./pages/PaymentSuccess.jsx";
import OtpVerificationPage from "./pages/OtpVerificationPage.jsx";
import UserProfilePage from "./pages/UserProfilePage.jsx";
import ExperienceDetail from "./components/ExperienceDetail.jsx";
import ServiceDetail from "./components/ServiceDetail.jsx";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "react-hot-toast";

// Host/Admin
import HostRoute from "./routes/HostRoute";
import HostLayout from "./layouts/HostLayout.jsx";
import HostDashboard from "./admin/Dashboard.jsx";
import HostListings from "./admin/Listings.jsx";
import HostBookings from "./admin/Bookings.jsx";
import HostReviews from "./admin/Reviews.jsx";
import HostProfile from "./admin/HostProfile.jsx";

// Main
import MainLayout from "./layouts/MainLayout.jsx";
import SubscriptionPage from "./admin/SubscriptionPage.jsx";

// Super Admin
import AdminLoginPage from "./super-admin/AdminLoginPage.jsx";
import AdminRegisterPage from "./super-admin/AdminRegisterPage.jsx";
import SuperAdminLayout from "./layouts/SuperAdminLayout.jsx";
import PendingHostsPage from "./super-admin/PendingHostsPage.jsx";
import ApprovedHostsPage from "./super-admin/ApprovedHostsPage.jsx";
import RejectedHostsPage from "./super-admin/RejectedHostsPage.jsx";
import PendingListingsPage from "./super-admin/PendingListingsPage.jsx";
import AllListingsPage from "./super-admin/AllListingsPage.jsx";
import SuperAdminProfilePage from "./super-admin/SuperAdminProfilePage.jsx";
import SuperAdminDashboard from "./super-admin/SuperAdminDashboard.jsx";
import WaitingForApprovalPage from "./admin/WaitingForApprovalPage.jsx";
import ApprovedListingsPage from "./super-admin/ApprovedListingsPage.jsx";
import RejectedListingsPage from "./super-admin/RejectedListingsPage.jsx";
import MagicLogin from "./admin/MagicLogin.jsx";
import HostResubmitForm from "./admin/HostResubmitForm.jsx";

function App() {
  const [tab, setTab] = useState("hotel");

  const [searchDataMap, setSearchDataMap] = useState({
    hotel: { location: "", checkIn: "", checkOut: "", guests: "" },
    service: { location: "", date: "", type: "" },
    experience: { location: "", date: "" },
  });

  const [searchResultsMap, setSearchResultsMap] = useState({
    hotel: [],
    service: [],
    experience: [],
  });

  const [hasSearchedMap, setHasSearchedMap] = useState({
    hotel: false,
    service: false,
    experience: false,
  });

  const handleSearch = async () => {
    const searchData = searchDataMap[tab];
    const { location, checkIn, checkOut, guests, date, type } = searchData;

    if (!location) return alert("Please enter a location");

    try {
      let url = "";
      if (tab === "hotel") url = "http://localhost:4000/api/host/all-hotels";
      if (tab === "service")
        url = "http://localhost:4000/api/services/all-services";
      if (tab === "experience")
        url = "http://localhost:4000/api/experiences/all-experiences";

      const res = await axios.get(url, {
        params: {
          place: location,
          checkIn,
          checkOut,
          guests: guests || 1,
          date,
          type,
        },
      });

      setSearchResultsMap((prev) => ({ ...prev, [tab]: res.data }));
      setHasSearchedMap((prev) => ({ ...prev, [tab]: true }));
    } catch (err) {
      console.error("Search error:", err);
      setSearchResultsMap((prev) => ({ ...prev, [tab]: [] }));
      setHasSearchedMap((prev) => ({ ...prev, [tab]: true }));
    }
  };

  return (
    <>
      <Routes>
        {/* Public Pages with MainLayout */}
        <Route
          element={
            <MainLayout
              searchData={searchDataMap[tab]}
              setSearchData={(newData) =>
                setSearchDataMap((prev) => ({ ...prev, [tab]: newData }))
              }
              handleSearch={handleSearch}
              activeTab={tab}
              setActiveTab={setTab}
              resetSearch={() => {
                setSearchDataMap((prev) => ({
                  ...prev,
                  [tab]: {
                    location: "",
                    checkIn: "",
                    checkOut: "",
                    guests: "",
                    date: "",
                    type: "",
                  },
                }));
                setSearchResultsMap((prev) => ({ ...prev, [tab]: [] }));
                setHasSearchedMap((prev) => ({ ...prev, [tab]: false }));
              }}
            />
          }
        >
          <Route
            path="/"
            element={
              <HomePage
                tab={tab}
                searchData={searchDataMap[tab]}
                setSearchData={(newData) =>
                  setSearchDataMap((prev) => ({ ...prev, [tab]: newData }))
                }
                searchResults={searchResultsMap[tab]}
                hasSearched={hasSearchedMap[tab]}
              />
            }
          />
          <Route path="/experiences" element={<ExperiencePage />} />
          <Route path="/services" element={<ServicePage />} />
          <Route path="/hotel/:id" element={<HotelDetail />} />
          <Route path="/service/:id" element={<ServiceDetail />} />
          <Route path="/experience/:id" element={<ExperienceDetail />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-otp" element={<OtpVerificationPage />} />
          <Route path="/user-profile" element={<UserProfilePage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/confirm" element={<ConfirmAndPayPage />} />
            <Route path="/booking-history" element={<BookingHistoryPage />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
          </Route>
        </Route>

        {/* Host Routes */}
        <Route path="/host/subscription" element={<SubscriptionPage />} />
        <Route path="/waiting-approval" element={<WaitingForApprovalPage />} />

        <Route path="/magic-login" element={<MagicLogin />} />
        <Route path="/host-resubmit" element={<HostResubmitForm />} />

        <Route path="/host" element={<HostRoute />}>
          <Route element={<HostLayout />}>
            <Route path="dashboard" element={<HostDashboard />} />
            <Route path="listings" element={<HostListings />} />
            <Route path="bookings" element={<HostBookings />} />
            <Route path="reviews" element={<HostReviews />} />
            <Route path="profile" element={<HostProfile />} />
          </Route>
        </Route>

        {/* Super Admin Routes */}
        <Route path="/super-admin/register" element={<AdminRegisterPage />} />
        <Route path="/super-admin/login" element={<AdminLoginPage />} />

        <Route path="/super-admin" element={<SuperAdminLayout />}>
          <Route path="dashboard" element={<SuperAdminDashboard />} />
          <Route path="hosts/pending" element={<PendingHostsPage />} />
          <Route path="hosts/approved" element={<ApprovedHostsPage />} />
          <Route path="hosts/rejected" element={<RejectedHostsPage />} />
          <Route path="listings/pending" element={<PendingListingsPage />} />
          <Route path="listings/approved" element={<ApprovedListingsPage />} />
          <Route path="listings/rejected" element={<RejectedListingsPage />} />
          <Route path="listings/all" element={<AllListingsPage />} />
          <Route path="profile" element={<SuperAdminProfilePage />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<h1>404 - Not Found</h1>} />
      </Routes>

      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;
