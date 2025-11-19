// src/models/DocumentType.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const DocumentType = sequelize.define('DocumentType', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    icon: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    templateHtml: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    tableName: 'document_types',
    timestamps: true,      // uses createdAt, updatedAt columns you already have
    paranoid: false,       // we’ll manage isDeleted + deletedAt manually
    indexes: [
        { unique: true, fields: ['code'] },
        { fields: ['isDeleted'] },
    ],
});

export default DocumentType;
