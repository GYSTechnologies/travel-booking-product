// src/api/bookings.js
import axiosInstance from "./axiosInstance";

export const fetchMyBookings = async (token) => {
  const axios = axiosInstance(token);
  const res = await axios.get("/bookings/my-bookings");
  return res.data;
};

export const cancelBooking = async (token, bookingId, reason = "") => {
  const axios = axiosInstance(token);
  const res = await axios.put(`/user/${bookingId}/cancel`, { reason });
  return res.data;
};



// Fetch experience detail by ID
export const fetchExperienceById = async (id) => {
  const axios = axiosInstance();
  const res = await axios.get(`/experiences/experience-detail/${id}`);
  return res.data;
};

// Fetch available slots for a specific date
export const fetchExperienceSlots = async (id, date) => {
  const axios = axiosInstance();
  const res = await axios.get(`/experiences/${id}/slots?date=${date}`);
  return res.data;
};


//  Get hotel detail with optional date filter
export const fetchHotelById = async (id, checkIn, checkOut) => {
  const axios = axiosInstance();
  const res = await axios.get(`/host/hotel-detail/${id}`, {
    params: { checkIn, checkOut },
  });
  return res.data;
};

//  Get availability for a hotel in a date range
export const fetchHotelAvailability = async (id, checkIn, checkOut) => {
  const axios = axiosInstance();
  const res = await axios.get(`/host/${id}/availability`, {
    params: { checkIn, checkOut },
  });
  return res.data;
};


// Get service detail by ID
export const fetchServiceById = async (id) => {
  const axios = axiosInstance();
  const res = await axios.get(`/services/service-detail/${id}`);
  return res.data;
};

//  Get available slots for a specific date
export const fetchServiceSlots = async (id, date) => {
  const axios = axiosInstance();
  const res = await axios.get(`/services/${id}/slots`, {
    params: { date },
  });
  return res.data;
};

// Search hotels by location, date, and guests
export const searchHotels = async ({ location, checkIn, checkOut, guests }) => {
  const axios = axiosInstance();
  const res = await axios.get("/host/all-hotels", {
    params: {
      place: location,
      checkIn,
      checkOut,
      guests: guests || 1,
    },
  });
  return res.data;
};


// Fetch hotel/service/experience detail based on type
export const fetchItemByType = async (type, id) => {
  const axios = axiosInstance();
  const endpointMap = {
    hotel: `/host/hotel-detail/${id}`,
    experience: `/experiences/experience-detail/${id}`,
    service: `/services/service-detail/${id}`,
  };
  const res = await axios.get(endpointMap[type]);
  return res.data;
};

// Check hotel room availability (for payment page)
export const checkHotelAvailability = async (id, checkIn, checkOut) => {
  const axios = axiosInstance();
  const res = await axios.get(`/host/hotel-detail/${id}`, {
    params: { checkIn, checkOut },
  });
  return res.data;
};

// Create Razorpay payment order
export const createRazorpayOrder = async (token, amount) => {
  const axios = axiosInstance(token);
  const res = await axios.post("/payment/create-order", { amount });
  return res.data;
};

// Verify Razorpay payment and attach booking
export const verifyPayment = async (token, response, bookingDetails) => {
  const axios = axiosInstance(token);
  const res = await axios.post("/payment/verify", {
    ...response,
    bookingDetails,
  });
  return res.data;
};


// Fetch all experiences (grouped by state)
export const fetchAllExperiences = async () => {
  const axios = axiosInstance();
  const res = await axios.get("/experiences/all-experiences", {
    params: { place: "all" },
  });
  return res.data;
};

// Search experiences by place, date, and type
export const searchExperiences = async ({ location, date, type }) => {
  const axios = axiosInstance();
  const res = await axios.get("/experiences/all-experiences", {
    params: { place: location, date, type },
  });
  return res.data;
};


// Fetch all hotels grouped by state
export const fetchAllHotels = async () => {
  const axios = axiosInstance();
  const res = await axios.get("/host/all-hotels", {
    params: { place: "all" },
  });
  return res.data;
};

// Fetch all services grouped by category
export const fetchAllServices = async () => {
  const axios = axiosInstance();
  const res = await axios.get("/services/all-services", {
    params: { place: "all" },
  });
  return res.data;
};



// Login user or host
export const loginUser = async (formData) => {
  const axios = axiosInstance();
  const res = await axios.post("/auth/login", formData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.data;
};

// Check host subscription status
export const getSubscriptionStatus = async (token) => {
  const axios = axiosInstance(token);
  const res = await axios.get("/subscription/status");
  return res.data;
};


// Verify OTP
export const verifyOtp = async (email, otp) => {
  const axios = axiosInstance();
  const res = await axios.post("/auth/verify", { email, otp });
  return res.data;
};


// Register user or host
export const registerUser = async (formData, kycDocs = [], docTypes = []) => {
  const axios = axiosInstance();

  const form = new FormData();

  for (const key in formData) {
    if (key === "hostType" && formData.role === "host") {
      form.append("hostType", formData.hostType);
    } else if (key !== "hostType" && formData[key]) {
      form.append(key, formData[key]);
    }
  }

  if (formData.role === "host") {
    kycDocs.forEach((file) => {
      if (file) form.append("documents", file);
    });

    docTypes.forEach((type) => {
      form.append("documentTypes", type);
    });
  }

  const res = await axios.post("/auth/register", form, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};


// Fetch all services (grouped or default)
export const fetchAllServicesData = async (place = "all") => {
  const axios = axiosInstance();
  const res = await axios.get("/services/all-services", {
    params: { place },
  });
  return res.data;
};

// Search services based on filters
export const searchServices = async (location, date, type) => {
  const axios = axiosInstance();
  const res = await axios.get("/services/all-services", {
    params: { place: location, date, type },
  });
  return res.data;
};

// Fetch logged-in user profile
export const fetchUserProfile = async (token) => {
  const axios = axiosInstance(token);
  const res = await axios.get("/user/profile");
  return res.data;
};

// Update user profile (with optional profileImage)
export const updateUserProfile = async (token, formData, imageFile = null) => {
  const axios = axiosInstance(token);
  const fd = new FormData();

  fd.append("username", formData.username);
  fd.append("phone", formData.phone);
  fd.append("address", formData.address);
  if (imageFile) {
    fd.append("profileImage", imageFile);
  }

  const res = await axios.put("/user/update", fd, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};


// Super Admin Login
export const superAdminLogin = async (formData) => {
  const axios = axiosInstance();
  const res = await axios.post("/super-admin/login", formData);
  return res.data; // { token, admin }
};

// Fetch all listings (hotel/service/experience) for Super Admin
export const fetchAllListingsByType = async (token, type) => {
  const axios = axiosInstance(token);
  const res = await axios.get(`/super-admin/listings/all`, {
    params: { type },
  });
  return res.data;
};


// Fetch all approved hosts for Super Admin
export const fetchApprovedHosts = async (token) => {
  const axios = axiosInstance(token);
  const res = await axios.get("/super-admin/hosts/approved");
  return Array.isArray(res.data.hosts) ? res.data.hosts : res.data;
};

// Fetch all approved listings (hotels/services/experiences)
export const fetchApprovedListings = async (token) => {
  const axios = axiosInstance(token);
  const res = await axios.get("/super-admin/listings/approved");
  return res.data;
};

// Fetch all pending hosts
export const fetchPendingHosts = async (token) => {
  const axios = axiosInstance(token);
  const res = await axios.get("/super-admin/hosts/pending");
  return res.data.hosts || [];
};

// Approve a host
export const approveHost = async (token, hostId) => {
  const axios = axiosInstance(token);
  await axios.put(`/super-admin/hosts/${hostId}/approve`);
};

// Reject a host with reason
export const rejectHost = async (token, hostId, reason) => {
  const axios = axiosInstance(token);
  await axios.put(`/super-admin/hosts/${hostId}/reject`, { reason });
};



// Fetch pending listings (hotel/service/experience)
export const fetchPendingListings = async (token, type) => {
  const axios = axiosInstance(token);
  const res = await axios.get(`/super-admin/listings/pending?type=${type}`);
  return res.data;
};

// Approve a specific listing
export const approveListing = async (token, type, id) => {
  const axios = axiosInstance(token);
  await axios.put(`/super-admin/listing/${type}/${id}/approve`);
};

// Reject a specific listing with a reason
export const rejectListing = async (token, type, id, reason) => {
  const axios = axiosInstance(token);
  await axios.put(`/super-admin/listing/${type}/${id}/reject`, { reason });
};

// Fetch all rejected hosts
export const fetchRejectedHosts = async (token) => {
  const axios = axiosInstance(token);
  const res = await axios.get("/super-admin/hosts/rejected");
  return res.data;
};


// Fetch all rejected listings
export const fetchRejectedListings = async (token) => {
  const axios = axiosInstance(token);
  const res = await axios.get("/super-admin/listings/rejected");
  return res.data;
};


// Fetch Super Admin dashboard stats overview
export const fetchDashboardStats = async (token) => {
  const axios = axiosInstance(token);
  const res = await axios.get("/super-admin/dashboard/overview");
  return res.data;
};




// Get Create/Update API URL based on listing type
export const getApiUrls = (type, editMode, id) => {
  const base = "http://localhost:4000/api";

  switch (type) {
    case "hotel":
      return {
        url: editMode
          ? `${base}/host/hotel-update/${id}`
          : `${base}/host/hotel-create`,
        key: "hotel",
      };

    case "services":
      return {
        url: editMode
          ? `${base}/services/update/${id}`
          : `${base}/services/create-service`,
        key: "service",
      };

    case "experiences":
      return {
        url: editMode
          ? `${base}/experiences/update/${id}`
          : `${base}/experiences/create-experience`,
        key: "experience",
      };

    default:
      return { url: "", key: "" };
  }
};




// Get dashboard bookings URL based on host type
export const getDashboardBookingUrl = (type) => {
  const base = "http://localhost:4000/api";
  if (type === "hotel") return `${base}/host/dashboard/bookings`;
  if (type === "services") return `${base}/services/dashboard/bookings`;
  if (type === "experiences") return `${base}/experiences/dashboard/bookings`;
  return "";
};

// Fetch dashboard bookings by type and date range
export const fetchDashboardBookings = async (token, type, range) => {
  const axios = axiosInstance(token);
  const url = `${getDashboardBookingUrl(type)}?range=${range}`;
  const res = await axios.get(url);
  return res.data?.data?.bookings || [];
};

// Cancel a booking by host
export const cancelBookingByHost = async (token, type, bookingId, reason = "") => {
  const axios = axiosInstance(token);
  const url =
    type === "hotel"
      ? `/host/bookings/${bookingId}/cancel-by-host`
      : `/${type}/bookings/${bookingId}/cancel-by-host`;

  const res = await axios.put(url, { reason });
  return res.data;
};



// Fetch Host Profile
export const fetchHostProfileAPI = async (token) => {
  const axios = axiosInstance(token);
  const res = await axios.get("/user/host-profile");
  return res.data.user;
};

// Update Host Profile
export const updateHostProfileAPI = async (token, formDataObj) => {
  const form = new FormData();
  form.append("username", formDataObj.username);
  form.append("phone", formDataObj.phone);
  form.append("address", formDataObj.address);

  if (formDataObj.profileImage instanceof File) {
    form.append("profileImage", formDataObj.profileImage);
  }

  const axios = axiosInstance(token, true); // true = multipart config
  const res = await axios.put("/user/host-profile-update", form);
  return res.data.user;
};



// Check subscription status
export const checkSubscriptionStatus = async (token) => {
  const axios = axiosInstance(token);
  const res = await axios.get("/subscription/status");
  return res.data;
};

// Start trial
export const startTrialAPI = async (token) => {
  const axios = axiosInstance(token);
  const res = await axios.post("/subscription/start-trial", {});
  return res.data;
};

// Create Razorpay order for subscription
export const createSubscriptionOrder = async (token, planKey) => {
  const axios = axiosInstance(token);
  const res = await axios.post("/payment/sub-payment/order", { plan: planKey });
  return res.data; // includes { id, amount, currency }
};

// Verify Razorpay subscription payment
export const verifySubscriptionPayment = async (token, payload) => {
  const axios = axiosInstance(token);
  const res = await axios.post("/payment/verify-subscription", payload);
  return res.data;
};
