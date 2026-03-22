const express = require('express');
const {
  getDashboardStats,
  getGenreDistribution,
  getTopAuthors
} = require('../controllers/statsController');

const router = express.Router();

router.get('/dashboard', getDashboardStats);
router.get('/genres', getGenreDistribution);
router.get('/top-authors', getTopAuthors);

module.exports = router;
