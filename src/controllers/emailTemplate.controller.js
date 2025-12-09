// src/controllers/emailTemplate.controller.js
import EmailTemplate from '../models/EmailTemplate.js';
import DocumentType from '../models/DocumentType.js';

/* ========== PAGE RENDER CONTROLLER ========== */

// GET /email-templates  → render HBS page
export const renderEmailTemplatesPage = async (req, res, next) => {
    try {
        res.render('emailTemplates', {
            user: req.user,
            title: 'Email Templates',
        });
    } catch (err) {
        next(err);
    }
};

/* ========== API CONTROLLERS ========== */

// POST /api/email-templates
export const createEmailTemplate = async (req, res, next) => {
    try {
        const {
            templateKey,
            templateName,
            subject,
            bodyHtml,
            documentTypeId,
            isDefault,
        } = req.body;

        if (!templateKey || !templateName || !subject || !bodyHtml) {
            return res.status(400).json({
                message: 'templateKey, templateName, subject and bodyHtml are required.',
            });
        }

        if (documentTypeId) {
            const docType = await DocumentType.findByPk(documentTypeId);
            if (!docType) {
                return res.status(400).json({ message: 'Invalid documentTypeId.' });
            }
        }

        const template = await EmailTemplate.create({
            templateKey,
            templateName,
            subject,
            bodyHtml,
            documentTypeId: documentTypeId || null,
            isDefault: !!isDefault,
        });

        res.status(201).json(template);
    } catch (err) {
        console.error('createEmailTemplate error:', err);
        next(err);
    }
};

// GET /api/email-templates
// optional: ?documentTypeId=1&includeDeleted=true
export const getEmailTemplates = async (req, res, next) => {
    try {
        const { documentTypeId, includeDeleted } = req.query;

        const where = {};
        if (documentTypeId) where.documentTypeId = documentTypeId;
        if (includeDeleted !== 'true') where.deleted = false;

        const templates = await EmailTemplate.findAll({
            where,
            include: [
                {
                    model: DocumentType,
                    as: 'documentType',
                },
            ],
            order: [['id', 'DESC']],
        });

        res.json(templates);
    } catch (err) {
        console.error('getEmailTemplates error:', err);
        next(err);
    }
};

// GET /api/email-templates/:id
export const getEmailTemplateById = async (req, res, next) => {
    try {
        const template = await EmailTemplate.findByPk(req.params.id, {
            include: [
                {
                    model: DocumentType,
                    as: 'documentType',
                },
            ],
        });

        if (!template) {
            return res.status(404).json({ message: 'Email template not found.' });
        }

        res.json(template);
    } catch (err) {
        console.error('getEmailTemplateById error:', err);
        next(err);
    }
};

// GET /api/email-templates/by-key/:templateKey
export const getEmailTemplateByKey = async (req, res, next) => {
    try {
        const { templateKey } = req.params;

        const template = await EmailTemplate.findOne({
            where: { templateKey, deleted: false },
            include: [{ model: DocumentType, as: 'documentType' }],
        });

        if (!template) {
            return res.status(404).json({ message: 'Email template not found.' });
        }

        res.json(template);
    } catch (err) {
        console.error('getEmailTemplateByKey error:', err);
        next(err);
    }
};

// GET /api/email-templates/default/document-type/:documentTypeId
export const getDefaultEmailTemplateForDocumentType = async (req, res, next) => {
    try {
        const { documentTypeId } = req.params;

        const template = await EmailTemplate.findOne({
            where: {
                documentTypeId,
                isDefault: true,
                deleted: false,
            },
            include: [{ model: DocumentType, as: 'documentType' }],
        });

        if (!template) {
            return res.status(404).json({ message: 'Default template not found.' });
        }

        res.json(template);
    } catch (err) {
        console.error('getDefaultEmailTemplateForDocumentType error:', err);
        next(err);
    }
};

// PUT /api/email-templates/:id
export const updateEmailTemplate = async (req, res, next) => {
    try {
        const {
            templateKey,
            templateName,
            subject,
            bodyHtml,
            documentTypeId,
            isDefault,
            deleted,
        } = req.body;

        const template = await EmailTemplate.findByPk(req.params.id);
        if (!template) {
            return res.status(404).json({ message: 'Email template not found.' });
        }

        if (documentTypeId) {
            const docType = await DocumentType.findByPk(documentTypeId);
            if (!docType) {
                return res.status(400).json({ message: 'Invalid documentTypeId.' });
            }
        }

        if (templateKey !== undefined) template.templateKey = templateKey;
        if (templateName !== undefined) template.templateName = templateName;
        if (subject !== undefined) template.subject = subject;
        if (bodyHtml !== undefined) template.bodyHtml = bodyHtml;
        if (documentTypeId !== undefined) template.documentTypeId = documentTypeId;
        if (isDefault !== undefined) template.isDefault = !!isDefault;
        if (deleted !== undefined) {
            template.deleted = !!deleted;
            template.deletedAt = deleted ? new Date() : null;
        }

        await template.save();
        res.json(template);
    } catch (err) {
        console.error('updateEmailTemplate error:', err);
        next(err);
    }
};

// DELETE /api/email-templates/:id  (soft delete)
export const deleteEmailTemplate = async (req, res, next) => {
    try {
        const template = await EmailTemplate.findByPk(req.params.id);
        if (!template) {
            return res.status(404).json({ message: 'Email template not found.' });
        }

        template.deleted = true;
        template.deletedAt = new Date();
        await template.save();

        res.json({ message: 'Email template deleted (soft delete).' });
    } catch (err) {
        console.error('deleteEmailTemplate error:', err);
        next(err);
    }
};
