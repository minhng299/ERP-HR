from .models import SalaryRecord
from hrms.models import Attendance, Employee
from django.db.models import Q
from datetime import time, date, timedelta
from calendar import monthrange

class PayrollService:
    @staticmethod
    def set_base_salary(manager_user, employee_id, new_salary):
        """
        Chỉ cho phép manager (manager_user) set lương cho nhân viên (employee_id)
        Khi set lương, lưu thêm vào bảng SalaryRecord với bonus=0, deductions=0, month=tháng hiện tại
        """
        from datetime import date
        manager = Employee.objects.get(user=manager_user)
        if manager.role != 'manager':
            raise PermissionError("Chỉ manager mới được phép set lương cơ bản cho nhân viên.")

        print("employee_id:", employee_id)
        print("new_salary:", new_salary)
        employee = Employee.objects.get(pk=employee_id)
        employee.salary = new_salary
        employee.save()
        # Lưu hoặc cập nhật vào bảng SalaryRecord
        # Đảm bảo month luôn là ngày đầu tháng
            # Tính lương cho tháng hiện tại (ngày đầu tháng)
        month = date.today().replace(day=1)
        # today = date.today()
        # month = (today.replace(day=1) - timedelta(days=1)).replace(day=1)

        penalty_per_day = 100000
        bonus = 0

        # Tính lại lương, deductions, bonus cho tháng hiện tại
        late_days, absent_days, num_days, incomplete_days = PayrollService.get_late_or_absent_days(employee, month)
        overtime_bonus = PayrollService.calculate_overtime_bonus(employee, month)
        # Apply 50% penalty for incomplete days
        deductions = (late_days + absent_days) * penalty_per_day + (incomplete_days * penalty_per_day * 0.5)
        total_salary = PayrollService.calculate_salary(
            base_salary=new_salary,
            bonus=bonus + overtime_bonus,
            month=month,
            employee_id=employee.id,
            penalty_per_day=penalty_per_day
        )
        record, _ = SalaryRecord.objects.get_or_create(
            employee_id=employee.id,
            month=month,
            defaults={
                "base_salary": new_salary,
                "bonus": bonus + overtime_bonus,
                "deductions": deductions,
                "total_salary": total_salary,
                "total_hours_worked": PayrollService.get_total_hours_worked(employee, month),
                "overtime_hours": overtime_bonus / 50000 if overtime_bonus > 0 else 0,
                "late_days": late_days,
                "absent_days": absent_days,
                "incomplete_days": incomplete_days
            }
        )
        # Luôn cập nhật lại các trường lương
        record.base_salary = new_salary
        record.bonus = bonus + overtime_bonus
        record.deductions = deductions
        record.total_salary = total_salary
        record.total_hours_worked = PayrollService.get_total_hours_worked(employee, month)
        record.overtime_hours = overtime_bonus / 50000 if overtime_bonus > 0 else 0
        record.late_days = late_days
        record.absent_days = absent_days
        record.incomplete_days = incomplete_days
        record.save()
        return employee
        

    @staticmethod
    def get_late_or_absent_days(employee, month):
        """Tính số ngày đi muộn và nghỉ trong tháng"""

        start_month = month.replace(day=1)

        if month.month == 12:
            next_month = date(month.year+1, 1, 1)
        else:
            next_month = date(month.year, month.month+1, 1)

        hire_date = employee.hire_date

        # Nếu nhân viên mới vào làm trong tháng này
        if hire_date >= start_month and hire_date < next_month:
            calc_start = hire_date
            calc_end = next_month
            print("neww")
        else:
            print("old")
            # Nhân viên cũ
            calc_start = start_month
            calc_end = next_month

        attendances = Attendance.objects.filter(
            employee=employee,
            date__gte=calc_start,
            date__lt=calc_end
        )

        attended_dates = set(a.date for a in attendances if a.check_in)

        # print("DEBUG attendances:", list(attendances.values("date", "check_in", "check_out")))

        working_days = [
            calc_start + timedelta(days=i)
            for i in range((calc_end - calc_start).days)
            if (calc_start + timedelta(days=i)).weekday() < 5
        ]
        
        # Only consider working days up to today (don't count future days as absent)
        today = date.today()
        working_days_up_to_today = [d for d in working_days if d <= today]
        
        num_days = len(working_days_up_to_today)

        late_days = sum(
            1 for a in attendances 
            if a.check_in and a.check_in > a.expected_start
        )
        
        # print("DEBUG attended_dates:", attended_dates)

        # Số ngày làm thực tế
        # Lấy các ngày nghỉ phép đã được duyệt
        from hrms.models import LeaveRequest
        approved_leaves = LeaveRequest.objects.filter(
            employee=employee,
            status='approved',
            start_date__gte=calc_start,
            end_date__lt=calc_end
        )
        approved_leave_days = set()
        for lr in approved_leaves:
            days = (lr.end_date - lr.start_date).days + 1
            for i in range(days):
                approved_leave_days.add(lr.start_date + timedelta(days=i))
        # absent_days chỉ tính những ngày không đi làm và không có đơn nghỉ được duyệt
        # Only count working days up to today, not future days
        absent_days = sum(1 for d in working_days_up_to_today if d not in attended_dates and d not in approved_leave_days)
        
        # Add incomplete attendance days as partial penalty
        incomplete_days = PayrollService.get_incomplete_attendance_days(employee, month)
        
        print(f"DEBUG late_days={late_days}, absent_days={absent_days}, incomplete_days={incomplete_days}, num_days={num_days}")
        print(f"DEBUG approved_leave_days count: {len(approved_leave_days)}")
        print(f"DEBUG attended_dates count: {len(attended_dates)}")
        print(f"DEBUG working_days_up_to_today count: {len(working_days_up_to_today)}")
        print(f"DEBUG today: {today}, calc_start: {calc_start}, calc_end: {calc_end}")
        return late_days, absent_days, num_days, incomplete_days

    @staticmethod
    def calculate_overtime_bonus(employee, month, hourly_overtime_rate=50000):
        """Calculate overtime bonus based on attendance overtime_hours"""
        start_month = month.replace(day=1)
        if month.month == 12:
            next_month = date(month.year+1, 1, 1)
        else:
            next_month = date(month.year, month.month+1, 1)

        attendances = Attendance.objects.filter(
            employee=employee,
            date__gte=start_month,
            date__lt=next_month,
            overtime_hours__isnull=False
        )

        total_overtime_hours = 0
        for attendance in attendances:
            if attendance.overtime_hours:
                # Convert timedelta to hours
                if hasattr(attendance.overtime_hours, 'total_seconds'):
                    total_overtime_hours += attendance.overtime_hours.total_seconds() / 3600
                else:
                    # Handle string format if needed
                    try:
                        h, m, s = str(attendance.overtime_hours).split(':')
                        total_overtime_hours += int(h) + int(m)/60 + int(s)/3600
                    except:
                        pass

        return int(total_overtime_hours * hourly_overtime_rate)

    @staticmethod
    def get_incomplete_attendance_days(employee, month):
        """Count days with incomplete attendance (checked in but not out)"""
        start_month = month.replace(day=1)
        if month.month == 12:
            next_month = date(month.year+1, 1, 1)
        else:
            next_month = date(month.year, month.month+1, 1)

        incomplete_attendances = Attendance.objects.filter(
            employee=employee,
            date__gte=start_month,
            date__lt=next_month,
            status='incomplete'
        ).count()

        return incomplete_attendances

    @staticmethod
    def get_total_hours_worked(employee, month):
        """Calculate total hours worked in the month"""
        start_month = month.replace(day=1)
        if month.month == 12:
            next_month = date(month.year+1, 1, 1)
        else:
            next_month = date(month.year, month.month+1, 1)

        attendances = Attendance.objects.filter(
            employee=employee,
            date__gte=start_month,
            date__lt=next_month,
            total_hours__isnull=False
        )

        total_hours = 0
        for attendance in attendances:
            if attendance.total_hours:
                # Convert timedelta to hours
                if hasattr(attendance.total_hours, 'total_seconds'):
                    total_hours += attendance.total_hours.total_seconds() / 3600
                else:
                    # Handle string format if needed
                    try:
                        h, m, s = str(attendance.total_hours).split(':')
                        total_hours += int(h) + int(m)/60 + int(s)/3600
                    except:
                        pass

        return round(total_hours, 2)

    @staticmethod
    def calculate_base_salary(base_salary, num_days, is_new_employee):
        """Tính lương cơ bản sau khi xét số ngày làm thực tế"""
        """
        - Nếu là nhân viên mới trong tháng (is_new_employee=True) => tính lương theo số ngày công
        - Nếu là nhân viên cũ => giữ nguyên base_salary
        """
        if is_new_employee and num_days < 28:
            daily_salary = float(base_salary) / 28
            return daily_salary * num_days
        return float(base_salary)

    @staticmethod
    def calculate_salary(base_salary, bonus, month, employee_id, penalty_per_day=100000):
        employee = Employee.objects.get(pk=employee_id)
        late_days, absent_days, num_days, incomplete_days = PayrollService.get_late_or_absent_days(employee, month)

        start_month = month.replace(day=1)
        if employee.hire_date >= start_month:
            is_new_employee = True
        else:
            is_new_employee = False

        base_salary_calc = PayrollService.calculate_base_salary(base_salary, num_days, is_new_employee)
        # Include incomplete days penalty (50% of full penalty)
        deductions = (late_days + absent_days) * penalty_per_day + (incomplete_days * penalty_per_day * 0.5)

            # --- Leave Penalty Logic ---
        from hrms.models import LeaveRequest, LeavePenalty
        # Lấy các đơn nghỉ được duyệt trong tháng
        approved_leaves = LeaveRequest.objects.filter(
            employee=employee,
            status='approved',
            start_date__gte=start_month,
            start_date__lt=(start_month.replace(month=start_month.month+1) if start_month.month < 12 else start_month.replace(year=start_month.year+1, month=1))
        )
        # Tổng số ngày nghỉ được duyệt
        total_leave_days = sum([lr.days_requested or (lr.end_date - lr.start_date).days + 1 for lr in approved_leaves])
        penalty_total = 0
        if total_leave_days > 4:
            # Chỉ tính phạt cho số ngày vượt quá 4
            penalty_days = total_leave_days - 4
            # Tính phạt cho từng loại nghỉ
            for lr in approved_leaves:
                leave_penalty = LeavePenalty.objects.filter(leave_type=lr.leave_type).first()
                percent = float(leave_penalty.penalty_percent) if leave_penalty else 0
                # Số ngày nghỉ của đơn này vượt quá 4?
                days = lr.days_requested or (lr.end_date - lr.start_date).days + 1
                # Nếu còn penalty_days > 0 thì trừ tiếp
                if penalty_days > 0:
                    apply_days = min(days, penalty_days)
                    daily_salary = float(base_salary) / 28
                    penalty_total += daily_salary * (percent / 100) * apply_days
                    penalty_days -= apply_days

        penalty_total = int(penalty_total)
        # Trừ tổng tiền phạt vào lương
        return int(base_salary_calc + bonus - deductions - penalty_total)
        
    

    @staticmethod
    def create_salary_record(employee_id, base_salary, bonus, month, penalty_per_day=100000):
        employee = Employee.objects.get(pk=employee_id)

        # Lấy số ngày đi muộn, nghỉ, số ngày công
        late_days, absent_days, num_days, incomplete_days = PayrollService.get_late_or_absent_days(employee, month)

        # Tính deductions chuẩn từ late + absent + incomplete (50% penalty)
        deductions = (late_days + absent_days) * penalty_per_day + (incomplete_days * penalty_per_day * 0.5)

        # Xác định nhân viên mới hay cũ
        start_month = month.replace(day=1)
        is_new_employee = employee.hire_date >= start_month

        # Lương cơ bản tính toán (nếu nhân viên mới thì chia ngày công)
        base_salary_calc = PayrollService.calculate_base_salary(base_salary, num_days, is_new_employee)


        # --- B5: penalty_total = tiền phạt do nghỉ phép vượt quá 4 ngày ---
        from hrms.models import LeaveRequest, LeavePenalty
        if start_month.month == 12:
            next_month = date(start_month.year + 1, 1, 1)
        else:
            next_month = date(start_month.year, start_month.month + 1, 1)

        approved_leaves = LeaveRequest.objects.filter(
            employee=employee,
            status='approved',
            start_date__gte=start_month,
            end_date__lt=next_month
        )

        total_leave_days = sum((lr.end_date - lr.start_date).days + 1 for lr in approved_leaves)
        penalty_total = 0
        if total_leave_days > 4:
            penalty_days = total_leave_days - 4
            for lr in approved_leaves:
                leave_penalty = LeavePenalty.objects.filter(leave_type=lr.leave_type).first()
                percent = float(leave_penalty.penalty_percent) if leave_penalty else 0
                days = (lr.end_date - lr.start_date).days + 1
                if penalty_days > 0:
                    apply_days = min(days, penalty_days)
                    daily_salary = float(base_salary) / 28
                    penalty_total += daily_salary * (percent / 100) * apply_days
                    penalty_days -= apply_days
        
        # Tính total_salary bằng công thức chuẩn (bao gồm penalty leave nếu có)
        total_salary = PayrollService.calculate_salary(
            base_salary=base_salary,
            bonus=bonus,
            month=month,
            employee_id=employee_id,
            penalty_per_day=penalty_per_day
        )
        # Tạo record với đúng deductions từ late+absent
        record = SalaryRecord.objects.create(
            employee_id=employee_id,
            base_salary=base_salary_calc,
            bonus=bonus,
            deductions=deductions + penalty_total,
            total_salary=total_salary,
            month=month,
            total_hours_worked=PayrollService.get_total_hours_worked(employee, month),
            overtime_hours=PayrollService.calculate_overtime_bonus(employee, month) / 50000,
            late_days=late_days,
            absent_days=absent_days,
            incomplete_days=incomplete_days
        )
        return record

