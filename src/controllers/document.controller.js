// src/controllers/document.controller.js
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import Employee from '../models/Employee.js';
import DocumentType from '../models/DocumentType.js';
import { generatePdfFromTemplate } from '../utils/generatePdfFromTemplate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// 🔹 Salary breakup helper (using empCtc)
function generateSalaryBreakup(annualGrossCtc, options = {}) {
    const {
        variablePayPct = 0.10,        // 10% of CTC
        basicPctOfFixedGross = 0.40,  // 40% of fixed gross
        hraPctOfBasic = 0.40,         // 40% of basic
        monthlyProfessionalTax = 200  // e.g. Karnataka PT
    } = options;

    const round = (val) => Math.round(val);
    const toMonthly = (val) => val / 12;

    // 1) Split CTC into Fixed vs Variable
    const variablePayAnnual = annualGrossCtc * variablePayPct;
    const fixedGrossAnnual = annualGrossCtc - variablePayAnnual;

    // 2) Breakup of Fixed Gross
    const basicAnnual = fixedGrossAnnual * basicPctOfFixedGross;
    const hraAnnual = basicAnnual * hraPctOfBasic;
    const specialAllowanceAnnual = fixedGrossAnnual - basicAnnual - hraAnnual;

    // 3) Monthly values
    const basicMonthly = toMonthly(basicAnnual);
    const hraMonthly = toMonthly(hraAnnual);
    const specialAllowanceMonthly = toMonthly(specialAllowanceAnnual);
    const fixedGrossMonthly = toMonthly(fixedGrossAnnual);
    const variablePayMonthlyTarget = toMonthly(variablePayAnnual);

    // 4) Deductions
    const totalDeductionsMonthly = monthlyProfessionalTax;

    // 5) Net pay (without variable)
    const netTakeHomeMonthlyWithoutVariable =
        fixedGrossMonthly - totalDeductionsMonthly;

    // 6) Effective in-hand including averaged variable
    const netTakeHomeMonthlyWithVariable =
        fixedGrossMonthly + variablePayMonthlyTarget - totalDeductionsMonthly;

    return {
        meta: {
            currency: 'INR',
            annualGrossCtc: round(annualGrossCtc),
            variablePayPct: variablePayPct * 100,
        },
        annual: {
            fixedGross: round(fixedGrossAnnual),
            variablePay: round(variablePayAnnual),
            basic: round(basicAnnual),
            hra: round(hraAnnual),
            specialAllowance: round(specialAllowanceAnnual),
            totalCtc: round(annualGrossCtc),
        },
        monthly: {
            fixedGross: round(fixedGrossMonthly),
            variablePayTarget: round(variablePayMonthlyTarget),
            basic: round(basicMonthly),
            hra: round(hraMonthly),
            specialAllowance: round(specialAllowanceMonthly),
        },
        deductionsMonthly: {
            professionalTax: round(monthlyProfessionalTax),
            totalDeductions: round(totalDeductionsMonthly),
        },
        netTakeHome: {
            withoutVariable: round(netTakeHomeMonthlyWithoutVariable),
            withVariableAveraged: round(netTakeHomeMonthlyWithVariable),
        },
    };
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

        // 🔹 Build base64 image data for assets in src/assets
        const assetDir = path.join(__dirname, '..', 'assets');

        const logoPath = path.join(assetDir, 'logo.jpg');
        const stampPath = path.join(assetDir, 'stamp.png');

        const LOGO_SRC = fs.existsSync(logoPath)
            ? `data:image/jpeg;base64,${fs.readFileSync(logoPath).toString('base64')}`
            : '';

        const STAMP_SRC = fs.existsSync(stampPath)
            ? `data:image/png;base64,${fs.readFileSync(stampPath).toString('base64')}`
            : '';

        // If you later add a signature image, just drop it in src/assets
        const signaturePath = path.join(assetDir, 'signature.png');
        const SIGNATURE_SRC = fs.existsSync(signaturePath)
            ? `data:image/png;base64,${fs.readFileSync(signaturePath).toString('base64')}`
            : '';

        // Base data available for ALL templates
        const baseData = {
            EMP_NAME: employee.empName,
            EMP_ID: employee.empId || employee.id,
            EMP_EMAIL: employee.empEmail || '',
            DESIGNATION: employee.empDesignation || '',
            DEPARTMENT: employee.empDepartment || '',
            LOCATION: employee.empWorkLoc || '',

            // make logo/stamp/signature available for all templates
            LOGO_SRC,
            STAMP_SRC,
            SIGNATURE_SRC,
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
        } else if (code === 'OFFER_LETTER') {
            // 🔹 Offer Letter specific data using empCtc and salary breakup
            const ctcAnnual = Number(
                employee.empCtc || // ✅ primary source
                employee.ctcAnnual ||
                employee.ctc ||
                0
            );

            const breakup = generateSalaryBreakup(ctcAnnual);
            console.log('Salary Breakup Generated:', breakup);

            const basicAnnual = breakup.annual.basic;
            const hraAnnual = breakup.annual.hra;
            const specialAnnual = breakup.annual.specialAllowance;

            const variablePayAnnual = breakup.annual.variablePay;
            const variablePayMonthly = breakup.monthly.variablePayTarget;

            const basicMonthly = breakup.monthly.basic;
            const hraMonthly = breakup.monthly.hra;
            const specialMonthly = breakup.monthly.specialAllowance;

            const grossAnnualFixed = breakup.annual.fixedGross;
            const grossMonthFixed = breakup.monthly.fixedGross;

            const netMonthly = breakup.netTakeHome.withoutVariable;
            const deductionsMonthly = breakup.deductionsMonthly.totalDeductions;
            const deductionsAnnual = deductionsMonthly * 12;

            templateData = {
                ...templateData,

                // keep old keys if you ever use them elsewhere
                OFFER_DATE: formatDate(new Date()),
                JOINING_DATE: formatDate(employee.empDoj || employee.empDateOfJoining),
                CTC: ctcAnnual.toFixed(2),
                CTC_IN_WORDS: employee.ctcAnnualInWords || '',
                BASIC_MONTH: basicMonthly.toFixed(2),
                BASIC_ANNUAL: basicAnnual.toFixed(2),
                HRA_MONTH: hraMonthly.toFixed(2),
                HRA_ANNUAL: hraAnnual.toFixed(2),
                SPECIAL_ALLOWANCE_MONTH: specialMonthly.toFixed(2),
                SPECIAL_ALLOWANCE_ANNUAL: specialAnnual.toFixed(2),
                GROSS_MONTH: grossMonthFixed.toFixed(2),
                GROSS_ANNUAL: grossAnnualFixed.toFixed(2),
                NET_PAY: netMonthly.toFixed(2),

                // 👇 keys that your current HTML template expects
                offerDate: formatDate(new Date()),
                joiningDate: formatDate(employee.empDoj || employee.empDateOfJoining),
                fullName: employee.empName,
                designation: employee.empDesignation || '',
                ctc: ctcAnnual.toFixed(2),
                ctcInWords: employee.ctcAnnualInWords || '',
                basicMonth: basicMonthly.toFixed(2),
                basicAnnual: basicAnnual.toFixed(2),
                hraMonth: hraMonthly.toFixed(2),
                hraAnnual: hraAnnual.toFixed(2),
                specialAllowanceMonth: specialMonthly.toFixed(2),
                specialAllowanceAnnual: specialAnnual.toFixed(2),
                variablePayMonth: variablePayMonthly.toFixed(2),
                variablePayAnnual: variablePayAnnual.toFixed(2),
                grossMonth: grossMonthFixed.toFixed(2),
                grossAnnual: grossAnnualFixed.toFixed(2),
                netPay: netMonthly.toFixed(2),

                // Extra fields (available if you want to use them in template)
                fixedGrossMonthly: grossMonthFixed.toFixed(2),
                fixedGrossAnnual: grossAnnualFixed.toFixed(2),
                variableAnnual: breakup.annual.variablePay.toFixed(2),
                variableMonthlyTarget: breakup.monthly.variablePayTarget.toFixed(2),
                professionalTaxMonthly: breakup.deductionsMonthly.professionalTax.toFixed(2),
                totalDeductionsMonthly: deductionsMonthly.toFixed(2),
                totalDeductionsAnnual: deductionsAnnual.toFixed(2),
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
