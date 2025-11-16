-- =====================================================
-- Database Migration Script for SAAS WhatsApp Manager
-- HR Tools Module - Employee Management
-- =====================================================

-- This script creates the necessary tables for the SAAS application
-- Each user will have their own isolated data through user_id references

-- =====================================================
-- 1. USERS TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    _id VARCHAR(24) PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_is_active (is_active)
);

-- =====================================================
-- 2. EMPLOYEES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS employees (
    _id VARCHAR(24) PRIMARY KEY,
    user_id VARCHAR(24) NOT NULL,
    emp_id VARCHAR(50) NOT NULL,
    emp_name VARCHAR(255) NOT NULL,
    emp_designation VARCHAR(255) NOT NULL,
    emp_department VARCHAR(255) NOT NULL,
    emp_work_loc VARCHAR(255) NOT NULL,
    emp_date_of_joining DATE NOT NULL,
    emp_dob DATE NOT NULL,
    emp_ctc DECIMAL(15,2) NOT NULL,
    emp_aadhar VARCHAR(12) NOT NULL,
    emp_pan VARCHAR(10) NOT NULL,
    emp_email VARCHAR(255) NOT NULL,
    emp_phone VARCHAR(10) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (user_id) REFERENCES users(_id) ON DELETE CASCADE,
    
    -- Unique constraints per user
    UNIQUE KEY unique_user_emp_id (user_id, emp_id),
    UNIQUE KEY unique_user_email (user_id, emp_email),
    UNIQUE KEY unique_user_phone (user_id, emp_phone),
    UNIQUE KEY unique_user_aadhar (user_id, emp_aadhar),
    UNIQUE KEY unique_user_pan (user_id, emp_pan),
    
    -- Indexes for performance
    INDEX idx_user_id (user_id),
    INDEX idx_user_active (user_id, is_active),
    INDEX idx_emp_department (emp_department),
    INDEX idx_emp_designation (emp_designation),
    INDEX idx_emp_email (emp_email),
    INDEX idx_emp_phone (emp_phone),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- 3. EXISTING TABLES (for reference - update as needed)
-- =====================================================

-- Business Table (if exists)
CREATE TABLE IF NOT EXISTS businesses (
    _id VARCHAR(24) PRIMARY KEY,
    user_id VARCHAR(24) NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(100),
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Customers Table (if exists)
CREATE TABLE IF NOT EXISTS customers (
    _id VARCHAR(24) PRIMARY KEY,
    user_id VARCHAR(24) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    address TEXT,
    tags JSON,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(_id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_phone (user_id, phone),
    INDEX idx_user_id (user_id),
    INDEX idx_phone (phone)
);

-- Templates Table (if exists)
CREATE TABLE IF NOT EXISTS templates (
    _id VARCHAR(24) PRIMARY KEY,
    user_id VARCHAR(24) NOT NULL,
    name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_category (category)
);

-- Campaigns Table (if exists)
CREATE TABLE IF NOT EXISTS campaigns (
    _id VARCHAR(24) PRIMARY KEY,
    user_id VARCHAR(24) NOT NULL,
    name VARCHAR(255) NOT NULL,
    template_id VARCHAR(24),
    customer_ids JSON,
    status ENUM('draft', 'scheduled', 'running', 'completed', 'failed') DEFAULT 'draft',
    scheduled_at TIMESTAMP NULL,
    sent_count INT DEFAULT 0,
    total_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(_id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES templates(_id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_at (scheduled_at)
);

-- Message Logs Table (if exists)
CREATE TABLE IF NOT EXISTS message_logs (
    _id VARCHAR(24) PRIMARY KEY,
    user_id VARCHAR(24) NOT NULL,
    campaign_id VARCHAR(24),
    customer_id VARCHAR(24),
    template_id VARCHAR(24),
    message_id VARCHAR(255),
    status ENUM('sent', 'delivered', 'read', 'failed') DEFAULT 'sent',
    error_message TEXT,
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(_id) ON DELETE CASCADE,
    FOREIGN KEY (campaign_id) REFERENCES campaigns(_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(_id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES templates(_id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_campaign_id (campaign_id),
    INDEX idx_status (status),
    INDEX idx_sent_at (sent_at)
);

-- =====================================================
-- 4. SAMPLE DATA INSERTION (Optional)
-- =====================================================

-- Insert sample user (optional - for testing)
-- INSERT IGNORE INTO users (_id, firstName, lastName, email, password) 
-- VALUES ('507f1f77bcf86cd799439011', 'John', 'Doe', 'john@example.com', '$2b$10$hashedpassword');

-- Insert sample employee (optional - for testing)
-- INSERT IGNORE INTO employees (
--     _id, user_id, emp_id, emp_name, emp_designation, emp_department, 
--     emp_work_loc, emp_date_of_joining, emp_dob, emp_ctc, emp_aadhar, 
--     emp_pan, emp_email, emp_phone
-- ) VALUES (
--     '507f1f77bcf86cd799439012', '507f1f77bcf86cd799439011', 'EMP0001', 
--     'Jane Smith', 'Software Engineer', 'IT', 'Mumbai', '2023-01-15', 
--     '1990-05-20', 800000.00, '123456789012', 'ABCDE1234F', 
--     'jane@example.com', '9876543210'
-- );

-- =====================================================
-- 5. VIEWS FOR REPORTING (Optional)
-- =====================================================

-- Employee Summary View
CREATE OR REPLACE VIEW employee_summary AS
SELECT 
    u.firstName as user_name,
    u.email as user_email,
    COUNT(e._id) as total_employees,
    COUNT(CASE WHEN e.is_active = true THEN 1 END) as active_employees,
    COUNT(CASE WHEN e.is_active = false THEN 1 END) as inactive_employees,
    AVG(e.emp_ctc) as avg_ctc,
    SUM(e.emp_ctc) as total_ctc
FROM users u
LEFT JOIN employees e ON u._id = e.user_id
GROUP BY u._id, u.firstName, u.email;

-- Department-wise Employee Count
CREATE OR REPLACE VIEW department_employee_count AS
SELECT 
    u._id as user_id,
    u.firstName as user_name,
    e.emp_department,
    COUNT(e._id) as employee_count
FROM users u
JOIN employees e ON u._id = e.user_id
WHERE e.is_active = true
GROUP BY u._id, u.firstName, e.emp_department
ORDER BY u.firstName, employee_count DESC;

-- =====================================================
-- 6. STORED PROCEDURES (Optional)
-- =====================================================

DELIMITER //

-- Procedure to get employee statistics for a user
CREATE PROCEDURE GetEmployeeStats(IN p_user_id VARCHAR(24))
BEGIN
    SELECT 
        COUNT(*) as total_employees,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active_employees,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_employees,
        AVG(emp_ctc) as avg_ctc,
        SUM(emp_ctc) as total_ctc,
        COUNT(DISTINCT emp_department) as total_departments,
        COUNT(DISTINCT emp_designation) as total_designations
    FROM employees 
    WHERE user_id = p_user_id;
END //

-- Procedure to get department-wise employee count
CREATE PROCEDURE GetDepartmentStats(IN p_user_id VARCHAR(24))
BEGIN
    SELECT 
        emp_department,
        COUNT(*) as employee_count,
        AVG(emp_ctc) as avg_ctc
    FROM employees 
    WHERE user_id = p_user_id AND is_active = true
    GROUP BY emp_department
    ORDER BY employee_count DESC;
END //

DELIMITER ;

-- =====================================================
-- 7. TRIGGERS (Optional)
-- =====================================================

-- Trigger to automatically generate emp_id if not provided
DELIMITER //
CREATE TRIGGER before_employee_insert 
BEFORE INSERT ON employees
FOR EACH ROW
BEGIN
    IF NEW.emp_id IS NULL OR NEW.emp_id = '' THEN
        SET NEW.emp_id = CONCAT('EMP', LPAD(
            (SELECT COALESCE(MAX(CAST(SUBSTRING(emp_id, 4) AS UNSIGNED)), 0) + 1 
             FROM employees 
             WHERE user_id = NEW.user_id), 4, '0'));
    END IF;
END //
DELIMITER ;

-- =====================================================
-- 8. INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================

-- Composite indexes for common queries
CREATE INDEX idx_employees_user_dept ON employees(user_id, emp_department);
CREATE INDEX idx_employees_user_designation ON employees(user_id, emp_designation);
CREATE INDEX idx_employees_user_status ON employees(user_id, is_active);
CREATE INDEX idx_employees_joining_date ON employees(emp_date_of_joining);
CREATE INDEX idx_employees_dob ON employees(emp_dob);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- To run this migration:
-- 1. Connect to your MySQL/MariaDB database
-- 2. Run: mysql -u username -p database_name < database-migration.sql
-- 3. Or execute this script in your database management tool

-- For MongoDB (if using MongoDB instead of MySQL):
-- The Mongoose models will automatically create the collections and indexes
-- when the application starts and the models are loaded.

-- =====================================================
-- NOTES FOR SAAS ARCHITECTURE:
-- =====================================================
-- 1. All tables include user_id to ensure data isolation
-- 2. Unique constraints are scoped to user_id to prevent conflicts
-- 3. Foreign key constraints ensure data integrity
-- 4. Indexes are optimized for multi-tenant queries
-- 5. Views and procedures provide easy reporting capabilities
-- 6. Triggers handle automatic field generation
-- =====================================================
