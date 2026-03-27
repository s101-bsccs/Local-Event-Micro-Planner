const express = require('express');
const { register, login, getAccountSession } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/account/:accountId', getAccountSession);

module.exports = router;
