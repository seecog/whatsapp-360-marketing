// src/controllers/document.controller.js
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import { Op } from 'sequelize';

import Employee from '../models/Employee.js';
import DocumentType from '../models/DocumentType.js';
import { generatePdfFromTemplate } from '../utils/generatePdfFromTemplate.js';
import {Designation} from '../models/Designation.js';
import EmployeeDocument from '../models/EmployeeDocument.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ------------------------------------------------------------------
✉️ Nodemailer setup (all email logic lives in this file now)
------------------------------------------------------------------ */
const mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    secure: process.env.SMTP_SECURE === 'true', // 'true' for 465, false for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
console.log('Mailer configured:', mailTransporter.options);

/**
 * Send a simple notification email that a document has been generated.
 * No attachment is sent.
 */
async function sendSimpleDocumentEmail({ to, cc, subject, html }) {
    if (!to) {
        console.warn('sendSimpleDocumentEmail called without "to" address.');
        return false;
    }

    try {
        const info = await mailTransporter.sendMail({
            from: process.env.MAIL_FROM || process.env.SMTP_USER,
            to,
            cc,
            subject,
            html,
        });
        console.log('Document email sent. MessageId:', info.messageId);
        return true;
    } catch (err) {
        console.error('Error sending document email:', err);
        return false;
    }
}

// Helper: calculate total days + Sundays + working days (Sunday is weekly off)
function getMonthWorkingMeta(dateObj) {
    if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
        return { totalDays: 0, sundays: 0, workingDays: 0 };
    }

    const year = dateObj.getFullYear();
    const monthIndex = dateObj.getMonth(); // 0-11

    const totalDays = new Date(year, monthIndex + 1, 0).getDate();

    let sundays = 0;
    for (let day = 1; day <= totalDays; day++) {
        const dow = new Date(year, monthIndex, day).getDay(); // 0 = Sunday
        if (dow === 0) sundays++;
    }

    const workingDays = Math.max(0, totalDays - sundays);
    return { totalDays, sundays, workingDays };
}


/* ------------------------------------------------------------------
   🔢 Convert number to Indian currency words (Rupees Only)
------------------------------------------------------------------ */
function numberToIndianWords(amount) {
    if (amount == null) return '';

    let num = Math.round(Number(amount));
    if (isNaN(num)) return '';

    if (num === 0) return 'Zero Rupees Only';

    const ones = [
        '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six',
        'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve',
        'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
        'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const tens = [
        '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
        'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];

    function twoDigit(n) {
        if (n < 20) return ones[n];
        const t = Math.floor(n / 10);
        const o = n % 10;
        return tens[t] + (o ? ' ' + ones[o] : '');
    }

    function threeDigit(n) {
        let str = '';
        const hundred = Math.floor(n / 100);
        const rest = n % 100;

        if (hundred) {
            str += ones[hundred] + ' Hundred';
            if (rest) str += ' and ';
        }
        if (rest) {
            str += twoDigit(rest);
        }
        return str;
    }

    let resultParts = [];

    const crore = Math.floor(num / 10000000);
    if (crore) {
        resultParts.push(threeDigit(crore) + ' Crore');
        num = num % 10000000;
    }

    const lakh = Math.floor(num / 100000);
    if (lakh) {
        resultParts.push(threeDigit(lakh) + ' Lakh');
        num = num % 100000;
    }

    const thousand = Math.floor(num / 1000);
    if (thousand) {
        resultParts.push(threeDigit(thousand) + ' Thousand');
        num = num % 1000;
    }

    const hundredAndBelow = num;
    if (hundredAndBelow) {
        resultParts.push(threeDigit(hundredAndBelow));
    }

    const words = resultParts.join(' ') + ' Rupees Only';
    return words;
}

/* ------------------------------------------------------------------
   📅 Date helpers
------------------------------------------------------------------ */
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

// Helper: Month YYYY (for salary slip month label)
function formatMonthYear(value) {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Display date helper for letters (e.g., "02 June 2025")
 */
function formatDateDisplay(value) {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) {
        return String(value);
    }
    const day = String(d.getDate()).padStart(2, '0');
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = monthNames[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${monthName} ${year}`;
}

/**
 * Indian-style currency formatting with commas, 2 decimals.
 * e.g. 5000 -> "5,000.00", 96000 -> "96,000.00"
 */
function formatIndianCurrency(amount) {
    if (amount == null || isNaN(Number(amount))) {
        return '0.00';
    }
    const fixed = Number(amount).toFixed(2); // "5000.00"
    const [intPart, decPart] = fixed.split('.');
    let lastThree = intPart.slice(-3);
    let other = intPart.slice(0, -3);

    if (other !== '') {
        other = other.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
        return other + ',' + lastThree + '.' + decPart;
    }
    return lastThree + '.' + decPart;
}

/**
 * Add months to a date (calendar-safe), used for 6-month internship end date.
 */
function addMonths(dateInput, months) {
    if (!dateInput) return null;
    const d = dateInput instanceof Date ? new Date(dateInput.getTime()) : new Date(dateInput);
    if (isNaN(d.getTime())) return null;

    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();

    const result = new Date(year, month + months, day);

    // If day overflowed (e.g., 31st → next month), snap to last day of previous month
    if (result.getDate() !== day) {
        result.setDate(0);
    }

    return result;
}

/* ------------------------------------------------------------------
   💸 Salary breakup helper (using empCtc)
------------------------------------------------------------------ */
function generateSalaryBreakup(annualGrossCtc, options = {}) {
    const {
        variablePayPct = 0,
        basicPctOfFixedGross = 0.40,
        hraPctOfBasic = 0.40,

        // Professional tax setup
        monthlyProfessionalTax = 200,
        professionalTaxThresholdMonthly = 25000,

        // Indian payroll-style rules
        pfPctOfBasic = 0,
        esiPctOfGross = 0,
        esiWageThresholdMonthly = 21000,
        standardDeductionAnnual = 50000
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
                pfEmployee: 0,
                esiEmployee: 0,
                incomeTaxTds: 0,
                totalDeductions: 0,
            },
            netTakeHome: {
                withoutVariable: 0,
                withVariableAveraged: 0,
            },
        };
    }

    const monthlyCtc = toMonthly(annualGrossCtc);

    const variablePayAnnual = annualGrossCtc * variablePayPct;
    const fixedGrossAnnual = annualGrossCtc - variablePayAnnual;

    const basicAnnual = fixedGrossAnnual * basicPctOfFixedGross;
    const hraAnnual = basicAnnual * hraPctOfBasic;
    const specialAllowanceAnnual = fixedGrossAnnual - basicAnnual - hraAnnual;

    const basicMonthly = toMonthly(basicAnnual);
    const hraMonthly = toMonthly(hraAnnual);
    const specialAllowanceMonthly = toMonthly(specialAllowanceAnnual);
    const fixedGrossMonthly = toMonthly(fixedGrossAnnual);
    const variablePayMonthlyTarget = toMonthly(variablePayAnnual);

    const professionalTaxMonthly =
        monthlyCtc >= professionalTaxThresholdMonthly
            ? monthlyProfessionalTax
            : 0;

    const pfMonthly = basicMonthly * pfPctOfBasic;

    const esiMonthly =
        fixedGrossMonthly <= esiWageThresholdMonthly
            ? fixedGrossMonthly * esiPctOfGross
            : 0;

    const taxableIncomeAnnual = Math.max(
        0,
        annualGrossCtc - standardDeductionAnnual
    );

    let taxAnnual = 0;
    if (taxableIncomeAnnual <= 250000) {
        taxAnnual = 0;
    } else if (taxableIncomeAnnual <= 500000) {
        taxAnnual = (taxableIncomeAnnual - 250000) * 0.05;
    } else if (taxableIncomeAnnual <= 1000000) {
        taxAnnual =
            250000 * 0.05 + (taxableIncomeAnnual - 500000) * 0.20;
    } else {
        taxAnnual =
            250000 * 0.05 +
            500000 * 0.20 +
            (taxableIncomeAnnual - 1000000) * 0.30;
    }
    const incomeTaxMonthly = taxAnnual / 12;

    const totalDeductionsMonthly =
        professionalTaxMonthly + pfMonthly + esiMonthly + incomeTaxMonthly;

    const netTakeHomeMonthlyWithoutVariable =
        fixedGrossMonthly - totalDeductionsMonthly;

    const netTakeHomeMonthlyWithVariable =
        fixedGrossMonthly +
        variablePayMonthlyTarget -
        totalDeductionsMonthly;

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
            professionalTax: round(professionalTaxMonthly),
            pfEmployee: round(pfMonthly),
            esiEmployee: round(esiMonthly),
            incomeTaxTds: round(incomeTaxMonthly),
            totalDeductions: round(totalDeductionsMonthly),
        },
        netTakeHome: {
            withoutVariable: round(netTakeHomeMonthlyWithoutVariable),
            withVariableAveraged: round(netTakeHomeMonthlyWithVariable),
        },
    };
}

/* ------------------------------------------------------------------
   Render documents page
------------------------------------------------------------------ */
export const renderDocumentsPage = async (req, res, next) => {
    try {
        const employees = await Employee.findAll({
            order: [['empName', 'ASC']],
        });

        const documentTypes = await DocumentType.findAll({
            where: { isDeleted: false },
            order: [['name', 'ASC']],
        });

        // ✅ Add prefill fields for Internship Offer dates (YYYY-MM-DD) per employee
        const employeesPlain = employees.map((e) => {
            const emp = e.get({ plain: true });

            const startRaw =
                emp.internshipStartDate ||
                emp.internship_start_date ||
                emp.internStartDate ||
                emp.empInternStartDate ||
                null;

            const offerRaw =
                emp.internshipOfferDate ||
                emp.internship_offer_date ||
                emp.internOfferDate ||
                null;

            return {
                ...emp,
                internshipStartDatePrefill: formatDate(startRaw),
                internshipOfferDatePrefill: formatDate(offerRaw),
            };
        });

        const documentTypesPlain = documentTypes.map((d) =>
            d.get({ plain: true })
        );

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


/* ------------------------------------------------------------------
   Generate document + PDF + save + send email
------------------------------------------------------------------ */
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

        /* --------------------------------------------------------------
           Document-specific branches
        -------------------------------------------------------------- */

        // 🔹 Internship Completion Certificate
        if (code === 'INTERNSHIP_CERT' || code === 'INTERNSHIP_CERTIFICATE') {
            const now = new Date();

            const INTERN_NAME = employee.empName || '';

            // ✅ ROLE from DB internship_designation (with safe fallbacks)
            const INTERNSHIP_ROLE =
                employee.internship_designation ||
                employee.internshipDesignation ||
                employee.internRole ||
                employee.empDesignation ||
                'Intern';

            const DEPARTMENT_NAME =
                employee.empDepartment ||
                employee.departmentName ||
                'Internship Department';

            // ✅ START/END from DB internship_start_date / internship_end_date (with fallbacks)
            const startDateRaw =
                employee.internship_start_date ||
                employee.internshipStartDate ||
                employee.internStartDate ||
                employee.empInternStartDate ||
                employee.empDoj ||
                employee.empDateOfJoining ||
                null;

            let endDateRaw =
                employee.internship_end_date ||
                employee.internshipEndDate ||
                employee.internEndDate ||
                employee.empInternEndDate ||
                employee.internCompletionDate ||
                null;

            const startDateObj = startDateRaw ? new Date(startDateRaw) : null;
            let endDateObj = endDateRaw ? new Date(endDateRaw) : null;

            // ✅ If end date missing, auto = 6 months from start
            if (
                (!endDateObj || isNaN(endDateObj.getTime())) &&
                startDateObj &&
                !isNaN(startDateObj.getTime())
            ) {
                endDateObj = addMonths(startDateObj, 6);
                endDateRaw = endDateObj;
            }

            // ✅ INTERNSHIP_DURATION (default 6 months; calculate if dates exist)
            let INTERNSHIP_DURATION = '6 months';
            if (
                startDateObj &&
                endDateObj &&
                !isNaN(startDateObj.getTime()) &&
                !isNaN(endDateObj.getTime()) &&
                endDateObj >= startDateObj
            ) {
                const diffMs = endDateObj - startDateObj;
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const monthsCount = Math.max(1, Math.round(diffDays / 30));
                INTERNSHIP_DURATION = `${monthsCount} months`;
            }

            // ✅ INTERNSHIP_DOMAIN:
            // Default fallback (old behavior) + NEW: fetch from designations.metaData.work_profile
            let INTERNSHIP_DOMAIN =
                employee.internDomain ||
                employee.internProjectDomain ||
                'Software Development';

            try {
                // We will match Designation by name = employee's internship role / designation text
                const desigName = String(INTERNSHIP_ROLE || employee.empDesignation || '').trim();

                if (desigName) {
                    const where = { name: desigName };

                    // Optional tenant filter if you have businessId on employee (safe, won't break if undefined)
                    const empBusinessId = employee.businessId || employee.business_id;
                    if (empBusinessId != null) where.businessId = empBusinessId;

                    const desigRow = await Designation.findOne({
                        where,
                        attributes: ['id', 'name', 'metaData'],
                    });

                    if (desigRow && desigRow.metaData) {
                        const md = desigRow.metaData;
                        const metaObj =
                            typeof md === 'string'
                                ? (() => {
                                    try { return JSON.parse(md); } catch { return null; }
                                })()
                                : md;

                        const workProfile =
                            metaObj?.work_profile ||
                            metaObj?.workProfile ||
                            '';

                        if (workProfile && String(workProfile).trim()) {
                            // ✅ Set domain from designation metaData.work_profile
                            INTERNSHIP_DOMAIN = String(workProfile).trim();
                        }
                    }
                }
            } catch (e) {
                console.warn('Unable to read designations.metaData.work_profile:', e?.message || e);
            }

            const PERFORMANCE_SUMMARY =
                employee.internPerformanceSummary ||
                employee.internRatingText ||
                'Good';

            const ISSUE_DATE_DISPLAY = formatDateDisplay(now);
            const ISSUE_PLACE =
                employee.empWorkLoc ||
                employee.workLocation ||
                'Bengaluru, Karnataka';

            const todayStr = now.toISOString().slice(0, 10).replace(/-/g, '');
            const CERTIFICATE_NO = `INT-${employee.empId || employee.id}-${todayStr}`;

            const SUPERVISOR_NAME =
                employee.supervisorName ||
                employee.internSupervisorName ||
                'Supervisor';

            const SUPERVISOR_DESIGNATION =
                employee.supervisorDesignation ||
                employee.internSupervisorDesignation ||
                'Supervisor';

            // ✅ Use display format because your HTML prints START_DATE / END_DATE directly
            const START_DATE_DISPLAY = startDateObj
                ? formatDateDisplay(startDateObj)
                : formatDateDisplay(startDateRaw);

            const END_DATE_DISPLAY = endDateObj
                ? formatDateDisplay(endDateObj)
                : formatDateDisplay(endDateRaw);

            templateData = {
                ...templateData,
                CERTIFICATE_NO,
                ISSUE_DATE: ISSUE_DATE_DISPLAY,
                ISSUE_PLACE,

                INTERN_NAME,
                INTERNSHIP_ROLE,
                DEPARTMENT_NAME,

                START_DATE: START_DATE_DISPLAY,
                END_DATE: END_DATE_DISPLAY,
                INTERNSHIP_DURATION,

                // ✅ Now coming from designation.metaData.work_profile (if present)
                INTERNSHIP_DOMAIN,
                PERFORMANCE_SUMMARY,

                SUPERVISOR_NAME,
                SUPERVISOR_DESIGNATION,
            };
        }

        else if (code === 'SALARY_SLIP') {
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

            const professionalTaxMonthlyBase = breakup.deductionsMonthly.professionalTax;
            const pfMonthly = breakup.deductionsMonthly.pfEmployee;
            const esiMonthly = breakup.deductionsMonthly.esiEmployee;
            const incomeTaxMonthly = breakup.deductionsMonthly.incomeTaxTds;

            const monthInputRaw =
                (req.body.salaryMonth || req.body.SALARY_MONTH || '').trim();
            let slipDateObj = null;

            if (monthInputRaw) {
                const monthNames = [
                    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
                    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
                ];

                let monthIndex = -1;

                const numMatch = /^(\d{1,2})$/.exec(monthInputRaw);
                if (numMatch) {
                    const m = Number(numMatch[1]);
                    if (m >= 1 && m <= 12) monthIndex = m - 1;
                } else {
                    const upper = monthInputRaw.toUpperCase();
                    monthIndex = monthNames.indexOf(upper);

                    if (monthIndex === -1) {
                        const shortNames = monthNames.map((n) => n.slice(0, 3));
                        const shortIndex = shortNames.indexOf(upper.slice(0, 3));
                        if (shortIndex !== -1) monthIndex = shortIndex;
                    }
                }

                if (monthIndex >= 0 && monthIndex <= 11) {
                    const today = new Date();
                    const currentYear = today.getFullYear();
                    const currentMonthIndex = today.getMonth();

                    let yearForSlip;
                    if (monthIndex <= currentMonthIndex) {
                        yearForSlip = currentYear;
                    } else {
                        yearForSlip = currentYear - 1;
                    }

                    slipDateObj = new Date(yearForSlip, monthIndex + 1, 0);
                }
            }

            if (!slipDateObj || isNaN(slipDateObj)) {
                const today = new Date();
                slipDateObj = new Date(
                    today.getFullYear(),
                    today.getMonth() + 1,
                    0
                );
            }

            // ✅ Working days (Sunday is weekly off)
            const { workingDays } = getMonthWorkingMeta(slipDateObj);
            const WORK_DAYS = workingDays;

            // ✅ Non Paid Leave from UI (0..28), capped to working days
            const nonPaidLeaveRaw =
                req.body.nonPaidLeave ||
                req.body.NON_PAID_LEAVE ||
                req.body.non_paid_leave ||
                0;

            let NON_PAID_LEAVE = Number(nonPaidLeaveRaw);
            if (isNaN(NON_PAID_LEAVE) || NON_PAID_LEAVE < 0) NON_PAID_LEAVE = 0;
            if (NON_PAID_LEAVE > 28) NON_PAID_LEAVE = 28;
            if (WORK_DAYS > 0 && NON_PAID_LEAVE > WORK_DAYS) NON_PAID_LEAVE = WORK_DAYS;

            const DAYS_PAID = Math.max(0, WORK_DAYS - NON_PAID_LEAVE);

            // ✅ Earned salary factor
            const prorationFactor = WORK_DAYS > 0 ? (DAYS_PAID / WORK_DAYS) : 0;

            // ✅ Earned components (after LOP)
            const basicEarned = basicMonthly * prorationFactor;
            const hraEarned = hraMonthly * prorationFactor;
            const specialEarned = specialMonthly * prorationFactor;
            const fixedGrossEarned = fixedGrossMonthly * prorationFactor;

            // ✅ LOP deduction (so you can SHOW it in salary slip)
            const LOP_DEDUCTION = Math.max(0, fixedGrossMonthly - fixedGrossEarned);

            const reimbursementRaw =
                req.body.reimbursement ||
                req.body.REIMBURSEMENT ||
                req.body.reimbursementAmount ||
                0;

            const reimbursement = Number(reimbursementRaw) || 0;

            // ✅ Total Earnings: show Actual (full) vs Earned (after LOP)
            const totalEarningsActualMonthly = fixedGrossMonthly + reimbursement;
            const totalEarningsEarnedMonthly = fixedGrossEarned + reimbursement;

            // Keep original deductions (same as your system), add LOP as deduction
            const professionalTaxMonthly = professionalTaxMonthlyBase;
            const totalDeductionsMonthly =
                professionalTaxMonthly + pfMonthly + esiMonthly + incomeTaxMonthly + LOP_DEDUCTION;

            const netMonthly = totalEarningsActualMonthly - totalDeductionsMonthly;

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

            const uan =
                employee.uan ||
                employee.empUan ||
                '';

            const pfNumber =
                employee.pfNumber ||
                employee.empPfNumber ||
                '';

            const esiNumber =
                employee.esiNumber ||
                employee.empEsiNumber ||
                '';

            // ✅ PAN: employees table first, else employee_documents table
            let PAN_NUMBER = String(
                employee.empPan ||
                employee.empPAN ||
                employee.pan ||
                employee.panNumber ||
                employee.emp_pan ||
                employee.PAN ||
                ''
            ).trim();

            // Treat these as "empty"
            const isPanMissing =
                !PAN_NUMBER || PAN_NUMBER === '--' || PAN_NUMBER.toUpperCase() === 'NA';

            if (isPanMissing) {
                try {
                    const panDoc = await EmployeeDocument.findOne({
                        where: {
                            employeeId: employee.id,
                            [Op.or]: [
                                { category: 'PAN' },
                                { documentType: { [Op.like]: '%pan%' } },
                            ],
                        },
                        order: [
                            ['updatedAt', 'DESC'],
                            ['createdAt', 'DESC'],
                            ['id', 'DESC'],
                        ],
                    });

                    if (panDoc) {
                        const fromDoc = String(panDoc.documentNumber || '').trim();
                        if (fromDoc) PAN_NUMBER = fromDoc;
                    }
                } catch (e) {
                    console.warn('PAN fetch failed from employee_documents:', e?.message || e);
                }
            }

            templateData = {
                ...templateData,
                Month: formatMonthYear(slipDateObj) || 'Salary Month',
                SALARY_SLIP_DATE: formatDate(slipDateObj),

                // used for email subject/body
                EMAIL_MONTH_YEAR: formatMonthYear(slipDateObj),

                EMP_CODE: employee.empId || employee.id,
                DOB: formatDate(employee.empDob),
                DOJ: formatDate(employee.empDateOfJoining || employee.empDoj),

                // ✅ PAN in PDF
                PAN: PAN_NUMBER || 'NA',

                // ✅ Auto-calculated based on month (Sunday weekly off) + non-paid leave
                DAYS_PAID: DAYS_PAID,
                WORK_DAYS: WORK_DAYS,
                NON_PAID_LEAVE: NON_PAID_LEAVE,

                BANK_NAME: bankName,
                BANK_ACCOUNT_LAST4,
                UAN: uan,
                PF_NUMBER: pfNumber,
                ESI_NUMBER: esiNumber,

                // ✅ Actual vs Earned amounts
                BASIC_ACTUAL: basicMonthly.toFixed(2),
                HRA_ACTUAL: hraMonthly.toFixed(2),
                SPECIAL_ACTUAL: specialMonthly.toFixed(2),

                BASIC_EARNED: basicEarned.toFixed(2),
                HRA_EARNED: hraEarned.toFixed(2),
                SPECIAL_EARNED: specialEarned.toFixed(2),

                REIMBURSEMENT: reimbursement.toFixed(2),

                PF: pfMonthly.toFixed(2),
                ESI: esiMonthly.toFixed(2),
                TDS: incomeTaxMonthly.toFixed(2),
                PROFESSIONAL_TAX: professionalTaxMonthly.toFixed(2),

                // ✅ New deduction line item
                LOP_DEDUCTION: LOP_DEDUCTION.toFixed(2),

                TOTAL_EARNINGS_ACTUAL: totalEarningsActualMonthly.toFixed(2),
                TOTAL_EARNINGS_EARNED: totalEarningsEarnedMonthly.toFixed(2),

                TOTAL_DEDUCTIONS: totalDeductionsMonthly.toFixed(2),
                NET_SALARY: netMonthly.toFixed(2),

                // Backward-safe fields
                BASIC: basicEarned.toFixed(2),
                HRA: hraEarned.toFixed(2),
                SPECIAL: specialEarned.toFixed(2),
                TOTAL_EARNINGS: totalEarningsEarnedMonthly.toFixed(2),
            };
        }

        else if (code === 'OFFER_LETTER') {

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
            const pfMonthly = breakup.deductionsMonthly.pfEmployee;
            const esiMonthly = breakup.deductionsMonthly.esiEmployee;
            const incomeTaxMonthly = breakup.deductionsMonthly.incomeTaxTds;

            const totalDeductionsMonthly =
                professionalTaxMonthly + pfMonthly + esiMonthly + incomeTaxMonthly;
            const totalDeductionsAnnual =
                totalDeductionsMonthly * 12;

            const netMonthly =
                grossMonthFixed - totalDeductionsMonthly;

            const joiningDateRaw =
                req.body.joiningDate ||
                req.body.JOINING_DATE ||
                employee.empDoj ||
                employee.empDateOfJoining;

            const ctcInWordsAuto = numberToIndianWords(ctcAnnual);

            templateData = {
                ...templateData,
                OFFER_DATE: formatDate(new Date()),
                JOINING_DATE: formatDate(joiningDateRaw),
                CTC: ctcAnnual.toFixed(2),
                CTC_IN_WORDS: ctcInWordsAuto,
                BASIC_MONTH: basicMonthly.toFixed(2),
                BASIC_ANNUAL: basicAnnual.toFixed(2),
                HRA_MONTH: hraMonthly.toFixed(2),
                HRA_ANNUAL: hraAnnual.toFixed(2),
                SPECIAL_ALLOWANCE_MONTH: specialMonthly.toFixed(2),
                SPECIAL_ALLOWANCE_ANNUAL: specialAnnual.toFixed(2),
                GROSS_MONTH: grossMonthFixed.toFixed(2),
                GROSS_ANNUAL: grossAnnualFixed.toFixed(2),
                NET_PAY: netMonthly.toFixed(2),

                offerDate: formatDate(new Date()),
                joiningDate: formatDate(joiningDateRaw),
                fullName: employee.empName,
                designation: employee.empDesignation || '',
                ctc: ctcAnnual.toFixed(2),
                ctcInWords: ctcInWordsAuto,
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
                variableMonthlyTarget:
                    breakup.monthly.variablePayTarget.toFixed(2),

                professionalTaxMonthly:
                    professionalTaxMonthly.toFixed(2),
                pfEmployeeMonth: pfMonthly.toFixed(2),
                esiEmployeeMonth: esiMonthly.toFixed(2),
                incomeTaxMonthly: incomeTaxMonthly.toFixed(2),
                totalDeductionsMonthly:
                    totalDeductionsMonthly.toFixed(2),
                totalDeductionsAnnual:
                    totalDeductionsAnnual.toFixed(2),
            };

            // 🔹 Bonus Letter
        } else if (code === 'BONUS_LETTER' || code === 'BONUS') {
            const rawBonusAmount =
                req.body.bonusAmount ||
                req.body.BONUS_AMOUNT ||
                employee.empBonusAmount ||
                0;

            const BONUS_AMOUNT_NUMERIC = Number(rawBonusAmount) || 0;
            const BONUS_AMOUNT_DISPLAY = formatIndianCurrency(BONUS_AMOUNT_NUMERIC);

            let BONUS_IN_WORDS =
                req.body.bonusInWords ||
                req.body.BONUS_IN_WORDS ||
                employee.empBonusInWords ||
                '';

            // Auto-generate "Six Thousand" style words if not provided
            if (!BONUS_IN_WORDS && BONUS_AMOUNT_NUMERIC > 0) {
                const full = numberToIndianWords(BONUS_AMOUNT_NUMERIC); // "Six Thousand Rupees Only"
                BONUS_IN_WORDS = full
                    .replace(/ Rupees Only$/i, '')
                    .replace(/ Rupees$/i, '')
                    .trim();
            }

            const creditDateRaw =
                req.body.creditDate ||
                req.body.CREDIT_DATE ||
                new Date();

            templateData = {
                ...templateData,
                DATE: formatDateDisplay(new Date()),
                EMP_ID: employee.empId || employee.id,
                EMP_NAME: employee.empName,
                DESIGNATION: employee.empDesignation || '',
                BONUS_AMOUNT: BONUS_AMOUNT_DISPLAY,
                BONUS_IN_WORDS,
                CREDIT_DATE: formatDateDisplay(creditDateRaw),
            };

            // 🔹 Relieving & Experience Letter
        } else if (
            code === 'RELIEVING' ||
            code === 'RELIEVING_LETTER' ||
            code === 'RELIEVING_EXPERIENCE'
        ) {
            const periodFrom =
                employee.empDoj || employee.empDateOfJoining;
            const periodTo =
                employee.empRelievingDate ||
                employee.empLastWorkingDay ||
                employee.empSeparationDate ||
                new Date();

            // ✅ Use display format (e.g., "02 June 2025") for the letter
            templateData = {
                ...templateData,
                PERIOD_FROM: formatDateDisplay(periodFrom),
                PERIOD_TO: formatDateDisplay(periodTo),
                RELIEVING_DATE: formatDateDisplay(periodTo),
            };

            // 🔹 Internship Offer Letter
        } else if (
            code === 'INTERNSHIP_OFFER' ||
            code === 'INTERN_OFFER' ||
            code === 'INTERNSHIP_OFFER_LETTER'
        ) {
            // Prefer UI Internship Start Date, then DB internship_start_date, then older fallbacks
            const internshipStartFromBody =
                req.body.internshipStartDate ||
                req.body.INTERNSHIP_START_DATE ||
                null;

            const startDateRaw =
                internshipStartFromBody ||
                employee.internshipStartDate ||
                employee.internship_start_date ||
                employee.internStartDate ||
                employee.empInternStartDate ||
                employee.empDoj ||
                employee.empDateOfJoining ||
                null;

            // Internship Offer Date: UI first, then DB, then today
            const internshipOfferDateFromBody =
                req.body.internshipOfferDate ||
                req.body.INTERNSHIP_OFFER_DATE ||
                null;

            const offerDateRaw =
                internshipOfferDateFromBody ||
                employee.internshipOfferDate ||
                employee.internship_offer_date ||
                null;

            let endDateRaw =
                employee.internshipEndDate ||
                employee.internship_end_date ||
                employee.internEndDate ||
                employee.empInternEndDate ||
                null;

            const startDateObj = startDateRaw ? new Date(startDateRaw) : null;
            let endDateObj = endDateRaw ? new Date(endDateRaw) : null;

            // Auto-set end date = 6 months from Internship Start if not provided
            if (
                (!endDateObj || isNaN(endDateObj.getTime())) &&
                startDateObj &&
                !isNaN(startDateObj.getTime())
            ) {
                endDateObj = addMonths(startDateObj, 6);
                endDateRaw = endDateObj;
            }

            // 🔸 SAVE Internship Start / Offer Date + End Date + Designation into employees table
            try {
                if (startDateRaw) {
                    const dbStartDate =
                        startDateObj && !isNaN(startDateObj.getTime())
                            ? startDateObj
                            : new Date(startDateRaw);

                    if (!isNaN(dbStartDate.getTime())) {
                        employee.internship_start_date = dbStartDate;
                        employee.internshipStartDate = dbStartDate;
                    }
                }

                if (offerDateRaw || internshipOfferDateFromBody) {
                    const offerDateObj = offerDateRaw ? new Date(offerDateRaw) : new Date();
                    if (!isNaN(offerDateObj.getTime())) {
                        employee.internship_offer_date = offerDateObj;
                        employee.internshipOfferDate = offerDateObj;
                    }
                }

                // ✅ Save internship end date (calculated or existing)
                if (endDateObj && !isNaN(endDateObj.getTime())) {
                    employee.internship_end_date = endDateObj;
                    employee.internshipEndDate = endDateObj;
                }

                // ✅ Only update internship_designation if it's blank/empty
                const currentInternDesig = (employee.internship_designation || '').trim();
                if (!currentInternDesig) {
                    const empDesig = (employee.empDesignation || '').trim();
                    if (empDesig) {
                        employee.internship_designation = empDesig;
                        employee.internshipDesignation = empDesig; // keep camelCase in sync if your model has it
                    }
                }

                await employee.save();
                console.log(
                    `Internship fields updated for employee ${employee.id}: start=${employee.internship_start_date}, offer=${employee.internship_offer_date}, end=${employee.internship_end_date}, internship_designation=${employee.internship_designation}`
                );
            } catch (saveErr) {
                console.error(
                    'Error saving internship_start_date / internship_offer_date / internship_end_date / internship_designation for employee:',
                    saveErr
                );
            }

            let numberOfMonthsText = employee.internMonths;

            if (
                !numberOfMonthsText &&
                startDateObj &&
                endDateObj &&
                !isNaN(startDateObj.getTime()) &&
                !isNaN(endDateObj.getTime()) &&
                endDateObj > startDateObj
            ) {
                const diffMs = endDateObj - startDateObj;
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                const monthsCount = Math.max(1, Math.round(diffDays / 30));
                numberOfMonthsText = `${monthsCount} months`;
            }

            const stipendAmountRaw = employee.internStipend || employee.empStipend || 0;
            let monthlyStipend = Number(stipendAmountRaw) || 0;

            // fallback: if not specifically set, derive from CTC
            if (!monthlyStipend && employee.empCtc) {
                monthlyStipend = Number(employee.empCtc) / 12;
            }

            let stipendWords = '';
            if (monthlyStipend > 0) {
                const full = numberToIndianWords(monthlyStipend); // "Five Thousand Rupees Only"
                stipendWords = full
                    .replace(/ Rupees Only$/i, '')
                    .replace(/ Rupees$/i, '')
                    .trim();
            }

            // ✅ Decide paid vs unpaid internship text
            const isPaidInternship = monthlyStipend > 0;

            let stipendText1 = '';
            let stipendText2 = '';

            if (isPaidInternship) {
                stipendText1 = `You will be paid a monthly stipend of ₹${monthlyStipend.toFixed(
                    2
                )} (Rupees ${stipendWords} only), subject to satisfactory attendance and performance.`;
                stipendText2 =
                    'The stipend will be paid on a monthly basis, after the end of each month, directly to your bank account, subject to applicable deductions, if any.';
            } else {
                stipendText1 =
                    'This is an unpaid internship for learning and training purposes. You will not be paid any stipend for this internship.';
                stipendText2 =
                    'All other terms and conditions of the internship will remain as described in this letter.';
            }

            const supervisorName = employee.supervisorName || 'Mukesh Kumhar';
            const supervisorDesignation =
                employee.supervisorDesignation || 'Reporting Manager';

            // Display-friendly dates
            const startDateDisplay = startDateObj
                ? formatDateDisplay(startDateObj)
                : formatDateDisplay(startDateRaw);

            const endDateDisplay = endDateObj
                ? formatDateDisplay(endDateObj)
                : formatDateDisplay(endDateRaw);

            const letterDateObj = offerDateRaw ? new Date(offerDateRaw) : new Date();
            const letterDateDisplay = formatDateDisplay(letterDateObj);

            templateData = {
                ...templateData,
                FullName: employee.empName,
                designation: employee.empDesignation || '',
                Designation: employee.empDesignation || '',

                // Raw ISO-style dates
                StartDate: formatDate(startDateRaw),
                EndDate: formatDate(endDateRaw),

                // Display-friendly dates for the template
                StartDateDisplay: startDateDisplay,
                EndDateDisplay: endDateDisplay,
                LetterDate: letterDateDisplay,
                INTERNSHIP_OFFER_DATE: formatDate(letterDateObj),

                NumberofMonths: numberOfMonthsText || '',
                DepartmentName: employee.empDepartment || '',
                SupervisorName: supervisorName,
                SupervisorDesignation: supervisorDesignation,
                WorkingHours: employee.workingHours || '10:00 AM to 6:00 PM',

                // Amount fields (for paid internships; blank for unpaid)
                Amount: isPaidInternship ? monthlyStipend.toFixed(2) : '',
                AmountinWords: isPaidInternship ? stipendWords : '',

                // New dynamic stipend text used in HTML template
                StipendText1: stipendText1,
                StipendText2: stipendText2,
            };
        }
 else if (
            code === 'PPO' ||
            code === 'PPO_LETTER' ||
            code === 'PPO_OFFER' ||
            code === 'PRE_PLACEMENT_OFFER'
        ) {
            // ------------------------------
            // ✅ PPO: pull JoiningDate + Internship fields from DB
            // ✅ IssueDate = current date
            // ✅ PPO_REF_NO = generated
            // ------------------------------

            const now = new Date();

            const ctcAnnual = Number(
                employee.empCtc ||
                employee.ctcAnnual ||
                employee.ctc ||
                0
            );
            const breakup = generateSalaryBreakup(ctcAnnual);
            const monthlyFixed = breakup.monthly.fixedGross;

            // Joining date for PPO: from DB (employees.empDateOfJoining) by your requirement
            // (fallback to today only if null)
            const joiningDateRaw =
                employee.empDateOfJoining ||
                employee.empDoj ||
                employee.empFullTimeJoiningDate ||
                employee.fullTimeJoiningDate ||
                null;

            const joiningDateFormatted = formatDate(joiningDateRaw || now);

            // Internship fields from DB
            const internshipStartRaw =
                employee.internship_start_date ||
                employee.internshipStartDate ||
                null;

            const internshipEndRaw =
                employee.internship_end_date ||
                employee.internshipEndDate ||
                null;

            const internshipDesignationRaw =
                employee.internship_designation ||
                employee.internshipDesignation ||
                '';

            // Auto-calc internship end date if missing but start exists (optional safety)
            let internshipEndObj = internshipEndRaw ? new Date(internshipEndRaw) : null;
            const internshipStartObj = internshipStartRaw ? new Date(internshipStartRaw) : null;

            if (
                (!internshipEndObj || isNaN(internshipEndObj.getTime())) &&
                internshipStartObj &&
                !isNaN(internshipStartObj.getTime())
            ) {
                internshipEndObj = addMonths(internshipStartObj, 6);
            }

            const internshipStartFormatted = formatDate(internshipStartRaw);
            const internshipEndFormatted = formatDate(
                internshipEndObj && !isNaN(internshipEndObj.getTime())
                    ? internshipEndObj
                    : internshipEndRaw
            );

            // IssueDate: current date (display style used in your HTML meta)
            const issueDateDisplay = formatDateDisplay(now);

            // PPO Ref No (generated)
            const yyyymmdd = formatDate(now).replace(/-/g, '');
            const ppoRefNo = `PPO-${employee.empId || employee.id}-${yyyymmdd}`;

            const ctcInWords = ctcAnnual > 0
                ? numberToIndianWords(ctcAnnual)
                : '';

            const monthlySalaryWords = monthlyFixed > 0
                ? numberToIndianWords(monthlyFixed)
                : '';

            templateData = {
                ...templateData,
                Name: employee.empName,
                'Name': employee.empName,

                // PPO designation should be current empDesignation (since you said PPO designation changes)
                Designation: employee.empDesignation || '',
                'Designation': employee.empDesignation || '',

                EmployeeType:
                    employee.empType ||
                    employee.employeeType ||
                    'Full-time',

                CTC: ctcAnnual.toFixed(2),
                'CTC': ctcAnnual.toFixed(2),
                CTC_IN_WORDS: ctcInWords,

                JoiningDate: joiningDateFormatted,

                MonthlySalary: monthlyFixed.toFixed(2),
                MONTHLY_SALARY_IN_WORDS: monthlySalaryWords,

                // ✅ New fields for PPO HTML
                PPO_REF_NO: ppoRefNo,
                IssueDate: issueDateDisplay,
                InternshipDesignation: internshipDesignationRaw || '',
                InternshipStartDate: internshipStartFormatted,
                InternshipEndDate: internshipEndFormatted,
            };

            // 🔹 Probation Letter
        } else if (code === 'PROBATION_LETTER' || code === 'PROBATION') {
            const joiningRaw =
                employee.empDoj ||
                employee.empDateOfJoining ||
                employee.dateOfJoining ||
                null;

            const joiningDateObj = joiningRaw ? new Date(joiningRaw) : null;

            const probationPeriod =
                employee.probationPeriod ||
                employee.empProbationPeriod ||
                '3 months';

            let probationEndRaw =
                employee.probationEndDate ||
                employee.empProbationEndDate ||
                null;

            if (!probationEndRaw && joiningDateObj && !isNaN(joiningDateObj)) {
                const tmp = new Date(joiningDateObj);
                tmp.setMonth(tmp.getMonth() + 3);
                probationEndRaw = tmp;
            }

            const reportingManagerName =
                employee.reportingManagerName ||
                employee.empReportingManagerName ||
                '';

            const reportingManagerDesignation =
                employee.reportingManagerDesignation ||
                employee.empReportingManagerDesignation ||
                '';

            const workLocation =
                employee.empWorkLoc ||
                employee.workLocation ||
                'Prestige Cube, Site No. 26, Laskar Hosur Road, Adugodi, Koramangala, Bengaluru, Karnataka 560030';

            const workingHours =
                employee.workingHours ||
                '10:00 AM to 6:00 PM';

            templateData = {
                ...templateData,
                LETTER_DATE: formatDateDisplay(new Date()),
                EMP_NAME: employee.empName,
                DESIGNATION: employee.empDesignation || '',
                WORK_LOCATION: workLocation,
                JOINING_DATE: formatDateDisplay(joiningRaw),
                PROBATION_PERIOD: probationPeriod,
                PROBATION_END_DATE: formatDateDisplay(probationEndRaw),
                REPORTING_MANAGER_NAME: reportingManagerName,
                REPORTING_MANAGER_DESIGNATION: reportingManagerDesignation,
                WORKING_HOURS: workingHours,
            };

            // 🔹 Increment Letter
        } else if (code === 'INCREMENT_LETTER' || code === 'INCREMENT') {
            const rawIncrementAmount =
                req.body.incrementAmount ||
                req.body.INCREMENT_AMOUNT ||
                0;

            const INCREMENT_AMOUNT = Number(rawIncrementAmount) || 0;

            const currentAnnualCtc = Number(
                employee.empCtc ||
                employee.ctcAnnual ||
                employee.ctc ||
                0
            );

            const currentMonthly =
                currentAnnualCtc > 0 ? currentAnnualCtc / 12 : 0;
            const revisedMonthly = currentMonthly + INCREMENT_AMOUNT;
            const revisedAnnualCtc = revisedMonthly * 12;

            const effectiveDateRaw =
                employee.empIncrementEffectiveDate ||
                new Date();

            // Indian formatted amounts
            const formattedCurrentMonthly = formatIndianCurrency(currentMonthly);
            const formattedRevisedMonthly = formatIndianCurrency(revisedMonthly);
            const formattedRevisedAnnualCtc = formatIndianCurrency(revisedAnnualCtc);

            // Optional: amounts in words (without trailing "Rupees Only")
            const currentMonthlyWords = numberToIndianWords(currentMonthly)
                .replace(/ Rupees Only$/i, '')
                .trim();
            const revisedMonthlyWords = numberToIndianWords(revisedMonthly)
                .replace(/ Rupees Only$/i, '')
                .trim();
            const revisedAnnualWords = numberToIndianWords(revisedAnnualCtc)
                .replace(/ Rupees Only$/i, '')
                .trim();

            templateData = {
                ...templateData,
                OFFER_DATE: formatDateDisplay(new Date()),
                EMP_NAME: employee.empName,
                DESIGNATION: employee.empDesignation || '',
                EFFECTIVE_DATE: formatDateDisplay(effectiveDateRaw),
                AMOUNT: formattedCurrentMonthly,
                REVISED_AMOUNT: formattedRevisedMonthly,
                REVISED_ANNUAL_CTC: formattedRevisedAnnualCtc,

                // Extra fields if you want to show amount in words in the HTML
                CURRENT_MONTHLY_IN_WORDS: currentMonthlyWords,
                REVISED_MONTHLY_IN_WORDS: revisedMonthlyWords,
                REVISED_ANNUAL_CTC_IN_WORDS: revisedAnnualWords,
            };

            // 🔹 Full & Final
        } else if (
            code === 'FULL_FINAL' ||
            code === 'FULL_FINAL_SETTLEMENT' ||
            code === 'FULL_AND_FINAL' ||
            code === 'FNF_STATEMENT'
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

            const settlementDateRaw =
                req.body.settlementDate ||
                employee.settlementDate ||
                now;

            const SETTLEMENT_PERIOD_LABEL =
                req.body.settlementPeriodLabel ||
                employee.settlementPeriodLabel ||
                'Final Salary Period';

            const num = (v) => Number(v || 0);

            const E_SALARY =
                num(req.body.E_SALARY || employee.fnfSalary);
            const E_LEAVE_ENCASHMENT =
                num(
                    req.body.E_LEAVE_ENCASHMENT ||
                    employee.fnfLeaveEncashment
                );
            const E_BONUS_INCENTIVE =
                num(
                    req.body.E_BONUS_INCENTIVE ||
                    employee.fnfBonusIncentive
                );
            const E_OTHER_EARNINGS =
                num(
                    req.body.E_OTHER_EARNINGS ||
                    employee.fnfOtherEarnings
                );

            const D_NOTICE_RECOVERY =
                num(
                    req.body.D_NOTICE_RECOVERY ||
                    employee.fnfNoticeRecovery
                );
            const D_ADVANCE_RECOVERY =
                num(
                    req.body.D_ADVANCE_RECOVERY ||
                    employee.fnfAdvanceRecovery
                );
            const D_PF_ESI =
                num(req.body.D_PF_ESI || employee.fnfPfEsi);
            const D_TDS_PT =
                num(req.body.D_TDS_PT || employee.fnfTdsPt);
            const D_OTHER_DEDUCTIONS =
                num(
                    req.body.D_OTHER_DEDUCTIONS ||
                    employee.fnfOtherDeductions
                );

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

            const NET_PAYABLE =
                TOTAL_EARNINGS - TOTAL_DEDUCTIONS;

            const NET_PAYABLE_WORDS =
                req.body.NET_PAYABLE_WORDS ||
                employee.fnfNetPayableWords ||
                '';

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

            const yyyymmdd2 =
                formatDate(settlementDateRaw).replace(/-/g, '');
            const SETTLEMENT_REF =
                employee.settlementRef ||
                `FNF-${EMP_ID}-${yyyymmdd2}`;

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

            // 🔹 Resignation Acceptance
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

            const resignationDateRaw =
                employee.empResignationDate ||
                employee.resignationDate ||
                null;

            const lastWorkingDayRaw =
                employee.empLastWorkingDay ||
                employee.empRelievingDate ||
                employee.empSeparationDate ||
                null;

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

            // 🔹 No Dues / Clearance Form
        } else if (
            code === 'NO_DUES' ||
            code === 'NO_DUES_FORM' ||
            code === 'NO_DUES_CLEARANCE'
        ) {
            const now = new Date();

            const lwdRaw =
                employee.empLastWorkingDay ||
                employee.empRelievingDate ||
                employee.empSeparationDate ||
                employee.lastWorkingDay ||
                null;

            const formDateRaw =
                req.body.formDate ||
                employee.noDuesFormDate ||
                now;

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

                EMP_NAME,
                EMP_ID,
                DESIGNATION,
                DEPARTMENT,
                LOCATION,
            };
        }

        /* --------------------------------------------------------------
        ⭐ Generate PDF
        -------------------------------------------------------------- */
        const pdfBuffer = await generatePdfFromTemplate(
            docType.templateHtml,
            templateData
        );

        const fileName = `${docType.code}-${baseData.EMP_ID}.pdf`;

        // 📁 Save PDF into /GeneratedPdf at project root
        let savedPdfPath = null;
        try {
            const generatedPdfDir = path.join(__dirname, '..', '..', 'GeneratedPdf');
            if (!fs.existsSync(generatedPdfDir)) {
                fs.mkdirSync(generatedPdfDir, { recursive: true });
            }

            savedPdfPath = path.join(generatedPdfDir, fileName);
            fs.writeFileSync(savedPdfPath, pdfBuffer);
            console.log('PDF saved at:', savedPdfPath);
        } catch (fileErr) {
            console.error('Error saving generated PDF to disk:', fileErr);
            savedPdfPath = null;
        }

        /* --------------------------------------------------------------
        📧 Send email directly from this controller
        - For ALL document types (no attachment)
        - For SALARY_SLIP: email must succeed, otherwise do NOT download PDF
        -------------------------------------------------------------- */
        let emailSent = true;
        let emailAttempted = false;

        try {
            if (employee.empEmail) {
                const companyName =
                    process.env.COMPANY_NAME || 'Seecog Softwares Pvt. Ltd.';
                const empName = employee.empName || 'Employee';
                const docLabel = docType.name || docType.code || 'Document';

                let subject = `${docLabel} generated for ${empName}`;
                let html = `<p>Dear ${empName},</p>`;

                if (code === 'SALARY_SLIP') {
                    const monthText =
                        templateData.EMAIL_MONTH_YEAR ||
                        templateData.Month ||
                        'this month';
                    subject = `Salary Slip - ${monthText}`;
                    html += `<p>Your salary slip for <strong>${monthText}</strong> has been generated.</p>`;
                } else {
                    html += `<p>Congratulations! We're pleased to extend to you an <strong>${docLabel}</strong> with Seecog Softwares Pvt. Ltd. 🎉</p>`;
                }
                html += `
<p>Please find attached your ${docLabel} for your review and records. This is an automated notification from our HR system confirming that the document has been generated and securely stored in our records.</p>`;

                html += `
<p>We're excited to have you join us and look forward to seeing your contributions and growth during the internship. If you have any questions regarding the offer, joining formalities, or any part of the letter, please feel free to reply to this email—we'll be happy to assist you.</p>
<p>Thanks & Regards<br/>HR Team<br/><br>Contact : 7348820668</br>${companyName}<br>Web : http://seecogsoftwares.com</br><br>T+91 8147614116</br><br></br><br>Prestige Cube, Site No. 26, Laskar Hosur Road, Adugodi, Koramangala, Bengaluru, Karnataka 560030</br><br>Cloud | Mobility | Social Media | Automation | BI/DW | Machine Learning | SaaS | DevOps |HealthcareIT | Salesforce (SFDC) | Azure | Frontend (UI) | Digital Transformation |Software Engineering Services</br></p>
                `;

                emailAttempted = true;
                emailSent = await sendSimpleDocumentEmail({
                    to: employee.empEmail,
                    cc: 'sonam@seecogsoftwares.com', // same as earlier
                    subject,
                    html,
                });

                if (emailSent) {
                    console.log(
                        `Document notification email SENT to ${employee.empEmail} for document type ${docType.code}`
                    );
                } else {
                    console.warn(
                        `Document notification email NOT sent to ${employee.empEmail} for document type ${docType.code}`
                    );
                }
            } else {
                console.log(
                    `Employee ${employee.id} has no email (empEmail), skipping email.`
                );
            }
        } catch (emailErr) {
            emailSent = false;
            console.error('Error sending document email wrapper:', emailErr);
        }

        // 🧷 Special rule: for SALARY_SLIP, only allow download if email was sent successfully
        if (code === 'SALARY_SLIP' && emailAttempted && !emailSent) {
            return res
                .status(500)
                .send('Failed to send salary slip email. PDF not downloaded.');
        }

        /* --------------------------------------------------------------
        Return PDF to browser
        -------------------------------------------------------------- */
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
