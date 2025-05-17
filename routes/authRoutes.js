const express = require('express'); // Renamed from expressAuthRoutes
const router = express.Router(); // Renamed from routerAuth
const { registerUser, loginUser, refreshToken, logoutUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware'); // Renamed from protectAuth
const { upload } = require('../middleware/uploadMiddleware'); // Renamed from uploadAuth

// POST /api/auth/register
// If you want to allow profile picture upload during registration, uncomment upload.single()
// For now, profile picture is handled via user profile update.
router.post('/register', /* upload.single('profilePicture'), */ registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

// POST /api/auth/refresh-token
router.post('/refresh-token', refreshToken);

// POST /api/auth/logout
router.post('/logout', protect, logoutUser);

module.exports = router;
