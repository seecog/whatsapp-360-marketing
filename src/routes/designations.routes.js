// src/routes/designations.routes.js
import { Router } from 'express';
import {
    createDesignation,
    listDesignations,
    getDesignationById,
    updateDesignation,
    deleteDesignation,
    restoreDesignation,
    hardDeleteDesignation,
} from '../controllers/designations.controller.js';

const router = Router();

// add auth middleware here if needed

router.post('/', createDesignation);
router.get('/', listDesignations);
router.get('/:id', getDesignationById);
router.patch('/:id', updateDesignation);
router.delete('/:id', deleteDesignation);
router.post('/:id/restore', restoreDesignation);
router.delete('/:id/hard', hardDeleteDesignation);

export { router as designationsRoutes };
