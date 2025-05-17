const express = require('express'); // Renamed from expressPostRoutes
const router = express.Router(); // Renamed from routerPost
const {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    createComment,
    updateComment,
    deleteComment
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware'); // Renamed from protectPost
const { upload } = require('../middleware/uploadMiddleware'); // Renamed from uploadPost

// --- Post Routes ---
// POST /api/posts - Create a new post
// GET /api/posts - Get all posts
router.route('/')
    .post(protect, upload.single('image'), createPost) // 'image' is the field name for post image
    .get(getAllPosts); // Make public or use 'protect'

// GET /api/posts/:id - Get a single post
// PUT /api/posts/:id - Update a post
// DELETE /api/posts/:id - Delete a post
router.route('/:id')
    .get(getPostById) // Make public or use 'protect'
    .put(protect, upload.single('image'), updatePost)
    .delete(protect, deletePost);

// --- Comment Routes (nested under posts for clarity) ---
// POST /api/posts/:postId/comments - Create a new comment on a post
router.post('/:postId/comments', protect, upload.single('image'), createComment); // 'image' for comment image

// PUT /api/posts/:postId/comments/:commentId - Update a comment
// DELETE /api/posts/:postId/comments/:commentId - Delete a comment
router.route('/:postId/comments/:commentId')
    .put(protect, upload.single('image'), updateComment)
    .delete(protect, deleteComment);

module.exports = router;
