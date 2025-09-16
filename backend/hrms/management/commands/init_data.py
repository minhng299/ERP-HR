from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from hrms.models import Department, Position, Employee, LeaveType, Performance
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
        dept_objs = []
        for dept_data in departments:
            dept, _ = Department.objects.get_or_create(**dept_data)
            dept_objs.append(dept)

        # Create positions
        positions = [
            {'title': 'Software Engineer', 'department': dept_objs[0], 'description': 'Develops software', 'salary_min': 80000, 'salary_max': 150000},
            {'title': 'Marketing Specialist', 'department': dept_objs[1], 'description': 'Handles marketing', 'salary_min': 50000, 'salary_max': 90000},
            {'title': 'Sales Executive', 'department': dept_objs[2], 'description': 'Drives sales', 'salary_min': 60000, 'salary_max': 120000},
            {'title': 'HR Manager', 'department': dept_objs[3], 'description': 'Manages HR', 'salary_min': 70000, 'salary_max': 130000},
            {'title': 'Accountant', 'department': dept_objs[4], 'description': 'Manages accounts', 'salary_min': 55000, 'salary_max': 100000},
        ]
        pos_objs = []
        for pos_data in positions:
            pos, _ = Position.objects.get_or_create(**pos_data)
            pos_objs.append(pos)

        # Create leave types
        leave_types = [
            {'name': 'Annual Leave', 'days_allowed': 25, 'description': 'Yearly vacation days'},
            {'name': 'Sick Leave', 'days_allowed': 10, 'description': 'Medical leave'},
            {'name': 'Personal Leave', 'days_allowed': 5, 'description': 'Personal time off'},
            {'name': 'Maternity Leave', 'days_allowed': 90, 'description': 'Maternity leave'},
        ]
        for leave_data in leave_types:
            LeaveType.objects.get_or_create(**leave_data)

        # Create sample users and employees
        users = [
            {'username': 'manager1', 'email': 'manager1@example.com', 'password': 'admin123', 'first_name': 'Alice', 'last_name': 'Manager'},
            {'username': 'employee1', 'email': 'employee1@example.com', 'password': 'admin123', 'first_name': 'Bob', 'last_name': 'Employee'},
        ]
        emp_objs = []
        for i, user_data in enumerate(users):
            user, _ = User.objects.get_or_create(username=user_data['username'], defaults={
                'email': user_data['email'],
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
            })
            user.set_password(user_data['password'])
            user.save()
            emp, created = Employee.objects.get_or_create(
                user=user,
                employee_id=f'E00{i+1}',
                phone_number='+1234567890',
                address='123 Main St',
                date_of_birth=date(1990+i, 1, 1),
                hire_date=date(2020, 1, 1),
                department=dept_objs[i],
                position=pos_objs[i],
                salary=90000 + i*5000,
                manager=None,
                status='active',
                profile_picture='',
            )
            emp.role = 'manager' if i == 0 else 'employee'
            emp.save()
            emp_objs.append(emp)

        # Create sample performance review
        if len(emp_objs) > 1:
            Performance.objects.get_or_create(
                employee=emp_objs[1],
                reviewer=emp_objs[0],
                review_period_start=date(2023, 1, 1),
                review_period_end=date(2023, 12, 31),
                overall_rating=5,
                goals_achievement=4,
                communication=5,
                teamwork=4,
                initiative=5,
                comments='Excellent performance throughout the year.',
                employee_comments='Thank you!',
            )

        self.stdout.write(self.style.SUCCESS('Successfully populated sample data'))