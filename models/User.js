const mongoose = require('mongoose'); // Changed from mongooseUser to mongoose for consistency
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false, // Do not return password by default
    },
    bio: {
        type: String,
        trim: true,
        maxlength: [250, 'Bio cannot be more than 250 characters'],
        default: '',
    },
    profilePicture: {
        type: String, // URL to the image
        default: 'https://placehold.co/200x200/EFEFEF/AAAAAA&text=No+Image', // Default placeholder
    },
    refreshToken: {
        type: String,
        select: false, // Do not return refresh token by default
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
}, {
    timestamps: true, // Adds createdAt and updatedAt fields
});

// --- Mongoose Middleware: Password Hashing ---
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// --- Mongoose Methods: Password Comparison ---
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
