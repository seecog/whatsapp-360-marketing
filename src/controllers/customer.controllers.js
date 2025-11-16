// controllers/customer.controllers.js
import { Customer } from "../models/Customer.js";
import { Business } from "../models/Business.js";
import { Op } from 'sequelize';

export const addCustomer = async (req, res) => {
    const userId = req.user.id;
    const { name, phoneE164, tags, consentAt, businessId } = req.body;

    if (!phoneE164 || !/^\+\d{8,15}$/.test(phoneE164)) {
        return res.status(400).json({ error: "phoneE164 must be in E.164 format like +91xxxxxxxxxx" });
    }
    if (!businessId) return res.status(400).json({ error: "businessId is required" });

    try {
        // Ensure the business belongs to this user
        const business = await Business.findOne({ where: { id: businessId, ownerId: userId } });
        if (!business) {
            return res.status(404).json({ error: "Business not found or not yours" });
        }

        const [doc, created] = await Customer.findOrCreate({
            where: { businessId, phoneE164, userId }, // include userId in uniqueness for safety
            defaults: {
                userId,
                name: name || null,
                tags: Array.isArray(tags) ? tags : [],
                consentAt: consentAt ? new Date(consentAt) : new Date()
            }
        });

        if (!created) {
            doc.name = name ?? doc.name;
            if (Array.isArray(tags)) doc.tags = tags;
            if (consentAt) doc.consentAt = consentAt;
            await doc.save();
        }

        // Re-fetch with include so UI gets business object on first paint
        const withBusiness = await Customer.findByPk(doc.id, {
            include: [{ model: Business, as: 'business', attributes: ['id', 'businessName', 'category'] }]
        });

        res.status(201).json(withBusiness);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

export const listCustomers = async (req, res) => {
    const userId = req.user.id;
    const { tag, businessId } = req.query;

    try {
        const where = { userId };

        if (businessId) {
            // Verify ownership
            const biz = await Business.findOne({ where: { id: businessId, ownerId: userId } });
            if (!biz) return res.status(404).json({ error: "Business not found or not yours" });
            where.businessId = businessId;
        }

        if (tag) {
            // Op.contains works on Postgres JSON/ARRAY. If you're on MySQL, adjust accordingly.
            where.tags = { [Op.contains]: [tag] };
        }

        const rows = await Customer.findAll({
            where,
            include: [{ model: Business, as: 'business', attributes: ['id', 'businessName', 'category'] }],
            order: [['createdAt', 'DESC']],
            limit: 200
        });

        res.json(rows);
    } catch (e) {
        console.error('listCustomers error:', e);
        res.status(500).json({ error: 'Failed to load customers' });
    }
};

export const updateCustomer = async (req, res) => {
    const userId = req.user.id;
    const customerId = req.params.id;
    const { name, phoneE164, tags, businessId } = req.body;

    // Allow partial updates: validate phone only if provided
    if (phoneE164 && !/^\+\d{8,15}$/.test(phoneE164)) {
        return res.status(400).json({ error: "phoneE164 must be in E.164 format like +91xxxxxxxxxx" });
    }

    try {
        const customer = await Customer.findOne({
            where: { id: customerId, userId },
            include: [{ model: Business, as: 'business', attributes: ['id', 'businessName'] }]
        });
        if (!customer) return res.status(404).json({ error: "Customer not found" });

        if (businessId && businessId !== customer.businessId) {
            const biz = await Business.findOne({ where: { id: businessId, ownerId: userId } });
            if (!biz) return res.status(404).json({ error: "Business not found or not yours" });
        }

        await customer.update({
            name: name ?? customer.name,
            phoneE164: phoneE164 ?? customer.phoneE164,
            tags: Array.isArray(tags) ? tags : customer.tags,
            businessId: businessId ?? customer.businessId
        });

        const withBusiness = await Customer.findByPk(customer.id, {
            include: [{ model: Business, as: 'business', attributes: ['id', 'businessName', 'category'] }]
        });

        res.json(withBusiness);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};

export const deleteCustomer = async (req, res) => {
    const userId = req.user.id;
    const customerId = req.params.id;

    try {
        const customer = await Customer.findOne({
            where: { id: customerId, userId }
        });
        if (!customer) return res.status(404).json({ error: "Customer not found" });

        await customer.destroy();
        res.json({ message: "Customer deleted successfully" });
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
};
