from .models import SalaryRecord
from hrms.models import Attendance, Employee
from django.db.models import Q

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
        employee = Employee.objects.get(pk=employee_id)
        employee.salary = new_salary
        employee.save()
        # Lưu hoặc cập nhật vào bảng SalaryRecord
        # Đảm bảo month luôn là ngày đầu tháng
        today = date.today()
        # Tìm bản ghi theo employee_id, tháng và năm (không phụ thuộc ngày)
        record = SalaryRecord.objects.filter(
            employee_id=employee.id,
            month__year=today.year,
            month__month=today.month
        ).first()
        # Tính lại deductions và total_salary dựa trên số ngày nghỉ/thưởng hiện tại
        penalty_per_day = 100000
        late_days, absent_days = PayrollService.get_late_or_absent_days(employee, today)
        deductions = (late_days + absent_days) * penalty_per_day
        bonus = 0
        total_salary = float(new_salary) + bonus - deductions
        if record:
            record.base_salary = new_salary
            record.total_salary = total_salary
            record.bonus = bonus
            record.deductions = deductions
            record.month = today.replace(day=1)
            record.save()
        else:
            SalaryRecord.objects.create(
                employee_id=employee.id,
                base_salary=new_salary,
                bonus=bonus,
                deductions=deductions,
                total_salary=total_salary,
                month=today.replace(day=1)
            )
        return employee
    @staticmethod
    def get_late_or_absent_days(employee, month):
        # Giả sử: trễ nếu check_in > 8:00, vắng nếu không có check_in
        from datetime import time
        start_month = month.replace(day=1)
        if month.month == 12:
            from datetime import date
            next_month = date(month.year+1, 1, 1)
        else:
            from datetime import date
            next_month = date(month.year, month.month+1, 1)
        attendances = Attendance.objects.filter(employee=employee, date__gte=start_month, date__lt=next_month)
        late_days = attendances.filter(check_in__gt=time(8,0)).count()
        absent_days = 0
        # Giả sử: ngày làm việc là tất cả các ngày trong tháng (có thể tuỳ chỉnh)
        from calendar import monthrange
        total_days = monthrange(month.year, month.month)[1]
        attended_dates = set(a.date for a in attendances)
        for d in range(1, total_days+1):
            from datetime import date
            day = date(month.year, month.month, d)
            if day not in attended_dates:
                absent_days += 1
        return late_days, absent_days

    @staticmethod
    def calculate_salary(base_salary, bonus, month, employee_id, penalty_per_day=100000):
        employee = Employee.objects.get(pk=employee_id)
        late_days, absent_days = PayrollService.get_late_or_absent_days(employee, month)
        total_penalty = (late_days + absent_days) * penalty_per_day
        return base_salary + bonus - total_penalty

    @staticmethod
    def create_salary_record(employee_id, base_salary, bonus, month, penalty_per_day=100000):
        total = PayrollService.calculate_salary(base_salary, bonus, month, employee_id, penalty_per_day)
        record = SalaryRecord.objects.create(
            employee_id=employee_id,
            base_salary=base_salary,
            bonus=bonus,
            deductions=(PayrollService.get_late_or_absent_days(Employee.objects.get(pk=employee_id), month)[0] + PayrollService.get_late_or_absent_days(Employee.objects.get(pk=employee_id), month)[1]) * penalty_per_day,
            total_salary=total,
            month=month
        )
        return record
