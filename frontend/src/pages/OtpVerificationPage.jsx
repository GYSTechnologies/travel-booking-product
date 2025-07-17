import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import { verifyOtp, getSubscriptionStatus } from "../api/allAPIs";

const VerifyOtpPage = () => {
  const navigate = useNavigate();
  const { login, bookingData } = useAuth();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [email, setEmail] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    const storedEmail = localStorage.getItem("pendingEmail");
    const storedRole = localStorage.getItem("pendingRole");

    if (!storedEmail) {
      navigate("/register");
    } else {
      setEmail(storedEmail);
      if (storedRole === "host") setIsHost(true);
    }
  }, [navigate]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      handleVerify(e);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 6);
    const split = pasted.split("").concat(Array(6).fill("")).slice(0, 6);
    setOtp(split);
    const next = split.findIndex((v) => v === "");
    inputRefs.current[next === -1 ? 5 : next]?.focus();
  };

  // const handleVerify = async (e) => {
  //   e.preventDefault();
  //   setError("");

  //   const otpString = otp.join("");
  //   if (otpString.length !== 6) {
  //     setError("Please enter all 6 digits");
  //     return;
  //   }

  //   setIsLoading(true);
  //   try {
  //     const res = await axios.post("http://localhost:4000/api/auth/verify", {
  //       email,
  //       otp: otpString,
  //     });

  //     const { user, token } = res.data;
  //     login(user, token);

  //     // Clean up temporary OTP session data
  //     localStorage.removeItem("pendingEmail");
  //     localStorage.removeItem("pendingRole");

  //     // Redirect based on role or booking state

  //     const role = user.role?.toLowerCase();
  //     console.log("✅ Role:", role);

  //     if (role !== "user") {
  //       // All hosts, services, experiences
  //       const subRes = await axios.get(
  //         "http://localhost:4000/api/subscription/status",
  //         {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }
  //       );

  //       const { isActive } = subRes.data;

  //       if (!isActive) {
  //         navigate("/host/subscription");
  //       } else if (!user.isHostApproved) {
  //         navigate("/waiting-approval");
  //       } else {
  //         navigate("/host/dashboard");
  //       }
  //     } else {
  //       // user role
  //       bookingData ? navigate("/confirm") : navigate("/");
  //     }
  //   } catch (err) {
  //     setError(err.response?.data?.message || "Invalid OTP. Try again.");
  //     setOtp(["", "", "", "", "", ""]);
  //     inputRefs.current[0]?.focus();
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleResendOtp = async () => {
  //   setError("");
  //   setIsLoading(true);
  //   try {
  //     await axios.post("http://localhost:4000/api/auth/resend", { email });
  //   } catch (err) {
  //     setError("Failed to resend OTP");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    try {
      const { user, token } = await verifyOtp(email, otpString);
      login(user, token);

      localStorage.removeItem("pendingEmail");
      localStorage.removeItem("pendingRole");

      const role = user.role?.toLowerCase();

      if (role !== "user") {
        const { isActive } = await getSubscriptionStatus(token);

        if (!isActive) {
          navigate("/host/subscription");
        } else if (!user.isHostApproved) {
          navigate("/waiting-approval");
        } else {
          navigate("/host/dashboard");
        }
      } else {
        bookingData ? navigate("/confirm") : navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/register");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center px-4 py-4 sm:py-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 sm:-top-40 -left-20 sm:-left-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 sm:-bottom-40 -right-20 sm:-right-40 w-40 h-40 sm:w-80 sm:h-80 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-96 sm:h-96 bg-gradient-to-br from-teal-100/20 to-emerald-100/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-sm sm:max-w-md relative z-10">
        <button
          onClick={handleBack}
          className="mb-4 sm:mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Back to Register
        </button>

        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl relative">
            <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur opacity-30 animate-pulse"></div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">
            Verify Your Email
          </h1>
          <p className="text-gray-600 mb-2 text-sm sm:text-base">
            Enter the 6-digit OTP sent to
          </p>
          <p className="text-emerald-600 font-semibold text-sm sm:text-base break-all">
            {email}
          </p>
        </div>

        <form
          onSubmit={handleVerify}
          className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl border border-white/50 relative"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 blur-sm"></div>

          <div className="relative z-10">
            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-2xl animate-shake">
                <p className="text-xs sm:text-sm text-red-600 text-center font-medium">
                  {error}
                </p>
              </div>
            )}

            <div className="mb-6 sm:mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3 sm:mb-4 text-center">
                Enter OTP Code
              </label>

              <div className="flex justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]"
                    maxLength="1"
                    value={digit}
                    onChange={(e) =>
                      handleOtpChange(
                        index,
                        e.target.value.replace(/[^0-9]/g, "")
                      )
                    }
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-10 h-10 sm:w-12 sm:h-12 text-center text-lg sm:text-xl font-bold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white/80 transition-all duration-200 active:scale-95 active:bg-emerald-50 active:border-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.join("").length !== 6}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-semibold hover:from-emerald-600 hover:to-teal-600 focus:ring-4 focus:ring-emerald-300 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity"></div>
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Verifying...
                </div>
              ) : (
                "Verify OTP"
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 mr-1" />
            Your data is secure and encrypted
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%,
          20%,
          40%,
          60%,
          80%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-5px);
          }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default VerifyOtpPage;
