from django.contrib import admin
from .models import Employee, Department, Position, Attendance, LeaveRequest, LeaveType, Performance

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'created_at']
    search_fields = ['name']

@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ['title', 'department', 'salary_min', 'salary_max']
    list_filter = ['department']
    search_fields = ['title']

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['employee_id', 'user', 'department', 'position', 'role', 'status']
    list_filter = ['department', 'position', 'status']
    search_fields = ['employee_id', 'user__first_name', 'user__last_name']

@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['employee', 'date', 'check_in', 'check_out', 'total_hours']
    list_filter = ['date', 'employee__department']      
    date_hierarchy = 'date'

@admin.register(LeaveType)
class LeaveTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'max_days_per_year', 'is_paid']

@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ['employee', 'leave_type', 'start_date', 'end_date', 'status', 'request_date']
    list_filter = ['status', 'leave_type', 'start_date']
    date_hierarchy = 'request_date'

@admin.register(Performance)
class PerformanceAdmin(admin.ModelAdmin):
    list_display = ['employee', 'reviewer', 'overall_rating', 'review_period_start', 'review_period_end']
    list_filter = ['overall_rating', 'review_period_start']