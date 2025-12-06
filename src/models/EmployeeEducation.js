// src/models/EmployeeEducation.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const EmployeeEducation = sequelize.define(
    'EmployeeEducation',
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
        level: {
            type: DataTypes.STRING(50),
            allowNull: false, // 10th, 12th, Diploma, Bachelors, etc.
        },
        degree: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        specialization: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        institutionName: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
        board: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        startYear: {
            type: DataTypes.SMALLINT,
            allowNull: true,
        },
        endYear: {
            type: DataTypes.SMALLINT,
            allowNull: true,
        },
        yearOfPassing: {
            type: DataTypes.SMALLINT,
            allowNull: true,
        },
        percentageOrCgpa: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        modeOfStudy: {
            type: DataTypes.ENUM('Full-Time', 'Part-Time', 'Distance'),
            allowNull: true,
        },
        educationType: {
            type: DataTypes.ENUM('School', 'College', 'Professional', 'Technical', 'Other'),
            allowNull: true,
        },
        country: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        certificateUrl: {
            type: DataTypes.STRING(255),
            allowNull: true,
        },
    },
    {
        tableName: 'employee_educations',
        timestamps: true,
    }
);

export default EmployeeEducation;
