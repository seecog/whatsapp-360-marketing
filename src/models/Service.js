// src/models/Service.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

export const Service = sequelize.define('Service', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    businessId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(120),
        allowNull: false,
    },
    code: {
        type: DataTypes.STRING(32),
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    basePrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
    },
    currency: {
        type: DataTypes.CHAR(3),
        allowNull: false,
        defaultValue: 'INR',
    },
    durationMinutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    taxRate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
    },
    isTaxInclusive: {
        type: DataTypes.BOOLEAN, // maps to TINYINT(1)
        allowNull: false,
        defaultValue: false,
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
        allowNull: false,
        defaultValue: 'ACTIVE',
    },
    visible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    imageUrl: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
    },
}, {
    tableName: 'services',
    timestamps: true,       // createdAt/updatedAt
    paranoid: true,         // uses deletedAt
    underscored: false,
});
