import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { registerUser } from "../api/allAPIs";

import axios from "axios";
import {
  User,
  Mail,
  Lock,
  Phone,
  MapPin,
  Building,
  Home,
  Coffee,
  Camera,
  Upload,
  X,
  FileText,
} from "lucide-react";

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, bookingData } = useAuth();
  const [kycDocs, setKycDocs] = useState([]);
  const [docTypes, setDocTypes] = useState([]);

  // ✅ Detect if host is registering via ?role=host
  const isHostRegistration =
    new URLSearchParams(location.search).get("role") === "host";

  // ✅ Set default role based on query param
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: isHostRegistration ? "host" : "user",
    hostType: "",
    profileImage: null,
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else if (type === "radio") {
      setFormData((prev) => ({ ...prev, [name]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   setIsLoading(true);

  //   try {
  //     const form = new FormData();
  //     for (const key in formData) {
  //       if (key === "hostType" && formData.role === "host") {
  //         form.append("hostType", formData.hostType);
  //       } else if (key !== "hostType" && formData[key]) {
  //         form.append(key, formData[key]);
  //       }
  //     }

  //     // ✅ Add KYC documents
  //     if (formData.role === "host") {
  //       kycDocs.forEach((file) => {
  //         if (file) form.append("documents", file);
  //       });

  //       docTypes.forEach((type) => {
  //         form.append("documentTypes", type);
  //       });
  //     }

  //     const res = await axios.post(
  //       "http://localhost:4000/api/auth/register",
  //       form,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );

  //     localStorage.setItem("pendingEmail", formData.email);
  //     navigate("/verify-otp");
  //   } catch (err) {
  //     setError(
  //       err.response?.data?.message || "Registration failed. Try again later."
  //     );
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  try {
    await registerUser(formData, kycDocs, docTypes);

    localStorage.setItem("pendingEmail", formData.email);
    navigate("/verify-otp");
  } catch (err) {
    setError(
      err.response?.data?.message || "Registration failed. Try again later."
    );
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {formData.role === "host"
              ? "Become a Host on Ghumakad"
              : "Join Ghumakad"}
          </h1>
          <p className="text-gray-600">
            {formData.role === "host"
              ? "Create your host account to start listing properties, services or experiences"
              : "Create your account to start booking amazing stays"}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/20"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          {/* Profile Image */}
          <div className="mb-6">
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
                      setFormData((prev) => ({ ...prev, profileImage: null }))
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

          {/* Input Fields */}
          {[
            ["username", User],
            ["email", Mail],
            ["password", Lock],
            ["phone", Phone],
            ["address", MapPin],
          ].map(([name, Icon]) => (
            <div className="mb-6" key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-2 capitalize">
                {name}
              </label>
              <div className="relative">
                <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={name === "password" ? "password" : "text"}
                  name={name}
                  required={name !== "phone" && name !== "address"}
                  value={formData[name]}
                  onChange={handleChange}
                  placeholder={`Enter your ${name}`}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white/60 transition"
                />
              </div>
            </div>
          ))}

          {/* Role Select */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {["user", "host"].map((role) => (
                <label
                  key={role}
                  className={`relative flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.role === role
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={formData.role === role}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="text-center">
                    {role === "user" ? <User /> : <Building />}
                    <span className="text-sm font-medium text-gray-700 block mt-2">
                      {role === "user" ? "Guest" : "Host"}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Host Type Select */}
          {formData.role === "host" && (
            <div className="mb-6 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
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
                        ? "border-emerald-500 bg-emerald-100"
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
          )}

          {/* KYC Document Upload (Only for Host) */}
          {formData.role === "host" && (
            <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Upload Mandatory KYC Documents
              </label>
              <div className="space-y-4">
                {[
                  { label: "Aadhaar Card", docType: "aadhaar" },
                  { label: "PAN Card", docType: "pan" },
                ].map((item, index) => (
                  <div key={item.docType}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {item.label}
                    </label>

                    {!kycDocs[index] ? (
                      <label
                        className={`cursor-pointer flex items-center justify-center px-4 py-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-100 transition ${
                          isLoading ? "pointer-events-none opacity-50" : ""
                        }`}
                      >
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <span className="text-sm font-medium text-gray-700">
                            Upload {item.label}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            JPG, PNG, PDF up to 5MB
                          </p>
                        </div>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          required
                          disabled={isLoading}
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              const updated = [...kycDocs];
                              updated[index] = e.target.files[0];
                              setKycDocs(updated);

                              const types = [...docTypes];
                              types[index] = item.docType;
                              setDocTypes(types);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                          {/* <div className="flex items-center">
                            {kycDocs[index].type.startsWith("image/") ? (
                              <Camera className="w-5 h-5 text-blue-500 mr-2" />
                            ) : (
                              <FileText className="w-5 h-5 text-red-500 mr-2" />
                            )}
                            <span className="text-sm font-medium text-gray-700">
                              {kycDocs[index].name}
                            </span>
                          </div> */}

                          <div className="flex items-center">
                            {kycDocs[index].type.startsWith("image/") ? (
                              <Camera className="w-5 h-5 text-blue-500 mr-2" />
                            ) : (
                              <FileText className="w-5 h-5 text-red-500 mr-2" />
                            )}
                            <span
                              className="text-sm font-medium text-gray-700 max-w-[150px] truncate whitespace-nowrap overflow-hidden"
                              title={kycDocs[index].name} 
                            >
                              {kycDocs[index].name}
                            </span>
                          </div>

                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => {
                              const updated = [...kycDocs];
                              updated[index] = null;
                              setKycDocs(updated);

                              const types = [...docTypes];
                              types[index] = null;
                              setDocTypes(types);
                            }}
                            className={`p-1 text-red-500 hover:bg-red-50 rounded transition ${
                              isLoading ? "pointer-events-none opacity-50" : ""
                            }`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        {/* File Preview */}
                        {kycDocs[index].type.startsWith("image/") && (
                          <div className="mb-3">
                            <img
                              src={URL.createObjectURL(kycDocs[index])}
                              alt={`${item.label} preview`}
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                          </div>
                        )}

                        {/* File Info */}
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>
                            Size:{" "}
                            {(kycDocs[index].size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <p>Type: {kycDocs[index].type}</p>
                        </div>

                        {/* Change File Button */}
                        <label
                          className={`cursor-pointer inline-flex items-center px-3 py-1 mt-3 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition ${
                            isLoading ? "pointer-events-none opacity-50" : ""
                          }`}
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Change File
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            disabled={isLoading}
                            onChange={(e) => {
                              if (e.target.files[0]) {
                                const updated = [...kycDocs];
                                updated[index] = e.target.files[0];
                                setKycDocs(updated);

                                const types = [...docTypes];
                                types[index] = item.docType;
                                setDocTypes(types);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 transition disabled:opacity-50 shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full mr-2" />
                Creating Account...
              </div>
            ) : (
              "Create Account"
            )}
          </button>

          {/* Login Link */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() =>
                  navigate(
                    formData.role === "host" ? "/login?type=host" : "/login"
                  )
                }
                className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline transition"
              >
                Sign in here
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
