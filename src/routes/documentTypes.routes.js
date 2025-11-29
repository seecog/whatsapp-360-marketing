// src/routes/documentTypes.routes.js
import express from 'express';
import {
    renderDocumentTypesPage,
    listDocumentTypes,
    getDocumentTypeById,   // ✅ NEW
    createDocumentType,
    updateDocumentType,
    deleteDocumentType,
} from '../controllers/documentType.controller.js';

const router = express.Router();

// Page (HTML)
router.get('/document-types', renderDocumentTypesPage);

// APIs (JSON)
router.get('/api/v1/document-types', listDocumentTypes);

// ✅ NEW: get single doc type (used by View + Edit)
router.get('/api/v1/document-types/:id', getDocumentTypeById);

router.post('/api/v1/document-types', express.json(), createDocumentType);
router.put('/api/v1/document-types/:id', express.json(), updateDocumentType);
router.delete('/api/v1/document-types/:id', deleteDocumentType);

export default router;
