// src/models/Country.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const Country = sequelize.define(
    'Country',
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        isoCode: {
            type: DataTypes.STRING(3),
            allowNull: false,
            field: 'iso_code',
            unique: true,
        },
        phoneCode: {
            type: DataTypes.STRING(10),
            allowNull: true,
            field: 'phone_code',
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
        tableName: 'countries',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
    }
);

export default Country;
