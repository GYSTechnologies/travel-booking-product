import crypto from "crypto";

export const generateOTP = () => {
  const otp = crypto.randomInt(100000, 1000000); // 6-digit OTP
  return otp.toString();
};
