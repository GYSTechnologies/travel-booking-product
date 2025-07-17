import jwt from "jsonwebtoken";

export const verifySuperAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Access Denied. No token." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "superadmin")
      return res.status(403).json({ message: "Forbidden: Not Super Admin" });

    req.superAdmin = decoded; // contains id and role
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token", error: err.message });
  }
};
