// src/models/EmployeeDocument.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';
import { Op } from 'sequelize';


const EmployeeDocument = sequelize.define(
    'EmployeeDocument',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        employeeId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'employees',
                key: 'id',
            },
        },
        category: {
            type: DataTypes.ENUM('KYC','AADHAAAR', 'PAN', 'ADDRESS', 'EDUCATION', 'EXPERIENCE', 'HR', 'OTHER'),
            defaultValue: 'KYC',
        },
        documentType: {
            type: DataTypes.STRING(100),
            allowNull: false, // Aadhaar, PAN, Passport, 10th Marksheet, Offer Letter, etc.
        },
        nameOnDocument: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        documentNumber: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        issueDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        expiryDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        verificationStatus: {
            type: DataTypes.ENUM('Pending', 'Verified', 'Rejected'),
            defaultValue: 'Pending',
        },
        verifiedBy: {
            type: DataTypes.INTEGER, // users.id
            allowNull: true,
        },
        verifiedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        fileUrl: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        documentImageUrl: {
            type: DataTypes.STRING(255),
            allowNull: true, // scanned image URL/path
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    },
    {
        tableName: 'employee_documents',
        timestamps: true,
    }
);

export default EmployeeDocument;
