// src/controllers/country.controller.js
import { Op } from 'sequelize';
import Country from '../models/Country.js';
import State from '../models/State.js';

export const createCountry = async (req, res) => {
    try {
        const { name, isoCode, iso_code, phoneCode, phone_code, status } = req.body;

        const country = await Country.create({
            name,
            isoCode: isoCode || iso_code,
            phoneCode: phoneCode || phone_code,
            status: status || 'ACTIVE',
        });

        return res.status(201).json({ success: true, data: country });
    } catch (err) {
        console.error('createCountry error:', err);
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res
                .status(400)
                .json({ success: false, message: 'ISO code must be unique' });
        }
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getCountries = async (req, res) => {
    try {
        const { status, search } = req.query;

        const where = {};
        if (status) where.status = status;

        if (search) {
            const s = search.trim();
            where[Op.or] = [
                { name: { [Op.like]: `%${s}%` } },
                { isoCode: { [Op.like]: `%${s}%` } },
            ];
        }

        const countries = await Country.findAll({
            where,
            order: [['name', 'ASC']],
        });

        return res.json({ success: true, data: countries });
    } catch (err) {
        console.error('getCountries error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getCountryById = async (req, res) => {
    try {
        const { id } = req.params;

        const country = await Country.findByPk(id, {
            include: [
                {
                    model: State,
                    as: 'states',
                    order: [['name', 'ASC']],
                },
            ],
        });

        if (!country) {
            return res
                .status(404)
                .json({ success: false, message: 'Country not found' });
        }

        return res.json({ success: true, data: country });
    } catch (err) {
        console.error('getCountryById error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const updateCountry = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, isoCode, iso_code, phoneCode, phone_code, status } = req.body;

        const country = await Country.findByPk(id);
        if (!country) {
            return res
                .status(404)
                .json({ success: false, message: 'Country not found' });
        }

        country.name = name ?? country.name;
        country.isoCode = isoCode ?? iso_code ?? country.isoCode;
        country.phoneCode = phoneCode ?? phone_code ?? country.phoneCode;
        country.status = status ?? country.status;

        await country.save();

        return res.json({ success: true, data: country });
    } catch (err) {
        console.error('updateCountry error:', err);
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res
                .status(400)
                .json({ success: false, message: 'ISO code must be unique' });
        }
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const deleteCountry = async (req, res) => {
    try {
        const { id } = req.params;

        const country = await Country.findByPk(id);
        if (!country) {
            return res
                .status(404)
                .json({ success: false, message: 'Country not found' });
        }

        await country.destroy(); // will fail if states exist because of FK RESTRICT

        return res.json({ success: true, message: 'Country deleted successfully' });
    } catch (err) {
        console.error('deleteCountry error:', err);

        // FK restriction: states exist
        if (err.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete country with existing states',
            });
        }

        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
