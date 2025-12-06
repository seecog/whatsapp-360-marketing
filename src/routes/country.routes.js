// src/routes/country.routes.js
import express from 'express';
import {
    createCountry,
    getCountries,
    getCountryById,
    updateCountry,
    deleteCountry,
} from '../controllers/country.controller.js';

const router = express.Router();

// /api/countries
router.get('/', getCountries);
router.get('/:id', getCountryById);
router.post('/', createCountry);
router.put('/:id', updateCountry);
router.delete('/:id', deleteCountry);

export default router;
