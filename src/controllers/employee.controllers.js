// src/controllers/employee.controllers.js
import { Op } from 'sequelize';
import Employee from '../models/Employee.js';

const toBool = (val) =>
    val === true || val === 'true' || val === '1' || val === 'on';

/**
 * GET /employees (HTML page)
 */
export const renderEmployeesPage = async (req, res, next) => {
    try {
        const search = (req.query.search || '').trim();

        const where = {};

        if (search) {
            where[Op.or] = [
                { empName: { [Op.like]: `%${search}%` } },
                { empEmail: { [Op.like]: `%${search}%` } },
                { empId: { [Op.like]: `%${search}%` } },
            ];
        }

        const employees = await Employee.findAll({
            where,
            order: [['empId', 'ASC']],
        });

        const employeesPlain = employees.map((e) => e.get({ plain: true }));

        console.log('Employees fetched for page ');

        const user = req.user
            ? { firstName: req.user.firstName, lastName: req.user.lastName }
            : {};

        res.render('employees', {
            layout: 'main',
            title: 'Employee Management',
            user,
            employees: employeesPlain,
            search,
        });
    } catch (err) {
        console.error('Error rendering employees page:', err);
        next(err);
    }
};

/**
 * GET /api/v1/employees (JSON)
 */
export const listEmployees = async (req, res, next) => {
    try {
        const search = (req.query.search || '').trim();

        const where = {};

        if (search) {
            where[Op.or] = [
                { empName: { [Op.like]: `%${search}%` } },
                { empEmail: { [Op.like]: `%${search}%` } },
                { empId: { [Op.like]: `%${search}%` } },
            ];
        }

        const employees = await Employee.findAll({
            where,
            order: [['empId', 'ASC']],
        });
        console.log('Employees listed via API:');
        res.json(employees);
    } catch (err) {
        console.error('Error listing employees:', err);
        next(err);
    }
};

/**
 * POST /api/v1/employees
 */
export const createEmployee = async (req, res, next) => {
    try {
        console.log('Received POST request with body:', req.body);

        const userId = req.user?.id || 1;

        const payload = {
            userId,

            // --- Name ---
            firstName: req.body.firstName,
            middleName: req.body.middleName || null,
            lastName: req.body.lastName,

            empName: req.body.empName || undefined, // will be auto-built if undefined

            // --- Personal profile ---
            gender: req.body.gender || null,
            maritalStatus: req.body.maritalStatus || null,
            bloodGroup: req.body.bloodGroup || null,
            nationality: req.body.nationality || null,
            religion: req.body.religion || null,
            casteCategory: req.body.casteCategory || null,
            languagesKnown: req.body.languagesKnown || null,

            // Contacts
            empPhone: req.body.empPhone,
            altPhone: req.body.altPhone || null,
            empEmail: req.body.empEmail,

            // Emergency
            emergencyContactName: req.body.emergencyContactName || null,
            emergencyContactRelation: req.body.emergencyContactRelation || null,
            emergencyContactNumber: req.body.emergencyContactNumber || null,

            // Present address
            presentAddressLine1: req.body.presentAddressLine1 || null,
            presentAddressLine2: req.body.presentAddressLine2 || null,
            presentCity: req.body.presentCity || null,
            presentState: req.body.presentState || null,
            presentZip: req.body.presentZip || null,
            presentCountry: req.body.presentCountry || null,

            // Permanent address
            permanentSameAsPresent: toBool(req.body.permanentSameAsPresent),
            permanentAddressLine1: req.body.permanentAddressLine1 || null,
            permanentAddressLine2: req.body.permanentAddressLine2 || null,
            permanentCity: req.body.permanentCity || null,
            permanentState: req.body.permanentState || null,
            permanentZip: req.body.permanentZip || null,
            permanentCountry: req.body.permanentCountry || null,

            // --- Professional ---
            employeeType: req.body.employeeType || 'Permanent',
            empDesignation: req.body.empDesignation,
            empDepartment: req.body.empDepartment,
            division: req.body.division || null,
            subDepartment: req.body.subDepartment || null,
            gradeBandLevel: req.body.gradeBandLevel || null,
            reportingManagerId: req.body.reportingManagerId || null,
            empWorkLoc: req.body.empWorkLoc,
            empDateOfJoining: req.body.empDateOfJoining,
            probationPeriodMonths: req.body.probationPeriodMonths || null,
            confirmationDate: req.body.confirmationDate || null,
            employmentStatus: req.body.employmentStatus || 'Active',
            workMode: req.body.workMode || 'On-site',

            // --- Dates ---
            empDob: req.body.empDob,

            // --- Compensation ---
            empCtc: req.body.empCtc,
            grossSalaryMonthly: req.body.grossSalaryMonthly || null,
            basicSalary: req.body.basicSalary || null,
            hra: req.body.hra || null,
            conveyanceAllowance: req.body.conveyanceAllowance || null,
            medicalAllowance: req.body.medicalAllowance || null,
            specialAllowance: req.body.specialAllowance || null,
            performanceBonus: req.body.performanceBonus || null,
            variablePay: req.body.variablePay || null,
            overtimeEligible: toBool(req.body.overtimeEligible),
            shiftAllowance: req.body.shiftAllowance || null,
            pfDeduction: req.body.pfDeduction || null,
            esiDeduction: req.body.esiDeduction || null,
            professionalTax: req.body.professionalTax || null,
            tdsDeduction: req.body.tdsDeduction || null,
            netSalary: req.body.netSalary || null,

            // --- Attendance & shift ---
            shiftName: req.body.shiftName || null,
            shiftCode: req.body.shiftCode || null,
            shiftStartTime: req.body.shiftStartTime || null,
            shiftEndTime: req.body.shiftEndTime || null,
            totalWorkHours: req.body.totalWorkHours || null,
            breakDurationMinutes: req.body.breakDurationMinutes || null,
            shiftType: req.body.shiftType || null,
            shiftRotationCycle: req.body.shiftRotationCycle || null,
            gracePeriodMinutes: req.body.gracePeriodMinutes || null,
            halfDayRuleHours: req.body.halfDayRuleHours || null,
            shiftEffectiveFrom: req.body.shiftEffectiveFrom || null,
            workTimezone: req.body.workTimezone || null,

            // --- KYC / Compliance ---
            empAadhar: req.body.empAadhar,
            empPan: req.body.empPan,
            idProofType: req.body.idProofType || null,
            idProofNumber: req.body.idProofNumber || null,
            idCountryOfIssue: req.body.idCountryOfIssue || null,
            idExpiryDate: req.body.idExpiryDate || null,
            // idVerificationStatus/idVerifiedBy... usually set later by HR

            // --- System & Access ---
            workEmail: req.body.workEmail || null,
            username: req.body.username || null,
            systemRole: req.body.systemRole || null,
            accountStatus: req.body.accountStatus || 'Active',
            mfaEnabled: toBool(req.body.mfaEnabled),
        };

        // Optional manual empId; otherwise auto-generate in hook
        if (req.body.empId && req.body.empId.trim() !== '') {
            payload.empId = req.body.empId.trim();
        }

        const employee = await Employee.create(payload);
        console.log('Created new employee:', employee.get({ plain: true }));
        return res.status(201).json(employee);
    } catch (err) {
        console.error('Error creating employee:', err);
        if (err.name === 'SequelizeValidationError') {
            return res
                .status(400)
                .json({ error: err.errors.map((e) => e.message).join(', ') });
        }
        next(err);
    }
};
