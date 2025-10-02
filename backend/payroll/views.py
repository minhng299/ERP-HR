from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from hrms.models import Employee
from .services import PayrollService

class SetBaseSalaryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        employee_id = request.data.get('employee_id')
        salary = request.data.get('salary')
        if not employee_id or salary is None:
            return Response({'error': 'Thiếu thông tin.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            employee = PayrollService.set_base_salary(user, employee_id, salary)
            # Lấy lại thông tin lương mới nhất từ DB
            employee.refresh_from_db()
            return Response({
                'success': True,
                'employee_id': employee.id,
                'salary': str(employee.salary),
                'message': f"Lương cơ bản mới của nhân viên {employee.user.get_full_name()} là {employee.salary}"
            })
        except PermissionError as e:
            return Response({'error': str(e)}, status=status.HTTP_403_FORBIDDEN)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from hrms.models import Employee
from .models import SalaryRecord
from .services import PayrollService
from datetime import date, timedelta

class MySalaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            employee = Employee.objects.get(user=user)
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=404)

        today = date.today()
        # Calculate for current month instead of previous month
        month = today.replace(day=1)

        from payroll.services import PayrollService
        penalty_per_day = 100000
        base_salary = employee.salary
        overtime_bonus = PayrollService.calculate_overtime_bonus(employee, month)
        bonus = overtime_bonus
        # Use the month we calculated above instead of recalculating

        # --- Gọi service để tạo/ cập nhật SalaryRecord ---
        record = SalaryRecord.objects.filter(
            employee_id=employee.id,
            month__year=month.year,
            month__month=month.month
        ).first()

        if record:
            # update lại record qua service
            record.delete()  # xoá bản cũ để tạo lại cho chuẩn
            record = PayrollService.create_salary_record(
                employee_id=employee.id,
                base_salary=base_salary,
                bonus=bonus,
                month=month,
                penalty_per_day=penalty_per_day
            )
        else:
            # tạo mới
            record = PayrollService.create_salary_record(
                employee_id=employee.id,
                base_salary=base_salary,
                bonus=bonus,
                month=month,
                penalty_per_day=penalty_per_day
            )

        return Response({
            'net_salary': record.total_salary,
            'base_salary': record.base_salary,
            'bonus': record.bonus,
            'deductions': int(record.deductions),
            'month': record.month,
            'total_hours_worked': float(record.total_hours_worked),
            'overtime_hours': float(record.overtime_hours),
            'late_days': record.late_days,
            'absent_days': record.absent_days,
            'incomplete_days': record.incomplete_days,
            'debug_info': {
                'calculation_month': str(month),
                'employee_base_salary_in_db': float(employee.salary),
                'is_current_month': month.month == date.today().month
            }
        })
