// src/models/Department.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";

/**
 * We keep Department's own id as UUID (CHAR(36)) for uniqueness across tenants,
 * but businessId MUST be INTEGER to match Business.id.
 */
const Department = sequelize.define(
    "Department",
    {
        id: {
            type: DataTypes.CHAR(36),
            allowNull: false,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4, // DB can also have DEFAULT (UUID())
        },
        businessId: {
            type: DataTypes.INTEGER,   // <-- IMPORTANT: matches Business.id
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(80),
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING(16),
            allowNull: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
            allowNull: false,
            defaultValue: "ACTIVE",
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        deletedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "departments",
        timestamps: true,
        paranoid: true, // uses deletedAt for soft delete
        indexes: [
            { name: "idx_dept_business", fields: ["businessId"] },
            { name: "idx_dept_status", fields: ["status"] },
            { unique: true, name: "uniq_business_name", fields: ["businessId", "name"] },
            { unique: true, name: "uniq_business_code", fields: ["businessId", "code"] },
        ],
    }
);

export { Department };
