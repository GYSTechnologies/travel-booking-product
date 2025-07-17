import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

import { fetchUserProfile, updateUserProfile } from "../api/allAPIs";


const UserProfilePage = () => {
  const { token, user, setUser } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    profileImage: "",
  });

  const [newImage, setNewImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   const fetchProfile = async () => {
  //     try {
  //       const res = await axios.get("http://localhost:4000/api/user/profile", {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       const data = res.data;
  //       setFormData({
  //         username: data.username || "",
  //         email: data.email || "",
  //         phone: data.phone || "",
  //         address: data.address || "",
  //         profileImage: data.profileImage || "",
  //       });
  //     } catch (err) {
  //       toast.error("Failed to fetch profile");
  //       console.error(err);
  //     }
  //   };
  //   if (token) fetchProfile();
  // }, [token]);

  useEffect(() => {
  const loadProfile = async () => {
    try {
      const data = await fetchUserProfile(token);
      setFormData({
        username: data.username || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        profileImage: data.profileImage || "",
      });
    } catch (err) {
      toast.error("Failed to fetch profile");
      console.error(err);
    }
  };

  if (token) loadProfile();
}, [token]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setFormData((prev) => ({
        ...prev,
        profileImage: URL.createObjectURL(file),
      }));
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);
  //   try {
  //     const fd = new FormData();
  //     fd.append("username", formData.username);
  //     fd.append("phone", formData.phone);
  //     fd.append("address", formData.address);
  //     if (newImage) fd.append("profileImage", newImage);

  //     const res = await axios.put("http://localhost:4000/api/user/update", fd, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });

  //     toast.success("Profile updated!");
  //     setUser(res.data.user);
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || "Update failed");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await updateUserProfile(token, formData, newImage);
    toast.success("Profile updated!");
    setUser(res.user);
  } catch (err) {
    toast.error(err.response?.data?.message || "Update failed");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-4 px-4 sm:py-8 lg:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Profile Image */}
        <div className="text-center mb-8 lg:mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="w-36 h-36 relative">
                <img
                  src={
                    newImage
                      ? formData.profileImage
                      : formData.profileImage
                      ? formData.profileImage // ✅ no localhost here
                      : "/default-avatar.png"
                  }
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-emerald-100 group-hover:ring-emerald-200"
                />

                <label className="absolute bottom-2 right-2 bg-gradient-to-r from-emerald-600 to-teal-600 p-3 rounded-full cursor-pointer hover:from-emerald-700 hover:to-teal-700 transform hover:scale-110 transition-all duration-200 shadow-lg">
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
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
            Your Profile
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Manage your account information and preferences
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="text-gray-700 font-medium block mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="text-gray-700 font-medium block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed"
                    value={formData.email}
                    disabled
                  />
                </div>
                <div>
                  <label className="text-gray-700 font-medium block mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    name="phone"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="text-gray-700 font-medium block mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
                    value={formData.address}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-6 font-semibold text-white rounded-xl text-base transition-all duration-300 shadow-xl ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 hover:shadow-2xl"
                }`}
              >
                {loading ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
