import AppError from '../utils/errorHandler.js';

export const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const messages = error.details.map((detail) => detail.message).join(', ');
            return next(new AppError(messages, 422));
        }

        req.body = value;
        next();
    };
};

export const validateParams = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.params, {
            abortEarly: false,
        });

        if (error) {
            const messages = error.details.map((detail) => detail.message).join(', ');
            return next(new AppError(messages, 422));
        }

        req.params = value;
        next();
    };
};