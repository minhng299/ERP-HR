from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from hrms.models import Employee, Department, Position


class Command(BaseCommand):
    help = 'Test the user-employee deletion mechanism'

    def handle(self, *args, **options):
        # Create a test user and employee
        self.stdout.write('Creating test user and employee...')
        
        # Create test user
        test_user = User.objects.create_user(
            username='test_delete',
            email='test@delete.com',
            first_name='Test',
            last_name='Delete',
            password='testpass123'
        )
        
        # Get first department and position for the test
        department = Department.objects.first()
        position = Position.objects.first()
        
        if not department or not position:
            self.stdout.write(self.style.ERROR('No department or position found. Please create some first.'))
            test_user.delete()
            return
        
        # Create test employee
        test_employee = Employee.objects.create(
            user=test_user,
            employee_id='TEST001',
            phone_number='+1234567890',
            address='Test Address',
            date_of_birth='1990-01-01',
            hire_date='2025-01-01',
            department=department,
            position=position,
            salary=50000.00,
            role='employee'
        )
        
        self.stdout.write(f'Created Employee: {test_employee} with User: {test_user.username}')
        
        # Check that both exist
        user_exists_before = User.objects.filter(id=test_user.id).exists()
        employee_exists_before = Employee.objects.filter(id=test_employee.id).exists()
        
        self.stdout.write(f'Before deletion - User exists: {user_exists_before}, Employee exists: {employee_exists_before}')
        
        # Store IDs for checking after deletion
        user_id = test_user.id
        employee_id = test_employee.id
        
        # Delete the employee (this should trigger the signal to delete the user)
        self.stdout.write('Deleting employee...')
        test_employee.delete()
        
        # Check that both are deleted
        user_exists_after = User.objects.filter(id=user_id).exists()
        employee_exists_after = Employee.objects.filter(id=employee_id).exists()
        
        self.stdout.write(f'After deletion - User exists: {user_exists_after}, Employee exists: {employee_exists_after}')
        
        if not user_exists_after and not employee_exists_after:
            self.stdout.write(self.style.SUCCESS('✅ SUCCESS: Both user and employee were deleted properly!'))
        else:
            self.stdout.write(self.style.ERROR('❌ FAILURE: Deletion mechanism is not working properly!'))
            if user_exists_after:
                self.stdout.write(f'  - Orphaned user still exists with ID: {user_id}')
            if employee_exists_after:
                self.stdout.write(f'  - Employee still exists with ID: {employee_id} (this should not happen)')
        
        # Final relationship check
        self.stdout.write('\nRunning relationship check after test...')
        from django.core.management import call_command
        call_command('check_user_employee_relationships')