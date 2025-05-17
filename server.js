const path = require('path'); // Needed if serving static files locally or for __dirname
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); // Corrected: Assuming db.js exports connectDB
const { errorHandler, notFound } = require('./middleware/errorMiddleware'); // Corrected

// Import routes
const authRoutes = require('./routes/authRoutes'); // Corrected
const userRoutes = require('./routes/userRoutes'); // Corrected
const postRoutes = require('./routes/postRoutes'); // Corrected

dotenv.config(); // Load .env file

connectDB(); // Connect to MongoDB

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

// --- Basic Logging Middleware (optional) ---
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// --- API Routes ---
app.get('/', (req, res) => {
    res.send('Social Media API Running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// --- Static Folder for Uploads (if not using cloud storage and 'uploads' dir is at root) ---
// Make sure the 'uploads' directory exists at the root of your project.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// --- Error Handling Middleware ---
app.use(notFound); // For 404 errors
app.use(errorHandler); // Custom error handler

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
