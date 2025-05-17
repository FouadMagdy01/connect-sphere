const asyncHandler = require('express-async-handler'); // Changed from asyncHandlerCtrl
const User = require('../models/User'); 
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken'); // Corrected import
const jwt = require('jsonwebtoken'); // Changed from jwtCtrl

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password, bio } = req.body;

    if (!firstName || !lastName || !email || !password) {
        res.status(400);
        throw new Error('Please provide all required fields: firstName, lastName, email, password');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists with this email');
    }

    // Profile picture handling during registration (if req.file exists)
    let profilePicturePath;
    if (req.file) {
        // Assuming local upload, path will be relative to how you serve static files
        profilePicturePath = `/uploads/${req.file.filename}`;
        // If using Cloudinary, it would be req.file.path (the Cloudinary URL)
        // profilePicturePath = req.file.path;
    }


    const user = await User.create({
        firstName,
        lastName,
        email,
        password, // Hashing is done by pre-save hook in User model
        bio: bio || '',
        profilePicture: profilePicturePath // Use the path determined above
    });

    if (user) {
        const accessToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id); // Renamed for clarity

        // Store refresh token in DB
        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false }); // Skip validation as we are only updating token

        res.status(201).json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            bio: user.bio,
            profilePicture: user.profilePicture,
            accessToken,
            refreshToken: newRefreshToken,
            message: "User registered successfully. You can update your profile picture later if needed."
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide email and password');
    }

    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (user && (await user.matchPassword(password))) {
        const accessToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);

        // Update refresh token in DB
        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

        res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            bio: user.bio,
            profilePicture: user.profilePicture,
            accessToken,
            refreshToken: newRefreshToken,
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// @desc    Get new access token using refresh token
// @route   POST /api/auth/refresh-token
// @access  Public (requires refresh token)
const refreshTokenHandler = asyncHandler(async (req, res) => { // Renamed to avoid conflict
    const { token: requestRefreshToken } = req.body;

    if (!requestRefreshToken) {
        res.status(401);
        throw new Error('Refresh token is required');
    }

    try {
        const decoded = jwt.verify(requestRefreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id).select('+refreshToken');

        if (!user || user.refreshToken !== requestRefreshToken) {
            res.status(403);
            throw new Error('Invalid or expired refresh token. Please log in again.');
        }

        const newAccessToken = generateAccessToken(user._id);
        // Optional: Implement refresh token rotation for enhanced security
        // const newGeneratedRefreshToken = generateRefreshToken(user._id);
        // user.refreshToken = newGeneratedRefreshToken;
        // await user.save({ validateBeforeSave: false });

        res.json({
            accessToken: newAccessToken,
            // refreshToken: newGeneratedRefreshToken, // if rotating
        });

    } catch (error) {
        console.error("Refresh token error:", error.message);
        res.status(403);
        throw new Error('Invalid or expired refresh token. Please log in again.');
    }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        user.refreshToken = undefined;
        await user.save({ validateBeforeSave: false });
    }
    res.status(200).json({ message: 'User logged out successfully' });
});


module.exports = { registerUser, loginUser, refreshToken: refreshTokenHandler, logoutUser };
