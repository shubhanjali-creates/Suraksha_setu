const express = require('express');
const router = express.Router();
const { register, login, me, sendOtp, verifyOtp } = require('../controllers/Authentication');
const auth = require('../middleware/auth');

router.post('/login', login);
router.post('/register', register);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', auth, me);

module.exports = router;
