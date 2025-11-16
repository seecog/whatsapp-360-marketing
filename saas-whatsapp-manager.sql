-- =====================================================
-- SAAS WhatsApp Manager - Complete Database Schema
-- Import Ready SQL Dump
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

-- =====================================================
-- Database: saas_whatsapp_manager
-- =====================================================

CREATE DATABASE IF NOT EXISTS `saas_whatsapp_manager` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `saas_whatsapp_manager`;

-- =====================================================
-- Table structure for table `users`
-- =====================================================

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `avatarUrl` varchar(255) DEFAULT NULL,
  `firstName` varchar(100) DEFAULT NULL,
  `lastName` varchar(100) DEFAULT NULL,
  `phoneNo` varchar(20) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','shop_owner','shop_manager','shop_worker') DEFAULT 'shop_owner',
  `status` enum('active','invited','disabled') DEFAULT 'active',
  `refreshTokens` text DEFAULT NULL,
  `refreshTokenExpiresAt` datetime DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table structure for table `businesses`
-- =====================================================

DROP TABLE IF EXISTS `businesses`;
CREATE TABLE `businesses` (
  `_id` varchar(24) NOT NULL,
  `user_id` varchar(24) NOT NULL,
  `business_name` varchar(255) NOT NULL,
  `business_type` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table structure for table `customers`
-- =====================================================

DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `_id` varchar(24) NOT NULL,
  `user_id` varchar(24) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table structure for table `templates`
-- =====================================================

DROP TABLE IF EXISTS `templates`;
CREATE TABLE `templates` (
  `_id` varchar(24) NOT NULL,
  `user_id` varchar(24) NOT NULL,
  `name` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table structure for table `campaigns`
-- =====================================================

DROP TABLE IF EXISTS `campaigns`;
CREATE TABLE `campaigns` (
  `_id` varchar(24) NOT NULL,
  `user_id` varchar(24) NOT NULL,
  `name` varchar(255) NOT NULL,
  `template_id` varchar(24) DEFAULT NULL,
  `customer_ids` json DEFAULT NULL,
  `status` enum('draft','scheduled','running','completed','failed') DEFAULT 'draft',
  `scheduled_at` timestamp NULL DEFAULT NULL,
  `sent_count` int(11) DEFAULT 0,
  `total_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table structure for table `message_logs`
-- =====================================================

DROP TABLE IF EXISTS `message_logs`;
CREATE TABLE `message_logs` (
  `_id` varchar(24) NOT NULL,
  `user_id` varchar(24) NOT NULL,
  `campaign_id` varchar(24) DEFAULT NULL,
  `customer_id` varchar(24) DEFAULT NULL,
  `template_id` varchar(24) DEFAULT NULL,
  `message_id` varchar(255) DEFAULT NULL,
  `status` enum('sent','delivered','read','failed') DEFAULT 'sent',
  `error_message` text DEFAULT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Table structure for table `employees`
-- =====================================================

DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `empId` varchar(50) NOT NULL,
  `empName` varchar(255) NOT NULL,
  `empDesignation` varchar(255) NOT NULL,
  `empDepartment` varchar(255) NOT NULL,
  `empWorkLoc` varchar(255) NOT NULL,
  `empDateOfJoining` date NOT NULL,
  `empDob` date NOT NULL,
  `empCtc` decimal(15,2) NOT NULL,
  `empAadhar` varchar(12) NOT NULL,
  `empPan` varchar(10) NOT NULL,
  `empEmail` varchar(255) NOT NULL,
  `empPhone` varchar(10) NOT NULL,
  `isActive` tinyint(1) DEFAULT 1,
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  `updatedAt` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Indexes for dumped tables
-- =====================================================

-- Indexes for table `users`
ALTER TABLE `users`
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_status` (`status`);

-- Indexes for table `businesses`
ALTER TABLE `businesses`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `user_id` (`user_id`);

-- Indexes for table `customers`
ALTER TABLE `customers`
  ADD PRIMARY KEY (`_id`),
  ADD UNIQUE KEY `unique_user_phone` (`user_id`,`phone`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_phone` (`phone`);

-- Indexes for table `templates`
ALTER TABLE `templates`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_category` (`category`);

-- Indexes for table `campaigns`
ALTER TABLE `campaigns`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `template_id` (`template_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_scheduled_at` (`scheduled_at`);

-- Indexes for table `message_logs`
ALTER TABLE `message_logs`
  ADD PRIMARY KEY (`_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `campaign_id` (`campaign_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `template_id` (`template_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_sent_at` (`sent_at`);

-- Indexes for table `employees`
ALTER TABLE `employees`
  ADD UNIQUE KEY `unique_user_emp_id` (`userId`,`empId`),
  ADD UNIQUE KEY `unique_user_email` (`userId`,`empEmail`),
  ADD UNIQUE KEY `unique_user_phone` (`userId`,`empPhone`),
  ADD UNIQUE KEY `unique_user_aadhar` (`userId`,`empAadhar`),
  ADD UNIQUE KEY `unique_user_pan` (`userId`,`empPan`),
  ADD KEY `userId` (`userId`),
  ADD KEY `idx_user_active` (`userId`,`isActive`),
  ADD KEY `idx_emp_department` (`empDepartment`),
  ADD KEY `idx_emp_designation` (`empDesignation`),
  ADD KEY `idx_emp_email` (`empEmail`),
  ADD KEY `idx_emp_phone` (`empPhone`),
  ADD KEY `idx_created_at` (`createdAt`);

-- =====================================================
-- AUTO_INCREMENT for dumped tables
-- =====================================================

-- No AUTO_INCREMENT tables in this schema

-- =====================================================
-- Constraints for dumped tables
-- =====================================================

-- Constraints for table `businesses`
ALTER TABLE `businesses`
  ADD CONSTRAINT `businesses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`_id`) ON DELETE CASCADE;

-- Constraints for table `customers`
ALTER TABLE `customers`
  ADD CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`_id`) ON DELETE CASCADE;

-- Constraints for table `templates`
ALTER TABLE `templates`
  ADD CONSTRAINT `templates_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`_id`) ON DELETE CASCADE;

-- Constraints for table `campaigns`
ALTER TABLE `campaigns`
  ADD CONSTRAINT `campaigns_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `campaigns_ibfk_2` FOREIGN KEY (`template_id`) REFERENCES `templates` (`_id`) ON DELETE SET NULL;

-- Constraints for table `message_logs`
ALTER TABLE `message_logs`
  ADD CONSTRAINT `message_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `message_logs_ibfk_2` FOREIGN KEY (`campaign_id`) REFERENCES `campaigns` (`_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `message_logs_ibfk_3` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `message_logs_ibfk_4` FOREIGN KEY (`template_id`) REFERENCES `templates` (`_id`) ON DELETE SET NULL;

-- Constraints for table `employees`
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE;

-- =====================================================
-- Sample Data (Optional - Uncomment to insert)
-- =====================================================

-- Sample User
-- INSERT INTO `users` (`firstName`, `lastName`, `email`, `password`, `phoneNo`, `status`) VALUES
-- ('John', 'Doe', 'john@example.com', '$2b$10$hashedpassword', '9876543210', 'active');

-- Sample Business
-- INSERT INTO `businesses` (`_id`, `user_id`, `business_name`, `business_type`, `address`, `phone`, `email`, `website`, `is_active`) VALUES
-- ('507f1f77bcf86cd799439012', '507f1f77bcf86cd799439011', 'Tech Solutions Ltd', 'Technology', '123 Business St, City', '9876543210', 'info@techsolutions.com', 'https://techsolutions.com', 1);

-- Sample Customer
-- INSERT INTO `customers` (`_id`, `user_id`, `name`, `phone`, `email`, `address`, `tags`, `is_active`) VALUES
-- ('507f1f77bcf86cd799439013', '507f1f77bcf86cd799439011', 'Jane Smith', '9876543211', 'jane@example.com', '456 Customer Ave, City', '["VIP", "Premium"]', 1);

-- Sample Template
-- INSERT INTO `templates` (`_id`, `user_id`, `name`, `content`, `category`, `is_active`) VALUES
-- ('507f1f77bcf86cd799439014', '507f1f77bcf86cd799439011', 'Welcome Message', 'Hello {{name}}, welcome to our service!', 'Welcome', 1);

-- Sample Employee
-- INSERT INTO `employees` (`userId`, `empId`, `empName`, `empDesignation`, `empDepartment`, `empWorkLoc`, `empDateOfJoining`, `empDob`, `empCtc`, `empAadhar`, `empPan`, `empEmail`, `empPhone`, `isActive`) VALUES
-- (1, 'EMP0001', 'Alice Johnson', 'Software Engineer', 'IT', 'Mumbai', '2023-01-15', '1990-05-20', 800000.00, '123456789012', 'ABCDE1234F', 'alice@example.com', '9876543212', 1);

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

-- =====================================================
-- Database creation complete!
-- =====================================================
-- 
-- To import this SQL dump:
-- 1. mysql -u root -p < saas-whatsapp-manager.sql
-- 2. Or use phpMyAdmin/MySQL Workbench to import this file
-- 
-- Database: saas_whatsapp_manager
-- Tables created: users, businesses, customers, templates, campaigns, message_logs, employees
-- 
-- All tables are ready for your SAAS WhatsApp Manager application!
-- =====================================================
