import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import AppError from '../utils/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf'];

    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new AppError('Invalid file type. Only JPEG, PNG, GIF, and PDF are allowed', 400));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760,
    },
});

export const uploadMiddleware = {
    single: (fieldName) => upload.single(fieldName),
    array: (fieldName, maxCount = 5) => upload.array(fieldName, maxCount),
    fields: (fields) => upload.fields(fields),
};