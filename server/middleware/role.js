module.exports = (...roles) => (req, res, next) => {
  const types = Array.isArray(req.user?.UserType) ? req.user.UserType : [];
  if (!roles.some(role => types.includes(role))) {
    return res.status(403).json({ error: 'You do not have permission for this action.' });
  }
  next();
};
