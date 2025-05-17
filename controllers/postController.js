const asyncHandler = require('express-async-handler'); // Changed from asyncHandlerPostCtrl
const Post = require('../models/Post'); // Corrected import
const User = require('../models/User'); // Corrected import
const Comment = require('../models/Comment'); // Corrected import
const path = require('path'); // For potential local file deletion
const fs = require('fs'); // For potential local file deletion

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content) {
        res.status(400);
        throw new Error('Post content is required');
    }
    let imagePath;
    if (req.file) {
        imagePath = `/uploads/${req.file.filename}`; // For local storage
        // imagePath = req.file.path; // For Cloudinary
    }

    const post = new Post({
        user: req.user._id,
        content,
        image: imagePath,
    });

    const createdPost = await post.save();

    // Add post to user's posts array
    const user = await User.findById(req.user._id);
    if (user) {
        user.posts.unshift(createdPost._id);
        await user.save();
    }
    // Populate user details for the response
    const populatedPost = await Post.findById(createdPost._id)
        .populate('user', 'firstName lastName profilePicture');


    res.status(201).json(populatedPost);
});

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public (or Private, adjust 'protect' middleware in routes)
const getAllPosts = asyncHandler(async (req, res) => {
    const pageSize = parseInt(req.query.pageSize) || 10;
    const page = parseInt(req.query.page) || 1;

    const count = await Post.countDocuments();
    const posts = await Post.find({})
        .populate('user', 'firstName lastName profilePicture')
        .populate({
            path: 'comments',
            populate: { path: 'user', select: 'firstName lastName profilePicture' },
            options: { sort: { createdAt: -1 } }
        })
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({
        posts,
        page,
        pages: Math.ceil(count / pageSize),
        count
    });
});

// @desc    Get a single post by ID
// @route   GET /api/posts/:id
// @access  Public (or Private)
const getPostById = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id)
        .populate('user', 'firstName lastName profilePicture')
        .populate({
            path: 'comments',
            populate: { path: 'user', select: 'firstName lastName profilePicture' },
            options: { sort: { createdAt: -1 } }
        });

    if (post) {
        res.json(post);
    } else {
        res.status(404);
        throw new Error('Post not found');
    }
});

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (only post owner)
const updatePost = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }

    if (post.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized to update this post');
    }

    post.content = content || post.content;

    if (req.file) {
        // TODO: Delete old image if it exists and is not a placeholder/default
        // if (post.image && post.image.startsWith('/uploads/')) {
        //     const oldImagePath = path.join(__dirname, '..', post.image); // Adjust path as necessary
        //     fs.unlink(oldImagePath, (err) => {
        //         if (err) console.error("Error deleting old post image:", err);
        //     });
        // }
        post.image = `/uploads/${req.file.filename}`; // For local storage
        // post.image = req.file.path; // For Cloudinary
    } else if (req.body.image === '' || req.body.image === null) {
        // TODO: Delete old image if removing it
        post.image = '';
    }

    const updatedPost = await post.save();
    const populatedPost = await Post.findById(updatedPost._id)
        .populate('user', 'firstName lastName profilePicture')
        .populate({
            path: 'comments',
            populate: { path: 'user', select: 'firstName lastName profilePicture' }
        });
    res.json(populatedPost);
});

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (only post owner)
const deletePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }

    if (post.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized to delete this post');
    }

    // Delete all comments associated with the post
    await Comment.deleteMany({ post: post._id });

    // Remove post from user's posts array
    const user = await User.findById(post.user);
    if (user) {
        user.posts.pull(post._id);
        await user.save();
    }

    // If images are stored locally, delete them from the file system
    if (post.image && post.image.startsWith('/uploads/')) {
        const imagePath = path.join(__dirname, '..', post.image); // Adjust path as needed relative to this file
        fs.unlink(imagePath, (err) => {
            if (err) console.error("Error deleting post image file:", err);
            else console.log("Post image file deleted:", imagePath);
        });
    }

    await Post.deleteOne({ _id: post._id });
    res.json({ message: 'Post removed successfully' });
});


// --- Comments Controllers ---

// @desc    Create a new comment on a post
// @route   POST /api/posts/:postId/comments
// @access  Private
const createComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { postId } = req.params;

    if (!content) {
        res.status(400);
        throw new Error('Comment content is required');
    }

    const post = await Post.findById(postId);
    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }
    let imagePath;
    if (req.file) {
        imagePath = `/uploads/${req.file.filename}`; // For local storage
        // imagePath = req.file.path; // For Cloudinary
    }

    const comment = new Comment({
        user: req.user._id,
        post: postId,
        content,
        image: imagePath,
    });

    const createdComment = await comment.save();

    post.comments.unshift(createdComment._id);
    await post.save();

    const populatedComment = await Comment.findById(createdComment._id)
        .populate('user', 'firstName lastName profilePicture');

    res.status(201).json(populatedComment);
});

// @desc    Update a comment
// @route   PUT /api/posts/:postId/comments/:commentId
// @access  Private (only comment owner)
const updateComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { commentId } = req.params; // postId is not strictly needed here for updating the comment itself

    const comment = await Comment.findById(commentId);

    if (!comment) {
        res.status(404);
        throw new Error('Comment not found');
    }

    if (comment.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized to update this comment');
    }

    comment.content = content || comment.content;
    if (req.file) {
        // TODO: Delete old comment image if it exists
        comment.image = `/uploads/${req.file.filename}`;
        // comment.image = req.file.path;
    } else if (req.body.image === '' || req.body.image === null) {
        // TODO: Delete old comment image if removing it
        comment.image = '';
    }

    const updatedComment = await comment.save();
    const populatedComment = await Comment.findById(updatedComment._id)
        .populate('user', 'firstName lastName profilePicture');

    res.json(populatedComment);
});

// @desc    Delete a comment
// @route   DELETE /api/posts/:postId/comments/:commentId
// @access  Private (comment owner or post owner)
const deleteComment = asyncHandler(async (req, res) => {
    const { postId, commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
        res.status(404);
        throw new Error('Comment not found');
    }

    const post = await Post.findById(postId);
    if (!post) {
        res.status(404);
        throw new Error('Post not found to remove comment from');
    }

    if (comment.user.toString() !== req.user._id.toString() && post.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('User not authorized to delete this comment');
    }

    post.comments.pull(comment._id);
    await post.save();

    if (comment.image && comment.image.startsWith('/uploads/')) {
        const imagePath = path.join(__dirname, '..', comment.image);
        fs.unlink(imagePath, (err) => {
            if (err) console.error("Error deleting comment image file:", err);
        });
    }

    await Comment.deleteOne({ _id: comment._id });
    res.json({ message: 'Comment removed successfully' });
});

module.exports = {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    createComment,
    updateComment,
    deleteComment
};
