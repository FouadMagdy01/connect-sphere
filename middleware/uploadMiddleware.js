const multer = require('multer');
const path = require('path'); // Node.js path module
// const cloudinary = require('cloudinary').v2; // Uncomment if using Cloudinary
// const { CloudinaryStorage } = require('multer-storage-cloudinary'); // Uncomment if using Cloudinary

// --- Basic Multer setup for local storage ---
// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Ensure 'uploads/' directory exists in your project root
    },
    filename: function (req, file, cb) {
        // Create a unique filename: fieldname-timestamp.extension
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB file size limit
});

// --- Cloudinary Setup (Alternative to local storage) ---
/*
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'social_media_app', // Folder name in Cloudinary
        format: async (req, file) => 'png', // supports promises as well
        public_id: (req, file) => `${file.fieldname}-${Date.now()}`,
        transformation: [{ width: 500, height: 500, crop: 'limit' }] // Example transformation
    },
});

const uploadCloudinary = multer({
    storage: cloudinaryStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // 5MB
});

module.exports = { upload, uploadCloudinary }; // Choose one or provide both
*/
module.exports = { upload }; // Export for local storage by default
