// src/models/Designation.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

export const Designation = sequelize.define('Designation', {
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
    metaData:{
        type: DataTypes.JSON,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
        allowNull: false,
        defaultValue: 'ACTIVE',
    },
    sortOrder: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
    deletedAt: { type: DataTypes.DATE, allowNull: true },
}, {
    tableName: 'designations',
    timestamps: true,
    paranoid: true,              // soft delete via deletedAt
});
