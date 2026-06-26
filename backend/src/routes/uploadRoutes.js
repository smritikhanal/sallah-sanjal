const express = require('express');
const { upload, uploadProfileImage } = require('../controllers/uploadController');

const router = express.Router();

// POST /api/uploads/profile-image — Upload user profile picture
router.post('/profile-image', upload.single('image'), uploadProfileImage);
// POST /api/uploads/payment-qr — Upload payment QR code (worker)
router.post('/payment-qr', upload.single('image'), uploadProfileImage);
// POST /api/uploads/verification-document — Upload verification document (worker)
router.post('/verification-document', upload.single('image'), uploadProfileImage);

module.exports = router;