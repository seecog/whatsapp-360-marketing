// src/routes/state.routes.js
import express from 'express';
import {
    createState,
    getStates,
    getStateById,
    updateState,
    deleteState,
    getStatesByCountry,
} from '../controllers/state.controller.js';

const router = express.Router();

// /api/states
router.get('/', getStates);
router.get('/:id', getStateById);
router.post('/', createState);
router.put('/:id', updateState);
router.delete('/:id', deleteState);

// Optional nested route: /api/countries/:countryId/states
router.get('/by-country/:countryId', getStatesByCountry);

export default router;
