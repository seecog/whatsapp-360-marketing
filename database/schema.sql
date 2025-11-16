-- MySQL dump 10.13  Distrib 8.0.43, for macos15 (arm64)
--
-- Host: localhost    Database: saas_whatsapp_manager
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `businesses`
--

DROP TABLE IF EXISTS `businesses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `businesses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `businessName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phoneNo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `whatsappNo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `ownerId` int NOT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `timezone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'Asia/Kolkata',
  `country` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ownerId` (`ownerId`),
  KEY `userId` (`userId`),
  CONSTRAINT `businesses_ibfk_1` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`),
  CONSTRAINT `businesses_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `businesses`
--

LOCK TABLES `businesses` WRITE;
/*!40000 ALTER TABLE `businesses` DISABLE KEYS */;
INSERT INTO `businesses` VALUES (3,'Pet Service','+919064784636','+919064784636','Pet Services in the home',1,'healthcare','Asia/Kolkata','IN','2025-10-12 07:10:31','2025-10-12 07:10:31',NULL),(18,'Home Service','+918974675563','+918765456789','Stella Home Services',1,'other','Asia/Kolkata','IN','2025-10-12 17:29:50','2025-10-12 17:29:50',NULL),(19,'Pet service','+916784637647','+917846376478','Grooming',3,'healthcare','Asia/Kolkata','IN','2025-10-15 08:15:58','2025-10-15 08:15:58',NULL);
/*!40000 ALTER TABLE `businesses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campaigns`
--

DROP TABLE IF EXISTS `campaigns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campaigns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `businessId` int NOT NULL,
  `templateId` int DEFAULT NULL,
  `metaTemplateName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metaTemplateLanguage` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'en_US',
  `metaTemplateCategory` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customerIds` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'JSON string of customer IDs',
  `description` text COLLATE utf8mb4_unicode_ci,
  `scheduledAt` datetime DEFAULT NULL,
  `status` enum('draft','scheduled','running','completed','paused','failed','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'draft',
  `recipientCount` int NOT NULL DEFAULT '0',
  `filters` json DEFAULT NULL,
  `stats` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `businessId` (`businessId`),
  KEY `templateId` (`templateId`),
  CONSTRAINT `campaigns_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `campaigns_ibfk_2` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campaigns`
--

LOCK TABLES `campaigns` WRITE;
/*!40000 ALTER TABLE `campaigns` DISABLE KEYS */;
INSERT INTO `campaigns` VALUES (3,3,'Test',19,NULL,'puja_offer1','en_US','marketing','[3]',NULL,'2025-10-15 08:17:24','completed',1,NULL,'{\"read\": 0, \"sent\": 0, \"total\": 1, \"failed\": 1, \"delivered\": 0}','2025-10-15 08:17:24','2025-10-15 08:18:30'),(5,1,'Testing',3,NULL,'diwali_pet_grooming','en_US','marketing','[4,2,1]','Grooming','2025-10-15 10:55:39','completed',3,NULL,'{\"read\": 0, \"sent\": 3, \"total\": 3, \"failed\": 0, \"delivered\": 0}','2025-10-15 10:55:39','2025-10-15 10:55:51');
/*!40000 ALTER TABLE `campaigns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `businessId` int DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phoneE164` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tags` json DEFAULT NULL,
  `consentAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `customers_user_id_phone_e164` (`userId`,`phoneE164`),
  KEY `businessId` (`businessId`),
  CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `customers_ibfk_2` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
INSERT INTO `customers` VALUES (1,1,3,'Mukesh Kumhar','+919064784636','[\"vip\"]','2025-10-12 07:57:50','2025-10-12 07:39:56','2025-10-12 07:57:50'),(2,1,3,'Pankaj Agarwal','+917348820668','[\"regular\"]','2025-10-12 10:16:52','2025-10-12 10:16:52','2025-10-12 10:16:52'),(3,3,19,'Mukesh kumar','+919064784636','[\"vip\"]','2025-10-15 08:16:22','2025-10-15 08:16:22','2025-10-15 08:16:22'),(4,1,3,'Sonam Agarwal','+916206992612','[\"vip\"]','2025-10-15 10:54:21','2025-10-15 10:54:21','2025-10-15 10:54:21');
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT (uuid()),
  `businessId` int NOT NULL,
  `name` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(16) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `metadata` json DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_business_name` (`businessId`,`name`),
  UNIQUE KEY `uniq_business_code` (`businessId`,`code`),
  KEY `idx_dept_business` (`businessId`),
  KEY `idx_dept_status` (`status`),
  CONSTRAINT `fk_dept_business` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES ('2825c47a-c1cc-4d9e-8715-e47414295752',3,'Engineering','ENGINEERING','Software development','ACTIVE','{}','2025-10-21 16:02:18','2025-10-21 16:02:18',NULL),('ba9d470f-2cdb-498f-b095-153ef0aa375e',3,'Corporate Sales','SALES','Revenue team','INACTIVE','{\"notes\": \"seasonal\", \"office\": \"B2\"}','2025-10-21 15:50:28','2025-10-21 16:13:17','2025-10-21 16:13:17');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `designations`
--

DROP TABLE IF EXISTS `designations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `designations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `businessId` int NOT NULL,
  `name` varchar(120) NOT NULL,
  `code` varchar(32) DEFAULT NULL,
  `description` text,
  `status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `sortOrder` int DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_designation_name_per_business` (`businessId`,`name`),
  UNIQUE KEY `uniq_designation_code_per_business` (`businessId`,`code`),
  KEY `idx_desig_business` (`businessId`),
  KEY `idx_desig_status` (`status`),
  KEY `idx_desig_sort` (`sortOrder`),
  CONSTRAINT `fk_designation_business` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `designations`
--

LOCK TABLES `designations` WRITE;
/*!40000 ALTER TABLE `designations` DISABLE KEYS */;
INSERT INTO `designations` VALUES (1,3,'Lead Developer','SR_DEV','Leads modules','ACTIVE',5,'2025-10-22 09:39:17','2025-10-22 09:44:51',NULL);
/*!40000 ALTER TABLE `designations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `empId` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `empName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `empDesignation` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `empDepartment` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `empWorkLoc` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `empDateOfJoining` date NOT NULL,
  `empDob` date NOT NULL,
  `empCtc` decimal(15,2) NOT NULL,
  `empAadhar` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL,
  `empPan` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `empEmail` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `empPhone` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `empId` (`empId`),
  UNIQUE KEY `employees_user_id_emp_id` (`userId`,`empId`),
  UNIQUE KEY `employees_user_id_emp_email` (`userId`,`empEmail`),
  UNIQUE KEY `employees_user_id_emp_phone` (`userId`,`empPhone`),
  UNIQUE KEY `employees_user_id_emp_aadhar` (`userId`,`empAadhar`),
  UNIQUE KEY `employees_user_id_emp_pan` (`userId`,`empPan`),
  KEY `employees_user_id_is_active` (`userId`,`isActive`),
  KEY `employees_emp_department` (`empDepartment`),
  KEY `employees_emp_designation` (`empDesignation`),
  CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_requests`
--

DROP TABLE IF EXISTS `leave_requests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_requests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `businessId` int NOT NULL,
  `employeeId` int NOT NULL,
  `leaveTypeId` int NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  `totalDays` decimal(5,2) NOT NULL,
  `reason` text,
  `managerNote` text,
  `status` enum('PENDING','APPROVED','REJECTED','CANCELED') NOT NULL DEFAULT 'PENDING',
  `approverId` int DEFAULT NULL,
  `approvedAt` datetime DEFAULT NULL,
  `rejectedAt` datetime DEFAULT NULL,
  `canceledAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_lr_approver` (`approverId`),
  KEY `idx_lr_business` (`businessId`),
  KEY `idx_lr_employee` (`employeeId`),
  KEY `idx_lr_leavetype` (`leaveTypeId`),
  KEY `idx_lr_status` (`status`),
  KEY `idx_lr_dates` (`startDate`,`endDate`),
  CONSTRAINT `fk_lr_approver` FOREIGN KEY (`approverId`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_lr_business` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_lr_employee` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_lr_leavetype` FOREIGN KEY (`leaveTypeId`) REFERENCES `leave_types` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_requests`
--

LOCK TABLES `leave_requests` WRITE;
/*!40000 ALTER TABLE `leave_requests` DISABLE KEYS */;
/*!40000 ALTER TABLE `leave_requests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `leave_types`
--

DROP TABLE IF EXISTS `leave_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `leave_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `businessId` int NOT NULL,
  `name` varchar(120) NOT NULL,
  `code` varchar(32) DEFAULT NULL,
  `description` text,
  `status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `sortOrder` int DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_leavetype_name_per_business` (`businessId`,`name`),
  UNIQUE KEY `uniq_leavetype_code_per_business` (`businessId`,`code`),
  KEY `idx_lt_business` (`businessId`),
  KEY `idx_lt_status` (`status`),
  KEY `idx_lt_sort` (`sortOrder`),
  CONSTRAINT `fk_leavetype_business` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `leave_types`
--

LOCK TABLES `leave_types` WRITE;
/*!40000 ALTER TABLE `leave_types` DISABLE KEYS */;
INSERT INTO `leave_types` VALUES (1,3,'Sick Leave','SL','Medical leave','ACTIVE',1,'2025-10-22 13:46:07','2025-10-22 13:46:07',NULL);
/*!40000 ALTER TABLE `leave_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message_logs`
--

DROP TABLE IF EXISTS `message_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `campaignId` int NOT NULL,
  `customerId` int NOT NULL,
  `to` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `waMessageId` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('queued','sent','delivered','read','failed') COLLATE utf8mb4_unicode_ci NOT NULL,
  `error` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `templateId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `message_logs_campaign_id_customer_id` (`campaignId`,`customerId`),
  KEY `customerId` (`customerId`),
  KEY `templateId` (`templateId`),
  CONSTRAINT `message_logs_ibfk_1` FOREIGN KEY (`campaignId`) REFERENCES `campaigns` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `message_logs_ibfk_2` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `message_logs_ibfk_3` FOREIGN KEY (`templateId`) REFERENCES `templates` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message_logs`
--

LOCK TABLES `message_logs` WRITE;
/*!40000 ALTER TABLE `message_logs` DISABLE KEYS */;
INSERT INTO `message_logs` VALUES (7,5,4,'+916206992612','wamid.HBgMOTE2MjA2OTkyNjEyFQIAERgSMTU4NTMxQUUzNDk1MjNEQUM0AA==','sent',NULL,'2025-10-15 10:55:46','2025-10-15 10:55:48',NULL),(8,5,2,'+917348820668','wamid.HBgMOTE3MzQ4ODIwNjY4FQIAERgSRTBCNjc3NzZFQkQ3MTE1RTY2AA==','sent',NULL,'2025-10-15 10:55:48','2025-10-15 10:55:49',NULL),(9,5,1,'+919064784636','wamid.HBgMOTE5MDY0Nzg0NjM2FQIAERgSNkFFQjc1QTI4MERFNkU0MTM4AA==','sent',NULL,'2025-10-15 10:55:49','2025-10-15 10:55:50',NULL);
/*!40000 ALTER TABLE `message_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `services`
--

DROP TABLE IF EXISTS `services`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `services` (
  `id` int NOT NULL AUTO_INCREMENT,
  `businessId` int NOT NULL,
  `name` varchar(120) NOT NULL,
  `code` varchar(32) DEFAULT NULL,
  `description` text,
  `basePrice` decimal(10,2) NOT NULL DEFAULT '0.00',
  `currency` char(3) NOT NULL DEFAULT 'INR',
  `durationMinutes` int DEFAULT NULL,
  `taxRate` decimal(5,2) DEFAULT NULL,
  `isTaxInclusive` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `visible` tinyint(1) NOT NULL DEFAULT '1',
  `sortOrder` int DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_service_name_per_business` (`businessId`,`name`),
  UNIQUE KEY `uniq_service_code_per_business` (`businessId`,`code`),
  KEY `idx_service_business` (`businessId`),
  KEY `idx_service_status` (`status`),
  KEY `idx_service_visible` (`visible`),
  KEY `idx_service_sort` (`sortOrder`),
  CONSTRAINT `fk_service_business` FOREIGN KEY (`businessId`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `services`
--

LOCK TABLES `services` WRITE;
/*!40000 ALTER TABLE `services` DISABLE KEYS */;
INSERT INTO `services` VALUES (1,3,'Bath & Grooming','BATH_GROOM','Full bath, shampoo, conditioning.',999.00,'INR',60,18.00,1,'ACTIVE',1,1,'https://example.com/img/bath.png','{\"tools\": [\"brush\", \"dryer\"], \"category\": \"pet\"}','2025-10-21 17:15:16','2025-10-21 17:15:16',NULL);
/*!40000 ALTER TABLE `services` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `templates`
--

DROP TABLE IF EXISTS `templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `waName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `language` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'en_US',
  `category` enum('marketing','utility','authentication') COLLATE utf8mb4_unicode_ci NOT NULL,
  `components` json DEFAULT NULL,
  `displayName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `htmlContent` text COLLATE utf8mb4_unicode_ci COMMENT 'Rich HTML content for the template',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `templates_user_id_wa_name` (`userId`,`waName`),
  CONSTRAINT `templates_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `templates`
--

LOCK TABLES `templates` WRITE;
/*!40000 ALTER TABLE `templates` DISABLE KEYS */;
INSERT INTO `templates` VALUES (1,1,'puja_offer1','en_US','marketing','[]','Testing','<p>puja offer</p>','2025-10-12 07:46:28','2025-10-12 07:46:28');
/*!40000 ALTER TABLE `templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `avatarUrl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `firstName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lastName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phoneNo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('admin','shop_owner','shop_manager','shop_worker') COLLATE utf8mb4_unicode_ci DEFAULT 'shop_owner',
  `status` enum('active','invited','disabled') COLLATE utf8mb4_unicode_ci DEFAULT 'active',
  `refreshTokens` text COLLATE utf8mb4_unicode_ci,
  `refreshTokenExpiresAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,'Mukesh','Kumar','+919064784636','mukesh@gmail.com','$2b$10$a3W0zGIwr2Qn2Xr/7CQYiOLpzqDSne8F/pvQ6LI1nv/xMU56Rllrm','shop_owner','active','cc236fce730168d0bccfd592628321c656012bfb5de8070776427dbbfb358e2b','2025-11-23 08:20:59','2025-10-12 04:51:58','2025-11-16 08:20:59'),(2,NULL,'Mukesh','Kumhar','+919876543210','mukesh1@gmail.com','$2b$10$vXDlPxUVxbvashBLDvdGF.SC.hlWuVRyvBEvfembdylENKm5wLeWK','shop_owner','active','0ca0630553a69dbf0391b18bb059e0741a7422e912bee2de1b8369214a992821','2025-10-22 07:48:54','2025-10-12 05:06:16','2025-10-15 07:48:54'),(3,NULL,'Sonam','Agarwal','+916206992612','sonamagarwal878@gmail.com','$2b$10$XSQEUkG9XQlzXFGBFjTkKeR5D154fSwajAQPNq2oK.UvwGoYKOD4a','shop_owner','active','9a600714e14ea7077f411a48ea8f008cb224f3ca9d4b7b8f4ffc1d20d97b957e','2025-10-22 08:13:43','2025-10-14 03:54:45','2025-10-15 08:13:43');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-16 14:15:14