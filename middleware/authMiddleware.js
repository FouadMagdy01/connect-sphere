const jwt = require('jsonwebtoken'); // Changed from jwtAuth to jwt
const asyncHandler = require('express-async-handler'); // Changed from asyncHandlerAuth to asyncHandler
const User = require('../models/User'); 

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password -refreshToken');

            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }
            next();
        } catch (error) {
            console.error('Token verification error:', error);
            res.status(401);
            if (error.name === 'TokenExpiredError') {
                throw new Error('Not authorized, token expired');
            }
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

module.exports = { protect };
