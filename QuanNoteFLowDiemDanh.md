1. LUỒNG CHO NHÂN VIÊN
A. Check-in (Bắt đầu làm việc)
text
1. Nhân viên mở app/web điểm danh
2. Hệ thống kiểm tra:
   - Hôm nay có nghỉ phép được duyệt không? → Nếu có → Báo lỗi
   - Hôm nay đã check-in chưa? → Nếu rồi → Báo lỗi
   - Hôm nay đã check-out chưa? → Nếu rồi → Báo lỗi
3. Ghi nhận thời gian check-in (tự động theo giờ VN)
4. Lưu IP/location
5. Kiểm tra có đi muộn không?
6. Cập nhật status = 'checked_in'
7. Trả về kết quả: giờ check-in, trạng thái muộn
B. Break (Nghỉ giữa giờ)
text
1. Nhân viên click "Bắt đầu nghỉ"
2. Hệ thống kiểm tra:
   - Đang ở trạng thái 'checked_in' không?
   - Đã có check-in chưa?
3. Ghi nhận break_start
4. Cập nhật status = 'on_break'
5. Nhân viên click "Kết thúc nghỉ"
6. Ghi nhận break_end
7. Tính break_duration
8. Cập nhật status = 'checked_in'
C. Check-out (Kết thúc làm việc)
text
1. Nhân viên click "Check-out"
2. Hệ thống kiểm tra:
   - Đã check-in chưa? → Nếu chưa → Báo lỗi
   - Đang on_break? → Nếu có → Tự động kết thúc break
3. Ghi nhận check_out
4. Tự động tính toán:
   - total_hours = (check_out - check_in - break_duration)
   - Kiểm tra về sớm không?
   - Tính overtime nếu có
5. Cập nhật status = 'checked_out'


LUỒNG CHO MANAGER
A. Theo dõi điểm danh real-time
text
1. Manager vào dashboard
2. Hệ thống lấy tất cả attendance của hôm nay
3. Hiển thị:
   - Tổng nhân viên đã check-in
   - Số người đang on_break
   - Số người đã check-out
   - Số người đi muộn
4. Filter theo department, employee
B. Báo cáo thống kê
text
1. Manager chọn khoảng thời gian
2. Hệ thống tính:
   - Tổng số ngày làm việc
   - Số lần đi muộn
   - Số lần về sớm
   - Tổng overtime
   - Trung bình giờ làm
3. Xuất báo cáo CSV