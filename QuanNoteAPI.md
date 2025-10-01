
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