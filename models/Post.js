const mongoose = require('mongoose'); // Changed from mongoosePost to mongoose

const postSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Reference to the User model
    },
    content: {
        type: String,
        required: [true, 'Post content cannot be empty'],
        trim: true,
        maxlength: [2000, 'Post content cannot exceed 2000 characters'],
    },
    image: {
        type: String, // URL to the image
        default: '',
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
    }],
}, {
    timestamps: true,
});

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
