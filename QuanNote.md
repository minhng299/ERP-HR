# 📊 DANH SÁCH API & CHỨC NĂNG HRMS SYSTEM

## 🔐 **AUTHENTICATION API**
```
POST   /api/auth/signup/            # Đăng ký tài khoản mới
POST   /api/auth/change_password/   # Đổi mật khẩu
POST   /api/token/                  # Lấy JWT token (login)
POST   /api/token/refresh/          # Refresh token
```

## 👥 **EMPLOYEE MANAGEMENT API**
### **CRUD Operations**
```
GET    /api/employees/              # Danh sách nhân viên
POST   /api/employees/              # Tạo nhân viên mới (Manager only)
GET    /api/employees/{id}/         # Chi tiết nhân viên
PUT    /api/employees/{id}/         # Cập nhật nhân viên (Manager)
PATCH  /api/employees/{id}/         # Cập nhật một phần
DELETE /api/employees/{id}/         # Xóa nhân viên (Manager)
```

### **Custom Actions**
```
GET    /api/employees/me/           # Xem thông tin cá nhân
PATCH  /api/employees/me/           # Cập nhật thông tin cá nhân (phone, address, etc)
GET    /api/employees/dashboard_stats/  # Thống kê dashboard
```

## 🏢 **DEPARTMENT & POSITION API**
```
# Department
GET    /api/departments/            # Danh sách phòng ban
POST   /api/departments/            # Tạo phòng ban (Manager)
GET    /api/departments/{id}/       # Chi tiết phòng ban
PUT    /api/departments/{id}/       # Cập nhật phòng ban
DELETE /api/departments/{id}/       # Xóa phòng ban

# Position
GET    /api/positions/              # Danh sách chức vụ
POST   /api/positions/              # Tạo chức vụ mới (Manager)
GET    /api/positions/{id}/         # Chi tiết chức vụ
PUT    /api/positions/{id}/         # Cập nhật chức vụ
DELETE /api/positions/{id}/         # Xóa chức vụ
```

## ⏰ **ATTENDANCE API - CHẤM CÔNG**

### **CRUD Operations**
```
GET    /api/attendances/            # Lịch sử chấm công
POST   /api/attendances/            # Tạo bản ghi chấm công (ít dùng)
GET    /api/attendances/{id}/       # Chi tiết bản ghi
PUT    /api/attendances/{id}/       # Cập nhật bản ghi
DELETE /api/attendances/{id}/       # Xóa bản ghi
```

### **Real-time Attendance Actions**
```
POST   /api/attendances/check_in/           # Check-in (nhân viên)
POST   /api/attendances/check_out/          # Check-out (nhân viên)
POST   /api/attendances/start_break/        # Bắt đầu nghỉ giải lao
POST   /api/attendances/end_break/          # Kết thúc nghỉ giải lao
GET    /api/attendances/current_status/     # Trạng thái hiện tại hôm nay
GET    /api/attendances/today/              # Danh sách chấm công hôm nay (Manager)
GET    /api/attendances/stats/              # Thống kê chấm công
```

### **Filter & Query Parameters**
```
GET /api/attendances/?employee={id}         # Lọc theo nhân viên
GET /api/attendances/?date=2024-01-15       # Lọc theo ngày
GET /api/attendances/?date_from=...&date_to=...  # Khoảng thời gian
GET /api/attendances/?status=checked_in     # Lọc theo trạng thái
```

## 🏖️ **LEAVE MANAGEMENT API**

### **Leave Type Management (Manager only)**
```
GET    /api/leavetypes/             # Danh sách loại phép
POST   /api/leavetypes/             # Tạo loại phép mới
GET    /api/leavetypes/{id}/        # Chi tiết loại phép
PUT    /api/leavetypes/{id}/        # Cập nhật loại phép
DELETE /api/leavetypes/{id}/        # Xóa loại phép
```

### **Leave Request Workflow**
```
# Employee Actions
GET    /api/leaverequests/          # Danh sách đơn của tôi
POST   /api/leaverequests/          # Tạo đơn xin nghỉ
GET    /api/leaverequests/{id}/     # Chi tiết đơn
POST   /api/leaverequests/{id}/cancel/  # Hủy đơn (chỉ pending)

# Manager Actions
POST   /api/leaverequests/{id}/approve/  # Duyệt đơn
POST   /api/leaverequests/{id}/reject/   # Từ chối đơn
GET    /api/leaverequests/stats/    # Thống kê đơn xin nghỉ
```

## 📈 **PERFORMANCE REVIEW API**

### **Review Management**
```
GET    /api/performances/           # Danh sách review
POST   /api/performances/           # Tạo review mới (Manager)
GET    /api/performances/{id}/      # Chi tiết review
PUT    /api/performances/{id}/      # Cập nhật review
DELETE /api/performances/{id}/      # Xóa review (Manager)
```

### **Custom Actions**
```
GET    /api/performances/my_reviews/       # Xem review của tôi (Employee)
GET    /api/performances/by_status/?status=...  # Lọc theo trạng thái
GET    /api/performances/analytics/        # Thống kê rating
GET    /api/performances/{id}/review_history/  # Lịch sử review của employee
GET    /api/performances/{id}/export_pdf/  # Xuất PDF (chưa triển khai đầy đủ)
```

### **Filter Parameters**
```
GET /api/performances/?employee={id}      # Lọc theo nhân viên
GET /api/performances/?reviewer={id}      # Lọc theo người đánh giá
GET /api/performances/?status=draft       # Lọc theo trạng thái
```

## 🎯 **CHỨC NĂNG CHI TIẾT CỦA TỪNG API**

### **1. Đăng ký (SignUp)**
```json
POST /api/auth/signup/
{
  "username": "nv001",
  "password": "password123",
  "email": "nv001@company.com",
  "first_name": "Nguyen",
  "last_name": "Van A",
  "employee_id": "NV001",
  "phone_number": "+84987654321",
  "address": "Ha Noi",
  "date_of_birth": "1990-01-01",
  "hire_date": "2024-01-01",
  "department": 1,
  "position": 1,
  "salary": "15000000"
}
```

### **2. Chấm công thời gian thực**
```json
# Check-in
POST /api/attendances/check_in/
Response:
{
  "message": "Checked in successfully",
  "time": "09:15 AM",
  "is_late": true,
  "attendance": {...}
}

# Check-out
POST /api/attendances/check_out/
Response:
{
  "message": "Checked out successfully",
  "time": "17:30",
  "total_hours": "8h 15m",
  "is_early_departure": false,
  "overtime_hours": "01:30:00"
}
```

### **3. Đơn xin nghỉ workflow**
```json
# Employee tạo đơn
POST /api/leaverequests/
{
  "leave_type": 1,
  "start_date": "2024-01-20",
  "end_date": "2024-01-22",
  "reason": "Nghi om"
}

# Manager duyệt/từ chối
POST /api/leaverequests/1/approve/
POST /api/leaverequests/1/reject/

# Employee hủy (chỉ pending)
POST /api/leaverequests/1/cancel/
```

### **4. Performance Review Workflow**
```json
# Manager tạo review
POST /api/performances/
{
  "employee": 1,
  "review_period_start": "2024-01-01",
  "review_period_end": "2024-01-31",
  "overall_rating": 4,
  "goals_achievement": 4,
  "communication": 3,
  "teamwork": 5,
  "initiative": 4,
  "comments": "Lam viec tot",
  "status": "draft"
}

# Manager submit
PUT /api/performances/1/
{"status": "submitted"}

# Employee phản hồi
PUT /api/performances/1/
{
  "employee_comments": "Cam on feedback",
  "status": "feedback"
}
```

## 🔐 **PERMISSION MATRIX**

| API Endpoint | Employee | Manager | Admin |
|--------------|----------|---------|-------|
| `/employees/` | Read only (filtered) | Full CRUD | Full CRUD |
| `/employees/me/` | Read/Update | Read/Update | Read/Update |
| `/attendances/check_in/` | ✅ | ✅ | ✅ |
| `/attendances/today/` | ❌ | ✅ | ✅ |
| `/leaverequests/` | Create own | Read all | Read all |
| `/leaverequests/{id}/approve/` | ❌ | ✅ | ✅ |
| `/performances/` | Read own | CRUD in dept | Full CRUD |
| `/leavetypes/` | Read only | Full CRUD | Full CRUD |

## 📊 **QUERY PARAMETERS TỔNG HỢP**

### **Attendance Filters:**
- `?employee=1`
- `?date=2024-01-15`
- `?date_from=2024-01-01&date_to=2024-01-31`
- `?status=checked_in`
- `?ordering=-date` (mới nhất trước)

### **Performance Filters:**
- `?employee=1`
- `?reviewer=2`
- `?status=draft`
- `?ordering=-created_at`

### **Leave Request Filters:**
- `?status=pending`
- `?employee=1`
- `?leave_type=1`

## 💡 **TÍNH NĂNG ĐẶC BIỆT**

### **1. Auto-calculations:**
- **Attendance**: Tự tính `total_hours`, `overtime_hours`, `late_arrival`, `early_departure`
- **Leave Request**: Tự tính `days_requested`, trừ `annual_leave_remaining`
- **Performance**: Validation chặt chẽ theo business rules

### **2. Real-time Integration:**
- Leave approved → Auto create `Attendance` với status='on_leave'
- Check-in bị block nếu đang on leave
- Break management với start/end tracking

### **3. Dashboard & Analytics:**
- `GET /employees/dashboard_stats/` - Thống kê tổng quan
- `GET /attendances/stats/` - Thống kê chấm công
- `GET /leaverequests/stats/` - Thống kê đơn nghỉ
- `GET /performances/analytics/` - Thống kê đánh giá

### **4. Export & Reports:**
- Performance export to PDF (đang phát triển)
- Attendance reports qua filters
- Leave request history

**Ghi nhớ**: Hệ thống có đầy đủ REST API cho tất cả chức năng HR, với phân quyền rõ ràng và workflow phức tạp cho leave và performance management.