from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator

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
    manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=EMPLOYMENT_STATUS, default='active')
    profile_picture = models.URLField(blank=True)
    ROLE_CHOICES = [
        ('manager', 'Manager'),
        ('employee', 'Employee'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee')
    
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name} ({self.employee_id})"

class Attendance(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    date = models.DateField()
    check_in = models.TimeField()
    check_out = models.TimeField(null=True, blank=True)
    break_duration = models.DurationField(default='00:00:00')
    total_hours = models.DurationField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        unique_together = ('employee', 'date')
    
    def save(self, *args, **kwargs):
        if self.check_in and self.check_out:
            from datetime import datetime, timedelta
            check_in_dt = datetime.combine(self.date, self.check_in)
            check_out_dt = datetime.combine(self.date, self.check_out)
            total = check_out_dt - check_in_dt - self.break_duration
            self.total_hours = total
        super().save(*args, **kwargs)

class LeaveType(models.Model):
    name = models.CharField(max_length=50)
    days_allowed = models.IntegerField()
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

class LeaveRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    days_requested = models.IntegerField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    approved_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_leaves')
    request_date = models.DateTimeField(auto_now_add=True)
    response_date = models.DateTimeField(null=True, blank=True)
    comments = models.TextField(blank=True)
    
    def save(self, *args, **kwargs):
        if not self.days_requested:
            self.days_requested = (self.end_date - self.start_date).days + 1
        super().save(*args, **kwargs)

class Performance(models.Model):
    RATING_CHOICES = [
        (1, 'Poor'),
        (2, 'Below Average'),
        (3, 'Average'),
        (4, 'Above Average'),
        (5, 'Excellent'),
    ]
    
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    reviewer = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='reviewed_performances')
    review_period_start = models.DateField()
    review_period_end = models.DateField()
    overall_rating = models.IntegerField(choices=RATING_CHOICES)
    goals_achievement = models.IntegerField(choices=RATING_CHOICES)
    communication = models.IntegerField(choices=RATING_CHOICES)
    teamwork = models.IntegerField(choices=RATING_CHOICES)
    initiative = models.IntegerField(choices=RATING_CHOICES)
    comments = models.TextField()
    employee_comments = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)