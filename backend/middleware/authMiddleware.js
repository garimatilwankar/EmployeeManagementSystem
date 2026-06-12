import jwt from 'jsonwebtoken';
import AppError from '../utils/errorHandler.js';

export const verifyToken = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return next(new AppError('No token provided. Please login', 401));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Token expired. Please login again', 401));
        }
        if (error.name === 'JsonWebTokenError') {
            return next(new AppError('Invalid token', 401));
        }
        next(error);
    }
};

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to access this resource', 403));
        }
        next();
    };
};

export const checkActive = (req, res, next) => {
    if (!req.user.isActive) {
        return next(new AppError('Your account has been deactivated', 403));
    }
    next();
};