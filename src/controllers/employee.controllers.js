// src/controllers/employee.controllers.js
import { Op } from 'sequelize';
import { sequelize } from '../db/index.js';
import Employee from '../models/Employee.js';
import EmployeeEducation from '../models/EmployeeEducation.js';
import EmployeeExperience from '../models/EmployeeExperience.js';
import EmployeeDocument from '../models/EmployeeDocument.js';

const toBool = (val) =>
    val === true || val === 'true' || val === '1' || val === 'on';

/**
 * GET /employees (HTML page)
 */
export const renderEmployeesPage = async (req, res, next) => {
    try {
        const search = (req.query.search || '').trim();
        const userId = req.user?.id;

        const where = {};
        if (userId) {
            where.userId = userId;
        }

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

        console.log('Employees fetched for page');

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
        const userId = req.user?.id;

        const where = {};
        if (userId) {
            where.userId = userId;
        }

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

        console.log('Employees listed via API');
        res.json(employees);
    } catch (err) {
        console.error('Error listing employees:', err);
        next(err);
    }
};

/**
 * POST /api/v1/employees
 * Body:
 * {
 *   ... core employee fields (personal, professional, compensation),
 *   educations: [ {...}, {...} ],
 *   experiences: [ {...}, {...} ],
 *   documents: [ {...}, {...} ]
 * }
 */
export const createEmployee = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        console.log('Received POST request with body:', req.body);

        const userId = req.user?.id || 1;

        // 1) Core Employee payload (Sections 1–3: Personal, Professional, Compensation)
        const payload = {
            userId,

            // --- Name ---
            firstName: req.body.firstName,
            middleName: req.body.middleName || null,
            lastName: req.body.lastName,

            empName: req.body.empName || undefined, // auto-built if undefined

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

            // --- Professional (Section 2) ---
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

            // --- Compensation (Section 3) ---
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

            // KYC core (moved logically to "Documents" tab, still stored on employee for uniqueness)
            empAadhar: req.body.empAadhar,
            empPan: req.body.empPan,

            // System & access / attendance / exit fields can stay null for now:
            // No need to send them from UI for this phase.
        };

        // Optional manual empId; otherwise auto-generate in hook
        if (req.body.empId && req.body.empId.trim() !== '') {
            payload.empId = req.body.empId.trim();
        }

        // 2) Create Employee first
        const employee = await Employee.create(payload, { transaction: t });
        const employeeId = employee.id;

        // 3) Parse related sections: education, experience, documents
        const educations = Array.isArray(req.body.educations)
            ? req.body.educations
            : [];

        const experiences = Array.isArray(req.body.experiences)
            ? req.body.experiences
            : [];

        const documents = Array.isArray(req.body.documents)
            ? req.body.documents
            : [];

        // 4) Insert education rows
        if (educations.length) {
            await Promise.all(
                educations.map((edu) =>
                    EmployeeEducation.create(
                        {
                            employeeId,
                            level: edu.level || 'Other',
                            degree: edu.degree || null,
                            specialization: edu.specialization || null,
                            institutionName: edu.institutionName || null,
                            board: edu.board || null,
                            startYear: edu.startYear || null,
                            endYear: edu.endYear || null,
                            yearOfPassing: edu.yearOfPassing || null,
                            percentageOrCgpa: edu.percentageOrCgpa || null,
                            modeOfStudy: edu.modeOfStudy || null,
                            educationType: edu.educationType || null,
                            country: edu.country || null,
                            city: edu.city || null,
                            certificateUrl: edu.certificateUrl || null,
                        },
                        { transaction: t }
                    )
                )
            );
        }

        // 5) Insert experience rows
        if (experiences.length) {
            await Promise.all(
                experiences.map((exp) =>
                    EmployeeExperience.create(
                        {
                            employeeId,
                            organizationName: exp.organizationName,
                            jobTitle: exp.jobTitle,
                            employmentType: exp.employmentType || null,
                            department: exp.department || null,
                            industryType: exp.industryType || null,
                            companyLocationCity: exp.companyLocationCity || null,
                            companyLocationCountry: exp.companyLocationCountry || null,
                            startDate: exp.startDate || null,
                            endDate: exp.endDate || null,
                            isCurrent: toBool(exp.isCurrent),
                            durationText: exp.durationText || null,
                            jobLevel: exp.jobLevel || null,
                            lastDrawnCtc: exp.lastDrawnCtc || null,
                            reasonForLeaving: exp.reasonForLeaving || null,
                            noticePeriodServed: toBool(exp.noticePeriodServed),
                        },
                        { transaction: t }
                    )
                )
            );
        }

        // 6) Insert documents rows
        if (documents.length) {
            await Promise.all(
                documents.map((doc) =>
                    EmployeeDocument.create(
                        {
                            employeeId,
                            category: doc.category || 'KYC',
                            documentType: doc.documentType,
                            nameOnDocument: doc.nameOnDocument || null,
                            documentNumber: doc.documentNumber || null,
                            issueDate: doc.issueDate || null,
                            expiryDate: doc.expiryDate || null,
                            verificationStatus: doc.verificationStatus || 'Pending',
                            verifiedBy: doc.verifiedBy || null,
                            verifiedAt: doc.verifiedAt || null,
                            fileUrl: doc.fileUrl || null,
                            documentImageUrl: doc.documentImageUrl || null,
                            notes: doc.notes || null,
                        },
                        { transaction: t }
                    )
                )
            );
        }

        await t.commit();

        console.log('Created new employee with related records:', employeeId);
        return res.status(201).json(employee);
    } catch (err) {
        await t.rollback();
        console.error('Error creating employee:', err);
        if (err.name === 'SequelizeValidationError') {
            return res
                .status(400)
                .json({ error: err.errors.map((e) => e.message).join(', ') });
        }
        next(err);
    }
};
