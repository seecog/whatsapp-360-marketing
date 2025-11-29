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
-- Table structure for table `business_addresses`
--

DROP TABLE IF EXISTS `business_addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_addresses` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `business_id` int NOT NULL,
  `address_name` varchar(150) NOT NULL,
  `full_address` text NOT NULL,
  `address_type` enum('REGISTERED','BRANCH','BILLING','SHIPPING','OTHER') DEFAULT 'REGISTERED',
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_business_addresses_business_id` (`business_id`),
  KEY `idx_business_addresses_status` (`status`),
  CONSTRAINT `fk_business_addresses_business` FOREIGN KEY (`business_id`) REFERENCES `businesses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `business_addresses`
--

LOCK TABLES `business_addresses` WRITE;
/*!40000 ALTER TABLE `business_addresses` DISABLE KEYS */;
INSERT INTO `business_addresses` VALUES (2,3,'Bengaluru Head Office','3rd Floor, ABC Tech Park, Outer Ring Road, Marathahalli, Bengaluru, Karnataka, 560037, India','REGISTERED','ACTIVE','2025-11-23 14:06:48','2025-11-23 14:06:48');
/*!40000 ALTER TABLE `business_addresses` ENABLE KEYS */;
UNLOCK TABLES;

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
INSERT INTO `campaigns` VALUES (3,3,'Test',19,NULL,'puja_offer1','en_US','marketing','[3]',NULL,'2025-10-15 08:17:24','completed',1,NULL,'{\"read\": 0, \"sent\": 0, \"total\": 1, \"failed\": 1, \"delivered\": 0}','2025-10-15 08:17:24','2025-10-15 08:18:30'),(5,1,'Testing',3,NULL,'diwali_pet_grooming','en_US','marketing','[4,2,1]','Grooming','2025-10-15 10:55:39','completed',3,NULL,'{\"read\": 0, \"sent\": 3, \"total\": 3, \"failed\": 0, \"delivered\": 0}','2025-10-15 10:55:39','2025-11-16 09:37:51');
/*!40000 ALTER TABLE `campaigns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `countries`
--

DROP TABLE IF EXISTS `countries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `countries` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `iso_code` varchar(3) NOT NULL,
  `phone_code` varchar(10) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_countries_iso_code` (`iso_code`),
  KEY `idx_countries_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `countries`
--

LOCK TABLES `countries` WRITE;
/*!40000 ALTER TABLE `countries` DISABLE KEYS */;
INSERT INTO `countries` VALUES (1,'India','IN','+91','ACTIVE','2025-11-23 11:17:09','2025-11-23 11:17:09');
/*!40000 ALTER TABLE `countries` ENABLE KEYS */;
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
INSERT INTO `departments` VALUES ('1',3,'Engineering','ENGINEERING','Software development','ACTIVE','{}','2025-10-21 16:02:18','2025-11-19 11:29:13',NULL),('2',3,'Corporate Sales','SALES','Revenue team','INACTIVE','{\"notes\": \"seasonal\", \"office\": \"B2\"}','2025-10-21 15:50:28','2025-11-19 11:29:53','2025-10-21 16:13:17'),('fcea87f0-a1f5-494d-9978-7dcf1ab83a6b',3,'Finance','finance','All Financeal Transation','ACTIVE','{}','2025-11-23 07:08:34','2025-11-23 07:08:34',NULL);
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
-- Table structure for table `document_types`
--

DROP TABLE IF EXISTS `document_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `document_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `templateHtml` text COLLATE utf8mb4_unicode_ci,
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_document_code` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_types`
--

LOCK TABLES `document_types` WRITE;
/*!40000 ALTER TABLE `document_types` DISABLE KEYS */;
INSERT INTO `document_types` VALUES (1,'Internship Certificate','INTERNSHIP_CERT','fa-solid fa-file-circle-check','Certificate confirming successful completion of internship.','<h3 style=\"text-align:center;\">Internship Certificate</h3><p>This is to certify that <strong>{{empName}}</strong> (Employee ID: {{empId}}) has successfully completed their internship with our organisation.</p><p>We appreciate their dedication and contribution during the internship period.</p><p style=\"margin-top:40px; text-align:right;\">Authorised Signatory</p>',0,'2025-11-17 13:52:29','2025-11-17 13:52:29',NULL);
/*!40000 ALTER TABLE `document_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_documents`
--

DROP TABLE IF EXISTS `employee_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employeeId` int NOT NULL,
  `category` enum('KYC','ADDRESS','EDUCATION','EXPERIENCE','HR','OTHER') COLLATE utf8mb4_unicode_ci DEFAULT 'KYC',
  `documentType` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'Aadhaar, PAN, Passport, 10th Marksheet, Offer Letter, etc.',
  `nameOnDocument` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `documentNumber` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `issueDate` date DEFAULT NULL,
  `expiryDate` date DEFAULT NULL,
  `verificationStatus` enum('Pending','Verified','Rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `verifiedBy` int DEFAULT NULL COMMENT 'HR user id',
  `verifiedAt` datetime DEFAULT NULL,
  `fileUrl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'PDF / file URL or path',
  `documentImageUrl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Scanned image URL/path of the document',
  `notes` text COLLATE utf8mb4_unicode_ci,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_employee_documents_employee` (`employeeId`),
  KEY `idx_employee_documents_type` (`documentType`),
  KEY `idx_employee_documents_category` (`category`),
  KEY `fk_employee_documents_verified_by` (`verifiedBy`),
  CONSTRAINT `fk_employee_documents_employee` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_employee_documents_verified_by` FOREIGN KEY (`verifiedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_documents`
--

LOCK TABLES `employee_documents` WRITE;
/*!40000 ALTER TABLE `employee_documents` DISABLE KEYS */;
INSERT INTO `employee_documents` VALUES (3,2,'KYC','Aadhaar','Mukesh Kumhar','867043993254',NULL,NULL,'Pending',NULL,NULL,NULL,NULL,NULL,'2025-11-23 06:58:11','2025-11-23 06:58:11'),(4,2,'OTHER','Passport','Mukesh Kumhar','84790356','2025-11-03','2025-11-11','Verified',NULL,NULL,'https://support.proof.com/hc/article_attachments/22907978517527',NULL,NULL,'2025-11-23 06:58:11','2025-11-23 06:58:11');
/*!40000 ALTER TABLE `employee_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_educations`
--

DROP TABLE IF EXISTS `employee_educations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_educations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employeeId` int NOT NULL,
  `level` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '10th, 12th, Diploma, Bachelors, Masters, Doctorate, Other',
  `degree` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `specialization` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `institutionName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `board` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `startYear` smallint DEFAULT NULL,
  `endYear` smallint DEFAULT NULL,
  `yearOfPassing` smallint DEFAULT NULL,
  `percentageOrCgpa` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `modeOfStudy` enum('Full-Time','Part-Time','Distance') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `educationType` enum('School','College','Professional','Technical','Other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `city` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `certificateUrl` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_employee_educations_employee` (`employeeId`),
  CONSTRAINT `fk_employee_educations_employee` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_educations`
--

LOCK TABLES `employee_educations` WRITE;
/*!40000 ALTER TABLE `employee_educations` DISABLE KEYS */;
INSERT INTO `employee_educations` VALUES (3,2,'Bachelors','B.Tech CSE','Computer Science','Usha Martin University',NULL,2021,2025,2025,'7.69','Full-Time','College','India','Ranchi',NULL,'2025-11-23 06:58:11','2025-11-23 06:58:11');
/*!40000 ALTER TABLE `employee_educations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_experiences`
--

DROP TABLE IF EXISTS `employee_experiences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_experiences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `employeeId` int NOT NULL,
  `organizationName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jobTitle` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employmentType` enum('Full-Time','Part-Time','Contract','Internship','Freelance') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `industryType` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `companyLocationCity` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `companyLocationCountry` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `startDate` date DEFAULT NULL,
  `endDate` date DEFAULT NULL,
  `isCurrent` tinyint(1) NOT NULL DEFAULT '0',
  `durationText` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jobLevel` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lastDrawnCtc` decimal(15,2) DEFAULT NULL,
  `reasonForLeaving` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `noticePeriodServed` tinyint(1) DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_employee_experiences_employee` (`employeeId`),
  CONSTRAINT `fk_employee_experiences_employee` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_experiences`
--

LOCK TABLES `employee_experiences` WRITE;
/*!40000 ALTER TABLE `employee_experiences` DISABLE KEYS */;
/*!40000 ALTER TABLE `employee_experiences` ENABLE KEYS */;
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
  `firstName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `middleName` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lastName` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `empId` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employeeType` enum('Permanent','Contract','Intern','Consultant','Trainee') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Permanent',
  `empName` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `gender` enum('Male','Female','Non-binary','Prefer not to say') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `maritalStatus` enum('Single','Married','Other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bloodGroup` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nationality` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `religion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `casteCategory` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `languagesKnown` text COLLATE utf8mb4_unicode_ci,
  `empDesignation` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `empDepartment` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `division` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subDepartment` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gradeBandLevel` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reportingManagerId` int DEFAULT NULL,
  `empWorkLoc` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `empDateOfJoining` date NOT NULL,
  `probationPeriodMonths` int DEFAULT NULL,
  `confirmationDate` date DEFAULT NULL,
  `employmentStatus` enum('Active','On Leave','Resigned','Terminated','Retired') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Active',
  `workMode` enum('On-site','Hybrid','Remote') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'On-site',
  `empDob` date NOT NULL,
  `empCtc` decimal(15,2) NOT NULL,
  `grossSalaryMonthly` decimal(15,2) DEFAULT NULL,
  `basicSalary` decimal(15,2) DEFAULT NULL,
  `hra` decimal(15,2) DEFAULT NULL,
  `conveyanceAllowance` decimal(15,2) DEFAULT NULL,
  `medicalAllowance` decimal(15,2) DEFAULT NULL,
  `specialAllowance` decimal(15,2) DEFAULT NULL,
  `performanceBonus` decimal(15,2) DEFAULT NULL,
  `variablePay` decimal(15,2) DEFAULT NULL,
  `overtimeEligible` tinyint(1) NOT NULL DEFAULT '0',
  `shiftAllowance` decimal(15,2) DEFAULT NULL,
  `pfDeduction` decimal(15,2) DEFAULT NULL,
  `esiDeduction` decimal(15,2) DEFAULT NULL,
  `professionalTax` decimal(15,2) DEFAULT NULL,
  `tdsDeduction` decimal(15,2) DEFAULT NULL,
  `netSalary` decimal(15,2) DEFAULT NULL,
  `shiftName` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shiftCode` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shiftStartTime` time DEFAULT NULL,
  `shiftEndTime` time DEFAULT NULL,
  `totalWorkHours` decimal(4,2) DEFAULT NULL,
  `breakDurationMinutes` int DEFAULT NULL,
  `shiftType` enum('Fixed','Rotational','Split','Flexible') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `shiftRotationCycle` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gracePeriodMinutes` int DEFAULT NULL,
  `halfDayRuleHours` decimal(4,2) DEFAULT NULL,
  `shiftEffectiveFrom` date DEFAULT NULL,
  `workTimezone` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `empAadhar` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL,
  `empPan` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `idProofType` enum('Aadhaar','PAN','Passport','Driving License','Voter ID','National ID','Other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `idProofNumber` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `idVerificationStatus` enum('Pending','Verified','Rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'Pending',
  `idVerificationDate` date DEFAULT NULL,
  `idVerifiedBy` int DEFAULT NULL,
  `idExpiryDate` date DEFAULT NULL,
  `idCountryOfIssue` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `workEmail` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `authMethod` enum('Password','SSO','SAML','OAuth','Other') COLLATE utf8mb4_unicode_ci DEFAULT 'Password',
  `mfaEnabled` tinyint(1) NOT NULL DEFAULT '0',
  `accountStatus` enum('Active','Locked','Suspended','Disabled') COLLATE utf8mb4_unicode_ci DEFAULT 'Active',
  `accountCreatedAt` datetime DEFAULT NULL,
  `lastLoginAt` datetime DEFAULT NULL,
  `lastPasswordResetAt` datetime DEFAULT NULL,
  `forcePasswordReset` tinyint(1) NOT NULL DEFAULT '0',
  `allowedLoginIps` text COLLATE utf8mb4_unicode_ci,
  `biometricEnabled` tinyint(1) NOT NULL DEFAULT '0',
  `passwordPolicyStatus` enum('Compliant','Non-compliant') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `systemRole` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exitType` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resignationDate` date DEFAULT NULL,
  `exitReason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `noticePeriodDays` int DEFAULT NULL,
  `noticeServed` tinyint(1) NOT NULL DEFAULT '0',
  `lastWorkingDay` date DEFAULT NULL,
  `exitStatus` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exitCategory` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `empEmail` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `empPhone` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `altPhone` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergencyContactName` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergencyContactRelation` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `emergencyContactNumber` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `presentAddressLine1` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `presentAddressLine2` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `presentCity` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `presentState` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `presentZip` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `presentCountry` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permanentSameAsPresent` tinyint(1) NOT NULL DEFAULT '0',
  `permanentAddressLine1` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permanentAddressLine2` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permanentCity` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permanentState` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permanentZip` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permanentCountry` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (2,6,'Mukesh',NULL,'Kumhar','EMP0001','Permanent','Mukesh Kumhar','Male','Single','B+','Indian','Hindu','OBC','English, Hindi','SD1','Development',NULL,NULL,NULL,NULL,'Ranchi','2025-05-09',NULL,NULL,'Active','Remote','2003-01-20',95000.00,8000.00,8000.00,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'867043993254','LAXPK2743Q',NULL,NULL,'Pending',NULL,NULL,NULL,NULL,NULL,NULL,'Password',0,'Active',NULL,NULL,NULL,0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,'mukeshkumhar906@gmail.com','9064784636',NULL,'Test','test','8967546753','Lalpur','Near Maa Ram Pyari Hospital','Ranchi','Jharkhand','834001','India',1,'Lalpur',NULL,'Ranchi','Jharkhand','834001','India',1,'2025-11-19 09:20:46','2025-11-21 10:21:36'),(3,6,'Sonam',NULL,'Agarwal','EMP0002','Permanent','Sonam Agarwal','Female','Single','B+',NULL,NULL,NULL,NULL,'Senior HR','HR',NULL,NULL,NULL,NULL,'Ranchi','2024-01-01',NULL,NULL,'Active','Remote','2000-01-18',240000.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'784637872536','MAPPK2743P',NULL,NULL,'Pending',NULL,NULL,NULL,NULL,NULL,NULL,'Password',0,'Active',NULL,NULL,NULL,0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,'sonam@gmail.com','6206992612',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,1,'2025-11-21 10:34:37','2025-11-21 10:43:28');
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
INSERT INTO `message_logs` VALUES (7,5,4,'+916206992612','wamid.HBgMOTE2MjA2OTkyNjEyFQIAERgSNDJDQTk2MkM1MTc2ODlGMzI5AA==','sent','{\"error\": {\"code\": 190, \"type\": \"OAuthException\", \"message\": \"Error validating access token: Session has expired on Tuesday, 07-Oct-25 07:00:00 PDT. The current time is Sunday, 16-Nov-25 01:32:57 PST.\", \"fbtrace_id\": \"ATNPdi-NfrqfJcG__yUAnyL\", \"error_subcode\": 463}}','2025-10-15 10:55:46','2025-11-16 09:37:48',NULL),(8,5,2,'+917348820668','wamid.HBgMOTE3MzQ4ODIwNjY4FQIAERgSMDMxMzFGNjNEQjc1NDIxQzg4AA==','sent','{\"error\": {\"code\": 190, \"type\": \"OAuthException\", \"message\": \"Error validating access token: Session has expired on Tuesday, 07-Oct-25 07:00:00 PDT. The current time is Sunday, 16-Nov-25 01:32:57 PST.\", \"fbtrace_id\": \"AnbGOMG0SNrGgar95cUjfmj\", \"error_subcode\": 463}}','2025-10-15 10:55:48','2025-11-16 09:37:50',NULL),(9,5,1,'+919064784636','wamid.HBgMOTE5MDY0Nzg0NjM2FQIAERgSOUM2MDlEMUE5MTZCRjZCN0NDAA==','sent','{\"error\": {\"code\": 190, \"type\": \"OAuthException\", \"message\": \"Error validating access token: Session has expired on Tuesday, 07-Oct-25 07:00:00 PDT. The current time is Sunday, 16-Nov-25 01:32:57 PST.\", \"fbtrace_id\": \"AZHUw-aNfZpphd3yCwc8UZW\", \"error_subcode\": 463}}','2025-10-15 10:55:49','2025-11-16 09:37:51',NULL);
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
-- Table structure for table `states`
--

DROP TABLE IF EXISTS `states`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `states` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `country_id` int unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(10) DEFAULT NULL,
  `status` enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_states_country_id` (`country_id`),
  CONSTRAINT `fk_states_country` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `states`
--

LOCK TABLES `states` WRITE;
/*!40000 ALTER TABLE `states` DISABLE KEYS */;
INSERT INTO `states` VALUES (1,1,'Andaman and Nicobar Islands','AN','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(2,1,'Chandigarh','CH','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(3,1,'Dadra and Nagar Haveli and Daman and Diu','DN','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(4,1,'Delhi','DL','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(5,1,'Jammu and Kashmir','JK','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(6,1,'Ladakh','LA','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(7,1,'Lakshadweep','LD','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(8,1,'Puducherry','PY','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(9,1,'Andhra Pradesh','AP','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(10,1,'Arunachal Pradesh','AR','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(11,1,'Assam','AS','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(12,1,'Bihar','BR','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(13,1,'Chhattisgarh','CT','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(14,1,'Goa','GA','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(15,1,'Gujarat','GJ','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(16,1,'Haryana','HR','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(17,1,'Himachal Pradesh','HP','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(18,1,'Jharkhand','JH','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(19,1,'Karnataka','KA','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(20,1,'Kerala','KL','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(21,1,'Madhya Pradesh','MP','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(22,1,'Maharashtra','MH','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(23,1,'Manipur','MN','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(24,1,'Meghalaya','ML','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(25,1,'Mizoram','MZ','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(26,1,'Nagaland','NL','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(27,1,'Odisha','OR','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(28,1,'Punjab','PB','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(29,1,'Rajasthan','RJ','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(30,1,'Sikkim','SK','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(31,1,'Tamil Nadu','TN','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(32,1,'Telangana','TG','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(33,1,'Tripura','TR','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(34,1,'Uttar Pradesh','UP','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(35,1,'Uttarakhand','UK','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53'),(36,1,'West Bengal','WB','ACTIVE','2025-11-23 11:21:53','2025-11-23 11:21:53');
/*!40000 ALTER TABLE `states` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,NULL,'Mukesh','Kumar','+919064784636','mukesh@gmail.com','$2b$10$a3W0zGIwr2Qn2Xr/7CQYiOLpzqDSne8F/pvQ6LI1nv/xMU56Rllrm','shop_owner','active','da5d5fc2c80054d0792bf7042a383ccbfb516060639cf8e83858b545f8fe7af3','2025-11-28 09:34:06','2025-10-12 04:51:58','2025-11-21 09:34:06'),(3,NULL,'Sonam','Agarwal','+916206992612','sonamagarwal878@gmail.com','$2b$10$XSQEUkG9XQlzXFGBFjTkKeR5D154fSwajAQPNq2oK.UvwGoYKOD4a','shop_owner','active','9a600714e14ea7077f411a48ea8f008cb224f3ca9d4b7b8f4ffc1d20d97b957e','2025-10-22 08:13:43','2025-10-14 03:54:45','2025-10-15 08:13:43'),(6,NULL,'Test','1','+916786786374','test@gmail.com','$2b$10$kf1KHLAn5SOZn17kUuweEODVVIryVCR3tTmgDauft9AVzfBfC3iW.','shop_owner','active','601db6463eade641b824fda91637da6eefbfae74a4cee9f050b57f929f722e22','2025-11-30 14:09:14','2025-11-16 14:11:35','2025-11-23 14:09:14');
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

-- Dump completed on 2025-11-25  9:37:38
