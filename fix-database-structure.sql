-- =====================================================
-- Database Structure Fix Script
-- Run this to fix the existing database structure
-- =====================================================

USE saas_whatsapp_manager;

-- Check current table structure
DESCRIBE users;

-- If the users table has an existing primary key, we need to handle it properly
-- Let's check if there are any existing tables and their structure

-- Drop existing tables if they exist (CAUTION: This will delete all data)
-- Uncomment the following lines if you want to start fresh:

-- DROP TABLE IF EXISTS message_logs;
-- DROP TABLE IF EXISTS campaigns;
-- DROP TABLE IF EXISTS templates;
-- DROP TABLE IF EXISTS customers;
-- DROP TABLE IF EXISTS businesses;
-- DROP TABLE IF EXISTS employees;
-- DROP TABLE IF EXISTS users;

-- Create users table with proper structure
CREATE TABLE IF NOT EXISTS users (
  id int(11) NOT NULL AUTO_INCREMENT,
  avatarUrl varchar(255) DEFAULT NULL,
  firstName varchar(100) DEFAULT NULL,
  lastName varchar(100) DEFAULT NULL,
  phoneNo varchar(20) DEFAULT NULL,
  email varchar(255) NOT NULL,
  password varchar(255) NOT NULL,
  role enum('admin','shop_owner','shop_manager','shop_worker') DEFAULT 'shop_owner',
  status enum('active','invited','disabled') DEFAULT 'active',
  refreshTokens text DEFAULT NULL,
  refreshTokenExpiresAt datetime DEFAULT NULL,
  createdAt timestamp NOT NULL DEFAULT current_timestamp(),
  updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id),
  UNIQUE KEY email (email),
  KEY idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id int(11) NOT NULL AUTO_INCREMENT,
  userId int(11) NOT NULL,
  businessName varchar(255) NOT NULL,
  phoneNo varchar(20) DEFAULT NULL,
  whatsappNo varchar(20) DEFAULT NULL,
  email varchar(255) DEFAULT NULL,
  address text DEFAULT NULL,
  website varchar(255) DEFAULT NULL,
  businessType varchar(100) DEFAULT NULL,
  isActive tinyint(1) DEFAULT 1,
  createdAt timestamp NOT NULL DEFAULT current_timestamp(),
  updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id),
  KEY userId (userId),
  CONSTRAINT businesses_ibfk_1 FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id int(11) NOT NULL AUTO_INCREMENT,
  userId int(11) NOT NULL,
  name varchar(255) NOT NULL,
  phone varchar(20) NOT NULL,
  email varchar(255) DEFAULT NULL,
  address text DEFAULT NULL,
  tags json DEFAULT NULL,
  isActive tinyint(1) DEFAULT 1,
  createdAt timestamp NOT NULL DEFAULT current_timestamp(),
  updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id),
  UNIQUE KEY unique_user_phone (userId,phone),
  KEY userId (userId),
  KEY idx_phone (phone),
  CONSTRAINT customers_ibfk_1 FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id int(11) NOT NULL AUTO_INCREMENT,
  userId int(11) NOT NULL,
  name varchar(255) NOT NULL,
  content text NOT NULL,
  category varchar(100) DEFAULT NULL,
  isActive tinyint(1) DEFAULT 1,
  createdAt timestamp NOT NULL DEFAULT current_timestamp(),
  updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id),
  KEY userId (userId),
  KEY idx_category (category),
  CONSTRAINT templates_ibfk_1 FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id int(11) NOT NULL AUTO_INCREMENT,
  userId int(11) NOT NULL,
  name varchar(255) NOT NULL,
  templateId int(11) DEFAULT NULL,
  customerIds json DEFAULT NULL,
  status enum('draft','scheduled','running','completed','failed') DEFAULT 'draft',
  scheduledAt timestamp NULL DEFAULT NULL,
  sentCount int(11) DEFAULT 0,
  totalCount int(11) DEFAULT 0,
  createdAt timestamp NOT NULL DEFAULT current_timestamp(),
  updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id),
  KEY userId (userId),
  KEY templateId (templateId),
  KEY idx_status (status),
  KEY idx_scheduled_at (scheduledAt),
  CONSTRAINT campaigns_ibfk_1 FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT campaigns_ibfk_2 FOREIGN KEY (templateId) REFERENCES templates (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create message_logs table
CREATE TABLE IF NOT EXISTS message_logs (
  id int(11) NOT NULL AUTO_INCREMENT,
  userId int(11) NOT NULL,
  campaignId int(11) DEFAULT NULL,
  customerId int(11) DEFAULT NULL,
  templateId int(11) DEFAULT NULL,
  messageId varchar(255) DEFAULT NULL,
  status enum('sent','delivered','read','failed') DEFAULT 'sent',
  errorMessage text DEFAULT NULL,
  sentAt timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id),
  KEY userId (userId),
  KEY campaignId (campaignId),
  KEY customerId (customerId),
  KEY templateId (templateId),
  KEY idx_status (status),
  KEY idx_sent_at (sentAt),
  CONSTRAINT message_logs_ibfk_1 FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT message_logs_ibfk_2 FOREIGN KEY (campaignId) REFERENCES campaigns (id) ON DELETE CASCADE,
  CONSTRAINT message_logs_ibfk_3 FOREIGN KEY (customerId) REFERENCES customers (id) ON DELETE CASCADE,
  CONSTRAINT message_logs_ibfk_4 FOREIGN KEY (templateId) REFERENCES templates (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create employees table
CREATE TABLE IF NOT EXISTS employees (
  id int(11) NOT NULL AUTO_INCREMENT,
  userId int(11) NOT NULL,
  empId varchar(50) NOT NULL,
  empName varchar(255) NOT NULL,
  empDesignation varchar(255) NOT NULL,
  empDepartment varchar(255) NOT NULL,
  empWorkLoc varchar(255) NOT NULL,
  empDateOfJoining date NOT NULL,
  empDob date NOT NULL,
  empCtc decimal(15,2) NOT NULL,
  empAadhar varchar(12) NOT NULL,
  empPan varchar(10) NOT NULL,
  empEmail varchar(255) NOT NULL,
  empPhone varchar(10) NOT NULL,
  isActive tinyint(1) DEFAULT 1,
  createdAt timestamp NOT NULL DEFAULT current_timestamp(),
  updatedAt timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (id),
  UNIQUE KEY unique_user_emp_id (userId,empId),
  UNIQUE KEY unique_user_email (userId,empEmail),
  UNIQUE KEY unique_user_phone (userId,empPhone),
  UNIQUE KEY unique_user_aadhar (userId,empAadhar),
  UNIQUE KEY unique_user_pan (userId,empPan),
  KEY userId (userId),
  KEY idx_user_active (userId,isActive),
  KEY idx_emp_department (empDepartment),
  KEY idx_emp_designation (empDesignation),
  KEY idx_emp_email (empEmail),
  KEY idx_emp_phone (empPhone),
  KEY idx_created_at (createdAt),
  CONSTRAINT employees_ibfk_1 FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Show all tables
SHOW TABLES;

-- Show structure of users table
DESCRIBE users;
