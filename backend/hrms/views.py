from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Avg
from django.utils import timezone
from datetime import timedelta
from .models import Employee, Department, Position, Attendance, LeaveRequest, LeaveType, Performance
from .serializers import (
    EmployeeSerializer, DepartmentSerializer, PositionSerializer,
    AttendanceSerializer, LeaveRequestSerializer, LeaveTypeSerializer,
    PerformanceSerializer
)

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

class PositionViewSet(viewsets.ModelViewSet):
    queryset = Position.objects.all()
    serializer_class = PositionSerializer

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related('user', 'department', 'position', 'manager').all()
    serializer_class = EmployeeSerializer
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        total_employees = Employee.objects.filter(status='active').count()
        departments = Department.objects.annotate(
            employee_count=Count('employee')
        ).values('name', 'employee_count')
        
        # Recent hires (last 30 days)
        recent_hires = Employee.objects.filter(
            hire_date__gte=timezone.now().date() - timedelta(days=30)
        ).count()
        
        # Pending leave requests
        pending_leaves = LeaveRequest.objects.filter(status='pending').count()
        
        return Response({
            'total_employees': total_employees,
            'departments': list(departments),
            'recent_hires': recent_hires,
            'pending_leaves': pending_leaves,
        })

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related('employee__user').all()
    serializer_class = AttendanceSerializer
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        today = timezone.now().date()
        attendance = Attendance.objects.filter(date=today).select_related('employee__user')
        serializer = self.get_serializer(attendance, many=True)
        return Response(serializer.data)

class LeaveTypeViewSet(viewsets.ModelViewSet):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer

class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.select_related('employee__user', 'leave_type', 'approved_by__user').all()
    serializer_class = LeaveRequestSerializer
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        leave_request = self.get_object()
        leave_request.status = 'approved'
        leave_request.response_date = timezone.now()
        leave_request.save()
        return Response({'status': 'approved'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        leave_request = self.get_object()
        leave_request.status = 'rejected'
        leave_request.response_date = timezone.now()
        leave_request.save()
        return Response({'status': 'rejected'})

class PerformanceViewSet(viewsets.ModelViewSet):
    queryset = Performance.objects.select_related('employee__user', 'reviewer__user').all()
    serializer_class = PerformanceSerializer