import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

import {
  fetchHostProfileAPI,
  updateHostProfileAPI,
} from "../api/allAPIs";



const HostProfile = () => {
  const { user, token, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    address: "",
    profileImage: "",
  });

  const [profilePreview, setProfilePreview] = useState("");
  const [loading, setLoading] = useState(false);

  // Prefill from user context
  // const fetchHostProfile = async () => {
  //   try {
  //     const res = await axios.get(
  //       "http://localhost:4000/api/user/host-profile",
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     const userData = res.data.user;
  //     setFormData({
  //       username: userData.username || "",
  //       phone: userData.phone || "",
  //       address: userData.address || "",
  //       profileImage: userData.profileImage || "",
  //     });

  //     setProfilePreview(userData.profileImage || "");
  //   } catch (err) {
  //     toast.error("Failed to fetch host profile");
  //   }
  // };
  const fetchHostProfile = async () => {
  try {
    const userData = await fetchHostProfileAPI(token);
    setFormData({
      username: userData.username || "",
      phone: userData.phone || "",
      address: userData.address || "",
      profileImage: userData.profileImage || "",
    });
    setProfilePreview(userData.profileImage || "");
  } catch (err) {
    toast.error("Failed to fetch host profile");
  }
};


  useEffect(() => {
    fetchHostProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData((prev) => ({ ...prev, profileImage: file }));
    setProfilePreview(URL.createObjectURL(file));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   try {
  //     const form = new FormData();
  //     form.append("username", formData.username);
  //     form.append("phone", formData.phone);
  //     form.append("address", formData.address);

  //     if (formData.profileImage instanceof File) {
  //       form.append("profileImage", formData.profileImage);
  //     }

  //     const res = await axios.put(
  //       "http://localhost:4000/api/user/host-profile-update",
  //       form,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );

  //     // ✅ Update user in context
  //     updateUser(res.data.user);

  //     // ✅ Reflect updated values in local UI
  //     setFormData({
  //       username: res.data.user.username || "",
  //       phone: res.data.user.phone || "",
  //       address: res.data.user.address || "",
  //       profileImage: res.data.user.profileImage || "",
  //     });
  //     setProfilePreview(res.data.user.profileImage || "");

  //     toast.success("Profile updated successfully!");
  //   } catch (err) {
  //     toast.error(err?.response?.data?.message || "Update failed");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const updatedUser = await updateHostProfileAPI(token, formData);
    updateUser(updatedUser);
    setFormData({
      username: updatedUser.username || "",
      phone: updatedUser.phone || "",
      address: updatedUser.address || "",
      profileImage: updatedUser.profileImage || "",
    });
    setProfilePreview(updatedUser.profileImage || "");
    toast.success("Profile updated successfully!");
  } catch (err) {
    toast.error(err?.response?.data?.message || "Update failed");
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col p-4 sm:p-6">
      <div className="max-w-4xl w-full mx-auto flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-5 shrink-0">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-1 sm:mb-2">
            Host Profile Settings
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your host profile information
          </p>
        </div>

        {/* Scrollable Form Area */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100 flex-1 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="space-y-6 sm:space-y-8 p-4 sm:p-6"
          >
            {/* Profile Image Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt="Profile Preview"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-blue-100 shadow-lg"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center shadow-lg">
                    <span className="text-white text-2xl sm:text-3xl font-bold">
                      {(user?.username || "U").charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-2 shadow-lg">
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
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.072 4h3.856a2 2 0 011.664.89l.812 1.22A2 2 0 0017.07 7H18a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="m15 8-3 3-3-3"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col items-center space-y-2 w-full max-w-xs">
                <label className="text-sm font-medium text-gray-700">
                  Profile Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {/* Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition text-base"
                  placeholder="Enter your name"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition text-base"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* Address */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition text-base"
                  placeholder="Enter your address"
                />
              </div>
            </div>

            {/* Read-only Fields */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed text-base"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Role
                  </label>
                  <input
                    type="text"
                    value={user?.role || ""}
                    disabled
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed text-base"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Host Type
                  </label>
                  <input
                    type="text"
                    value={
                      Array.isArray(user?.hostType)
                        ? user.hostType.join(", ")
                        : ""
                    }
                    disabled
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed text-base"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px] text-base"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>Update Profile</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HostProfile;
