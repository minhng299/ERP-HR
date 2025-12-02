from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from hrms.models import Employee
from .services import PayrollService
from django.http import HttpResponse
from reportlab.pdfgen import canvas

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
from datetime import date, timedelta, datetime

class MySalaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            employee = Employee.objects.get(user=user)
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=404)

        # Allow filtering by month via query param: ?month=YYYY-MM
        month_param = request.query_params.get('month')
        if month_param:
            try:
                # Expect format YYYY-MM, fallback to full date YYYY-MM-DD
                try:
                    month_date = datetime.strptime(month_param, "%Y-%m").date()
                except ValueError:
                    month_date = datetime.strptime(month_param, "%Y-%m-%d").date()
                month = month_date.replace(day=1)
            except ValueError:
                return Response(
                    {"error": "Invalid month format. Use YYYY-MM or YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            today = date.today()
            # Default: current month
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
            # Always recalculate to ensure consistency with latest attendance/leave
            record.delete()

        record = PayrollService.create_salary_record(
            employee_id=employee.id,
            base_salary=base_salary,
            bonus=bonus,
            month=month,
            penalty_per_day=penalty_per_day
        )

        # Build payslip-style breakdown (similar to debug_salary.py)
        late_days, absent_days, num_days, incomplete_days = PayrollService.get_late_or_absent_days(employee, month)
        basic_deductions = (late_days + absent_days) * penalty_per_day + (incomplete_days * penalty_per_day * 0.5)
        leave_penalty = float(record.deductions) - basic_deductions

        payslip = {
            "employee_name": employee.user.get_full_name(),
            "employee_id": employee.id,
            "month": str(record.month),
            "base_salary": float(record.base_salary),
            "overtime_bonus": float(overtime_bonus),
            "other_bonus": float(record.bonus) - float(overtime_bonus),
            "gross_salary": float(record.base_salary) + float(record.bonus),
            "late_days": late_days,
            "absent_days": absent_days,
            "incomplete_days": incomplete_days,
            "working_days": num_days,
            "late_penalty": late_days * penalty_per_day,
            "absent_penalty": absent_days * penalty_per_day,
            "incomplete_penalty": int(incomplete_days * penalty_per_day * 0.5),
            "leave_penalty": int(leave_penalty) if leave_penalty > 0 else 0,
            "total_deductions": int(record.deductions),
            "net_salary": float(record.total_salary),
        }

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
            'payslip': payslip,
            'debug_info': {
                'calculation_month': str(month),
                'employee_base_salary_in_db': float(employee.salary),
                'is_current_month': month.month == date.today().month
            }
        })


class PayslipPDFView(APIView):
    """Generate payslip as PDF for a given month"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            employee = Employee.objects.get(user=user)
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=404)

        # Reuse the month parsing logic
        month_param = request.query_params.get('month')
        if month_param:
            try:
                try:
                    month_date = datetime.strptime(month_param, "%Y-%m").date()
                except ValueError:
                    month_date = datetime.strptime(month_param, "%Y-%m-%d").date()
                month = month_date.replace(day=1)
            except ValueError:
                return Response(
                    {"error": "Invalid month format. Use YYYY-MM or YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            today = date.today()
            month = today.replace(day=1)

        penalty_per_day = 100000
        base_salary = employee.salary
        overtime_bonus = PayrollService.calculate_overtime_bonus(employee, month)
        bonus = overtime_bonus

        record = SalaryRecord.objects.filter(
            employee_id=employee.id,
            month__year=month.year,
            month__month=month.month
        ).first()

        if record:
            record.delete()

        record = PayrollService.create_salary_record(
            employee_id=employee.id,
            base_salary=base_salary,
            bonus=bonus,
            month=month,
            penalty_per_day=penalty_per_day
        )

        late_days, absent_days, num_days, incomplete_days = PayrollService.get_late_or_absent_days(employee, month)
        basic_deductions = (late_days + absent_days) * penalty_per_day + (incomplete_days * penalty_per_day * 0.5)
        leave_penalty = float(record.deductions) - basic_deductions

        # Create PDF response
        response = HttpResponse(content_type='application/pdf')
        filename = f"payslip_{employee.id}_{month.strftime('%Y_%m')}.pdf"
        response['Content-Disposition'] = f'attachment; filename="{filename}"'

        p = canvas.Canvas(response)
        y = 800

        p.setFont("Helvetica-Bold", 16)
        p.drawString(200, y, "PAYSLIP")
        y -= 40

        p.setFont("Helvetica", 11)
        p.drawString(50, y, f"Employee: {employee.user.get_full_name()} (ID: {employee.id})")
        y -= 20
        p.drawString(50, y, f"Month: {month.strftime('%Y-%m')}")
        y -= 30

        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, y, "Earnings")
        y -= 20
        p.setFont("Helvetica", 11)
        p.drawString(70, y, f"Base Salary: {float(record.base_salary):,.0f} VND")
        y -= 15
        p.drawString(70, y, f"Overtime Bonus: {float(overtime_bonus):,.0f} VND")
        y -= 15
        other_bonus = float(record.bonus) - float(overtime_bonus)
        p.drawString(70, y, f"Other Bonus: {other_bonus:,.0f} VND")
        y -= 20

        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, y, "Deductions")
        y -= 20
        p.setFont("Helvetica", 11)
        p.drawString(70, y, f"Late ({late_days} days): {late_days * penalty_per_day:,.0f} VND")
        y -= 15
        p.drawString(70, y, f"Absent ({absent_days} days): {absent_days * penalty_per_day:,.0f} VND")
        y -= 15
        p.drawString(70, y, f"Incomplete ({incomplete_days} days): {int(incomplete_days * penalty_per_day * 0.5):,.0f} VND")
        y -= 15
        p.drawString(70, y, f"Leave Penalty: {int(leave_penalty) if leave_penalty > 0 else 0:,.0f} VND")
        y -= 20

        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, y, f"Total Deductions: {int(record.deductions):,.0f} VND")
        y -= 30

        p.setFont("Helvetica-Bold", 13)
        p.drawString(50, y, f"Net Salary: {float(record.total_salary):,.0f} VND")

        p.showPage()
        p.save()
        return response
