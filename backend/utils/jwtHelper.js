import jwt from 'jsonwebtoken';

export const generateAccessToken = (userId, email, role, isActive) => {
    return jwt.sign(
        { id: userId, email, role, isActive },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

export const generateRefreshToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
    );
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return null;
    }
};

export const generateResetToken = (userId, email) => {
    return jwt.sign(
        { id: userId, email, type: 'reset' },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );
};