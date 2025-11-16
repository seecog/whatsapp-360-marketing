import { Template } from "../models/Template.js";
import { createMetaTemplate, getTemplatesFromMeta, assertTemplateApproved, listAllTemplates, listTemplatesPage } from "../controllers/service/meta.service.js";

/** Create a template at Meta (Graph). Does not save locally. */
export const createTemplateAtMeta = async (req, res) => {
    try {
        const { name, category, language, components } = req.body;
        if (!name || !category || !language) {
            return res.status(400).json({ ok: false, message: "name, category, language are required" });
        }
        const data = await createMetaTemplate({
            name,
            category: String(category).toLowerCase(),
            language,
            components: Array.isArray(components) ? components : []
        });
        return res.status(201).json({ ok: true, meta: data });
    } catch (e) {
        const status = e.response?.status || 400;
        return res.status(status).json({
            ok: false,
            message: e.response?.data?.error?.message || e.message,
            details: e.response?.data
        });
    }
};

/** List templates from Meta */
export const listMetaTemplates = async (req, res) => {
    try {
        const rows = await getTemplatesFromMeta({ name: req.query.name });
        res.json({ ok: true, data: rows });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.message });
    }
};

/** Verify template (exists+approved) then save it locally for this user */
export const saveVerifiedTemplate = async (req, res) => {
    try {
        const userId = req.user.id;
        const { waName, language, category, displayName } = req.body;
        if (!waName || !language || !category) return res.status(400).json({ ok: false, message: "waName, language, category required" });

        const meta = await assertTemplateApproved(waName, language);  // throws if not good
        const [tpl, created] = await Template.findOrCreate({
            where: { userId, waName, language },
            defaults: { category: category.toLowerCase(), components: meta.components || [], displayName }
        });

        if (!created) {
            // Update existing template
            tpl.category = category.toLowerCase();
            tpl.components = meta.components || [];
            tpl.displayName = displayName || tpl.displayName;
            await tpl.save();
        }

        res.status(201).json(tpl);
    } catch (e) {
        res.status(e.status || 400).json({ ok: false, message: e.message });
    }
};

/** List local templates (your DB) */
export const listLocalTemplates = async (req, res) => {
    const docs = await Template.findAll({
        where: { userId: req.user.id },
        order: [['createdAt', 'DESC']]
    });
    res.json(docs);
};

export const listMetaTemplatesPaged = async (req, res) => {
    try {
        const { after, limit } = req.query;
        const page = await listTemplatesPage({ after, limit: Number(limit) || 100 });
        res.json({ ok: true, ...page });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.response?.data?.error?.message || e.message, details: e.response?.data });
    }
};

export const listMetaTemplatesAll = async (_req, res) => {
    try {
        const rows = await listAllTemplates();
        res.json({ ok: true, count: rows.length, data: rows });
    } catch (e) {
        res.status(400).json({ ok: false, message: e.response?.data?.error?.message || e.message, details: e.response?.data });
    }
};

// New CRUD functions for frontend
export const getAllTemplates = async (req, res) => {
    try {
        const templates = await Template.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(templates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createTemplate = async (req, res) => {
    try {
        const { waName, language, category, displayName, components, htmlContent } = req.body;

        if (!waName || !category) {
            return res.status(400).json({ error: "waName and category are required" });
        }

        const template = await Template.create({
            userId: req.user.id,
            waName,
            language: language || 'en_US',
            category: category.toLowerCase(),
            displayName: displayName || waName,
            components: components || [],
            htmlContent: htmlContent || ''
        });

        res.status(201).json(template);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const updateTemplate = async (req, res) => {
    try {
        const { id } = req.params;
        const { waName, language, category, displayName, components, htmlContent } = req.body;

        const template = await Template.findOne({
            where: { id, userId: req.user.id }
        });

        if (!template) {
            return res.status(404).json({ error: "Template not found" });
        }

        await template.update({
            waName: waName || template.waName,
            language: language || template.language,
            category: category ? category.toLowerCase() : template.category,
            displayName: displayName || template.displayName,
            components: components || template.components,
            htmlContent: htmlContent !== undefined ? htmlContent : template.htmlContent
        });

        res.json(template);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const deleteTemplate = async (req, res) => {
    try {
        const { id } = req.params;

        const template = await Template.findOne({
            where: { id, userId: req.user.id }
        });

        if (!template) {
            return res.status(404).json({ error: "Template not found" });
        }

        await template.destroy();
        res.json({ message: "Template deleted successfully" });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};