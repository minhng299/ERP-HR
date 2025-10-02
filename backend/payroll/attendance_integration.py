from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from hrms.models import Employee
from payroll.services import PayrollService
from datetime import date


class AttendancePayrollStatsView(APIView):
    """Get integrated attendance and payroll statistics"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            employee = Employee.objects.get(user=request.user)
        except Employee.DoesNotExist:
            return Response({'error': 'Employee not found'}, status=404)

        # Get current month
        current_month = date.today().replace(day=1)
        
        try:
            # Get attendance statistics
            late_days, absent_days, num_days, incomplete_days = PayrollService.get_late_or_absent_days(employee, current_month)
            
            # Get overtime and hours
            overtime_bonus = PayrollService.calculate_overtime_bonus(employee, current_month)
            total_hours = PayrollService.get_total_hours_worked(employee, current_month)
            
            # Calculate salary impact
            if employee.salary:
                penalty_per_day = 100000
                deductions = (late_days + absent_days) * penalty_per_day + (incomplete_days * penalty_per_day * 0.5)
                total_salary = PayrollService.calculate_salary(
                    base_salary=employee.salary,
                    bonus=overtime_bonus,
                    month=current_month,
                    employee_id=employee.id
                )
            else:
                deductions = 0
                total_salary = 0
            
            return Response({
                'month': current_month,
                'attendance_stats': {
                    'working_days': num_days,
                    'late_days': late_days,
                    'absent_days': absent_days,
                    'incomplete_days': incomplete_days,
                    'total_hours_worked': total_hours,
                },
                'salary_impact': {
                    'base_salary': float(employee.salary) if employee.salary else 0,
                    'overtime_bonus': overtime_bonus,
                    'deductions': int(deductions),
                    'net_salary': total_salary,
                    'penalty_per_late_day': 100000,
                    'penalty_per_absent_day': 100000,
                    'penalty_per_incomplete_day': 50000,
                },
                'debug_info': {
                    'employee_id': employee.id,
                    'employee_name': employee.user.get_full_name(),
                    'calculation_breakdown': {
                        'base_salary': float(employee.salary) if employee.salary else 0,
                        'overtime_bonus': overtime_bonus,
                        'late_penalty': late_days * 100000,
                        'absent_penalty': absent_days * 100000,
                        'incomplete_penalty': int(incomplete_days * 50000),
                        'total_deductions': int(deductions),
                        'final_amount': total_salary
                    }
                }
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)