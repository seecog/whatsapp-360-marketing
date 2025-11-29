// src/controllers/document.controller.js
import Employee from '../models/Employee.js';
import DocumentType from '../models/DocumentType.js';
import { generatePdfFromTemplate } from '../utils/generatePdfFromTemplate.js';

function formatDate(value) {
    if (!value) return '';

    if (value instanceof Date) {
        return value.toISOString().slice(0, 10);
    }

    const d = new Date(value);
    if (!isNaN(d.getTime())) {
        return d.toISOString().slice(0, 10);
    }

    return String(value);
}

export const renderDocumentsPage = async (req, res, next) => {
    try {
        const employees = await Employee.findAll({
            order: [['empName', 'ASC']],
        });

        const documentTypes = await DocumentType.findAll({
            where: { isDeleted: false },
            order: [['name', 'ASC']],
        });

        const employeesPlain = employees.map((e) => e.get({ plain: true }));
        const documentTypesPlain = documentTypes.map((d) => d.get({ plain: true }));

        const user = req.user
            ? { firstName: req.user.firstName, lastName: req.user.lastName }
            : {};

        res.render('documents', {
            layout: 'main',
            title: 'Documents',
            user,
            employees: employeesPlain,
            documentTypes: documentTypesPlain,
        });
    } catch (err) {
        next(err);
    }
};

export const generateDocument = async (req, res, next) => {
    try {
        const { employeeId, documentTypeId } = req.body;

        const employee = await Employee.findByPk(employeeId);
        const docType = await DocumentType.findByPk(documentTypeId);

        if (!employee || !docType || docType.isDeleted) {
            return res.status(400).send('Invalid employee or document type');
        }

        if (!docType.templateHtml) {
            return res
                .status(400)
                .send('No template HTML configured for this document type');
        }

        // Base data available for ALL templates
        const baseData = {
            EMP_NAME: employee.empName,
            EMP_ID: employee.empId || employee.id,
            EMP_EMAIL: employee.empEmail || '',
            DESIGNATION: employee.empDesignation || '',
            DEPARTMENT: employee.empDepartment || '',
            LOCATION: employee.empWorkLoc || '',
        };

        const code = (docType.code || '').toUpperCase();
        let templateData = { ...baseData };

        if (code === 'INTERNSHIP_CERT') {
            templateData = {
                ...templateData,
                DOJ: formatDate(employee.empDoj || employee.empDateOfJoining),
            };
        } else if (code === 'SALARY_SLIP') {
            // Safely coerce to numbers
            const basic = Number(employee.basicSalary || 0);
            const hra = Number(employee.hra || 0);
            const special = Number(employee.specialAllowance || 0);
            const pf = Number(employee.pfDeduction || 0);
            const esi = Number(employee.esiDeduction || 0);
            const tds = Number(employee.tdsDeduction || 0);

            const totalEarnings = basic + hra + special;
            const totalDeductions = pf + esi + tds;
            const netSalary = totalEarnings - totalDeductions;

            templateData = {
                ...templateData,
                Month: 'November 2025', // TODO: make dynamic / from UI
                EMP_CODE: employee.empId || employee.id,
                DOB: formatDate(employee.empDob),
                DOJ: formatDate(employee.empDateOfJoining),
                PAN: employee.empPan || '',
                DAYS_PAID: employee.daysPaid || 30,
                WORK_DAYS: employee.workDays || 30,
                BASIC: basic.toFixed(2),
                HRA: hra.toFixed(2),
                SPECIAL: special.toFixed(2),
                PF: pf.toFixed(2),
                ESI: esi.toFixed(2),
                TDS: tds.toFixed(2),
                TOTAL_EARNINGS: totalEarnings.toFixed(2),
                TOTAL_DEDUCTIONS: totalDeductions.toFixed(2),
                NET_SALARY: netSalary.toFixed(2),
            };
        }

        // ⭐ IMPORTANT: await the async PDF generator
        const pdfBuffer = await generatePdfFromTemplate(
            docType.templateHtml,
            templateData
        );

        const fileName = `${docType.code}-${baseData.EMP_ID}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${fileName}"`
        );
        res.setHeader('Content-Length', pdfBuffer.length);

        return res.send(pdfBuffer);
    } catch (err) {
        console.error('Error generating document PDF:', err);
        return next(err);
    }
};
