const mongoose = require('mongoose'); // Changed from mongooseComment to mongoose

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Post',
    },
    content: {
        type: String,
        required: [true, 'Comment content cannot be empty'],
        trim: true,
        maxlength: [500, 'Comment content cannot exceed 500 characters'],
    },
    image: { // Optional image for a comment
        type: String,
        default: '',
    },
    likes: [{ // Optional: likes for comments
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
}, {
    timestamps: true,
});

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
