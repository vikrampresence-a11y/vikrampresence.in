import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Define where to upload files. 
// apps/api/src/routes -> we need to go up to apps/web/public/ebooks
const uploadDir = path.join(__dirname, '../../../../apps/web/public/ebooks');

// Ensure the directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // You can keep the original name or sanitize it
        cb(null, file.originalname);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed.'), false);
        }
    },
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    }
});

router.post('/upload-ebook', upload.single('ebook'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded or invalid file format.' });
        }

        const fileUrl = `/ebooks/${req.file.filename}`;
        logger.info(`Ebook uploaded successfully: ${req.file.filename}`);

        res.status(200).json({
            message: 'Ebook uploaded successfully',
            fileUrl,
            filename: req.file.filename
        });
    } catch (error) {
        logger.error('Error uploading ebook:', error);
        res.status(500).json({ error: 'Failed to upload ebook' });
    }
});

// Add error handling middleware for Multer errors
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        logger.error('Multer error:', err);
        return res.status(400).json({ error: err.message });
    } else if (err) {
        logger.error('Unknown upload error:', err);
        return res.status(500).json({ error: err.message });
    }
    next();
});

export default router;
