const User = require('../models/User');

async function getRequestUser(req) {
  if (req.currentUser) {
    return req.currentUser;
  }

  const requestedUserId = req.params.userId || req.query.userId || req.body.userId;
  if (requestedUserId) {
    const requestedUser = await User.findById(requestedUserId);
    if (requestedUser) {
      return requestedUser;
    }
  }

  return User.findOne().sort({ createdAt: 1 });
}

module.exports = getRequestUser;
