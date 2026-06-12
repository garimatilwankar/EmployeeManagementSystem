import express from 'express';
import { authController } from '../controllers/authController.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
    signupSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from '../utils/validators/authValidator.js';

const router = express.Router();

// Public routes
router.post(
    '/signup',
    validateRequest(signupSchema),
    authController.signup
);

router.post(
    '/login',
    validateRequest(loginSchema),
    authController.login
);

router.post(
    '/forgot-password',
    validateRequest(forgotPasswordSchema),
    authController.forgotPassword
);

router.post(
    '/reset-password',
    validateRequest(resetPasswordSchema),
    authController.resetPassword
);

router.post(
    '/verify-email',
    authController.verifyEmail
);

// Protected routes
router.post(
    '/refresh-token',
    verifyToken,
    authController.refreshToken
);

router.post(
    '/logout',
    verifyToken,
    authController.logout
);

export default router;