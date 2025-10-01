from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from hrms.models import Department, Position, Employee, LeaveType, Performance, Attendance
from datetime import date, time, timedelta, datetime

class Command(BaseCommand):
    # Chỉ xóa dữ liệu Attendance để đảm bảo tạo mới
    def handle(self, *args, **options):
        Attendance.objects.all().delete()
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
            {'name': 'Annual Leave', 'max_days_per_year': 25, 'description': 'Yearly vacation days'},
            {'name': 'Sick Leave', 'max_days_per_year': 10, 'description': 'Medical leave'},
            {'name': 'Personal Leave', 'max_days_per_year': 5, 'description': 'Personal time off'},
            {'name': 'Maternity Leave', 'max_days_per_year': 90, 'description': 'Maternity leave'},
        ]
        for leave_data in leave_types:
            LeaveType.objects.get_or_create(**leave_data)

        # Create sample users and employees
        users = [
            {'username': 'manager1', 'email': 'manager1@example.com', 'password': 'admin123', 'first_name': 'Alice', 'last_name': 'Manager'},
            {'username': 'employee1', 'email': 'employee1@example.com', 'password': 'admin123', 'first_name': 'Bob', 'last_name': 'Employee'},
            {'username': 'employee2', 'email': 'employee2@example.com', 'password': 'admin123', 'first_name': 'Charlie', 'last_name': 'Employee'},
        ]
        emp_objs = []
        # hire_date mới: 25/9/2025 cho employee1 và employee2
        for i, user_data in enumerate(users):
            user, _ = User.objects.get_or_create(username=user_data['username'], defaults={
                'email': user_data['email'],
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name'],
            })
            user.set_password(user_data['password'])
            user.save()
            # hire_date: chỉ employee2 là 25/9/2025, còn lại giữ nguyên
            if i == 2:
                hire_date = date(2025, 9, 25)
            else:
                hire_date = date(2020, 1, 1)
            emp, created = Employee.objects.get_or_create(
                user=user,
                employee_id=f'E00{i+1}',
                phone_number='+1234567890',
                address='123 Main St',
                date_of_birth=date(1990+i, 1, 1),
                hire_date=hire_date,
                department=dept_objs[min(i, len(dept_objs)-1)],
                position=pos_objs[min(i, len(pos_objs)-1)],
                salary=6000000 if i > 0 else 9000000,
                manager=None,
                status='active',
                profile_picture='',
            )
            emp.role = 'manager' if i == 0 else 'employee'
            emp.save()
            emp_objs.append(emp)

        # Tạo dữ liệu chấm công cho manager, employee1, employee2 từ 5/9 đến hôm nay
        
        start_date = date(2025, 9, 5)
        end_date   = date(2025, 10, 1)

        delta = (end_date - start_date).days + 1
        work_days = [start_date + timedelta(days=i) for i in range(delta)]
        # manager: vắng ngày 7, còn lại đi làm đúng giờ
        for d in work_days:
            if d.day != 7:
                att, created = Attendance.objects.get_or_create(
                    employee=emp_objs[0],
                    date=d,
                    check_in=time(8,0),
                    check_out=time(17,0),
                    break_duration=timedelta(hours=1),
                )
                print(f"Manager attendance: {d} - created: {created}")
            else:
                print(f"Manager absent: {d}")
        # employee1: vắng ngày 10, còn lại đi làm đúng giờ
        for d in work_days:
            if d.day != 10:
                att, created = Attendance.objects.get_or_create(
                    employee=emp_objs[1],
                    date=d,
                    check_in=time(7,0),
                    check_out=time(17,0),
                    break_duration=timedelta(hours=1),
                )
                print(f"Employee1 attendance: {d} - created: {created}")
            else:
                print(f"Employee1 absent: {d}")
        # employee2: chỉ tạo attendance từ 25/9/2025 đến hôm nay, đi trễ 3 ngày đầu
        emp2_start = date(2025, 9, 25)
        emp2_days = [d for d in work_days if d >= emp2_start]
        for idx, d in enumerate(emp2_days):
            att, created = Attendance.objects.get_or_create(
                employee=emp_objs[2],
                date=d,
                check_in=time(8,30) if idx < 3 else time(8,0),
                check_out=time(17,0),
                break_duration=timedelta(hours=1),
            )
            print(f"Employee2 attendance: {d} - created: {created}")

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