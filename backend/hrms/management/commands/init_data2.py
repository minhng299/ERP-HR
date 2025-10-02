from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from hrms.models import Department, Position, Employee, Performance, LeaveType, LeaveRequest
from datetime import date, timedelta
import random

class Command(BaseCommand):
    help = 'Initialize sample HRMS data with multiple employees and performance reviews'

    def handle(self, *args, **options):
        self.stdout.write("Creating Departments...")
        dept_names = ['HR', 'IT', 'Sales', 'Finance', 'Marketing']
        departments = []
        for name in dept_names:
            dept, _ = Department.objects.get_or_create(name=name)
            departments.append(dept)
        
        self.stdout.write("Creating Positions...")
        positions = []
        for dept in departments:
            for title in ['Junior', 'Senior', 'Lead']:
                pos, _ = Position.objects.get_or_create(
                    title=f"{title} {dept.name}",
                    department=dept,
                    salary_min=5000,
                    salary_max=15000
                )
                positions.append(pos)
        
        self.stdout.write("Creating Employees...")
        employees = []
        for i in range(20):  # tạo 20 nhân viên
            user, _ = User.objects.get_or_create(
                username=f'user{i}',
                defaults={
                    'first_name': f'First{i}',
                    'last_name': f'Last{i}',
                    'email': f'user{i}@example.com',
                    'password': 'pbkdf2_sha256$150000$fake$hash'  # placeholder
                }
            )
            dept = random.choice(departments)
            pos = random.choice([p for p in positions if p.department == dept])
            manager = random.choice(employees) if employees else None
            emp, _ = Employee.objects.get_or_create(
                user=user,
                employee_id=f"EMP{i:03d}",
                phone_number=f"+849000000{i:02d}",
                address=f"Address {i}",
                date_of_birth=date(1990, random.randint(1,12), random.randint(1,28)),
                hire_date=date(2023, random.randint(1,12), random.randint(1,28)),
                department=dept,
                position=pos,
                salary=random.randint(5000, 15000),
                manager=manager,
                role='manager' if i < 3 else 'employee',  # 3 manager
            )
            employees.append(emp)
        
        self.stdout.write("Creating Performance Reviews...")
        for emp in employees:
            # Manager review employee (skip if emp is manager)
            if emp.role != 'employee':
                continue
            possible_reviewers = [e for e in employees if e.role=='manager' and e.department==emp.department]
            if not possible_reviewers:
                continue
            reviewer = random.choice(possible_reviewers)
            for month in range(1, 4):  # tạo 3 review cho mỗi employee
                start = date(2023, month, 1)
                end = date(2023, month, 28)
                overall = random.randint(1,5)
                review, _ = Performance.objects.get_or_create(
                    employee=emp,
                    reviewer=reviewer,
                    review_period_start=start,
                    review_period_end=end,
                    defaults={
                        'overall_rating': overall,
                        'goals_achievement': random.randint(1,5),
                        'communication': random.randint(1,5),
                        'teamwork': random.randint(1,5),
                        'initiative': random.randint(1,5),
                        'comments': f"Performance comments for {emp.user.username}",
                        'employee_comments': f"Employee feedback for {emp.user.username}",
                        'status': random.choice(['draft','submitted','feedback','finalized'])
                    }
                )
        
        self.stdout.write(self.style.SUCCESS("Sample data successfully created!"))
