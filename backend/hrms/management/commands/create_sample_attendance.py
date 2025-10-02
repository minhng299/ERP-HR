from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from hrms.models import Employee, Attendance
from datetime import date, time, timedelta
import random


class Command(BaseCommand):
    help = 'Create sample attendance data for testing payroll integration'

    def add_arguments(self, parser):
        parser.add_argument('--id', type=int, help='Employee ID to create data for')
        parser.add_argument('--days', type=int, default=10, help='Number of days to create attendance for')

    def handle(self, *args, **options):
        employee_id = options.get('id')
        days_count = options.get('days')
        
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

        self.stdout.write(f'Creating sample attendance for: {employee.user.get_full_name()} (ID: {employee.id})')
        
        # Get current month start
        today = date.today()
        month_start = today.replace(day=1)
        
        # Clear existing attendance for this month
        existing_count = Attendance.objects.filter(
            employee=employee,
            date__gte=month_start,
            date__lte=today
        ).count()
        
        if existing_count > 0:
            self.stdout.write(f'Found {existing_count} existing attendance records for this month.')
            confirm = input('Delete existing records and create new ones? (y/N): ')
            if confirm.lower() != 'y':
                self.stdout.write('Cancelled.')
                return
            
            Attendance.objects.filter(
                employee=employee,
                date__gte=month_start,
                date__lte=today
            ).delete()
            self.stdout.write('Deleted existing records.')

        # Create sample attendance data
        created_count = 0
        for i in range(days_count):
            work_date = month_start + timedelta(days=i)
            
            # Skip weekends
            if work_date.weekday() >= 5:
                continue
                
            # Skip future dates
            if work_date > today:
                break
                
            # Create varied attendance patterns
            attendance_type = random.choice(['normal', 'late', 'overtime', 'incomplete'])
            
            if attendance_type == 'normal':
                check_in = time(9, random.randint(0, 30))  # 9:00-9:30
                check_out = time(17, random.randint(0, 30))  # 17:00-17:30
                status = 'checked_out'
            elif attendance_type == 'late':
                check_in = time(9, random.randint(45, 59))  # Late arrival
                check_out = time(17, random.randint(0, 30))
                status = 'checked_out'
            elif attendance_type == 'overtime':
                check_in = time(9, random.randint(0, 15))
                check_out = time(18, random.randint(30, 59))  # Overtime
                status = 'checked_out'
            else:  # incomplete
                check_in = time(9, random.randint(0, 30))
                check_out = None
                status = 'incomplete'
            
            attendance = Attendance.objects.create(
                employee=employee,
                date=work_date,
                check_in=check_in,
                check_out=check_out,
                status=status,
                break_duration=timedelta(hours=1),  # Standard 1-hour break
            )
            
            created_count += 1
            self.stdout.write(f'Created: {work_date} - {attendance_type} ({check_in} to {check_out or "incomplete"})')

        self.stdout.write(self.style.SUCCESS(f'Created {created_count} attendance records!'))