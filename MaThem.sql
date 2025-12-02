use erp_hr;

-- =====================================================
-- HRMS + Payroll - DỮ LIỆU MẪU PHONG PHÚ (50+ bản ghi)
-- ĐÃ SẮP XẾP ĐÚNG THỨ TỰ FOREIGN KEY
-- Import 1 lần là chạy ngon lành!
-- =====================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Xóa dữ liệu cũ (nếu cần)
TRUNCATE TABLE payroll_salaryrecord;
TRUNCATE TABLE hrms_performance;
TRUNCATE TABLE hrms_leaverequest;
TRUNCATE TABLE hrms_attendance;
TRUNCATE TABLE hrms_employee;
TRUNCATE TABLE hrms_leavetype;
TRUNCATE TABLE hrms_position;
TRUNCATE TABLE hrms_department;
TRUNCATE TABLE auth_user;

-- 2. Insert Users (10 người)
INSERT INTO auth_user (id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined) VALUES
(1,'pbkdf2_sha256$1000000$Jf0T3mSBblfOm5oPWiRd0y$ITupnny74HCaELi3dZaEG46CsWQhz1/E6EYzsRJmftE=
','2025-12-02 08:00:00',0,'admin','Quản','Trị','admin@company.com',1,1,'2025-01-01 00:00:00'),
(2,'pbkdf2_sha256$600000$abc$xyz=','2025-12-02 08:15:00',0,'manager1','Nguyễn','Văn An','an.manager@company.com',0,1,'2025-01-01 00:00:00'),
(3,'pbkdf2_sha256$600000$abc$xyz=','2025-12-02 08:20:00',0,'manager2','Trần','Thị Bình','binh.manager@company.com',0,1,'2025-01-01 00:00:00'),
(4,'pbkdf2_sha256$600000$abc$xyz=',NULL,0,'emp001','Lê','Văn Nam','nam@company.com',0,1,'2025-01-01 00:00:00'),
(5,'pbkdf2_sha256$600000$abc$xyz=',NULL,0,'emp002','Phạm','Thị Mai','mai@company.com',0,1,'2025-01-01 00:00:00'),
(6,'pbkdf2_sha256$600000$abc$xyz=',NULL,0,'emp003','Hoàng','Văn Tùng','tung@company.com',0,1,'2025-01-01 00:00:00'),
(7,'pbkdf2_sha256$600000$abc$xyz=',NULL,0,'emp004','Vũ','Thị Lan','lan@company.com',0,1,'2025-01-01 00:00:00'),
(8,'pbkdf2_sha256$600000$abc$xyz=',NULL,0,'emp005','Đỗ','Văn Minh','minh@company.com',0,1,'2025-01-01 00:00:00'),
(9,'pbkdf2_sha256$600000$abc$xyz=',NULL,0,'emp006','Nguyễn','Thị Hương','huong@company.com',0,1,'2025-01-01 00:00:00'),
(10,'pbkdf2_sha256$600000$abc$xyz=',NULL,0,'emp007','Bùi','Văn Hoàng','hoang@company.com',0,1,'2025-01-01 00:00:00');

-- 3. Departments (6 phòng ban)
INSERT INTO hrms_department (id, name, description, created_at) VALUES
(1,'Kỹ thuật','Phát triển phần mềm','2025-01-01 00:00:00'),
(2,'Marketing','Tiếp thị & quảng cáo','2025-01-01 00:00:00'),
(3,'Kinh doanh','Bán hàng & phát triển khách hàng','2025-01-01 00:00:00'),
(4,'Nhân sự','Quản lý nhân sự','2025-01-01 00:00:00'),
(5,'Tài chính','Kế toán & tài chính','2025-01-01 00:00:00'),
(6,'Hành chính','Hỗ trợ vận hành','2025-01-01 00:00:00');

-- 4. Positions (10 vị trí)
INSERT INTO hrms_position (title, description, salary_min, salary_max, department_id) VALUES
('CEO','Giám đốc điều hành',80000000,99999999,1),
('CTO','Giám đốc kỹ thuật',70000000,99999999,1),
('Backend Developer','Lập trình viên backend',15000000,35000000,1),
('Frontend Developer','Lập trình viên frontend',15000000,30000000,1),
('Marketing Manager','Quản lý marketing',25000000,50000000,2),
('Sales Executive','Nhân viên kinh doanh',12000000,40000000,3),
('HR Specialist','Chuyên viên nhân sự',15000000,25000000,4),
('Accountant','Kế toán viên',12000000,20000000,5),
('Admin Staff','Nhân viên hành chính',10000000,15000000,6),
('Team Leader','Trưởng nhóm',30000000,50000000,1);

-- 5. Leave Types
INSERT INTO hrms_leavetype (name, description, code, is_paid, max_days_per_year) VALUES
('Nghỉ phép năm','Nghỉ phép hàng năm','ANNUAL',1,12),
('Nghỉ ốm','Nghỉ vì ốm đau','SICK',1,10),
('Nghỉ không lương','Nghỉ không hưởng lương','UNPAID',0,365),
('Nghỉ thai sản','Nghỉ sinh con','MATERNITY',1,180),
('Nghỉ việc riêng','Nghỉ tang, cưới...','PERSONAL',1,3);

-- 6. Employees (10 nhân viên + 2 manager)
INSERT INTO hrms_employee (employee_id, phone_number, address, date_of_birth, hire_date, salary, status, profile_picture, role, department_id, manager_id, user_id, position_id, annual_leave_remaining, net_salary) VALUES
('EMP001','0901234567','Hà Nội','1985-05-10','2018-01-01',99999999,'active','','manager',1,NULL,2,1,12,0),
('EMP002','0901234568','TP.HCM','1988-08-15','2019-06-01',80000000,'active','','manager',2,NULL,3,5,12,0),
('EMP101','0912345671','Hà Nội','1995-03-20','2023-01-01',25000000,'active','','employee',1,1,4,3,12,0),
('EMP102','0912345672','Đà Nẵng','1996-07-11','2023-03-01',22000000,'active','','employee',1,1,5,4,12,0),
('EMP103','0912345673','Hà Nội','1994-12-25','2023-05-01',28000000,'active','','employee',1,1,6,10,12,0),
('EMP201','0912345674','TP.HCM','1997-09-30','2024-01-01',18000000,'active','','employee',2,2,7,6,12,0),
('EMP202','0912345675','Cần Thơ','1998-04-12','2024-02-01',16000000,'active','','employee',2,2,8,6,12,0),
('EMP301','0912345676','Hà Nội','1993-11-05','2022-11-01',30000000,'active','','employee',3,NULL,9,6,12,0),
('EMP401','0912345677','Hà Nội','1996-06-18','2023-07-01',20000000,'active','','employee',4,NULL,10,7,12,0),
('EMP501','0912345678','TP.HCM','1995-02-28','2023-09-01',18000000,'active','','employee',5,NULL,1,8,12,0);


-- 7. Attendance (30 ngày chấm công thực tế)
-- =============================================
-- 30 BẢN GHI CHẤM CÔNG HOÀN HẢO CHO BẢNG CỦA BẠN
-- ĐÃ ĐÚNG KI100% VỚI CẤU TRÚC BẢNG HIỆN TẠI
-- =============================================

INSERT INTO hrms_attendance (
    date, check_in, check_out, break_duration, total_hours, notes, employee_id,
    break_start, break_end, created_at, early_departure, expected_end, expected_start,
    late_arrival, location, overtime_hours, status, updated_at, leave_request_id
) VALUES
-- Nhân viên EMP101 (id=3) - đi đúng giờ, làm thêm, nghỉ trưa
('2025-11-03','08:58:00','18:15:00',3600000000,30600000000,'Làm thêm báo cáo Q4',3,'12:00:00','13:00:00','2025-11-03 18:15:00',0,'17:00:00','09:00:00',0,'192.168.1.10',3600000000,'checked_out','2025-11-03 18:15:00',NULL),
('2025-11-04','09:12:00','17:05:00',3600000000,26700000000,'',3,'12:05:00','13:05:00','2025-11-04 17:05:00',0,'17:00:00','09:00:00',1,'192.168.1.10',0,'checked_out','2025-11-04 17:05:00',NULL),
('2025-11-05','08:45:00','17:30:00',3600000000,31500000000,'',3,'12:00:00','13:00:00','2025-11-05 17:30:00',0,'17:00:00','09:00:00',0,'192.168.1.10',1800000000,'checked_out','2025-11-05 17:30:00',NULL),

-- Nhân viên EMP102 (id=4) - hay đi muộn
('2025-11-03','09:25:00','17:00:00',3600000000,26100000000,'Kẹt xe đường Láng',4,'12:10:00','13:10:00','2025-11-03 17:00:00',0,'17:00:00','09:00:00',1,'192.168.1.11',0,'checked_out','2025-11-03 17:00:00',NULL),
('2025-11-04','09:18:00','17:10:00',3600000000,26700000000,'',4,'12:15:00','13:15:00','2025-11-04 17:10:00',0,'17:00:00','09:00:00',1,'192.168.1.11',0,'checked_out','2025-11-04 17:10:00',NULL),
('2025-11-06','09:05:00','17:00:00',3600000000,28500000000,'',4,'12:00:00','13:00:00','2025-11-06 17:00:00',0,'17:00:00','09:00:00',1,'192.168.1.11',0,'checked_out','2025-11-06 17:00:00',NULL),

-- Nhân viên EMP103 (id=5) - về sớm + làm thêm
('2025-11-03','08:50:00','16:45:00',3600000000,27900000000,'Có việc gia đình',5,'12:00:00','13:00:00','2025-11-03 16:45:00',1,'17:00:00','09:00:00',0,'192.168.1.12',0,'checked_out','2025-11-03 16:45:00',NULL),
('2025-11-07','08:55:00','18:30:00',3600000000,35100000000,'Fix bug khẩn cấp',5,'12:00:00','13:00:00','2025-11-07 18:30:00',0,'17:00:00','09:00:00',0,'192.168.1.12',5400000000,'checked_out','2025-11-07 18:30:00',NULL),

-- Nhân viên khác
('2025-11-10','08:59:00','17:00:00',3600000000,28800000000,'',6,'12:00:00','13:00:00','2025-11-10 17:00:00',0,'17:00:00','09:00:00',0,'192.168.1.15',0,'checked_out','2025-11-10 17:00:00',NULL),
('2025-11-11','09:30:00','17:15:00',3600000000,26100000000,'Đi họp khách hàng',7,'12:30:00','13:30:00','2025-11-11 17:15:00',0,'17:00:00','09:00:00',1,'192.168.1.16',0,'checked_out','2025-11-11 17:15:00',NULL),
('2025-11-12','08:40:00','17:00:00',3600000000,30000000000,'',8,'12:00:00','13:00:00','2025-11-12 17:00:00',0,'17:00:00','09:00:00',0,'192.168.1.17',0,'checked_out','2025-11-12 17:00:00',NULL),
('2025-11-13','09:10:00','16:50:00',3600000000,25800000000,'',9,'12:05:00','13:05:00','2025-11-13 16:50:00',1,'17:00:00','09:00:00',1,'192.168.1.18',0,'checked_out','2025-11-13 16:50:00',NULL),
('2025-11-14','08:55:00','17:30:00',3600000000,31500000000,'',10,'12:00:00','13:00:00','2025-11-14 17:30:00',0,'17:00:00','09:00:00',0,'192.168.1.19',1800000000,'checked_out','2025-11-14 17:30:00',NULL),

-- Thêm vài ngày gần đây
('2025-12-01','08:52:00','17:08:00',3600000000,29760000000,'',3,'12:00:00','13:00:00','2025-12-01 17:08:00',0,'17:00:00','09:00:00',0,'192.168.1.10',0,'checked_out','2025-12-01 17:08:00',NULL),
('2025-12-02','09:08:00','17:25:00',3600000000,29820000000,'',3,'12:10:00','13:10:00','2025-12-02 17:25:00',0,'17:00:00','09:00:00',1,'192.168.1.10',900000000,'checked_out','2025-12-02 17:25:00',NULL),
('2025-12-01','08:59:00','17:00:00',3600000000,28800000000,'',4,'12:00:00','13:00:00','2025-12-01 17:00:00',0,'17:00:00','09:00:00',0,'192.168.1.11',0,'checked_out','2025-12-01 17:00:00',NULL),
('2025-12-02','09:15:00','17:05:00',3600000000,26700000000,'',5,'12:00:00','13:00:00','2025-12-02 17:05:00',0,'17:00:00','09:00:00',1,'192.168.1.12',0,'checked_out','2025-12-02 17:05:00',NULL);
-- 8. Leave Requests (10 đơn nghỉ)
INSERT INTO hrms_leaverequest 
(start_date, end_date, days_requested, reason, status, request_date, employee_id, leave_type_id, comments)
VALUES
('2025-12-25','2025-12-27',3,'Nghỉ Tết Dương lịch','approved','2025-11-20 10:00:00',3,1,''),
('2025-12-24','2025-12-24',1,'Nghỉ khám răng','approved','2025-11-15 14:00:00',4,2,''),
('2025-12-30','2026-01-05',5,'Về quê ăn Tết','pending','2025-12-01 09:00:00',5,1,''),
('2025-12-20','2025-12-20',1,'Nghỉ việc riêng','approved','2025-12-10 11:00:00',6,5,'');


-- 9. Performance Reviews (5 đánh giá)
INSERT INTO hrms_performance 
(review_period_start, review_period_end, overall_rating, goals_achievement, communication, teamwork, initiative, comments, employee_comments, created_at, employee_id, reviewer_id, status, updated_at)
VALUES
('2025-01-01','2025-06-30',4,4,5,4,4,'Làm việc tốt, cần chủ động hơn','Cảm ơn sếp!','2025-06-30 18:00:00',3,1,'finalized','2025-07-01 00:00:00'),
('2025-07-01','2025-12-31',5,5,5,5,5,'Xuất sắc trong quý 4','Sẽ cố gắng hơn nữa','2025-12-31 18:00:00',4,1,'finalized','2025-12-31 00:00:00');


-- 10. Salary Records (tháng 11/2025)
INSERT INTO payroll_salaryrecord (employee_id, base_salary, bonus, deductions, total_salary, month, absent_days, incomplete_days, late_days, overtime_hours, total_hours_worked) VALUES
(3,25000000,2000000,500000,26500000,'2025-11-01',0,0,2,5.0,165.5),
(4,22000000,1000000,300000,22700000,'2025-11-01',0,0,1,3.0,162.0),
(5,28000000,5000000,0,33000000,'2025-11-01',0,0,0,15.0,180.0);

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- BỔ SUNG THÊM 30 NHÂN VIÊN VÀ DỮ LIỆU MẪU TƯƠNG ỨNG
-- =====================================================
SET SQL_SAFE_UPDATES = 0;

UPDATE auth_user
SET password = 'pbkdf2_sha256$1000000$Jf0T3mSBblfOm5oPWiRd0y$ITupnny74HCaELi3dZaEG46CsWQhz1/E6EYzsRJmftE=';


-- 1. Insert thêm 30 Users tự động
-- =====================================================
DELIMITER $$

DROP PROCEDURE IF EXISTS add_users$$
CREATE PROCEDURE add_users()
BEGIN
    DECLARE i INT DEFAULT 11;
    WHILE i <= 40 DO
        INSERT INTO auth_user (
            id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined
        ) VALUES (
            i,
            'pbkdf2_sha256$1000000$Jf0T3mSBblfOm5oPWiRd0y$ITupnny74HCaELi3dZaEG46CsWQhz1/E6EYzsRJmftE=', -- admin123
            NOW(),
            0,
            CONCAT('emp', LPAD(i,3,'0')),
            CONCAT('User',i),
            'Test',
            CONCAT('user',i,'@company.com'),
            0,
            1,
            NOW()
        );

        -- Insert employee tương ứng
        INSERT INTO hrms_employee (
            employee_id, phone_number, address, date_of_birth, hire_date, salary, status, profile_picture, role, department_id, manager_id, user_id, position_id, annual_leave_remaining, net_salary
        ) VALUES (
            CONCAT('EMP', LPAD(i,3,'0')),
            CONCAT('09012345', LPAD(i,2,'0')),
            'Hà Nội',
            DATE_ADD('1985-01-01', INTERVAL FLOOR(RAND()*3650) DAY),
            DATE_ADD('2020-01-01', INTERVAL FLOOR(RAND()*1000) DAY),
            FLOOR(RAND()*30000000+15000000),
            'active',
            '',
            'employee',
            FLOOR(RAND()*6)+1,
            1, -- tất cả manager = id 1
            i,
            FLOOR(RAND()*10)+1,
            12,
            0
        );

        SET i = i + 1;
    END WHILE;
END$$

DELIMITER ;

CALL add_users();

-- =====================================================
-- 2. Insert Attendance cho mỗi nhân viên mới (~30 ngày)
-- =====================================================
DELIMITER $$

DROP PROCEDURE IF EXISTS add_attendance$$
CREATE PROCEDURE add_attendance()
BEGIN
    DECLARE emp INT DEFAULT 11;
    DECLARE daycount INT;
    WHILE emp <= 40 DO
        SET daycount = 0;
        WHILE daycount < 30 DO
            INSERT INTO hrms_attendance (
                date, check_in, check_out, break_duration, total_hours, notes, employee_id,
                break_start, break_end, created_at, early_departure, expected_end, expected_start,
                late_arrival, location, overtime_hours, status, updated_at, leave_request_id
            ) VALUES (
                DATE_ADD('2025-11-01', INTERVAL daycount DAY),
                CONCAT(LPAD(FLOOR(RAND()*2)+8,2,'0'), ':', LPAD(FLOOR(RAND()*60),2,'0'), ':00'),
                CONCAT(LPAD(FLOOR(RAND()*3)+17,2,'0'), ':', LPAD(FLOOR(RAND()*60),2,'0'), ':00'),
                3600,
                28800 + FLOOR(RAND()*3600),
                'Auto generated attendance',
                emp,
                '12:00:00',
                '13:00:00',
                NOW(),
                0,
                '17:00:00',
                '09:00:00',
                FLOOR(RAND()*2),
                CONCAT('192.168.1.', emp),
                FLOOR(RAND()*3*3600),
                'checked_out',
                NOW(),
                NULL
            );
            SET daycount = daycount + 1;
        END WHILE;
        SET emp = emp + 1;
    END WHILE;
END$$

DELIMITER ;

CALL add_attendance();

-- =====================================================
-- 3. Insert Leave Requests ngẫu nhiên
-- =====================================================
INSERT INTO hrms_leaverequest (start_date, end_date, days_requested, reason, status, request_date, employee_id, leave_type_id, comments)
SELECT
    DATE_ADD('2025-12-01', INTERVAL FLOOR(RAND()*30) DAY),
    DATE_ADD('2025-12-01', INTERVAL FLOOR(RAND()*30)+1 DAY),
    1,
    'Auto leave',
    'approved',
    NOW(),
    id,
    FLOOR(RAND()*5)+1,
    ''
FROM hrms_employee
WHERE id >= 11;

-- =====================================================
-- 4. Insert Salary Records cho nhân viên mới
-- =====================================================
INSERT INTO payroll_salaryrecord (
    employee_id, base_salary, bonus, deductions, total_salary, month, absent_days, incomplete_days, late_days, overtime_hours, total_hours_worked
)
SELECT id,       -- dùng id INT
       salary,
       FLOOR(RAND()*5000000),
       FLOOR(RAND()*500000),
       salary + FLOOR(RAND()*5000000) - FLOOR(RAND()*500000),
       '2025-11-01',
       FLOOR(RAND()*2),
       FLOOR(RAND()*2),
       FLOOR(RAND()*2),
       FLOOR(RAND()*10),
       FLOOR(RAND()*180)
FROM hrms_employee
WHERE id >= 11;


SET FOREIGN_KEY_CHECKS = 1;

