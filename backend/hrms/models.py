from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError
from django.utils.text import slugify
from django.db.models.signals import pre_save
from django.dispatch import receiver


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
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    date = models.DateField()
    check_in = models.TimeField()
    check_out = models.TimeField(null=True, blank=True)
    
    # SỬA: Thay DurationField bằng CharField
    break_duration = models.CharField(max_length=20, default='00:00:00')
    
    total_hours = models.DurationField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        unique_together = ('employee', 'date')
    
    def save(self, *args, **kwargs):
        # KHÔNG tính toán gì cả, chỉ lưu đơn giản
        super().save(*args, **kwargs)

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
        if not self.days_requested:
            self.days_requested = (self.end_date - self.start_date).days + 1
        if self.status == 'approved' and self.days_requested > self.employee.annual_leave_remaining:
            raise ValidationError("Không đủ số ngày nghỉ còn lại.")

    def save(self, *args, **kwargs):
        self.full_clean()
        if self.status == 'approved' and self.response_date and self.approved_by:
            if self.leave_type.code == 'AL':  # Annual Leave
                self.employee.annual_leave_remaining -= self.days_requested
                self.employee.save()
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
