// src/models/Employee.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const Employee = sequelize.define(
  'Employee',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // Tenant / owner (your user / business owner)
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },

    // --- Structured name fields ---
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    middleName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    // Display name (for table + search)
    empName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    // --- Personal profile flags ---
    gender: {
      type: DataTypes.ENUM('Male', 'Female', 'Non-binary', 'Prefer not to say'),
      allowNull: true,
    },
    maritalStatus: {
      type: DataTypes.ENUM('Single', 'Married', 'Other'),
      allowNull: true,
    },
    bloodGroup: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    nationality: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    religion: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    casteCategory: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    languagesKnown: {
      // store comma-separated string for now
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Contacts
    empPhone: {
      type: DataTypes.STRING(10),
      allowNull: false,
      validate: {
        len: [10, 10],
        isNumeric: true,
      },
    },
    altPhone: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    empEmail: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },

    // Emergency contact
    emergencyContactName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    emergencyContactRelation: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    emergencyContactNumber: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },

    // Address - present
    presentAddressLine1: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    presentAddressLine2: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    presentCity: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    presentState: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    presentZip: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    presentCountry: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    // Address - permanent
    permanentSameAsPresent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    permanentAddressLine1: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    permanentAddressLine2: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    permanentCity: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    permanentState: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    permanentZip: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    permanentCountry: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    // --- Professional info ---
    empId: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    employeeType: {
      type: DataTypes.ENUM('Permanent', 'Contract', 'Intern', 'Consultant', 'Trainee'),
      allowNull: false,
      defaultValue: 'Permanent',
    },
    empDesignation: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    empDepartment: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    division: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    subDepartment: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    gradeBandLevel: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    reportingManagerId: {
      // FK to Employee.id (optional)
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    empWorkLoc: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    empDateOfJoining: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    probationPeriodMonths: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    confirmationDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    employmentStatus: {
      type: DataTypes.ENUM('Active', 'On Leave', 'Resigned', 'Terminated', 'Retired'),
      allowNull: false,
      defaultValue: 'Active',
    },
    workMode: {
      type: DataTypes.ENUM('On-site', 'Hybrid', 'Remote'),
      allowNull: false,
      defaultValue: 'On-site',
    },

    // --- Personal stats ---
    empDob: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    // --- Compensation ---
    empCtc: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    grossSalaryMonthly: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    basicSalary: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    hra: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    conveyanceAllowance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    medicalAllowance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    specialAllowance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    performanceBonus: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    variablePay: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    overtimeEligible: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    shiftAllowance: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    pfDeduction: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    esiDeduction: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    professionalTax: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    tdsDeduction: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },
    netSalary: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true,
    },

    // --- Attendance & Shift setup ---
    shiftName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    shiftCode: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    shiftStartTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    shiftEndTime: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    totalWorkHours: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
    },
    breakDurationMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    shiftType: {
      type: DataTypes.ENUM('Fixed', 'Rotational', 'Split', 'Flexible'),
      allowNull: true,
    },
    shiftRotationCycle: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    gracePeriodMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    halfDayRuleHours: {
      type: DataTypes.DECIMAL(4, 2),
      allowNull: true,
    },
    shiftEffectiveFrom: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    workTimezone: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    // --- KYC / Compliance core (generic now, Aadhaar/PAN removed) ---
    idProofType: {
      type: DataTypes.ENUM('Aadhaar', 'PAN', 'Passport', 'Driving License', 'Voter ID', 'National ID', 'Other'),
      allowNull: true,
    },
    idProofNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    idVerificationStatus: {
      type: DataTypes.ENUM('Pending', 'Verified', 'Rejected'),
      allowNull: true,
      defaultValue: 'Pending',
    },
    idVerificationDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    idVerifiedBy: {
      type: DataTypes.INTEGER, // HR user id
      allowNull: true,
    },
    idExpiryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    idCountryOfIssue: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    // --- System & Access control ---
    workEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    authMethod: {
      type: DataTypes.ENUM('Password', 'SSO', 'SAML', 'OAuth', 'Other'),
      allowNull: true,
      defaultValue: 'Password',
    },
    mfaEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    accountStatus: {
      type: DataTypes.ENUM('Active', 'Locked', 'Suspended', 'Disabled'),
      allowNull: true,
      defaultValue: 'Active',
    },
    accountCreatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastPasswordResetAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    forcePasswordReset: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    allowedLoginIps: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    biometricEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    passwordPolicyStatus: {
      type: DataTypes.ENUM('Compliant', 'Non-compliant'),
      allowNull: true,
    },
    systemRole: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    internship_start_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    internship_end_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    internship_offer_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    internship_designation: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    // --- Exit details (for offboarding) ---
    exitType: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    resignationDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    exitReason: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    noticePeriodDays: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    noticeServed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    lastWorkingDay: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    exitStatus: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    exitCategory: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'employees',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['userId', 'empId'] },
      { unique: true, fields: ['userId', 'empEmail'] },
      { unique: true, fields: ['userId', 'empPhone'] },
      // Aadhaar/PAN unique indexes removed
      { fields: ['userId', 'isActive'] },
      { fields: ['empDepartment'] },
      { fields: ['empDesignation'] },
    ],
  }
);

// Generate empId + normalize, BEFORE validation runs
Employee.beforeValidate(async (employee) => {
  // Auto-generate empId per user (tenant) if blank
  if (!employee.empId || employee.empId.trim() === '') {
    const count = await Employee.count({
      where: { userId: employee.userId },
    });
    employee.empId = `EMP${String(count + 1).padStart(4, '0')}`;
  }

  // Auto-build empName from first/middle/last if not set
  if (!employee.empName && employee.firstName && employee.lastName) {
    employee.empName = `${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''
      }${employee.lastName}`.trim();
  }

  if (employee.empEmail) {
    employee.empEmail = employee.empEmail.toLowerCase();
  }
});

// Extra safety on every save
Employee.beforeSave((employee) => {
  if (employee.empEmail) {
    employee.empEmail = employee.empEmail.toLowerCase();
  }
});

// Instance methods
Employee.prototype.getAge = function () {
  if (!this.empDob) return null;
  const today = new Date();
  const birthDate = new Date(this.empDob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

Employee.prototype.getExperience = function () {
  if (!this.empDateOfJoining) return null;
  const today = new Date();
  const joinDate = new Date(this.empDateOfJoining);
  let years = today.getFullYear() - joinDate.getFullYear();
  const monthDiff = today.getMonth() - joinDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < joinDate.getDate())) {
    years--;
  }
  return years;
};

export default Employee;
