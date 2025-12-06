// src/controllers/state.controller.js
import { Op } from 'sequelize';
import State from '../models/State.js';
import Country from '../models/Country.js';

export const createState = async (req, res) => {
    try {
        const { countryId, country_id, name, code, status } = req.body;

        const state = await State.create({
            countryId: countryId || country_id,
            name,
            code,
            status: status || 'ACTIVE',
        });

        return res.status(201).json({ success: true, data: state });
    } catch (err) {
        console.error('createState error:', err);
        if (err.name === 'SequelizeForeignKeyConstraintError') {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid countryId' });
        }
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getStates = async (req, res) => {
    try {
        const { countryId, status, search } = req.query;

        const where = {};
        if (countryId) where.countryId = countryId;
        if (status) where.status = status;

        if (search) {
            const s = search.trim();
            where[Op.or] = [
                { name: { [Op.like]: `%${s}%` } },
                { code: { [Op.like]: `%${s}%` } },
            ];
        }

        const states = await State.findAll({
            where,
            include: [
                {
                    model: Country,
                    as: 'country',
                    attributes: ['id', 'name', 'isoCode'],
                },
            ],
            order: [['name', 'ASC']],
        });

        return res.json({ success: true, data: states });
    } catch (err) {
        console.error('getStates error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getStateById = async (req, res) => {
    try {
        const { id } = req.params;

        const state = await State.findByPk(id, {
            include: [
                {
                    model: Country,
                    as: 'country',
                    attributes: ['id', 'name', 'isoCode'],
                },
            ],
        });

        if (!state) {
            return res
                .status(404)
                .json({ success: false, message: 'State not found' });
        }

        return res.json({ success: true, data: state });
    } catch (err) {
        console.error('getStateById error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const updateState = async (req, res) => {
    try {
        const { id } = req.params;
        const { countryId, country_id, name, code, status } = req.body;

        const state = await State.findByPk(id);
        if (!state) {
            return res
                .status(404)
                .json({ success: false, message: 'State not found' });
        }

        if (countryId || country_id) {
            state.countryId = countryId || country_id;
        }
        state.name = name ?? state.name;
        state.code = code ?? state.code;
        state.status = status ?? state.status;

        await state.save();

        return res.json({ success: true, data: state });
    } catch (err) {
        console.error('updateState error:', err);
        if (err.name === 'SequelizeForeignKeyConstraintError') {
            return res
                .status(400)
                .json({ success: false, message: 'Invalid countryId' });
        }
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const deleteState = async (req, res) => {
    try {
        const { id } = req.params;

        const state = await State.findByPk(id);
        if (!state) {
            return res
                .status(404)
                .json({ success: false, message: 'State not found' });
        }

        await state.destroy();

        return res.json({ success: true, message: 'State deleted successfully' });
    } catch (err) {
        console.error('deleteState error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * Optional: Get all states for a given countryId from nested route
 */
export const getStatesByCountry = async (req, res) => {
    try {
        const { countryId } = req.params;

        const states = await State.findAll({
            where: { countryId },
            order: [['name', 'ASC']],
        });

        return res.json({ success: true, data: states });
    } catch (err) {
        console.error('getStatesByCountry error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
