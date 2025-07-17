import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  MapPin,
  Upload,
  X,
  RefreshCw,
  Home,
  Coffee,
  Camera,
  FileText,
} from "lucide-react";

const HostResubmitForm = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    address: "",
    hostType: "", // Changed from array to string for single selection
    profileImage: null,
    aadhaarCard: null,
    panCard: null,
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        username: user.username || "",
        phone: user.phone || "",
        address: user.address || "",
        hostType: user.hostType || "",
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;

    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else if (type === "radio") {
      setFormData((prev) => ({ ...prev, hostType: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const form = new FormData();
    form.append("username", formData.username);
    form.append("phone", formData.phone);
    form.append("address", formData.address);
    form.append("hostType", formData.hostType);

    if (formData.profileImage) {
      form.append("profileImage", formData.profileImage);
    }
    if (formData.aadhaarCard) {
      form.append("documents", formData.aadhaarCard);
      form.append("documentTypes", "aadhaar");
    }
    if (formData.panCard) {
      form.append("documents", formData.panCard);
      form.append("documentTypes", "pan");
    }

    try {
      await axios.patch(
        "http://localhost:4000/api/auth/profile-resubmit", // ✅ correct endpoint
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("✅ Profile resubmitted successfully. Waiting for admin review.");
      navigate("/waiting-approval");
    } catch (err) {
      console.error("❌ Resubmission error", err);
      alert("Failed to resubmit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <RefreshCw className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Resubmit Your Profile for Approval
          </h1>
          <p className="text-gray-600">
            Update your information and resubmit for super-admin review
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Profile Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Profile Picture
                </label>
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-200 overflow-hidden">
                      {formData.profileImage ? (
                        <img
                          src={URL.createObjectURL(formData.profileImage)}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-gray-400" />
                      )}
                    </div>
                    {formData.profileImage && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            profileImage: null,
                          }))
                        }
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <label className="cursor-pointer flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                    <Upload className="w-4 h-4 text-gray-600 mr-3" />
                    <span className="text-sm font-medium text-gray-700">
                      {formData.profileImage ? "Change Photo" : "Upload Photo"}
                    </span>
                    <input
                      type="file"
                      name="profileImage"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 text-center">
                    JPG, PNG up to 5MB
                  </p>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white/60 transition"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white/60 transition"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Enter your address"
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white/60 transition"
                  />
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Host Type - Single Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What would you like to host?
                </label>
                <div className="space-y-3">
                  {[
                    {
                      value: "hotel",
                      label: "Accommodations",
                      icon: Home,
                      desc: "Hotels, rooms, apartments",
                    },
                    {
                      value: "services",
                      label: "Services",
                      icon: Coffee,
                      desc: "Concierge, transport, tours",
                    },
                    {
                      value: "experiences",
                      label: "Experiences",
                      icon: Camera,
                      desc: "Activities, events, tours",
                    },
                  ].map((item) => (
                    <label
                      key={item.value}
                      className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.hostType === item.value
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="hostType"
                        value={item.value}
                        checked={formData.hostType === item.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${
                          formData.hostType === item.value
                            ? "bg-emerald-500 border-emerald-500"
                            : "border-gray-300"
                        }`}
                      >
                        {formData.hostType === item.value && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <item.icon className="w-5 h-5 text-gray-600 mr-3" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {item.label}
                        </div>
                        <div className="text-xs text-gray-500">{item.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* KYC Documents - Aadhaar and PAN */}
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Upload KYC Documents
                </label>
                <div className="space-y-4">
                  {/* Aadhaar Card */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Aadhaar Card
                    </label>
                    <div className="flex items-center space-x-3">
                      <label className="cursor-pointer flex items-center px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex-1">
                        <FileText className="w-5 h-5 text-gray-600 mr-3" />
                        <div className="flex-1">
                          {/* <span className="text-sm font-medium text-gray-700 block">
                            {formData.aadhaarCard
                              ? formData.aadhaarCard.name
                              : "Choose Aadhaar Card"}
                          </span> */}
                          <span
                            className="text-sm font-medium text-gray-700 block truncate max-w-[100px]"
                            title={
                              formData.aadhaarCard
                                ? formData.aadhaarCard.name
                                : "Choose Aadhaar Card"
                            }
                          >
                            {formData.aadhaarCard
                              ? formData.aadhaarCard.name
                              : "Choose Aadhaar Card"}
                          </span>

                          <span className="text-xs text-gray-500">
                            PDF, JPG, PNG files
                          </span>
                        </div>
                        <Upload className="w-4 h-4 text-gray-600 ml-2" />
                        <input
                          type="file"
                          name="aadhaarCard"
                          onChange={handleChange}
                          accept=".pdf,image/*"
                          className="hidden"
                        />
                      </label>
                      {formData.aadhaarCard && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              aadhaarCard: null,
                            }))
                          }
                          className="w-10 h-10 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* PAN Card */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PAN Card
                    </label>
                    <div className="flex items-center space-x-3">
                      <label className="cursor-pointer flex items-center px-4 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex-1">
                        <FileText className="w-5 h-5 text-gray-600 mr-3" />
                        <div className="flex-1">
                          {/* <span className="text-sm font-medium text-gray-700 block">
                            {formData.panCard
                              ? formData.panCard.name
                              : "Choose PAN Card"}
                          </span> */}
                          <span
                            className="text-sm font-medium text-gray-700 block truncate max-w-[100px]"
                            title={
                              formData.panCard
                                ? formData.panCard.name
                                : "Choose PAN Card"
                            }
                          >
                            {formData.panCard
                              ? formData.panCard.name
                              : "Choose PAN Card"}
                          </span>

                          <span className="text-xs text-gray-500">
                            PDF, JPG, PNG files
                          </span>
                        </div>
                        <Upload className="w-4 h-4 text-gray-600 ml-2" />
                        <input
                          type="file"
                          name="panCard"
                          onChange={handleChange}
                          accept=".pdf,image/*"
                          className="hidden"
                        />
                      </label>
                      {formData.panCard && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, panCard: null }))
                          }
                          className="w-10 h-10 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition disabled:opacity-50 shadow-lg"
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full mr-2" />
                  Submitting...
                </div>
              ) : (
                "Resubmit for Approval"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HostResubmitForm;
