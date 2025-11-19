// src/controllers/documentType.controller.js
import DocumentType from '../models/DocumentType.js';

export const renderDocumentTypesPage = async (req, res, next) => {
    try {
        const docs = await DocumentType.findAll({
            where: { isDeleted: false },
            order: [['createdAt', 'DESC']],
        });

        const documentTypes = docs.map(d => d.get({ plain: true }));

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
        const documentTypes = docs.map(d => d.get({ plain: true }));
        res.json(documentTypes);
    } catch (err) {
        next(err);
    }
};

export const createDocumentType = async (req, res, next) => {
    try {
        const { name, code, icon, description, templateHtml } = req.body;

        const docType = await DocumentType.create({
            name,
            code,
            icon: icon || null,
            description: description || null,
            templateHtml: templateHtml || null,
        });

        res.status(201).json(docType);
    } catch (err) {
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
            name,
            code,
            icon: icon || null,
            description: description || null,
            templateHtml: templateHtml || null,
        });

        res.json(docType);
    } catch (err) {
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
