
---

## 🔐 **API XÁC THỰC**

---

### **API 1: ĐĂNG NHẬP LẤY TOKEN**

**Endpoint:**
```http
POST http://localhost:8000/api/token/
```

**Đầu Vào:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Đầu Ra Thành Công (200):**
```json
{
  "access": "string",
  "refresh": "string"
}
```

**Đầu Ra Lỗi (401):**
```json
{
  "detail": "No active account found with the given credentials"
}
```

---

### **API 2: LÀM MỚI TOKEN**

**Endpoint:**
```http
POST http://localhost:8000/api/token/refresh/
```

**Đầu Vào:**
```json
{
  "refresh": "string"
}
```

**Đầu Ra Thành Công (200):**
```json
{
  "access": "string"
}
```

---

## 👥 **API QUẢN LÝ NHÂN VIÊN**

---

### **API 3: LẤY DANH SÁCH NHÂN VIÊN**

**Endpoint:**
```http
GET http://localhost:8000/api/employees/
Authorization: Bearer <token>
```

**Đầu Vào:** Không có body

**Đầu Ra Thành Công (200):**
```json
[
  {
    "id": 1,
    "user": {
      "id": 1,
      "username": "john_doe",
      "first_name": "John",
      "last_name": "Doe",
      "email": "john@example.com"
    },
    "employee_id": "EMP001",
    "phone_number": "+1234567890",
    "address": "123 Main St",
    "date_of_birth": "1990-01-01",
    "hire_date": "2020-01-01",
    "department": 1,
    "department_name": "Engineering",
    "position": 1,
    "position_title": "Software Engineer",
    "salary": "75000.00",
    "manager": null,
    "manager_name": null,
    "status": "active",
    "profile_picture": "",
    "annual_leave_remaining": 12,
    "role": "employee"
  }
]
```

---

### **API 4: LẤY THÔNG TIN CÁ NHÂN**

**Endpoint:**
```http
GET http://localhost:8000/api/employees/me/
Authorization: Bearer <token>
```

**Đầu Vào:** Không có body

**Đầu Ra Thành Công (200):**
```json
{
  "id": 1,
  "user": {
    "id": 1,
    "username": "employee1",
    "first_name": "Bob",
    "last_name": "Employee", 
    "email": "employee1@example.com"
  },
  "employee_id": "E002",
  "department_name": "Engineering",
  "position_title": "Software Engineer",
  "role": "employee",
  "status": "active"
}
```

---

### **API 5: 📊 DASHBOARD THỐNG KÊ**

**Endpoint:**
```http
GET http://localhost:8000/api/employees/dashboard_stats/
Authorization: Bearer <manager_token>
```

**Đầu Vào:** Không có body

**Đầu Ra Thành Công (200):**
```json
{
  "total_employees": 50,
  "departments": [
    {"name": "Engineering", "employee_count": 20},
    {"name": "Marketing", "employee_count": 10}
  ],
  "recent_hires": 5,
  "pending_leaves": 3
}
```

**Đầu Ra Lỗi (403):**
```json
{
  "error": "You do not have permission to perform this action."
}
```

---

## ⏰ **API CHẤM CÔNG**

---

### **API 6: ✅ CHECK-IN**

**Endpoint:**
```http
POST http://localhost:8000/api/attendance/check_in/
Authorization: Bearer <token>
```

**Đầu Vào:**
```json
{
  "notes": "Check-in sáng"
}
```

**Đầu Ra Thành Công (200):**
```json
{
  "message": "Check-in thành công",
  "data": {
    "id": 1,
    "employee": 1,
    "date": "2025-10-01",
    "check_in": "09:00:00",
    "check_out": null,
    "break_duration": "00:00:00",
    "total_hours": null,
    "notes": "Check-in sáng"
  }
}
```

**Đầu Ra Lỗi (400):**
```json
{
  "error": "Bạn đã check-in hôm nay"
}
```

---

### **API 7: ❌ CHECK-OUT**

**Endpoint:**
```http
POST http://localhost:8000/api/attendance/check_out/
Authorization: Bearer <token>
```

**Đầu Vào:**
```json
{
  "notes": "Check-out tối"
}
```

**Đầu Ra Thành Công (200):**
```json
{
  "message": "Check-out thành công", 
  "data": {
    "id": 1,
    "employee": 1,
    "date": "2025-10-01",
    "check_in": "09:00:00",
    "check_out": "17:00:00",
    "break_duration": "00:00:00",
    "total_hours": "08:00:00",
    "notes": "Check-out tối"
  }
}
```

**Đầu Ra Lỗi (400):**
```json
{
  "error": "Bạn chưa check-in hôm nay"
}
```

---

### **API 8: 📊 THỐNG KÊ ĐIỂM DANH**

**Endpoint:**
```http
GET http://localhost:8000/api/attendance/stats/
Authorization: Bearer <manager_token>
```

**Đầu Vào:** Không có body

**Đầu Ra Thành Công (200):**
```json
{
  "total_employees": 50,
  "present_today": 45,
  "absent_today": 5,
  "pending_leaves": 3
}
```

**Đầu Ra Lỗi (403):**
```json
{
  "error": "You do not have permission to perform this action."
}
```

---

### **API 9: 🔍 TRẠNG THÁI HÔM NAY**

**Endpoint:**
```http
GET http://localhost:8000/api/attendance/today_status/
Authorization: Bearer <token>
```

**Đầu Vào:** Không có body

**Đầu Ra Thành Công (200):**
```json
{
  "has_checked_in": true,
  "has_checked_out": false,
  "attendance": {
    "id": 1,
    "employee": 1,
    "date": "2025-10-01",
    "check_in": "09:00:00",
    "check_out": null,
    "break_duration": "00:00:00", 
    "total_hours": null,
    "notes": "Check-in sáng"
  }
}
```

---

### **API 10: 📅 LỊCH SỬ CHẤM CÔNG CÁ NHÂN**



**Endpoint:**
```http
GET http://localhost:8000/api/attendance/my_attendance/?date_from=2025-09-01&date_to=2025-10-01
Authorization: Bearer <token>
```

**Đầu Vào:** Không có body

**Đầu Ra Thành Công (200):**
```json
{
  "data": [
    {
      "id": 1,
      "employee": 1,
      "date": "2025-10-01",
      "check_in": "09:00:00",
      "check_out": "17:00:00",
      "break_duration": "00:00:00",
      "total_hours": "08:00:00",
      "notes": "Làm việc full day"
    }
  ],
  "stats": {
    "total_days": 30,
    "present_days": 25,
    "full_days": 20,
    "absent_days": 5
  }
}
```

---

### **API 11: 🏢 CHẤM CÔNG PHÒNG BAN**

**Endpoint:**
```http
GET http://localhost:8000/api/attendance/department_attendance/?date=2025-10-01
Authorization: Bearer <manager_token>
```

**Đầu Vào:** Không có body

**Đầu Ra Thành Công (200):**
```json
{
  "date": "2025-10-01",
  "department": "Engineering",
  "attendance": [
    {
      "employee": 1,
      "employee_name": "John Doe",
      "date": "2025-10-01",
      "check_in": "09:00:00",
      "check_out": null,
      "status": "present"
    },
    {
      "employee": 2, 
      "employee_name": "Jane Smith",
      "date": "2025-10-01",
      "check_in": null,
      "check_out": null,
      "status": "absent"
    }
  ]
}
```

---

### **API 12: 📅 XEM CHẤM CÔNG HÔM NAY (CÓ SẴN)**

**Endpoint:**
```http
GET http://localhost:8000/api/attendance/today/
Authorization: Bearer <token>
```

**Đầu Vào:** Không có body

**Đầu Ra Thành Công (200):**
```json
[
  {
    "id": 1,
    "employee": 1,
    "date": "2025-10-01",
    "check_in": "09:00:00",
    "check_out": null,
    "break_duration": "00:00:00",
    "total_hours": null,
    "notes": "Check-in sáng"
  }
]
```

---

## 🏖️ **API NGHỈ PHÉP**

---

### **API 13: 📝 TẠO ĐƠN NGHỈ PHÉP**

**Endpoint:**
```http
POST http://localhost:8000/api/leave-requests/
Authorization: Bearer <token>
```

**Đầu Vào:**
```json
{
  "leave_type": 1,
  "start_date": "2025-12-25",
  "end_date": "2025-12-26",
  "reason": "Nghỉ lễ Giáng sinh"
}
```

**Đầu Ra Thành Công (201):**
```json
{
  "id": 1,
  "employee_id": 1,
  "employee_name": "Bob Employee",
  "leave_type": 1,
  "leave_type_name": "Annual Leave", 
  "start_date": "2025-12-25",
  "end_date": "2025-12-26",
  "days_requested": 2,
  "reason": "Nghỉ lễ Giáng sinh",
  "status": "pending"
}
```

**Đầu Ra Lỗi (400):**
```json
{
  "non_field_errors": ["End date must be after start date."]
}
```

---

### **API 14: ✅ DUYỆT ĐƠN NGHỈ PHÉP**

**Endpoint:**
```http
POST http://localhost:8000/api/leave-requests/1/approve/
Authorization: Bearer <manager_token>
```

**Đầu Vào:** Không có body

**Đầu Ra Thành Công (200):**
```json
{
  "status": "approved"
}
```

---

### **API 15: ❌ TỪ CHỐI ĐƠN NGHỈ PHÉP**

**Endpoint:**
```http
POST http://localhost:8000/api/leave-requests/1/reject/
Authorization: Bearer <manager_token>
```

**Đầu Vào:** Không có body

**Đầu Ra Thành Công (200):**
```json
{
  "status": "rejected"
}
```

---

### **API 16: 🗑️ HỦY ĐƠN NGHỈ PHÉP**

**Endpoint:**
```http
POST http://localhost:8000/api/leave-requests/1/cancel/
Authorization: Bearer <token>
```

**Đầu Vào:** Không có body

**Đầu Ra Thành Công (200):**
```json
{
  "status": "cancelled"
}
```

**Đầu Ra Lỗi (400):**
```json
{
  "error": "Chỉ có thể hủy đơn đang chờ duyệt."
}
```

---

### **API 17: 📊 THỐNG KÊ NGHỈ PHÉP**

**Endpoint:**
```http
GET http://localhost:8000/api/leave-requests/stats/
Authorization: Bearer <token>
```

**Đầu Vào:** Không có body

**Đầu Ra Thành Công (200):**
```json
{
  "pending": 5,
  "approved_this_month": 10,
  "rejected_this_month": 2
}
```

---

## 📈 **API ĐÁNH GIÁ HIỆU SUẤT**

---

### **API 18: 🏆 TẠO ĐÁNH GIÁ**

**Endpoint:**
```http
POST http://localhost:8000/api/performances/
Authorization: Bearer <manager_token>
```

**Đầu Vào:**
```json
{
  "employee": 2,
  "review_period_start": "2025-01-01",
  "review_period_end": "2025-12-31",
  "overall_rating": 5,
  "goals_achievement": 4,
  "communication": 5,
  "teamwork": 4,
  "initiative": 5,
  "comments": "Excellent performance throughout the year.",
  "employee_comments": "",
  "status": "draft"
}
```

**Đầu Ra Thành Công (201):**
```json
{
  "id": 1,
  "employee": 2,
  "employee_name": "Bob Employee",
  "reviewer": 1,
  "reviewer_name": "Alice Manager",
  "review_period_start": "2025-01-01",
  "review_period_end": "2025-12-31",
  "overall_rating": 5,
  "goals_achievement": 4,
  "communication": 5,
  "teamwork": 4,
  "initiative": 5,
  "comments": "Excellent performance throughout the year.",
  "employee_comments": "",
  "status": "draft",
  "status_display": "Draft"
}
```

---

### **API 19: 👤 ĐÁNH GIÁ CỦA TÔI**

**Endpoint:**
```http
GET http://localhost:8000/api/performances/my_reviews/
Authorization: Bearer <token>
```

**Đầu Vào:** Không có body

**Đầu Ra Thành Công (200):**
```json
[
  {
    "id": 1,
    "employee_name": "Bob Employee",
    "reviewer_name": "Alice Manager",
    "review_period_start": "2025-01-01",
    "review_period_end": "2025-12-31", 
    "overall_rating": 5,
    "status": "submitted",
    "created_at": "2025-12-15T10:00:00Z"
  }
]
```

---

### **API 20: 📊 THỐNG KÊ ĐÁNH GIÁ**

**Endpoint:**
```http
GET http://localhost:8000/api/performances/analytics/
Authorization: Bearer <token>
```

**Đầu Vào:** Không có body

**Đầu Ra Thành Công (200):**
```json
{
  "avg_overall_rating": 4.2,
  "avg_goals_achievement": 4.0,
  "avg_communication": 4.3,
  "avg_teamwork": 4.1,
  "avg_initiative": 4.2,
  "total_reviews": 50,
  "draft_reviews": 5,
  "submitted_reviews": 10,
  "finalized_reviews": 35
}
```

---

## 🏢 **API QUẢN LÝ HỆ THỐNG**

---

### **API 21: 📋 DANH SÁCH PHÒNG BAN**

**Endpoint:**
```http
GET http://localhost:8000/api/departments/
Authorization: Bearer <token>
```

**Đầu Vào:** Không có body

**Đầu Ra Thành Công (200):**
```json
[
  {
    "id": 1,
    "name": "Engineering",
    "description": "Software development and technical teams",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

---

### **API 22: 💼 DANH SÁCH CHỨC VỤ**

**Endpoint:**
```http
GET http://localhost:8000/api/positions/
Authorization: Bearer <token>
```

**Đầu Vào:** Không có body

**Đầu Ra Thành Công (200):**
```json
[
  {
    "id": 1,
    "title": "Software Engineer",
    "department": 1,
    "department_name": "Engineering",
    "description": "Develops software",
    "salary_min": "80000.00",
    "salary_max": "150000.00"
  }
]
```

---

### **API 23: 🏷️ DANH SÁCH LOẠI NGHỈ PHÉP**

**Endpoint:**
```http
GET http://localhost:8000/api/leave-types/
Authorization: Bearer <token>
```

**Đầu Vào:** Không có body

**Đầu Ra Thành Công (200):**
```json
[
  {
    "id": 1,
    "name": "Annual Leave",
    "code": "AL",
    "description": "Yearly vacation days",
    "max_days_per_year": 25,
    "is_paid": true
  }
]
```

---

## 🧪 **TEST SCENARIOS HOÀN CHỈNH**

### **Scenario 1: Workflow Nhân Viên Thông Thường**
```bash
1. POST /api/token/              # Login → Lấy token
2. GET /api/employees/me/        # Xem thông tin cá nhân  
3. GET /api/attendance/today_status/    # Kiểm tra trạng thái ban đầu
4. POST /api/attendance/check_in/       # Check-in thành công
5. GET /api/attendance/today_status/    # Verify đã check-in
6. POST /api/attendance/check_out/      # Check-out thành công  
7. GET /api/attendance/today_status/    # Verify đã check-out
8. GET /api/attendance/my_attendance/   # Xem lịch sử chấm công
9. POST /api/leave-requests/     # Tạo đơn nghỉ phép
10. GET /api/performances/my_reviews/   # Xem đánh giá của mình
```

### **Scenario 2: Test Validation Errors**
```bash
1. POST /api/attendance/check_in/       # Check-in lần 1 → ✅
2. POST /api/attendance/check_in/       # Check-in lần 2 → ❌ "Đã check-in"
3. POST /api/attendance/check_out/      # Check-out → ✅
4. POST /api/attendance/check_out/      # Check-out lần 2 → ❌ "Đã check-out"
5. POST /api/leave-requests/ {          # Đơn nghỉ sai ngày → ❌
  "start_date": "2025-12-31",
  "end_date": "2025-12-25"
}
```

### **Scenario 3: Test Manager Features**
```bash
1. POST /api/token/                     # Login manager
2. GET /api/employees/dashboard_stats/  # Xem dashboard
3. GET /api/attendance/department_attendance/?date=2025-10-01  # Xem phòng ban
4. GET /api/attendance/stats/           # Xem thống kê điểm danh
5. POST /api/leave-requests/1/approve/  # Duyệt đơn nghỉ phép
6. POST /api/performances/              # Tạo đánh giá nhân viên
7. GET /api/departments/                # Quản lý phòng ban
```

### **Scenario 4: Workflow Đánh Giá Hiệu Suất**
```bash
# Manager tạo và quản lý đánh giá
1. POST /api/performances/              # Tạo đánh giá draft
2. PUT /api/performances/1/ {           # Submit đánh giá
  "status": "submitted"
}

# Employee phản hồi  
3. GET /api/performances/my_reviews/    # Xem đánh giá
4. PUT /api/performances/1/ {           # Phản hồi đánh giá
  "employee_comments": "Cảm ơn feedback!"
}

# Manager finalize
5. PUT /api/performances/1/ {           # Finalize đánh giá
  "status": "finalized"
}
```




<!-- ------------------------- -->


Dựa trên code bạn cung cấp, tôi sẽ phân tích chi tiết các chức năng của hệ thống và liệt kê đầy đủ các API endpoints.

## **PHÂN TÍCH HỆ THỐNG**

### **Tổng quan hệ thống**
Đây là hệ thống **HRMS (Human Resource Management System)** với các module chính:
- **Quản lý nhân sự** (Employee, Department, Position)
- **Chấm công** (Attendance) 
- **Quản lý nghỉ phép** (Leave Management)
- **Đánh giá hiệu suất** (Performance Review)
- **Phân quyền** (Role-based Authorization)

### **Kiến trúc phân quyền**
- **Manager**: Toàn quyền truy cập và quản lý
- **Employee**: Chỉ xem/chỉnh sửa thông tin cá nhân
- **Authentication**: JWT Token-based

---

## **DANH SÁCH API ENDPOINTS CHUẨN**

### **1. AUTHENTICATION API**

| Method | URL | Chức năng | Đầu vào | Permission |
|--------|-----|-----------|---------|------------|
| POST | `/api/auth/signup/` | Đăng ký tài khoản mới | `username, password, email, first_name, last_name, employee_id, phone_number, address, date_of_birth, hire_date, department, position, salary` | Public |
| POST | `/api/auth/change-password/` | Đổi mật khẩu | `current_password, new_password` | IsAuthenticated |
| POST | `/api/token/` | Lấy JWT token | `username, password` | Public |
| POST | `/api/token/refresh/` | Refresh JWT token | `refresh_token` | Public |

### **2. EMPLOYEE MANAGEMENT API**

| Method | URL | Chức năng | Đầu vào | Permission |
|--------|-----|-----------|---------|------------|
| GET | `/api/employees/` | Danh sách nhân viên | Query: `?search=` | IsAuthenticated, IsManagerOrReadOnly |
| POST | `/api/employees/` | Tạo nhân viên mới | Employee data + User data | IsAuthenticated, IsManagerOrReadOnly |
| GET | `/api/employees/{id}/` | Chi tiết nhân viên | - | IsAuthenticated, IsManagerOrReadOnly |
| PUT/PATCH | `/api/employees/{id}/` | Cập nhật nhân viên | Employee data | IsAuthenticated, IsManagerOrReadOnly |
| DELETE | `/api/employees/{id}/` | Xóa nhân viên | - | IsAuthenticated, IsManagerOrReadOnly |
| GET/PATCH | `/api/employees/me/` | Xem/cập nhật thông tin cá nhân | `phone_number, address, date_of_birth, first_name, last_name, email` | IsAuthenticated |
| GET | `/api/employees/dashboard_stats/` | Thống kê dashboard | - | IsAuthenticated |

### **3. DEPARTMENT & POSITION API**

| Method | URL | Chức năng | Đầu vào | Permission |
|--------|-----|-----------|---------|------------|
| GET | `/api/departments/` | Danh sách phòng ban | - | IsAuthenticated, IsManagerOrReadOnly |
| POST | `/api/departments/` | Tạo phòng ban | `name, description` | IsAuthenticated, IsManagerOrReadOnly |
| GET | `/api/departments/{id}/` | Chi tiết phòng ban | - | IsAuthenticated, IsManagerOrReadOnly |
| PUT/PATCH | `/api/departments/{id}/` | Cập nhật phòng ban | Department data | IsAuthenticated, IsManagerOrReadOnly |
| DELETE | `/api/departments/{id}/` | Xóa phòng ban | - | IsAuthenticated, IsManagerOrReadOnly |
| GET | `/api/positions/` | Danh sách chức vụ | - | IsAuthenticated, IsManagerOrReadOnly |
| POST | `/api/positions/` | Tạo chức vụ | `title, department, description, salary_min, salary_max` | IsAuthenticated, IsManagerOrReadOnly |

### **4. ATTENDANCE API (CHẤM CÔNG)**

| Method | URL | Chức năng | Đầu vào | Permission |
|--------|-----|-----------|---------|------------|
| GET | `/api/attendance/` | Lịch sử chấm công | Query: `?employee= &date= &status= &date_from= &date_to=` | IsAuthenticated |
| POST | `/api/attendance/` | Tạo bản ghi chấm công | Attendance data | IsAuthenticated |
| GET | `/api/attendance/{id}/` | Chi tiết chấm công | - | IsAuthenticated |
| PUT/PATCH | `/api/attendance/{id}/` | Cập nhật chấm công | Attendance data | IsAuthenticated |
| DELETE | `/api/attendance/{id}/` | Xóa chấm công | - | IsAuthenticated |
| **POST** | `/api/attendance/check_in/` | **Check-in** | `notes` (optional) | IsAuthenticated |
| **POST** | `/api/attendance/check_out/` | **Check-out** | `notes` (optional) | IsAuthenticated |
| **POST** | `/api/attendance/start_break/` | **Bắt đầu nghỉ** | - | IsAuthenticated |
| **POST** | `/api/attendance/end_break/` | **Kết thúc nghỉ** | - | IsAuthenticated |
| **GET** | `/api/attendance/current_status/` | **Trạng thái hiện tại** | - | IsAuthenticated |
| **GET** | `/api/attendance/today/` | **Chấm công hôm nay** (all employees) | - | Manager only |
| **GET** | `/api/attendance/stats/` | **Thống kê chấm công** | - | IsAuthenticated |

### **5. LEAVE MANAGEMENT API**

| Method | URL | Chức năng | Đầu vào | Permission |
|--------|-----|-----------|---------|------------|
| GET | `/api/leave-requests/` | Danh sách đơn nghỉ | Query: `?status= &employee= ` | IsAuthenticated |
| POST | `/api/leave-requests/` | Tạo đơn xin nghỉ | `leave_type, start_date, end_date, reason` | IsAuthenticated, IsEmployee |
| GET | `/api/leave-requests/{id}/` | Chi tiết đơn nghỉ | - | IsAuthenticated |
| PUT/PATCH | `/api/leave-requests/{id}/` | Cập nhật đơn nghỉ | Leave data | IsAuthenticated |
| DELETE | `/api/leave-requests/{id}/` | Xóa đơn nghỉ | - | IsAuthenticated |
| **POST** | `/api/leave-requests/{id}/approve/` | **Duyệt đơn** | - | IsAuthenticated, IsManagerOrReadOnly |
| **POST** | `/api/leave-requests/{id}/reject/` | **Từ chối đơn** | - | IsAuthenticated, IsManagerOrReadOnly |
| **POST** | `/api/leave-requests/{id}/cancel/` | **Hủy đơn** | - | IsAuthenticated, IsEmployee |
| **GET** | `/api/leave-requests/stats/` | **Thống kê đơn nghỉ** | - | IsAuthenticated |
| GET | `/api/leave-types/` | Danh sách loại nghỉ | - | IsAuthenticated, IsManagerOrReadOnly |
| POST | `/api/leave-types/` | Tạo loại nghỉ | `name, code, description, max_days_per_year, is_paid` | IsAuthenticated, IsManagerOrReadOnly |

### **6. PERFORMANCE REVIEW API**

| Method | URL | Chức năng | Đầu vào | Permission |
|--------|-----|-----------|---------|------------|
| GET | `/api/performances/` | Danh sách đánh giá | Query: `?employee= &reviewer= &status= ` | IsAuthenticated |
| POST | `/api/performances/` | Tạo đánh giá | Performance data | IsAuthenticated, IsManagerOrReadOnly |
| GET | `/api/performances/{id}/` | Chi tiết đánh giá | - | IsAuthenticated |
| PUT/PATCH | `/api/performances/{id}/` | Cập nhật đánh giá | Performance data | IsAuthenticated |
| DELETE | `/api/performances/{id}/` | Xóa đánh giá | - | IsAuthenticated, IsManagerOrReadOnly |
| **GET** | `/api/performances/my_reviews/` | **Đánh giá của tôi** | - | IsAuthenticated |
| **GET** | `/api/performances/by_status/` | **Lọc theo trạng thái** | Query: `?status= ` | IsAuthenticated |
| **GET** | `/api/performances/analytics/` | **Thống kê đánh giá** | - | IsAuthenticated |
| **GET** | `/api/performances/{id}/review_history/` | **Lịch sử đánh giá** | - | IsAuthenticated |
| **GET** | `/api/performances/{id}/export_pdf/` | **Xuất PDF** | - | IsAuthenticated |

---

## **ĐẶC ĐIỂM NỔI BẬT CỦA HỆ THỐNG**

### **1. Real-time Attendance Features**
- Check-in/check-out thời gian thực
- Quản lý giờ nghỉ (break)
- Tự động tính toán giờ làm, overtime
- Kiểm tra trạng thái hiện tại

### **2. Leave Management Integration**
- Tích hợp tự động với chấm công
- Tự động cập nhật trạng thái "on_leave"
- Quản lý số ngày nghỉ còn lại
- Workflow: Pending → Approved/Rejected/Cancelled

### **3. Performance Review Workflow**
- Multi-status: Draft → Submitted → Feedback → Finalized
- Employee có thể phản hồi đánh giá
- Export PDF capability
- Analytics và thống kê

### **4. Security & Permissions**
- JWT Authentication
- Role-based access control
- Manager vs Employee permissions
- Self-service profile updates

### **5. Data Filtering & Analytics**
- Filter theo multiple criteria
- Dashboard statistics
- Date range filtering
- Department-based data access

Hệ thống này cung cấp một giải pháp HRMS toàn diện với đầy đủ các tính năng cần thiết cho quản lý nhân sự trong doanh nghiệp.