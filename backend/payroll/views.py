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

        # Get leave requests details for the month
        from hrms.models import LeaveRequest
        start_month = month.replace(day=1)
        if month.month == 12:
            next_month = date(month.year + 1, 1, 1)
        else:
            next_month = date(month.year, month.month + 1, 1)

        # Query approved and rejected leaves in this month
        approved_leaves = LeaveRequest.objects.filter(
            employee=employee,
            status='approved',
            start_date__gte=start_month,
            start_date__lt=next_month
        )
        rejected_leaves = LeaveRequest.objects.filter(
            employee=employee,
            status='rejected',
            start_date__gte=start_month,
            start_date__lt=next_month
        )

        # Calculate total approved/rejected days
        approved_days = sum([lr.days_requested or 0 for lr in approved_leaves])
        rejected_days = sum([lr.days_requested or 0 for lr in rejected_leaves])

        # Calculate leave penalty breakdown (when > 4 days)
        total_leave_days = approved_days
        leave_penalty_breakdown = []
        leave_penalty_amount = 0
        if total_leave_days > 4:
            penalty_days = total_leave_days - 4
            from hrms.models import LeavePenalty
            for lr in approved_leaves:
                if penalty_days <= 0:
                    break
                days = lr.days_requested or 0
                if days > 0:
                    leave_penalty_obj = LeavePenalty.objects.filter(leave_type=lr.leave_type).first()
                    percent = float(leave_penalty_obj.penalty_percent) if leave_penalty_obj else 0
                    apply_days = min(days, penalty_days)
                    daily_salary = float(base_salary) / 28
                    penalty_amount = daily_salary * (percent / 100) * apply_days
                    leave_penalty_amount += penalty_amount
                    leave_penalty_breakdown.append({
                        "leave_type": lr.leave_type.name,
                        "days": apply_days,
                        "penalty_percent": percent,
                        "penalty_amount": int(penalty_amount)
                    })
                    penalty_days -= apply_days

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
            "leave_penalty": int(leave_penalty_amount) if leave_penalty_amount > 0 else 0,
            "leave_penalty_breakdown": leave_penalty_breakdown,
            "approved_leave_days": approved_days,
            "rejected_leave_days": rejected_days,
            "total_leave_days": total_leave_days,
            "leave_penalty_threshold": 4,
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
            current_user_employee = Employee.objects.get(user=user)
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=404)

        # Check if manager wants to view another employee's payslip
        employee_id_param = request.query_params.get('employee_id')
        if employee_id_param:
            # Manager viewing team member's payslip
            if current_user_employee.role != 'manager':
                return Response({'error': 'Only managers can view other employees\' payslips'}, status=403)
            try:
                employee = Employee.objects.get(id=employee_id_param)
            except Employee.DoesNotExist:
                return Response({'error': 'Employee not found'}, status=404)
            # Check if employee is in the same department
            if employee.department != current_user_employee.department:
                return Response({'error': 'You can only view payslips of employees in your department'}, status=403)
        else:
            # Viewing own payslip
            employee = current_user_employee

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
        
        # Get leave requests details for PDF
        from hrms.models import LeaveRequest, LeavePenalty
        start_month = month.replace(day=1)
        if month.month == 12:
            next_month = date(month.year + 1, 1, 1)
        else:
            next_month = date(month.year, month.month + 1, 1)

        approved_leaves = LeaveRequest.objects.filter(
            employee=employee,
            status='approved',
            start_date__gte=start_month,
            start_date__lt=next_month
        )
        rejected_leaves = LeaveRequest.objects.filter(
            employee=employee,
            status='rejected',
            start_date__gte=start_month,
            start_date__lt=next_month
        )

        approved_days = sum([lr.days_requested or 0 for lr in approved_leaves])
        rejected_days = sum([lr.days_requested or 0 for lr in rejected_leaves])
        total_leave_days = approved_days
        
        # Calculate leave penalty breakdown
        leave_penalty_amount = 0
        leave_penalty_breakdown = []
        if total_leave_days > 4:
            penalty_days = total_leave_days - 4
            for lr in approved_leaves:
                if penalty_days <= 0:
                    break
                days = lr.days_requested or 0
                if days > 0:
                    leave_penalty_obj = LeavePenalty.objects.filter(leave_type=lr.leave_type).first()
                    percent = float(leave_penalty_obj.penalty_percent) if leave_penalty_obj else 0
                    apply_days = min(days, penalty_days)
                    daily_salary = float(base_salary) / 28
                    penalty_amount = daily_salary * (percent / 100) * apply_days
                    leave_penalty_amount += penalty_amount
                    leave_penalty_breakdown.append({
                        "leave_type": lr.leave_type.name,
                        "days": apply_days,
                        "penalty_percent": percent,
                        "penalty_amount": int(penalty_amount)
                    })
                    penalty_days -= apply_days
        
        leave_penalty = int(leave_penalty_amount) if leave_penalty_amount > 0 else 0

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

        # Leave Information Section
        if approved_days > 0 or rejected_days > 0:
            p.setFont("Helvetica-Bold", 12)
            p.drawString(50, y, "Leave Information")
            y -= 20
            p.setFont("Helvetica", 10)
            if approved_days > 0:
                p.drawString(70, y, f"Approved Leave: {approved_days} days")
                y -= 15
            if rejected_days > 0:
                p.drawString(70, y, f"Rejected Leave: {rejected_days} days")
                y -= 15
            if total_leave_days > 4:
                p.drawString(70, y, f"Penalty applied for: {total_leave_days - 4} days (over 4 days limit)")
                y -= 15
            y -= 10

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
        if late_days > 0:
            p.drawString(70, y, f"Late Arrival ({late_days} days × 100,000): {late_days * penalty_per_day:,.0f} VND")
            y -= 15
        if absent_days > 0:
            p.drawString(70, y, f"Absent ({absent_days} days × 100,000): {absent_days * penalty_per_day:,.0f} VND")
            y -= 15
        if incomplete_days > 0:
            p.drawString(70, y, f"Incomplete Attendance ({incomplete_days} days × 50,000): {int(incomplete_days * penalty_per_day * 0.5):,.0f} VND")
            y -= 15
        if leave_penalty > 0:
            p.drawString(70, y, f"Leave Penalty (over {4} days): {leave_penalty:,.0f} VND")
            y -= 10
            if leave_penalty_breakdown:
                p.setFont("Helvetica", 9)
                for item in leave_penalty_breakdown:
                    p.drawString(90, y, f"  - {item['leave_type']} ({item['days']} days, {item['penalty_percent']}%): {item['penalty_amount']:,.0f} VND")
                    y -= 12
                p.setFont("Helvetica", 11)
            y -= 5
        y -= 10

        p.setFont("Helvetica-Bold", 12)
        p.drawString(50, y, f"Total Deductions: {int(record.deductions):,.0f} VND")
        y -= 30

        p.setFont("Helvetica-Bold", 13)
        p.drawString(50, y, f"Net Salary: {float(record.total_salary):,.0f} VND")

        p.showPage()
        p.save()
        return response


class TeamSalaryView(APIView):
    """Get salary list for all employees in manager's department"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        try:
            manager = Employee.objects.get(user=user)
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=404)
        
        if manager.role != 'manager':
            return Response({'error': 'Only managers can access team salary'}, status=403)

        # Get month filter
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

        # Get all employees in the same department (excluding manager themselves)
        team_employees = Employee.objects.filter(
            department=manager.department,
            status='active'
        ).exclude(id=manager.id).select_related('user', 'department', 'position')

        penalty_per_day = 100000
        team_salaries = []

        for emp in team_employees:
            # Calculate salary for this employee
            base_salary = emp.salary
            overtime_bonus = PayrollService.calculate_overtime_bonus(emp, month)
            bonus = overtime_bonus

            # Get or create salary record
            record = SalaryRecord.objects.filter(
                employee_id=emp.id,
                month__year=month.year,
                month__month=month.month
            ).first()

            if record:
                record.delete()

            record = PayrollService.create_salary_record(
                employee_id=emp.id,
                base_salary=base_salary,
                bonus=bonus,
                month=month,
                penalty_per_day=penalty_per_day
            )

            team_salaries.append({
                'employee_id': emp.id,
                'employee_name': emp.user.get_full_name(),
                'employee_code': emp.employee_id,
                'position': emp.position.title,
                'net_salary': float(record.total_salary),
                'base_salary': float(record.base_salary),
                'bonus': float(record.bonus),
                'deductions': int(record.deductions),
                'month': str(record.month),
            })

        return Response({
            'month': str(month),
            'team_salaries': team_salaries,
            'total_employees': len(team_salaries)
        })


class EmployeeSalaryView(APIView):
    """Get salary details for a specific employee (for manager to view payslip)"""
    permission_classes = [IsAuthenticated]

    def get(self, request, employee_id):
        user = request.user
        try:
            manager = Employee.objects.get(user=user)
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=404)
        
        if manager.role != 'manager':
            return Response({'error': 'Only managers can view employee salary'}, status=403)

        try:
            employee = Employee.objects.get(id=employee_id)
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=404)

        # Check if employee is in the same department
        if employee.department != manager.department:
            return Response({'error': 'You can only view salary of employees in your department'}, status=403)

        # Get month filter
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

        # Reuse the same logic as MySalaryView but for the specified employee
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

        # Build payslip-style breakdown (same as MySalaryView)
        late_days, absent_days, num_days, incomplete_days = PayrollService.get_late_or_absent_days(employee, month)
        basic_deductions = (late_days + absent_days) * penalty_per_day + (incomplete_days * penalty_per_day * 0.5)
        
        # Get leave requests details
        from hrms.models import LeaveRequest
        start_month = month.replace(day=1)
        if month.month == 12:
            next_month = date(month.year + 1, 1, 1)
        else:
            next_month = date(month.year, month.month + 1, 1)

        approved_leaves = LeaveRequest.objects.filter(
            employee=employee,
            status='approved',
            start_date__gte=start_month,
            start_date__lt=next_month
        )
        rejected_leaves = LeaveRequest.objects.filter(
            employee=employee,
            status='rejected',
            start_date__gte=start_month,
            start_date__lt=next_month
        )

        approved_days = sum([lr.days_requested or 0 for lr in approved_leaves])
        rejected_days = sum([lr.days_requested or 0 for lr in rejected_leaves])
        total_leave_days = approved_days
        
        # Calculate leave penalty breakdown
        leave_penalty_amount = 0
        leave_penalty_breakdown = []
        if total_leave_days > 4:
            penalty_days = total_leave_days - 4
            from hrms.models import LeavePenalty
            for lr in approved_leaves:
                if penalty_days <= 0:
                    break
                days = lr.days_requested or 0
                if days > 0:
                    leave_penalty_obj = LeavePenalty.objects.filter(leave_type=lr.leave_type).first()
                    percent = float(leave_penalty_obj.penalty_percent) if leave_penalty_obj else 0
                    apply_days = min(days, penalty_days)
                    daily_salary = float(base_salary) / 28
                    penalty_amount = daily_salary * (percent / 100) * apply_days
                    leave_penalty_amount += penalty_amount
                    leave_penalty_breakdown.append({
                        "leave_type": lr.leave_type.name,
                        "days": apply_days,
                        "penalty_percent": percent,
                        "penalty_amount": int(penalty_amount)
                    })
                    penalty_days -= apply_days

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
            "leave_penalty": int(leave_penalty_amount) if leave_penalty_amount > 0 else 0,
            "leave_penalty_breakdown": leave_penalty_breakdown,
            "approved_leave_days": approved_days,
            "rejected_leave_days": rejected_days,
            "total_leave_days": total_leave_days,
            "leave_penalty_threshold": 4,
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
        })
