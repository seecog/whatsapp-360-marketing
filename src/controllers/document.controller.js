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
//    - Calculates full breakup ONLY from annual CTC
//    - If monthly CTC (CTC/12) >= 25,000:
//         ➜ calculate variable pay (10% by default)
//         ➜ apply Professional Tax
//      else:
//         ➜ variable pay = 0
//         ➜ Professional Tax = 0
function generateSalaryBreakup(annualGrossCtc, options = {}) {
    const {
        variablePayPct = 0.10,        // base variable % if applicable
        basicPctOfFixedGross = 0.40,  // 40% of fixed gross
        hraPctOfBasic = 0.40,         // 40% of basic
        monthlyProfessionalTax = 200, // e.g. Karnataka PT
        professionalTaxThresholdMonthly = 25000, // threshold on monthly CTC
    } = options;

    const round = (val) => Math.round(val);
    const toMonthly = (val) => val / 12;

    if (!annualGrossCtc || annualGrossCtc <= 0) {
        return {
            meta: {
                currency: 'INR',
                annualGrossCtc: 0,
                variablePayPct: 0,
            },
            annual: {
                fixedGross: 0,
                variablePay: 0,
                basic: 0,
                hra: 0,
                specialAllowance: 0,
                totalCtc: 0,
            },
            monthly: {
                fixedGross: 0,
                variablePayTarget: 0,
                basic: 0,
                hra: 0,
                specialAllowance: 0,
            },
            deductionsMonthly: {
                professionalTax: 0,
                totalDeductions: 0,
            },
            netTakeHome: {
                withoutVariable: 0,
                withVariableAveraged: 0,
            },
        };
    }

    // 👉 Monthly CTC used to decide if we apply variable pay + taxes
    const monthlyCtc = toMonthly(annualGrossCtc);
    const advancedComponentsApplicable =
        monthlyCtc >= professionalTaxThresholdMonthly;

    // If monthly CTC >= 25k => apply variable pay; else variablePay = 0
    const effectiveVariablePayPct = advancedComponentsApplicable
        ? variablePayPct
        : 0;

    // 1) Split CTC into Fixed vs Variable
    const variablePayAnnual = annualGrossCtc * effectiveVariablePayPct;
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

    // 4) Professional Tax — only if monthly CTC >= threshold
    const appliedProfessionalTaxMonthly = advancedComponentsApplicable
        ? monthlyProfessionalTax
        : 0;

    const totalDeductionsMonthly = appliedProfessionalTaxMonthly;

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
            variablePayPct: effectiveVariablePayPct * 100,
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
            professionalTax: round(appliedProfessionalTaxMonthly),
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

        // Optional: Signature image if you want later
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

            // Logo / stamp / signature for all
            LOGO_SRC,
            STAMP_SRC,
            SIGNATURE_SRC,
        };

        const code = (docType.code || '').toUpperCase();
        let templateData = { ...baseData };

        // 🔹 Internship Completion Certificate (existing)
        if (code === 'INTERNSHIP_CERT') {
            templateData = {
                ...templateData,
                DOJ: formatDate(employee.empDoj || employee.empDateOfJoining),
            };

            // 🔹 Salary Slip (from Annual CTC + conditional taxes & variable pay)
        } else if (code === 'SALARY_SLIP') {
            const ctcAnnual = Number(
                employee.empCtc ||
                employee.ctcAnnual ||
                employee.ctc ||
                0
            );

            const breakup = generateSalaryBreakup(ctcAnnual);

            const basicMonthly = breakup.monthly.basic;
            const hraMonthly = breakup.monthly.hra;
            const specialMonthly = breakup.monthly.specialAllowance;
            const fixedGrossMonthly = breakup.monthly.fixedGross;

            // Here we are only using Professional Tax as deduction (for now)
            const professionalTaxMonthly = breakup.deductionsMonthly.professionalTax;

            const PF = professionalTaxMonthly; // mapped to PF column in slip
            const ESI = 0;
            const TDS = 0;

            const totalDeductionsMonthly = PF + ESI + TDS;
            const netMonthly = fixedGrossMonthly - totalDeductionsMonthly;

            templateData = {
                ...templateData,
                // TODO: make Month dynamic or from UI
                Month: 'November 2025',
                EMP_CODE: employee.empId || employee.id,
                DOB: formatDate(employee.empDob),
                DOJ: formatDate(employee.empDateOfJoining || employee.empDoj),
                PAN: employee.empPan || '',
                DAYS_PAID: employee.daysPaid || 30,
                WORK_DAYS: employee.workDays || 30,

                BASIC: basicMonthly.toFixed(2),
                HRA: hraMonthly.toFixed(2),
                SPECIAL: specialMonthly.toFixed(2),

                PF: PF.toFixed(2),
                ESI: ESI.toFixed(2),
                TDS: TDS.toFixed(2),

                TOTAL_EARNINGS: fixedGrossMonthly.toFixed(2),
                TOTAL_DEDUCTIONS: totalDeductionsMonthly.toFixed(2),
                NET_SALARY: netMonthly.toFixed(2),
            };

            // 🔹 Offer Letter (from Annual CTC + conditional taxes & variable pay)
        } else if (code === 'OFFER_LETTER') {
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

            const professionalTaxMonthly = breakup.deductionsMonthly.professionalTax;
            const totalDeductionsMonthly = professionalTaxMonthly;
            const totalDeductionsAnnual = totalDeductionsMonthly * 12;

            const netMonthly = grossMonthFixed - totalDeductionsMonthly;

            templateData = {
                ...templateData,

                // Old keys (if used anywhere else)
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

                // 👇 keys matching your current Offer Letter HTML template
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

                // Extra fields if needed
                fixedGrossMonthly: grossMonthFixed.toFixed(2),
                fixedGrossAnnual: grossAnnualFixed.toFixed(2),
                variableAnnual: breakup.annual.variablePay.toFixed(2),
                variableMonthlyTarget: breakup.monthly.variablePayTarget.toFixed(2),
                professionalTaxMonthly: professionalTaxMonthly.toFixed(2),
                totalDeductionsMonthly: totalDeductionsMonthly.toFixed(2),
                totalDeductionsAnnual: totalDeductionsAnnual.toFixed(2),
            };

            // 🔹 Relieving & Experience Letter
        } else if (
            code === 'RELIEVING' ||
            code === 'RELIEVING_LETTER' ||
            code === 'RELIEVING_EXPERIENCE'
        ) {
            const periodFrom = employee.empDoj || employee.empDateOfJoining;
            const periodTo =
                employee.empRelievingDate ||
                employee.empLastWorkingDay ||
                employee.empSeparationDate ||
                new Date();

            templateData = {
                ...templateData,
                PERIOD_FROM: formatDate(periodFrom),
                PERIOD_TO: formatDate(periodTo),
                RELIEVING_DATE: formatDate(periodTo),
            };

            // 🔹 Internship Offer Letter
        } else if (
            code === 'INTERNSHIP_OFFER' ||
            code === 'INTERN_OFFER' ||
            code === 'INTERNSHIP_OFFER_LETTER'
        ) {
            const startDateRaw =
                employee.internStartDate ||
                employee.empInternStartDate ||
                employee.empDoj ||
                employee.empDateOfJoining;

            const endDateRaw =
                employee.internEndDate ||
                employee.empInternEndDate;

            let numberOfMonths = employee.internMonths;

            if (!numberOfMonths && startDateRaw && endDateRaw) {
                const start = new Date(startDateRaw);
                const end = new Date(endDateRaw);
                if (!isNaN(start) && !isNaN(end) && end > start) {
                    const diffMs = end - start;
                    numberOfMonths = Math.max(
                        1,
                        Math.round(diffMs / (1000 * 60 * 60 * 24 * 30))
                    );
                }
            }

            const stipend = Number(
                employee.internStipend ||
                employee.empStipend ||
                0
            );
            const stipendInWords =
                employee.internStipendInWords ||
                employee.empStipendInWords ||
                '';

            templateData = {
                ...templateData,

                // multiple aliases so your template works even if keys differ
                FullName: employee.empName,

                designation: employee.empDesignation || '',
                Designation: employee.empDesignation || '',

                StartDate: formatDate(startDateRaw),
                EndDate: formatDate(endDateRaw),
                NumberofMonths: numberOfMonths || '',

                DepartmentName: employee.empDepartment || '',

                SupervisorName: employee.supervisorName || '',
                SupervisorDesignation: employee.supervisorDesignation || '',

                WorkingHours:
                    employee.workingHours || '10:00 AM to 6:00 PM',

                Amount: (employee.empCtc / 12).toFixed(2),
                AmountinWords: stipendInWords,
            };

            // 🔹 PPO Letter (Pre-Placement Offer)
        } else if (
            code === 'PPO' ||
            code === 'PPO_LETTER' ||
            code === 'PPO_OFFER' ||
            code === 'PRE_PLACEMENT_OFFER'
        ) {
            const ctcAnnual = Number(
                employee.empCtc ||
                employee.ctcAnnual ||
                employee.ctc ||
                0
            );
            const breakup = generateSalaryBreakup(ctcAnnual);
            const monthlyFixed = breakup.monthly.fixedGross;

            templateData = {
                ...templateData,

                Name: employee.empName,
                'Name': employee.empName,

                Designation: employee.empDesignation || '',
                'Designation': employee.empDesignation || '',

                EmployeeType:
                    employee.empType ||
                    employee.employeeType ||
                    'Full Time',

                CTC: ctcAnnual.toFixed(2),
                'CTC': ctcAnnual.toFixed(2),

                JoiningDate: formatDate(
                    employee.empDoj || employee.empDateOfJoining
                ),

                MonthlySalary: monthlyFixed.toFixed(2),
            };
        }

        // ⭐ Generate PDF
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
