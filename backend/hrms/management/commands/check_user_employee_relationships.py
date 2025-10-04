from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from hrms.models import Employee


class Command(BaseCommand):
    help = 'Check the relationship between User and Employee tables'

    def handle(self, *args, **options):
        # Count statistics
        total_users = User.objects.count()
        total_employees = Employee.objects.count()
        users_with_employees = User.objects.filter(employee__isnull=False).count()
        orphaned_users = total_users - users_with_employees
        
        self.stdout.write(self.style.SUCCESS('=== User-Employee Relationship Report ===\n'))
        
        # Basic statistics
        self.stdout.write(f'Total Users: {total_users}')
        self.stdout.write(f'Total Employees: {total_employees}')
        self.stdout.write(f'Users with Employee records: {users_with_employees}')
        self.stdout.write(f'Orphaned Users (no Employee): {orphaned_users}')
        
        # Check for issues
        if orphaned_users > 0:
            self.stdout.write(self.style.WARNING(f'\n⚠️  Found {orphaned_users} orphaned user records!'))
            
            # Show orphaned users
            orphaned_user_list = User.objects.exclude(employee__isnull=False)[:10]  # Show first 10
            self.stdout.write('\nOrphaned Users (showing first 10):')
            for user in orphaned_user_list:
                user_info = f'- ID: {user.id}, Username: {user.username}, Email: {user.email}'
                if user.is_superuser:
                    user_info += ' (SUPERUSER)'
                if user.is_staff:
                    user_info += ' (STAFF)'
                self.stdout.write(user_info)
            
            if orphaned_users > 10:
                self.stdout.write(f'... and {orphaned_users - 10} more')
            
            self.stdout.write('\nTo clean up orphaned users, run:')
            self.stdout.write('  py manage.py cleanup_orphaned_users --dry-run  # Preview')
            self.stdout.write('  py manage.py cleanup_orphaned_users            # Actually delete')
        else:
            self.stdout.write(self.style.SUCCESS('\n✅ All users have corresponding employee records!'))
        
        # Check for employees without users (should not happen with proper OneToOne relationship)
        employees_without_users = Employee.objects.filter(user__isnull=True).count()
        if employees_without_users > 0:
            self.stdout.write(self.style.ERROR(f'\n❌ Found {employees_without_users} employees without user records! This should not happen.'))
        
        # Show relationship integrity
        self.stdout.write('\n=== Relationship Integrity ===')
        
        # Check OneToOne constraint violations
        duplicate_users = []
        for user in User.objects.all():
            employee_count = Employee.objects.filter(user=user).count()
            if employee_count > 1:
                duplicate_users.append((user, employee_count))
        
        if duplicate_users:
            self.stdout.write(self.style.ERROR(f'❌ Found {len(duplicate_users)} users with multiple employee records:'))
            for user, count in duplicate_users:
                self.stdout.write(f'  - User {user.username} has {count} employee records')
        else:
            self.stdout.write(self.style.SUCCESS('✅ No duplicate user-employee relationships found'))
        
        # Show some example relationships
        self.stdout.write('\n=== Sample Relationships ===')
        sample_employees = Employee.objects.select_related('user')[:5]
        for emp in sample_employees:
            self.stdout.write(f'Employee {emp.employee_id} ({emp.user.first_name} {emp.user.last_name}) ↔ User {emp.user.username}')