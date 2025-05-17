const express = require('express'); // Renamed from expressUserRoutes
const router = express.Router(); // Renamed from routerUser
const {
    getUserProfile,
    updateUserProfile,
    getUserById,
    getUsers
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // Renamed from protectUser
const { upload } = require('../middleware/uploadMiddleware'); // Renamed from uploadUser

// GET /api/users/profile - Get current user's profile
// PUT /api/users/profile - Update current user's profile
router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, upload.single('profilePicture'), updateUserProfile); // 'profilePicture' is the field name

// GET /api/users - Get all users (consider admin only)
router.get('/', protect, getUsers); // Add admin check middleware if needed

// GET /api/users/:id - Get user by ID
router.get('/:id', protect, getUserById); // 'protect' if only logged-in users can view profiles, or remove for public

module.exports = router;
