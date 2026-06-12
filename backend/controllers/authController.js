import { authService } from '../services/authService.js';
import AppError from '../utils/errorHandler.js';
import logger from '../config/logger.js';

export const authController = {
    async signup(req, res, next) {
        try {
            const { name, email, phone, password } = req.body;

            const result = await authService.signup(name, email, phone, password);

            res.status(201).json({
                success: true,
                message: 'Account created successfully',
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                },
            });
        } catch (error) {
            next(error);
        }
    },

    async login(req, res, next) {
        try {
            const { email, password } = req.body;

            const result = await authService.login(email, password);

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: result.user,
                    accessToken: result.accessToken,
                    refreshToken: result.refreshToken,
                },
            });
        } catch (error) {
            next(error);
        }
    },

    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;

            const result = await authService.forgotPassword(email);

            res.status(200).json({
                success: true,
                message: result.message,
                data: {
                    resetToken: result.resetToken,
                },
            });
        } catch (error) {
            next(error);
        }
    },

    async resetPassword(req, res, next) {
        try {
            const { token, password } = req.body;

            const result = await authService.resetPassword(token, password);

            res.status(200).json({
                success: true,
                message: result.message,
            });
        } catch (error) {
            next(error);
        }
    },

    async refreshToken(req, res, next) {
        try {
            const userId = req.user.id;

            const result = await authService.refreshAccessToken(userId);

            res.status(200).json({
                success: true,
                message: 'Token refreshed successfully',
                data: {
                    accessToken: result.accessToken,
                },
            });
        } catch (error) {
            next(error);
        }
    },

    async logout(req, res, next) {
        try {
            logger.info(`User logged out: ${req.user.email}`);

            res.status(200).json({
                success: true,
                message: 'Logged out successfully',
            });
        } catch (error) {
            next(error);
        }
    },

    async verifyEmail(req, res, next) {
        try {
            const { email } = req.body;

            const exists = await authService.verifyEmail(email);

            res.status(200).json({
                success: true,
                data: {
                    emailExists: exists,
                },
            });
        } catch (error) {
            next(error);
        }
    },
};