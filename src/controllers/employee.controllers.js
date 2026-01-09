// src/controllers/employee.controllers.js
import { Op } from 'sequelize';
import { sequelize } from '../db/index.js';
import Employee from '../models/Employee.js';
import EmployeeEducation from '../models/EmployeeEducation.js';
import EmployeeExperience from '../models/EmployeeExperience.js';
import EmployeeDocument from '../models/EmployeeDocument.js';
import { Department } from '../models/Department.js';
import { Designation } from '../models/Designation.js';
import BusinessAddress from '../models/BusinessAddress.js';
import Country from '../models/Country.js';
import State from '../models/State.js';

const toBool = (val) =>
    val === true || val === 'true' || val === '1' || val === 'on';

const isAdminUser = (user) => String(user?.role || '').toLowerCase() === 'admin';

// Legacy installs often have employees created without correct userId tenancy.
// We only relax scoping when the employees table effectively has a single tenant.
const isLegacySingleTenantEmployees = async () => {
    try {
        // DISTINCT userId count (null counts as a single distinct value)
        const distinctUserIds = await Employee.count({ distinct: true, col: 'userId' });
        return distinctUserIds <= 1;
    } catch (e) {
        // Be safe: if this check fails, do NOT relax scoping
        return false;
    }
};

/**
 * GET /employees (HTML page)
 */
export const renderEmployeesPage = async (req, res, next) => {
    try {
        const search = (req.query.search || '').trim();
        const userId = req.user?.id;
        const isAdmin = isAdminUser(req.user);
        const where = {};

        // Non-admin users should only see their own employees
        if (userId && !isAdmin) {
            where.userId = userId;
        }

        if (search) {
            where[Op.or] = [
                { empName: { [Op.like]: `%${search}%` } },
                { empEmail: { [Op.like]: `%${search}%` } },
                { empId: { [Op.like]: `%${search}%` } },
            ];
        }

        let employeesPromise = Employee.findAll({
            where,
            order: [['empId', 'ASC']],
        });

        const [employeesInitial, departments, designations, business_addresses,countries,states] = await Promise.all([
            employeesPromise,
            Department.findAll({
                where: { status: 'ACTIVE' },
                order: [['name', 'ASC']],
            }),
            Designation.findAll({
                where: { status: 'ACTIVE' },
                order: [['name', 'ASC']],
            }),
            BusinessAddress.findAll({
                where: { status: 'ACTIVE' },
                order: [['addressName', 'ASC']],
            }),
            Country.findAll({
                where: { status: 'ACTIVE' },
                order: [['name', 'ASC']],
            }),
            State.findAll({
                where: { status: 'ACTIVE' },
                order: [['name', 'ASC']],
            }),
        ]);

        // Legacy fallback: if scoped query returns nothing for a non-admin,
        // and the system is effectively single-tenant, show employees without userId scope.
        let employees = employeesInitial;
        if (!isAdmin && userId && employees.length === 0) {
            const legacy = await isLegacySingleTenantEmployees();
            if (legacy) {
                const legacyWhere = { ...where };
                delete legacyWhere.userId;
                employees = await Employee.findAll({
                    where: legacyWhere,
                    order: [['empId', 'ASC']],
                });
            }
        }

        // const departments = await Department.findAll();
        console.log("departments data : ",departments)

        console.log("employees data : ",employees)

        const employeesPlain = employees.map((e) => e.get({ plain: true }));
        const departmentsPlain = departments.map((d) => d.get({ plain: true }));
        const designationsPlain = designations.map((d) => d.get({ plain: true }));
        const businessAddressesPlain = business_addresses.map((b) => b.get({ plain: true }));
        const countriesPlain = countries.map((c) => c.get({ plain: true }));
        const statesPlain = states.map((s) => s.get({ plain: true }));

        console.log('Employees fetched for page');

        const user = req.user
            ? { firstName: req.user.firstName, lastName: req.user.lastName }
            : {};

        res.render('employees', {//loading the employees.hbs
            layout: 'main',
            title: 'Employee Management',
            user,
            active: 'employees',
            activeGroup: 'workspace',
            employees: employeesPlain,
            departments: departmentsPlain,
            designations: designationsPlain,
            businessAddresses: businessAddressesPlain,
            countries: countriesPlain,
            states: statesPlain,
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
        const isAdmin = isAdminUser(req.user);
        const where = {};

        // Non-admin users should only see their own employees
        if (userId && !isAdmin) {
            where.userId = userId;
        }

        if (search) {
            where[Op.or] = [
                { empName: { [Op.like]: `%${search}%` } },
                { empEmail: { [Op.like]: `%${search}%` } },
                { empId: { [Op.like]: `%${search}%` } },
            ];
        }

        let employees = await Employee.findAll({
            where,
            order: [['empId', 'ASC']],
        });

        // Legacy fallback (same rules as HTML page)
        if (!isAdmin && userId && employees.length === 0) {
            const legacy = await isLegacySingleTenantEmployees();
            if (legacy) {
                const legacyWhere = { ...where };
                delete legacyWhere.userId;
                employees = await Employee.findAll({
                    where: legacyWhere,
                    order: [['empId', 'ASC']],
                });
            }
        }

        console.log('Employees listed via API');
        res.json(employees);
    } catch (err) {
        console.error('Error listing employees:', err);
        next(err);
    }
};

/**
 * GET /api/v1/employees/:id
 * Get single employee with related details
 */
export const getEmployeeById = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const isAdmin = isAdminUser(req.user);
        const rawId = String(req.params.id || '').trim();

        // Support numeric primary key id, and fallback to empId string (e.g. EMP0001)
        const numericId = Number.parseInt(rawId, 10);
        const isNumeric = !Number.isNaN(numericId);

        const where = isNumeric ? { id: numericId } : { empId: rawId };
        if (userId && !isAdmin) {
            where.userId = userId;
        }

        let employee = await Employee.findOne({
            where,
            include: [
                { model: EmployeeEducation, as: 'educations' },
                { model: EmployeeExperience, as: 'experiences' },
                { model: EmployeeDocument, as: 'documents' },
            ],
        });

        // Legacy fallback: if not found and non-admin, allow lookup without userId
        if (!employee && userId && !isAdmin) {
            const legacy = await isLegacySingleTenantEmployees();
            if (legacy) {
                const legacyWhere = { ...where };
                delete legacyWhere.userId;
                employee = await Employee.findOne({
                    where: legacyWhere,
                    include: [
                        { model: EmployeeEducation, as: 'educations' },
                        { model: EmployeeExperience, as: 'experiences' },
                        { model: EmployeeDocument, as: 'documents' },
                    ],
                });
            }
        }

        if (!employee) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        res.json(employee);
    } catch (err) {
        console.error('Error fetching employee by id:', err);
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

            // KYC core
            // empAadhar: req.body.empAadhar,
            // empPan: req.body.empPan,
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

                            // NEW: supporting document URLs
                            relievingLetterUrl: exp.relievingLetterUrl || null,
                            salarySlipsUrl: exp.salarySlipsUrl || null,
                            bankStatementUrl: exp.bankStatementUrl || null,
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

/**
 * PUT /api/v1/employees/:id
 * Update employee + nested sections
 */
export const updateEmployee = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        console.log('--- UPDATE EMPLOYEE CALLED ---');
        console.log('Params id:', req.params.id);
        console.log('Body:', JSON.stringify(req.body, null, 2));
        console.log('User:', req.user?.id);
        const userId = req.user?.id;
        const isAdmin = isAdminUser(req.user);
        const id = Number.parseInt(String(req.params.id || '').trim(), 10);

        if (Number.isNaN(id)) {
            await t.rollback();
            return res.status(400).json({ error: 'Invalid employee ID' });
        }

        const where = { id };
        if (userId && !isAdmin) where.userId = userId;

        let employee = await Employee.findOne({ where, transaction: t, lock: t.LOCK.UPDATE });
        // Legacy fallback: if not found and non-admin, allow update without userId scope only in single-tenant legacy mode
        if (!employee && userId && !isAdmin) {
            const legacy = await isLegacySingleTenantEmployees();
            if (legacy) {
                const legacyWhere = { id };
                employee = await Employee.findOne({ where: legacyWhere, transaction: t, lock: t.LOCK.UPDATE });
            }
        }
        if (!employee) {
            await t.rollback();
            return res.status(404).json({ error: 'Employee not found' });
        }

        const payload = {
            // keep userId as is
            firstName: req.body.firstName,
            middleName: req.body.middleName || null,
            lastName: req.body.lastName,
            empName: req.body.empName || employee.empName,

            gender: req.body.gender || null,
            maritalStatus: req.body.maritalStatus || null,
            bloodGroup: req.body.bloodGroup || null,
            nationality: req.body.nationality || null,
            religion: req.body.religion || null,
            casteCategory: req.body.casteCategory || null,
            languagesKnown: req.body.languagesKnown || null,

            empPhone: req.body.empPhone,
            altPhone: req.body.altPhone || null,
            empEmail: req.body.empEmail,

            emergencyContactName: req.body.emergencyContactName || null,
            emergencyContactRelation: req.body.emergencyContactRelation || null,
            emergencyContactNumber: req.body.emergencyContactNumber || null,

            presentAddressLine1: req.body.presentAddressLine1 || null,
            presentAddressLine2: req.body.presentAddressLine2 || null,
            presentCity: req.body.presentCity || null,
            presentState: req.body.presentState || null,
            presentZip: req.body.presentZip || null,
            presentCountry: req.body.presentCountry || null,

            permanentSameAsPresent: toBool(req.body.permanentSameAsPresent),
            permanentAddressLine1: req.body.permanentAddressLine1 || null,
            permanentAddressLine2: req.body.permanentAddressLine2 || null,
            permanentCity: req.body.permanentCity || null,
            permanentState: req.body.permanentState || null,
            permanentZip: req.body.permanentZip || null,
            permanentCountry: req.body.permanentCountry || null,

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

            empDob: req.body.empDob,

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

            // empAadhar: req.body.empAadhar,
            // empPan: req.body.empPan,
        };

        // Allow manual empId change if passed
        if (req.body.empId && req.body.empId.trim() !== '') {
            payload.empId = req.body.empId.trim();
        }

        await employee.update(payload, { transaction: t });

        // Nested sections
        const educations = Array.isArray(req.body.educations)
            ? req.body.educations
            : [];
        const experiences = Array.isArray(req.body.experiences)
            ? req.body.experiences
            : [];
        const documents = Array.isArray(req.body.documents)
            ? req.body.documents
            : [];

        // Clear existing child rows then reinsert
        await EmployeeEducation.destroy({ where: { employeeId: id }, transaction: t });
        await EmployeeExperience.destroy({ where: { employeeId: id }, transaction: t });
        await EmployeeDocument.destroy({ where: { employeeId: id }, transaction: t });

        if (educations.length) {
            await Promise.all(
                educations.map((edu) =>
                    EmployeeEducation.create(
                        {
                            employeeId: id,
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

        if (experiences.length) {
            await Promise.all(
                experiences.map((exp) =>
                    EmployeeExperience.create(
                        {
                            employeeId: id,
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

                            // NEW: supporting document URLs
                            relievingLetterUrl: exp.relievingLetterUrl || null,
                            salarySlipsUrl: exp.salarySlipsUrl || null,
                            bankStatementUrl: exp.bankStatementUrl || null,
                        },
                        { transaction: t }
                    )
                )
            );
        }


        if (documents.length) {
            await Promise.all(
                documents.map((doc) =>
                    EmployeeDocument.create(
                        {
                            employeeId: id,
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
        console.log('Updated employee with id:', id);
        return res.json(employee);
    } catch (err) {
        await t.rollback();
        console.error('Error updating employee:', err);
        if (err.name === 'SequelizeValidationError') {
            return res
                .status(400)
                .json({ error: err.errors.map((e) => e.message).join(', ') });
        }
        next(err);
    }
};

/**
 * DELETE /api/v1/employees/:id
 * Delete employee + nested rows
 */
export const deleteEmployee = async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const userId = req.user?.id;
        const isAdmin = isAdminUser(req.user);
        const id = Number.parseInt(String(req.params.id || '').trim(), 10);

        if (Number.isNaN(id)) {
            await t.rollback();
            return res.status(400).json({ error: 'Invalid employee ID' });
        }

        const where = { id };
        if (userId && !isAdmin) {
            where.userId = userId;
        }

        let employee = await Employee.findOne({ where, transaction: t, lock: t.LOCK.UPDATE });
        // Legacy fallback: if not found and non-admin, allow delete without userId scope only in single-tenant legacy mode
        if (!employee && userId && !isAdmin) {
            const legacy = await isLegacySingleTenantEmployees();
            if (legacy) {
                const legacyWhere = { id };
                employee = await Employee.findOne({ where: legacyWhere, transaction: t, lock: t.LOCK.UPDATE });
            }
        }
        if (!employee) {
            await t.rollback();
            return res.status(404).json({ error: 'Employee not found' });
        }

        await EmployeeEducation.destroy({ where: { employeeId: id }, transaction: t });
        await EmployeeExperience.destroy({ where: { employeeId: id }, transaction: t });
        await EmployeeDocument.destroy({ where: { employeeId: id }, transaction: t });
        await employee.destroy({ transaction: t });

        await t.commit();
        console.log('Deleted employee with id:', id);
        return res.json({ success: true });
    } catch (err) {
        await t.rollback();
        console.error('Error deleting employee:', err);
        next(err);
    }
};

