// src/models/EmployeeExperience.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const EmployeeExperience = sequelize.define(
    'EmployeeExperience',
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
        organizationName: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        jobTitle: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        employmentType: {
            type: DataTypes.ENUM('Full-Time', 'Part-Time', 'Contract', 'Internship', 'Freelance'),
            allowNull: true,
        },
        department: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        industryType: {
            type: DataTypes.STRING(120),
            allowNull: true,
        },
        companyLocationCity: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        companyLocationCountry: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        startDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        endDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        isCurrent: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        durationText: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        jobLevel: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        lastDrawnCtc: {
            type: DataTypes.DECIMAL(15, 2),
            allowNull: true,
        },
        reasonForLeaving: {
            type: DataTypes.STRING(120),
            allowNull: true,
        },
        noticePeriodServed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        relievingLetterUrl: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        salarySlipsUrl: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
        bankStatementUrl: {
            type: DataTypes.STRING(500),
            allowNull: true,
        },
    },
    {
        tableName: 'employee_experiences',
        timestamps: true,
    }
);

export default EmployeeExperience;
