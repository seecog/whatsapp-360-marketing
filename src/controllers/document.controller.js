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
        variablePayPct = 0.10,
        basicPctOfFixedGross = 0.40,
        hraPctOfBasic = 0.40,
        monthlyProfessionalTax = 200,
        professionalTaxThresholdMonthly = 25000,
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

    const monthlyCtc = toMonthly(annualGrossCtc);
    const advancedComponentsApplicable =
        monthlyCtc >= professionalTaxThresholdMonthly;

    const effectiveVariablePayPct = advancedComponentsApplicable
        ? variablePayPct
        : 0;

    const variablePayAnnual = annualGrossCtc * effectiveVariablePayPct;
    const fixedGrossAnnual = annualGrossCtc - variablePayAnnual;

    const basicAnnual = fixedGrossAnnual * basicPctOfFixedGross;
    const hraAnnual = basicAnnual * hraPctOfBasic;
    const specialAllowanceAnnual = fixedGrossAnnual - basicAnnual - hraAnnual;

    const basicMonthly = toMonthly(basicAnnual);
    const hraMonthly = toMonthly(hraAnnual);
    const specialAllowanceMonthly = toMonthly(specialAllowanceAnnual);
    const fixedGrossMonthly = toMonthly(fixedGrossAnnual);
    const variablePayMonthlyTarget = toMonthly(variablePayAnnual);

    const appliedProfessionalTaxMonthly = advancedComponentsApplicable
        ? monthlyProfessionalTax
        : 0;

    const totalDeductionsMonthly = appliedProfessionalTaxMonthly;

    const netTakeHomeMonthlyWithoutVariable =
        fixedGrossMonthly - totalDeductionsMonthly;

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

            LOGO_SRC,
            STAMP_SRC,
            SIGNATURE_SRC,
        };

        const code = (docType.code || '').toUpperCase();
        let templateData = { ...baseData };

        // 🔹 Internship Completion Certificate
        if (code === 'INTERNSHIP_CERT' || code === 'INTERNSHIP_CERTIFICATE') {
            const now = new Date();

            // Intern name
            const INTERN_NAME = employee.empName;

            // Internship role
            const INTERNSHIP_ROLE =
                employee.internRole ||
                employee.empDesignation ||
                'Intern';

            // Department
            const DEPARTMENT_NAME =
                employee.empDepartment ||
                employee.departmentName ||
                'Internship Department';

            // Start & End dates
            const startDateRaw =
                employee.internStartDate ||
                employee.empInternStartDate ||
                employee.empDoj ||
                employee.empDateOfJoining ||
                null;

            const endDateRaw =
                employee.internEndDate ||
                employee.empInternEndDate ||
                employee.internCompletionDate ||
                now;

            const startDateObj = startDateRaw ? new Date(startDateRaw) : null;
            const endDateObj = endDateRaw ? new Date(endDateRaw) : null;

            // Duration calculation (simple months/days text)
            let INTERNSHIP_DURATION = '';
            if (startDateObj && endDateObj && !isNaN(startDateObj) && !isNaN(endDateObj) && endDateObj >= startDateObj) {
                const diffMs = endDateObj - startDateObj;
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

                const months = Math.floor(diffDays / 30);
                const days = diffDays % 30;

                if (months > 0 && days > 0) {
                    INTERNSHIP_DURATION = `${months} month(s) and ${days} day(s)`;
                } else if (months > 0) {
                    INTERNSHIP_DURATION = `${months} month(s)`;
                } else {
                    INTERNSHIP_DURATION = `${days} day(s)`;
                }
            } else {
                INTERNSHIP_DURATION = employee.internDuration || employee.internMonths || 'Internship Period';
            }

            // Domain / area
            const INTERNSHIP_DOMAIN =
                employee.internDomain ||
                employee.internProjectDomain ||
                'Software Development';

            // Performance summary
            const PERFORMANCE_SUMMARY =
                employee.internPerformanceSummary ||
                employee.internRatingText ||
                'Good';

            // Issue details
            const ISSUE_DATE = formatDate(now);
            const ISSUE_PLACE =
                employee.empWorkLoc ||
                employee.workLocation ||
                'Bengaluru, Karnataka';

            // Certificate number (simple pattern)
            const todayStr = now.toISOString().slice(0, 10).replace(/-/g, '');
            const CERTIFICATE_NO = `INT-${employee.empId || employee.id}-${todayStr}`;

            // Supervisor info
            const SUPERVISOR_NAME =
                employee.supervisorName ||
                employee.internSupervisorName ||
                'Supervisor';

            const SUPERVISOR_DESIGNATION =
                employee.supervisorDesignation ||
                employee.internSupervisorDesignation ||
                'Supervisor';

            templateData = {
                ...templateData,
                CERTIFICATE_NO,
                ISSUE_DATE,
                ISSUE_PLACE,

                INTERN_NAME,
                INTERNSHIP_ROLE,
                DEPARTMENT_NAME,

                START_DATE: formatDate(startDateRaw),
                END_DATE: formatDate(endDateRaw),
                INTERNSHIP_DURATION,

                INTERNSHIP_DOMAIN,
                PERFORMANCE_SUMMARY,

                SUPERVISOR_NAME,
                SUPERVISOR_DESIGNATION,
            };


            // 🔹 Salary Slip
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

            const professionalTaxMonthly = breakup.deductionsMonthly.professionalTax;

            const PF = professionalTaxMonthly; // mapped to PF column
            const ESI = 0;
            const TDS = 0;

            const totalDeductionsMonthly = PF + ESI + TDS;
            const netMonthly = fixedGrossMonthly - totalDeductionsMonthly;

            templateData = {
                ...templateData,
                Month: 'November 2025', // TODO: make dynamic
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

            // 🔹 Offer Letter
        } else if (code === 'OFFER_LETTER') {
            const ctcAnnual = Number(
                employee.empCtc ||
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

                // old keys
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

                // keys matching Offer Letter HTML
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

                fixedGrossMonthly: grossMonthFixed.toFixed(2),
                fixedGrossAnnual: grossAnnualFixed.toFixed(2),
                variableAnnual: breakup.annual.variablePay.toFixed(2),
                variableMonthlyTarget: breakup.monthly.variablePayTarget.toFixed(2),
                professionalTaxMonthly: professionalTaxMonthly.toFixed(2),
                totalDeductionsMonthly: totalDeductionsMonthly.toFixed(2),
                totalDeductionsAnnual: totalDeductionsAnnual.toFixed(2),
            };

            // 🔹 Bonus Letter
        } else if (code === 'BONUS_LETTER' || code === 'BONUS') {

            // 👉 Get bonus details from request body first, then fallback to employee fields
            const rawBonusAmount =
                req.body.bonusAmount ||
                req.body.BONUS_AMOUNT ||
                employee.empBonusAmount ||
                0;

            const BONUS_AMOUNT = Number(rawBonusAmount) || 0;

            const BONUS_IN_WORDS =
                req.body.bonusInWords ||
                req.body.BONUS_IN_WORDS ||
                employee.empBonusInWords ||
                '';

            const creditDateRaw =
                req.body.creditDate ||
                req.body.CREDIT_DATE ||
                new Date();

            templateData = {
                ...templateData,
                // matches your Bonus Letter HTML template
                DATE: formatDate(new Date()),
                EMP_ID: employee.empId || employee.id,
                EMP_NAME: employee.empName,
                DESIGNATION: employee.empDesignation || '',
                BONUS_AMOUNT: BONUS_AMOUNT.toFixed(2),
                BONUS_IN_WORDS,
                CREDIT_DATE: formatDate(creditDateRaw),
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

            // 🔹 PPO Letter
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
        } else if (code === 'PROBATION_LETTER' || code === 'PROBATION') {
            // Joining date (from employee)
            const joiningRaw =
                employee.empDoj ||
                employee.empDateOfJoining ||
                employee.dateOfJoining ||
                null;

            const joiningDateObj = joiningRaw ? new Date(joiningRaw) : null;

            // Probation period (string) - from DB if available, else default
            const probationPeriod =
                employee.probationPeriod ||
                employee.empProbationPeriod ||
                '3 months';

            // Probation end date - from DB if available, else joining + 3 months
            let probationEndRaw =
                employee.probationEndDate ||
                employee.empProbationEndDate ||
                null;

            if (!probationEndRaw && joiningDateObj && !isNaN(joiningDateObj)) {
                const tmp = new Date(joiningDateObj);
                tmp.setMonth(tmp.getMonth() + 3); // default 3 months
                probationEndRaw = tmp;
            }

            // Reporting manager
            const reportingManagerName =
                employee.reportingManagerName ||
                employee.empReportingManagerName ||
                '';

            const reportingManagerDesignation =
                employee.reportingManagerDesignation ||
                employee.empReportingManagerDesignation ||
                '';

            // Work location
            const workLocation =
                employee.empWorkLoc ||
                employee.workLocation ||
                'Prestige Cube, Site No. 26, Laskar Hosur Road, Adugodi, Koramangala, Bengaluru, Karnataka 560030';

            // Working hours
            const workingHours =
                employee.workingHours ||
                '10:00 AM to 6:00 PM';

            templateData = {
                ...templateData,
                LETTER_DATE: formatDate(new Date()),
                EMP_NAME: employee.empName,
                DESIGNATION: employee.empDesignation || '',
                WORK_LOCATION: workLocation,
                JOINING_DATE: formatDate(joiningRaw),
                PROBATION_PERIOD: probationPeriod,
                PROBATION_END_DATE: formatDate(probationEndRaw),
                REPORTING_MANAGER_NAME: reportingManagerName,
                REPORTING_MANAGER_DESIGNATION: reportingManagerDesignation,
                WORKING_HOURS: workingHours,
            };

        } else if (code === 'INCREMENT_LETTER' || code === 'INCREMENT') {
            // 👉 Get increment details, prefer request body, fallback to employee fields

            const rawIncrementAmount =
                req.body.incrementAmount ||   // from documents.hbs
                req.body.INCREMENT_AMOUNT ||  // alt naming
                0;

            const INCREMENT_AMOUNT = Number(rawIncrementAmount) || 0;

            // Get current annual CTC from employee (you can tweak these fields as per your DB)
            const currentAnnualCtc = Number(
                employee.empCtc ||       // your main CTC field
                employee.ctcAnnual ||
                employee.ctc ||
                0
            );

            // Derive current monthly, revised monthly, revised annual
            const currentMonthly = currentAnnualCtc > 0 ? currentAnnualCtc / 12 : 0;
            const revisedMonthly = currentMonthly + INCREMENT_AMOUNT;
            const revisedAnnualCtc = revisedMonthly * 12;

            const effectiveDateRaw =
                employee.empIncrementEffectiveDate || // optional from DB
                new Date();                           // default: today

            templateData = {
                ...templateData,
                // matches your Increment Letter template
                OFFER_DATE: formatDate(new Date()),
                EMP_NAME: employee.empName,
                DESIGNATION: employee.empDesignation || '',
                EFFECTIVE_DATE: formatDate(effectiveDateRaw),
                AMOUNT: currentMonthly.toFixed(2),
                REVISED_AMOUNT: revisedMonthly.toFixed(2),
                REVISED_ANNUAL_CTC: revisedAnnualCtc.toFixed(2),
            };
        } else if (
        code === 'FULL_FINAL' ||
        code === 'FULL_FINAL_SETTLEMENT' ||
        code === 'FULL_AND_FINAL' ||
        code === 'FNF_STATEMENT'
    ) {
        const now = new Date();

        // Basic employee details
        const EMP_NAME = employee.empName;
        const EMP_ID = employee.empId || employee.id;
        const DESIGNATION = employee.empDesignation || '';
        const DEPARTMENT = employee.empDepartment || '';
        const LOCATION =
            employee.empWorkLoc ||
            employee.workLocation ||
            'Prestige Cube, Site No. 26, Laskar Hosur Road, Adugodi, Koramangala, Bengaluru, Karnataka 560030';

        const dojRaw =
            employee.empDoj ||
            employee.empDateOfJoining ||
            employee.dateOfJoining ||
            null;
        const lwdRaw =
            employee.empRelievingDate ||
            employee.empLastWorkingDay ||
            employee.empSeparationDate ||
            now;

        // Settlement date (today or from DB/body)
        const settlementDateRaw =
            req.body.settlementDate ||
            employee.settlementDate ||
            now;

        // Settlement period label – e.g. "Final Month" or "Notice Period"
        const SETTLEMENT_PERIOD_LABEL =
            req.body.settlementPeriodLabel ||
            employee.settlementPeriodLabel ||
            'Final Salary Period';

        // Earnings & Deductions – can be passed from form (later) or default to 0 for now
        const num = (v) => Number(v || 0);

        const E_SALARY = num(req.body.E_SALARY || employee.fnfSalary);
        const E_LEAVE_ENCASHMENT = num(req.body.E_LEAVE_ENCASHMENT || employee.fnfLeaveEncashment);
        const E_BONUS_INCENTIVE = num(req.body.E_BONUS_INCENTIVE || employee.fnfBonusIncentive);
        const E_OTHER_EARNINGS = num(req.body.E_OTHER_EARNINGS || employee.fnfOtherEarnings);

        const D_NOTICE_RECOVERY = num(req.body.D_NOTICE_RECOVERY || employee.fnfNoticeRecovery);
        const D_ADVANCE_RECOVERY = num(req.body.D_ADVANCE_RECOVERY || employee.fnfAdvanceRecovery);
        const D_PF_ESI = num(req.body.D_PF_ESI || employee.fnfPfEsi);
        const D_TDS_PT = num(req.body.D_TDS_PT || employee.fnfTdsPt);
        const D_OTHER_DEDUCTIONS = num(req.body.D_OTHER_DEDUCTIONS || employee.fnfOtherDeductions);

        const TOTAL_EARNINGS =
            E_SALARY +
            E_LEAVE_ENCASHMENT +
            E_BONUS_INCENTIVE +
            E_OTHER_EARNINGS;

        const TOTAL_DEDUCTIONS =
            D_NOTICE_RECOVERY +
            D_ADVANCE_RECOVERY +
            D_PF_ESI +
            D_TDS_PT +
            D_OTHER_DEDUCTIONS;

        const NET_PAYABLE = TOTAL_EARNINGS - TOTAL_DEDUCTIONS;

        // Net payable in words – if you have a stored field; else blank (or later we can plug number-to-words)
        const NET_PAYABLE_WORDS =
            req.body.NET_PAYABLE_WORDS ||
            employee.fnfNetPayableWords ||
            '';

        // Bank info
        const bankName =
            employee.bankName ||
            employee.empBankName ||
            '';
        const bankAccountNumber =
            employee.bankAccountNumber ||
            employee.empBankAccountNo ||
            '';
        const BANK_ACCOUNT_LAST4 = bankAccountNumber
            ? String(bankAccountNumber).slice(-4)
            : '';

        const paymentDateRaw =
            req.body.paymentDate ||
            employee.fnfPaymentDate ||
            settlementDateRaw;

        // Settlement ref number
        const yyyymmdd = formatDate(settlementDateRaw).replace(/-/g, '');
        const SETTLEMENT_REF =
            employee.settlementRef ||
            `FNF-${EMP_ID}-${yyyymmdd}`;

        templateData = {
            ...templateData,

            SETTLEMENT_DATE: formatDate(settlementDateRaw),
            EMP_NAME,
            EMP_ID,
            DESIGNATION,
            DEPARTMENT,
            LOCATION,
            DOJ: formatDate(dojRaw),
            LWD: formatDate(lwdRaw),
            SETTLEMENT_REF,

            SETTLEMENT_PERIOD_LABEL,

            E_SALARY: E_SALARY.toFixed(2),
            E_LEAVE_ENCASHMENT: E_LEAVE_ENCASHMENT.toFixed(2),
            E_BONUS_INCENTIVE: E_BONUS_INCENTIVE.toFixed(2),
            E_OTHER_EARNINGS: E_OTHER_EARNINGS.toFixed(2),

            D_NOTICE_RECOVERY: D_NOTICE_RECOVERY.toFixed(2),
            D_ADVANCE_RECOVERY: D_ADVANCE_RECOVERY.toFixed(2),
            D_PF_ESI: D_PF_ESI.toFixed(2),
            D_TDS_PT: D_TDS_PT.toFixed(2),
            D_OTHER_DEDUCTIONS: D_OTHER_DEDUCTIONS.toFixed(2),

            TOTAL_EARNINGS: TOTAL_EARNINGS.toFixed(2),
            TOTAL_DEDUCTIONS: TOTAL_DEDUCTIONS.toFixed(2),
            NET_PAYABLE: NET_PAYABLE.toFixed(2),
            NET_PAYABLE_WORDS,

            BANK_NAME: bankName,
            BANK_ACCOUNT_LAST4,
            PAYMENT_DATE: formatDate(paymentDateRaw),
        };
        } else if (
            code === 'RESIGNATION_ACCEPTANCE' ||
            code === 'RESIGNATION_ACCEPT' ||
            code === 'RESIGN_ACCEPT_LETTER'
        ) {
            const now = new Date();

            const EMP_NAME = employee.empName;
            const EMP_ID = employee.empId || employee.id;
            const DESIGNATION = employee.empDesignation || '';
            const DEPARTMENT = employee.empDepartment || '';
            const LOCATION =
                employee.empWorkLoc ||
                employee.workLocation ||
                'Prestige Cube, Site No. 26, Laskar Hosur Road, Adugodi, Koramangala, Bengaluru, Karnataka 560030';

            // Resignation date – from employee or today
            const resignationDateRaw =
                employee.empResignationDate ||
                employee.resignationDate ||
                null;

            // Last working day – from DB or fallback
            const lastWorkingDayRaw =
                employee.empLastWorkingDay ||
                employee.empRelievingDate ||
                employee.empSeparationDate ||
                null;

            // Notice period text (e.g. "30 days")
            const NOTICE_PERIOD =
                employee.noticePeriodText ||
                employee.empNoticePeriodText ||
                (employee.empNoticePeriod
                    ? `${employee.empNoticePeriod} days`
                    : 'as per company policy');

            templateData = {
                ...templateData,

                LETTER_DATE: formatDate(now),

                EMP_NAME,
                EMP_ID,
                DESIGNATION,
                DEPARTMENT,
                LOCATION,

                RESIGNATION_DATE: formatDate(resignationDateRaw),
                LAST_WORKING_DAY: formatDate(lastWorkingDayRaw),
                NOTICE_PERIOD,
            };
        } else if (
            code === 'NO_DUES' ||
            code === 'NO_DUES_FORM' ||
            code === 'NO_DUES_CLEARANCE'
        ) {
            const now = new Date();

            // Last working day from employee record
            const lwdRaw =
                employee.empLastWorkingDay ||
                employee.empRelievingDate ||
                employee.empSeparationDate ||
                employee.lastWorkingDay ||
                null;

            // Form date: allow override from request, otherwise today
            const formDateRaw =
                req.body.formDate ||
                employee.noDuesFormDate ||
                now;

            // These are already in baseData, but we can re-set explicitly if you like
            const EMP_NAME = employee.empName;
            const EMP_ID = employee.empId || employee.id;
            const DESIGNATION = employee.empDesignation || '';
            const DEPARTMENT = employee.empDepartment || '';
            const LOCATION =
                employee.empWorkLoc ||
                employee.workLocation ||
                'Prestige Cube, Site No. 26, Laskar Hosur Road, Adugodi, Koramangala, Bengaluru, Karnataka 560030';

            templateData = {
                ...templateData,
                FORM_DATE: formatDate(formDateRaw),
                LWD: formatDate(lwdRaw),

                // (optional but clear)
                EMP_NAME,
                EMP_ID,
                DESIGNATION,
                DEPARTMENT,
                LOCATION,
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
