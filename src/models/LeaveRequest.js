import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

export const LeaveRequest = sequelize.define('LeaveRequest', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    businessId: { type: DataTypes.INTEGER, allowNull: false },
    employeeId: { type: DataTypes.INTEGER, allowNull: false },
    leaveTypeId: { type: DataTypes.INTEGER, allowNull: false },

    startDate: { type: DataTypes.DATEONLY, allowNull: false },
    endDate: { type: DataTypes.DATEONLY, allowNull: false },
    totalDays: { type: DataTypes.DECIMAL(5, 2), allowNull: false },

    reason: { type: DataTypes.TEXT },
    managerNote: { type: DataTypes.TEXT },

    status: {
        type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELED'),
        allowNull: false,
        defaultValue: 'PENDING',
    },
    approverId: { type: DataTypes.INTEGER, allowNull: true },
    approvedAt: { type: DataTypes.DATE },
    rejectedAt: { type: DataTypes.DATE },
    canceledAt: { type: DataTypes.DATE },
}, {
    tableName: 'leave_requests',
    timestamps: true,
    paranoid: true,
});
