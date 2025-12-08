// src/models/index.js
import { User } from './User.js';
import { Business } from './Business.js';
import { Customer } from './Customer.js';
import { Template } from './Template.js';
import { Campaign } from './Campaign.js';
import { MessageLog } from './MessageLog.js';
import Employee from './Employee.js';
import { Department } from './Department.js'; // ✅ NEW
import { Service } from './Service.js';
import { Designation } from './Designation.js';
import { LeaveType } from './LeaveType.js';
import { LeaveRequest } from './LeaveRequest.js';
import DocumentType from './DocumentType.js';
import EmailTemplate from './EmailTemplate.js';
// ✅ IMPORT CHILD TABLES FOR EMPLOYEE
import EmployeeEducation from './EmployeeEducation.js';
import EmployeeExperience from './EmployeeExperience.js';
import EmployeeDocument from './EmployeeDocument.js';

/**
 * IMPORTANT:
 * - Business.ownerId is the FK to User (not userId).
 * - Campaign belongs to Business (missing before).
 * - Keep aliases used in controllers: 'business', 'template', etc.
 */

// User ⇄ Business  (Business.ownerId)
User.hasMany(Business, { foreignKey: 'ownerId', as: 'businesses' });
Business.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

// User ⇄ Customer
User.hasMany(Customer, { foreignKey: 'userId', as: 'customers' });
Customer.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Business ⇄ Customer
Business.hasMany(Customer, { foreignKey: 'businessId', as: 'customers' });
Customer.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

// User ⇄ Template
User.hasMany(Template, { foreignKey: 'userId', as: 'templates' });
Template.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User ⇄ Campaign
User.hasMany(Campaign, { foreignKey: 'userId', as: 'campaigns' });
Campaign.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Business ⇄ Campaign
Business.hasMany(Campaign, { foreignKey: 'businessId', as: 'campaigns' });
Campaign.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

// Template ⇄ Campaign
Template.hasMany(Campaign, { foreignKey: 'templateId', as: 'campaigns' });
Campaign.belongsTo(Template, { foreignKey: 'templateId', as: 'template' });

// Campaign/Customer/Template ⇄ MessageLog
Campaign.hasMany(MessageLog, { foreignKey: 'campaignId', as: 'messageLogs' });
MessageLog.belongsTo(Campaign, { foreignKey: 'campaignId', as: 'campaign' });

Customer.hasMany(MessageLog, { foreignKey: 'customerId', as: 'messageLogs' });
MessageLog.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });

Template.hasMany(MessageLog, { foreignKey: 'templateId', as: 'messageLogs' });
MessageLog.belongsTo(Template, { foreignKey: 'templateId', as: 'template' });

/* ✅ NEW: Business ⇄ Department */
Business.hasMany(Department, {
  foreignKey: 'businessId',
  as: 'departments',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE',
});
Department.belongsTo(Business, {
  foreignKey: 'businessId',
  as: 'business',
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE',
});

Business.hasMany(Service, { foreignKey: 'businessId', as: 'services' });
Service.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

// Business ⇄ Designation
Business.hasMany(Designation, { foreignKey: 'businessId', as: 'designations' });
Designation.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

// Business ⇄ LeaveType
Business.hasMany(LeaveType, { foreignKey: 'businessId', as: 'leaveTypes' });
LeaveType.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

// Business ⇄ LeaveRequest
Business.hasMany(LeaveRequest, { foreignKey: 'businessId', as: 'leaveRequests' });
LeaveRequest.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

// Employee ⇄ LeaveRequest
Employee.hasMany(LeaveRequest, { foreignKey: 'employeeId', as: 'leaveRequests' });
LeaveRequest.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

// LeaveType ⇄ LeaveRequest
LeaveType.hasMany(LeaveRequest, { foreignKey: 'leaveTypeId', as: 'requests' });
LeaveRequest.belongsTo(LeaveType, { foreignKey: 'leaveTypeId', as: 'leaveType' });

// Approver (User) ⇄ LeaveRequest
User.hasMany(LeaveRequest, { foreignKey: 'approverId', as: 'approvedLeaves' });
LeaveRequest.belongsTo(User, { foreignKey: 'approverId', as: 'approver' });

/* ✅ NEW: Employee ⇄ EmployeeEducation */
Employee.hasMany(EmployeeEducation, {
  foreignKey: 'employeeId',
  as: 'educations',
  onDelete: 'CASCADE',
  hooks: true,
});
EmployeeEducation.belongsTo(Employee, {
  foreignKey: 'employeeId',
  as: 'employee',
});

/* ✅ NEW: Employee ⇄ EmployeeExperience */
Employee.hasMany(EmployeeExperience, {
  foreignKey: 'employeeId',
  as: 'experiences',
  onDelete: 'CASCADE',
  hooks: true,
});
EmployeeExperience.belongsTo(Employee, {
  foreignKey: 'employeeId',
  as: 'employee',
});

/* ✅ NEW: Employee ⇄ EmployeeDocument */
Employee.hasMany(EmployeeDocument, {
  foreignKey: 'employeeId',
  as: 'documents',
  onDelete: 'CASCADE',
  hooks: true,
});
EmployeeDocument.belongsTo(Employee, {
  foreignKey: 'employeeId',
  as: 'employee',
});

// DocumentType ⇄ EmailTemplate
DocumentType.hasMany(EmailTemplate, {
  foreignKey: 'documentTypeId',
  as: 'emailTemplates',
});

EmailTemplate.belongsTo(DocumentType, {
  foreignKey: 'documentTypeId',
  as: 'documentType',
});


export {
  User,
  Business,
  Customer,
  Template,
  Campaign,
  MessageLog,
  Department, // ✅ export it
  Service,
  Designation,
  LeaveType,
  LeaveRequest,
  Employee,
  DocumentType,

  // ✅ export child models too (optional but handy)
  EmployeeEducation,
  EmployeeExperience,
  EmployeeDocument,
  EmailTemplate,
};
