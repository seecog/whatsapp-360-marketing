// src/models/State.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';
import Country from './Country.js';

const State = sequelize.define(
    'State',
    {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            autoIncrement: true,
            primaryKey: true,
        },
        countryId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            field: 'country_id',
            references: {
                model: 'countries',
                key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT',
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING(10),
            allowNull: true,
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
        tableName: 'states',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true,
    }
);

// Associations
Country.hasMany(State, { foreignKey: 'countryId', as: 'states' });
State.belongsTo(Country, { foreignKey: 'countryId', as: 'country' });

export default State;
