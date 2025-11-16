// src/controllers/department.controller.js
import { Department, Business } from "../models/index.js"; // import models
import { Op } from "sequelize";                             // import Op directly

// tiny helper
const pick = (obj, keys) =>
    Object.fromEntries(Object.entries(obj || {}).filter(([k]) => keys.includes(k)));

export const createDepartment = async (req, res) => {
    try {
        const body = pick(req.body, [
            "businessId",
            "name",
            "code",
            "description",
            "status",
            "metadata",
        ]);

        if (!body.businessId || !body.name) {
            return res.status(400).json({ message: "businessId and name are required" });
        }

        // Your Business.id is INTEGER; body.businessId must be a number
        const biz = await Business.findByPk(body.businessId);
        if (!biz) return res.status(404).json({ message: "Business not found" });

        const dept = await Department.create(body);
        return res.status(201).json({ message: "Created", data: dept });
    } catch (err) {
        if (err?.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({
                message: "Department with same name/code already exists for this business",
            });
        }
        return res.status(500).json({ message: "Server error", error: err?.message || String(err) });
    }
};

export const listDepartments = async (req, res) => {
    try {
        const {
            businessId,
            status,
            q,
            limit = 20,
            page = 1,
            sortBy = "createdAt",
            sortDir = "DESC",
            includeBusiness = "false",
        } = req.query;

        const where = {};
        if (businessId) where.businessId = businessId;
        if (status) where.status = status;

        if (q) {
            where[Op.or] = [
                { name: { [Op.like]: `%${q}%` } },
                { code: { [Op.like]: `%${q}%` } },
            ];
        }

        const size = Math.min(Number(limit) || 20, 100);
        const offset = (Math.max(Number(page) || 1, 1) - 1) * size;

        const include =
            includeBusiness === "true"
                ? [{ model: Business, as: "business", attributes: ["id", "businessName"] }]
                : [];

        const result = await Department.findAndCountAll({
            where,
            include,
            limit: size,
            offset,
            order: [[sortBy, sortDir.toUpperCase() === "ASC" ? "ASC" : "DESC"]],
        });

        return res.json({
            data: result.rows,
            meta: {
                total: result.count,
                page: Number(page) || 1,
                pageSize: size,
                totalPages: Math.ceil(result.count / size) || 1,
            },
        });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err?.message || String(err) });
    }
};

export const getDepartmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const dept = await Department.findByPk(id);
        if (!dept) return res.status(404).json({ message: "Not found" });
        return res.json({ data: dept });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err?.message || String(err) });
    }
};

export const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const body = pick(req.body, ["name", "code", "description", "status", "metadata"]);

        const dept = await Department.findByPk(id);
        if (!dept) return res.status(404).json({ message: "Not found" });

        await dept.update(body);
        return res.json({ message: "Updated", data: dept });
    } catch (err) {
        if (err?.name === "SequelizeUniqueConstraintError") {
            return res.status(409).json({
                message: "Department with same name/code already exists for this business",
            });
        }
        return res.status(500).json({ message: "Server error", error: err?.message || String(err) });
    }
};

export const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const dept = await Department.findByPk(id);
        if (!dept) return res.status(404).json({ message: "Not found" });

        await dept.destroy(); // soft delete
        return res.json({ message: "Deleted" });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err?.message || String(err) });
    }
};

export const restoreDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const restored = await Department.restore({ where: { id } });
        if (!restored) return res.status(404).json({ message: "Not found or not deleted" });
        const dept = await Department.findByPk(id);
        return res.json({ message: "Restored", data: dept });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err?.message || String(err) });
    }
};
