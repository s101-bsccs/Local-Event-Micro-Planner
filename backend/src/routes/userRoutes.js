const express = require('express');
const {
  getDashboard,
  toggleBookmark
} = require('../controllers/userController');

const router = express.Router();

router.get('/:userId/dashboard', getDashboard);
router.patch('/:userId/bookmarks/:eventId', toggleBookmark);

module.exports = router;
