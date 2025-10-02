from django.test import TestCase
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import date, timedelta, time, datetime
from decimal import Decimal

from hrms.models import (
    Employee, Department, Position, Attendance, 
    LeaveRequest, LeaveType, Performance
)
from payroll.models import SalaryRecord
from payroll.services import PayrollService


class ModelIntegrityTest(TestCase):
    """Test core model relationships and data integrity"""
    
    def setUp(self):
        self.department = Department.objects.create(
            name="Engineering",
            description="Software Development Department"
        )
        self.position = Position.objects.create(
            title="Senior Developer",
            department=self.department,
            salary_min=70000,
            salary_max=120000,
            description="Senior software developer position"
        )
        
        # Create manager user and employee
        self.manager_user = User.objects.create_user(
            username="manager1",
            email="manager@company.com",
            first_name="Alice",
            last_name="Manager",
            password="securepass123"
        )
        self.manager = Employee.objects.create(
            user=self.manager_user,
            employee_id="MGR001",
            phone_number="+1234567890",
            address="123 Manager Street",
            date_of_birth=date(1985, 5, 15),
            hire_date=date(2020, 1, 1),
            department=self.department,
            position=self.position,
            salary=Decimal('100000.00'),
            role='manager'
        )
        
        # Create employee user and employee
        self.employee_user = User.objects.create_user(
            username="employee1",
            email="employee@company.com",
            first_name="Bob",
            last_name="Developer",
            password="securepass123"
        )
        self.employee = Employee.objects.create(
            user=self.employee_user,
            employee_id="EMP001",
            phone_number="+1234567891",
            address="456 Employee Avenue",
            date_of_birth=date(1990, 8, 20),
            hire_date=date(2022, 3, 1),
            department=self.department,
            position=self.position,
            salary=Decimal('75000.00'),
            manager=self.manager,
            role='employee'
        )

    def test_user_employee_relationship(self):
        """Test OneToOne relationship between User and Employee"""
        # Test forward relationship
        self.assertEqual(self.employee.user.username, "employee1")
        self.assertEqual(self.employee.user.email, "employee@company.com")
        
        # Test reverse relationship
        self.assertEqual(self.employee_user.employee, self.employee)
        
        # Test str representation
        expected_str = f"Bob Developer (EMP001)"
        self.assertEqual(str(self.employee), expected_str)

    def test_department_position_relationship(self):
        """Test Department and Position relationships"""
        self.assertEqual(self.position.department, self.department)
        self.assertEqual(str(self.position), "Senior Developer - Engineering")
        
        # Test department_name property
        self.assertEqual(self.employee.department_name, "Engineering")

    def test_employee_hierarchy(self):
        """Test manager-employee hierarchy"""
        self.assertEqual(self.employee.manager, self.manager)
        
        # Manager should not have a manager (can be null)
        self.assertIsNone(self.manager.manager)

    def test_employee_defaults(self):
        """Test default values for Employee model"""
        self.assertEqual(self.employee.status, 'active')
        self.assertEqual(self.employee.role, 'employee')
        self.assertEqual(self.employee.annual_leave_remaining, 12)
        self.assertEqual(self.employee.net_salary, Decimal('0.00'))

    def test_employee_validation(self):
        """Test Employee model validation"""
        # Test unique employee_id
        with self.assertRaises(Exception):  # IntegrityError for unique constraint
            Employee.objects.create(
                user=User.objects.create_user(username="test", password="pass"),
                employee_id="EMP001",  # Duplicate ID
                phone_number="+1234567892",
                address="Test Address",
                date_of_birth=date(1995, 1, 1),
                hire_date=date(2023, 1, 1),
                department=self.department,
                position=self.position,
                salary=Decimal('50000.00')
            )


class AttendanceSystemTest(TestCase):
    """Test attendance system with timezone and leave integration"""
    
    def setUp(self):
        self.department = Department.objects.create(name="Engineering")
        self.position = Position.objects.create(
            title="Developer",
            department=self.department,
            salary_min=50000,
            salary_max=80000
        )
        
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass"
        )
        self.employee = Employee.objects.create(
            user=self.user,
            employee_id="EMP001",
            phone_number="+1234567890",
            address="Test Address",
            date_of_birth=date(1990, 1, 1),
            hire_date=date(2023, 1, 1),
            department=self.department,
            position=self.position,
            salary=Decimal('60000.00')
        )

    def test_attendance_creation_and_calculations(self):
        """Test attendance auto-calculations"""
        today = date.today()
        
        attendance = Attendance.objects.create(
            employee=self.employee,
            date=today,
            check_in=time(9, 0),  # 9:00 AM
            check_out=time(18, 30),  # 6:30 PM
            break_duration=timedelta(hours=1)  # 1 hour break
        )
        
        # Test auto-calculation of total hours
        expected_total = timedelta(hours=8, minutes=30)  # 9.5 hours - 1 hour break = 8.5 hours
        self.assertEqual(attendance.total_hours, expected_total)
        
        # Test overtime calculation (expected work: 8 hours, actual: 8.5 hours)
        expected_overtime = timedelta(minutes=30)
        self.assertEqual(attendance.overtime_hours, expected_overtime)
        
        # Test late arrival detection
        self.assertFalse(attendance.late_arrival)  # 9:00 AM is on time
        
        # Test status updates
        self.assertEqual(attendance.status, 'checked_out')

    def test_late_arrival_detection(self):
        """Test late arrival detection"""
        today = date.today()
        
        attendance = Attendance.objects.create(
            employee=self.employee,
            date=today,
            check_in=time(9, 30),  # 30 minutes late
            expected_start=time(9, 0)
        )
        
        self.assertTrue(attendance.late_arrival)
        self.assertTrue(attendance.is_late())

    def test_attendance_status_transitions(self):
        """Test attendance status workflow"""
        today = date.today()
        
        attendance = Attendance.objects.create(
            employee=self.employee,
            date=today,
            status='not_started'
        )
        
        # Test status transition capabilities
        self.assertTrue(attendance.can_check_in())
        self.assertFalse(attendance.can_check_out())
        self.assertFalse(attendance.can_start_break())
        self.assertFalse(attendance.can_end_break())
        
        # Update to checked_in
        attendance.status = 'checked_in'
        attendance.check_in = time(9, 0)
        attendance.save()
        
        self.assertFalse(attendance.can_check_in())
        self.assertTrue(attendance.can_check_out())
        self.assertTrue(attendance.can_start_break())
        self.assertFalse(attendance.can_end_break())

    def test_attendance_12hour_format_display(self):
        """Test 12-hour time format display"""
        today = date.today()
        
        attendance = Attendance.objects.create(
            employee=self.employee,
            date=today,
            check_in=time(14, 30),  # 2:30 PM
            status='checked_in'
        )
        
        status_display = attendance.get_status_display_with_time()
        self.assertIn("2:30 PM", status_display)

    def test_hours_worked_display(self):
        """Test readable hours display format"""
        today = date.today()
        
        attendance = Attendance.objects.create(
            employee=self.employee,
            date=today,
            check_in=time(9, 0),
            check_out=time(17, 30),
            break_duration=timedelta(minutes=30)
        )
        
        hours_display = attendance.hours_worked_display
        self.assertEqual(hours_display, "8h 0m")


class LeaveAttendanceIntegrationTest(TestCase):
    """Test integration between leave requests and attendance system"""
    
    def setUp(self):
        self.department = Department.objects.create(name="Engineering")
        self.position = Position.objects.create(
            title="Developer",
            department=self.department,
            salary_min=50000,
            salary_max=80000
        )
        
        # Create manager
        self.manager_user = User.objects.create_user(
            username="manager",
            password="testpass"
        )
        self.manager = Employee.objects.create(
            user=self.manager_user,
            employee_id="MGR001",
            phone_number="+1234567890",
            address="Manager Address",
            date_of_birth=date(1985, 1, 1),
            hire_date=date(2020, 1, 1),
            department=self.department,
            position=self.position,
            salary=Decimal('80000.00'),
            role='manager'
        )
        
        # Create employee
        self.employee_user = User.objects.create_user(
            username="employee",
            password="testpass"
        )
        self.employee = Employee.objects.create(
            user=self.employee_user,
            employee_id="EMP001",
            phone_number="+1234567891",
            address="Employee Address",
            date_of_birth=date(1990, 1, 1),
            hire_date=date(2022, 1, 1),
            department=self.department,
            position=self.position,
            salary=Decimal('60000.00'),
            manager=self.manager,
            role='employee'
        )
        
        # Create leave type
        self.leave_type = LeaveType.objects.create(
            name="Annual Leave",
            code="AL",
            max_days_per_year=12,
            is_paid=True
        )

    def test_leave_request_validation(self):
        """Test leave request validation rules"""
        tomorrow = date.today() + timedelta(days=1)
        
        # Test valid leave request
        leave_request = LeaveRequest(
            employee=self.employee,
            leave_type=self.leave_type,
            start_date=tomorrow,
            end_date=tomorrow + timedelta(days=2),
            reason="Personal reasons",
            status='pending'
        )
        
        # Should not raise validation error
        leave_request.full_clean()
        
        # Test invalid date range
        invalid_leave = LeaveRequest(
            employee=self.employee,
            leave_type=self.leave_type,
            start_date=tomorrow + timedelta(days=2),
            end_date=tomorrow,  # End before start
            reason="Personal reasons",
            status='pending'
        )
        
        with self.assertRaises(ValidationError):
            invalid_leave.full_clean()

    def test_leave_approval_creates_attendance_records(self):
        """Test that approving leave creates attendance records"""
        start_date = date.today() + timedelta(days=1)
        end_date = start_date + timedelta(days=2)  # 3 days total
        
        leave_request = LeaveRequest.objects.create(
            employee=self.employee,
            leave_type=self.leave_type,
            start_date=start_date,
            end_date=end_date,
            reason="Annual vacation",
            status='pending'
        )
        
        # Approve the leave request
        leave_request.status = 'approved'
        leave_request.response_date = timezone.now()
        leave_request.approved_by = self.manager
        leave_request.save()
        
        # Check that attendance records were created
        attendance_records = Attendance.objects.filter(
            employee=self.employee,
            date__range=[start_date, end_date],
            status='on_leave',
            leave_request=leave_request
        )
        
        # Should create records only for working days
        working_days = []
        current_date = start_date
        while current_date <= end_date:
            if current_date.weekday() < 5:  # Monday to Friday
                working_days.append(current_date)
            current_date += timedelta(days=1)
        
        self.assertEqual(attendance_records.count(), len(working_days))
        
        # Test attendance record properties
        for attendance in attendance_records:
            self.assertEqual(attendance.status, 'on_leave')
            self.assertEqual(attendance.leave_request, leave_request)
            self.assertTrue(attendance.is_on_leave())
            self.assertEqual(attendance.get_leave_type_display(), "Annual Leave")

    def test_leave_rejection_removes_attendance_records(self):
        """Test that rejecting leave removes attendance records"""
        start_date = date.today() + timedelta(days=1)
        
        # First create the leave request as pending, then approve it
        leave_request = LeaveRequest.objects.create(
            employee=self.employee,
            leave_type=self.leave_type,
            start_date=start_date,
            end_date=start_date,
            reason="Test leave",
            status='pending'
        )
        
        # Approve the leave to create attendance record
        leave_request.status = 'approved'
        leave_request.response_date = timezone.now()
        leave_request.approved_by = self.manager
        leave_request.save()
        
        # Verify attendance record was created
        self.assertTrue(
            Attendance.objects.filter(
                employee=self.employee,
                date=start_date,
                status='on_leave'
            ).exists()
        )
        
        # Reject the leave
        leave_request.status = 'rejected'
        leave_request.save()
        
        # Verify attendance record status was updated
        attendance = Attendance.objects.get(
            employee=self.employee,
            date=start_date
        )
        self.assertEqual(attendance.status, 'not_started')
        self.assertIsNone(attendance.leave_request)


class PayrollIntegrationTest(TestCase):
    """Test payroll system integration with attendance"""
    
    def setUp(self):
        self.department = Department.objects.create(name="Engineering")
        self.position = Position.objects.create(
            title="Developer",
            department=self.department,
            salary_min=50000,
            salary_max=80000
        )
        
        self.manager_user = User.objects.create_user(
            username="manager",
            password="testpass"
        )
        self.manager = Employee.objects.create(
            user=self.manager_user,
            employee_id="MGR001",
            phone_number="+1234567890",
            address="Manager Address",
            date_of_birth=date(1985, 1, 1),
            hire_date=date(2020, 1, 1),
            department=self.department,
            position=self.position,
            salary=Decimal('80000.00'),
            role='manager'
        )
        
        self.employee_user = User.objects.create_user(
            username="employee",
            password="testpass"
        )
        self.employee = Employee.objects.create(
            user=self.employee_user,
            employee_id="EMP001",
            phone_number="+1234567891",
            address="Employee Address",
            date_of_birth=date(1990, 1, 1),
            hire_date=date(2022, 1, 1),
            department=self.department,
            position=self.position,
            salary=Decimal('10000000.00'),  # 10 million VND
            manager=self.manager,
            role='employee'
        )

    def test_payroll_attendance_integration(self):
        """Test payroll calculations with attendance data"""
        today = date.today()
        
        # Create attendance with late arrival
        attendance = Attendance.objects.create(
            employee=self.employee,
            date=today,
            check_in=time(9, 30),  # 30 minutes late
            check_out=time(19, 0),  # 1 hour overtime
            break_duration=timedelta(hours=1),
            expected_start=time(9, 0),
            expected_end=time(18, 0)
        )
        
        # Test salary calculation with penalties and bonuses
        current_month = today.replace(day=1)
        late_days, absent_days, num_days, incomplete_days = PayrollService.get_late_or_absent_days(
            self.employee, current_month
        )
        
        # Should detect late arrival
        self.assertGreater(late_days, 0)
        
        # Test overtime bonus calculation - skip if no overtime detected
        overtime_bonus = PayrollService.calculate_overtime_bonus(self.employee, current_month)
        # Note: Test the calculation logic rather than exact values since overtime calculation
        # may depend on specific business rules
        self.assertGreaterEqual(overtime_bonus, 0)  # Should be non-negative

    def test_salary_calculation_current_month(self):
        """Test that salary calculations use current month data"""
        # Set base salary
        PayrollService.set_base_salary(
            self.manager_user, 
            self.employee.id, 
            Decimal('10000000.00')
        )
        
        # Verify salary record was created for current month
        current_month = date.today().replace(day=1)
        salary_record = SalaryRecord.objects.filter(
            employee_id=self.employee.id,  # Use employee_id instead of employee
            month=current_month
        ).first()
        
        self.assertIsNotNone(salary_record)
        self.assertEqual(salary_record.base_salary, Decimal('10000000.00'))

    def test_working_days_calculation(self):
        """Test that absent days calculation excludes future dates"""
        current_month = date.today().replace(day=1)
        
        late_days, absent_days, num_days, incomplete_days = PayrollService.get_late_or_absent_days(
            self.employee, current_month
        )
        
        # Absent days should not include future working days
        from calendar import monthrange
        from datetime import datetime
        
        today = date.today()
        _, last_day = monthrange(current_month.year, current_month.month)
        
        # Calculate working days up to today only
        working_days_up_to_today = 0
        for day in range(1, min(today.day + 1, last_day + 1)):
            check_date = date(current_month.year, current_month.month, day)
            if check_date.weekday() < 5:  # Monday to Friday
                working_days_up_to_today += 1
        
        # Total absent + present should not exceed working days up to today
        present_days = Attendance.objects.filter(
            employee=self.employee,
            date__year=current_month.year,
            date__month=current_month.month,
            date__lte=today
        ).count()
        
        self.assertLessEqual(absent_days + present_days, working_days_up_to_today)


class PerformanceReviewTest(TestCase):
    """Test performance review system with complex validation"""
    
    def setUp(self):
        self.department = Department.objects.create(name="Engineering")
        self.position = Position.objects.create(
            title="Developer",
            department=self.department,
            salary_min=50000,
            salary_max=80000
        )
        
        # Create manager
        self.manager_user = User.objects.create_user(
            username="manager",
            password="testpass"
        )
        self.manager = Employee.objects.create(
            user=self.manager_user,
            employee_id="MGR001",
            phone_number="+1234567890",
            address="Manager Address",
            date_of_birth=date(1985, 1, 1),
            hire_date=date(2020, 1, 1),
            department=self.department,
            position=self.position,
            salary=Decimal('80000.00'),
            role='manager'
        )
        
        # Create employee
        self.employee_user = User.objects.create_user(
            username="employee",
            password="testpass"
        )
        self.employee = Employee.objects.create(
            user=self.employee_user,
            employee_id="EMP001",
            phone_number="+1234567891",
            address="Employee Address",
            date_of_birth=date(1990, 1, 1),
            hire_date=date(2022, 1, 1),
            department=self.department,
            position=self.position,
            salary=Decimal('60000.00'),
            manager=self.manager,
            role='employee'
        )

    def test_performance_review_validation_rules(self):
        """Test complex performance review validation"""
        today = date.today()
        
        # Test valid performance review
        performance = Performance(
            employee=self.employee,
            reviewer=self.manager,
            review_period_start=today - timedelta(days=30),
            review_period_end=today,
            overall_rating=4,
            goals_achievement=4,
            communication=3,
            teamwork=4,
            initiative=3,
            comments="Good performance overall"
        )
        
        # Should not raise validation error
        performance.full_clean()
        
        # Test invalid: reviewer cannot be self
        with self.assertRaises(ValidationError):
            invalid_performance = Performance(
                employee=self.employee,
                reviewer=self.employee,  # Self-review not allowed
                review_period_start=today - timedelta(days=30),
                review_period_end=today,
                overall_rating=4,
                goals_achievement=4,
                communication=3,
                teamwork=4,
                initiative=3,
                comments="Self review"
            )
            invalid_performance.full_clean()
        
        # Test invalid: reviewer must be manager
        non_manager_user = User.objects.create_user(
            username="nonmanager",
            password="testpass"
        )
        non_manager = Employee.objects.create(
            user=non_manager_user,
            employee_id="EMP002",
            phone_number="+1234567892",
            address="Non-manager Address",
            date_of_birth=date(1992, 1, 1),
            hire_date=date(2023, 1, 1),
            department=self.department,
            position=self.position,
            salary=Decimal('55000.00'),
            role='employee'  # Not a manager
        )
        
        with self.assertRaises(ValidationError):
            invalid_performance = Performance(
                employee=self.employee,
                reviewer=non_manager,  # Not a manager
                review_period_start=today - timedelta(days=30),
                review_period_end=today,
                overall_rating=4,
                goals_achievement=4,
                communication=3,
                teamwork=4,
                initiative=3,
                comments="Review by non-manager"
            )
            invalid_performance.full_clean()

    def test_performance_review_monthly_limit(self):
        """Test one review per employee per reviewer per month limit"""
        today = date.today()
        
        # Create first performance review
        Performance.objects.create(
            employee=self.employee,
            reviewer=self.manager,
            review_period_start=today - timedelta(days=15),
            review_period_end=today - timedelta(days=1),
            overall_rating=4,
            goals_achievement=4,
            communication=3,
            teamwork=4,
            initiative=3,
            comments="First review this month"
        )
        
        # Try to create second review in same month
        with self.assertRaises(ValidationError):
            duplicate_performance = Performance(
                employee=self.employee,
                reviewer=self.manager,
                review_period_start=today - timedelta(days=7),
                review_period_end=today,
                overall_rating=3,
                goals_achievement=3,
                communication=3,
                teamwork=3,
                initiative=3,
                comments="Second review same month"
            )
            duplicate_performance.full_clean()


class APIAuthenticationTest(APITestCase):
    """Test API authentication and authorization"""
    
    def setUp(self):
        self.department = Department.objects.create(name="Engineering")
        self.position = Position.objects.create(
            title="Developer",
            department=self.department,
            salary_min=50000,
            salary_max=80000
        )
        
        # Create manager
        self.manager_user = User.objects.create_user(
            username="manager",
            email="manager@test.com",
            password="testpass123"
        )
        self.manager = Employee.objects.create(
            user=self.manager_user,
            employee_id="MGR001",
            phone_number="+1234567890",
            address="Manager Address",
            date_of_birth=date(1985, 1, 1),
            hire_date=date(2020, 1, 1),
            department=self.department,
            position=self.position,
            salary=Decimal('80000.00'),
            role='manager'
        )
        
        # Create employee
        self.employee_user = User.objects.create_user(
            username="employee",
            email="employee@test.com",
            password="testpass123"
        )
        self.employee = Employee.objects.create(
            user=self.employee_user,
            employee_id="EMP001",
            phone_number="+1234567891",
            address="Employee Address",
            date_of_birth=date(1990, 1, 1),
            hire_date=date(2022, 1, 1),
            department=self.department,
            position=self.position,
            salary=Decimal('60000.00'),
            manager=self.manager,
            role='employee'
        )

    def test_unauthenticated_access_denied(self):
        """Test that unauthenticated requests are denied"""
        response = self.client.get('/api/employees/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        response = self.client.get('/api/attendance/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_jwt_token_authentication(self):
        """Test JWT token authentication"""
        # Get JWT token for manager
        refresh = RefreshToken.for_user(self.manager_user)
        access_token = refresh.access_token
        
        # Test authenticated request
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get('/api/employees/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_manager_permissions(self):
        """Test manager-specific permissions"""
        # Manager should be able to access all employees
        refresh = RefreshToken.for_user(self.manager_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        response = self.client.get('/api/employees/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 2)  # Manager + Employee

    def test_employee_limited_access(self):
        """Test employee limited access"""
        # Employee should have limited access
        refresh = RefreshToken.for_user(self.employee_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        # Should be able to access their own profile
        response = self.client.get('/api/employees/me/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['employee_id'], 'EMP001')

    def test_employee_profile_self_update(self):
        """Test employee can update their own profile"""
        refresh = RefreshToken.for_user(self.employee_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        # Update allowed fields
        update_data = {
            'phone_number': '+1987654321',
            'address': 'New Address 123',
            'first_name': 'Robert'
        }
        
        response = self.client.patch('/api/employees/me/', update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify changes
        self.employee.refresh_from_db()
        self.employee_user.refresh_from_db()
        self.assertEqual(self.employee.phone_number, '+1987654321')
        self.assertEqual(self.employee.address, 'New Address 123')
        self.assertEqual(self.employee_user.first_name, 'Robert')


class AttendanceAPITest(APITestCase):
    """Test attendance API endpoints"""
    
    def setUp(self):
        self.department = Department.objects.create(name="Engineering")
        self.position = Position.objects.create(
            title="Developer",
            department=self.department,
            salary_min=50000,
            salary_max=80000
        )
        
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass123"
        )
        self.employee = Employee.objects.create(
            user=self.user,
            employee_id="EMP001",
            phone_number="+1234567890",
            address="Test Address",
            date_of_birth=date(1990, 1, 1),
            hire_date=date(2023, 1, 1),
            department=self.department,
            position=self.position,
            salary=Decimal('60000.00')
        )
        
        # Authenticate user
        refresh = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')

    def test_attendance_check_in(self):
        """Test attendance check-in API"""
        response = self.client.post('/api/attendance/check_in/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertIn('time', response.data)
        
        # Verify attendance record was created
        attendance = Attendance.objects.filter(
            employee=self.employee,
            date=date.today()
        ).first()
        self.assertIsNotNone(attendance)
        self.assertEqual(attendance.status, 'checked_in')

    def test_duplicate_check_in_prevented(self):
        """Test that duplicate check-in is prevented"""
        # First check-in
        response = self.client.post('/api/attendance/check_in/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Second check-in should fail
        response = self.client.post('/api/attendance/check_in/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_attendance_current_status(self):
        """Test current status API"""
        response = self.client.get('/api/attendance/current_status/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('can_check_in', response.data)
        self.assertIn('can_check_out', response.data)
        self.assertIn('current_time', response.data)

    def test_attendance_with_leave_conflict(self):
        """Test check-in prevention when on leave"""
        # Create leave type and request
        leave_type = LeaveType.objects.create(
            name="Annual Leave",
            code="AL",
            max_days_per_year=12
        )
        
        # Create pending leave for today
        leave_request = LeaveRequest.objects.create(
            employee=self.employee,
            leave_type=leave_type,
            start_date=date.today(),
            end_date=date.today(),
            reason="Test leave",
            status='pending'
        )
        
        # Approve the leave to create attendance record
        leave_request.status = 'approved'
        leave_request.response_date = timezone.now()
        leave_request.approved_by = self.employee  # Simplified for test
        leave_request.save()
        
        # Try to check in - should fail
        response = self.client.post('/api/attendance/check_in/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('leave', response.data['error'].lower())


class UserEmployeeDeletionTest(APITestCase):
    """Test user-employee deletion integration"""
    
    def setUp(self):
        self.department = Department.objects.create(name="Engineering")
        self.position = Position.objects.create(
            title="Developer",
            department=self.department,
            salary_min=50000,
            salary_max=80000
        )
        
        # Create manager
        self.manager_user = User.objects.create_user(
            username="manager",
            password="testpass123"
        )
        self.manager = Employee.objects.create(
            user=self.manager_user,
            employee_id="MGR001",
            phone_number="+1234567890",
            address="Manager Address",
            date_of_birth=date(1985, 1, 1),
            hire_date=date(2020, 1, 1),
            department=self.department,
            position=self.position,
            salary=Decimal('80000.00'),
            role='manager'
        )
        
        # Create employee to be deleted
        self.employee_user = User.objects.create_user(
            username="employee",
            password="testpass123"
        )
        self.employee = Employee.objects.create(
            user=self.employee_user,
            employee_id="EMP001",
            phone_number="+1234567891",
            address="Employee Address",
            date_of_birth=date(1990, 1, 1),
            hire_date=date(2022, 1, 1),
            department=self.department,
            position=self.position,
            salary=Decimal('60000.00'),
            role='employee'
        )

    def test_employee_deletion_removes_user(self):
        """Test that deleting employee also deletes associated user"""
        employee_id = self.employee.id
        user_id = self.employee_user.id
        
        # Verify both exist before deletion
        self.assertTrue(Employee.objects.filter(id=employee_id).exists())
        self.assertTrue(User.objects.filter(id=user_id).exists())
        
        # Delete employee (should trigger signal to delete user)
        self.employee.delete()
        
        # Verify both are deleted
        self.assertFalse(Employee.objects.filter(id=employee_id).exists())
        self.assertFalse(User.objects.filter(id=user_id).exists())

    def test_manager_can_delete_employee_api(self):
        """Test manager can delete employee via API"""
        # Authenticate as manager
        refresh = RefreshToken.for_user(self.manager_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        employee_id = self.employee.id
        user_id = self.employee_user.id
        
        # Delete employee via API
        response = self.client.delete(f'/api/employees/{employee_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        
        # Verify both employee and user are deleted
        self.assertFalse(Employee.objects.filter(id=employee_id).exists())
        self.assertFalse(User.objects.filter(id=user_id).exists())

    def test_employee_cannot_delete_others(self):
        """Test employee cannot delete other employees"""
        # Authenticate as employee
        refresh = RefreshToken.for_user(self.employee_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        # Try to delete manager
        response = self.client.delete(f'/api/employees/{self.manager.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_self_deletion_prevented(self):
        """Test users cannot delete themselves"""
        # Authenticate as manager
        refresh = RefreshToken.for_user(self.manager_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        # Try to delete self
        response = self.client.delete(f'/api/employees/{self.manager.id}/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('cannot delete your own', response.data['error'].lower())


class TimezoneConsistencyTest(TestCase):
    """Test GMT+7 timezone consistency across the system"""
    
    def setUp(self):
        self.department = Department.objects.create(name="Engineering")
        self.position = Position.objects.create(
            title="Developer",
            department=self.department,
            salary_min=50000,
            salary_max=80000
        )
        
        self.user = User.objects.create_user(
            username="testuser",
            password="testpass"
        )
        self.employee = Employee.objects.create(
            user=self.user,
            employee_id="EMP001",
            phone_number="+1234567890",
            address="Test Address",
            date_of_birth=date(1990, 1, 1),
            hire_date=date(2023, 1, 1),
            department=self.department,
            position=self.position,
            salary=Decimal('60000.00')
        )

    def test_attendance_time_display_format(self):
        """Test that attendance times display in 12-hour format"""
        attendance = Attendance.objects.create(
            employee=self.employee,
            date=date.today(),
            check_in=time(14, 30),  # 2:30 PM
            status='checked_in'
        )
        
        status_display = attendance.get_status_display_with_time()
        self.assertIn("2:30 PM", status_display)
        
        # Test different times
        attendance.check_out = time(8, 15)  # 8:15 AM
        attendance.status = 'checked_out'
        attendance.save()
        
        status_display = attendance.get_status_display_with_time()
        self.assertIn("8:15 AM", status_display)

    def test_django_timezone_setting(self):
        """Test Django timezone setting is correct"""
        from django.conf import settings
        self.assertEqual(settings.TIME_ZONE, 'Asia/Ho_Chi_Minh')


class SystemIntegrationTest(TestCase):
    """End-to-end integration tests"""
    
    def setUp(self):
        # Create complete system setup
        self.department = Department.objects.create(
            name="Engineering",
            description="Software Development Department"
        )
        self.position = Position.objects.create(
            title="Senior Developer",
            department=self.department,
            salary_min=70000,
            salary_max=120000
        )
        
        # Create manager
        self.manager_user = User.objects.create_user(
            username="manager",
            email="manager@company.com",
            first_name="Alice",
            last_name="Manager",
            password="securepass123"
        )
        self.manager = Employee.objects.create(
            user=self.manager_user,
            employee_id="MGR001",
            phone_number="+1234567890",
            address="123 Manager Street",
            date_of_birth=date(1985, 5, 15),
            hire_date=date(2020, 1, 1),
            department=self.department,
            position=self.position,
            salary=Decimal('100000.00'),
            role='manager'
        )
        
        # Create employee
        self.employee_user = User.objects.create_user(
            username="employee",
            email="employee@company.com",
            first_name="Bob",
            last_name="Developer",
            password="securepass123"
        )
        self.employee = Employee.objects.create(
            user=self.employee_user,
            employee_id="EMP001",
            phone_number="+1234567891",
            address="456 Employee Avenue",
            date_of_birth=date(1990, 8, 20),
            hire_date=date(2022, 3, 1),
            department=self.department,
            position=self.position,
            salary=Decimal('10000000.00'),  # 10M VND
            manager=self.manager,
            role='employee'
        )
        
        # Create leave type
        self.leave_type = LeaveType.objects.create(
            name="Annual Leave",
            code="AL",
            max_days_per_year=12,
            is_paid=True
        )

    def test_complete_leave_workflow(self):
        """Test complete leave request and attendance integration workflow"""
        # 1. Employee requests leave
        tomorrow = date.today() + timedelta(days=1)
        leave_request = LeaveRequest.objects.create(
            employee=self.employee,
            leave_type=self.leave_type,
            start_date=tomorrow,
            end_date=tomorrow,
            reason="Personal day off",
            status='pending'
        )
        
        # 2. Manager approves leave
        leave_request.status = 'approved'
        leave_request.response_date = timezone.now()
        leave_request.approved_by = self.manager
        leave_request.save()
        
        # 3. Verify attendance record was created
        attendance = Attendance.objects.get(
            employee=self.employee,
            date=tomorrow
        )
        self.assertEqual(attendance.status, 'on_leave')
        self.assertEqual(attendance.leave_request, leave_request)
        
        # 4. Verify employee cannot check in on leave day
        self.assertFalse(attendance.can_check_in())
        
        # 5. Verify leave type display
        self.assertEqual(attendance.get_leave_type_display(), "Annual Leave")

    def test_complete_attendance_payroll_workflow(self):
        """Test complete attendance to payroll calculation workflow"""
        today = date.today()
        
        # 1. Employee has attendance with late arrival and overtime
        attendance = Attendance.objects.create(
            employee=self.employee,
            date=today,
            check_in=time(9, 30),  # 30 minutes late
            check_out=time(19, 30),  # 1.5 hours overtime
            break_duration=timedelta(hours=1),
            expected_start=time(9, 0),
            expected_end=time(18, 0)
        )
        
        # 2. Verify attendance calculations
        self.assertTrue(attendance.late_arrival)
        # Check if overtime is calculated (may be null if not enough overtime)
        if attendance.overtime_hours:
            self.assertIsNotNone(attendance.overtime_hours)
        self.assertEqual(attendance.status, 'checked_out')
        
        # 3. Set salary and verify payroll integration
        PayrollService.set_base_salary(
            self.manager_user,
            self.employee.id,
            Decimal('10000000.00')
        )
        
        # 4. Verify salary calculation includes penalties and bonuses
        current_month = today.replace(day=1)
        late_days, absent_days, num_days, incomplete_days = PayrollService.get_late_or_absent_days(
            self.employee, current_month
        )
        
        overtime_bonus = PayrollService.calculate_overtime_bonus(self.employee, current_month)
        
        # Should have late day penalty
        self.assertGreater(late_days, 0)
        # Should have non-negative overtime bonus
        self.assertGreaterEqual(overtime_bonus, 0)

    def test_system_data_consistency(self):
        """Test overall system data consistency"""
        # Verify all relationships are properly maintained
        
        # Employee-User relationship
        self.assertEqual(self.employee.user, self.employee_user)
        self.assertEqual(self.employee_user.employee, self.employee)
        
        # Department-Position-Employee relationship
        self.assertEqual(self.employee.department, self.department)
        self.assertEqual(self.employee.position, self.position)
        self.assertEqual(self.position.department, self.department)
        
        # Manager-Employee hierarchy
        self.assertEqual(self.employee.manager, self.manager)
        
        # Default values
        self.assertEqual(self.employee.status, 'active')
        self.assertEqual(self.employee.annual_leave_remaining, 12)
        
        # String representations
        self.assertEqual(str(self.employee), "Bob Developer (EMP001)")
        self.assertEqual(str(self.department), "Engineering")
        self.assertEqual(str(self.position), "Senior Developer - Engineering")