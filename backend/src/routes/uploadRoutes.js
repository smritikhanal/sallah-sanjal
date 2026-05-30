const express = require('express');
const { upload, uploadProfileImage } = require('../controllers/uploadController');

const router = express.Router();

router.post('/profile-image', upload.single('image'), uploadProfileImage);
router.post('/payment-qr', upload.single('image'), uploadProfileImage);
router.post('/verification-document', upload.single('image'), uploadProfileImage);

module.exports = router;