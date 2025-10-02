from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import date, timedelta
from hrms.models import Employee, LeaveRequest, LeaveType, Attendance


class Command(BaseCommand):
    help = 'Test the integration between attendance system and leave requests'

    def add_arguments(self, parser):
        parser.add_argument('--employee-id', type=int, required=True, help='Employee ID to test with')
        parser.add_argument('--days', type=int, default=3, help='Number of leave days to create (default: 3)')

    def handle(self, *args, **options):
        employee_id = options['employee_id']
        days = options['days']
        
        try:
            employee = Employee.objects.get(id=employee_id)
        except Employee.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Employee with ID {employee_id} does not exist'))
            return

        # Get or create a leave type
        leave_type, created = LeaveType.objects.get_or_create(
            name='Annual Leave',
            defaults={
                'code': 'AL',
                'max_days_per_year': 12,
                'is_paid': True,
                'description': 'Annual Leave for testing'
            }
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'Created leave type: {leave_type.name}'))

        # Create a leave request for the next few days
        start_date = date.today() + timedelta(days=1)
        end_date = start_date + timedelta(days=days-1)
        
        # Create the leave request
        leave_request = LeaveRequest.objects.create(
            employee=employee,
            leave_type=leave_type,
            start_date=start_date,
            end_date=end_date,
            reason='Testing leave and attendance integration',
            status='pending'
        )
        
        self.stdout.write(self.style.SUCCESS(f'Created leave request: {leave_request}'))
        
        # Approve the leave request (this should automatically create attendance records)
        leave_request.status = 'approved'
        leave_request.response_date = timezone.now()
        leave_request.approved_by = employee  # Self-approval for testing
        leave_request.save()
        
        self.stdout.write(self.style.SUCCESS(f'Approved leave request'))
        
        # Check if attendance records were created
        attendance_records = Attendance.objects.filter(
            employee=employee,
            date__range=[start_date, end_date],
            status='on_leave',
            leave_request=leave_request
        )
        
        self.stdout.write(self.style.SUCCESS(f'Created {attendance_records.count()} attendance records with "on_leave" status'))
        
        # Display the created records
        for attendance in attendance_records:
            self.stdout.write(f'  - {attendance.date}: {attendance.get_status_display_with_time()}')
        
        # Test trying to check in on a leave day
        self.stdout.write('\n--- Testing check-in prevention on leave days ---')
        for attendance in attendance_records:
            self.stdout.write(f'Date {attendance.date}:')
            self.stdout.write(f'  - Status: {attendance.status}')
            self.stdout.write(f'  - Is on leave: {attendance.is_on_leave()}')
            self.stdout.write(f'  - Leave type: {attendance.get_leave_type_display()}')
            self.stdout.write(f'  - Can check in: {attendance.can_check_in()}')
            self.stdout.write('')
        
        # Test rejecting the leave request (should update attendance records)
        self.stdout.write('--- Testing leave rejection ---')
        leave_request.status = 'rejected'
        leave_request.save()
        
        # Refresh attendance records
        updated_records = Attendance.objects.filter(
            employee=employee,
            date__range=[start_date, end_date]
        )
        
        self.stdout.write(f'After rejecting leave:')
        for attendance in updated_records:
            self.stdout.write(f'  - {attendance.date}: Status = {attendance.status}, Leave = {attendance.leave_request}')
        
        self.stdout.write(self.style.SUCCESS('\nLeave integration test completed successfully!'))
        
        # Cleanup
        leave_request.delete()
        updated_records.delete()
        self.stdout.write(self.style.WARNING('Cleaned up test data'))