const asyncHandler = require('express-async-handler'); // Changed from asyncHandlerUserCtrl
const User = require('../models/User'); // Corrected import
// const Post = require('../models/Post'); // Not directly used here, but User model populates posts

// @desc    Get current user's profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate('posts', 'content image createdAt')
        .populate('followers', 'firstName lastName profilePicture')
        .populate('following', 'firstName lastName profilePicture');

    if (user) {
        res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            bio: user.bio,
            profilePicture: user.profilePicture,
            posts: user.posts,
            followers: user.followers,
            following: user.following,
            createdAt: user.createdAt,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.bio = req.body.bio || user.bio;
        // Email updates should be handled with care, possibly requiring re-verification.
        // user.email = req.body.email || user.email;

        if (req.body.password) {
            // Password will be hashed by the pre-save hook in the User model
            user.password = req.body.password;
        }

        if (req.file) {
            // TODO: Implement logic to delete old profile picture if it exists and is not the default one.
            // This depends on whether you are storing files locally or on a cloud service.
            // For local storage:
            user.profilePicture = `/uploads/${req.file.filename}`;
            // For Cloudinary:
            // user.profilePicture = req.file.path;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            bio: updatedUser.bio,
            profilePicture: updatedUser.profilePicture,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Public (or Private, adjust 'protect' middleware in routes as needed)
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
        .select('-password -refreshToken') // Exclude sensitive fields
        .populate('posts', 'content image createdAt')
        .populate('followers', 'firstName lastName profilePicture')
        .populate('following', 'firstName lastName profilePicture');

    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get all users (for admin or specific features like user search)
// @route   GET /api/users
// @access  Private/Admin (use 'protect' and potentially an admin role check middleware)
const getUsers = asyncHandler(async (req, res) => {
    // TODO: Implement pagination for better performance with many users
    const users = await User.find({}).select('-password -refreshToken');
    res.json(users);
});

module.exports = { getUserProfile, updateUserProfile, getUserById, getUsers };
