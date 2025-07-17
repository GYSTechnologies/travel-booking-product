import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  checkSubscriptionStatus,
  startTrialAPI,
  createSubscriptionOrder,
  verifySubscriptionPayment,
} from "../api/allAPIs";


const SubscriptionPage = () => {
  const [isTrialUsed, setIsTrialUsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, token, setUser } = useAuth();

  const plans = [
    { name: "1 Month", key: "1month", price: 299 },
    { name: "6 Months", key: "6months", price: 1399 },
    { name: "12 Months", key: "1year", price: 1999 },
  ];

  // useEffect(() => {
  //   const checkStatus = async () => {
  //     try {
  //       const res = await axios.get(
  //         "http://localhost:4000/api/subscription/status",
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //         }
  //       );

  //       if (res.data?.hasUsedTrial) setIsTrialUsed(true);

  //       if (res.data?.isActive) {
  //         // Instead of fetchUserAndNavigate, use existing user context
  //         if (user?.role === "host") {
  //           if (user?.isHostApproved) {
  //             navigate("/host/dashboard");
  //           } else {
  //             navigate("/waiting-approval");
  //           }
  //         } else {
  //           navigate("/");
  //         }
  //       }
  //     } catch (err) {
  //       toast.error("Failed to check subscription status");
  //       navigate("/waiting-approval");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   checkStatus();
  // }, [navigate, token, user]);

  // const startTrial = async () => {
  //   try {
  //     await axios.post(
  //       "http://localhost:4000/api/subscription/start-trial",
  //       {},
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     toast.success("Trial started!");

  //     // Use current user context instead of API call
  //     if (user?.role === "host") {
  //       if (user?.isHostApproved) {
  //         navigate("/host/dashboard");
  //       } else {
  //         navigate("/waiting-approval");
  //       }
  //     } else {
  //       navigate("/");
  //     }
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || "Trial failed");
  //   }
  // };

  // const handlePay = async (planKey, price) => {
  //   try {
  //     const { data } = await axios.post(
  //       "http://localhost:4000/api/payment/sub-payment/order",
  //       { plan: planKey },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     const options = {
  //       key: "rzp_test_BfK6i6b0E5R9rg",
  //       amount: data.amount,
  //       currency: data.currency,
  //       order_id: data.id,
  //       name: "Host Subscription",
  //       description: `Subscription for ${planKey}`,
  //       handler: async function (response) {
  //         try {
  //           await axios.post(
  //             "http://localhost:4000/api/payment/verify-subscription",
  //             {
  //               plan: planKey,
  //               razorpay_order_id: response.razorpay_order_id,
  //               razorpay_payment_id: response.razorpay_payment_id,
  //               razorpay_signature: response.razorpay_signature,
  //               email: user.email,
  //             },
  //             {
  //               headers: {
  //                 Authorization: `Bearer ${token}`,
  //               },
  //             }
  //           );
  //           toast.success("Subscription activated!");

  //           // Use existing user state instead of API call
  //           if (user?.role === "host") {
  //             if (user?.isHostApproved) {
  //               navigate("/host/dashboard");
  //             } else {
  //               navigate("/waiting-approval");
  //             }
  //           } else {
  //             navigate("/");
  //           }
  //         } catch (error) {
  //           toast.error("Payment verification failed");
  //         }
  //       },
  //       theme: { color: "#10b981" },
  //     };

  //     const rzp = new window.Razorpay(options);
  //     rzp.open();
  //   } catch (err) {
  //     toast.error("Failed to initiate payment");
  //   }
  // };


// 1. Check subscription
useEffect(() => {
  const checkStatus = async () => {
    try {
      const data = await checkSubscriptionStatus(token);

      if (data?.hasUsedTrial) setIsTrialUsed(true);

      if (data?.isActive) {
        if (user?.role === "host") {
          user?.isHostApproved
            ? navigate("/host/dashboard")
            : navigate("/waiting-approval");
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      toast.error("Failed to check subscription status");
      navigate("/waiting-approval");
    } finally {
      setLoading(false);
    }
  };
  checkStatus();
}, [navigate, token, user]);

// 2. Start Trial
const startTrial = async () => {
  try {
    await startTrialAPI(token);
    toast.success("Trial started!");

    if (user?.role === "host") {
      user?.isHostApproved
        ? navigate("/host/dashboard")
        : navigate("/waiting-approval");
    } else {
      navigate("/");
    }
  } catch (err) {
    toast.error(err.response?.data?.message || "Trial failed");
  }
};

// 3. Handle Pay
const handlePay = async (planKey) => {
  try {
    const order = await createSubscriptionOrder(token, planKey);

    const options = {
      key: "rzp_test_BfK6i6b0E5R9rg",
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      name: "Host Subscription",
      description: `Subscription for ${planKey}`,
      handler: async function (response) {
        try {
          await verifySubscriptionPayment(token, {
            plan: planKey,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            email: user.email,
          });

          toast.success("Subscription activated!");

          if (user?.role === "host") {
            user?.isHostApproved
              ? navigate("/host/dashboard")
              : navigate("/waiting-approval");
          } else {
            navigate("/");
          }
        } catch (error) {
          toast.error("Payment verification failed");
        }
      },
      theme: { color: "#10b981" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    toast.error("Failed to initiate payment");
  }
};


  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bounce {
          0%,
          20%,
          53%,
          80%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          40%,
          43% {
            transform: translate3d(0, -8px, 0);
          }
          70% {
            transform: translate3d(0, -4px, 0);
          }
          90% {
            transform: translate3d(0, -2px, 0);
          }
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }
        .animate-slide-up {
          animation: slideUp 0.8s ease-out;
        }
        .animate-slide-in-left {
          animation: slideInLeft 0.8s ease-out;
        }
        .animate-slide-in-right {
          animation: slideInRight 0.8s ease-out;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }
        .animate-scale-in {
          animation: scaleIn 0.8s ease-out;
        }
        .animate-bounce {
          animation: bounce 2s infinite;
        }
        .animate-pulse {
          animation: pulse 2s infinite;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        .delay-400 {
          animation-delay: 0.4s;
        }
        .delay-500 {
          animation-delay: 0.5s;
        }
        .delay-600 {
          animation-delay: 0.6s;
        }
        .delay-700 {
          animation-delay: 0.7s;
        }
        .delay-800 {
          animation-delay: 0.8s;
        }

        @media (max-width: 768px) {
          .mobile-stagger:nth-child(1) {
            animation-delay: 0.1s;
          }
          .mobile-stagger:nth-child(2) {
            animation-delay: 0.2s;
          }
          .mobile-stagger:nth-child(3) {
            animation-delay: 0.3s;
          }
          .mobile-stagger:nth-child(4) {
            animation-delay: 0.4s;
          }

          .mobile-bounce {
            animation: bounce 1.5s infinite;
          }
          .mobile-pulse {
            animation: pulse 1.5s infinite;
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* Header with Logo and Back Button */}
        <div className="flex items-center justify-between mb-6 sm:mb-8 animate-slide-in-left">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-3 py-2 sm:px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 text-sm sm:text-base"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Site
          </button>

          <div className="flex items-center gap-2 sm:gap-3 animate-slide-in-right">
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                Ghumakad
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">Host Platform</p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 animate-fade-in">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-4 animate-slide-up">
            Become a <span className="text-emerald-600">Ghumakad Host</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-3xl mx-auto animate-slide-up delay-100 px-4">
            Share your hotels, services, or experiences with thousands of
            travelers. Choose your hosting plan to unlock premium features and
            start earning today.
          </p>
        </div>

        {/* Subscription Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mb-8 sm:mb-12">
          {!isTrialUsed && (
            <div className="bg-white rounded-lg shadow-lg border-2 border-emerald-200 p-4 sm:p-6 relative hover:shadow-xl md:hover:scale-105 transition-all duration-300 animate-fade-in-up mobile-stagger">
              <div className="absolute top-0 right-0 -mt-3 -mr-3 sm:-mt-4 sm:-mr-4">
                <span className="inline-flex items-center px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium bg-emerald-100 text-emerald-800 animate-pulse mobile-pulse">
                  FREE
                </span>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-emerald-100 rounded-full flex items-center justify-center hover:bg-emerald-200 transition-colors duration-200">
                  <span className="text-xl sm:text-2xl animate-bounce mobile-bounce">
                    🎁
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  3-Day Trial
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                  Try Ghumakad hosting for free! List your hotels, services, or
                  experiences for 3 days
                </p>
                <div className="mb-4 sm:mb-6">
                  <span className="text-2xl sm:text-3xl font-bold text-emerald-600">
                    ₹0
                  </span>
                  <span className="text-gray-500 text-xs sm:text-sm ml-1">
                    for 3 days
                  </span>
                </div>
                <button
                  onClick={startTrial}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 md:hover:scale-105 text-sm sm:text-base active:scale-95"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          )}

          {plans.map((plan, index) => {
            const isPopular = plan.key === "6months";

            return (
              <div
                key={plan.key}
                className={`bg-white rounded-lg shadow-lg p-4 sm:p-6 relative hover:shadow-xl md:hover:scale-105 transition-all duration-300 animate-fade-in-up mobile-stagger ${
                  isPopular
                    ? "border-2 border-emerald-500"
                    : "border border-gray-200"
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="inline-flex items-center px-3 py-1 sm:px-4 rounded-full text-xs sm:text-sm font-medium bg-emerald-600 text-white animate-pulse mobile-pulse">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors duration-200 md:hover:rotate-12">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
                    Full access to Host Dashboard, booking management, and
                    platform features
                  </p>
                  <div className="mb-4 sm:mb-6">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                      ₹{plan.price}
                    </span>
                    <span className="text-gray-500 text-xs sm:text-sm ml-1">
                      /{plan.name.toLowerCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => handlePay(plan.key, plan.price)}
                    className={`w-full font-medium py-2.5 sm:py-3 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 md:hover:scale-105 text-sm sm:text-base active:scale-95 ${
                      isPopular
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500"
                        : "bg-gray-900 hover:bg-gray-800 text-white focus:ring-gray-500"
                    }`}
                  >
                    Subscribe Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 animate-fade-in-up delay-500">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6 sm:mb-8 animate-scale-in">
            What You Get as a Ghumakad Host
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center group md:hover:scale-105 transition-transform duration-300 animate-fade-in-up delay-600">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors duration-200 md:group-hover:rotate-12">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2M7 19h10"
                  />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Manage Your Listings
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                List and manage your hotels, services, or experiences with our
                easy-to-use Host Dashboard
              </p>
            </div>
            <div className="text-center group md:hover:scale-105 transition-transform duration-300 animate-fade-in-up delay-700">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors duration-200 md:group-hover:rotate-12">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Track Earnings & Bookings
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Monitor your bookings, earnings, and reviews all in one place
                with detailed analytics
              </p>
            </div>
            <div className="text-center group md:hover:scale-105 transition-transform duration-300 animate-fade-in-up delay-800 sm:col-span-2 md:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors duration-200 md:group-hover:rotate-12">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600"
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
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                Reach Thousands of Travelers
              </h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Connect with travelers across India looking for unique stays,
                services, and experiences
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
