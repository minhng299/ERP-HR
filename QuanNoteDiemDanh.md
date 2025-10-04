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
---------------v3


































# 📋 **PHÂN TÍCH CÁC API TRONG ATTENDANCEVIEWSET HIỆN TẠI**

## 🎯 **TỔNG QUAN 7 API ENDPOINTS**

### **1. ⏰ CHECK-IN API**
```http
POST /api/attendance/check_in/
```
**Chức năng:** Chấm công vào làm
**Chi tiết:**
- Ghi nhận thời điểm nhân viên bắt đầu làm việc
- Tự động phát hiện đi muộn (sau 9:00 AM)
- Kiểm tra nhân viên có đang nghỉ phép không
- Ghi nhận IP address để tracking
- Tạo trạng thái `checked_in`

**Flow:**
```
Nhân viên đến công ty → Check-in → Hệ thống ghi nhận thời gian → Kiểm tra muộn → Cập nhật trạng thái
```

---

### **2. 🏃 CHECK-OUT API**
```http
POST /api/attendance/check_out/
```
**Chức năng:** Chấm công tan ca
**Chi tiết:**
- Ghi nhận thời điểm kết thúc làm việc
- Tự động tính tổng giờ làm: `(check_out - check_in) - break_time`
- Tính overtime (làm thêm giờ)
- Phát hiện về sớm (trước 5:00 PM)
- Tự động kết thúc break nếu đang nghỉ
- Cập nhật trạng thái `checked_out`

**Tính toán:**
```
Ví dụ: 
Check-in: 09:00, Check-out: 18:00, Break: 1h
→ Total: 8 hours, Overtime: 1 hour
```

---

### **3. ☕ START BREAK API**
```http
POST /api/attendance/start_break/
```
**Chức năng:** Bắt đầu giờ nghỉ giải lao
**Chi tiết:**
- Đánh dấu thời điểm bắt đầu nghỉ
- Chuyển trạng thái sang `on_break`
- Nhân viên không thể check-out khi đang break
- Dùng cho nghỉ trưa, nghỉ giữa giờ

**Use case:**
```
Nhân viên nghỉ trưa → Start break → Hệ thống ghi nhận → Nhân viên có thể end break sau
```

---

### **4. ⏱️ END BREAK API**
```http
POST /api/attendance/end_break/
```
**Chức năng:** Kết thúc giờ nghỉ giải lao
**Chi tiết:**
- Đánh dấu thời điểm kết thúc nghỉ
- Tự động tính thời gian break duration
- Cộng dồn vào tổng thời gian nghỉ trong ngày
- Chuyển trạng thái về `checked_in`

**Tính toán:**
```
Start break: 12:00, End break: 13:00 → Break duration: 1 hour
```

---

### **5. 📱 CURRENT STATUS API**
```http
GET /api/attendance/current_status/
```
**Chức năng:** Xem trạng thái chấm công hiện tại
**Chi tiết:**
- Hiển thị trạng thái hiện tại của nhân viên
- Cho biết các action có thể thực hiện
- Kiểm tra nếu nhân viên đang nghỉ phép
- Hiển thị thông tin attendance hiện tại

**Response ví dụ:**
```json
{
    "can_check_in": false,      // Đã check-in rồi
    "can_check_out": true,      // Có thể check-out
    "can_start_break": true,    // Có thể nghỉ
    "can_end_break": false,     // Không đang nghỉ
    "current_time": "14:30",
    "attendance": { ... }
}
```

---

### **6. 📊 TODAY'S ATTENDANCE API**
```http
GET /api/attendance/today/
```
**Chức năng:** Xem chấm công cả công ty hôm nay (Manager only)
**Chi tiết:**
- Chỉ dành cho Manager
- Hiển thị tất cả nhân viên đã chấm công hôm nay
- Theo dõi real-time ai đang làm việc, ai nghỉ
- Dùng để quản lý tổng quan phòng ban

**Use case:**
```
Manager muốn biết: 
- Hôm nay có bao nhiêu nhân viên đi làm?
- Ai chưa check-in? 
- Ai đang làm việc, ai đã về?
```

---

### **7. 📈 STATISTICS API**
```http
GET /api/attendance/stats/
```
**Chức năng:** Thống kê chấm công
**Chi tiết:**
- **Manager:** Thống kê toàn công ty
- **Employee:** Thống kê cá nhân
- Số người đi làm hôm nay
- Số người đã về
- Số người đi muộn
- Số người đang nghỉ giải lao
- Giờ làm trung bình

**Ví dụ Manager:**
```json
{
    "total_present": 45,    // Tổng đi làm
    "checked_out": 40,      // Đã về
    "late_arrivals": 5,     // Đi muộn
    "on_break": 3,          // Đang nghỉ
    "average_hours": 8.2    // Giờ làm TB
}
```

---

### **8. 🔍 FILTERED LIST API** (Từ ModelViewSet)
```http
GET /api/attendance/?date_from=2025-10-01&date_to=2025-10-31&employee=1
```
**Chức năng:** Lọc và xem lịch sử chấm công
**Chi tiết:**
- **Employee:** Chỉ xem được của bản thân
- **Manager:** Xem được tất cả nhân viên
- Filter theo ngày, nhân viên, trạng thái
- Xem lịch sử nhiều ngày

## 🎯 **WORKFLOW SỬ DỤNG THỰC TẾ**

### **Cho Nhân Viên:**
```
1. Đến công ty → Check-in (ghi nhận giờ vào)
2. Nghỉ trưa → Start break → End break (ghi nhận nghỉ)
3. Tan ca → Check-out (tính tổng giờ làm + overtime)
4. Kiểm tra → Current status (xem trạng thái hiện tại)
```

### **Cho Quản Lý:**
```
1. Sáng sớm → Today attendance (xem ai đã đi làm)
2. Trong ngày → Stats (theo dõi tổng quan)
3. Cuối ngày → Filtered list (xem báo cáo chi tiết)
```
