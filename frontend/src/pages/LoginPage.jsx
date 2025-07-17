import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";

import { Mail, Lock, Building, Eye, EyeOff, ArrowRight } from "lucide-react";
import {
  loginUser,
  getSubscriptionStatus,
} from "../api/allAPIs";


const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, bookingData } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Detect if host login from query param
  const isHostLogin =
    new URLSearchParams(location.search).get("type") === "host";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   setIsLoading(true);

  //   try {
  //     const res = await axios.post(
  //       "http://localhost:4000/api/auth/login",
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     const { user, token } = res.data;

  //     login(user, token);

  //     if (isHostLogin && user.role === "host") {
  //       const subRes = await axios.get(
  //         "http://localhost:4000/api/subscription/status",
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );

  //       const { isActive } = subRes.data;

  //       if (!isActive) {
  //         // 🛑 Not subscribed yet
  //         navigate("/host/subscription");
  //       } else if (!user.isHostApproved) {
  //         // 🟡 Subscribed but still waiting for approval
  //         navigate("/waiting-approval");
  //       } else {
  //         // ✅ Subscribed + Approved
  //         navigate("/host/dashboard");
  //       }
  //     } else if (!isHostLogin && user.role === "user") {
  //       bookingData ? navigate("/confirm") : navigate("/");
  //     } else {
  //       setError(
  //         isHostLogin
  //           ? "This account is not registered as a host."
  //           : "This account is not a user account."
  //       );
  //     }
  //   } catch (err) {
  //     setError(err.response?.data?.message || "Login failed. Try again later.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  try {
    const { user, token } = await loginUser(formData);
    login(user, token);

    if (isHostLogin && user.role === "host") {
      const { isActive } = await getSubscriptionStatus(token);

      if (!isActive) {
        navigate("/host/subscription");
      } else if (!user.isHostApproved) {
        navigate("/waiting-approval");
      } else {
        navigate("/host/dashboard");
      }
    } else if (!isHostLogin && user.role === "user") {
      bookingData ? navigate("/confirm") : navigate("/");
    } else {
      setError(
        isHostLogin
          ? "This account is not registered as a host."
          : "This account is not a user account."
      );
    }
  } catch (err) {
    setError(err.response?.data?.message || "Login failed. Try again later.");
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="h-[90vh] bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            {isHostLogin
              ? "Host Login - Sign in to manage your listings"
              : "Sign in to your Ghumakad account"}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/60"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline transition"
            >
              Forgot password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            onClick={handleSubmit}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-600 focus:ring-4 focus:ring-emerald-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg group"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                Sign In
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </button>

          {/* Register Link */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() =>
                  navigate(isHostLogin ? "/register?role=host" : "/register")
                }
                className="text-emerald-600 hover:text-emerald-700 font-medium hover:underline transition"
              >
                Create account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
