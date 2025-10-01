## Các thay đổi và bổ sung gần đây
`---------------------------`
`---21h35 24 - 09 - 2025 ---`
`---------------------------`
1. Tạo app payroll để tính lương.
2. Tạo model **SalaryRecord**, service **PayrollService** (tính lương, set lương, lấy số ngày trễ/vắng).
3. Tạo API trả về lương thực nhận **(payroll/my-salary/)**, thêm route vào backend.
4. Tạo **Salary.jsx**, thêm tab Salary vào ERPHRSystem.jsx, routing đến Salary.jsx.


`---------------------------`
`---20h19 25 - 09 - 2025 ---`
`---------------------------`
5. Thêm API set lương cơ bản **(payroll/set-base-salary/)**, chỉ manager mới được phép set.
6. Khi set lương, cập nhật cả trường salary của Employee và bản ghi SalaryRecord tháng hiện tại (update nếu đã có, tạo mới nếu chưa có).
7. Khi set lương, tự động tính lại deductions (số tiền bị trừ do đi muộn/vắng) và total_salary, cập nhật vào SalaryRecord.
8. Đảm bảo SalaryRecord chỉ có 1 bản ghi mỗi tháng cho mỗi nhân viên (không bị trùng theo tháng + năm ).

`---------------------------`
`---XXhXX 02 - 10 - 2025 ---`
`---------------------------`
(merge service với LeaveRequest - YÊU CẦU BẠN VIỆT ANH RÚT KINH NGHIỆM, SAU TẠO 1 APP RIÊNG THAY VÌ LÀM THẲNG VÔ APP CHÍNH)
9. Tạo model LeavePenalty để cấu hình % phạt theo loại nghỉ phép.
10. Kết nối LeavePenalty với PayrollService: khi tính lương sẽ dựa vào leave_type để trừ đúng penalty_percent.
11. Không được nghỉ quá 4 ngày. Nếu quá sẽ bị phạt XX% lương theo ngày ( tùy theo loại nghỉ phép)