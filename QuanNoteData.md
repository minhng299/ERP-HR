 
<!-- | Username | Password (giả lập) | Employee ID | Họ & Tên      | Email                                                       | Vai trò |
| -------- | ------------------ | ----------- | ------------- | ----------------------------------------------------------- | ------- |
| manager1 | `abc`              | EMP001      | Nguyễn Văn An | [an.manager@company.com](mailto:an.manager@company.com)     | Manager |
| manager2 | `abc`              | EMP002      | Trần Thị Bình | [binh.manager@company.com](mailto:binh.manager@company.com) | Manager |
 | Username | Password (giả lập) | Employee ID | Họ & Tên         | Email                                         |
| -------- | ------------------ | ----------- | ---------------- | --------------------------------------------- |
| emp001   | `abc`              | EMP101      | Lê Văn Nam       | [nam@company.com](mailto:nam@company.com)     |
| emp002   | `abc`              | EMP102      | Phạm Thị Mai     | [mai@company.com](mailto:mai@company.com)     |
| emp003   | `abc`              | EMP103      | Hoàng Văn Tùng   | [tung@company.com](mailto:tung@company.com)   |
| emp004   | `abc`              | EMP201      | Vũ Thị Lan       | [lan@company.com](mailto:lan@company.com)     |
| emp005   | `abc`              | EMP202      | Đỗ Văn Minh      | [minh@company.com](mailto:minh@company.com)   |
| emp006   | `abc`              | EMP301      | Nguyễn Thị Hương | [huong@company.com](mailto:huong@company.com) |
| emp007   | `abc`              | EMP401      | Bùi Văn Hoàng    | [hoang@company.com](mailto:hoang@company.com) |
| emp008   | `abc`              | EMP501      | (không có tên)   | (không có email)                              |

MẬT KHẨU admin123
-->

-- =====================================================
-- HRMS + Payroll Full Database Backup (erp_hr)
-- Date: 2025-12-02
-- Total tables: 18
-- Import ngay vào MySQL/MariaDB không lỗi
-- =====================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- -----------------------------------------------------
-- 1. auth_group
-- -----------------------------------------------------
DROP TABLE IF EXISTS `auth_group`;
CREATE TABLE `auth_group` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 2. django_content_type
-- -----------------------------------------------------
DROP TABLE IF EXISTS `django_content_type`;
CREATE TABLE `django_content_type` (
  `id` int NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `model` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `django_content_type` VALUES
(1,'admin','logentry'),(2,'auth','permission'),(3,'auth','group'),(4,'auth','user'),
(5,'contenttypes','contenttype'),(6,'sessions','session'),
(7,'hrms','department'),(8,'hrms','leavetype'),(9,'hrms','employee'),(10,'hrms','leaverequest'),
(11,'hrms','position'),(12,'hrms','attendance'),(13,'hrms','performance'),(14,'hrms','leavepenalty'),
(15,'payroll','salaryrecord');

-- -----------------------------------------------------
-- 3. auth_permission
-- -----------------------------------------------------
DROP TABLE IF EXISTS `auth_permission`;
CREATE TABLE `auth_permission` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content_type_id` int NOT NULL,
  `codename` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  KEY `auth_permission_content_type_id_2f476e4b_fk_django_content_type_id` (`content_type_id`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_content_type_id` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `auth_permission` VALUES
(1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),
(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),
(9,'Can add group',3,'add_group'),(10,'Can change group',3,'change_group'),(11,'Can delete group',3,'delete_group'),(12,'Can view group',3,'view_group'),
(13,'Can add user',4,'add_user'),(14,'Can change user',4,'change_user'),(15,'Can delete user',4,'delete_user'),(16,'Can view user',4,'view_user'),
(17,'Can add content type',5,'add_contenttype'),(18,'Can change content type',5,'change_contenttype'),(19,'Can delete content type',5,'delete_contenttype'),(20,'Can view content type',5,'view_contenttype'),
(21,'Can add session',6,'add_session'),(22,'Can change session',6,'change_session'),(23,'Can delete session',6,'delete_session'),(24,'Can view session',6,'view_session'),
(25,'Can add department',7,'add_department'),(26,'Can change department',7,'change_department'),(27,'Can delete department',7,'delete_department'),(28,'Can view department',7,'view_department'),
(29,'Can add leave type',8,'add_leavetype'),(30,'Can change leave type',8,'change_leavetype'),(31,'Can delete leave type',8,'delete_leavetype'),(32,'Can view leave type',8,'view_leavetype'),
(33,'Can add employee',9,'add_employee'),(34,'Can change employee',9,'change_employee'),(35,'Can delete employee',9,'delete_employee'),(36,'Can view employee',9,'view_employee'),
(37,'Can add leave request',10,'add_leaverequest'),(38,'Can change leave request',10,'change_leaverequest'),(39,'Can delete leave request',10,'delete_leaverequest'),(40,'Can view leave request',10,'view_leaverequest'),
(41,'Can add position',11,'add_position'),(42,'Can change position',11,'change_position'),(43,'Can delete position',11,'delete_position'),(44,'Can view position',11,'view_position'),
(45,'Can add attendance',12,'add_attendance'),(46,'Can change attendance',12,'change_attendance'),(47,'Can delete attendance',12,'delete_attendance'),(48,'Can view attendance',12,'view_attendance'),
(49,'Can add performance',13,'add_performance'),(50,'Can change performance',13,'change_performance'),(51,'Can delete performance',13,'delete_performance'),(52,'Can view performance',13,'view_performance'),
(53,'Can add leave penalty',14,'add_leavepenalty'),(54,'Can change leave penalty',14,'change_leavepenalty'),(55,'Can delete leave penalty',14,'delete_leavepenalty'),(56,'Can view leave penalty',14,'view_leavepenalty'),
(57,'Can add salary record',15,'add_salaryrecord'),(58,'Can change salary record',15,'change_salaryrecord'),(59,'Can delete salary record',15,'delete_salaryrecord'),(60,'Can view salary record',15,'view_salaryrecord');

-- -----------------------------------------------------
-- 4. auth_user
-- -----------------------------------------------------
DROP TABLE IF EXISTS `auth_user`;
CREATE TABLE `auth_user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `password` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(254) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `auth_user` VALUES
(1,'pbkdf2_sha256$1000000$9flzhc1wJCJYR9HlmDn4bc$6U5bhevGtEzyerw9Nn0HlDn7fHMczOpzEJ/u+xYRzwM=',NULL,0,'manager1','Alice','Manager','manager1@example.com',0,1,'2025-12-01 07:28:39.729125'),
(3,'pbkdf2_sha256$1000000$k0hkbkQ6IPLCXOxHumKDpM$a0do/+c5/Ev5gMyao1kBxdoCIq7vSsE40aDapivrcCs=',NULL,0,'employee2','Charlie','Employee','employee2@example.com',0,1,'2025-12-01 07:28:41.466239'),
(4,'pbkdf2_sha256$1000000$mpXdD3cMKBLDn4VtiAOxRX$xpBpVOXpo0XtYMDapN3pNARgV8BiHSaWkNdsQluYvj0=',NULL,0,'newemployee002','New','Employee','new.employee@company.com',0,1,'2025-12-02 01:22:56.261796'),
(5,'pbkdf2_sha256$1000000$R7Jd36yjTz6LloSbJQ83C4$HrfhhldXJBhc6upmQ/jJqPgvPUtsDwKB4Tswu1AAmS8=',NULL,0,'quan','New','quan','new.employee@company.com',0,1,'2025-12-02 02:32:31.063909');

-- -----------------------------------------------------
-- 5. hrms_department
-- -----------------------------------------------------
DROP TABLE IF EXISTS `hrms_department`;
CREATE TABLE `hrms_department` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `hrms_department` VALUES
(1,'Engineering','Software development and technical teams','2025-12-01 07:28:39.663591'),
(2,'Marketing','Brand and digital marketing','2025-12-01 07:28:39.668110'),
(3,'Sales','Sales and business development','2025-12-01 07:28:39.671112'),
(4,'HR','Human resources and people operations','2025-12-01 07:28:39.675112'),
(5,'Finance','Financial planning and accounting','2025-12-01 07:28:39.680113'),
(6,'IT Department','Information Technology Department','2025-12-02 02:13:34.816124');

-- -----------------------------------------------------
-- 6. hrms_position
-- -----------------------------------------------------
DROP TABLE IF EXISTS `hrms_position`;
CREATE TABLE `hrms_position` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `salary_min` decimal(10,2) NOT NULL,
  `salary_max` decimal(10,2) NOT NULL,
  `department_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `hrms_position_department_id_2850761d_fk_hrms_department_id` (`department_id`),
  CONSTRAINT `hrms_position_department_id_2850761d_fk_hrms_department_id` FOREIGN KEY (`department_id`) REFERENCES `hrms_department` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `hrms_position` VALUES
(1,'Software Engineer','Develops software',80000.00,150000.00,1),
(2,'Marketing Specialist','Handles marketing',50000.00,90000.00,2),
(3,'Sales Executive','Drives sales',60000.00,120000.00,3),
(4,'HR Manager','Manages HR',70000.00,130000.00,4),
(5,'Accountant','Manages accounts',55000.00,100000.00,5);

-- -----------------------------------------------------
-- 7. hrms_leavetype
-- -----------------------------------------------------
DROP TABLE IF EXISTS `hrms_leavetype`;
CREATE TABLE `hrms_leavetype` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_paid` tinyint(1) NOT NULL,
  `max_days_per_year` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `hrms_leavetype_name_b194eaad_uniq` (`name`),
  UNIQUE KEY `hrms_leavetype_code_fcfb7669_uniq` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `hrms_leavetype` VALUES
(1,'Annual Leave','Yearly vacation days','ANNUAL-LEA',1,25),
(2,'Sick Leave','Medical leave','SICK-LEAVE',1,10),
(3,'Personal Leave','Personal time off','PERSONAL-L',1,5),
(4,'Maternity Leave','Maternity leave','MATERNITY-',1,90);

-- -----------------------------------------------------
-- 8. hrms_employee
-- -----------------------------------------------------
DROP TABLE IF EXISTS `hrms_employee`;
CREATE TABLE `hrms_employee` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `employee_id` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone_number` varchar(17) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `date_of_birth` date NOT NULL,
  `hire_date` date NOT NULL,
  `salary` decimal(10,2) NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `profile_picture` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_id` bigint NOT NULL,
  `manager_id` bigint DEFAULT NULL,
  `user_id` int NOT NULL,
  `position_id` bigint NOT NULL,
  `annual_leave_remaining` int NOT NULL,
  `net_salary` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `hrms_employee_department_id_2c466a89_fk_hrms_department_id` (`department_id`),
  KEY `hrms_employee_position_id_9c3a50c8_fk_hrms_position_id` (`position_id`),
  CONSTRAINT `hrms_employee_department_id_2c466a89_fk_hrms_department_id` FOREIGN KEY (`department_id`) REFERENCES `hrms_department` (`id`),
  CONSTRAINT `hrms_employee_position_id_9c3a50c8_fk_hrms_position_id` FOREIGN KEY (`position_id`) REFERENCES `hrms_position` (`id`),
  CONSTRAINT `hrms_employee_user_id_66e47d24_fk_auth_user_id` FOREIGN KEY (`user_id`) REFERENCES `auth_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `hrms_employee` VALUES
(1,'E001','+1234567890','123 Main St','1990-01-01','2020-01-01',22000000.00,'active','','manager',1,NULL,1,1,12,0.00),
(3,'E003','+1234567890','123 Main St','1992-01-01','2025-09-25',6000000.00,'active','','employee',3,NULL,3,3,12,0.00),
(4,'NE002','+84987654322','Da Nang','1992-03-15','2024-02-01',12000000.00,'active','','employee',1,NULL,4,2,12,0.00),
(5,'NE0099','+84987654322','Da Nang','1992-03-15','2024-02-01',12000000.00,'active','','employee',1,NULL,5,2,12,0.00);

-- -----------------------------------------------------
-- 9. hrms_attendance
-- -----------------------------------------------------
DROP TABLE IF EXISTS `hrms_attendance`;
CREATE TABLE `hrms_attendance` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `check_in` time(6) DEFAULT NULL,
  `check_out` time(6) DEFAULT NULL,
  `break_duration` int DEFAULT NULL,
  `total_hours` decimal(6,2) DEFAULT NULL,
  `notes` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_id` bigint NOT NULL,
  `break_start` time(6) DEFAULT NULL,
  `break_end` time(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `is_late` tinyint(1) NOT NULL,
  `expected_start` time(6) NOT NULL,
  `expected_end` time(6) NOT NULL,
  `incomplete` tinyint(1) NOT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_on_leave` tinyint(1) NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `leave_request_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `hrms_attendance_employee_id_fk` (`employee_id`),
  CONSTRAINT `hrms_attendance_employee_id_fk` FOREIGN KEY (`employee_id`) REFERENCES `hrms_employee` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `hrms_attendance` VALUES
(45,'2025-12-01','08:30:00.000000','17:00:00.000000',0,8.50,'',1,NULL,NULL,'2025-12-01 07:28:42.524506',0,'09:00:00.000000','17:00:00.000000',0,'192.168.1.102',0,'checked_out','2025-12-01 07:28:42.524506',NULL),
(46,'2025-12-01','07:58:09.060832','07:58:10.736026',0,1675194.00,'',1,NULL,NULL,'2025-12-01 07:58:09.067834',1,'17:00:00.000000','09:00:00.000000',0,'127.0.0.1',0,'checked_out','2025-12-01 07:58:10.739582',NULL),
(47,'2025-12-02','01:38:44.635375','01:39:10.795016',4913844,21245797.00,'',1,'01:39:04.267718','01:38:59.353874','2025-12-02 01:38:44.645377',1,'17:00:00.000000','09:00:00.000000',0,'127.0.0.1',0,'checked_out','2025-12-02 01:39:10.797039',NULL),
(48,'2025-12-02','01:40:45.028179','01:40:51.693672',0,6665493.00,'',3,NULL,NULL,'2025-12-02 01:40:45.036176',1,'17:00:00.000000','09:00:00.000000',0,'127.0.0.1',0,'checked_out','2025-12-02 01:40:51.697668',NULL);

-- -----------------------------------------------------
-- 10. payroll_salaryrecord
-- -----------------------------------------------------
DROP TABLE IF EXISTS `payroll_salaryrecord`;
CREATE TABLE `payroll_salaryrecord` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `employee_id` int NOT NULL,
  `base_salary` decimal(12,2) NOT NULL,
  `bonus` decimal(12,2) NOT NULL,
  `deductions` decimal(12,2) NOT NULL,
  `total_salary` decimal(12,2) NOT NULL,
  `month` date NOT NULL,
  `absent_days` int NOT NULL,
  `incomplete_days` int NOT NULL,
  `late_days` int NOT NULL,
  `overtime_hours` decimal(6,2) NOT NULL,
  `total_hours_worked` decimal(6,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `payroll_salaryrecord` VALUES
(4,1,22000000.00,0.00,0.00,22000000.00,'2025-12-01',0,0,0,0.00,0.01);

-- -----------------------------------------------------
-- 11. Các bảng còn lại (trống)
-- -----------------------------------------------------
DROP TABLE IF EXISTS `auth_user_groups`;       CREATE TABLE `auth_user_groups`       LIKE `auth_user_groups`;       INSERT INTO `auth_user_groups`       SELECT * FROM `auth_user_groups`;
DROP TABLE IF EXISTS `auth_group_permissions`; CREATE TABLE `auth_group_permissions` LIKE `auth_group_permissions`; INSERT INTO `auth_group_permissions` SELECT * FROM `auth_group_permissions`;
DROP TABLE IF EXISTS `auth_user_user_permissions`; CREATE TABLE `auth_user_user_permissions` LIKE `auth_user_user_permissions`; INSERT INTO `auth_user_user_permissions` SELECT * FROM `auth_user_user_permissions`;
DROP TABLE IF EXISTS `django_admin_log`;       CREATE TABLE `django_admin_log`       LIKE `django_admin_log`;       INSERT INTO `django_admin_log`       SELECT * FROM `django_admin_log`;
DROP TABLE IF EXISTS `django_session`;         CREATE TABLE `django_session`         LIKE `django_session`;         INSERT INTO `django_session`         SELECT * FROM `django_session`;
DROP TABLE IF EXISTS `hrms_leaverequest`;      CREATE TABLE `hrms_leaverequest`      LIKE `hrms_leaverequest`;      INSERT INTO `hrms_leaverequest`      SELECT * FROM `hrms_leaverequest`;
DROP TABLE IF EXISTS `hrms_leavepenalty`;      CREATE TABLE `hrms_leavepenalty`      LIKE `hrms_leavepenalty`;      INSERT INTO `hrms_leavepenalty`      SELECT * FROM `hrms_leavepenalty`;
DROP TABLE IF EXISTS `hrms_performance`;       CREATE TABLE `hrms_performance`       LIKE `hrms_performance`;       INSERT INTO `hrms_performance`       SELECT * FROM `hrms_performance`;

-- =====================================================
-- HOÀN TẤT – Bật lại foreign key
-- =====================================================
SET FOREIGN_KEY_CHECKS = 1;

-- DONE! Database erp_hr đã được khôi phục hoàn chỉnh.





 AUTHENTICATION (5 APIs)
POST /api/auth/signup/ - Đăng ký tài khoản mới

POST /api/token/ - Login lấy JWT token

POST /api/token/refresh/ - Refresh token

POST /api/auth/change_password/ - Đổi mật khẩu

 EMPLOYEE MANAGEMENT (8 APIs)
GEt /api/employees/ - Lấy danh sách nhân viên (Manager)

POST /api/employees/ - Tạo nhân viên mới (Manager)

GET /api/employees/{id}/ - Lấy thông tin nhân viên

PUT /api/employees/{id}/ - Cập nhật nhân viên (Manager)

DELETE /api/employees/{id}/ - Xóa nhân viên (Manager)

GET /api/employees/me/ - Lấy thông tin cá nhân

PATCH /api/employees/me/ - Cập nhật thông tin cá nhân

GET /api/employees/dashboard_stats/ - Thống kê dashboard (Manager)

DEPARTMENT & POSITION (10 APIs)
GET /api/departments/ - Lấy danh sách phòng ban

POST /api/departments/ - Tạo phòng ban (Manager)

GET /api/departments/{id}/ - Lấy thông tin phòng ban

PUT /api/departments/{id}/ - Cập nhật phòng ban (Manager)

DELETE /api/departments/{id}/ - Xóa phòng ban (Manager)

GET /api/positions/ - Lấy danh sách chức vụ

POST /api/positions/ - Tạo chức vụ (Manager)

GET /api/positions/{id}/ - Lấy thông tin chức vụ

PUT /api/positions/{id}/ - Cập nhật chức vụ (Manager)

DELETE /api/positions/{id}/ - Xóa chức vụ (Manager)

 ATTENDANCE (13 APIs)
GET /api/attendances/ - Lấy lịch sử chấm công

GET /api/attendances/{id}/ - Lấy thông tin chấm công

POST /api/attendances/ - Tạo bản ghi chấm công

PUT /api/attendances/{id}/ - Cập nhật chấm công

DELETE /api/attendances/{id}/ - Xóa bản ghi chấm công

GET /api/attendances/current_status/ - Trạng thái hiện tại

POST /api/attendances/check_in/ - Check-in

POST /api/attendances/start_break/ - Bắt đầu nghỉ

POST /api/attendances/end_break/ - Kết thúc nghỉ

POST /api/attendances/check_out/ - Check-out

GET /api/attendances/today/ - Chấm công hôm nay (Manager)

GET /api/attendances/stats/ - Thống kê chấm công

GET /api/attendances/?date_from&date_to - Lọc theo ngày

 LEAVE MANAGEMENT (14 APIs)
GET /api/leavetypes/ - Lấy danh sách loại phép

POST /api/leavetypes/ - Tạo loại phép (Manager)

GET /api/leavetypes/{id}/ - Lấy thông tin loại phép

PUT /api/leavetypes/{id}/ - Cập nhật loại phép (Manager)

DELETE /api/leavetypes/{id}/ - Xóa loại phép (Manager)

GET /api/leaverequests/ - Lấy danh sách đơn xin nghỉ

POST /api/leaverequests/ - Tạo đơn xin nghỉ (Employee)

GET /api/leaverequests/{id}/ - Lấy thông tin đơn xin nghỉ

PUT /api/leaverequests/{id}/ - Cập nhật đơn xin nghỉ

DELETE /api/leaverequests/{id}/ - Xóa đơn xin nghỉ

POST /api/leaverequests/{id}/approve/ - Duyệt đơn (Manager)

POST /api/leaverequests/{id}/reject/ - Từ chối đơn (Manager)

POST /api/leaverequests/{id}/cancel/ - Hủy đơn (Employee)

GET /api/leaverequests/stats/ - Thống kê đơn nghỉ

 PERFORMANCE REVIEW (10 APIs)
GET /api/performances/ - Lấy danh sách đánh giá

POST /api/performances/ - Tạo đánh giá (Manager)

GET /api/performances/{id}/ - Lấy thông tin đánh giá

PUT /api/performances/{id}/ - Cập nhật đánh giá

DELETE /api/performances/{id}/ - Xóa đánh giá (Manager)

GET /api/performances/my_reviews/ - Đánh giá của tôi (Employee)

GET /api/performances/by_status/ - Lọc theo trạng thái

GET /api/performances/analytics/ - Thống kê đánh giá

GET /api/performances/{id}/review_history/ - Lịch sử đánh giá

GET /api/performances/{id}/export_pdf/ - Xuất PDF

Tổng cộng: 60 API endpoints đầy đủ





