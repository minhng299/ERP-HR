from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from hrms.models import Employee


class Command(BaseCommand):
    help = 'Clean up orphaned User records that have no associated Employee'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run', 
            action='store_true', 
            help='Show what would be deleted without actually deleting'
        )
        parser.add_argument(
            '--exclude-superusers', 
            action='store_true', 
            help='Exclude superusers from cleanup'
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        exclude_superusers = options['exclude_superusers']
        
        # Find users that don't have an associated employee
        user_query = User.objects.exclude(employee__isnull=False)
        
        if exclude_superusers:
            user_query = user_query.filter(is_superuser=False)
        
        orphaned_users = user_query.all()
        
        if not orphaned_users:
            self.stdout.write(self.style.SUCCESS('No orphaned user records found.'))
            return
        
        self.stdout.write(f'Found {len(orphaned_users)} orphaned user records:')
        
        for user in orphaned_users:
            user_info = f'- ID: {user.id}, Username: {user.username}, Email: {user.email}'
            if user.is_superuser:
                user_info += ' (SUPERUSER)'
            if user.is_staff:
                user_info += ' (STAFF)'
            self.stdout.write(user_info)
        
        if dry_run:
            self.stdout.write(self.style.WARNING('\nDRY RUN: No users were deleted.'))
            self.stdout.write('Run without --dry-run to actually delete these users.')
        else:
            # Confirm deletion
            confirm = input('\nAre you sure you want to delete these users? (yes/no): ')
            
            if confirm.lower() in ['yes', 'y']:
                deleted_count = 0
                for user in orphaned_users:
                    try:
                        username = user.username
                        user.delete()
                        deleted_count += 1
                        self.stdout.write(f'Deleted user: {username}')
                    except Exception as e:
                        self.stdout.write(
                            self.style.ERROR(f'Failed to delete user {user.username}: {str(e)}')
                        )
                
                self.stdout.write(
                    self.style.SUCCESS(f'\nSuccessfully deleted {deleted_count} orphaned user records.')
                )
            else:
                self.stdout.write(self.style.WARNING('Operation cancelled.'))
        
        # Show remaining statistics
        remaining_users = User.objects.count()
        users_with_employees = User.objects.filter(employee__isnull=False).count()
        
        self.stdout.write(f'\nStatistics:')
        self.stdout.write(f'- Total users remaining: {remaining_users}')
        self.stdout.write(f'- Users with employee records: {users_with_employees}')
        self.stdout.write(f'- Users without employee records: {remaining_users - users_with_employees}')