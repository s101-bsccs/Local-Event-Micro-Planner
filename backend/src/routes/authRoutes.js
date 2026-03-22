const express = require('express');
const { optionalAuth, requireAuth } = require('../middleware/authMiddleware');
const {
  login,
  register,
  socialLoginRedirect,
  updatePreferences,
  updateProfile
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/:provider(google|facebook)', socialLoginRedirect);
router.put('/profile', requireAuth, updateProfile);
router.put('/preferences', requireAuth, updatePreferences);

module.exports = router;
