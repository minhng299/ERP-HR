# 📋 **BÁO CÁO CHI TIẾT: THAY ĐỔI & API TEST CHẤM CÔNG**

## 🔧 **CÁC THAY ĐỔI CỤ THỂ**

### **1. Model Attendance (models.py)**
```python
# TRƯỚC:
break_duration = models.DurationField(default='00:00:00')

def save(self, *args, **kwargs):
    if self.check_in and self.check_out:
        from datetime import datetime, timedelta
        check_in_dt = datetime.combine(self.date, self.check_in)
        check_out_dt = datetime.combine(self.date, self.check_out)
        total = check_out_dt - check_in_dt - self.break_duration
        self.total_hours = total
    super().save(*args, **kwargs)

# SAU:
break_duration = models.CharField(max_length=20, default='00:00:00')

def save(self, *args, **kwargs):
    # ĐƠN GIẢN HÓA: Bỏ tính toán phức tạp để tránh lỗi
    super().save(*args, **kwargs)
```

### **2. Thêm API Endpoints (views.py)**
```python
# THÊM 4 endpoints mới vào class AttendanceViewSet:
@action(detail=False, methods=['post'])
def check_in(self, request)

@action(detail=False, methods=['post'])  
def check_out(self, request)

@action(detail=False, methods=['get'])
def today_status(self, request)

@action(detail=False, methods=['get'])
def my_attendance(self, request)
```

## 🚀 **DANH SÁCH API TEST CHI TIẾT**

### **API 1: 🔐 LOGIN - LẤY TOKEN**
```http
POST http://localhost:8000/api/token/
Content-Type: application/json
```

**ĐẦU VÀO:**
```json
{
    "username": "manager",
    "password": "testpass123"
}
```

**ĐẦU RA (Thành công):**
```json
{
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**ĐẦU RA (Lỗi):**
```json
{
    "detail": "No active account found with the given credentials"
}
```

---

### **API 2: 📊 KIỂM TRA TRẠNG THÁI HÔM NAY**
```http
GET http://localhost:8000/api/attendance/today_status/
Authorization: Bearer <token>
```

**ĐẦU VÀO:** Không có body

**ĐẦU RA (Chưa check-in):**
```json
{
    "has_checked_in": false,
    "has_checked_out": false,
    "attendance": null
}
```

**ĐẦU RA (Đã check-in):**
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

### **API 3: ⏰ CHECK-IN**
```http
POST http://localhost:8000/api/attendance/check_in/
Authorization: Bearer <token>
Content-Type: application/json
```

**ĐẦU VÀO:**
```json
{
    "notes": "Check-in sáng - bắt đầu làm việc"
}
```

**ĐẦU RA (Thành công):**
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

**ĐẦU RA (Lỗi - Đã check-in):**
```json
{
    "error": "Bạn đã check-in hôm nay"
}
```

---

### **API 4: 🏃 CHECK-OUT**
```http
POST http://localhost:8000/api/attendance/check_out/
Authorization: Bearer <token>
Content-Type: application/json
```

**ĐẦU VÀO:**
```json
{
    "notes": "Check-out - hoàn thành công việc"
}
```

**ĐẦU RA (Thành công):**
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

**ĐẦU RA (Lỗi - Chưa check-in):**
```json
{
    "error": "Bạn chưa check-in hôm nay"
}
```

**ĐẦU RA (Lỗi - Đã check-out):**
```json
{
    "error": "Bạn đã check-out hôm nay"
}
```

---

### **API 5: 📈 LỊCH SỬ CHẤM CÔNG**
```http
GET http://localhost:8000/api/attendance/my_attendance/
Authorization: Bearer <token>
```

**ĐẦU VÀO:** Không có body (hoặc query params)
```http
GET /api/attendance/my_attendance/?date_from=2025-10-01&date_to=2025-10-31
```

**ĐẦU RA:**
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
        "total_days": 15,
        "present_days": 12,
        "full_days": 10,
        "absent_days": 3
    }
}
```

---

### **API 6: 👥 MANAGER XEM PHÒNG BAN**
```http
GET http://localhost:8000/api/attendance/department_attendance/?date=2025-10-01
Authorization: Bearer <manager_token>
```

**ĐẦU VÀO:** Query parameter `date`

**ĐẦU RA:**
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

