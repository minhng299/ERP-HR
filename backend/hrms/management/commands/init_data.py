from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from hrms.models import Department, Position, Employee, LeaveType, Performance, Attendance
from datetime import date, time, timedelta, datetime
import random
import calendar

class Command(BaseCommand):
    help = 'Initialize database with sample data including enhanced attendance records'
    
    def handle(self, *args, **options):
        # Delete existing attendance data to ensure clean state
        Attendance.objects.all().delete()
        self.stdout.write('Cleared existing attendance data')
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

        # Create enhanced attendance data for manager, employee1, employee2 from Sep 5 to today
        start_date = date(2025, 9, 5)
        end_date = date(2025, 10, 2)  # Current date
        
        delta = (end_date - start_date).days + 1
        work_days = [start_date + timedelta(days=i) for i in range(delta)]
        
        # Standard work schedule (8 AM - 5 PM with 1 hour lunch break)
        standard_check_in = time(8, 0)
        standard_check_out = time(17, 0)
        lunch_break_duration = timedelta(hours=1)
        
        # Manager attendance: absent on 7th, on time otherwise
        self.stdout.write('Creating manager attendance records...')
        for d in work_days:
            # Skip weekends (assuming Saturday=5, Sunday=6)
            if d.weekday() >= 5:
                continue
                
            if d.day != 7:  # Present days
                total_hours = timedelta(hours=8)  # 8 hours work day
                overtime_hours = timedelta(hours=0)
                
                att, created = Attendance.objects.get_or_create(
                    employee=emp_objs[0],
                    date=d,
                    defaults={
                        'check_in': standard_check_in,
                        'check_out': standard_check_out,
                        'total_hours': timedelta(hours=8),  # Use timedelta for duration field
                        'break_duration': lunch_break_duration,
                        'status': 'checked_out',
                        'location': '192.168.1.100',  # Sample office IP
                        'late_arrival': False,
                        'early_departure': False,
                        'overtime_hours': timedelta(hours=0),  # Use timedelta for duration field
                        'break_start': time(12, 0),
                        'break_end': time(13, 0),
                    }
                )
                if created:
                    self.stdout.write(f"  Created manager attendance for {d}")
            else:
                self.stdout.write(f"  Manager absent on {d}")
        
        # Employee1 attendance: absent on 10th, on time otherwise  
        self.stdout.write('Creating employee1 attendance records...')
        for d in work_days:
            # Skip weekends
            if d.weekday() >= 5:
                continue
                
            if d.day != 10:  # Present days
                total_hours = timedelta(hours=8)
                overtime_hours = timedelta(hours=0)
                
                # Employee1 comes early (7 AM) and leaves on time
                early_check_in = time(7, 0)
                total_hours = timedelta(hours=8)  # 8 hours actual work
                
                att, created = Attendance.objects.get_or_create(
                    employee=emp_objs[1],
                    date=d,
                    defaults={
                        'check_in': early_check_in,
                        'check_out': standard_check_out,
                        'total_hours': timedelta(hours=8),  # 8 hours actual work
                        'break_duration': lunch_break_duration,
                        'status': 'checked_out',
                        'location': '192.168.1.101',  # Sample office IP
                        'late_arrival': False,
                        'early_departure': False,
                        'overtime_hours': timedelta(hours=0),
                        'break_start': time(12, 0),
                        'break_end': time(13, 0),
                    }
                )
                if created:
                    self.stdout.write(f"  Created employee1 attendance for {d}")
            else:
                self.stdout.write(f"  Employee1 absent on {d}")
        
        # Employee2 attendance: only from hire date (Sep 25), late first 3 days
        self.stdout.write('Creating employee2 attendance records...')
        emp2_start = date(2025, 9, 25)
        emp2_days = [d for d in work_days if d >= emp2_start and d.weekday() < 5]
        
        for idx, d in enumerate(emp2_days):
            is_late = idx < 3  # Late for first 3 days
            check_in_time = time(8, 30) if is_late else standard_check_in
            
            # Calculate hours based on actual check-in time
            if is_late:
                # Late by 30 minutes, so 7.5 hours work day
                total_hours = timedelta(hours=7, minutes=30)
                overtime_hours = timedelta(hours=0)
            else:
                total_hours = timedelta(hours=8)
                overtime_hours = timedelta(hours=0)
            
            # Some days with overtime for variety
            if d.day % 7 == 0:  # Every 7th day, work overtime
                check_out_time = time(19, 0)  # 7 PM
                total_hours = timedelta(hours=9) if not is_late else timedelta(hours=8, minutes=30)
                overtime_hours = timedelta(hours=1) if not is_late else timedelta(minutes=30)
            else:
                check_out_time = standard_check_out
            
            att, created = Attendance.objects.get_or_create(
                employee=emp_objs[2],
                date=d,
                defaults={
                    'check_in': check_in_time,
                    'check_out': check_out_time,
                    'total_hours': total_hours,
                    'break_duration': lunch_break_duration,
                    'status': 'checked_out',
                    'location': '192.168.1.102',  # Sample office IP
                    'late_arrival': is_late,
                    'early_departure': False,
                    'overtime_hours': overtime_hours,
                    'break_start': time(12, 0),
                    'break_end': time(13, 0),
                }
            )
            if created:
                status_text = " (LATE)" if is_late else ""
                overtime_text = f" (OT: {overtime_hours})" if overtime_hours > timedelta(0) else ""
                self.stdout.write(f"  Created employee2 attendance for {d}{status_text}{overtime_text}")
        
        # Create some "incomplete" attendance records for today to show different statuses
        today = date.today()
        if today <= end_date:
            self.stdout.write('Creating incomplete attendance records for today...')
            
            # Manager checked in but not out yet
            incomplete_att, created = Attendance.objects.get_or_create(
                employee=emp_objs[0],
                date=today,
                defaults={
                    'check_in': time(8, 15),  # Slightly late
                    'check_out': None,
                    'total_hours': None,
                    'break_duration': timedelta(hours=0),
                    'status': 'checked_in',
                    'location': '192.168.1.100',
                    'late_arrival': True,  # 15 minutes late
                    'early_departure': False,
                    'overtime_hours': timedelta(hours=0),
                    'break_start': None,
                    'break_end': None,
                }
            )
            if created:
                self.stdout.write("  Created manager's incomplete attendance for today")
            
            # Employee1 on break
            break_att, created = Attendance.objects.get_or_create(
                employee=emp_objs[1],
                date=today,
                defaults={
                    'check_in': time(7, 30),
                    'check_out': None,
                    'total_hours': None,
                    'break_duration': timedelta(hours=0),
                    'status': 'on_break',
                    'location': '192.168.1.101',
                    'late_arrival': False,
                    'early_departure': False,
                    'overtime_hours': timedelta(hours=0),
                    'break_start': time(12, 0),
                    'break_end': None,
                }
            )
            if created:
                self.stdout.write("  Created employee1's break attendance for today")
            
            # Employee2 not started yet
            not_started_att, created = Attendance.objects.get_or_create(
                employee=emp_objs[2],
                date=today,
                defaults={
                    'check_in': None,
                    'check_out': None,
                    'total_hours': None,
                    'break_duration': timedelta(hours=0),
                    'status': 'not_started',
                    'location': None,
                    'late_arrival': False,
                    'early_departure': False,
                    'overtime_hours': timedelta(hours=0),
                    'break_start': None,
                    'break_end': None,
                }
            )
            if created:
                self.stdout.write("  Created employee2's not started attendance for today")

        # Tạo thêm 5 nhân viên mới trong Engineering
        self.stdout.write("Creating additional 5 Engineering employees...")

        engineering_dept = Department.objects.get(name='Engineering')
        engineering_position = Position.objects.filter(department=engineering_dept).first()

        extra_employees = [
            {'username': f'eng{i}', 'first_name': f'Eng{i}', 'last_name': 'Dev', 'email': f'eng{i}@example.com'}
            for i in range(1, 6)  # Nếu eng1 đã có, nó sẽ skip bên dưới
        ]

        for idx, data in enumerate(extra_employees, start=1):
            try:
                user, created = User.objects.get_or_create(
                    username=data['username'],
                    defaults={
                        'email': data['email'],
                        'first_name': data['first_name'],
                        'last_name': data['last_name'],
                    }
                )
                if created:
                    user.set_password('admin123')
                    user.save()
                    self.stdout.write(f"  Created User: {data['username']}")
                else:
                    self.stdout.write(f"  User {data['username']} already exists, skipping.")

                emp, emp_created = Employee.objects.get_or_create(
                    user=user,
                    defaults={
                        'employee_id': f'ENG{100 + idx:03d}',
                        'phone_number': '+1234567800',
                        'address': '456 Tech Street',
                        'date_of_birth': date(1995, 1, 1),
                        'hire_date': date(2023, 1, 10),
                        'department': engineering_dept,
                        'position': engineering_position,
                        'salary': 7000000,
                        'manager': None,
                        'status': 'active',
                        'profile_picture': '',
                        'role': 'employee',
                    }
                )
                if emp_created:
                    self.stdout.write(f"  Added Engineering employee: {data['username']}")
                else:
                    self.stdout.write(f"  Employee {data['username']} already exists, skipping.")

            except Exception as e:
                self.stdout.write(f"  Error creating employee {data['username']}: {e}")
                continue 
            
            # Create sample performance review
#         emp = emp_objs[1]  # employee
# # Tìm reviewer cùng department và role='Manager'
#         reviewer = Employee.objects.filter(department=emp.department, role__iexact='Manager').first()

#         if reviewer:
#             Performance.objects.get_or_create(
#                 employee=emp,
#                 reviewer=reviewer,
#                 review_period_start=date(2023, 1, 1),
#                 review_period_end=date(2023, 12, 31),
#                 overall_rating=5,
#                 goals_achievement=4,
#                 communication=5,
#                 teamwork=4,
#                 initiative=5,
#                 comments='Excellent performance throughout the year.',
#                 employee_comments='Thank you!',
#             )
        Performance.objects.all().delete()
        self.stdout.write("Creating sample performance reviews ONLY for eng1...")

        # Lấy department + reviewer (manager)
        engineering_dept = Department.objects.get(name="Engineering")
        reviewer = Employee.objects.filter(department=engineering_dept, role='manager').first()

        if not reviewer:
            raise Exception("No Manager found in Engineering department!")

        # Lấy employee eng1
        emp = Employee.objects.filter(
            department=engineering_dept,
            user__username="eng1"
        ).first()

        if not emp:
            raise Exception("Employee eng1 not found!")

        # Danh sách status mẫu
        sample_statuses = ["draft", "submitted", "feedback", "finalized"]

        # Tạo review tháng 1 → 4/2024 cho eng1
        year = 2024
        for idx, status in enumerate(sample_statuses, start=1):

            month = idx  # 1,2,3,4
            start_date = date(year, month, 1)
            end_date = date(year, month, calendar.monthrange(year, month)[1])

            # Check tránh tạo trùng
            if Performance.objects.filter(
                employee=emp,
                reviewer=reviewer,
                review_period_start=start_date
            ).exists():
                continue

            Performance.objects.create(
                employee=emp,
                reviewer=reviewer,
                review_period_start=start_date,
                review_period_end=end_date,
                goals_achievement=random.randint(3, 5),
                communication=random.randint(3, 5),
                teamwork=random.randint(3, 5),
                initiative=random.randint(3, 5),
                comments=f"Auto-generated review ({status}) for eng1.",
                status=status,
            )

            self.stdout.write(f"  Created {status} review for eng1 ({year}-{month})")

        self.stdout.write(self.style.SUCCESS('Successfully populated sample data for eng1'))
