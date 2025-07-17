import SuperAdmin from "../models/superadminschema.js";
import User from "../models/user.js";
import Hotel from "../models/hotel.js";
import Experience from "../models/experience.js";
import Service from "../models/service.js";

import Subscription from "../models/subscription.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
  sendHostApprovalEmail,
  sendHostRejectionEmail,
  sendListingApprovalEmail,
  sendListingRejectionEmail,
} from "../utils/sendEmail.js";

export const registerSuperAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await SuperAdmin.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await SuperAdmin.create({
      name,
      email,
      password: hashedPassword,
    });

    res
      .status(201)
      .json({ message: "Super Admin created", adminId: newAdmin._id });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Login Super Admin
export const loginSuperAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await SuperAdmin.findOne({ email });
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, role: "superadmin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET => /api/super-admin/dashboard/overview
export const getAdminDashboardStats = async (req, res) => {
  try {
    const totalHosts = await User.countDocuments({ role: "host" });
    const pendingHosts = await User.countDocuments({
      role: "host",
      isHostApproved: false,
    });
    const approvedHosts = await User.countDocuments({
      role: "host",
      isHostApproved: true,
    });

    const hotels = await Hotel.countDocuments();
    const services = await Service.countDocuments();
    const experiences = await Experience.countDocuments();

    const subscriptions = await Subscription.countDocuments({ isActive: true });

    res.status(200).json({
      totalHosts,
      pendingHosts,
      approvedHosts,
      hotels,
      services,
      experiences,
      activeSubscriptions: subscriptions,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch dashboard stats",
      error: err.message,
    });
  }
};

// // GET -> /admin/hosts/pending || Get all hosts awaiting approval with their subscription info

export const getPendingHosts = async (req, res) => {
  try {
    // ✅ Fetch truly pending hosts
    const pendingHosts = await User.find({
      role: "host",
      isKycSubmitted: true,
      isHostApproved: false,
      hostRejectionReason: "", // Keep as-is
    }).select("-password");

    // ✅ Map with subscription and resubmissionCount
    const hostsWithSubscription = await Promise.all(
      pendingHosts.map(async (host) => {
        const subscription = await Subscription.findOne({ host: host._id });

        return {
          ...host.toObject(),
          resubmissionCount: host.resubmissionCount || 0, // Add explicitly if needed
          subscription: subscription
            ? {
                plan: subscription.plan,
                startDate: subscription.startDate,
                endDate: subscription.endDate,
                isActive: subscription.isActive,
              }
            : null,
        };
      })
    );

    res.status(200).json({ hosts: hostsWithSubscription });
  } catch (err) {
    console.error("❌ getPendingHosts error:", err);
    res.status(500).json({
      message: "Failed to fetch pending hosts",
      error: err.message,
    });
  }
};

// GET -> /admin/hosts/:id || Get full profile + KYC documents of a single host
export const getSingleHostDetails = async (req, res) => {
  const { id } = req.params;

  try {
    const host = await User.findById(id).select("-password");
    if (!host || host.role !== "host") {
      return res.status(404).json({ message: "Host not found" });
    }

    const subscription = await Subscription.findOne({ host: host._id });

    res.status(200).json({
      host,
      subscription: subscription
        ? {
            plan: subscription.plan,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            isActive: subscription.isActive,
          }
        : null,
    });
  } catch (err) {
    console.error("❌ getSingleHostDetails error:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch host details", error: err.message });
  }
};

// GET -> /hosts/approved || Get all approved hosts

export const getApprovedHosts = async (req, res) => {
  try {
    const hosts = await User.aggregate([
      {
        $match: {
          role: "host",
          isHostApproved: true,
        },
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "host",
          as: "subscription",
        },
      },
      {
        $unwind: {
          path: "$subscription",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          username: 1,
          email: 1,
          profileImage: 1,
          phone: 1,
          address: 1,
          hostType: 1,
          isHostApproved: 1,
          subscription: 1,
          createdAt: 1,
        },
      },
    ]);

    res.status(200).json(hosts);
  } catch (err) {
    console.error("❌ getApprovedHosts error:", err);
    res.status(500).json({ message: "Failed to fetch approved hosts" });
  }
};


export const getRejectedHosts = async (req, res) => {
  try {
    const rejectedHosts = await User.find({
      role: "host",
      isHostApproved: false,
      hostRejectionReason: { $ne: "" }, // ✅ correct field
    }).select("-password");

    res.status(200).json(rejectedHosts);
  } catch (err) {
    console.error("❌ Error fetching rejected hosts:", err);
    res.status(500).json({
      message: "Failed to fetch rejected hosts",
      error: err.message,
    });
  }
};

export const approveHost = async (req, res) => {
  const { id } = req.params;

  try {
    const host = await User.findById(id);
    if (!host || host.role !== "host") {
      return res.status(404).json({ message: "Host not found" });
    }

    // ✅ Update approval status
    host.isHostApproved = true;
    host.rejectionReason = "";
    await host.save();

    // ✅ Fetch subscription details
    const subscription = await Subscription.findOne({ host: host._id });

    // ✅ Generate token (valid for 10 min)
    const magicToken = jwt.sign(
      { id: host._id, role: host.role },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );

    // ✅ Send approval email with dashboard link
    await sendHostApprovalEmail(host.email, {
      username: host.username,
      plan: subscription?.plan || "N/A",
      endDate: subscription?.endDate || new Date(),
      token: magicToken,
    });

    res.status(200).json({ message: "Host approved successfully" });
  } catch (err) {
    console.error("❌ approveHost error:", err);
    res
      .status(500)
      .json({ message: "Failed to approve host", error: err.message });
  }
};

//  PUT -> /hosts/:id/reject || Reject a host's KYC and notify via email

export const rejectHost = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const host = await User.findById(id);
    if (!host || host.role !== "host") {
      return res.status(404).json({ message: "Host not found" });
    }

    // ✅ Mark as rejected
    host.isHostApproved = false;
    host.hostRejectionReason = reason || "No specific reason provided"; // ✅ corrected field name
    await host.save();

    // ✅ Send rejection email
    await sendHostRejectionEmail(host.email, {
      username: host.username,
      reason: host.hostRejectionReason, // ✅ using correct field in email
    });

    res.status(200).json({ message: "Host rejected and notified" });
  } catch (err) {
    console.error("❌ rejectHost error:", err);
    res
      .status(500)
      .json({ message: "Failed to reject host", error: err.message });
  }
};

// PUT -> /listings/:type/:id/approve || Approve a specific listing (hotel/service/experience)
export const approveListing = async (req, res) => {
  const { type, id } = req.params;

  try {
    const modelMap = {
      hotel: Hotel,
      service: Service,
      experience: Experience,
    };

    const Model = modelMap[type];
    if (!Model)
      return res.status(400).json({ message: "Invalid listing type" });

    const listing = await Model.findById(id).populate("host");

    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    if (!listing.host || !listing.host.email) {
      return res.status(400).json({ message: "Listing host email not found" });
    }

    listing.status = "approved";
    listing.rejectionReason = "";
    await listing.save();

    // ✅ Email notification
    await sendListingApprovalEmail(listing.host.email, {
      title: listing.title,
      type,
    });

    res.status(200).json({ message: `${type} listing approved`, listing });
  } catch (err) {
    console.error("❌ APPROVE LISTING ERROR:", err);
    res
      .status(500)
      .json({ message: "Failed to approve listing", error: err.message });
  }
};

// PUT -> /listings/:type/:id/reject || Reject a specific listing with reason
export const rejectListing = async (req, res) => {
  const { type, id } = req.params;
  const { reason } = req.body;

  try {
    const modelMap = {
      hotel: Hotel,
      service: Service,
      experience: Experience,
    };

    const Model = modelMap[type];
    if (!Model)
      return res.status(400).json({ message: "Invalid listing type" });

    const listing = await Model.findById(id).populate("host");
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    listing.status = "rejected";
    listing.rejectionReason = reason || "No reason provided";
    await listing.save();

    // Send rejection email to host
    await sendListingRejectionEmail(
      listing.host.email,
      listing.title,
      type,
      reason
    );

    res.status(200).json({ message: `${type} listing rejected`, listing });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to reject listing", error: err.message });
  }
};

// GET -> /admin/listings/pending || Fetch all pending listings (hotel, service, experience)
export const getPendingListings = async (req, res) => {
  try {
    const pendingHotels = await Hotel.find({ status: "pending" }).populate({
      path: "host",
      select: "-password", // exclude password but include everything else
    });

    const pendingServices = await Service.find({ status: "pending" }).populate({
      path: "host",
      select: "-password",
    });

    const pendingExperiences = await Experience.find({
      status: "pending",
    }).populate({
      path: "host",
      select: "-password",
    });

    res.status(200).json({
      hotels: pendingHotels,
      services: pendingServices,
      experiences: pendingExperiences,
    });
  } catch (error) {
    console.error("❌ getPendingListings error:", error);
    res.status(500).json({
      message: "Failed to fetch pending listings",
      error: error.message,
    });
  }
};

// GET -> /admin/listings/approved || Fetch all approved listings (hotel, service, experience)
export const getApprovedListings = async (req, res) => {
  try {
    const approvedHotels = await Hotel.find({ status: "approved" }).populate({
      path: "host",
      select: "-password",
    });

    const approvedServices = await Service.find({
      status: "approved",
    }).populate({
      path: "host",
      select: "-password",
    });

    const approvedExperiences = await Experience.find({
      status: "approved",
    }).populate({
      path: "host",
      select: "-password",
    });

    res.status(200).json({
      hotels: approvedHotels,
      services: approvedServices,
      experiences: approvedExperiences,
    });
  } catch (error) {
    console.error("❌ getApprovedListings error:", error);
    res.status(500).json({
      message: "Failed to fetch approved listings",
      error: error.message,
    });
  }
};

// GET -> /admin/listings/rejected || Fetch all rejected listings (hotel, service, experience)
export const getRejectedListings = async (req, res) => {
  try {
    const rejectedHotels = await Hotel.find({ status: "rejected" }).populate({
      path: "host",
      select: "-password",
    });

    const rejectedServices = await Service.find({
      status: "rejected",
    }).populate({
      path: "host",
      select: "-password",
    });

    const rejectedExperiences = await Experience.find({
      status: "rejected",
    }).populate({
      path: "host",
      select: "-password",
    });

    res.status(200).json({
      hotels: rejectedHotels,
      services: rejectedServices,
      experiences: rejectedExperiences,
    });
  } catch (error) {
    console.error("❌ getRejectedListings error:", error);
    res.status(500).json({
      message: "Failed to fetch rejected listings",
      error: error.message,
    });
  }
};

// GET -> /listings/all?type=hotel|service|experience|all
export const getAllListings = async (req, res) => {
  const { type } = req.query;

  try {
    const modelMap = {
      hotel: Hotel,
      service: Service,
      experience: Experience,
    };

    let listings = [];

    if (!type || type === "all") {
      const hotelListings = await Hotel.find().populate("host");
      const serviceListings = await Service.find().populate("host");
      const experienceListings = await Experience.find().populate("host");

      listings = [
        ...hotelListings.map((item) => ({ ...item._doc, type: "hotel" })),
        ...serviceListings.map((item) => ({ ...item._doc, type: "service" })),
        ...experienceListings.map((item) => ({
          ...item._doc,
          type: "experience",
        })),
      ];
    } else {
      const Model = modelMap[type];
      if (!Model) {
        return res.status(400).json({ message: "Invalid listing type" });
      }

      const result = await Model.find().populate("host");
      listings = result.map((item) => ({ ...item._doc, type }));
    }

    res.status(200).json(listings);
  } catch (error) {
    console.error("❌ getAllListings error:", error);
    res.status(500).json({
      message: "Failed to fetch listings",
      error: error.message,
    });
  }
};
