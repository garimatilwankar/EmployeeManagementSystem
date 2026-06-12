import Joi from 'joi';

export const signupSchema = Joi.object({
    name: Joi.string().min(3).max(100).required().messages({
        'string.empty': 'Name is required',
        'string.min': 'Name must be at least 3 characters',
        'string.max': 'Name must not exceed 100 characters',
    }),
    email: Joi.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Email must be valid',
    }),
    phone: Joi.string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
            'string.empty': 'Phone is required',
            'string.pattern.base': 'Phone must be 10 digits',
        }),
    password: Joi.string().min(8).max(128).required().messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 8 characters',
        'string.max': 'Password must not exceed 128 characters',
    }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Passwords do not match',
    }),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Email must be valid',
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Password is required',
    }),
});

export const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Email must be valid',
    }),
});

export const resetPasswordSchema = Joi.object({
    token: Joi.string().required().messages({
        'string.empty': 'Reset token is required',
    }),
    password: Joi.string().min(8).max(128).required().messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 8 characters',
        'string.max': 'Password must not exceed 128 characters',
    }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
        'any.only': 'Passwords do not match',
    }),
});