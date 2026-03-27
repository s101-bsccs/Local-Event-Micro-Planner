const express = require('express');
const { respondToRsvp } = require('../controllers/rsvpController');

const router = express.Router();

router.post('/', respondToRsvp);

module.exports = router;
