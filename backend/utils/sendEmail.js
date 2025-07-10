import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// ✅ OTP Email
export const sendEmail = async (email, otp) => {
  const mailOptions = {
    from: `"Ghumakad Web Application" <${process.env.MAIL_USER}>`,
    to: email,
    subject: "Verify Your Email for Ghumakad Web Application - OTP Inside",
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Welcome to Ghumakad 🌍</h2>
        <p>Thank you for registering with us.</p>
        <p><strong>Your One-Time Password (OTP) is:</strong></p>
        <h1 style="letter-spacing: 2px; color: #2c3e50;">${otp}</h1>
        <p>This OTP is valid for the next 10 minutes.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <br/>
        <p>Cheers,<br/>Team Ghumakad</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ✅ Booking Confirmation Email


export const sendBookingConfirmationEmail = async (email, details) => {
  const {
    title = "Your Booking",
    type = "booking",
    location = "N/A",
    checkIn,
    checkOut,
    dateTime,
    guests = 1,
    rooms = 1,
    totalPrice = 0,
  } = details;

  // Capitalize type
  const capitalType = type.charAt(0).toUpperCase() + type.slice(1);

  // Format Date & Time
  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-IN", { dateStyle: "medium" })
      : "N/A";

  const formatDateTime = (date) =>
    date ? new Date(date).toLocaleString("en-IN") : "N/A";

  // Build Booking Info HTML
  let bookingInfo = `
    <li><strong>Location:</strong> ${location}</li>
    <li><strong>Guests:</strong> ${guests}</li>
    <li><strong>Total Paid:</strong> ₹${totalPrice}</li>
  `;

  if (type === "hotel") {
    bookingInfo += `
      <li><strong>Check-In:</strong> ${formatDate(checkIn)}</li>
      <li><strong>Check-Out:</strong> ${formatDate(checkOut)}</li>
      <li><strong>Rooms:</strong> ${rooms}</li>
    `;
  } else {
    bookingInfo += `
      <li><strong>Date & Time:</strong> ${formatDateTime(dateTime)}</li>
    `;
  }

  const mailOptions = {
    from: `"Ghumakad Web App" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `${capitalType} Booking Confirmed – Ghumakad`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 16px;">
        <h2>Your ${capitalType} Booking is Confirmed! 🎉</h2>
        <p>Thank you for booking <strong>${title}</strong> with Ghumakad.</p>
        <h3>🧾 Booking Details:</h3>
        <ul style="list-style: none; padding: 0;">${bookingInfo}</ul>
        <p>We’re excited to serve you soon!</p>
        <br/>
        <p style="color: #555;">Warm regards,<br/>Team Ghumakad</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ✅ Booking Cancelled by Host Email
export const bookingCancelledEmail = async (email, details) => {
  const {
    username,
    title,
    type,
    location,
    checkIn,
    checkOut,
    dateTime,
    guests,
    rooms,
    totalPrice,
    reason = "", // optional reason from host
  } = details;

  let bookingInfo = `
    <li><strong>Type:</strong> ${type[0].toUpperCase() + type.slice(1)}</li>
    <li><strong>Location:</strong> ${location}</li>
    <li><strong>Guests:</strong> ${guests}</li>
    <li><strong>Total Refunded:</strong> ₹${totalPrice}</li>
  `;

  if (type === "hotel") {
    bookingInfo += `
      <li><strong>Check-In:</strong> ${new Date(checkIn).toDateString()}</li>
      <li><strong>Check-Out:</strong> ${new Date(checkOut).toDateString()}</li>
      <li><strong>Rooms:</strong> ${rooms}</li>
    `;
  } else {
    bookingInfo += `
      <li><strong>Date & Time:</strong> ${new Date(
        dateTime
      ).toLocaleString()}</li>
    `;
  }

  const reasonText = reason
    ? `<p><strong>Cancellation Reason:</strong> ${reason}</p>`
    : "";

  const mailOptions = {
    from: `"Ghumakad Web App" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `Your Booking has been Cancelled – Ghumakad`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Hi ${username},</h2>
        <p>We regret to inform you that your booking for <strong>${title}</strong> has been cancelled by the host.</p>
        ${reasonText}
        <h3>Cancelled Booking Details:</h3>
        <ul>${bookingInfo}</ul>
        <p>A full refund has been initiated. Please allow a few days for it to reflect in your account.</p>
        <br/>
        <p>We apologize for the inconvenience.</p>
        <p>– Team Ghumakad</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const EarningsReportEmail = async (
  email,
  { username, todayEarnings }
) => {
  const mailOptions = {
    from: `"Ghumakad Web App" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `Your Today's Earnings – Ghumakad`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Hi ${username},</h2>
        <p>Here’s your earnings report for today:</p>
        <h3>📅 ${new Date().toDateString()}</h3>
        <p><strong>💰 Total Earnings Today:</strong> ₹${todayEarnings.toFixed(
          2
        )}</p>
        <p>Keep up the great hosting!</p>
        <br/>
        <p>– Team Ghumakad</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// utils/mailer.js

export const userCancelBooking = async (
  email,
  {
    hostUsername,
    userUsername,
    itemTitle,
    type,
    checkDate,
    reason,
    refundAmount,
  }
) => {
  const mailOptions = {
    from: `"Ghumakad App" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `${type} booking cancelled by user`,
    html: `
      <h2>Hello ${hostUsername},</h2>
      <p>User <strong>${userUsername}</strong> has cancelled a <strong>${type}</strong> booking for:</p>
      <ul>
        <li><strong>${itemTitle}</strong></li>
        <li><strong>Date:</strong> ${new Date(checkDate).toLocaleString()}</li>
        <li><strong>Refund to user:</strong> ₹${refundAmount}</li>
        <li><strong>Reason:</strong> ${reason || "No reason given"}</li>
      </ul>
    `,
  };
  await transporter.sendMail(mailOptions);
};

export const sendBookingCancelEmail = async (
  email,
  { title, type, reason }
) => {
  const mailOptions = {
    from: `"Ghumakad Web App" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `${
      type[0].toUpperCase() + type.slice(1)
    } Booking Cancelled – Ghumakad`,
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Your ${type} booking has been cancelled by host.</h2>
        <p><strong>${title}</strong> has been cancelled due to:</p>
        <blockquote>${reason}</blockquote>
        <p>Sorry for the inconvenience.</p>
        <br/>
        <p>Team Ghumakad</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const hostCancelBooking = async (email, details) => {
  const {
    username,
    title,
    type,
    dateTime,
    checkIn,
    checkOut,
    guests,
    rooms,
    refundAmount,
    reason = "",
  } = details;

  let infoList = `
    <li><strong>Listing Type:</strong> ${type}</li>
    <li><strong>Listing Title:</strong> ${title}</li>
    <li><strong>Refund Amount:</strong> ₹${refundAmount}</li>
  `;

  if (type === "hotel") {
    infoList += `
      <li><strong>Check-In:</strong> ${new Date(checkIn).toDateString()}</li>
      <li><strong>Check-Out:</strong> ${new Date(checkOut).toDateString()}</li>
      <li><strong>Guests:</strong> ${guests}</li>
      <li><strong>Rooms:</strong> ${rooms}</li>
    `;
  } else {
    infoList += `
      <li><strong>Date & Time:</strong> ${new Date(
        dateTime
      ).toLocaleString()}</li>
    `;
  }

  if (reason) {
    infoList += `<li><strong>Host's Reason:</strong> ${reason}</li>`;
  }

  const mailOptions = {
    from: `"Ghumakad Web App" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `Booking Cancelled by Host – Refund Processed (₹${refundAmount})`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Hello ${username},</h2>
        <p>We regret to inform you that your ${type} booking has been <strong>cancelled by the host</strong>.</p>
        <h3>Booking Details:</h3>
        <ul>${infoList}</ul>
        <p>We’ve processed your refund of <strong>₹${refundAmount}</strong>. Amount will reflect in your source account soon.</p>
        <br/>
        <p>Sorry for the inconvenience.</p>
        <p>Regards,<br/>Team Ghumakad</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};



export const sendSubscriptionConfirmationEmail = async (email, details) => {
  const { plan, endDate, price } = details;
  const formattedDate = new Date(endDate).toLocaleDateString("en-IN");

  const mailOptions = {
    from: `"Ghumakad Web App" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `✅ Subscription Confirmed - ${plan} Plan Activated`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
        <h2 style="color: #0f766e;">Welcome to the Ghumakad Host Community!</h2>

        <p>Hi there 👋,</p>

        <p>We're thrilled to confirm your subscription to the <strong>${plan}</strong> plan on <strong>Ghumakad</strong>.</p>

        <p style="margin-top: 15px;">
          You now have full access to list your <strong>Hotels</strong>, <strong>Services</strong>, and <strong>Experiences</strong> on the platform.
          This subscription helps us maintain a high-quality hosting ecosystem while ensuring travelers enjoy a seamless experience.
        </p>

        <h3 style="margin-top: 25px;">📋 Subscription Details</h3>
        <ul style="padding-left: 20px; margin-top: 10px; line-height: 1.6;">
          <li><strong>Plan:</strong> ${plan}</li>
          <li><strong>Valid Until:</strong> ${formattedDate}</li>
          <li><strong>Amount Paid:</strong> ₹${price}</li>
        </ul>

        <p style="margin-top: 20px;">
          You can now start creating listings, managing bookings, and reaching thousands of travelers through your personalized host dashboard.
        </p>

        <p style="margin-top: 20px;">Thank you for being a part of the Ghumakad family — let's make your hosting journey incredible! 🌟</p>

        <br/>
        <p>Warm wishes,</p>
        <p><strong>— Team Ghumakad</strong></p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};


export const sendTrialActivationEmail = async (email, endDate) => {
  const formattedEndDate = new Date(endDate).toLocaleDateString("en-IN");

  const mailOptions = {
    from: `"Ghumakad Web App" <${process.env.MAIL_USER}>`,
    to: email,
    subject: `🚀 Your Free Trial is Live – Start Hosting on Ghumakad!`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
        <h2 style="color: #0f766e;">Welcome to Ghumakad – Your Hosting Journey Begins!</h2>

        <p>Hi there 👋,</p>

        <p>We’re excited to let you know that your <strong>3-day free trial</strong> is now active on <strong>Ghumakad</strong>!</p>

        <h3 style="margin-top: 20px;">✨ What's Included in Your Trial</h3>
        <ul style="padding-left: 20px; margin-top: 10px; line-height: 1.6;">
          <li>✅ Ability to list your <strong>Hotels</strong>, <strong>Services</strong>, or <strong>Experiences</strong></li>
          <li>✅ Access to the full host dashboard with premium tools</li>
          <li>✅ Visibility to verified and interested travelers</li>
        </ul>

        <p style="margin-top: 20px;">
          Your trial is valid until <strong>${formattedEndDate}</strong>. You can start adding your listings right away and explore everything our platform has to offer!
        </p>

        <p style="margin-top: 20px;">Once the trial ends, you can choose a subscription plan to continue hosting without interruption.</p>

        <br/>
        <p>Enjoy your hosting experience with Ghumakad 🌍</p>
        <p><strong>– Team Ghumakad</strong></p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

