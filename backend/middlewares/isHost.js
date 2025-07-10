export const isHost = (req, res, next) => {
  if (req.user && req.user.role === 'host') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied: Host only' });
  }
};
