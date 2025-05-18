const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const jwt = require('jsonwebtoken');

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

    let profilePicturePath;
    if (req.file) {
        profilePicturePath = `/uploads/${req.file.filename}`;
        // If using Cloudinary, it would be req.file.path
        // profilePicturePath = req.file.path;
    }

    const user = await User.create({
        firstName,
        lastName,
        email,
        password, // Hashing is done by pre-save hook in User model
        bio: bio || '',
        profilePicture: profilePicturePath
    });

    if (user) {
        const accessToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);

        // Store refresh token in DB
        user.refreshToken = newRefreshToken;
        await user.save({ validateBeforeSave: false });

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

        // Update/Store refresh token in DB
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

// @desc    Get new access token AND new refresh token using an existing refresh token (Token Rotation)
// @route   POST /api/auth/refresh-token
// @access  Public (requires refresh token)
const refreshTokenHandler = asyncHandler(async (req, res) => {
    const { token: requestRefreshToken } = req.body;

    if (!requestRefreshToken) {
        res.status(401);
        throw new Error('Refresh token is required');
    }

    try {
        const decoded = jwt.verify(requestRefreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id).select('+refreshToken');

        if (!user) {
            res.status(403); // Forbidden
            throw new Error('Invalid refresh token. User not found.');
        }

        if (user.refreshToken !== requestRefreshToken) {
            // CRITICAL: Someone might be trying to reuse an old/compromised refresh token.
            // Invalidate all refresh tokens for this user for security.
            user.refreshToken = undefined; // Or an array of invalid tokens
            await user.save({ validateBeforeSave: false });
            res.status(403);
            throw new Error('Invalid refresh token. Token reuse detected. Please log in again.');
        }

        // Generate new access token
        const newAccessToken = generateAccessToken(user._id);
        // Generate new refresh token (Token Rotation)
        const newGeneratedRefreshToken = generateRefreshToken(user._id);

        // Update the refresh token in the database with the new one
        user.refreshToken = newGeneratedRefreshToken;
        await user.save({ validateBeforeSave: false });

        res.json({
            accessToken: newAccessToken,
            refreshToken: newGeneratedRefreshToken, // Send the new refresh token to the client
        });

    } catch (error) {
        console.error("Refresh token error:", error.message);
        // Ensure consistent error status for various failure reasons during refresh
        if (!res.headersSent) { // Check if headers already sent (e.g. by token reuse block)
             res.status(403); // Forbidden
        }
        // Avoid re-throwing if already handled, or re-throw a generic message
        throw new Error(error.message.includes('Token reuse detected') ? error.message : 'Invalid or expired refresh token. Please log in again.');
    }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        // Invalidate the refresh token on the server-side
        user.refreshToken = undefined; // or null, or add to a blacklist
        await user.save({ validateBeforeSave: false });
    }
    res.status(200).json({ message: 'User logged out successfully' });
});


module.exports = { registerUser, loginUser, refreshToken: refreshTokenHandler, logoutUser };
