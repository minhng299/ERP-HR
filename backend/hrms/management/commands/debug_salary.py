from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from hrms.models import Employee
from payroll.services import PayrollService
from datetime import date


class Command(BaseCommand):
    help = 'Debug salary calculation for specific employee'

    def add_arguments(self, parser):
        parser.add_argument('--id', type=int, help='Employee ID to debug')

    def handle(self, *args, **options):
        employee_id = options.get('id')

        if employee_id:
            try:
                employee = Employee.objects.get(id=employee_id)
            except Employee.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Employee with ID {employee_id} not found'))
                return
        else:
            employee = Employee.objects.first()
            if not employee:
                self.stdout.write(self.style.ERROR('No employees found'))
                return

        self.stdout.write(f'Debugging salary for: {employee.user.get_full_name()} (ID: {employee.id})')
        self.stdout.write(f'Base salary set in DB: {employee.salary}')
        
        # Get current month
        current_month = date.today().replace(day=1)
        
        # Debug attendance calculation
        late_days, absent_days, num_days, incomplete_days = PayrollService.get_late_or_absent_days(employee, current_month)
        self.stdout.write(f'\nAttendance Debug:')
        self.stdout.write(f'  Working days in month: {num_days}')
        self.stdout.write(f'  Late days: {late_days}')
        self.stdout.write(f'  Absent days: {absent_days}')
        self.stdout.write(f'  Incomplete days: {incomplete_days}')
        
        # Calculate penalties
        penalty_per_day = 100000
        basic_deductions = (late_days + absent_days) * penalty_per_day + (incomplete_days * penalty_per_day * 0.5)
        self.stdout.write(f'\nPenalty Calculation:')
        self.stdout.write(f'  Late penalty: {late_days} × {penalty_per_day:,} = {late_days * penalty_per_day:,}')
        self.stdout.write(f'  Absent penalty: {absent_days} × {penalty_per_day:,} = {absent_days * penalty_per_day:,}')
        self.stdout.write(f'  Incomplete penalty: {incomplete_days} × {penalty_per_day * 0.5:,} = {incomplete_days * penalty_per_day * 0.5:,}')
        self.stdout.write(f'  Total basic deductions: {basic_deductions:,}')
        
        # Test overtime
        overtime_bonus = PayrollService.calculate_overtime_bonus(employee, current_month)
        self.stdout.write(f'\nOvertimes & Bonuses:')
        self.stdout.write(f'  Overtime bonus: {overtime_bonus:,}')
        
        # Test full salary calculation
        if employee.salary:
            total_salary = PayrollService.calculate_salary(
                base_salary=employee.salary,
                bonus=overtime_bonus,
                month=current_month,
                employee_id=employee.id
            )
            
            self.stdout.write(f'\nFinal Calculation:')
            self.stdout.write(f'  Base salary: {float(employee.salary):,}')
            self.stdout.write(f'  + Overtime bonus: {overtime_bonus:,}')
            self.stdout.write(f'  - Basic deductions: {basic_deductions:,}')
            self.stdout.write(f'  - Leave penalties: (calculated inside)')
            self.stdout.write(f'  = Final salary: {total_salary:,}')
            
            # Show the difference
            difference = float(employee.salary) - total_salary
            self.stdout.write(f'\nDiscrepancy Analysis:')
            self.stdout.write(f'  Expected: {float(employee.salary):,}')
            self.stdout.write(f'  Calculated: {total_salary:,}')
            self.stdout.write(f'  Difference: {difference:,}')
        
        self.stdout.write(self.style.SUCCESS('\nDebug completed!'))