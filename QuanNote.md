# 📋 **BÁO CÁO THIẾT KẾ HỆ THỐNG ERP-HR**

## 🎯 **TỔNG QUAN HỆ THỐNG**

**ERP-HR System** - Hệ thống Quản lý Nhân sự Doanh nghiệp Toàn diện, được xây dựng trên nền tảng **Django REST Framework** với kiến trúc API-first, cung cấp giải pháp quản lý nhân sự từ cơ bản đến nâng cao.

---

## 🗄️ **THIẾT KẾ DATABASE & MODELS**

### **🏢 CORE MODELS (Quản lý Tổ chức)**

#### **1. Department (Phòng Ban)**
```python
- name: CharField (Tên phòng ban)
- description: TextField (Mô tả)
- created_at: DateTimeField (Ngày tạo)
```
**Chức năng:** Quản lý cơ cấu tổ chức công ty

#### **2. Position (Chức Vụ)**
```python
- title: CharField (Chức danh)
- department: ForeignKey → Department
- salary_min/max: DecimalField (Bậc lương)
- description: TextField (Mô tả công việc)
```
**Chức năng:** Quản lý vị trí công việc và khung lương

### **👥 EMPLOYEE MODELS (Quản lý Nhân sự)**

#### **3. Employee (Nhân viên)**
```python
- user: OneToOne → User (Tài khoản hệ thống)
- employee_id: CharField (Mã nhân viên)
- department: ForeignKey → Department
- position: ForeignKey → Position
- manager: ForeignKey → self (Quản lý trực tiếp)
- role: ChoiceField [manager/employee]
- status: ChoiceField [active/inactive/terminated]
- salary: DecimalField (Lương thực tế)
- phone_number: CharField (SĐT)
- address: TextField (Địa chỉ)
- date_of_birth: DateField (Ngày sinh)
- hire_date: DateField (Ngày vào làm)
- annual_leave_remaining: IntegerField (Ngày phép còn lại)
```
**Chức năng:** Quản lý thông tin nhân viên toàn diện

### **⏰ ATTENDANCE MODELS (Chấm công)**

#### **4. Attendance (Chấm công)**
```python
- employee: ForeignKey → Employee
- date: DateField (Ngày chấm công)
- check_in: TimeField (Giờ vào)
- check_out: TimeField (Giờ ra)
- break_duration: CharField (Thời gian nghỉ)
- total_hours: DurationField (Tổng giờ làm)
- notes: TextField (Ghi chú)
- status: ChoiceField [checked_in/on_break/checked_out]
- location: CharField (IP check-in)
- late_arrival: BooleanField (Đi muộn)
- overtime_hours: DurationField (Giờ làm thêm)
```
**Chức năng:** Theo dõi thời gian làm việc và tính công

### **🏖️ LEAVE MODELS (Quản lý Nghỉ phép)**

#### **5. LeaveType (Loại nghỉ phép)**
```python
- name: CharField (Tên loại nghỉ)
- code: CharField (Mã loại - tự động)
- max_days_per_year: IntegerField (Số ngày tối đa/năm)
- is_paid: BooleanField (Có lương hay không)
- description: TextField (Mô tả)
```
**Chức năng:** Định nghĩa các loại nghỉ phép

#### **6. LeaveRequest (Đơn xin nghỉ phép)**
```python
- employee: ForeignKey → Employee
- leave_type: ForeignKey → LeaveType
- start_date/end_date: DateField
- days_requested: IntegerField (Số ngày nghỉ)
- reason: TextField (Lý do)
- status: ChoiceField [pending/approved/rejected/cancelled]
- approved_by: ForeignKey → Employee (Manager duyệt)
- request_date: DateTimeField (Ngày gửi đơn)
- response_date: DateTimeField (Ngày phản hồi)
```
**Chức năng:** Quy trình xin và duyệt nghỉ phép

### **📊 PERFORMANCE MODELS (Đánh giá Hiệu suất)**

#### **7. Performance (Đánh giá hiệu suất)**
```python
- employee: ForeignKey → Employee (Người được đánh giá)
- reviewer: ForeignKey → Employee (Người đánh giá)
- review_period_start/end: DateField (Chu kỳ đánh giá)
- overall_rating: IntegerField 1-5 (Điểm tổng)
- goals_achievement: IntegerField 1-5 (Hoàn thành mục tiêu)
- communication: IntegerField 1-5 (Giao tiếp)
- teamwork: IntegerField 1-5 (Làm việc nhóm)
- initiative: IntegerField 1-5 (Chủ động)
- comments: TextField (Nhận xét của manager)
- employee_comments: TextField (Phản hồi của nhân viên)
- status: ChoiceField [draft/submitted/feedback/finalized]
```
**Chức năng:** Hệ thống đánh giá hiệu suất định kỳ

---

## 🔗 **QUAN HỆ DATABASE**

```
User (1) ←→ (1) Employee (1) ←→ (N) Attendance
    ↓                              ↓
(1) Department ←→ (N) Position ←→ (N) Employee
    ↓                              ↓
(N) Employee ←→ (N) LeaveRequest ←→ (1) LeaveType
    ↓
(N) Performance (reviewee) ←→ (1) Employee (reviewer)
```

---

## 🚀 **CÁC CHỨC NĂNG CHÍNH**

### **1. 👥 QUẢN LÝ NHÂN SỰ**
- **Quản lý thông tin nhân viên** (cá nhân, hợp đồng, lương)
- **Cơ cấu tổ chức** (phòng ban, chức vụ, sơ đồ)
- **Quản lý vai trò và phân quyền** (Manager/Employee)

### **2. ⏰ CHẤM CÔNG THỜI GIAN THỰC**
- **Check-in/Check-out** với timestamp thực
- **Quản lý break time** (nghỉ giữa giờ, nghỉ trưa)
- **Tự động tính giờ** làm, overtime, muộn/về sớm
- **Theo dõi real-time** trạng thái nhân viên
- **Báo cáo attendance** (cá nhân, phòng ban, công ty)

### **3. 🏖️ QUẢN LÝ NGHỈ PHÉP**
- **Đa dạng loại nghỉ** (nghỉ phép, nghỉ ốm, nghỉ không lương)
- **Workflow duyệt đơn** (Pending → Approved/Rejected)
- **Tự động trừ ngày phép** khi được duyệt
- **Kiểm tra số ngày nghỉ còn lại**
- **Integration với chấm công** (ngăn check-in khi nghỉ phép)

### **4. 📊 ĐÁNH GIÁ HIỆU SUẤT**
- **Hệ thống rating 5 mức độ** trên nhiều tiêu chí
- **Quy trình đánh giá nhiều bước** (Draft → Finalized)
- **Phản hồi hai chiều** (Manager ↔ Employee)
- **Lịch sử đánh giá** theo thời gian
- **Báo cáo hiệu suất** tổng quan

### **5. 📈 BÁO CÁO & DASHBOARD**
- **Dashboard tổng quan** cho Manager
- **Thống kê nhân sự** (số lượng, cơ cấu)
- **Báo cáo chấm công** (điểm danh, giờ làm, vắng mặt)
- **Báo cáo nghỉ phép** (số ngày nghỉ, loại nghỉ)
- **Analytics hiệu suất** (điểm đánh giá, xu hướng)

---

## 🛡️ **HỆ THỐNG BẢO MẬT & PHÂN QUYỀN**

### **Authentication:**
- **JWT Token-based** authentication
- **Token refresh** mechanism
- **Secure password** handling

### **Authorization:**
```python
# Custom Permission Classes:
- IsManagerOrReadOnly: Manager full access, others read-only
- IsEmployee: Chỉ cho nhân viên
- IsAuthenticated: Yêu cầu đăng nhập
```

### **Role-based Access:**
#### **Employee:**
- ✅ Xem/chỉnh sửa thông tin cá nhân
- ✅ Chấm công (check-in/out)
- ✅ Xin nghỉ phép
- ✅ Xem lịch sử attendance, leave
- ✅ Xem/phản hồi performance review
- ❌ Truy cập dữ liệu người khác

#### **Manager:**
- ✅ Tất cả quyền của Employee
- ✅ Quản lý nhân viên trong phòng ban
- ✅ Duyệt đơn nghỉ phép
- ✅ Xem báo cáo phòng ban
- ✅ Tạo và quản lý performance review
- ✅ Dashboard toàn hệ thống

---

## 🔧 **KIẾN TRÚC KỸ THUẬT**

### **Backend Stack:**
- **Framework:** Django + Django REST Framework
- **Database:** PostgreSQL (production), SQLite (development)
- **Authentication:** JWT (Simple JWT)
- **API Documentation:** Auto-generated DRF docs
- **Filtering:** Django Filter Backend
- **Testing:** Django Test Framework

### **API Design:**
- **RESTful API** design
- **Resource-based** endpoints
- **HTTP status codes** chuẩn
- **JSON response** format
- **Error handling** chi tiết

### **Database Optimization:**
- **Select related** để giảm query
- **Database indexing** trên các field thường query
- **Query optimization** với prefetch_related
- **Proper model relationships**

---

## 📊 **WORKFLOW HỆ THỐNG**

### **Daily Employee Workflow:**
```
1. Login → Lấy JWT token
2. Check current status → Xem có thể check-in không
3. Check-in → Bắt đầu làm việc
4. Start/End break → Quản lý thời gian nghỉ
5. Check-out → Kết thúc ngày làm việc
6. Xem lịch sử → Kiểm tra attendance cá nhân
```

### **Manager Workflow:**
```
1. Dashboard → Tổng quan phòng ban
2. Attendance monitoring → Theo dõi chấm công real-time
3. Leave approval → Duyệt đơn nghỉ phép
4. Performance management → Đánh giá nhân viên
5. Reporting → Xuất báo cáo định kỳ
```

### **HR Administrative Workflow:**
```
1. Employee management → Thêm/sửa/xóa nhân viên
2. Department/Position setup → Thiết lập tổ chức
3. Leave type configuration → Cấu hình loại nghỉ
4. System maintenance → Bảo trì hệ thống
```












<!-- --------------------------- -->

---

### 1. **AttendanceViewSet**
`AttendanceViewSet` là một `ModelViewSet` cung cấp các API để quản lý bản ghi chấm công (`Attendance`) của nhân viên. Nó hỗ trợ các hành động CRUD (Create, Read, Update, Delete) và một số hành động tùy chỉnh (`@action`) để xử lý các chức năng liên quan đến chấm công.

#### **Chức năng chính**:
- **CRUD Attendance**:
  - **GET /api/attendances/**: Lấy danh sách bản ghi chấm công. Người dùng chỉ thấy bản ghi của chính mình, trừ khi họ là manager (vai trò `manager`) thì thấy tất cả.
  - **GET /api/attendances/{id}/**: Lấy chi tiết một bản ghi chấm công.
  - **POST /api/attendances/**: Tạo bản ghi chấm công mới.
  - **PUT/PATCH /api/attendances/{id}/**: Cập nhật bản ghi chấm công.
  - **DELETE /api/attendances/{id}/**: Xóa bản ghi chấm công.
  - **Lọc**: Hỗ trợ lọc theo `employee`, `date`, `status`, và khoảng thời gian (`date_from`, `date_to`).

#### **Các hành động tùy chỉnh (@action)**:
1. **POST /api/attendances/check_in/**:
   - **Chức năng**: Cho phép nhân viên check-in để bắt đầu ngày làm việc.
   - **Chi tiết**:
     - Ghi nhận thời gian check-in hiện tại và địa chỉ IP của client.
     - Kiểm tra xem nhân viên có đang trong kỳ nghỉ được phê duyệt (`approved_leave`) hay không. Nếu có, trả về lỗi.
     - Tạo hoặc cập nhật bản ghi chấm công cho ngày hiện tại với trạng thái `checked_in`.
     - Trả về thông báo thành công, thời gian check-in, và trạng thái đi muộn (`is_late`).
   - **Điều kiện**: Yêu cầu người dùng đã đăng nhập và có hồ sơ `Employee`.

2. **POST /api/attendances/check_out/**:
   - **Chức năng**: Cho phép nhân viên check-out để kết thúc ngày làm việc.
   - **Chi tiết**:
     - Ghi nhận thời gian check-out và tính toán tổng giờ làm việc (`total_hours`), giờ làm thêm (`overtime_hours`), và thời gian nghỉ (`break_duration`).
     - Nếu nhân viên đang trong trạng thái nghỉ (`on_break`), kết thúc thời gian nghỉ trước khi check-out.
     - Trả về thông báo thành công, thời gian check-out, tổng giờ làm, và trạng thái rời sớm (`is_early_departure`).
   - **Điều kiện**: Phải có bản ghi check-in cho ngày hiện tại và trạng thái hợp lệ.

3. **POST /api/attendances/start_break/**:
   - **Chức năng**: Bắt đầu thời gian nghỉ giữa giờ làm việc.
   - **Chi tiết**:
     - Ghi nhận thời gian bắt đầu nghỉ (`break_start`) và đặt trạng thái thành `on_break`.
     - Trả về thông báo thành công và thời gian bắt đầu nghỉ.
   - **Điều kiện**: Phải có bản ghi check-in và trạng thái hợp lệ (không phải `on_break` hoặc `checked_out`).

4. **POST /api/attendances/end_break/**:
   - **Chức năng**: Kết thúc thời gian nghỉ giữa giờ làm việc.
   - **Chi tiết**:
     - Ghi nhận thời gian kết thúc nghỉ (`break_end`), tính toán thời gian nghỉ (`break_duration`), và đặt trạng thái trở lại `checked_in`.
     - Trả về thông báo thành công, thời gian kết thúc nghỉ, và thời gian nghỉ vừa kết thúc.
   - **Điều kiện**: Phải đang trong trạng thái `on_break`.

5. **GET /api/attendances/current_status/**:
   - **Chức năng**: Lấy trạng thái chấm công hiện tại của nhân viên trong ngày.
   - **Chi tiết**:
     - Kiểm tra xem nhân viên có đang trong kỳ nghỉ được phê duyệt hay không. Nếu có, trả về trạng thái `on_leave`.
     - Nếu không, trả về trạng thái chấm công (`not_started`, `checked_in`, `on_break`, `checked_out`) và các thông tin liên quan (như khả năng check-in, check-out, bắt đầu/kết thúc nghỉ).
     - Trả về dữ liệu bản ghi chấm công (nếu có) và thời gian hiện tại.

6. **GET /api/attendances/today/**:
   - **Chức năng**: Lấy danh sách chấm công của tất cả nhân viên trong ngày hiện tại (chỉ dành cho manager).
   - **Chi tiết**:
     - Trả về danh sách bản ghi chấm công của ngày hiện tại.
   - **Điều kiện**: Yêu cầu người dùng có vai trò `manager`.

7. **GET /api/attendances/stats/**:
   - **Chức năng**: Lấy thống kê chấm công của ngày hiện tại.
   - **Chi tiết**:
     - Đối với manager: Trả về thống kê của tất cả nhân viên (tổng số người có mặt, đã check-out, đi muộn, đang nghỉ, và giờ làm việc trung bình).
     - Đối với nhân viên: Chỉ trả về thống kê của chính họ.
     - Bao gồm các chỉ số: `total_present`, `checked_out`, `late_arrivals`, `on_break`, `average_hours`.

#### **Quyền truy cập**:
- **Người dùng thông thường**: Chỉ thấy và thao tác với bản ghi chấm công của chính họ.
- **Manager**: Có thể thấy tất cả bản ghi chấm công và truy cập API `/today/`.
- **Yêu cầu xác thực**: Tất cả API đều yêu cầu `IsAuthenticated`.

---

### 2. **LeaveTypeViewSet**
`LeaveTypeViewSet` là một `ModelViewSet` cung cấp các API để quản lý các loại nghỉ phép (`LeaveType`), chẳng hạn như nghỉ ốm, nghỉ phép năm, v.v.

#### **Chức năng chính**:
- **CRUD LeaveType**:
  - **GET /api/leave-types/**: Lấy danh sách tất cả các loại nghỉ phép.
  - **GET /api/leave-types/{id}/**: Lấy chi tiết một loại nghỉ phép.
  - **POST /api/leave-types/**: Tạo loại nghỉ phép mới.
  - **PUT/PATCH /api/leave-types/{id}/**: Cập nhật loại nghỉ phép.
  - **DELETE /api/leave-types/{id}/**: Xóa loại nghỉ phép.
- **Không có hành động tùy chỉnh (@action)**: Chỉ cung cấp các hành động CRUD tiêu chuẩn.

#### **Quyền truy cập**:
- **Người dùng thông thường**: Chỉ có quyền đọc (`GET`).
- **Manager**: Có quyền tạo, cập nhật, xóa (`POST`, `PUT`, `DELETE`).
- **Yêu cầu xác thực**: Yêu cầu `IsAuthenticated` và `IsManagerOrReadOnly` (manager có toàn quyền, người khác chỉ đọc).

---

### Tóm tắt tổng quan
- **AttendanceViewSet**:
  - **Mục đích**: Quản lý chấm công của nhân viên, bao gồm check-in, check-out, bắt đầu/kết thúc nghỉ, kiểm tra trạng thái hiện tại, và thống kê chấm công.
  - **Đối tượng sử dụng**:
    - Nhân viên: Quản lý chấm công của chính họ (check-in, check-out, nghỉ giữa giờ, xem trạng thái).
    - Manager: Xem chấm công của tất cả nhân viên và thống kê.
  - **API chính**:
    - CRUD chấm công.
    - Check-in/out, bắt đầu/kết thúc nghỉ.
    - Xem trạng thái chấm công ngày hiện tại.
    - Thống kê chấm công (tổng số, đi muộn, giờ làm trung bình).
  - **Đặc điểm**:
    - Hỗ trợ lọc theo nhân viên, ngày, trạng thái, và khoảng thời gian.
    - Kiểm tra các điều kiện như nghỉ phép, trạng thái hợp lệ, đi muộn, rời sớm.

- **LeaveTypeViewSet**:
  - **Mục đích**: Quản lý các loại nghỉ phép (ví dụ: nghỉ ốm, nghỉ phép năm).
  - **Đối tượng sử dụng**:
    - Nhân viên: Chỉ xem danh sách hoặc chi tiết loại nghỉ phép.
    - Manager: Tạo, chỉnh sửa, xóa loại nghỉ phép.
  - **API chính**:
    - CRUD các loại nghỉ phép.
  - **Đặc điểm**:
    - Đơn giản, không có hành động tùy chỉnh.
    - Quyền truy cập nghiêm ngặt (manager có quyền chỉnh sửa, nhân viên chỉ đọc).

---

### Lưu ý
- **Về lỗi trước đó (`"reviewer": ["This field cannot be null."]`)**:
  Mặc dù câu hỏi của bạn tập trung vào tóm tắt các API, tôi nhận thấy bạn đã đề cập đến vấn đề liên quan đến `review_id` và `reviewer` trong các trao đổi trước. Nếu bạn vẫn gặp lỗi với API `POST /api/performances/`, hãy đảm bảo:
  - Sửa body trong Postman để sử dụng `reviewer: 1` thay vì `reviewer_id: 1` (như đề xuất ở Cách 1 trong các phản hồi trước).
  - Hoặc sửa `PerformanceSerializer` để chấp nhận `reviewer_id` (Cách 2).
  - Kiểm tra cột trong cơ sở dữ liệu (`reviewer_id` hay `review_id`) và đảm bảo model nhất quán.

- **Nếu cần thêm thông tin**:
  - Nếu bạn muốn tóm tắt các API khác (ví dụ: `PerformanceViewSet`), hãy cung cấp mã của chúng.
  - Nếu bạn cần hỗ trợ sửa lỗi cụ thể liên quan đến `Performance` hoặc tích hợp với Postman, hãy cung cấp:
    - Nội dung `PerformanceSerializer`.
    - Định nghĩa model `Employee` (các trường `role`, `department`).
    - Log server đầy đủ.

