// src/controllers/businessAddress.controller.js
import { Op } from 'sequelize';
import BusinessAddress from '../models/BusinessAddress.js';
import { Business } from '../models/Business.js';

// Create a new business address
export const createBusinessAddress = async (req, res) => {
    try {
        const {
            businessId,
            business_id,
            addressName,
            address_name,
            fullAddress,
            full_address,
            addressType,
            address_type,
            status,
        } = req.body;

        if (!(businessId || business_id)) {
            return res.status(400).json({
                success: false,
                message: 'businessId is required',
            });
        }

        if (!(addressName || address_name)) {
            return res.status(400).json({
                success: false,
                message: 'addressName is required',
            });
        }

        if (!(fullAddress || full_address)) {
            return res.status(400).json({
                success: false,
                message: 'fullAddress is required',
            });
        }

        const newAddress = await BusinessAddress.create({
            businessId: businessId || business_id,
            addressName: addressName || address_name,
            fullAddress: fullAddress || full_address,
            addressType: addressType || address_type || 'REGISTERED',
            status: status || 'ACTIVE',
        });

        return res.status(201).json({
            success: true,
            data: newAddress,
        });
    } catch (err) {
        console.error('createBusinessAddress error:', err);

        if (err.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid businessId (foreign key constraint failed)',
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

// Get list of business addresses (with filters)
export const getBusinessAddresses = async (req, res) => {
    try {
        const { businessId, addressType, status, search } = req.query;

        const where = {};

        if (businessId) where.businessId = businessId;
        if (addressType) where.addressType = addressType;
        if (status) where.status = status;

        if (search) {
            const s = search.trim();
            where[Op.or] = [
                { addressName: { [Op.like]: `%${s}%` } },
                { fullAddress: { [Op.like]: `%${s}%` } },
            ];
        }

        const addresses = await BusinessAddress.findAll({
            where,
            include: [
                {
                    model: Business,
                    as: 'business',
                    attributes: ['id', 'businessName'],
                },
            ],
            order: [['addressName', 'ASC']],
        });

        return res.json({
            success: true,
            data: addresses,
        });
    } catch (err) {
        console.error('getBusinessAddresses error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

// Get a single business address by ID
export const getBusinessAddressById = async (req, res) => {
    try {
        const { id } = req.params;

        const address = await BusinessAddress.findByPk(id, {
            include: [
                {
                    model: Business,
                    as: 'business',
                    attributes: ['id', 'businessName'],
                },
            ],
        });

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Business address not found',
            });
        }

        return res.json({
            success: true,
            data: address,
        });
    } catch (err) {
        console.error('getBusinessAddressById error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

// Update a business address
export const updateBusinessAddress = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            businessId,
            business_id,
            addressName,
            address_name,
            fullAddress,
            full_address,
            addressType,
            address_type,
            status,
        } = req.body;

        const address = await BusinessAddress.findByPk(id);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Business address not found',
            });
        }

        if (businessId || business_id) {
            address.businessId = businessId || business_id;
        }

        if (addressName || address_name) {
            address.addressName = addressName || address_name;
        }

        if (fullAddress || full_address) {
            address.fullAddress = fullAddress || full_address;
        }

        if (addressType || address_type) {
            address.addressType = addressType || address_type;
        }

        if (status) {
            address.status = status;
        }

        await address.save();

        return res.json({
            success: true,
            data: address,
        });
    } catch (err) {
        console.error('updateBusinessAddress error:', err);

        if (err.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid businessId (foreign key constraint failed)',
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

// Delete a business address
export const deleteBusinessAddress = async (req, res) => {
    try {
        const { id } = req.params;

        const address = await BusinessAddress.findByPk(id);

        if (!address) {
            return res.status(404).json({
                success: false,
                message: 'Business address not found',
            });
        }

        await address.destroy();

        return res.json({
            success: true,
            message: 'Business address deleted successfully',
        });
    } catch (err) {
        console.error('deleteBusinessAddress error:', err);
        return res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};
