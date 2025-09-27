from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import timedelta
from .models import Employee, Department, Position, Attendance, LeaveRequest, LeaveType, Performance
from .serializers import (
    EmployeeSerializer, DepartmentSerializer, PositionSerializer,
    AttendanceSerializer, LeaveRequestSerializer, LeaveTypeSerializer,
    PerformanceSerializer
)
from .permissions import IsManagerOrReadOnly, IsEmployee
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse
from django.db import models



class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated, IsManagerOrReadOnly]

class PositionViewSet(viewsets.ModelViewSet):
    queryset = Position.objects.all()
    serializer_class = PositionSerializer
    permission_classes = [IsAuthenticated, IsManagerOrReadOnly]

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related('user', 'department', 'position', 'manager').all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated, IsManagerOrReadOnly]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        employee = Employee.objects.get(user=request.user)
        serializer = self.get_serializer(employee)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def dashboard_stats(self, request):
        total_employees = Employee.objects.filter(status='active').count()
        departments = Department.objects.annotate(
            employee_count=Count('employee')
        ).values('name', 'employee_count')
        
        recent_hires = Employee.objects.filter(
            hire_date__gte=timezone.now().date() - timedelta(days=30)
        ).count()
        
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
    permission_classes = [IsAuthenticated, IsManagerOrReadOnly]

class LeaveRequestViewSet(viewsets.ModelViewSet):
    queryset = LeaveRequest.objects.select_related('employee__user', 'leave_type', 'approved_by__user').all()
    serializer_class = LeaveRequestSerializer

    def get_permissions(self):
        if self.action == 'create':  # employees request leave
            return [IsAuthenticated(), IsEmployee()]
        elif self.action in ['approve', 'reject']:  # managers approve/reject
            return [IsAuthenticated(), IsManagerOrReadOnly()]
        return [IsAuthenticated()]  # fallback for list/retrieve
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        leave_request = self.get_object()
        leave_request.status = 'approved'
        leave_request.response_date = timezone.now()
        leave_request.approved_by = request.user.employee  # track manager
        leave_request.save()
        return Response({'status': 'approved'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        leave_request = self.get_object()
        leave_request.status = 'rejected'
        leave_request.response_date = timezone.now()
        leave_request.approved_by = request.user.employee  # track manager
        leave_request.save()
        return Response({'status': 'rejected'})


class PerformanceViewSet(viewsets.ModelViewSet):
    queryset = Performance.objects.select_related('employee__user', 'reviewer__user')
    serializer_class = PerformanceSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee', 'reviewer', 'status']

    def get_permissions(self):
        if self.action in ['create', 'destroy']:
            return [IsAuthenticated(), IsManagerOrReadOnly()]
        if self.action in ['update', 'partial_update']:
            return [IsAuthenticated()]  # cả manager và employee đều update được nhưng employee chỉ được update employee_comments
        return [IsAuthenticated()]


    def get_queryset(self):
        """Manager thấy review trong department, Employee chỉ thấy review của mình"""
        user = self.request.user
        if hasattr(user, "employee") and user.employee.role == "manager":
            return self.queryset.filter(employee__department=user.employee.department)
        return self.queryset.filter(employee__user=user)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_reviews(self, request):
        """Employee xem review của chính mình"""
        reviews = self.get_queryset().filter(employee__user=request.user)
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def by_status(self, request):
        """Lọc review theo status"""
        status = request.query_params.get('status')
        if not status:
            return Response({'error': 'Status is required'}, status=400)
        reviews = self.get_queryset().filter(status=status)
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def analytics(self, request):
        """Thống kê tổng quan"""
        stats = self.get_queryset().aggregate(
            avg_overall_rating=Avg('overall_rating'),
            avg_goals_achievement=Avg('goals_achievement'),
            avg_communication=Avg('communication'),
            avg_teamwork=Avg('teamwork'),
            avg_initiative=Avg('initiative'),
            total_reviews=Count('id'),
            draft_reviews=Count('id', filter=Q(status='draft')),
            submitted_reviews=Count('id', filter=Q(status='submitted')),
            finalized_reviews=Count('id', filter=Q(status='finalized')),
        )
        return Response(stats)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def review_history(self, request, pk=None):
        """Xem lịch sử review của 1 employee"""
        employee = self.get_object().employee
        reviews = self.queryset.filter(employee=employee).order_by('-review_period_start')
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'], permission_classes=[IsAuthenticated])
    def export_pdf(self, request, pk=None):
        """Xuất review thành PDF"""
        review = self.get_object()
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="review_{review.id}.pdf"'
        p = canvas.Canvas(response)
        p.drawString(100, 800, f"Performance Review for {review.employee.user.get_full_name()}")
        p.drawString(100, 780, f"Reviewer: {review.reviewer.user.get_full_name()}")
        p.drawString(100, 760, f"Overall Rating: {review.overall_rating}")
        p.drawString(100, 740, f"Comments: {review.comments}")
        p.showPage()
        p.save()
        return response