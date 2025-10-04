from django.test import TestCase
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Employee, Department, Position, LeaveRequest, LeaveType, Performance


class EmployeeModelTest(TestCase):
    def setUp(self):
        self.department = Department.objects.create(
            name="Engineering",
            description="Software Development"
        )
        self.position = Position.objects.create(
            title="Software Engineer",
            department=self.department,
            salary_min=50000,
            salary_max=80000
        )
        self.user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            first_name="Test",
            last_name="User"
        )

    def test_employee_creation(self):
        employee = Employee.objects.create(
            user=self.user,
            employee_id="EMP001",
            phone_number="+1234567890",
            address="123 Test St",
            date_of_birth="1990-01-01",
            hire_date="2023-01-01",
            department=self.department,
            position=self.position,
            salary=60000
        )
        self.assertEqual(employee.employee_id, "EMP001")
        self.assertEqual(employee.status, "active")
        self.assertEqual(employee.annual_leave_remaining, 12)

    def test_employee_str_representation(self):
        employee = Employee.objects.create(
            user=self.user,
            employee_id="EMP001",
            phone_number="+1234567890",
            address="123 Test St",
            date_of_birth="1990-01-01",
            hire_date="2023-01-01",
            department=self.department,
            position=self.position,
            salary=60000
        )
        expected_str = f"{self.user.first_name} {self.user.last_name} ({employee.employee_id})"
        self.assertEqual(str(employee), expected_str)


class LeaveRequestModelTest(TestCase):
    def setUp(self):
        self.department = Department.objects.create(name="Engineering")
        self.position = Position.objects.create(
            title="Engineer",
            department=self.department,
            salary_min=50000,
            salary_max=80000
        )
        self.user = User.objects.create_user(username="testuser")
        self.employee = Employee.objects.create(
            user=self.user,
            employee_id="EMP001",
            phone_number="+1234567890",
            address="123 Test St",
            date_of_birth="1990-01-01",
            hire_date="2023-01-01",
            department=self.department,
            position=self.position,
            salary=60000
        )
        self.leave_type = LeaveType.objects.create(
            name="Annual Leave",
            code="AL",
            max_days_per_year=12
        )

    def test_leave_request_validation_start_after_end(self):
        leave_request = LeaveRequest(
            employee=self.employee,
            leave_type=self.leave_type,
            start_date="2023-12-31",
            end_date="2023-12-01",
            reason="Test leave",
            status="pending"
        )
        with self.assertRaises(ValidationError):
            leave_request.full_clean()

    def test_leave_request_days_calculation(self):
        leave_request = LeaveRequest.objects.create(
            employee=self.employee,
            leave_type=self.leave_type,
            start_date="2023-12-01",
            end_date="2023-12-03",
            reason="Test leave",
            status="pending"
        )
        self.assertEqual(leave_request.days_requested, 3)


class PerformanceModelTest(TestCase):
    def setUp(self):
        self.department = Department.objects.create(name="Engineering")
        self.position = Position.objects.create(
            title="Engineer",
            department=self.department,
            salary_min=50000,
            salary_max=80000
        )
        
        # Create employee
        self.user_employee = User.objects.create_user(username="employee")
        self.employee = Employee.objects.create(
            user=self.user_employee,
            employee_id="EMP001",
            phone_number="+1234567890",
            address="123 Test St",
            date_of_birth="1990-01-01",
            hire_date="2023-01-01",
            department=self.department,
            position=self.position,
            salary=60000,
            role="employee"
        )
        
        # Create manager
        self.user_manager = User.objects.create_user(username="manager")
        self.manager = Employee.objects.create(
            user=self.user_manager,
            employee_id="MGR001",
            phone_number="+1234567891",
            address="456 Manager St",
            date_of_birth="1985-01-01",
            hire_date="2020-01-01",
            department=self.department,
            position=self.position,
            salary=80000,
            role="manager"
        )

    def test_performance_reviewer_cannot_be_self(self):
        performance = Performance(
            employee=self.employee,
            reviewer=self.employee,  # Same as employee
            review_period_start="2023-01-01",
            review_period_end="2023-01-31",
            overall_rating=4,
            goals_achievement=4,
            communication=4,
            teamwork=4,
            initiative=4,
            comments="Good work"
        )
        with self.assertRaises(ValidationError):
            performance.full_clean()

    def test_performance_reviewer_must_be_manager(self):
        # Create another employee (not manager)
        user_employee2 = User.objects.create_user(username="employee2")
        employee2 = Employee.objects.create(
            user=user_employee2,
            employee_id="EMP002",
            phone_number="+1234567892",
            address="789 Employee St",
            date_of_birth="1992-01-01",
            hire_date="2023-02-01",
            department=self.department,
            position=self.position,
            salary=55000,
            role="employee"
        )
        
        performance = Performance(
            employee=self.employee,
            reviewer=employee2,  # Employee, not manager
            review_period_start="2023-01-01",
            review_period_end="2023-01-31",
            overall_rating=4,
            goals_achievement=4,
            communication=4,
            teamwork=4,
            initiative=4,
            comments="Good work"
        )
        with self.assertRaises(ValidationError):
            performance.full_clean()


class APIEndpointTest(APITestCase):
    def setUp(self):
        self.department = Department.objects.create(name="Engineering")
        self.position = Position.objects.create(
            title="Engineer",
            department=self.department,
            salary_min=50000,
            salary_max=80000
        )
        
        # Create manager user
        self.manager_user = User.objects.create_user(
            username="manager",
            password="testpass123"
        )
        self.manager = Employee.objects.create(
            user=self.manager_user,
            employee_id="MGR001",
            phone_number="+1234567890",
            address="123 Manager St",
            date_of_birth="1985-01-01",
            hire_date="2020-01-01",
            department=self.department,
            position=self.position,
            salary=80000,
            role="manager"
        )

    def test_get_employees_requires_authentication(self):
        response = self.client.get('/api/employees/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_manager_can_access_employees(self):
        # Get JWT token for manager
        refresh = RefreshToken.for_user(self.manager_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        response = self.client.get('/api/employees/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_dashboard_stats(self):
        refresh = RefreshToken.for_user(self.manager_user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
        
        response = self.client.get('/api/employees/dashboard_stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_employees', response.data)
        self.assertIn('departments', response.data)