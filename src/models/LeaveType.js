import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

export const LeaveType = sequelize.define('LeaveType', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    businessId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING(120), allowNull: false },
    code: { type: DataTypes.STRING(32) },
    description: { type: DataTypes.TEXT },
    status: { type: DataTypes.ENUM('ACTIVE', 'INACTIVE'), allowNull: false, defaultValue: 'ACTIVE' },
    sortOrder: { type: DataTypes.INTEGER },
}, {
    tableName: 'leave_types',
    timestamps: true,
    paranoid: true, // deletedAt
});
