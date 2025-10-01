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

        total_salary = PayrollService.calculate_salary(
        base_salary=new_salary,
        bonus=bonus,
        month=month,
        employee_id=employee.id,
        penalty_per_day=penalty_per_day
    )
        
        late_days, absent_days, num_days = PayrollService.get_late_or_absent_days(employee, month)
        deductions = (late_days + absent_days) * penalty_per_day

        record, created = SalaryRecord.objects.get_or_create(
        employee_id=employee.id,
        month=month,
        defaults={
            "base_salary": new_salary,
            "bonus": bonus,
            "deductions": deductions,
            "total_salary": total_salary
            }
        )
        if not created:
            record.base_salary = new_salary
            record.bonus = bonus
            record.deductions = deductions
            record.total_salary = total_salary
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
        
        num_days = len(working_days)

        late_days = sum(
            1 for a in attendances 
            if a.check_in and a.check_in > time(8, 0)
        )
        
        # print("DEBUG attended_dates:", attended_dates)

        # Số ngày làm thực tế
        absent_days = sum(1 for d in working_days if d not in attended_dates)
        
        print(f"DEBUG late_days={late_days}, absent_days={absent_days}, num_days={num_days}")
        return late_days, absent_days, num_days

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
        late_days, absent_days, num_days = PayrollService.get_late_or_absent_days(employee, month)

        start_month = month.replace(day=1)
        if employee.hire_date >= start_month:
            is_new_employee = True
        else:
            is_new_employee = False

        base_salary_calc = PayrollService.calculate_base_salary(base_salary, num_days, is_new_employee)
        deductions = (late_days + absent_days) * penalty_per_day
        
        return base_salary_calc + bonus - deductions
    

    @staticmethod
    def create_salary_record(employee_id, base_salary, bonus, month, penalty_per_day=100000):
        employee = Employee.objects.get(pk=employee_id)
        total = PayrollService.calculate_salary(base_salary, bonus, month, employee_id, penalty_per_day)

        late_days, absent_days, num_days = PayrollService.get_late_or_absent_days(employee, month)
        deductions = (late_days + absent_days) * penalty_per_day
        base_salary_calc = PayrollService.calculate_base_salary(base_salary, num_days)

        record = SalaryRecord.objects.create(
            employee_id=employee_id,
            base_salary=base_salary_calc,
            bonus=bonus,
            deductions=deductions,
            total_salary=total,
            month=month
    )
        return record
