import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export const protect = async (req, res, next) => {
  let token;

  try {
    // Check for Bearer token in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach full user object to req
      req.user = await User.findById(decoded.userId).select('-password');
      next();
    } else {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};
