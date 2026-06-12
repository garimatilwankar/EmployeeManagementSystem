import logger from '../config/logger.js';
import AppError from '../utils/errorHandler.js';

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    logger.error({
        message: err.message,
        stack: err.stack,
        statusCode: err.statusCode,
        path: req.path,
        method: req.method,
    });

    res.status(err.statusCode).json({
        success: false,
        statusCode: err.statusCode,
        message: err.message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

export default errorHandler;