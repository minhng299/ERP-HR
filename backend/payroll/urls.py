from django.urls import path
from .views import MySalaryView, SetBaseSalaryView
from .attendance_integration import AttendancePayrollStatsView

urlpatterns = [
    path('my-salary/', MySalaryView.as_view(), name='my-salary'),
    path('set-base-salary/', SetBaseSalaryView.as_view(), name='set-base-salary'),
    path('attendance-stats/', AttendancePayrollStatsView.as_view(), name='attendance-payroll-stats'),
]
