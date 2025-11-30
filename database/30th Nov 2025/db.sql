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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `document_types`
--

LOCK TABLES `document_types` WRITE;
/*!40000 ALTER TABLE `document_types` DISABLE KEYS */;
INSERT INTO `document_types` VALUES (1,'Salary Slip','SALARY_SLIP','fas fa-receipt','Monthly employee payslip','<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\" />\n  <title>Salary Slip - {{Month}}</title>\n  <style>\n    * {\n      box-sizing: border-box;\n      font-family: Arial, Helvetica, sans-serif;\n    }\n\n    body {\n      margin: 0;\n      padding: 0;\n      background: #f5f5f5;\n      font-size: 11px;\n    }\n\n    .page {\n      width: 100%;\n      max-width: 190mm; /* fits nicely inside A4 with Puppeteer margins */\n      margin: 0 auto;\n      padding: 10mm 8mm;\n      background: #ffffff;\n      border: 1px solid #d0d0d0;\n      box-shadow: 0 0 4mm rgba(0, 0, 0, 0.08);\n    }\n\n    @media print {\n      body {\n        background: #ffffff;\n      }\n      .page {\n        box-shadow: none;\n        border: none;\n        max-width: none;\n        width: auto;\n        margin: 0;\n        padding: 8mm 10mm;\n      }\n    }\n\n    .company-header {\n      text-align: center;\n      margin-bottom: 8px;\n    }\n\n    .company-name {\n      font-size: 16px;\n      font-weight: bold;\n      text-transform: uppercase;\n      letter-spacing: 0.5px;\n    }\n\n    .company-info {\n      margin-top: 4px;\n      line-height: 1.4;\n      font-size: 10px;\n    }\n\n    .separator {\n      margin: 10px 0;\n      border-top: 1px solid #999;\n    }\n\n    .title-bar {\n      text-align: center;\n      margin: 10px 0 12px 0;\n      font-size: 13px;\n      font-weight: bold;\n      text-decoration: underline;\n    }\n\n    .section-title {\n      font-weight: bold;\n      margin: 10px 0 5px 0;\n      font-size: 12px;\n      text-transform: uppercase;\n    }\n\n    .info-table {\n      width: 100%;\n      border-collapse: collapse;\n      margin-bottom: 4px;\n    }\n\n    .info-table td {\n      padding: 2px 4px;\n      vertical-align: top;\n      font-size: 11px;\n    }\n\n    .info-label {\n      width: 35%;\n      white-space: nowrap;\n    }\n\n    .info-label span {\n      font-weight: bold;\n    }\n\n    .info-value {\n      width: 65%;\n    }\n\n    .info-value span {\n      padding-left: 4px;\n    }\n\n    .salary-title {\n      margin-top: 12px;\n      font-weight: bold;\n      font-size: 12px;\n    }\n\n    .salary-table {\n      width: 100%;\n      border-collapse: collapse;\n      margin-top: 6px;\n      font-size: 11px;\n    }\n\n    .salary-table th,\n    .salary-table td {\n      border: 1px solid #000;\n      padding: 4px 5px;\n    }\n\n    .salary-table th {\n      background: #f0f0f0;\n      font-weight: bold;\n      text-align: center;\n    }\n\n    .salary-table td {\n      text-align: left;\n    }\n\n    .salary-table .right {\n      text-align: right;\n    }\n\n    .net-salary {\n      margin-top: 12px;\n      font-weight: bold;\n      font-size: 12px;\n    }\n\n    .footer-note {\n      margin-top: 16px;\n      font-size: 9px;\n      color: #555;\n    }\n  </style>\n</head>\n<body>\n  <div class=\"page\">\n    <!-- Company Header -->\n    <div class=\"company-header\">\n      <div class=\"company-name\">Seecog Softwares Private Limited</div>\n      <div class=\"company-info\">\n        CIN: U7220JH2021PTC017350<br />\n        Prestige Cube, Site No. 26, Laskar Hosur Road, Adugodi, Koramangala, Bengaluru, Karnataka 560030, India<br />\n        https://seecogsoftwares.com/ &nbsp; | &nbsp; Email: info@seecogsoftwares.com &nbsp; | &nbsp; Contact: +91-7625067691\n      </div>\n    </div>\n\n    <div class=\"separator\"></div>\n\n    <!-- Title -->\n    <div class=\"title-bar\">\n      Pay Slip for the Month of {{Month}}\n    </div>\n\n    <!-- Employee Info -->\n    <div class=\"section-title\">Employee Details</div>\n    <table class=\"info-table\">\n      <tr>\n        <td class=\"info-label\">\n          <span>Employee Name</span>\n        </td>\n        <td class=\"info-value\">\n          <span>: {{EMP_NAME}}</span>\n        </td>\n      </tr>\n      <tr>\n        <td class=\"info-label\">\n          <span>Designation</span>\n        </td>\n        <td class=\"info-value\">\n          <span>: {{DESIGNATION}}</span>\n        </td>\n      </tr>\n      <tr>\n        <td class=\"info-label\">\n          <span>Department</span>\n        </td>\n        <td class=\"info-value\">\n          <span>: {{DEPARTMENT}}</span>\n        </td>\n      </tr>\n      <tr>\n        <td class=\"info-label\">\n          <span>Location</span>\n        </td>\n        <td class=\"info-value\">\n          <span>: {{LOCATION}}</span>\n        </td>\n      </tr>\n      <tr>\n        <td class=\"info-label\">\n          <span>Employee Code</span>\n        </td>\n        <td class=\"info-value\">\n          <span>: {{EMP_CODE}}</span>\n        </td>\n      </tr>\n      <tr>\n        <td class=\"info-label\">\n          <span>Currency</span>\n        </td>\n        <td class=\"info-value\">\n          <span>: INR</span>\n        </td>\n      </tr>\n      <tr>\n        <td class=\"info-label\">\n          <span>Date of Birth</span>\n        </td>\n        <td class=\"info-value\">\n          <span>: {{DOB}}</span>\n        </td>\n      </tr>\n      <tr>\n        <td class=\"info-label\">\n          <span>Date of Joining</span>\n        </td>\n        <td class=\"info-value\">\n          <span>: {{DOJ}}</span>\n        </td>\n      </tr>\n      <tr>\n        <td class=\"info-label\">\n          <span>Job Type</span>\n        </td>\n        <td class=\"info-value\">\n          <span>: Full Time</span>\n        </td>\n      </tr>\n      <tr>\n        <td class=\"info-label\">\n          <span>PAN</span>\n        </td>\n        <td class=\"info-value\">\n          <span>: {{PAN}}</span>\n        </td>\n      </tr>\n      <tr>\n        <td class=\"info-label\">\n          <span>No. of Days Paid</span>\n        </td>\n        <td class=\"info-value\">\n          <span>: {{DAYS_PAID}}</span>\n        </td>\n      </tr>\n      <tr>\n        <td class=\"info-label\">\n          <span>No. of Working Days</span>\n        </td>\n        <td class=\"info-value\">\n          <span>: {{WORK_DAYS}}</span>\n        </td>\n      </tr>\n    </table>\n\n    <!-- Salary Details -->\n    <div class=\"salary-title\">Salary Details</div>\n\n    <table class=\"salary-table\">\n      <tr>\n        <th colspan=\"3\">Earnings (₹)</th>\n        <th colspan=\"2\">Deductions (₹)</th>\n      </tr>\n      <tr>\n        <th>Components</th>\n        <th>Actual Rate (₹)</th>\n        <th>Earnings (₹)</th>\n        <th>Components</th>\n        <th>Deductions (₹)</th>\n      </tr>\n      <tr>\n        <td>Basic</td>\n        <td class=\"right\">{{BASIC}}</td>\n        <td class=\"right\">{{BASIC}}</td>\n        <td>Provident Fund (PF)</td>\n        <td class=\"right\">{{PF}}</td>\n      </tr>\n      <tr>\n        <td>H.R.A</td>\n        <td class=\"right\">{{HRA}}</td>\n        <td class=\"right\">{{HRA}}</td>\n        <td>ESI</td>\n        <td class=\"right\">{{ESI}}</td>\n      </tr>\n      <tr>\n        <td>Special Allowance</td>\n        <td class=\"right\">{{SPECIAL}}</td>\n        <td class=\"right\">{{SPECIAL}}</td>\n        <td>Income Tax / TDS</td>\n        <td class=\"right\">{{TDS}}</td>\n      </tr>\n      <tr>\n        <td><strong>Total</strong></td>\n        <td class=\"right\"><strong>{{TOTAL_EARNINGS}}</strong></td>\n        <td class=\"right\"><strong>{{TOTAL_EARNINGS}}</strong></td>\n        <td><strong>Total</strong></td>\n        <td class=\"right\"><strong>{{TOTAL_DEDUCTIONS}}</strong></td>\n      </tr>\n    </table>\n\n    <div class=\"net-salary\">\n      Net Salary Payable: ₹{{NET_SALARY}}\n    </div>\n\n    <div class=\"footer-note\">\n      This is a system generated salary slip and does not require a physical signature.\n    </div>\n  </div>\n</body>\n</html>\n',0,'2025-11-28 06:24:56','2025-11-28 11:33:40',NULL),(6,'Internship Offer Letter','INTERNSHIP_OFFER','fas fa-file-contract','Formal internship offer letter issued to selected candidates, detailing role, duration, stipend, reporting manager, working hours, and basic terms and conditions.','<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\" />\n  <title>Internship Offer Letter - {{Full Name}}</title>\n  <style>\n    * {\n      box-sizing: border-box;\n      font-family: Arial, Helvetica, sans-serif;\n    }\n\n    body {\n      margin: 0;\n      padding: 0;\n      background: #f5f5f5;\n      font-size: 11px;\n      line-height: 1.6;\n    }\n\n    .page {\n      width: 100%;\n      max-width: 190mm; /* fits nicely within A4 with Puppeteer margins */\n      margin: 0 auto;\n      padding: 12mm 10mm;\n      background: #ffffff;\n      border: 1px solid #d0d0d0;\n      box-shadow: 0 0 4mm rgba(0, 0, 0, 0.06);\n    }\n\n    @media print {\n      body {\n        background: #ffffff;\n      }\n      .page {\n        box-shadow: none;\n        border: none;\n        max-width: none;\n        width: auto;\n        margin: 0;\n        padding: 10mm 12mm;\n      }\n    }\n\n    .header {\n      text-align: center;\n      margin-bottom: 10px;\n    }\n\n    .company-name {\n      font-size: 16px;\n      font-weight: bold;\n      text-transform: uppercase;\n      letter-spacing: 0.5px;\n    }\n\n    .company-info {\n      margin-top: 4px;\n      font-size: 10px;\n      line-height: 1.4;\n    }\n\n    .line-separator {\n      margin: 10px 0;\n      border-top: 1px solid #999;\n    }\n\n    .meta-table {\n      width: 100%;\n      border-collapse: collapse;\n      margin-bottom: 12px;\n      font-size: 11px;\n    }\n\n    .meta-table td {\n      padding: 2px 0;\n      vertical-align: top;\n    }\n\n    .meta-label {\n      width: 60px;\n      font-weight: bold;\n      white-space: nowrap;\n    }\n\n    .meta-value {\n      padding-left: 4px;\n    }\n\n    .subject {\n      font-size: 13px;\n      font-weight: bold;\n      text-align: center;\n      margin: 10px 0 14px 0;\n      text-transform: none;\n      text-decoration: underline;\n    }\n\n    .body {\n      font-size: 11px;\n      text-align: justify;\n    }\n\n    .body p {\n      margin: 4px 0 8px 0;\n    }\n\n    .salutation {\n      margin-bottom: 8px;\n    }\n\n    .closing {\n      margin-top: 18px;\n    }\n\n    .closing p {\n      margin: 2px 0;\n    }\n\n    .signature-block {\n      margin-top: 18px;\n    }\n\n    .signature-name {\n      margin-top: 30px;\n      font-weight: bold;\n    }\n\n    .signature-title {\n      margin-top: 2px;\n    }\n\n    .acceptance {\n      margin-top: 30px;\n      font-size: 11px;\n    }\n\n    .acceptance-title {\n      font-weight: bold;\n      margin-bottom: 8px;\n    }\n\n    .acceptance-line {\n      margin: 6px 0;\n    }\n  </style>\n</head>\n<body>\n  <div class=\"page\">\n    <!-- Company Letterhead -->\n    <div class=\"header\">\n      <div class=\"company-name\">Seecog Softwares Private Limited</div>\n      <div class=\"company-info\">\n        CIN: U7220JH2021PTC017350<br />\n        Prestige Cube, Site No. 26, Laskar Hosur Road, Adugodi, Koramangala, Bengaluru, Karnataka 560030, India<br />\n        https://seecogsoftwares.com/ &nbsp; | &nbsp; Email: info@seecogsoftwares.com &nbsp; | &nbsp; Contact No: +91-7625067691\n      </div>\n    </div>\n\n    <div class=\"line-separator\"></div>\n\n    <!-- Name / Location -->\n    <table class=\"meta-table\">\n      <tr>\n        <td class=\"meta-label\">Name:</td>\n        <td class=\"meta-value\">{{Full Name}}</td>\n      </tr>\n      <tr>\n        <td class=\"meta-label\">Location:</td>\n        <td class=\"meta-value\">\n          Prestige Cube, Site No. 26, Laskar Hosur Road, Adugodi, Koramangala, Bengaluru, Karnataka 560030, India\n        </td>\n      </tr>\n    </table>\n\n    <!-- Subject -->\n    <div class=\"subject\">\n      Internship Offer Letter\n    </div>\n\n    <!-- Letter Body -->\n    <div class=\"body\">\n      <div class=\"salutation\">\n        Dear {{Full Name}},\n      </div>\n\n      <p>\n        We are pleased to offer you the position of <strong>Intern-{{Designation}}</strong> at\n        <strong>Seecog Softwares Pvt. Ltd.</strong> Your selection is based on your academic\n        background and interest in gaining practical experience in the software industry.\n      </p>\n\n      <p>The details of your internship are as follows:</p>\n\n      <p>\n        Your internship will commence on <strong>{{Start Date}}</strong> and end on\n        <strong>{{End Date}}</strong>. The duration of the internship is\n        <strong>{{Number of Months}}</strong>.\n      </p>\n\n      <p>\n        You will be working in the <strong>{{Department Name}}</strong> department and will report to\n        <strong>“{{SupervisorName}} / {{SupervisorDesignation}}”</strong>.\n      </p>\n\n      <p>\n        You are expected to follow the company’s standard working hours\n        <strong>“{{Working Hours}}”</strong>.\n      </p>\n\n      <p>\n        You will be paid a monthly stipend of\n        <strong>₹{{Amount}} (Rupees {{Amount in Words}} only)</strong>, subject to satisfactory\n        attendance and performance.\n      </p>\n\n      <p>\n        Upon successful completion of the internship and submission of required reports or tasks,\n        you will be issued an Internship Completion Certificate.\n      </p>\n\n      <p>\n        During the course of your internship, you may be exposed to sensitive company information.\n        You are required to maintain confidentiality and not disclose such information during or\n        after your internship.\n      </p>\n\n      <p>\n        Professional behavior and adherence to company policies are expected during your internship\n        period.\n      </p>\n\n      <p>\n        Please sign and return a copy of this letter as a token of your acceptance of the terms and\n        conditions stated above.\n      </p>\n\n      <p>\n        We are excited to welcome you to <strong>Seecog Softwares Pvt. Ltd.</strong> and hope that\n        this internship will be a valuable learning experience for you.\n      </p>\n\n      <!-- Closing & Signature -->\n      <div class=\"closing\">\n        <p>Your’s sincerely,</p>\n        <p>For Seecog Softwares Pvt. Ltd.</p>\n\n        <div class=\"signature-block\">\n          <div class=\"signature-name\">Ms. Sonam Agarwal</div>\n          <div class=\"signature-title\">HR Manager</div>\n          <div class=\"signature-title\">Email: sonam@seecogsoftwares.com</div>\n          <div class=\"signature-title\">Authorized Signatory</div>\n        </div>\n      </div>\n\n      <!-- Acceptance Section -->\n      <div class=\"acceptance\">\n        <div class=\"acceptance-title\">Accepted and Agreed</div>\n\n        <div class=\"acceptance-line\">\n          {{Full Name}}\n        </div>\n        <div class=\"acceptance-line\">\n          Date: ___ / ___ / 2025\n        </div>\n      </div>\n    </div>\n  </div>\n</body>\n</html>\n',0,'2025-11-29 07:59:01','2025-11-29 08:14:23',NULL),(7,'Pre-Placement Offer Letter (PPO)','PRE_PLACEMENT_OFFER','fas fa-briefcase','Pre-Placement Offer letter issued to high-performing interns, confirming future full-time employment with details of role, employment type, work location, CTC, joining date, and acceptance instructions.','<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\" />\n  <title>Pre-Placement Offer Letter - {{Name}}</title>\n  <style>\n    * {\n      box-sizing: border-box;\n      font-family: Arial, Helvetica, sans-serif;\n    }\n\n    body {\n      margin: 0;\n      padding: 0;\n      background: #f5f5f5;\n      font-size: 11px;\n      line-height: 1.6;\n    }\n\n    .page {\n      width: 100%;\n      max-width: 190mm; /* fits nicely within A4 with Puppeteer margins */\n      margin: 0 auto;\n      padding: 12mm 10mm;\n      background: #ffffff;\n      border: 1px solid #d0d0d0;\n      box-shadow: 0 0 4mm rgba(0, 0, 0, 0.06);\n    }\n\n    @media print {\n      body {\n        background: #ffffff;\n      }\n      .page {\n        box-shadow: none;\n        border: none;\n        max-width: none;\n        width: auto;\n        margin: 0;\n        padding: 10mm 12mm;\n      }\n    }\n\n    .header {\n      text-align: center;\n      margin-bottom: 10px;\n    }\n\n    .company-name {\n      font-size: 16px;\n      font-weight: bold;\n      text-transform: uppercase;\n      letter-spacing: 0.5px;\n    }\n\n    .company-info {\n      margin-top: 4px;\n      font-size: 10px;\n      line-height: 1.4;\n    }\n\n    .line-separator {\n      margin: 10px 0;\n      border-top: 1px solid #999;\n    }\n\n    .meta-table {\n      width: 100%;\n      border-collapse: collapse;\n      margin-bottom: 12px;\n      font-size: 11px;\n    }\n\n    .meta-table td {\n      padding: 2px 0;\n      vertical-align: top;\n    }\n\n    .meta-label {\n      width: 100px;\n      font-weight: bold;\n      white-space: nowrap;\n    }\n\n    .meta-value {\n      padding-left: 4px;\n    }\n\n    .subject {\n      font-size: 13px;\n      font-weight: bold;\n      text-align: center;\n      margin: 10px 0 14px 0;\n      text-transform: none;\n      text-decoration: underline;\n    }\n\n    .body {\n      font-size: 11px;\n      text-align: justify;\n    }\n\n    .body p {\n      margin: 4px 0 8px 0;\n    }\n\n    .salutation {\n      margin-bottom: 8px;\n    }\n\n    .details-table {\n      width: 100%;\n      border-collapse: collapse;\n      margin: 8px 0 12px 0;\n      font-size: 11px;\n    }\n\n    .details-table td {\n      padding: 3px 0;\n      vertical-align: top;\n    }\n\n    .details-label {\n      width: 130px;\n      font-weight: bold;\n      white-space: nowrap;\n    }\n\n    .details-value {\n      padding-left: 4px;\n    }\n\n    .conditions-list {\n      margin: 6px 0 10px 18px;\n      padding: 0;\n    }\n\n    .conditions-list li {\n      margin-bottom: 4px;\n    }\n\n    .closing {\n      margin-top: 18px;\n    }\n\n    .closing p {\n      margin: 2px 0;\n    }\n\n    .signature-block {\n      margin-top: 18px;\n    }\n\n    .signature-name {\n      margin-top: 30px;\n      font-weight: bold;\n    }\n\n    .signature-title {\n      margin-top: 2px;\n    }\n  </style>\n</head>\n<body>\n  <div class=\"page\">\n    <!-- Company Letterhead -->\n    <div class=\"header\">\n      <div class=\"company-name\">Seecog Softwares Private Limited</div>\n      <div class=\"company-info\">\n        CIN: U7220JH2021PTC017350<br />\n        Prestige Cube, Site No. 26, Laskar Hosur Road, Adugodi, Koramangala, Bengaluru, Karnataka 560030, India<br />\n        https://seecogsoftwares.com/ &nbsp; | &nbsp; Email: info@seecogsoftwares.com &nbsp; | &nbsp; Contact No: +91-7625067691\n      </div>\n    </div>\n\n    <div class=\"line-separator\"></div>\n\n    <!-- Candidate Meta -->\n    <table class=\"meta-table\">\n      <tr>\n        <td class=\"meta-label\">Candidate Name:</td>\n        <td class=\"meta-value\">{{Name}}</td>\n      </tr>\n      <tr>\n        <td class=\"meta-label\">Designation:</td>\n        <td class=\"meta-value\">{{Designation}}</td>\n      </tr>\n      <tr>\n        <td class=\"meta-label\">Location:</td>\n        <td class=\"meta-value\">\n          Prestige Cube, Site No. 26, Laskar Hosur Road, Adugodi, Koramangala, Bengaluru, Karnataka 560030, India\n        </td>\n      </tr>\n    </table>\n\n    <!-- Subject -->\n    <div class=\"subject\">\n      Pre-Placement Offer (PPO)\n    </div>\n\n    <!-- Letter Body -->\n    <div class=\"body\">\n      <div class=\"salutation\">\n        Dear {{Name}},\n      </div>\n\n      <p>\n        We are pleased to inform you that, based on your outstanding performance during your internship at\n        <strong>Seecog Softwares Pvt. Ltd.</strong>, we would like to extend to you a\n        <strong>Pre-Placement Offer (PPO)</strong> for the position of <strong>{{Designation}}</strong>\n        at our Bengaluru office.\n      </p>\n\n      <p>\n        This offer stands as a recognition of your professional conduct, technical proficiency, and alignment\n        with our company’s values and expectations.\n      </p>\n\n      <!-- PPO Details -->\n      <table class=\"details-table\">\n        <tr>\n          <td class=\"details-label\">Position:</td>\n          <td class=\"details-value\">{{Designation}}</td>\n        </tr>\n        <tr>\n          <td class=\"details-label\">Employment Type:</td>\n          <td class=\"details-value\">{{Employment Type}}</td>\n        </tr>\n        <tr>\n          <td class=\"details-label\">Work Location:</td>\n          <td class=\"details-value\">\n            Prestige Cube, Site No. 26, Laskar Hosur Road, Adugodi, Koramangala, Bengaluru, Karnataka 560030, India\n          </td>\n        </tr>\n        <tr>\n          <td class=\"details-label\">Annual CTC:</td>\n          <td class=\"details-value\">{{CTC}}</td>\n        </tr>\n        <tr>\n          <td class=\"details-label\">Joining Date:</td>\n          <td class=\"details-value\">{{Joining Date}}</td>\n        </tr>\n      </table>\n\n      <p>\n        Your CTC includes a fixed monthly salary of <strong>{{Monthly Salary}}</strong>, payable without\n        deductions for Provident Fund, Income Tax as per current company policy. A detailed offer letter with\n        salary breakup and terms will be shared closer to the joining date.\n      </p>\n\n      <p>The following conditions are applicable to this Pre-Placement Offer:</p>\n\n      <ul class=\"conditions-list\">\n        <li>Successful completion of your current academic program with no pending backlogs.</li>\n        <li>Submission of all required documents during onboarding.</li>\n        <li>Signing of the final employment agreement on or before the joining date.</li>\n      </ul>\n\n      <p>\n        Please confirm your acceptance of this PPO by replying to this email and sending a signed copy of this\n        letter within 7 days from the date of issue.\n      </p>\n\n      <p>\n        We are excited to welcome you to the Seecog team and look forward to a long and successful association\n        with you.\n      </p>\n\n      <!-- Closing & Signature -->\n      <div class=\"closing\">\n        <p>Your’s sincerely,</p>\n        <p>For Seecog Softwares Pvt. Ltd.</p>\n\n        <div class=\"signature-block\">\n          <div class=\"signature-name\">Ms. Sonam Agarwal</div>\n          <div class=\"signature-title\">Email: sonam@seecogsoftwares.com</div>\n          <div class=\"signature-title\">Authorized Signatory</div>\n        </div>\n      </div>\n    </div>\n  </div>\n</body>\n</html>\n',0,'2025-11-29 08:02:28','2025-11-29 08:14:16',NULL),(8,'Employment Offer Letter','OFFER_LETTER','fas fa-file-signature','Formal employment offer letter detailing position, location, joining date, CTC structure, terms and conditions, required documents, leave policy, working hours, and candidate acknowledgement.','<!DOCTYPE html>\n<html lang=\"en\">\n\n<head>\n  <meta charset=\"UTF-8\" />\n  <title>Offer Letter - Seecog Softwares Pvt. Ltd.</title>\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n\n  <style>\n    :root {\n      --primary-text: #222222;\n      --muted-text: #555555;\n      --accent: #0056b3;\n      --border: #dddddd;\n      --font-family: \"Segoe UI\", system-ui, -apple-system, BlinkMacSystemFont,\n        \"Helvetica Neue\", Arial, sans-serif;\n    }\n\n    * {\n      box-sizing: border-box;\n    }\n\n    body {\n      margin: 0;\n      padding: 0;\n      background: #f2f2f2;\n      font-family: var(--font-family);\n      color: var(--primary-text);\n      line-height: 1.5;\n      font-size: 13px;\n    }\n\n    .a4-sheet {\n      width: 210mm;\n      min-height: 297mm;\n      margin: 10mm auto;\n      background: #ffffff;\n      padding: 15mm 18mm;\n      box-shadow: 0 0 6mm rgba(0, 0, 0, 0.08);\n      position: relative;\n    }\n\n    /* PRINT STYLES */\n    @page {\n      size: A4;\n      margin: 15mm 15mm 15mm 15mm;\n    }\n\n    @media print {\n      body {\n        background: #ffffff;\n      }\n\n      .a4-sheet {\n        margin: 0;\n        width: auto;\n        min-height: auto;\n        padding: 0;\n        box-shadow: none;\n        page-break-after: always;\n      }\n\n      .no-print {\n        display: none !important;\n      }\n    }\n\n    /* RESPONSIVE (screen) */\n    @media (max-width: 900px) {\n      .a4-sheet {\n        width: 100%;\n        min-height: auto;\n        margin: 0;\n        padding: 10px;\n        box-shadow: none;\n      }\n\n      .letter-header {\n        flex-direction: row;\n        align-items: flex-start;\n        gap: 12px;\n      }\n\n      .company-details {\n        text-align: right;\n      }\n    }\n\n    .letter-header {\n      display: flex;\n      justify-content: flex-start;\n      align-items: flex-start;\n      gap: 16px;\n      border-bottom: 2px solid var(--border);\n      padding-bottom: 10px;\n      margin-bottom: 10px;\n    }\n\n    .logo-wrapper {\n      flex: 0 0 90px;\n    }\n\n    .logo-wrapper img {\n      max-height: 60px;\n      width: auto;\n      display: block;\n    }\n\n    .company-details {\n      flex: 1;\n      text-align: right;\n      font-size: 11px;\n      color: var(--muted-text);\n    }\n\n    .company-details h1 {\n      margin: 0 0 4px;\n      font-size: 16px;\n      font-weight: 700;\n      color: var(--primary-text);\n    }\n\n    .company-details .cin {\n      font-weight: 600;\n      font-size: 11px;\n    }\n\n    .company-details a {\n      color: var(--accent);\n      text-decoration: none;\n    }\n\n    .company-details a:hover {\n      text-decoration: underline;\n    }\n\n    .letter-meta {\n      margin-top: 10px;\n      margin-bottom: 16px;\n      font-size: 12px;\n    }\n\n    .letter-meta .dated {\n      text-align: right;\n    }\n\n    .letter-title {\n      text-align: center;\n      margin: 8px 0 16px;\n      font-size: 18px;\n      font-weight: 700;\n      text-decoration: underline;\n      letter-spacing: 1px;\n    }\n\n    .letter-body {\n      font-size: 13px;\n      color: var(--primary-text);\n    }\n\n    .letter-body p {\n      margin: 4px 0 8px;\n      text-align: justify;\n    }\n\n    .letter-body p strong {\n      font-weight: 600;\n    }\n\n    .section-heading {\n      font-weight: 600;\n      margin-top: 10px;\n      margin-bottom: 4px;\n      font-size: 13px;\n      text-decoration: underline;\n    }\n\n    .section-subheading {\n      font-weight: 600;\n      margin-top: 6px;\n      margin-bottom: 4px;\n      font-size: 13px;\n    }\n\n    ul,\n    ol {\n      margin: 4px 0 8px 18px;\n      padding-left: 12px;\n    }\n\n    li {\n      margin: 2px 0;\n    }\n\n    .salary-table-wrapper {\n      margin: 8px 0 10px;\n      overflow-x: auto;\n    }\n\n    .salary-table {\n      width: 100%;\n      border-collapse: collapse;\n      font-size: 12px;\n    }\n\n    .salary-table th,\n    .salary-table td {\n      border: 1px solid var(--border);\n      padding: 6px 8px;\n      text-align: left;\n    }\n\n    .salary-table th {\n      background: #f5f5f5;\n      font-weight: 600;\n    }\n\n    .salary-table td:nth-child(2),\n    .salary-table td:nth-child(3),\n    .salary-table th:nth-child(2),\n    .salary-table th:nth-child(3) {\n      text-align: right;\n      white-space: nowrap;\n    }\n\n    .net-pay {\n      margin-top: 4px;\n      margin-bottom: 4px;\n      font-weight: 600;\n    }\n\n    .note-text {\n      font-size: 11px;\n      color: var(--muted-text);\n      margin-bottom: 10px;\n    }\n\n    .signature-section {\n      display: flex;\n      justify-content: space-between;\n      gap: 18px;\n      margin-top: 18px;\n      font-size: 12px;\n    }\n\n    .signature-block {\n      width: 50%;\n    }\n\n    .signature-block p {\n      margin: 2px 0;\n    }\n\n    .signature-label {\n      margin-top: 12px;\n    }\n\n    .signature-line {\n      margin-top: 24px;\n      border-top: 1px solid var(--border);\n      width: 150px;\n      display: inline-block;\n    }\n\n    .signer-name {\n      font-weight: 600;\n      margin-top: 6px;\n    }\n\n    .designation-text {\n      font-size: 11px;\n      color: var(--muted-text);\n    }\n\n    .signature-images {\n      margin-top: 8px;\n      display: flex;\n      align-items: center;\n      gap: 12px;\n    }\n\n    .signature-images img {\n      max-height: 60px;\n      width: auto;\n      display: block;\n    }\n\n    .candidate-ack-title {\n      font-weight: 600;\n      margin-bottom: 6px;\n      text-decoration: underline;\n    }\n\n    .candidate-ack-block {\n      margin-top: 8px;\n    }\n  </style>\n</head>\n\n<body>\n  <div class=\"a4-sheet\">\n    <!-- HEADER -->\n    <header class=\"letter-header\">\n      <div class=\"logo-wrapper\">\n        <img src=\"{{LOGO_SRC}}\" alt=\"Seecog Softwares Pvt. Ltd. Logo\" />\n      </div>\n\n      <div class=\"company-details\">\n        <h1>Seecog Softwares Pvt. Ltd.</h1>\n        <div class=\"cin\">\n          CIN: IN/U7220JH2021PTC017350\n        </div>\n        <div>\n          Prestige Cube, Site No. 26, Laskar Hosur Road, Adugodi,<br />\n          Koramangala, Bengaluru, Karnataka 560030, India\n        </div>\n        <div>\n          Website:\n          <a href=\"https://seecogsoftwares.com\" target=\"_blank\">seecogsoftwares.com</a>\n        </div>\n        <div>Email: info@seecogsoftwares.com</div>\n        <div>Contact No: +91-7625067691</div>\n      </div>\n    </header>\n\n    <!-- META -->\n    <section class=\"letter-meta\">\n      <div class=\"dated\">\n        Dated:\n        <strong>{{offerDate}}</strong>\n      </div>\n    </section>\n\n    <!-- TITLE -->\n    <h2 class=\"letter-title\">OFFER LETTER</h2>\n\n    <!-- BODY -->\n    <main class=\"letter-body\">\n      <p>\n        Dear <strong>{{fullName}}</strong>,\n      </p>\n\n      <p>\n        We are delighted to offer you the position of\n        <strong>{{designation}}</strong> at\n        <strong>Seecog Softwares Pvt. Ltd.</strong>, following your successful\n        application and interview process. The details of your offer are as follows:\n      </p>\n\n      <!-- Position and Location -->\n      <p class=\"section-heading\">1. Position and Location</p>\n      <p>\n        You will be designated as <strong>{{designation}}</strong>. Your initial posting\n        location will be:\n      </p>\n      <p>\n        Prestige Cube, Site No. 26, Laskar Hosur Road, Adugodi,<br />\n        Koramangala, Bengaluru, Karnataka – 560030.\n      </p>\n      <p>\n        The company may transfer you to any other location in India based on operational\n        requirements.\n      </p>\n\n      <!-- Date of Joining -->\n      <p class=\"section-heading\">2. Date of Joining</p>\n      <p>\n        Your expected joining date is\n        <strong>{{joiningDate}}</strong>, subject to the satisfactory completion of\n        Background Verification (BGV).\n      </p>\n\n      <!-- Compensation Structure -->\n      <p class=\"section-heading\">3. Compensation Structure</p>\n      <p>\n        Your total Cost to Company (CTC) will be\n        <strong>₹{{ctc}}</strong> (<strong>{{ctcInWords}}</strong>) annually.\n        This CTC consists of a fixed gross salary component (paid monthly) and a\n        performance-linked variable pay component. There are no deductions towards\n        Provident Fund (PF), Income Tax (TDS), or Employee State Insurance (ESI).\n        Only statutory Professional Tax, wherever applicable, will be deducted from\n        your monthly fixed salary.\n      </p>\n\n      <div class=\"salary-table-wrapper\">\n        <table class=\"salary-table\">\n          <thead>\n            <tr>\n              <th>Component</th>\n              <th>Monthly (₹)</th>\n              <th>Annually (₹)</th>\n            </tr>\n          </thead>\n          <tbody>\n            <tr>\n              <td>Basic Salary</td>\n              <td>₹{{basicMonth}}</td>\n              <td>₹{{basicAnnual}}</td>\n            </tr>\n            <tr>\n              <td>House Rent Allowance (HRA)</td>\n              <td>₹{{hraMonth}}</td>\n              <td>₹{{hraAnnual}}</td>\n            </tr>\n            <tr>\n              <td>Special Allowance</td>\n              <td>₹{{specialAllowanceMonth}}</td>\n              <td>₹{{specialAllowanceAnnual}}</td>\n            </tr>\n            <tr>\n              <td><strong>Fixed Gross Salary (before Professional Tax)</strong></td>\n              <td><strong>₹{{grossMonth}}</strong></td>\n              <td><strong>₹{{grossAnnual}}</strong></td>\n            </tr>\n            <tr>\n              <td>Variable Pay (CTC Component)</td>\n              <td>₹{{variablePayMonth}}</td>\n              <td>₹{{variablePayAnnual}}</td>\n            </tr>\n            <tr>\n              <td><strong>Total CTC</strong></td>\n              <td>-</td>\n              <td><strong>₹{{ctc}}</strong></td>\n            </tr>\n          </tbody>\n        </table>\n      </div>\n\n      <p class=\"net-pay\">\n        Net Take-Home (after Professional Tax, excluding Variable Pay):\n        <strong>₹{{netPay}}</strong> per month\n      </p>\n      <p class=\"note-text\">\n        Note: No PF, ESI, or TDS deductions are applicable. Only statutory Professional\n        Tax, where applicable as per state laws, will be deducted from the monthly\n        fixed gross salary. Variable pay, if applicable, will be paid separately as\n        per company policy and performance criteria.\n      </p>\n\n      <!-- Terms and Conditions -->\n      <p class=\"section-heading\">4. Terms and Conditions</p>\n\n      <p class=\"section-subheading\">a) Work Responsibilities</p>\n      <p>\n        You are expected to perform the duties of your role diligently. Additional\n        responsibilities or transfers (including deputation to clients or other\n        branches) may be assigned as required.\n      </p>\n\n      <p class=\"section-subheading\">b) Employment on Deputation</p>\n      <p>\n        You will remain a Seecog Softwares Pvt. Ltd. employee during any client\n        assignments and will not be eligible for client employment benefits.\n      </p>\n\n      <p class=\"section-subheading\">c) Conduct &amp; Ethics</p>\n      <p>\n        You are required to maintain strict confidentiality and ethical standards.\n        Outside employment is not allowed without prior written permission.\n      </p>\n\n      <p class=\"section-subheading\">d) Termination</p>\n      <p>\n        Either party may terminate this employment by providing\n        <strong>30 days\' written notice</strong> or salary in lieu of notice. If\n        you resign within one year, the company reserves the right to recover BGV or\n        other third-party expenses incurred on your behalf.\n      </p>\n\n      <p class=\"section-subheading\">e) Confidentiality</p>\n      <p>\n        Disclosure of proprietary, financial, or strategic information is strictly\n        prohibited during and after your employment with the company.\n      </p>\n\n      <!-- Documents Required -->\n      <p class=\"section-heading\">5. Documents Required on Joining</p>\n      <p>\n        Please carry the following documents (originals + 2 copies) on the date of joining:\n      </p>\n      <ul>\n        <li>Updated Resume</li>\n        <li>Educational Certificates and Mark Sheets (10th onwards)</li>\n        <li>Experience Letter and No Dues Certificate (if applicable)</li>\n        <li>Last Drawn Salary Slip (if applicable)</li>\n        <li>4 Recent Passport-size Color Photographs</li>\n        <li>Valid Photo ID (Aadhaar / PAN / Passport / Voter ID)</li>\n        <li>Permanent Address Proof</li>\n        <li>Cancelled Cheque</li>\n        <li>Two Professional References (if applicable)</li>\n      </ul>\n\n      <!-- Leave and Holidays -->\n      <p class=\"section-heading\">\n        6. Privilege and Casual Leave (Vacation) Entitlement and Paid Holidays\n      </p>\n      <ul>\n        <li>\n          You will be entitled to <strong>22 days of privilege leave</strong> per\n          completed calendar year of service. Privilege leave will be accrued on the\n          basis of five and a half days of leave for each three months of continuous\n          employment.\n        </li>\n        <li>\n          Privilege leave will be taken by you at times that will be determined\n          depending upon the requirements of the business activities of the Company\n          and the provisions of national law, unless the Company and you otherwise\n          specifically agree.\n        </li>\n        <li>\n          Privilege leave entitlement must be taken in the first calendar year in which\n          it may be discharged. However, you will be entitled to carry forward privilege\n          leave up to a maximum of twenty-two days.\n        </li>\n        <li>\n          You will be entitled to a maximum of <strong>8 sick leave days</strong> per\n          completed year of service.\n        </li>\n        <li>\n          You will enjoy <strong>10 paid holidays</strong> as established by the Company\n          in conformance with the laws of India.\n        </li>\n      </ul>\n\n      <!-- Hours and Business Travel -->\n      <p class=\"section-heading\">7. Hours and Business Travel</p>\n      <p>\n        The working hours under this Agreement will be forty (40) hours per week. The\n        Company business day is generally from <strong>10:00 AM to 6:00 PM</strong>.\n        Notwithstanding, your duties may require you to engage in travel on behalf of\n        the Company, and to work at hours required by the nature of the business of the\n        Company. You expressly agree to accept such reasonable travel and hours of work\n        without additional compensation.\n      </p>\n      <p>\n        Business travel and assignments outside of India will be notified to you in\n        advance, but you agree that you will not refuse such travel and assignments\n        without imperative reasons.\n      </p>\n\n      <!-- Benefits Plans -->\n      <p class=\"section-heading\">8. Benefits Plans</p>\n      <p>\n        You will be entitled to participate in the Company benefit plans, as may be\n        established from time to time, at such times as you qualify for them or, as the\n        case may be, as you are selected for participation in them. The Company reserves\n        the right to amend or discontinue such benefit programs in its sole discretion\n        and without compensation to you for such amendment or discontinuance.\n      </p>\n\n      <!-- Conditional Clause -->\n      <p class=\"section-heading\">9. Offer Validity and Acceptance</p>\n      <p>\n        This offer is subject to verification of your documents and background. Any\n        discrepancy may result in revocation of this offer or termination of employment.\n      </p>\n      <p>\n        To confirm acceptance, please reply by email and send back a signed copy of\n        this letter within <strong>2 working days</strong>.\n      </p>\n\n      <p>\n        We welcome you to the <strong>Seecog family</strong> and look forward to a\n        successful journey together.\n      </p>\n\n      <!-- SIGNATURES -->\n      <section class=\"signature-section\">\n        <!-- Company Signatory -->\n        <div class=\"signature-block\">\n          <p>Warm regards,</p>\n          <p><strong>For Seecog Softwares Pvt. Ltd.</strong></p>\n\n          <div class=\"signature-images\">\n            <img src=\"{{STAMP_SRC}}\" alt=\"Company Stamp\" />\n          </div>\n\n          <div class=\"signature-label signature-line\"></div>\n\n          <p class=\"signer-name\">Ms. Sonam Agarwal</p>\n          <p class=\"designation-text\">Manager – Talent Acquisition</p>\n          <p class=\"designation-text\">Email: sonam@seecogsoftwares.com</p>\n        </div>\n\n        <!-- Candidate Acknowledgement -->\n        <div class=\"signature-block\">\n          <p class=\"candidate-ack-title\">Candidate Acknowledgement</p>\n\n          <div class=\"candidate-ack-block\">\n            <p>\n              I, <strong>{{fullName}}</strong>, have read and understood the terms of\n              this Offer Letter and accept the offer.\n            </p>\n\n            <p class=\"signature-label\">\n              Signature:\n              <span class=\"signature-line\"></span>\n            </p>\n\n            <p class=\"signature-label\">\n              Date:\n              <span>______________________</span>\n            </p>\n          </div>\n        </div>\n      </section>\n    </main>\n  </div>\n</body>\n\n</html>\n',0,'2025-11-29 08:06:04','2025-11-30 10:45:49',NULL),(9,'Bonus Letter','BONUS_LETTER','fas fa-gift','Formal bonus announcement letter recognizing an employee’s performance and confirming the bonus amount, credit date, and discretionary nature of the payout.','<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\" />\n  <title>Bonus Announcement Letter - {{EMP_NAME}}</title>\n  <style>\n    * {\n      box-sizing: border-box;\n      font-family: Arial, Helvetica, sans-serif;\n    }\n\n    body {\n      margin: 0;\n      padding: 0;\n      background: #f5f5f5;\n      font-size: 11px;\n      line-height: 1.6;\n    }\n\n    .page {\n      width: 100%;\n      max-width: 190mm; /* fits nicely within A4 with Puppeteer margins */\n      margin: 0 auto;\n      padding: 12mm 10mm;\n      background: #ffffff;\n      border: 1px solid #d0d0d0;\n      box-shadow: 0 0 4mm rgba(0, 0, 0, 0.06);\n    }\n\n    @media print {\n      body {\n        background: #ffffff;\n      }\n      .page {\n        box-shadow: none;\n        border: none;\n        max-width: none;\n        width: auto;\n        margin: 0;\n        padding: 10mm 12mm;\n      }\n    }\n\n    .header {\n      text-align: center;\n      margin-bottom: 8px;\n    }\n\n    .company-name {\n      font-size: 16px;\n      font-weight: bold;\n      text-transform: uppercase;\n      letter-spacing: 0.5px;\n    }\n\n    .company-info {\n      margin-top: 4px;\n      font-size: 10px;\n      line-height: 1.4;\n    }\n\n    .line-separator {\n      margin: 10px 0;\n      border-top: 1px solid #999;\n    }\n\n    .date-line {\n      text-align: right;\n      font-size: 11px;\n      margin: 6px 0 12px 0;\n    }\n\n    .meta-table {\n      width: 100%;\n      border-collapse: collapse;\n      margin-bottom: 12px;\n      font-size: 11px;\n    }\n\n    .meta-table td {\n      padding: 2px 0;\n      vertical-align: top;\n    }\n\n    .meta-label {\n      width: 110px;\n      font-weight: bold;\n      white-space: nowrap;\n    }\n\n    .meta-value {\n      padding-left: 4px;\n    }\n\n    .subject {\n      font-size: 13px;\n      font-weight: bold;\n      text-align: center;\n      margin: 10px 0 14px 0;\n      text-transform: uppercase;\n      text-decoration: underline;\n    }\n\n    .body {\n      font-size: 11px;\n      text-align: justify;\n    }\n\n    .body p {\n      margin: 4px 0 8px 0;\n    }\n\n    .salutation {\n      margin-bottom: 8px;\n    }\n\n    .closing {\n      margin-top: 18px;\n    }\n\n    .closing p {\n      margin: 2px 0;\n    }\n\n    .signature-block {\n      margin-top: 18px;\n    }\n\n    .signature-name {\n      margin-top: 22px;\n      font-weight: bold;\n    }\n\n    .signature-title {\n      margin-top: 2px;\n    }\n  </style>\n</head>\n<body>\n  <div class=\"page\">\n    <!-- Company Letterhead -->\n    <div class=\"header\">\n      <div class=\"company-name\">Seecog Softwares Private Limited</div>\n      <div class=\"company-info\">\n        CIN: U7220JH2021PTC017350<br />\n        Prestige Cube, Site No. 26, Laskar Hosur Road, Adugodi, Koramangala, Bengaluru, Karnataka 560030, India<br />\n        https://seecogsoftwares.com/ &nbsp; | &nbsp;\n        Email: info@seecogsoftwares.com &nbsp; | &nbsp;\n        Contact No: +91-7625067691\n      </div>\n    </div>\n\n    <div class=\"line-separator\"></div>\n\n    <!-- Date -->\n    <div class=\"date-line\">\n      {{DATE}}\n    </div>\n\n    <!-- Employee Meta -->\n    <table class=\"meta-table\">\n      <tr>\n        <td class=\"meta-label\">Employee ID</td>\n        <td class=\"meta-value\">: {{EMP_ID}}</td>\n      </tr>\n      <tr>\n        <td class=\"meta-label\">Employee Name</td>\n        <td class=\"meta-value\">: {{EMP_NAME}}</td>\n      </tr>\n      <tr>\n        <td class=\"meta-label\">Designation</td>\n        <td class=\"meta-value\">: {{DESIGNATION}}</td>\n      </tr>\n    </table>\n\n    <!-- Subject -->\n    <div class=\"subject\">\n      Bonus Announcement Letter\n    </div>\n\n    <!-- Letter Body -->\n    <div class=\"body\">\n      <div class=\"salutation\">\n        Dear {{EMP_NAME}},\n      </div>\n\n      <p>\n        We are pleased to acknowledge and appreciate your contributions to\n        <strong>Seecog Softwares Pvt. Ltd.</strong>\n      </p>\n\n      <p>\n        Your consistent performance, dedication, and teamwork have significantly contributed\n        to our company\'s growth and success.\n      </p>\n\n      <p>\n        As a token of appreciation, the management is happy to award you a bonus of\n        <strong>₹{{BONUS_AMOUNT}} (Rupees {{BONUS_IN_WORDS}} only)</strong>.\n        This bonus will be credited to your registered salary account on or before\n        <strong>{{CREDIT_DATE}}</strong>.\n      </p>\n\n      <p>\n        This reward reflects our recognition of your hard work and the value you bring\n        to the organization. We look forward to your continued excellence and\n        commitment in the coming months.\n      </p>\n\n      <p>\n        Please note that this bonus is discretionary and based on performance and business\n        outcomes. It does not form part of your regular salary or compensation structure.\n      </p>\n\n      <p>\n        Once again, thank you for your valuable contributions, and congratulations on your\n        well-deserved reward.\n      </p>\n\n      <!-- Closing & Signature -->\n      <div class=\"closing\">\n        <p>For Seecog Softwares Pvt. Ltd.</p>\n\n        <div class=\"signature-block\">\n          <div class=\"signature-name\">Ms. Sonam Agarwal</div>\n          <div class=\"signature-title\">Email: sonam@seecogsoftwares.com</div>\n          <div class=\"signature-title\">Authorized Signatory</div>\n        </div>\n      </div>\n    </div>\n  </div>\n</body>\n</html>\n',0,'2025-11-29 08:08:48','2025-11-29 08:14:01',NULL),(10,'Salary Increment Letter','INCREMENT_LETTER','fas fa-arrow-trend-up','Formal salary increment letter notifying the employee of revised compensation, effective date, updated annual CTC, and appreciation for their performance and contributions.','<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\" />\n  <title>Salary Increment Notification - {{EMP_NAME}}</title>\n  <style>\n    * {\n      box-sizing: border-box;\n      font-family: Arial, Helvetica, sans-serif;\n    }\n\n    body {\n      margin: 0;\n      padding: 0;\n      background: #f5f5f5;\n      font-size: 11px;\n      line-height: 1.6;\n    }\n\n    .page {\n      width: 100%;\n      max-width: 190mm; /* fits nicely within A4 with Puppeteer margins */\n      margin: 0 auto;\n      padding: 12mm 10mm;\n      background: #ffffff;\n      border: 1px solid #d0d0d0;\n      box-shadow: 0 0 4mm rgba(0, 0, 0, 0.06);\n    }\n\n    @media print {\n      body {\n        background: #ffffff;\n      }\n      .page {\n        box-shadow: none;\n        border: none;\n        max-width: none;\n        width: auto;\n        margin: 0;\n        padding: 10mm 12mm;\n      }\n    }\n\n    .header {\n      text-align: center;\n      margin-bottom: 8px;\n    }\n\n    .company-name {\n      font-size: 16px;\n      font-weight: bold;\n      text-transform: uppercase;\n      letter-spacing: 0.5px;\n    }\n\n    .company-info {\n      margin-top: 4px;\n      font-size: 10px;\n      line-height: 1.4;\n    }\n\n    .line-separator {\n      margin: 10px 0;\n      border-top: 1px solid #999;\n    }\n\n    .date-line {\n      text-align: right;\n      font-size: 11px;\n      margin: 6px 0 12px 0;\n    }\n\n    .meta-table {\n      width: 100%;\n      border-collapse: collapse;\n      margin-bottom: 10px;\n      font-size: 11px;\n    }\n\n    .meta-table td {\n      padding: 2px 0;\n      vertical-align: top;\n    }\n\n    .meta-label {\n      width: 110px;\n      font-weight: bold;\n      white-space: nowrap;\n    }\n\n    .meta-value {\n      padding-left: 4px;\n    }\n\n    .subject {\n      font-size: 13px;\n      font-weight: bold;\n      text-align: center;\n      margin: 10px 0 14px 0;\n      text-transform: none;\n      text-decoration: underline;\n    }\n\n    .body {\n      font-size: 11px;\n      text-align: justify;\n    }\n\n    .body p {\n      margin: 4px 0 8px 0;\n    }\n\n    .salutation {\n      margin-bottom: 8px;\n    }\n\n    .closing {\n      margin-top: 18px;\n    }\n\n    .closing p {\n      margin: 2px 0;\n    }\n\n    .signature-block {\n      margin-top: 18px;\n    }\n\n    .signature-name {\n      margin-top: 22px;\n      font-weight: bold;\n    }\n\n    .signature-title {\n      margin-top: 2px;\n    }\n  </style>\n</head>\n<body>\n  <div class=\"page\">\n    <!-- Company Letterhead -->\n    <div class=\"header\">\n      <div class=\"company-name\">Seecog Softwares Private Limited</div>\n      <div class=\"company-info\">\n        CIN: U7220JH2021PTC017350<br />\n        Prestige Cube, Site No. 26, Laskar Hosur Road, Adugodi, Koramangala, Bengaluru, Karnataka 560030, India<br />\n        https://seecogsoftwares.com/ &nbsp; | &nbsp;\n        Email: info@seecogsoftwares.com &nbsp; | &nbsp;\n        Contact No: +91-7625067691\n      </div>\n    </div>\n\n    <div class=\"line-separator\"></div>\n\n    <!-- Date -->\n    <div class=\"date-line\">\n      Dated: {{OFFER_DATE}}\n    </div>\n\n    <!-- Employee Meta -->\n    <table class=\"meta-table\">\n      <tr>\n        <td class=\"meta-label\">Employee Name:</td>\n        <td class=\"meta-value\">{{EMP_NAME}}</td>\n      </tr>\n      <tr>\n        <td class=\"meta-label\">Designation:</td>\n        <td class=\"meta-value\">{{DESIGNATION}}</td>\n      </tr>\n    </table>\n\n    <!-- Subject -->\n    <div class=\"subject\">\n      Salary Increment Notification\n    </div>\n\n    <!-- Letter Body -->\n    <div class=\"body\">\n      <div class=\"salutation\">\n        Dear {{EMP_NAME}},\n      </div>\n\n      <p>\n        We are pleased to acknowledge your dedication, performance, and valuable contribution to\n        <strong>Seecog Softwares Pvt. Ltd.</strong>\n      </p>\n\n      <p>\n        Based on your performance evaluation and the recommendation of your reporting manager,\n        the management has approved an increment in your compensation, effective\n        <strong>{{EFFECTIVE_DATE}}</strong>.\n      </p>\n\n      <p>\n        Your revised ₹{{AMOUNT}} will be ₹{{REVISED_AMOUNT}}, amounting to an annual\n        Cost to Company (CTC) of ₹{{REVISED_ANNUAL_CTC}}.\n      </p>\n\n      <p>\n        We trust that this recognition will motivate you to continue your excellent work and take on new\n        challenges with enthusiasm and responsibility. We sincerely appreciate your efforts and look forward\n        to your continued association and growth with the company.\n      </p>\n\n      <p>\n        Should you have any questions or require clarification regarding the revised salary structure,\n        please feel free to reach out to the HR department.\n      </p>\n\n      <p>\n        Once again, congratulations on your well-deserved increment.\n      </p>\n\n      <!-- Closing & Signature -->\n      <div class=\"closing\">\n        <p>Warm regards,</p>\n        <p>For Seecog Softwares Pvt. Ltd.</p>\n\n        <div class=\"signature-block\">\n          <div class=\"signature-name\">Ms. Sonam Agarwal</div>\n          <div class=\"signature-title\">Manager – Talent Acquisition</div>\n          <div class=\"signature-title\">Email: sonam@seecogsoftwares.com</div>\n        </div>\n      </div>\n    </div>\n  </div>\n</body>\n</html>\n',0,'2025-11-29 08:11:28','2025-11-29 08:13:52',NULL),(11,'Relieving & Experience Letter','RELIEVING_LETTER','fas fa-door-open','Formal relieving and experience letter confirming an employee’s separation date, tenure, role, and appreciating their contribution while wishing them success in future endeavors.','<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\" />\n  <title>Relieving & Experience Letter - {{EMP_NAME}}</title>\n  <style>\n    * {\n      box-sizing: border-box;\n      font-family: Arial, Helvetica, sans-serif;\n    }\n\n    body {\n      margin: 0;\n      padding: 0;\n      background: #f5f5f5;\n      font-size: 11px;\n      line-height: 1.6;\n    }\n\n    .page {\n      width: 100%;\n      max-width: 190mm; /* fits nicely within A4 with Puppeteer margins */\n      margin: 0 auto;\n      padding: 12mm 10mm;\n      background: #ffffff;\n      border: 1px solid #d0d0d0;\n      box-shadow: 0 0 4mm rgba(0, 0, 0, 0.06);\n    }\n\n    @media print {\n      body {\n        background: #ffffff;\n      }\n      .page {\n        box-shadow: none;\n        border: none;\n        max-width: none;\n        width: auto;\n        margin: 0;\n        padding: 10mm 12mm;\n      }\n    }\n\n    .header {\n      text-align: center;\n      margin-bottom: 8px;\n    }\n\n    .company-name {\n      font-size: 16px;\n      font-weight: bold;\n      text-transform: uppercase;\n      letter-spacing: 0.5px;\n    }\n\n    .company-info {\n      margin-top: 4px;\n      font-size: 10px;\n      line-height: 1.4;\n    }\n\n    .line-separator {\n      margin: 10px 0;\n      border-top: 1px solid #999;\n    }\n\n    .meta-table {\n      width: 100%;\n      border-collapse: collapse;\n      margin-bottom: 12px;\n      font-size: 11px;\n    }\n\n    .meta-table td {\n      padding: 2px 0;\n      vertical-align: top;\n    }\n\n    .meta-label {\n      width: 140px;\n      font-weight: bold;\n      white-space: nowrap;\n    }\n\n    .meta-value {\n      padding-left: 4px;\n    }\n\n    .subject {\n      font-size: 13px;\n      font-weight: bold;\n      text-align: center;\n      margin: 10px 0 14px 0;\n      text-transform: uppercase;\n      text-decoration: underline;\n    }\n\n    .body {\n      font-size: 11px;\n      text-align: justify;\n    }\n\n    .body p {\n      margin: 4px 0 8px 0;\n    }\n\n    .salutation {\n      margin-bottom: 8px;\n    }\n\n    .closing {\n      margin-top: 18px;\n    }\n\n    .closing p {\n      margin: 2px 0;\n    }\n\n    .signature-block {\n      margin-top: 18px;\n    }\n\n    .signature-name {\n      margin-top: 22px;\n      font-weight: bold;\n    }\n\n    .signature-title {\n      margin-top: 2px;\n    }\n  </style>\n</head>\n<body>\n  <div class=\"page\">\n    <!-- Company Letterhead -->\n    <div class=\"header\">\n      <div class=\"company-name\">Seecog Softwares Private Limited</div>\n      <div class=\"company-info\">\n        CIN: U7220JH2021PTC017350<br />\n        Prestige Cube, Site No. 26, Laskar Hosur Road, Adugodi, Koramangala, Bengaluru, Karnataka 560030, India<br />\n        https://seecogsoftwares.com/ &nbsp; | &nbsp;\n        Email: info@seecogsoftwares.com &nbsp; | &nbsp;\n        Contact No: +91-7625067691\n      </div>\n    </div>\n\n    <div class=\"line-separator\"></div>\n\n    <!-- Employee Meta -->\n    <table class=\"meta-table\">\n      <tr>\n        <td class=\"meta-label\">Employee ID</td>\n        <td class=\"meta-value\">: {{EMP_ID}}</td>\n      </tr>\n      <tr>\n        <td class=\"meta-label\">Employee Name</td>\n        <td class=\"meta-value\">: {{EMP_NAME}}</td>\n      </tr>\n      <tr>\n        <td class=\"meta-label\">Designation</td>\n        <td class=\"meta-value\">: {{DESIGNATION}}</td>\n      </tr>\n      <tr>\n        <td class=\"meta-label\">Location</td>\n        <td class=\"meta-value\">: {{LOCATION}}</td>\n      </tr>\n      <tr>\n        <td class=\"meta-label\">Period</td>\n        <td class=\"meta-value\">\n          : From {{PERIOD_FROM}} &nbsp;&nbsp; To {{PERIOD_TO}}\n        </td>\n      </tr>\n      <tr>\n        <td class=\"meta-label\">Date of Relieving</td>\n        <td class=\"meta-value\">: {{RELIEVING_DATE}}</td>\n      </tr>\n    </table>\n\n    <!-- Subject -->\n    <div class=\"subject\">\n      Relieving &amp; Experience Letter\n    </div>\n\n    <!-- Letter Body -->\n    <div class=\"body\">\n      <div class=\"salutation\">\n        Dear {{EMP_NAME}},\n      </div>\n\n      <p>\n        With reference to your letter of resignation/separation from employment, we would like to inform you\n        that your resignation/separation is accepted. Accordingly, you are relieved from the services of the\n        company on the close of office hours as per the date mentioned above.\n      </p>\n\n      <p>\n        Your contributions to the organization and its success will always be appreciated.\n      </p>\n\n      <p>\n        We wish you all the best in your future endeavors.\n      </p>\n\n      <!-- Closing & Signature -->\n      <div class=\"closing\">\n        <p>Your’s sincerely,</p>\n        <p>For Seecog Softwares Pvt. Ltd.</p>\n\n        <div class=\"signature-block\">\n          <div class=\"signature-name\">Ms. Sonam Agarwal</div>\n          <div class=\"signature-title\">Manager – Talent Acquisition</div>\n          <div class=\"signature-title\">Email: sonam@seecogsoftwares.com</div>\n        </div>\n      </div>\n    </div>\n  </div>\n</body>\n</html>\n',0,'2025-11-29 08:13:42','2025-11-29 08:13:42',NULL),(12,'Probation Letter','PROBATION_LETTER','fas fa-hourglass-half','Letter issued at the start of employment defining the probation period, reporting structure, working hours, conditions for confirmation, and company policies applicable during probation.','<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\" />\n  <title>Probation Letter - {{EMP_NAME}}</title>\n  <style>\n    * {\n      box-sizing: border-box;\n      font-family: Arial, Helvetica, sans-serif;\n    }\n\n    body {\n      margin: 0;\n      padding: 0;\n      background: #f5f5f5;\n      font-size: 11px;\n      line-height: 1.6;\n    }\n\n    .page {\n      width: 100%;\n      max-width: 190mm; /* fits nicely within A4 with Puppeteer margins */\n      margin: 0 auto;\n      padding: 12mm 10mm;\n      background: #ffffff;\n      border: 1px solid #d0d0d0;\n      box-shadow: 0 0 4mm rgba(0, 0, 0, 0.06);\n    }\n\n    @media print {\n      body {\n        background: #ffffff;\n      }\n      .page {\n        box-shadow: none;\n        border: none;\n        max-width: none;\n        width: auto;\n        margin: 0;\n        padding: 10mm 12mm;\n      }\n    }\n\n    .header {\n      text-align: center;\n      margin-bottom: 8px;\n    }\n\n    .company-name {\n      font-size: 16px;\n      font-weight: bold;\n      text-transform: uppercase;\n      letter-spacing: 0.5px;\n    }\n\n    .company-info {\n      margin-top: 4px;\n      font-size: 10px;\n      line-height: 1.4;\n    }\n\n    .line-separator {\n      margin: 10px 0;\n      border-top: 1px solid #999;\n    }\n\n    .date-line {\n      text-align: right;\n      font-size: 11px;\n      margin: 6px 0 12px 0;\n    }\n\n    .meta-table {\n      width: 100%;\n      border-collapse: collapse;\n      margin-bottom: 10px;\n      font-size: 11px;\n    }\n\n    .meta-table td {\n      padding: 2px 0;\n      vertical-align: top;\n    }\n\n    .meta-label {\n      width: 110px;\n      font-weight: bold;\n      white-space: nowrap;\n    }\n\n    .meta-value {\n      padding-left: 4px;\n    }\n\n    .subject {\n      font-size: 13px;\n      font-weight: bold;\n      text-align: center;\n      margin: 10px 0 14px 0;\n      text-transform: none;\n      text-decoration: underline;\n    }\n\n    .body {\n      font-size: 11px;\n      text-align: justify;\n    }\n\n    .body p {\n      margin: 4px 0 8px 0;\n    }\n\n    .salutation {\n      margin-bottom: 8px;\n    }\n\n    .section-title {\n      font-weight: bold;\n      margin: 10px 0 4px 0;\n      font-size: 12px;\n    }\n\n    .bullet-list {\n      margin: 6px 0 10px 18px;\n      padding: 0;\n    }\n\n    .bullet-list li {\n      margin-bottom: 4px;\n    }\n\n    .closing {\n      margin-top: 18px;\n    }\n\n    .closing p {\n      margin: 2px 0;\n    }\n\n    .signature-block {\n      margin-top: 18px;\n    }\n\n    .signature-name {\n      margin-top: 22px;\n      font-weight: bold;\n    }\n\n    .signature-title {\n      margin-top: 2px;\n    }\n\n    .acknowledgement {\n      margin-top: 24px;\n      border-top: 1px solid #999;\n      padding-top: 10px;\n      font-size: 11px;\n    }\n\n    .ack-title {\n      font-weight: bold;\n      margin-bottom: 8px;\n    }\n\n    .ack-line {\n      margin: 4px 0;\n    }\n  </style>\n</head>\n<body>\n  <div class=\"page\">\n    <!-- Company Letterhead -->\n    <div class=\"header\">\n      <div class=\"company-name\">Seecog Softwares Private Limited</div>\n      <div class=\"company-info\">\n        CIN: U7220JH2021PTC017350<br />\n        Prestige Cube, Site No. 26, Laskar Hosur Road, Adugodi, Koramangala, Bengaluru, Karnataka 560030, India<br />\n        https://seecogsoftwares.com/ &nbsp; | &nbsp;\n        Email: info@seecogsoftwares.com &nbsp; | &nbsp;\n        Contact No: +91-7625067691\n      </div>\n    </div>\n\n    <div class=\"line-separator\"></div>\n\n    <!-- Date -->\n    <div class=\"date-line\">\n      Dated: {{LETTER_DATE}}\n    </div>\n\n    <!-- Employee Meta -->\n    <table class=\"meta-table\">\n      <tr>\n        <td class=\"meta-label\">Employee Name:</td>\n        <td class=\"meta-value\">{{EMP_NAME}}</td>\n      </tr>\n      <tr>\n        <td class=\"meta-label\">Designation:</td>\n        <td class=\"meta-value\">{{DESIGNATION}}</td>\n      </tr>\n      <tr>\n        <td class=\"meta-label\">Location:</td>\n        <td class=\"meta-value\">{{WORK_LOCATION}}</td>\n      </tr>\n    </table>\n\n    <!-- Subject -->\n    <div class=\"subject\">\n      Probation Letter\n    </div>\n\n    <!-- Letter Body -->\n    <div class=\"body\">\n      <div class=\"salutation\">\n        Dear {{EMP_NAME}},\n      </div>\n\n      <p>\n        We are pleased to welcome you to <strong>Seecog Softwares Pvt. Ltd.</strong> and confirm your\n        appointment as <strong>{{DESIGNATION}}</strong>, effective from <strong>{{JOINING_DATE}}</strong>.\n      </p>\n\n      <p>\n        As discussed and outlined in your offer, your employment will initially be on\n        <strong>probation</strong> for a period of <strong>{{PROBATION_PERIOD}}</strong>, i.e. up to\n        <strong>{{PROBATION_END_DATE}}</strong>, subject to the terms and conditions mentioned below.\n      </p>\n\n      <div class=\"section-title\">1. Probation Period</div>\n      <p>\n        During the probation period, your performance, conduct, attitude, learning curve, and cultural fit\n        with the organization will be continuously reviewed by your reporting manager and the HR team.\n      </p>\n\n      <div class=\"section-title\">2. Reporting &amp; Working Hours</div>\n      <p>\n        You will report to <strong>{{REPORTING_MANAGER_NAME}}</strong>,\n        <strong>{{REPORTING_MANAGER_DESIGNATION}}</strong>, or any other person as may be notified from\n        time to time.\n      </p>\n      <p>\n        Your regular working hours will be <strong>{{WORKING_HOURS}}</strong>, or as per the business\n        requirements communicated by your manager.\n      </p>\n\n      <div class=\"section-title\">3. Confirmation of Employment</div>\n      <p>\n        Subject to satisfactory performance, adherence to company policies, and completion of all mandatory\n        documentation, your services may be <strong>confirmed</strong> in writing on or after\n        <strong>{{PROBATION_END_DATE}}</strong>.\n      </p>\n      <p>\n        Upon confirmation, your designation, compensation, and other terms may be reviewed in line with\n        company policy applicable at that time.\n      </p>\n\n      <div class=\"section-title\">4. Extension or Termination of Probation</div>\n      <p>\n        In case your performance or conduct is not found satisfactory during the probation period, the\n        company reserves the right, at its sole discretion:\n      </p>\n      <ul class=\"bullet-list\">\n        <li>To extend your probation period for an additional duration; and/or</li>\n        <li>To terminate your employment with or without notice, as per applicable company policy.</li>\n      </ul>\n\n      <div class=\"section-title\">5. Policies &amp; Code of Conduct</div>\n      <p>\n        You are required to strictly adhere to all company policies, including but not limited to:\n        attendance, leave, information security, confidentiality, and professional conduct. Any violation of\n        these policies may result in disciplinary action, including termination.\n      </p>\n\n      <div class=\"section-title\">6. Confidentiality</div>\n      <p>\n        During the course of your employment, you may have access to proprietary, confidential, and\n        business-sensitive information. You are expected to maintain complete confidentiality and not disclose\n        such information to any unauthorized person during or after your employment with the company.\n      </p>\n\n      <p>\n        We look forward to your valuable contribution and wish you a successful career with\n        <strong>Seecog Softwares Pvt. Ltd.</strong>\n      </p>\n\n      <!-- Closing & Signature -->\n      <div class=\"closing\">\n        <p>Warm regards,</p>\n        <p>For Seecog Softwares Pvt. Ltd.</p>\n\n        <div class=\"signature-block\">\n          <div class=\"signature-name\">Ms. Sonam Agarwal</div>\n          <div class=\"signature-title\">Manager – Talent Acquisition</div>\n          <div class=\"signature-title\">Email: sonam@seecogsoftwares.com</div>\n        </div>\n      </div>\n\n      <!-- Acknowledgement -->\n      <div class=\"acknowledgement\">\n        <div class=\"ack-title\">Employee Acknowledgement</div>\n        <p class=\"ack-line\">\n          I, {{EMP_NAME}}, hereby acknowledge that I have read, understood, and accepted the terms of the\n          probation as stated in this letter.\n        </p>\n        <p class=\"ack-line\">\n          Signature: __________________________\n        </p>\n        <p class=\"ack-line\">\n          Date: ______________________________\n        </p>\n      </div>\n    </div>\n  </div>\n</body>\n</html>\n',0,'2025-11-29 08:21:43','2025-11-29 08:21:43',NULL),(13,'Internship Completion Certificate','INTERNSHIP_CERT','fas fa-certificate','Formal certificate issued to interns on successful completion of their internship, confirming duration, department, role, performance summary, and supervisor/HR sign-off.','<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\" />\n  <title>Internship Completion Certificate - {{INTERN_NAME}}</title>\n  <style>\n    * {\n      box-sizing: border-box;\n      font-family: Arial, Helvetica, sans-serif;\n    }\n\n    body {\n      margin: 0;\n      padding: 0;\n      background: #f5f5f5;\n      font-size: 11px;\n      line-height: 1.6;\n    }\n\n    .page {\n      width: 100%;\n      max-width: 190mm; /* fits nicely within A4 with Puppeteer margins */\n      margin: 0 auto;\n      padding: 14mm 12mm;\n      background: #ffffff;\n      border: 1px solid #b0b0b0;\n      box-shadow: 0 0 4mm rgba(0, 0, 0, 0.06);\n    }\n\n    @media print {\n      body {\n        background: #ffffff;\n      }\n      .page {\n        box-shadow: none;\n        border: none;\n        max-width: none;\n        width: auto;\n        margin: 0;\n        padding: 12mm 14mm;\n      }\n    }\n\n    .header {\n      text-align: center;\n      margin-bottom: 10px;\n    }\n\n    .company-name {\n      font-size: 16px;\n      font-weight: bold;\n      text-transform: uppercase;\n      letter-spacing: 0.5px;\n    }\n\n    .company-info {\n      margin-top: 4px;\n      font-size: 10px;\n      line-height: 1.4;\n    }\n\n    .line-separator {\n      margin: 10px 0 14px 0;\n      border-top: 1px solid #999;\n    }\n\n    .certificate-box {\n      border: 1px solid #999;\n      padding: 12mm 10mm;\n    }\n\n    .certificate-title {\n      text-align: center;\n      font-size: 16px;\n      font-weight: bold;\n      letter-spacing: 1px;\n      text-transform: uppercase;\n      margin-bottom: 4px;\n    }\n\n    .certificate-subtitle {\n      text-align: center;\n      font-size: 11px;\n      margin-bottom: 12px;\n    }\n\n    .cert-meta {\n      font-size: 10px;\n      margin-bottom: 10px;\n    }\n\n    .cert-meta-row {\n      display: flex;\n      justify-content: space-between;\n      margin-bottom: 2px;\n    }\n\n    .cert-body {\n      font-size: 12px;\n      text-align: justify;\n      margin-top: 6px;\n    }\n\n    .cert-body p {\n      margin: 4px 0 8px 0;\n    }\n\n    .center-text {\n      text-align: center;\n    }\n\n    .highlight-name {\n      font-weight: bold;\n      font-size: 13px;\n      text-transform: uppercase;\n    }\n\n    .highlight-role {\n      font-weight: bold;\n    }\n\n    .footer-info {\n      margin-top: 16px;\n      font-size: 10px;\n    }\n\n    .signature-section {\n      margin-top: 18px;\n      display: flex;\n      justify-content: space-between;\n      font-size: 11px;\n    }\n\n    .sig-block {\n      width: 45%;\n      text-align: left;\n    }\n\n    .sig-block.right {\n      text-align: right;\n    }\n\n    .sig-label {\n      margin-bottom: 30px;\n    }\n\n    .sig-name {\n      font-weight: bold;\n      margin-top: 2px;\n    }\n\n    .sig-title {\n      margin-top: 2px;\n    }\n\n    .place-date {\n      margin-top: 10px;\n      font-size: 11px;\n    }\n  </style>\n</head>\n<body>\n  <div class=\"page\">\n    <!-- Company Letterhead -->\n    <div class=\"header\">\n      <div class=\"company-name\">Seecog Softwares Private Limited</div>\n      <div class=\"company-info\">\n        CIN: U7220JH2021PTC017350<br />\n        Prestige Cube, Site No. 26, Laskar Hosur Road, Adugodi, Koramangala, Bengaluru, Karnataka 560030, India<br />\n        https://seecogsoftwares.com/ &nbsp; | &nbsp;\n        Email: info@seecogsoftwares.com &nbsp; | &nbsp;\n        Contact No: +91-7625067691\n      </div>\n    </div>\n\n    <div class=\"line-separator\"></div>\n\n    <!-- Certificate Body -->\n    <div class=\"certificate-box\">\n      <!-- Optional certificate meta -->\n      <div class=\"cert-meta\">\n        <div class=\"cert-meta-row\">\n          <div>Certificate No.: {{CERTIFICATE_NO}}</div>\n          <div>Date: {{ISSUE_DATE}}</div>\n        </div>\n      </div>\n\n      <div class=\"certificate-title\">\n        Internship Completion Certificate\n      </div>\n      <div class=\"certificate-subtitle\">\n        This is to certify that the following candidate has successfully completed the internship with us.\n      </div>\n\n      <div class=\"cert-body\">\n        <p class=\"center-text\">\n          This is to certify that\n          <span class=\"highlight-name\">{{INTERN_NAME}}</span>\n          has successfully completed an internship at\n          <strong>Seecog Softwares Pvt. Ltd.</strong>\n        </p>\n\n        <p class=\"center-text\">\n          in the role of\n          <span class=\"highlight-role\">{{INTERNSHIP_ROLE}}</span>\n          in the\n          <strong>{{DEPARTMENT_NAME}}</strong> department.\n        </p>\n\n        <p class=\"center-text\">\n          The internship was undertaken from\n          <strong>{{START_DATE}}</strong> to <strong>{{END_DATE}}</strong>,\n          for a total duration of <strong>{{INTERNSHIP_DURATION}}</strong>.\n        </p>\n\n        <p>\n          During the internship period, {{INTERN_NAME}} demonstrated\n          professionalism, eagerness to learn, and the ability to work both\n          independently and as part of a team. The intern was involved in\n          practical assignments related to <strong>{{INTERNSHIP_DOMAIN}}</strong>,\n          and contributed to the successful completion of assigned tasks and projects.\n        </p>\n\n        <p>\n          We found {{INTERN_NAME}} to be sincere, punctual, and committed towards\n          the work assigned. The overall performance of the intern during this\n          period is assessed as <strong>{{PERFORMANCE_SUMMARY}}</strong>.\n        </p>\n\n        <p>\n          This certificate is being issued upon the intern’s successful\n          completion of all required tasks and deliverables as per the\n          internship plan, and can be produced by the candidate as a record\n          of their internship experience with our organization.\n        </p>\n\n        <div class=\"place-date\">\n          Place: {{ISSUE_PLACE}}<br />\n          Date: {{ISSUE_DATE}}\n        </div>\n      </div>\n\n      <!-- Signature Section -->\n      <div class=\"signature-section\">\n        <div class=\"sig-block\">\n          <div class=\"sig-label\">__________________________</div>\n          <div class=\"sig-name\">{{SUPERVISOR_NAME}}</div>\n          <div class=\"sig-title\">{{SUPERVISOR_DESIGNATION}}</div>\n          <div class=\"sig-title\">Seecog Softwares Pvt. Ltd.</div>\n        </div>\n\n        <div class=\"sig-block right\">\n          <div class=\"sig-label\">__________________________</div>\n          <div class=\"sig-name\">Ms. Sonam Agarwal</div>\n          <div class=\"sig-title\">HR Manager</div>\n          <div class=\"sig-title\">Seecog Softwares Pvt. Ltd.</div>\n        </div>\n      </div>\n\n      <div class=\"footer-info\">\n        This is a system-generated internship completion certificate and does not\n        require a physical seal.\n      </div>\n    </div>\n  </div>\n</body>\n</html>\n',0,'2025-11-29 08:25:33','2025-11-29 08:25:33',NULL),(14,'Full & Final Settlement Statement','FULL_FINAL_STATEMENT','fas fa-file-invoice-dollar','Statement issued at the time of employee exit, summarising all earnings, deductions, and the net amount payable as part of Full & Final Settlement.','<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\" />\n  <title>Full & Final Settlement Statement - {{EMP_NAME}}</title>\n  <style>\n    * {\n      box-sizing: border-box;\n      font-family: Arial, Helvetica, sans-serif;\n    }\n\n    body {\n      margin: 0;\n      padding: 0;\n      background: #f5f5f5;\n      font-size: 11px;\n      line-height: 1.6;\n    }\n\n    .page {\n      width: 100%;\n      max-width: 190mm; /* fits nicely within A4 with Puppeteer margins */\n      margin: 0 auto;\n      padding: 12mm 10mm;\n      background: #ffffff;\n      border: 1px solid #d0d0d0;\n      box-shadow: 0 0 4mm rgba(0, 0, 0, 0.06);\n    }\n\n    @media print {\n      body {\n        background: #ffffff;\n      }\n      .page {\n        box-shadow: none;\n        border: none;\n        max-width: none;\n        width: auto;\n        margin: 0;\n        padding: 10mm 12mm;\n      }\n    }\n\n    .header {\n      text-align: center;\n      margin-bottom: 8px;\n    }\n\n    .company-name {\n      font-size: 16px;\n      font-weight: bold;\n      text-transform: uppercase;\n      letter-spacing: 0.5px;\n    }\n\n    .company-info {\n      margin-top: 4px;\n      font-size: 10px;\n      line-height: 1.4;\n    }\n\n    .line-separator {\n      margin: 10px 0;\n      border-top: 1px solid #999;\n    }\n\n    .date-line {\n      text-align: right;\n      font-size: 11px;\n      margin: 6px 0 12px 0;\n    }\n\n    .meta-table {\n      width: 100%;\n      border-collapse: collapse;\n      margin-bottom: 10px;\n      font-size: 11px;\n    }\n\n    .meta-table td {\n      padding: 2px 0;\n      vertical-align: top;\n    }\n\n    .meta-label {\n      width: 130px;\n      font-weight: bold;\n      white-space: nowrap;\n    }\n\n    .meta-value {\n      padding-left: 4px;\n    }\n\n    .subject {\n      font-size: 13px;\n      font-weight: bold;\n      text-align: center;\n      margin: 10px 0 14px 0;\n      text-transform: none;\n      text-decoration: underline;\n    }\n\n    .body {\n      font-size: 11px;\n      text-align: justify;\n    }\n\n    .body p {\n      margin: 4px 0 8px 0;\n    }\n\n    .statement-table {\n      width: 100%;\n      border-collapse: collapse;\n      margin-top: 8px;\n      font-size: 11px;\n    }\n\n    .statement-table th,\n    .statement-table td {\n      border: 1px solid #000;\n      padding: 4px 6px;\n      vertical-align: middle;\n    }\n\n    .statement-table th {\n      background: #f0f0f0;\n      font-weight: bold;\n      text-align: center;\n    }\n\n    .statement-table td {\n      text-align: left;\n    }\n\n    .right {\n      text-align: right;\n    }\n\n    .net-pay {\n      margin-top: 10px;\n      font-weight: bold;\n      font-size: 12px;\n    }\n\n    .net-pay span {\n      font-weight: bold;\n    }\n\n    .note-text {\n      margin-top: 6px;\n      font-size: 10px;\n      color: #444;\n    }\n\n    .closing {\n      margin-top: 18px;\n    }\n\n    .closing p {\n      margin: 2px 0;\n    }\n\n    .signature-block {\n      margin-top: 18px;\n    }\n\n    .signature-name {\n      margin-top: 22px;\n      font-weight: bold;\n    }\n\n    .signature-title {\n      margin-top: 2px;\n    }\n\n    .acknowledgement {\n      margin-top: 22px;\n      border-top: 1px solid #999;\n      padding-top: 10px;\n      font-size: 11px;\n    }\n\n    .ack-title {\n      font-weight: bold;\n      margin-bottom: 8px;\n    }\n\n    .ack-line {\n      margin: 4px 0;\n    }\n  </style>\n</head>\n<body>\n  <div class=\"page\">\n    <!-- Company Letterhead -->\n    <div class=\"header\">\n      <div class=\"company-name\">Seecog Softwares Private Limited</div>\n      <div class=\"company-info\">\n        CIN: U7220JH2021PTC017350<br />\n        Prestige Cube, Site No. 26, Laskar Hosur Road, Adugodi, Koramangala, Bengaluru, Karnataka 560030, India<br />\n        https://seecogsoftwares.com/ &nbsp; | &nbsp;\n        Email: info@seecogsoftwares.com &nbsp; | &nbsp;\n        Contact No: +91-7625067691\n      </div>\n    </div>\n\n    <div class=\"line-separator\"></div>\n\n    <!-- Date -->\n    <div class=\"date-line\">\n      Date: {{SETTLEMENT_DATE}}\n    </div>\n\n    <!-- Employee Meta -->\n    <table class=\"meta-table\">\n      <tr>\n        <td class=\"meta-label\">Employee Name</td>\n        <td class=\"meta-value\">: {{EMP_NAME}}</td>\n        <td class=\"meta-label\">Employee ID</td>\n        <td class=\"meta-value\">: {{EMP_ID}}</td>\n      </tr>\n      <tr>\n        <td class=\"meta-label\">Designation</td>\n        <td class=\"meta-value\">: {{DESIGNATION}}</td>\n        <td class=\"meta-label\">Department</td>\n        <td class=\"meta-value\">: {{DEPARTMENT}}</td>\n      </tr>\n      <tr>\n        <td class=\"meta-label\">Location</td>\n        <td class=\"meta-value\">: {{LOCATION}}</td>\n        <td class=\"meta-label\">Date of Joining</td>\n        <td class=\"meta-value\">: {{DOJ}}</td>\n      </tr>\n      <tr>\n        <td class=\"meta-label\">Last Working Day</td>\n        <td class=\"meta-value\">: {{LWD}}</td>\n        <td class=\"meta-label\">Settlement Ref. No.</td>\n        <td class=\"meta-value\">: {{SETTLEMENT_REF}}</td>\n      </tr>\n    </table>\n\n    <!-- Subject -->\n    <div class=\"subject\">\n      Full &amp; Final Settlement Statement\n    </div>\n\n    <!-- Body Text -->\n    <div class=\"body\">\n      <p>\n        This statement outlines the Full &amp; Final Settlement of dues payable to\n        <strong>{{EMP_NAME}}</strong> for the services rendered at\n        <strong>Seecog Softwares Pvt. Ltd.</strong> from <strong>{{DOJ}}</strong>\n        to <strong>{{LWD}}</strong>, as per the company’s payroll and HR records.\n      </p>\n\n      <p>\n        The settlement includes earnings and deductions up to the last working day, as detailed below:\n      </p>\n\n      <!-- Settlement Table -->\n      <table class=\"statement-table\">\n        <tr>\n          <th colspan=\"2\">Earnings (₹)</th>\n          <th colspan=\"2\">Deductions (₹)</th>\n        </tr>\n        <tr>\n          <th>Description</th>\n          <th>Amount</th>\n          <th>Description</th>\n          <th>Amount</th>\n        </tr>\n        <tr>\n          <td>Salary for {{SETTLEMENT_PERIOD_LABEL}}</td>\n          <td class=\"right\">{{E_SALARY}}</td>\n          <td>Notice Period Recovery</td>\n          <td class=\"right\">{{D_NOTICE_RECOVERY}}</td>\n        </tr>\n        <tr>\n          <td>Leave Encashment</td>\n          <td class=\"right\">{{E_LEAVE_ENCASHMENT}}</td>\n          <td>Advance / Loan Recovery</td>\n          <td class=\"right\">{{D_ADVANCE_RECOVERY}}</td>\n        </tr>\n        <tr>\n          <td>Bonus / Incentives</td>\n          <td class=\"right\">{{E_BONUS_INCENTIVE}}</td>\n          <td>PF / ESI / Other Statutory</td>\n          <td class=\"right\">{{D_PF_ESI}}</td>\n        </tr>\n        <tr>\n          <td>Reimbursements / Other Earnings</td>\n          <td class=\"right\">{{E_OTHER_EARNINGS}}</td>\n          <td>TDS / Professional Tax</td>\n          <td class=\"right\">{{D_TDS_PT}}</td>\n        </tr>\n        <tr>\n          <td>—</td>\n          <td class=\"right\">—</td>\n          <td>Other Deductions</td>\n          <td class=\"right\">{{D_OTHER_DEDUCTIONS}}</td>\n        </tr>\n        <tr>\n          <td><strong>Total Earnings</strong></td>\n          <td class=\"right\"><strong>{{TOTAL_EARNINGS}}</strong></td>\n          <td><strong>Total Deductions</strong></td>\n          <td class=\"right\"><strong>{{TOTAL_DEDUCTIONS}}</strong></td>\n        </tr>\n      </table>\n\n      <div class=\"net-pay\">\n        Net Amount Payable to Employee:\n        <span>₹{{NET_PAYABLE}} ({{NET_PAYABLE_WORDS}} only)</span>\n      </div>\n\n      <p class=\"note-text\">\n        Note: The above computation is based on company policies and applicable statutory requirements as on\n        the date of settlement. Any subsequent statutory changes, if applicable, may require adjustments.\n      </p>\n\n      <p>\n        The Net Amount Payable will be processed to the following bank details registered in our records:\n      </p>\n\n      <p class=\"note-text\">\n        Bank: {{BANK_NAME}} &nbsp; | &nbsp;\n        A/C No.: XXXX{{BANK_ACCOUNT_LAST4}} &nbsp; | &nbsp;\n        Payment Date: {{PAYMENT_DATE}}\n      </p>\n\n      <p>\n        This statement is issued at the request of the employee and may be used as a reference of Full &amp;\n        Final Settlement made by the company as on {{SETTLEMENT_DATE}}.\n      </p>\n\n      <!-- Closing & Signature -->\n      <div class=\"closing\">\n        <p>For Seecog Softwares Pvt. Ltd.</p>\n\n        <div class=\"signature-block\">\n          <div class=\"signature-name\">Ms. Sonam Agarwal</div>\n          <div class=\"signature-title\">HR Manager</div>\n          <div class=\"signature-title\">Email: sonam@seecogsoftwares.com</div>\n        </div>\n      </div>\n\n      <!-- Employee Acknowledgement -->\n      <div class=\"acknowledgement\">\n        <div class=\"ack-title\">Employee Acknowledgement</div>\n        <p class=\"ack-line\">\n          I, {{EMP_NAME}}, hereby acknowledge that I have reviewed the above Full &amp; Final Settlement\n          Statement and confirm receipt / understanding of the Net Amount Payable mentioned herein.\n        </p>\n        <p class=\"ack-line\">\n          Signature: __________________________\n        </p>\n        <p class=\"ack-line\">\n          Date: ______________________________\n        </p>\n      </div>\n    </div>\n  </div>\n</body>\n</html>\n',0,'2025-11-29 08:29:18','2025-11-29 08:29:18',NULL),(15,'Resignation Acceptance Letter','RESIGNATION_ACCEPTANCE','fas fa-file-circle-check','Letter confirming acceptance of an employee’s resignation, specifying last working day, notice period, exit formalities, and thanking them for their contributions.','<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\" />\n  <title>Resignation Acceptance Letter - {{EMP_NAME}}</title>\n  <style>\n    * {\n      box-sizing: border-box;\n      font-family: Arial, Helvetica, sans-serif;\n    }\n\n    body {\n      margin: 0;\n      padding: 0;\n      background: #f5f5f5;\n      font-size: 11px;\n      line-height: 1.6;\n    }\n\n    .page {\n      width: 100%;\n      max-width: 190mm; /* fits nicely within A4 with Puppeteer margins */\n      margin: 0 auto;\n      padding: 12mm 10mm;\n      background: #ffffff;\n      border: 1px solid #d0d0d0;\n      box-shadow: 0 0 4mm rgba(0, 0, 0, 0.06);\n    }\n\n    @media print {\n      body {\n        background: #ffffff;\n      }\n      .page {\n        box-shadow: none;\n        border: none;\n        max-width: none;\n        width: auto;\n        margin: 0;\n        padding: 10mm 12mm;\n      }\n    }\n\n    .header {\n      text-align: center;\n      margin-bottom: 8px;\n    }\n\n    .company-name {\n      font-size: 16px;\n      font-weight: bold;\n      text-transform: uppercase;\n      letter-spacing: 0.5px;\n    }\n\n    .company-info {\n      margin-top: 4px;\n      font-size: 10px;\n      line-height: 1.4;\n    }\n\n    .line-separator {\n      margin: 10px 0;\n      border-top: 1px solid #999;\n    }\n\n    .date-line {\n      text-align: right;\n      font-size: 11px;\n      margin: 6px 0 12px 0;\n    }\n\n    .meta-table {\n      width: 100%;\n      border-collapse: collapse;\n      margin-bottom: 10px;\n      font-size: 11px;\n    }\n\n    .meta-table td {\n      padding: 2px 0;\n      vertical-align: top;\n    }\n\n    .meta-label {\n      width: 130px;\n      font-weight: bold;\n      white-space: nowrap;\n    }\n\n    .meta-value {\n      padding-left: 4px;\n    }\n\n    .subject {\n      font-size: 13px;\n      font-weight: bold;\n      text-align: center;\n      margin: 10px 0 14px 0;\n      text-transform: none;\n      text-decoration: underline;\n    }\n\n    .body {\n      font-size: 11px;\n      text-align: justify;\n    }\n\n    .body p {\n      margin: 4px 0 8px 0;\n    }\n\n    .salutation {\n      margin-bottom: 8px;\n    }\n\n    .closing {\n      margin-top: 18px;\n    }\n\n    .closing p {\n      margin: 2px 0;\n    }\n\n    .signature-block {\n      margin-top: 18px;\n    }\n\n    .signature-name {\n      margin-top: 22px;\n      font-weight: bold;\n    }\n\n    .signature-title {\n      margin-top: 2px;\n    }\n\n    .footer-note {\n      margin-top: 12px;\n      font-size: 10px;\n      color: #555;\n    }\n  </style>\n</head>\n<body>\n  <div class=\"page\">\n    <!-- Company Letterhead -->\n    <div class=\"header\">\n      <div class=\"company-name\">Seecog Softwares Private Limited</div>\n      <div class=\"company-info\">\n        CIN: U7220JH2021PTC017350<br />\n        Prestige Cube, Site No. 26, Laskar Hosur Road, Adugodi, Koramangala, Bengaluru, Karnataka 560030, India<br />\n        https://seecogsoftwares.com/ &nbsp; | &nbsp;\n        Email: info@seecogsoftwares.com &nbsp; | &nbsp;\n        Contact No: +91-7625067691\n      </div>\n    </div>\n\n    <div class=\"line-separator\"></div>\n\n    <!-- Date -->\n    <div class=\"date-line\">\n      Date: {{LETTER_DATE}}\n    </div>\n\n    <!-- Employee Meta -->\n    <table class=\"meta-table\">\n      <tr>\n        <td class=\"meta-label\">Employee Name</td>\n        <td class=\"meta-value\">: {{EMP_NAME}}</td>\n      </tr>\n      <tr>\n        <td class=\"meta-label\">Employee ID</td>\n        <td class=\"meta-value\">: {{EMP_ID}}</td>\n      </tr>\n      <tr>\n        <td class=\"meta-label\">Designation</td>\n        <td class=\"meta-value\">: {{DESIGNATION}}</td>\n      </tr>\n      <tr>\n        <td class=\"meta-label\">Department</td>\n        <td class=\"meta-value\">: {{DEPARTMENT}}</td>\n      </tr>\n      <tr>\n        <td class=\"meta-label\">Location</td>\n        <td class=\"meta-value\">: {{LOCATION}}</td>\n      </tr>\n    </table>\n\n    <!-- Subject -->\n    <div class=\"subject\">\n      Resignation Acceptance Letter\n    </div>\n\n    <!-- Letter Body -->\n    <div class=\"body\">\n      <div class=\"salutation\">\n        Dear {{EMP_NAME}},\n      </div>\n\n      <p>\n        This has reference to your resignation letter dated\n        <strong>{{RESIGNATION_DATE}}</strong>, wherein you have requested to be\n        relieved from the services of <strong>Seecog Softwares Pvt. Ltd.</strong>\n        from the position of <strong>{{DESIGNATION}}</strong>.\n      </p>\n\n      <p>\n        We hereby accept your resignation, and you will be relieved from your\n        duties with effect from the close of business hours on\n        <strong>{{LAST_WORKING_DAY}}</strong>, upon completion of your notice\n        period of <strong>{{NOTICE_PERIOD}}</strong> or as mutually agreed.\n      </p>\n\n      <p>\n        Please ensure that, prior to your relieving date, you:\n      </p>\n\n      <ul style=\"margin: 6px 0 10px 18px; padding: 0; font-size: 11px;\">\n        <li>Hand over all company assets, documents, and records in your possession.</li>\n        <li>Complete the knowledge transfer and handover process as instructed by your manager.</li>\n        <li>Obtain necessary clearances and no-dues from the respective departments.</li>\n      </ul>\n\n      <p>\n        Your Full &amp; Final Settlement will be processed as per company policy\n        and shared with you separately. A Relieving and/or Experience Letter\n        will also be issued subject to successful completion of all exit\n        formalities.\n      </p>\n\n      <p>\n        We take this opportunity to thank you for your contributions during your\n        tenure with <strong>Seecog Softwares Pvt. Ltd.</strong> and wish you\n        success in your future professional and personal endeavors.\n      </p>\n\n      <!-- Closing & Signature -->\n      <div class=\"closing\">\n        <p>Your’s sincerely,</p>\n        <p>For Seecog Softwares Pvt. Ltd.</p>\n\n        <div class=\"signature-block\">\n          <div class=\"signature-name\">Ms. Sonam Agarwal</div>\n          <div class=\"signature-title\">HR Manager</div>\n          <div class=\"signature-title\">Email: sonam@seecogsoftwares.com</div>\n        </div>\n      </div>\n\n      <div class=\"footer-note\">\n        This is a system-generated resignation acceptance letter and does not\n        require a physical signature or company seal.\n      </div>\n    </div>\n  </div>\n</body>\n</html>\n',0,'2025-11-29 08:32:07','2025-11-29 08:32:07',NULL),(16,'No Dues / Clearance Form','NO_DUES_CLEARANCE','fas fa-list-check','Department-wise no dues / clearance checklist used during employee exit to confirm return of assets, settlement of dues, and HR final clearance.','<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\" />\n  <title>No Dues / Clearance Form - {{EMP_NAME}}</title>\n  <style>\n    * {\n      box-sizing: border-box;\n      font-family: Arial, Helvetica, sans-serif;\n    }\n\n    body {\n      margin: 0;\n      padding: 0;\n      background: #f5f5f5;\n      font-size: 11px;\n      line-height: 1.6;\n    }\n\n    .page {\n      width: 100%;\n      max-width: 190mm; /* fits nicely within A4 with Puppeteer margins */\n      margin: 0 auto;\n      padding: 12mm 10mm;\n      background: #ffffff;\n      border: 1px solid #d0d0d0;\n      box-shadow: 0 0 4mm rgba(0, 0, 0, 0.06);\n    }\n\n    @media print {\n      body {\n        background: #ffffff;\n      }\n      .page {\n        box-shadow: none;\n        border: none;\n        max-width: none;\n        width: auto;\n        margin: 0;\n        padding: 10mm 12mm;\n      }\n    }\n\n    .header {\n      text-align: center;\n      margin-bottom: 8px;\n    }\n\n    .company-name {\n      font-size: 16px;\n      font-weight: bold;\n      text-transform: uppercase;\n      letter-spacing: 0.5px;\n    }\n\n    .company-info {\n      margin-top: 4px;\n      font-size: 10px;\n      line-height: 1.4;\n    }\n\n    .line-separator {\n      margin: 10px 0;\n      border-top: 1px solid #999;\n    }\n\n    .date-line {\n      text-align: right;\n      font-size: 11px;\n      margin: 6px 0 10px 0;\n    }\n\n    .meta-table {\n      width: 100%;\n      border-collapse: collapse;\n      margin-bottom: 10px;\n      font-size: 11px;\n    }\n\n    .meta-table td {\n      padding: 2px 0;\n      vertical-align: top;\n    }\n\n    .meta-label {\n      width: 130px;\n      font-weight: bold;\n      white-space: nowrap;\n    }\n\n    .meta-value {\n      padding-left: 4px;\n    }\n\n    .subject {\n      font-size: 13px;\n      font-weight: bold;\n      text-align: center;\n      margin: 10px 0 10px 0;\n      text-transform: none;\n      text-decoration: underline;\n    }\n\n    .body-text {\n      font-size: 11px;\n      text-align: justify;\n      margin-bottom: 8px;\n    }\n\n    .clearance-table {\n      width: 100%;\n      border-collapse: collapse;\n      margin-top: 6px;\n      font-size: 11px;\n    }\n\n    .clearance-table th,\n    .clearance-table td {\n      border: 1px solid #000;\n      padding: 4px 5px;\n      vertical-align: top;\n    }\n\n    .clearance-table th {\n      background: #f0f0f0;\n      font-weight: bold;\n      text-align: center;\n    }\n\n    .clearance-table td {\n      text-align: left;\n    }\n\n    .center {\n      text-align: center;\n    }\n\n    .small {\n      font-size: 10px;\n    }\n\n    .footer-section {\n      margin-top: 14px;\n      font-size: 11px;\n    }\n\n    .signature-row {\n      display: flex;\n      justify-content: space-between;\n      margin-top: 16px;\n      font-size: 11px;\n    }\n\n    .sig-block {\n      width: 45%;\n    }\n\n    .sig-label-line {\n      margin-top: 30px;\n      border-top: 1px solid #000;\n      width: 100%;\n    }\n\n    .sig-caption {\n      margin-top: 2px;\n      font-size: 10px;\n    }\n\n    .note-text {\n      margin-top: 8px;\n      font-size: 10px;\n      color: #555;\n    }\n  </style>\n</head>\n<body>\n  <div class=\"page\">\n    <!-- Company Letterhead -->\n    <div class=\"header\">\n      <div class=\"company-name\">Seecog Softwares Private Limited</div>\n      <div class=\"company-info\">\n        CIN: U7220JH2021PTC017350<br />\n        Prestige Cube, Site No. 26, Laskar Hosur Road, Adugodi, Koramangala, Bengaluru, Karnataka 560030, India<br />\n        https://seecogsoftwares.com/ &nbsp; | &nbsp;\n        Email: info@seecogsoftwares.com &nbsp; | &nbsp;\n        Contact No: +91-7625067691\n      </div>\n    </div>\n\n    <div class=\"line-separator\"></div>\n\n    <!-- Date -->\n    <div class=\"date-line\">\n      Date: {{FORM_DATE}}\n    </div>\n\n    <!-- Employee Meta -->\n    <table class=\"meta-table\">\n      <tr>\n        <td class=\"meta-label\">Employee Name</td>\n        <td class=\"meta-value\">: {{EMP_NAME}}</td>\n        <td class=\"meta-label\">Employee ID</td>\n        <td class=\"meta-value\">: {{EMP_ID}}</td>\n      </tr>\n      <tr>\n        <td class=\"meta-label\">Designation</td>\n        <td class=\"meta-value\">: {{DESIGNATION}}</td>\n        <td class=\"meta-label\">Department</td>\n        <td class=\"meta-value\">: {{DEPARTMENT}}</td>\n      </tr>\n      <tr>\n        <td class=\"meta-label\">Location</td>\n        <td class=\"meta-value\">: {{LOCATION}}</td>\n        <td class=\"meta-label\">Last Working Day</td>\n        <td class=\"meta-value\">: {{LWD}}</td>\n      </tr>\n    </table>\n\n    <!-- Subject -->\n    <div class=\"subject\">\n      No Dues / Clearance Form\n    </div>\n\n    <!-- Intro Text -->\n    <div class=\"body-text\">\n      This form is to be completed as part of the exit formalities for the above-mentioned employee.\n      Each department is requested to confirm that there are no outstanding dues, assets or obligations\n      pending from the employee’s side. Kindly indicate the clearance status, add remarks if any,\n      and sign with date.\n    </div>\n\n    <!-- Clearance Table -->\n    <table class=\"clearance-table\">\n      <tr>\n        <th style=\"width: 18%;\">Department</th>\n        <th style=\"width: 38%;\">Items / Assets / Dues to Verify</th>\n        <th style=\"width: 14%;\">Clearance Status</th>\n        <th style=\"width: 30%;\">Remarks &amp; Signature</th>\n      </tr>\n      <tr>\n        <td>IT / Systems</td>\n        <td>\n          Laptop / desktop, charger, accessories, email &amp; system access, software licenses, VPN / tools,\n          data backup and handover.\n        </td>\n        <td class=\"center small\">\n          □ Cleared<br/>\n          □ Pending\n        </td>\n        <td>\n          ..................................................<br/>\n          ..................................................<br/>\n          Name &amp; Sign: __________________<br/>\n          Date: __________________\n        </td>\n      </tr>\n      <tr>\n        <td>Admin / Facilities</td>\n        <td>\n          ID card, access card, drawer / cupboard keys, seating / desk, office assets, stationery,\n          visitor cards, parking access, any other company property.\n        </td>\n        <td class=\"center small\">\n          □ Cleared<br/>\n          □ Pending\n        </td>\n        <td>\n          ..................................................<br/>\n          ..................................................<br/>\n          Name &amp; Sign: __________________<br/>\n          Date: __________________\n        </td>\n      </tr>\n      <tr>\n        <td>HR</td>\n        <td>\n          Resignation acceptance, exit interview, handover of HR documents, leave balance confirmation,\n          policy compliance, code of conduct, NDAs.\n        </td>\n        <td class=\"center small\">\n          □ Cleared<br/>\n          □ Pending\n        </td>\n        <td>\n          ..................................................<br/>\n          ..................................................<br/>\n          Name &amp; Sign: __________________<br/>\n          Date: __________________\n        </td>\n      </tr>\n      <tr>\n        <td>Finance / Accounts</td>\n        <td>\n          Salary advances, loans, reimbursement claims, corporate cards, expense settlements,\n          Full &amp; Final settlement eligibility.\n        </td>\n        <td class=\"center small\">\n          □ Cleared<br/>\n          □ Pending\n        </td>\n        <td>\n          ..................................................<br/>\n          ..................................................<br/>\n          Name &amp; Sign: __________________<br/>\n          Date: __________________\n        </td>\n      </tr>\n      <tr>\n        <td>Project / Reporting Manager</td>\n        <td>\n          Project handover, documentation, knowledge transfer, client communication, access to project\n          repositories, tasks &amp; responsibilities transitioned.\n        </td>\n        <td class=\"center small\">\n          □ Cleared<br/>\n          □ Pending\n        </td>\n        <td>\n          ..................................................<br/>\n          ..................................................<br/>\n          Name &amp; Sign: __________________<br/>\n          Date: __________________\n        </td>\n      </tr>\n      <tr>\n        <td>Library / Assets (if any)</td>\n        <td>\n          Books, technical material, shared devices, test devices, tools or equipment issued personally\n          to the employee.\n        </td>\n        <td class=\"center small\">\n          □ Cleared<br/>\n          □ Pending\n        </td>\n        <td>\n          ..................................................<br/>\n          ..................................................<br/>\n          Name &amp; Sign: __________________<br/>\n          Date: __________________\n        </td>\n      </tr>\n      <tr>\n        <td>Other (Specify)</td>\n        <td>\n          ..................................................<br/>\n          ..................................................<br/>\n          ..................................................\n        </td>\n        <td class=\"center small\">\n          □ Cleared<br/>\n          □ Pending\n        </td>\n        <td>\n          ..................................................<br/>\n          ..................................................<br/>\n          Name &amp; Sign: __________________<br/>\n          Date: __________________\n        </td>\n      </tr>\n    </table>\n\n    <!-- HR Final Clearance -->\n    <div class=\"footer-section\">\n      <strong>HR Final Clearance</strong>\n      <div class=\"body-text\" style=\"margin-top: 4px;\">\n        Based on the above departmental confirmations, the No Dues / Clearance for\n        <strong>{{EMP_NAME}}</strong> (Employee ID: <strong>{{EMP_ID}}</strong>) is:\n      </div>\n\n      <div class=\"body-text\" style=\"margin-top: 4px;\">\n        □ All dues cleared &nbsp;&nbsp;&nbsp;&nbsp; □ Pending items (as per remarks)\n      </div>\n\n      <div class=\"signature-row\">\n        <div class=\"sig-block\">\n          <div class=\"sig-label-line\"></div>\n          <div class=\"sig-caption\">Employee Signature</div>\n          <div class=\"sig-caption\">Name: {{EMP_NAME}}</div>\n          <div class=\"sig-caption\">Date: __________________</div>\n        </div>\n        <div class=\"sig-block\">\n          <div class=\"sig-label-line\"></div>\n          <div class=\"sig-caption\">HR Representative</div>\n          <div class=\"sig-caption\">Name: __________________</div>\n          <div class=\"sig-caption\">Date: __________________</div>\n        </div>\n      </div>\n\n      <div class=\"note-text\">\n        This is an internal clearance document to be used along with the Relieving Letter and\n        Full &amp; Final Settlement Statement for closure of exit formalities.\n      </div>\n    </div>\n  </div>\n</body>\n</html>\n',0,'2025-11-29 08:36:24','2025-11-29 08:36:24',NULL);
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
  `category` enum('KYC','AADHAAR','PAN','ADDRESS','EDUCATION','EXPERIENCE','HR','RESUME','OTHER') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_documents`
--

LOCK TABLES `employee_documents` WRITE;
/*!40000 ALTER TABLE `employee_documents` DISABLE KEYS */;
INSERT INTO `employee_documents` VALUES (37,2,'AADHAAR','Aadhaar','Mukesh Kumhar','867043993254',NULL,NULL,'Pending',NULL,NULL,NULL,NULL,NULL,'2025-11-30 09:43:03','2025-11-30 09:43:03'),(38,2,'OTHER','Passport','Mukesh Kumhar','84790356','2025-11-03','2025-11-11','Verified',NULL,NULL,'https://support.proof.com/hc/article_attachments/22907978517527',NULL,NULL,'2025-11-30 09:43:03','2025-11-30 09:43:03'),(39,2,'PAN','Pan','Mukesh Kumhar','LXP12345',NULL,NULL,'Verified',NULL,NULL,NULL,NULL,NULL,'2025-11-30 09:43:03','2025-11-30 09:43:03');
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
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_educations`
--

LOCK TABLES `employee_educations` WRITE;
/*!40000 ALTER TABLE `employee_educations` DISABLE KEYS */;
INSERT INTO `employee_educations` VALUES (18,2,'Bachelors','B.Tech CSE','Computer Science','Usha Martin University',NULL,2021,2025,2025,'7.69','Full-Time','College','India','Ranchi',NULL,'2025-11-30 09:43:03','2025-11-30 09:43:03');
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
  `relievingLetterUrl` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `salarySlipsUrl` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bankStatementUrl` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_employee_experiences_employee` (`employeeId`),
  CONSTRAINT `fk_employee_experiences_employee` FOREIGN KEY (`employeeId`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_experiences`
--

LOCK TABLES `employee_experiences` WRITE;
/*!40000 ALTER TABLE `employee_experiences` DISABLE KEYS */;
INSERT INTO `employee_experiences` VALUES (11,2,'Seecog Softwares','Developer','Full-Time','Saas',NULL,'Ranchi','India',NULL,NULL,0,NULL,NULL,NULL,NULL,0,'https://www.shine.com/blog/relieving-letter',NULL,NULL,'2025-11-30 09:43:03','2025-11-30 09:43:03'),(12,2,'Seecog','Developer','Internship','Website',NULL,'Ranchi','India',NULL,NULL,0,NULL,NULL,NULL,NULL,0,'https://factohr.com/wp-content/themes/factohr-theme/images/new/letter/relieving-letter/relieving-letter-format.webp','https://zdblogs.zohocorp.com/sites/payroll/academy/files/standard_salary_slip_format.png','https://www.scribd.com/document/441564542/bank-statement-pdf','2025-11-30 09:43:03','2025-11-30 09:43:03');
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
INSERT INTO `employees` VALUES (2,6,'Mukesh',NULL,'Kumhar','EMP0001','Permanent','Mukesh Kumhar','Male','Single','B+','Indian','Hindu','OBC','English, Hindi','Lead Developer','Engineering',NULL,NULL,NULL,3,'3rd Floor, ABC Tech Park, Outer Ring Road, Marathahalli, Bengaluru, Karnataka, 560037, India','2025-05-09',NULL,NULL,'Active','Remote','2003-01-20',8000000.00,8000.00,8000.00,NULL,NULL,NULL,0.00,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Pending',NULL,NULL,NULL,NULL,NULL,NULL,'Password',0,'Active',NULL,NULL,NULL,0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,'mukeshkumhar906@gmail.com','9064784636',NULL,'Test','test','8967546753','Lalpur','Near Maa Ram Pyari Hospital','Ranchi','Jharkhand','834001','India',1,'Lalpur',NULL,'Ranchi','Jharkhand','834001','India',1,'2025-11-19 09:20:46','2025-11-30 09:43:03'),(3,6,'Sonam',NULL,'Agarwal','EMP0002','Permanent','Sonam Agarwal','Female','Single','B+',NULL,NULL,NULL,NULL,'Senior HR','HR',NULL,NULL,NULL,NULL,'Ranchi','2024-01-01',NULL,NULL,'Active','Remote','2000-01-18',240000.00,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Pending',NULL,NULL,NULL,NULL,NULL,NULL,'Password',0,'Active',NULL,NULL,NULL,0,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,'sonam@gmail.com','6206992612',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,0,NULL,NULL,NULL,NULL,NULL,NULL,1,'2025-11-21 10:34:37','2025-11-21 10:43:28');
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
INSERT INTO `users` VALUES (1,NULL,'Mukesh','Kumar','+919064784636','mukesh@gmail.com','$2b$10$a3W0zGIwr2Qn2Xr/7CQYiOLpzqDSne8F/pvQ6LI1nv/xMU56Rllrm','shop_owner','active','da5d5fc2c80054d0792bf7042a383ccbfb516060639cf8e83858b545f8fe7af3','2025-11-28 09:34:06','2025-10-12 04:51:58','2025-11-21 09:34:06'),(3,NULL,'Sonam','Agarwal','+916206992612','sonamagarwal878@gmail.com','$2b$10$XSQEUkG9XQlzXFGBFjTkKeR5D154fSwajAQPNq2oK.UvwGoYKOD4a','shop_owner','active','9a600714e14ea7077f411a48ea8f008cb224f3ca9d4b7b8f4ffc1d20d97b957e','2025-10-22 08:13:43','2025-10-14 03:54:45','2025-10-15 08:13:43'),(6,NULL,'Test','1','+916786786374','test@gmail.com','$2b$10$kf1KHLAn5SOZn17kUuweEODVVIryVCR3tTmgDauft9AVzfBfC3iW.','shop_owner','active','ac9def49ddf24996d62258092cdf708152e08e968d76740c41c02953aadac363','2025-12-07 10:46:25','2025-11-16 14:11:35','2025-11-30 10:46:25');
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

-- Dump completed on 2025-11-30 16:57:07
