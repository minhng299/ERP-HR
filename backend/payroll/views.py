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
        ##chú ý
        today = date.today()
        # today = (today.replace(day=1) - timedelta(days=1)).replace(day=1)

        # Tính lại lương dựa trên số ngày nghỉ/thưởng, update vào SalaryRecord tháng hiện tại
        from payroll.services import PayrollService
        base_salary = employee.salary
        bonus = 0
        penalty_per_day = 100000
        late_days, absent_days, num_days = PayrollService.get_late_or_absent_days(employee, today)
        deductions = (late_days + absent_days) * penalty_per_day
        # Nếu là nhân viên mới, chia lương theo số ngày làm thực tế
        if num_days < 28:
            daily_salary = float(base_salary) / 28
            base_salary_calc = daily_salary * num_days
        else:
            base_salary_calc = float(base_salary)
        total_salary = base_salary_calc + bonus - deductions
        # Update hoặc tạo mới SalaryRecord tháng này
        from payroll.models import SalaryRecord
        month = today.replace(day=1)
        record = SalaryRecord.objects.filter(employee_id=employee.id, month__year=today.year, month__month=today.month).first()
        if record:
            record.base_salary = base_salary
            record.bonus = bonus
            record.deductions = deductions
            record.total_salary = total_salary
            record.month = month
            record.save()
        else:
            record = SalaryRecord.objects.create(
                employee_id=employee.id,
                base_salary=base_salary,
                bonus=bonus,
                deductions=deductions,
                total_salary=total_salary,
                month=month
            )
        return Response({
            'net_salary': record.total_salary,
            'base_salary': record.base_salary,
            'bonus': record.bonus,
            'deductions': record.deductions,
            'month': record.month,
        })
