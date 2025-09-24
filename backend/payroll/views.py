from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from hrms.models import Employee
from .models import SalaryRecord
from .services import PayrollService
from datetime import date

class MySalaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            employee = Employee.objects.get(user=user)
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=404)
        # Lấy lương tháng hiện tại
        today = date.today()
        record = SalaryRecord.objects.filter(employee_id=employee.id, month__year=today.year, month__month=today.month).first()
        if not record:
            # Nếu chưa có, tính và tạo
            record = PayrollService.create_salary_record(employee.id, employee.salary, 0, today)
        return Response({
            'net_salary': record.total_salary,
            'base_salary': record.base_salary,
            'bonus': record.bonus,
            'deductions': record.deductions,
            'month': record.month,
        })
