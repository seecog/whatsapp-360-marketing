// src/models/EmailTemplate.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js'; // same file you use for other models

const EmailTemplate = sequelize.define(
    'EmailTemplate',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        templateKey: {
            field: 'template_key',
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            comment: 'Unique code like OFFER_LETTER_DEFAULT',
        },
        templateName: {
            field: 'template_name',
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        subject: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'Subject with placeholders',
        },
        bodyHtml: {
            field: 'body_html',
            type: DataTypes.TEXT('medium'),
            allowNull: false,
            comment: 'HTML email body with placeholders',
        },
        documentTypeId: {
            field: 'document_type_id',
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        isDefault: {
            field: 'is_default',
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            field: 'createdAt',
        },
        updatedAt: {
            type: DataTypes.DATE,
            field: 'updatedAt',
        },
        deletedAt: {
            type: DataTypes.DATE,
            field: 'deletedAt',
        },
    },
    {
        tableName: 'email_templates',
        timestamps: true,
    }
);

export default EmailTemplate;
