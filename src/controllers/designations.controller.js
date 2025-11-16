// src/controllers/designations.controller.js
import { Op } from 'sequelize';
import { Designation } from '../models/index.js';

function buildWhere(query) {
    const where = {};
    if (query.businessId) where.businessId = query.businessId;
    if (query.status) where.status = query.status; // ACTIVE|INACTIVE
    if (query.q) {
        const like = { [Op.like]: `%${query.q}%` };
        where[Op.or] = [{ name: like }, { code: like }, { description: like }];
    }
    return where;
}

// POST /designations
export async function createDesignation(req, res) {
    try {
        const body = req.body || {};
        if (body.businessId == null) return res.status(400).json({ message: 'businessId is required' });
        if (!body.name) return res.status(400).json({ message: 'name is required' });

        const created = await Designation.create(body);
        return res.status(201).json(created);
    } catch (err) {
        if (err?.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Duplicate (name or code) for this business' });
        }
        console.error('createDesignation error', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// GET /designations
export async function listDesignations(req, res) {
    try {
        const { page = 1, pageSize = 20, orderBy = 'createdAt', order = 'DESC', includeDeleted = 'false' } = req.query;
        const where = buildWhere(req.query);
        const limit = Math.min(parseInt(pageSize, 10) || 20, 100);
        const offset = ((parseInt(page, 10) || 1) - 1) * limit;
        const paranoid = !(includeDeleted === 'true' || includeDeleted === true);

        const result = await Designation.findAndCountAll({
            where,
            limit,
            offset,
            order: [[orderBy, String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC']],
            paranoid,
        });

        return res.json({
            items: result.rows,
            total: result.count,
            page: Number(page),
            pageSize: limit,
            totalPages: Math.ceil(result.count / limit),
        });
    } catch (err) {
        console.error('listDesignations error', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// GET /designations/:id
export async function getDesignationById(req, res) {
    try {
        const paranoid = !(req.query.includeDeleted === 'true' || req.query.includeDeleted === true);
        const row = await Designation.findByPk(req.params.id, { paranoid });
        if (!row) return res.status(404).json({ message: 'Designation not found' });
        return res.json(row);
    } catch (err) {
        console.error('getDesignationById error', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// PATCH /designations/:id
export async function updateDesignation(req, res) {
    try {
        const { id } = req.params;
        const row = await Designation.findByPk(id);
        if (!row) return res.status(404).json({ message: 'Designation not found' });

        await row.update(req.body || {});
        return res.json(row);
    } catch (err) {
        if (err?.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Duplicate (name or code) for this business' });
        }
        console.error('updateDesignation error', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// DELETE /designations/:id  (soft)
export async function deleteDesignation(req, res) {
    try {
        const { id } = req.params;
        const row = await Designation.findByPk(id);
        if (!row) return res.status(404).json({ message: 'Designation not found' });

        await row.destroy(); // paranoid: sets deletedAt
        return res.json({ message: 'Designation deleted' });
    } catch (err) {
        console.error('deleteDesignation error', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// POST /designations/:id/restore
export async function restoreDesignation(req, res) {
    try {
        const { id } = req.params;
        const row = await Designation.findByPk(id, { paranoid: false });
        if (!row) return res.status(404).json({ message: 'Designation not found' });

        await row.restore();
        return res.json({ message: 'Designation restored' });
    } catch (err) {
        console.error('restoreDesignation error', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

// DELETE /designations/:id/hard
export async function hardDeleteDesignation(req, res) {
    try {
        const { id } = req.params;
        const row = await Designation.findByPk(id, { paranoid: false });
        if (!row) return res.status(404).json({ message: 'Designation not found' });

        await row.destroy({ force: true });
        return res.json({ message: 'Designation hard deleted' });
    } catch (err) {
        console.error('hardDeleteDesignation error', err);
        return res.status(500).json({ message: 'Server error' });
    }
}
