from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EmployeeViewSet, DepartmentViewSet, PositionViewSet,
    AttendanceViewSet, LeaveRequestViewSet, LeaveTypeViewSet,
    PerformanceViewSet, change_password, SignUpView
)

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'positions', PositionViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'leave-requests', LeaveRequestViewSet)
router.register(r'leave-types', LeaveTypeViewSet)
router.register(r'performances', PerformanceViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/change-password/', change_password, name='change_password'),
    path('api/payroll/', include('payroll.urls')),
]