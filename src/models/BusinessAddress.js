// src/models/BusinessAddress.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';
import { Business } from './Business.js'; // adjust if your Business export is different

const BusinessAddress = sequelize.define(
    'BusinessAddress',
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        businessId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: 'business_id',
        },
        addressName: {
            type: DataTypes.STRING(150),
            allowNull: false,
            field: 'address_name',
        },
        fullAddress: {
            type: DataTypes.TEXT,
            allowNull: false,
            field: 'full_address',
        },
        addressType: {
            type: DataTypes.ENUM('REGISTERED', 'BRANCH', 'BILLING', 'SHIPPING', 'OTHER'),
            allowNull: false,
            defaultValue: 'REGISTERED',
            field: 'address_type',
        },
        status: {
            type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
            allowNull: false,
            defaultValue: 'ACTIVE',
        },
        createdAt: {
            type: DataTypes.DATE,
            field: 'created_at',
        },
        updatedAt: {
            type: DataTypes.DATE,
            field: 'updated_at',
        },
    },
    {
        tableName: 'business_addresses',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
    }
);

// Associations
if (Business) {
    Business.hasMany(BusinessAddress, {
        foreignKey: 'businessId',
        as: 'addresses',
    });

    BusinessAddress.belongsTo(Business, {
        foreignKey: 'businessId',
        as: 'business',
    });
}

export default BusinessAddress;
