from django.urls import path
from .views import MySalaryView, SetBaseSalaryView, PayslipPDFView, TeamSalaryView, EmployeeSalaryView
from .attendance_integration import AttendancePayrollStatsView

urlpatterns = [
    path('my-salary/', MySalaryView.as_view(), name='my-salary'),
    path('team-salary/', TeamSalaryView.as_view(), name='team-salary'),
    path('employee-salary/<int:employee_id>/', EmployeeSalaryView.as_view(), name='employee-salary'),
    path('set-base-salary/', SetBaseSalaryView.as_view(), name='set-base-salary'),
    path('attendance-stats/', AttendancePayrollStatsView.as_view(), name='attendance-payroll-stats'),
    path('payslip/', PayslipPDFView.as_view(), name='payslip-pdf'),
]
