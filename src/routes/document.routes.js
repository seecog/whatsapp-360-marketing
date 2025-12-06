// src/routes/document.routes.js
import express from 'express';
import {
    renderDocumentsPage,
    generateDocument,
} from '../controllers/document.controller.js';
import { verifyUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// HTML page (with employees + document types)
router.get('/documents', verifyUser, renderDocumentsPage);

// Generate A4 PDF
router.post(
    '/documents/generate',
    verifyUser,
    express.urlencoded({ extended: true }),
    generateDocument
);

export default router;
