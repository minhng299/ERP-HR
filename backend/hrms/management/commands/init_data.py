from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from hrms.models import Department, Position, Employee, LeaveType
from datetime import date

class Command(BaseCommand):
    def handle(self, *args, **options):
        # Create departments
        departments = [
            {'name': 'Engineering', 'description': 'Software development and technical teams'},
            {'name': 'Marketing', 'description': 'Brand and digital marketing'},
            {'name': 'Sales', 'description': 'Sales and business development'},
            {'name': 'HR', 'description': 'Human resources and people operations'},
            {'name': 'Finance', 'description': 'Financial planning and accounting'},
        ]
        
        for dept_data in departments:
            Department.objects.get_or_create(**dept_data)
        
        # Create leave types
        leave_types = [
            {'name': 'Annual Leave', 'days_allowed': 25, 'description': 'Yearly vacation days'},
            {'name': 'Sick Leave', 'days_allowed': 10, 'description': 'Medical leave'},
            {'name': 'Personal Leave', 'days_allowed': 5, 'description': 'Personal time off'},
            {'name': 'Maternity Leave', 'days_allowed': 90, 'description': 'Maternity leave'},
        ]
        
        for leave_data in leave_types:
            LeaveType.objects.get_or_create(**leave_data)
        
        self.stdout.write(self.style.SUCCESS('Successfully populated sample data'))