import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import pool from './config/database.js';
import logger from './config/logger.js';
import errorHandler from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());

// CORS Configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
}));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
});

app.use(limiter);

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request Logging Middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info({
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
        });
    });
    next();
});

// Health Check Route
app.get('/api/health', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({
            success: true,
            status: 'UP',
            database: 'CONNECTED',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            status: 'DOWN',
            database: 'DISCONNECTED',
            error: error.message,
        });
    }
});

// API Routes
app.use('/api/v1/auth', authRoutes);

// 404 Route Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Route not found',
        path: req.path,
    });
});

// Error Handler Middleware (Must be last)
app.use(errorHandler);

// Database Connection Test
pool.query('SELECT NOW()', (err, result) => {
    if (err) {
        logger.error('Failed to connect to PostgreSQL database:', err);
        console.error('Database connection failed:', err);
    } else {
        logger.info('Connected to PostgreSQL database successfully');
    }
});

// Server Startup
app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
    console.log(`
    ================================
    EMS API Server Started
    ================================
    Port: ${PORT}
    Environment: ${process.env.NODE_ENV}
    API Base: http://localhost:${PORT}/api/v1
    Health Check: http://localhost:${PORT}/api/health
    ================================
    `);
});

// Graceful Shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    await pool.end();
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.info('SIGINT signal received: closing HTTP server');
    await pool.end();
    process.exit(0);
});

export default app;