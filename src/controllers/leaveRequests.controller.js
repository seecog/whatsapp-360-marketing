import { Op } from 'sequelize';
import { LeaveRequest } from '../models/index.js';

function daysBetween(start, end) {
    const s = new Date(start);
    const e = new Date(end);
    // +1 day because leave is inclusive; returns integer days
    return Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1;
}

const whereFromQuery = (q) => {
    const w = {};
    if (q.businessId) w.businessId = q.businessId;
    if (q.employeeId) w.employeeId = q.employeeId;
    if (q.leaveTypeId) w.leaveTypeId = q.leaveTypeId;
    if (q.status) w.status = q.status;
    if (q.from || q.to) {
        w[Op.and] = [];
        if (q.from) w[Op.and].push({ endDate: { [Op.gte]: q.from } });
        if (q.to) w[Op.and].push({ startDate: { [Op.lte]: q.to } });
    }
    return w;
};

// POST /leave-requests
export async function createLeaveRequest(req, res) {
    try {
        const b = req.body || {};
        const required = ['businessId', 'employeeId', 'leaveTypeId', 'startDate', 'endDate'];
        for (const k of required) if (b[k] == null || b[k] === '') {
            return res.status(400).json({ message: `${k} is required` });
        }

        // compute totalDays if not provided (inclusive)
        if (b.totalDays == null) {
            b.totalDays = daysBetween(b.startDate, b.endDate);
        }

        const row = await LeaveRequest.create(b);
        return res.status(201).json(row);
    } catch (e) {
        console.error('createLeaveRequest', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

// GET /leave-requests
export async function listLeaveRequests(req, res) {
    try {
        const { page = 1, pageSize = 20, orderBy = 'createdAt', order = 'DESC', includeDeleted = 'false' } = req.query;
        const where = whereFromQuery(req.query);
        const limit = Math.min(parseInt(pageSize, 10) || 20, 100);
        const offset = ((parseInt(page, 10) || 1) - 1) * limit;
        const paranoid = !(includeDeleted === 'true' || includeDeleted === true);

        const result = await LeaveRequest.findAndCountAll({
            where, limit, offset, paranoid,
            order: [[orderBy, String(order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC']],
        });

        return res.json({
            items: result.rows,
            total: result.count,
            page: Number(page),
            pageSize: limit,
            totalPages: Math.ceil(result.count / limit),
        });
    } catch (e) {
        console.error('listLeaveRequests', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

// GET /leave-requests/:id
export async function getLeaveRequestById(req, res) {
    try {
        const row = await LeaveRequest.findByPk(req.params.id, {
            paranoid: !(req.query.includeDeleted === 'true'),
        });
        if (!row) return res.status(404).json({ message: 'Leave request not found' });
        return res.json(row);
    } catch (e) {
        console.error('getLeaveRequestById', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

// PATCH /leave-requests/:id  (only when PENDING)
export async function updateLeaveRequest(req, res) {
    try {
        const row = await LeaveRequest.findByPk(req.params.id);
        if (!row) return res.status(404).json({ message: 'Leave request not found' });
        if (row.status !== 'PENDING') {
            return res.status(400).json({ message: 'Only PENDING requests can be updated' });
        }

        const body = req.body || {};
        if ((body.startDate && !body.endDate) || (!body.startDate && body.endDate)) {
            return res.status(400).json({ message: 'Provide both startDate and endDate when changing dates' });
        }
        if (body.startDate && body.endDate && body.totalDays == null) {
            body.totalDays = daysBetween(body.startDate, body.endDate);
        }

        await row.update(body);
        return res.json(row);
    } catch (e) {
        console.error('updateLeaveRequest', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

// DELETE /leave-requests/:id (soft)
export async function deleteLeaveRequest(req, res) {
    try {
        const row = await LeaveRequest.findByPk(req.params.id);
        if (!row) return res.status(404).json({ message: 'Leave request not found' });
        await row.destroy();
        return res.json({ message: 'Leave request deleted' });
    } catch (e) {
        console.error('deleteLeaveRequest', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

// POST /leave-requests/:id/approve
export async function approveLeaveRequest(req, res) {
    try {
        const row = await LeaveRequest.findByPk(req.params.id);
        if (!row) return res.status(404).json({ message: 'Leave request not found' });
        if (row.status !== 'PENDING') return res.status(400).json({ message: 'Only PENDING requests can be approved' });

        const approverId = req.user?.id || req.body?.approverId || null; // adapt to your auth
        await row.update({ status: 'APPROVED', approverId, approvedAt: new Date() });
        return res.json(row);
    } catch (e) {
        console.error('approveLeaveRequest', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

// POST /leave-requests/:id/reject
export async function rejectLeaveRequest(req, res) {
    try {
        const row = await LeaveRequest.findByPk(req.params.id);
        if (!row) return res.status(404).json({ message: 'Leave request not found' });
        if (row.status !== 'PENDING') return res.status(400).json({ message: 'Only PENDING requests can be rejected' });

        const approverId = req.user?.id || req.body?.approverId || null;
        const managerNote = req.body?.managerNote || row.managerNote;
        await row.update({ status: 'REJECTED', approverId, managerNote, rejectedAt: new Date() });
        return res.json(row);
    } catch (e) {
        console.error('rejectLeaveRequest', e);
        return res.status(500).json({ message: 'Server error' });
    }
}

// POST /leave-requests/:id/cancel  (employee/self or admin)
export async function cancelLeaveRequest(req, res) {
    try {
        const row = await LeaveRequest.findByPk(req.params.id);
        if (!row) return res.status(404).json({ message: 'Leave request not found' });
        if (row.status !== 'PENDING') return res.status(400).json({ message: 'Only PENDING requests can be canceled' });

        await row.update({ status: 'CANCELED', canceledAt: new Date() });
        return res.json(row);
    } catch (e) {
        console.error('cancelLeaveRequest', e);
        return res.status(500).json({ message: 'Server error' });
    }
}
