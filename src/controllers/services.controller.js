// src/controllers/services.controller.js
import { Op } from 'sequelize';
import { Service } from '../models/index.js';

function buildWhere(query) {
    const where = {};
    if (query.businessId) where.businessId = query.businessId;
    if (query.status) where.status = query.status;
    if (query.visible !== undefined) {
        if (query.visible === 'true' || query.visible === true) where.visible = true;
        if (query.visible === 'false' || query.visible === false) where.visible = false;
    }
    if (query.q) {
        const like = { [Op.like]: `%${query.q}%` };
        where[Op.or] = [{ name: like }, { code: like }, { description: like }];
    }
    return where;
}

export async function createService(req, res) {
    try {
        const payload = req.body || {};
        if (payload.businessId == null) return res.status(400).json({ message: 'businessId is required' });
        if (!payload.name) return res.status(400).json({ message: 'name is required' });

        const created = await Service.create(payload);
        return res.status(201).json(created);
    } catch (err) {
        if (err?.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Duplicate (name or code) for this business' });
        }
        console.error('createService error', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function listServices(req, res) {
    try {
        const { page = 1, pageSize = 20, orderBy = 'createdAt', order = 'DESC', includeDeleted = 'false' } = req.query;
        const where = buildWhere(req.query);
        const limit = Math.min(parseInt(pageSize, 10) || 20, 100);
        const offset = ((parseInt(page, 10) || 1) - 1) * limit;
        const paranoid = !(includeDeleted === 'true' || includeDeleted === true);

        const result = await Service.findAndCountAll({
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
        console.error('listServices error', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function getServiceById(req, res) {
    try {
        const paranoid = !(req.query.includeDeleted === 'true' || req.query.includeDeleted === true);
        const svc = await Service.findByPk(req.params.id, { paranoid });
        if (!svc) return res.status(404).json({ message: 'Service not found' });
        return res.json(svc);
    } catch (err) {
        console.error('getServiceById error', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function updateService(req, res) {
    try {
        const { id } = req.params;
        const payload = req.body || {};

        const svc = await Service.findByPk(id);
        if (!svc) return res.status(404).json({ message: 'Service not found' });

        await svc.update(payload);
        return res.json(svc);
    } catch (err) {
        if (err?.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Duplicate (name or code) for this business' });
        }
        console.error('updateService error', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function deleteService(req, res) {
    try {
        const { id } = req.params;
        const svc = await Service.findByPk(id);
        if (!svc) return res.status(404).json({ message: 'Service not found' });
        await svc.destroy(); // soft delete
        return res.json({ message: 'Service deleted' });
    } catch (err) {
        console.error('deleteService error', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function restoreService(req, res) {
    try {
        const { id } = req.params;
        const svc = await Service.findByPk(id, { paranoid: false });
        if (!svc) return res.status(404).json({ message: 'Service not found' });
        await svc.restore();
        return res.json({ message: 'Service restored' });
    } catch (err) {
        console.error('restoreService error', err);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function hardDeleteService(req, res) {
    try {
        const { id } = req.params;
        const svc = await Service.findByPk(id, { paranoid: false });
        if (!svc) return res.status(404).json({ message: 'Service not found' });
        await svc.destroy({ force: true });
        return res.json({ message: 'Service hard deleted' });
    } catch (err) {
        console.error('hardDeleteService error', err);
        return res.status(500).json({ message: 'Server error' });
    }
}
