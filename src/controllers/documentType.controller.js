// src/controllers/documentType.controller.js
import DocumentType from '../models/DocumentType.js';

export const renderDocumentTypesPage = async (req, res, next) => {
    try {
        const docs = await DocumentType.findAll({
            where: { isDeleted: false },
            order: [['createdAt', 'DESC']],
        });

        const documentTypes = docs.map((d) => d.get({ plain: true }));

        const user = req.user
            ? { firstName: req.user.firstName, lastName: req.user.lastName }
            : {};

        res.render('documentTypes', {
            layout: 'main',
            title: 'Document Types',
            user,
            documentTypes,
        });
    } catch (err) {
        next(err);
    }
};

export const listDocumentTypes = async (req, res, next) => {
    try {
        const docs = await DocumentType.findAll({
            where: { isDeleted: false },
            order: [['createdAt', 'DESC']],
        });
        const documentTypes = docs.map((d) => d.get({ plain: true }));
        res.json(documentTypes);
    } catch (err) {
        next(err);
    }
};

export const createDocumentType = async (req, res, next) => {
    try {
        const { name, code, icon, description, templateHtml } = req.body;

        if (!name || !code) {
            return res.status(400).json({ error: 'Name and code are required' });
        }

        const docType = await DocumentType.create({
            name: name.trim(),
            code: code.trim(),
            icon: icon?.trim() || null,
            description: description?.trim() || null,
            templateHtml: templateHtml || null,
        });

        res.status(201).json(docType);
    } catch (err) {
        // Handle unique constraint gracefully
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'Code must be unique' });
        }
        next(err);
    }
};

export const updateDocumentType = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, code, icon, description, templateHtml } = req.body;

        const docType = await DocumentType.findByPk(id);
        if (!docType || docType.isDeleted) {
            return res.status(404).json({ error: 'Document type not found' });
        }

        await docType.update({
            name: name?.trim() || docType.name,
            code: code?.trim() || docType.code,
            icon: icon?.trim() || null,
            description: description?.trim() || null,
            templateHtml: templateHtml || null,
        });

        res.json(docType);
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'Code must be unique' });
        }
        next(err);
    }
};

export const deleteDocumentType = async (req, res, next) => {
    try {
        const { id } = req.params;
        const docType = await DocumentType.findByPk(id);

        if (!docType || docType.isDeleted) {
            return res.status(404).json({ error: 'Document type not found' });
        }

        await docType.update({
            isDeleted: true,
            deletedAt: new Date(),
        });

        res.status(204).send();
    } catch (err) {
        next(err);
    }
};

export const getDocumentTypeById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const docType = await DocumentType.findByPk(id);

        if (!docType || docType.isDeleted) {
            return res.status(404).json({ error: 'Document type not found' });
        }

        // send plain object so frontend can use it directly
        res.json(docType.get({ plain: true }));
    } catch (err) {
        next(err);
    }
};
