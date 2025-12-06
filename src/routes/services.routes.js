// src/routes/services.routes.js
import { Router } from 'express';
import {
    createService,
    listServices,
    getServiceById,
    updateService,
    deleteService,
    restoreService,
    hardDeleteService,
} from '../controllers/services.controller.js';

const router = Router();

// If you have auth middleware, add it here (e.g., router.use(requireAuth))

router.post('/', createService);
router.get('/', listServices);
router.get('/:id', getServiceById);
router.patch('/:id', updateService);
router.delete('/:id', deleteService);
router.post('/:id/restore', restoreService);
router.delete('/:id/hard', hardDeleteService);


export { router as servicesRouter };
