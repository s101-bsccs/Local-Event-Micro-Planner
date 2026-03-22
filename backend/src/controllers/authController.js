const asyncHandler = require('../middleware/asyncHandler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { serializeUser } = require('../utils/serialize');
const getRequestUser = require('../utils/requestUser');

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const user = await User.create({
    name,
    email,
    password
  });

  res.status(201).json({
    token: generateToken(user._id.toString()),
    user: serializeUser(user)
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({
    token: generateToken(user._id.toString()),
    user: serializeUser(user)
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await getRequestUser(req);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.name = req.body.name ?? user.name;
  user.avatar = req.body.avatar ?? user.avatar;
  user.email = req.body.email ?? user.email;

  await user.save();
  res.json(serializeUser(user));
});

const updatePreferences = asyncHandler(async (req, res) => {
  const user = await getRequestUser(req);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  user.preferences = {
    ...user.preferences.toObject(),
    ...req.body
  };

  await user.save();
  res.json(serializeUser(user));
});

const socialLoginRedirect = asyncHandler(async (req, res) => {
  const provider = req.params.provider;
  const frontendBaseUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
  const providerUrlMap = {
    google: process.env.GOOGLE_OAUTH_URL,
    facebook: process.env.FACEBOOK_OAUTH_URL
  };

  const providerUrl = providerUrlMap[provider];

  if (!providerUrl) {
    return res.redirect(`${frontendBaseUrl}/login?social_error=${provider}_not_configured`);
  }

  return res.redirect(providerUrl);
});

module.exports = {
  login,
  register,
  socialLoginRedirect,
  updatePreferences,
  updateProfile
};
