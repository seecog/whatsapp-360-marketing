// src/routes/businessAddress.routes.js
import express from 'express';
import {
    createBusinessAddress,
    getBusinessAddresses,
    getBusinessAddressById,
    updateBusinessAddress,
    deleteBusinessAddress,
} from '../controllers/businessAddress.controller.js';

const router = express.Router();

// GET /api/business-addresses
router.get('/', getBusinessAddresses);

// GET /api/business-addresses/:id
router.get('/:id', getBusinessAddressById);

// POST /api/business-addresses
router.post('/', createBusinessAddress);

// PUT /api/business-addresses/:id
router.put('/:id', updateBusinessAddress);

// DELETE /api/business-addresses/:id
router.delete('/:id', deleteBusinessAddress);

export default router;
