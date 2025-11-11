from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
from django.utils.text import slugify
from django.db.models.signals import pre_save, post_delete
from django.dispatch import receiver
from datetime import time, timedelta
from datetime import timedelta


class Department(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name

class Position(models.Model):
    title = models.CharField(max_length=100)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    description = models.TextField(blank=True)
    salary_min = models.DecimalField(max_digits=10, decimal_places=2)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.title} - {self.department.name}"

class Employee(models.Model):
    EMPLOYMENT_STATUS = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('terminated', 'Terminated'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    employee_id = models.CharField(max_length=20, unique=True)
    phone_regex = RegexValidator(regex=r'^\+?1?\d{9,15}$')
    phone_number = models.CharField(validators=[phone_regex], max_length=17)
    address = models.TextField()
    date_of_birth = models.DateField()
    hire_date = models.DateField()
    department = models.ForeignKey(Department, on_delete=models.CASCADE)
    position = models.ForeignKey(Position, on_delete=models.CASCADE)
    salary = models.DecimalField(max_digits=10, decimal_places=2)
    net_salary = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="Lương thực nhận sau khi bị trừ")
    manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=EMPLOYMENT_STATUS, default='active')
    profile_picture = models.URLField(blank=True)
    annual_leave_remaining = models.IntegerField(default=12)
    ROLE_CHOICES = [
        ('manager', 'Manager'),
        ('employee', 'Employee'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee')
    
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} ({self.employee_id})"

    @property
    def department_name(self):
        return self.department.name if self.department else None

class Attendance(models.Model):
    STATUS_CHOICES = [
        ('not_started', 'Not Started'),
        ('checked_in', 'Checked In'),
        ('on_break', 'On Break'),
        ('checked_out', 'Checked Out'),
        ('incomplete', 'Incomplete'),
        ('on_leave', 'On Leave'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    date = models.DateField()
    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)
    break_duration = models.DurationField(default=timedelta(hours=0))
    break_duration = models.DurationField(default=timedelta())  
    total_hours = models.DurationField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    # New fields for enhanced tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_started')
    location = models.CharField(max_length=255, blank=True, help_text='IP address or location info')
    late_arrival = models.BooleanField(default=False)
    early_departure = models.BooleanField(default=False)
    overtime_hours = models.DurationField(null=True, blank=True)
    
    # Break tracking
    break_start = models.TimeField(null=True, blank=True)
    break_end = models.TimeField(null=True, blank=True)
    
    # Expected work schedule (can be overridden per employee)
    expected_start = models.TimeField(default=time(9, 0))
    expected_end = models.TimeField(default=time(17, 0))
    
    # Leave integration
    leave_request = models.ForeignKey('LeaveRequest', on_delete=models.SET_NULL, null=True, blank=True, help_text='Associated leave request if on leave')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('employee', 'date')
        ordering = ['-date', '-created_at']
    
    def save(self, *args, **kwargs):
        # Auto-calculate total hours if both check_in and check_out exist
        if self.check_in and self.check_out:
            from datetime import datetime, timedelta
            check_in_dt = datetime.combine(self.date, self.check_in)
            check_out_dt = datetime.combine(self.date, self.check_out)
            total = check_out_dt - check_in_dt - self.break_duration
            self.total_hours = total
            
            # Calculate overtime
            expected_duration = datetime.combine(self.date, self.expected_end) - datetime.combine(self.date, self.expected_start)
            if total > expected_duration:
                self.overtime_hours = total - expected_duration
            
            # Check for early departure
            if self.check_out < self.expected_end:
                self.early_departure = True
            
            # Update status to checked_out
            self.status = 'checked_out'
        
        # Check for late arrival when check_in is set
        if self.check_in and self.check_in > self.expected_start:
            self.late_arrival = True
            
        super().save(*args, **kwargs)
    
    def is_late(self):
        """Check if employee arrived late"""
        return self.check_in and self.check_in > self.expected_start
    
    def is_early_departure(self):
        """Check if employee left early"""
        return self.check_out and self.check_out < self.expected_end
    
    def get_work_duration(self):
        """Get actual work duration excluding breaks"""
        if self.check_in and self.check_out:
            from datetime import datetime
            check_in_dt = datetime.combine(self.date, self.check_in)
            check_out_dt = datetime.combine(self.date, self.check_out)
            return check_out_dt - check_in_dt - self.break_duration
        return None
    
    def get_status_display_with_time(self):
        try:
            if self.status == 'checked_in' and self.check_in:
                local_time = self.check_in
                return f"Checked In at {local_time.strftime('%I:%M %p')}"
            elif self.status == 'checked_out' and self.check_out:
                local_time = self.check_out
                return f"Checked Out at {local_time.strftime('%I:%M %p')}"
            elif self.status == 'on_break' and self.break_start:
                local_time = self.break_start
                return f"On Break since {local_time.strftime('%I:%M %p')}"
            elif self.status == 'on_leave' and self.leave_request:
                return f"On {self.leave_request.leave_type.name} Leave"
            return self.get_status_display()
        except Exception as e:
            return self.get_status_display()
    
    def can_check_in(self):
        """Check if employee can check in"""
        return self.status in ['not_started', 'incomplete']
    
    def can_check_out(self):
        """Check if employee can check out"""
        return self.status in ['checked_in', 'on_break']
    
    def can_start_break(self):
        """Check if employee can start break"""
        return self.status == 'checked_in'
    
    def can_end_break(self):
        """Check if employee can end break"""
        return self.status == 'on_break'
    
    def is_on_leave(self):
        """Check if employee is on approved leave for this date"""
        if self.leave_request and self.leave_request.status == 'approved':
            return self.leave_request.start_date <= self.date <= self.leave_request.end_date
        return False
    
    def get_leave_type_display(self):
        """Get the leave type name if on leave"""
        if self.is_on_leave():
            return self.leave_request.leave_type.name
        return None
    
    @classmethod
    def create_leave_attendance(cls, employee, leave_request):
        """Create attendance records for approved leave days"""
        from datetime import timedelta
        attendances = []
        current_date = leave_request.start_date
        
        while current_date <= leave_request.end_date:
            # Only create for working days (Monday to Friday)
            if current_date.weekday() < 5:  # 0-4 are Monday to Friday
                attendance, created = cls.objects.get_or_create(
                    employee=employee,
                    date=current_date,
                    defaults={
                        'status': 'on_leave',
                        'leave_request': leave_request,
                        'notes': f'On {leave_request.leave_type.name} leave',
                        'break_duration': timedelta(hours=0),
                        'total_hours': None,
                        'overtime_hours': None
                    }
                )
                if not created and attendance.status in ['not_started', 'incomplete']:
                    # Update existing record to leave status
                    attendance.status = 'on_leave'
                    attendance.leave_request = leave_request
                    attendance.notes = f'On {leave_request.leave_type.name} leave'
                    attendance.save()
                attendances.append(attendance)
            current_date += timedelta(days=1)
        
        return attendances
    
    def __str__(self):
        return f"{self.employee.user.get_full_name()} - {self.date} ({self.get_status_display()})"

    @property
    def hours_worked_display(self):
        """Display total hours in readable format"""
        try:
            if self.total_hours:
                if hasattr(self.total_hours, 'total_seconds'):
                    # It's a proper timedelta object
                    total_seconds = int(self.total_hours.total_seconds())
                    hours = total_seconds // 3600
                    minutes = (total_seconds % 3600) // 60
                    return f"{hours}h {minutes}m"
                else:
                    # It might be a string, try to parse it or return as is
                    return str(self.total_hours)
            return "0h 0m"
        except Exception as e:
            return "0h 0m"

class LeaveType(models.Model):
    name = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=10, unique=True, blank=True, null=True)
    # days_allowed = models.IntegerField()
    description = models.TextField(blank=True)
    max_days_per_year = models.IntegerField(default=12)
    is_paid = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name

class LeavePenalty(models.Model):
    leave_type = models.ForeignKey('LeaveType', on_delete=models.CASCADE, related_name='penalties')
    penalty_percent = models.DecimalField(max_digits=5, decimal_places=2, help_text='Phần trăm phạt lương khi nghỉ loại này (VD: 50.00 cho 50%)')

    def __str__(self):
        return f"{self.leave_type.name} - {self.penalty_percent}%"

@receiver(pre_save, sender=LeaveType)
def generate_code(sender, instance, **kwargs):
        if not instance.code:
            instance.code = slugify(instance.name)[:10].upper()

class LeaveRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    days_requested = models.IntegerField(blank=True, null=True)
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    approved_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_leaves')
    request_date = models.DateTimeField(auto_now_add=True)
    response_date = models.DateTimeField(null=True, blank=True)
    comments = models.TextField(blank=True)

    def clean(self):
        if self.start_date > self.end_date:
            raise ValidationError("Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.")

        # Tính số ngày nghỉ không bao gồm Thứ Bảy và Chủ Nhật
        if not self.days_requested:
            current_day = self.start_date
            total_days = 0
            while current_day <= self.end_date:
                if current_day.weekday() < 5:  # 0 = Thứ Hai, ..., 4 = Thứ Sáu
                    total_days += 1
                current_day += timedelta(days=1)
            self.days_requested = total_days

        if self.status == 'approved' and self.days_requested > self.employee.annual_leave_remaining:
            raise ValidationError("Không đủ số ngày nghỉ còn lại.")

    def save(self, *args, **kwargs):
        self.full_clean()
        
        # Track if this is a status change to approved
        was_approved = False
        if self.pk:
            old_instance = LeaveRequest.objects.get(pk=self.pk)
            was_approved = old_instance.status != 'approved' and self.status == 'approved'
        else:
            was_approved = self.status == 'approved'
        
        if self.status == 'approved' and self.response_date and self.approved_by:
            if self.leave_type.code == 'AL':  # Annual Leave
                self.employee.annual_leave_remaining -= self.days_requested
                self.employee.save()
            
            # Create attendance records for approved leave days
            if was_approved:
                Attendance.create_leave_attendance(self.employee, self)
        
        # If leave was rejected or cancelled, remove leave status from attendance
        elif self.status in ['rejected', 'cancelled'] and self.pk:
            Attendance.objects.filter(
                employee=self.employee,
                leave_request=self,
                status='on_leave'
            ).update(
                status='not_started',
                leave_request=None,
                notes=''
            )
        
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.employee} - {self.leave_type.name} ({self.status})"


class Performance(models.Model):
    RATING_CHOICES = [
        (1, 'Poor'),
        (2, 'Below Average'),
        (3, 'Average'),
        (4, 'Above Average'),
        (5, 'Excellent'),
    ]

    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('submitted', 'Submitted'),
        ('feedback', 'Feedback'),
        ('finalized', 'Finalized'),
    ]

    employee = models.ForeignKey('Employee', on_delete=models.CASCADE, related_name='performance_reviews')
    reviewer = models.ForeignKey('Employee', on_delete=models.CASCADE, related_name='reviewed_performances')
    review_period_start = models.DateField()
    review_period_end = models.DateField()
    overall_rating = models.IntegerField(choices=RATING_CHOICES)
    goals_achievement = models.IntegerField(choices=RATING_CHOICES)
    communication = models.IntegerField(choices=RATING_CHOICES)
    teamwork = models.IntegerField(choices=RATING_CHOICES)
    initiative = models.IntegerField(choices=RATING_CHOICES)
    comments = models.TextField()
    employee_comments = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Performance Review: {self.employee.user.get_full_name()} by {self.reviewer.user.get_full_name()} ({self.review_period_start} - {self.review_period_end}) - Status: {self.status}"

    def clean(self):
        # 1. Ngày bắt đầu < ngày kết thúc
        if self.review_period_start >= self.review_period_end:
            raise ValidationError("Review period start date must be before the end date.")

        # 2. Reviewer không được là chính employee
        if self.reviewer == self.employee:
            raise ValidationError("Reviewer cannot review themselves.")

        # 3. Reviewer phải là Manager
        if self.reviewer.role.lower() != 'manager':
            raise ValidationError("Reviewer must be a Manager.")

        # 4. Reviewer và employee phải cùng department
        if self.reviewer.department != self.employee.department:
            raise ValidationError("Reviewer and employee must belong to the same department.")

        # 5. Reviewer không được review cùng employee nhiều hơn 1 lần/tháng
        month_start = self.review_period_start.replace(day=1)
        if self.review_period_start.month == 12:
            next_month_start = self.review_period_start.replace(year=self.review_period_start.year + 1, month=1, day=1)
        else:
            next_month_start = self.review_period_start.replace(month=self.review_period_start.month + 1, day=1)

        overlapping_reviews = Performance.objects.filter(
            employee=self.employee,
            reviewer=self.reviewer,
            review_period_start__gte=month_start,
            review_period_start__lt=next_month_start,
        )
        if self.pk:
            overlapping_reviews = overlapping_reviews.exclude(pk=self.pk)

        if overlapping_reviews.exists():
            raise ValidationError("This reviewer has already reviewed this employee in the same month.")

        # 6. Check status transition nếu update
        if self.pk:
            valid_transitions = {
                'draft': ['submitted'],
                'submitted': ['feedback', 'finalized'],  # manager có thể finalize hoặc chuyển sang feedback để employee phản hồi
                'feedback': ['submitted'],               # manager chỉnh sửa lại sau khi employee feedback
                'finalized': [],
            }
            prev_status = Performance.objects.get(pk=self.pk).status
            new_status = self.status
            if new_status not in valid_transitions[prev_status]:
                raise ValidationError(f"Invalid status transition from {prev_status} to {new_status}.")


# Signal handlers for proper cleanup
@receiver(post_delete, sender=Employee)
def delete_user_on_employee_delete(sender, instance, **kwargs):
    """
    When an Employee is deleted, also delete the associated User.
    This ensures no orphaned User records remain.
    """
    try:
        if instance.user:
            instance.user.delete()
    except User.DoesNotExist:
        # User was already deleted, nothing to do
        pass


@receiver(pre_save, sender=Employee)
def prevent_duplicate_users(sender, instance, **kwargs):
    """
    Prevent creating employees with users that are already associated with other employees.
    """
    if instance.user:
        # Check if this user is already associated with another employee
        existing_employee = Employee.objects.filter(user=instance.user).exclude(pk=instance.pk).first()
        if existing_employee:
            raise ValidationError(f"User {instance.user.username} is already associated with employee {existing_employee.employee_id}")

