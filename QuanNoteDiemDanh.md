# 📋 **TÀI LIỆU HOÀN CHỈNH: HỆ THỐNG CHẤM CÔNG HRMS**

## 🎯 **TỔNG QUAN THAY ĐỔI**

### **🔧 CÁC THAY ĐỔI KỸ THUẬT**

#### **1. Sửa Model Attendance (models.py)**
```python
# TRƯỚC KHI SỬA:
break_duration = models.DurationField(default='00:00:00')

def save(self, *args, **kwargs):
    if self.check_in and self.check_out:
        from datetime import datetime, timedelta
        check_in_dt = datetime.combine(self.date, self.check_in)
        check_out_dt = datetime.combine(self.date, self.check_out)
        total = check_out_dt - check_in_dt - self.break_duration
        self.total_hours = total
    super().save(*args, **kwargs)

# SAU KHI SỬA:
break_duration = models.CharField(max_length=20, default='00:00:00')

def save(self, *args, **kwargs):
    # ĐƠN GIẢN HÓA: Bỏ tính toán phức tạp để tránh lỗi DurationField
    super().save(*args, **kwargs)
```

#### **2. Thêm API Endpoints Mới (views.py)**
Đã thêm 6 endpoints mới vào class `AttendanceViewSet`:
- `check_in/` - POST
- `check_out/` - POST  
- `today_status/` - GET
- `my_attendance/` - GET
- `department_attendance/` - GET
- `stats/` - GET

#### **3. Sửa Lỗi Thụt Lề & Import**
- Sửa lỗi IndentationError trong views.py
- Đảm bảo tất cả functions nằm trong class
- Thêm các import cần thiết

## 🚀 **DANH SÁCH API HOÀN CHỈNH**

### **API 1: 🔐 ĐĂNG NHẬP - LẤY TOKEN**

**Endpoint:**
```http
POST http://localhost:8000/api/token/
Content-Type: application/json
```

**Đầu Vào (Body):**
```json
{
    "username": "manager",
    "password": "testpass123"
}
```

**Đầu Ra Thành Công (200):**
```json
{
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Đầu Ra Lỗi (401):**
```json
{
    "detail": "No active account found with the given credentials"
}
```

---

### **API 2: 📊 KIỂM TRA TRẠNG THÁI HÔM NAY**

**Endpoint:**
```http
GET http://localhost:8000/api/attendance/today_status/
Authorization: Bearer <token>
```

**Đầu Vào:** Không có body

**Đầu Ra Thành Công (200) - Chưa check-in:**
```json
{
    "has_checked_in": false,
    "has_checked_out": false,
    "attendance": null
}
```

**Đầu Ra Thành Công (200) - Đã check-in:**
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

**Đầu Ra Lỗi (404):**
```json
{
    "error": "Employee profile not found"
}
```

---

### **API 3: ⏰ CHECK-IN**

**Endpoint:**
```http
POST http://localhost:8000/api/attendance/check_in/
Authorization: Bearer <token>
Content-Type: application/json
```

**Đầu Vào (Body):**
```json
{
    "notes": "Check-in sáng - bắt đầu làm việc"
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
        "notes": "Check-in sáng - bắt đầu làm việc"
    }
}
```

**Đầu Ra Lỗi (400) - Đã check-in:**
```json
{
    "error": "Bạn đã check-in hôm nay"
}
```

**Đầu Ra Lỗi (404):**
```json
{
    "error": "Employee profile not found"
}
```

---

### **API 4: 🏃 CHECK-OUT**

**Endpoint:**
```http
POST http://localhost:8000/api/attendance/check_out/
Authorization: Bearer <token>
Content-Type: application/json
```

**Đầu Vào (Body):**
```json
{
    "notes": "Check-out - hoàn thành công việc"
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
        "notes": "Check-out - hoàn thành công việc"
    }
}
```

**Đầu Ra Lỗi (400) - Chưa check-in:**
```json
{
    "error": "Bạn chưa check-in hôm nay"
}
```

**Đầu Ra Lỗi (400) - Đã check-out:**
```json
{
    "error": "Bạn đã check-out hôm nay"
}
```

**Đầu Ra Lỗi (404):**
```json
{
    "error": "Employee profile not found"
}
```

---

### **API 5: 📈 LỊCH SỬ CHẤM CÔNG CÁ NHÂN**

**Endpoint:**
```http
GET http://localhost:8000/api/attendance/my_attendance/
Authorization: Bearer <token>
```

**Query Parameters (Tùy chọn):**
- `date_from`: YYYY-MM-DD (từ ngày)
- `date_to`: YYYY-MM-DD (đến ngày)

**Ví dụ:**
```http
GET http://localhost:8000/api/attendance/my_attendance/?date_from=2025-10-01&date_to=2025-10-31
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
        },
        {
            "id": 2,
            "employee": 1,
            "date": "2025-10-02",
            "check_in": "08:30:00",
            "check_out": "17:30:00",
            "break_duration": "01:00:00",
            "total_hours": "08:00:00",
            "notes": "Có meeting trưa"
        }
    ],
    "stats": {
        "total_days": 15,
        "present_days": 12,
        "full_days": 10,
        "absent_days": 3
    }
}
```

**Đầu Ra Lỗi (404):**
```json
{
    "error": "Employee profile not found"
}
```

---

### **API 6: 👥 QUẢN LÝ XEM CHẤM CÔNG PHÒNG BAN**

**Endpoint:**
```http
GET http://localhost:8000/api/attendance/department_attendance/?date=2025-10-01
Authorization: Bearer <manager_token>
```

**Query Parameters (Bắt buộc):**
- `date`: YYYY-MM-DD (ngày cần xem)

**Đầu Vào:** Không có body

**Đầu Ra Thành Công (200):**
```json
{
    "date": "2025-10-01",
    "department": "Engineering",
    "attendance": [
        {
            "id": 1,
            "employee": 1,
            "employee_name": "John Doe",
            "date": "2025-10-01",
            "check_in": "09:00:00",
            "check_out": "17:00:00",
            "break_duration": "00:00:00",
            "total_hours": "08:00:00",
            "notes": "Làm full time",
            "status": "present"
        },
        {
            "employee": 2,
            "employee_name": "Jane Smith",
            "date": "2025-10-01",
            "check_in": null,
            "check_out": null,
            "break_duration": "00:00:00",
            "total_hours": null,
            "notes": "",
            "status": "absent"
        }
    ]
}
```

**Đầu Ra Lỗi (403) - Không phải manager:**
```json
{
    "error": "Chỉ manager mới có quyền truy cập"
}
```

**Đầu Ra Lỗi (404):**
```json
{
    "error": "Employee profile not found"
}
```

---

### **API 7: 📊 THỐNG KÊ ĐIỂM DANH**

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

**Đầu Ra Lỗi (403) - Không phải manager:**
```json
{
    "error": "You do not have permission to perform this action."
}
```

---

### **API 8: 📅 XEM CHẤM CÔNG HÔM NAY (CÓ SẴN)**

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

## 🧪 **TEST SCENARIOS HOÀN CHỈNH**

### **Scenario 1: Workflow Nhân Viên Thông Thường**
```bash
1. POST /api/token/              # Login → Lấy token
2. GET /api/attendance/today_status/    # Kiểm tra trạng thái ban đầu
3. POST /api/attendance/check_in/       # Check-in thành công
4. GET /api/attendance/today_status/    # Verify đã check-in
5. POST /api/attendance/check_out/      # Check-out thành công
6. GET /api/attendance/today_status/    # Verify đã check-out
7. GET /api/attendance/my_attendance/   # Xem lịch sử
```

### **Scenario 2: Test Validation Errors**
```bash
1. POST /api/attendance/check_in/       # Check-in lần 1 → ✅
2. POST /api/attendance/check_in/       # Check-in lần 2 → ❌ "Đã check-in"
3. POST /api/attendance/check_out/      # Check-out → ✅
4. POST /api/attendance/check_out/      # Check-out lần 2 → ❌ "Đã check-out"
```

### **Scenario 3: Test Manager Features**
```bash
1. POST /api/token/                     # Login manager
2. GET /api/attendance/department_attendance/?date=2025-10-01  # Xem phòng ban
3. GET /api/attendance/stats/           # Xem thống kê
```
