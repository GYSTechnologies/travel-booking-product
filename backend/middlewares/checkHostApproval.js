export const checkHostApproval = (req, res, next) => {
  const user = req.user;

  if (user.role !== "host") {
    return res.status(403).json({ message: "Only hosts are allowed" });
  }

  if (!user.isOtpVerified) {
    return res.status(401).json({ message: "OTP not verified yet" });
  }

  if (!user.isKycSubmitted) {
    return res.status(401).json({ message: "KYC not submitted yet" });
  }

  if (!user.isHostApproved) {
    return res.status(403).json({
      message: "Your profile is under review by the admin. Please wait for approval.",
    });
  }

  next();
};
