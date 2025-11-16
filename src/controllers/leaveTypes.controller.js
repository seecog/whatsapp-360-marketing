import { Op } from 'sequelize';
import { LeaveType } from '../models/index.js';

const whereFromQuery = (q) => {
    const where = {};
    if (q.businessId) where.businessId = q.businessId;
    if (q.status) where.status = q.status;
    if (q.q) {
        const like = { [Op.like]: `%${q.q}%` };
        where[Op.or] = [{ name: like }, { code: like }, { description: like }];
    }
    return where;
};

export async function createLeaveType(req, res) {
    try {
        const body = req.body || {};
        if (body.businessId == null) return res.status(400).json({ message: 'businessId is required' });
        if (!body.name) return res.status(400).json({ message: 'name is required' });

        const row = await LeaveType.create(body);
        return res.status(201).json(row);
    } catch (e) {
        if (e?.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Duplicate (name/code) for this business' });
        }
        console.error('createLeaveType', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function listLeaveTypes(req, res) {
    try {
        const { page = 1, pageSize = 20, orderBy = 'sortOrder', order = 'ASC', includeDeleted = 'false' } = req.query;
        const where = whereFromQuery(req.query);
        const limit = Math.min(parseInt(pageSize, 10) || 20, 100);
        const offset = ((parseInt(page, 10) || 1) - 1) * limit;
        const paranoid = !(includeDeleted === 'true' || includeDeleted === true);

        const result = await LeaveType.findAndCountAll({
            where,
            limit,
            offset,
            order: [[orderBy, String(order).toUpperCase() === 'DESC' ? 'DESC' : 'ASC']],
            paranoid,
        });

        return res.json({
            items: result.rows, total: result.count, page: Number(page), pageSize: limit,
            totalPages: Math.ceil(result.count / limit)
        });
    } catch (e) {
        console.error('listLeaveTypes', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function getLeaveTypeById(req, res) {
    try {
        const row = await LeaveType.findByPk(req.params.id, {
            paranoid: !(req.query.includeDeleted === 'true'),
        });
        if (!row) return res.status(404).json({ message: 'LeaveType not found' });
        return res.json(row);
    } catch (e) {
        console.error('getLeaveTypeById', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function updateLeaveType(req, res) {
    try {
        const row = await LeaveType.findByPk(req.params.id);
        if (!row) return res.status(404).json({ message: 'LeaveType not found' });
        await row.update(req.body || {});
        return res.json(row);
    } catch (e) {
        if (e?.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ message: 'Duplicate (name/code) for this business' });
        }
        console.error('updateLeaveType', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function deleteLeaveType(req, res) {
    try {
        const row = await LeaveType.findByPk(req.params.id);
        if (!row) return res.status(404).json({ message: 'LeaveType not found' });
        await row.destroy();
        return res.json({ message: 'LeaveType deleted' });
    } catch (e) {
        console.error('deleteLeaveType', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function restoreLeaveType(req, res) {
    try {
        const row = await LeaveType.findByPk(req.params.id, { paranoid: false });
        if (!row) return res.status(404).json({ message: 'LeaveType not found' });
        await row.restore();
        return res.json({ message: 'LeaveType restored' });
    } catch (e) {
        console.error('restoreLeaveType', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

export async function hardDeleteLeaveType(req, res) {
    try {
        const row = await LeaveType.findByPk(req.params.id, { paranoid: false });
        if (!row) return res.status(404).json({ message: 'LeaveType not found' });
        await row.destroy({ force: true });
        return res.json({ message: 'LeaveType hard deleted' });
    } catch (e) {
        console.error('hardDeleteLeaveType', e);
        return res.status(500).json({ message: 'Server error' });
    }
}
