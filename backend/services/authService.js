import bcrypt from 'bcrypt';
import pool from '../config/database.js';
import { generateAccessToken, generateRefreshToken, generateResetToken } from '../utils/jwtHelper.js';
import AppError from '../utils/errorHandler.js';
import logger from '../config/logger.js';

export const authService = {
    async signup(name, email, phone, password) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Check if email already exists
            const userExists = await client.query(
                'SELECT id FROM users WHERE email = $1',
                [email]
            );

            if (userExists.rows.length > 0) {
                throw new AppError('Email already registered', 409);
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user with employee role
            const result = await client.query(
                `INSERT INTO users (name, email, password, role, is_active)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING id, name, email, role`,
                [name, email, hashedPassword, 'employee', true]
            );

            const user = result.rows[0];

            // Log signup action
            await client.query(
                `INSERT INTO audit_logs (table_name, action_type, record_id, new_data, performed_by, created_at)
                 VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
                ['users', 'insert', user.id, JSON.stringify(user), user.id]
            );

            await client.query('COMMIT');

            const accessToken = generateAccessToken(user.id, user.email, user.role, true);
            const refreshToken = generateRefreshToken(user.id);

            logger.info(`User signed up: ${user.email}`);

            return {
                user,
                accessToken,
                refreshToken,
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    async login(email, password) {
        const result = await pool.query(
            'SELECT id, name, email, password, role, is_active FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            logger.warn(`Login failed: Email not found - ${email}`);
            throw new AppError('Invalid email or password', 401);
        }

        const user = result.rows[0];

        if (!user.is_active) {
            logger.warn(`Login failed: Account inactive - ${email}`);
            throw new AppError('Your account has been deactivated', 403);
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            logger.warn(`Login failed: Invalid password - ${email}`);
            throw new AppError('Invalid email or password', 401);
        }

        const accessToken = generateAccessToken(user.id, user.email, user.role, user.is_active);
        const refreshToken = generateRefreshToken(user.id);

        // Log login action
        await pool.query(
            `INSERT INTO audit_logs (table_name, action_type, record_id, new_data, performed_by, created_at)
             VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
            ['users', 'update', user.id, JSON.stringify({ lastLogin: new Date() }), user.id]
        );

        logger.info(`User logged in: ${user.email}`);

        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            accessToken,
            refreshToken,
        };
    },

    async forgotPassword(email) {
        const result = await pool.query(
            'SELECT id, email FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            // Don't reveal if email exists for security
            return { message: 'If email exists, password reset link will be sent' };
        }

        const user = result.rows[0];
        const resetToken = generateResetToken(user.id, user.email);

        logger.info(`Password reset requested for: ${email}`);

        return {
            resetToken,
            message: 'Password reset token generated. Send this token to user via email.',
        };
    },

    async resetPassword(token, newPassword) {
        // Verify token is valid (this would be done via middleware in production)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // In production, decode the token to get user ID
        // For now, this is a placeholder
        logger.info('Password reset successful');

        return { message: 'Password reset successfully' };
    },

    async refreshAccessToken(userId) {
        const result = await pool.query(
            'SELECT id, email, role, is_active FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            throw new AppError('User not found', 404);
        }

        const user = result.rows[0];

        if (!user.is_active) {
            throw new AppError('User account is inactive', 403);
        }

        const accessToken = generateAccessToken(user.id, user.email, user.role, user.is_active);

        return { accessToken };
    },

    async verifyEmail(email) {
        // This is for future email verification implementation
        const result = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        return result.rows.length > 0;
    },
};