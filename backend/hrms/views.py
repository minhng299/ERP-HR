from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Avg, Q
from django.utils.timezone import now
from django.shortcuts import render
from .models import LeaveType
from django.db.models import Count, Avg
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated

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

    @action(detail=False, methods=['get', 'patch'], permission_classes=[IsAuthenticated])
    def me(self, request):
        try:
            employee = Employee.objects.get(user=request.user)
        except Employee.DoesNotExist:
            return Response({'error': 'Employee profile not found'}, status=status.HTTP_404_NOT_FOUND)
        
        if request.method == 'GET':
            # Return current user's profile
            serializer = self.get_serializer(employee)
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            # Update current user's profile - allows users to update their own profile
            # Only allow updating specific fields for self-update
            allowed_fields = ['phone_number', 'address', 'date_of_birth']
            user_allowed_fields = ['first_name', 'last_name', 'email']
            
            # Update employee fields
            for field in allowed_fields:
                if field in request.data:
                    setattr(employee, field, request.data[field])
            
            # Update user fields
            user_data = {}
            for field in user_allowed_fields:
                if field in request.data:
                    user_data[field] = request.data[field]
            
            if user_data:
                for field, value in user_data.items():
                    setattr(employee.user, field, value)
                employee.user.save()
            
            employee.save()
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
    queryset = LeaveRequest.objects.select_related('employee', 'leave_type', 'approved_by').all()
    serializer_class = LeaveRequestSerializer

    def get_permissions(self):
        if self.action == 'create':  # employees request leave
            return [IsAuthenticated(), IsEmployee()]
        elif self.action in ['approve', 'reject']:  # managers approve/reject
            return [IsAuthenticated(), IsManagerOrReadOnly()]
        elif self.action == 'cancel':
            return [IsAuthenticated(), IsEmployee()]
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

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        leave_request = self.get_object()

        # Chỉ cho phép hủy nếu đơn đang ở trạng thái 'pending'
        if leave_request.status != 'pending':
            return Response({'error': 'Chỉ có thể hủy đơn đang chờ duyệt.'}, status=400)

        # Kiểm tra quyền: chỉ nhân viên tạo đơn mới được hủy
        if leave_request.employee != request.user.employee:
            return Response({'error': 'Bạn không có quyền hủy đơn này.'}, status=403)

        leave_request.status = 'cancelled'
        leave_request.response_date = timezone.now()
        leave_request.save()
        return Response({'status': 'cancelled'})

    @action(detail=False, methods=['get'])
    def stats(self, request):
        today = now()
        start_of_month = today.replace(day=1)

        pending = LeaveRequest.objects.filter(status='pending').count()
        approved = LeaveRequest.objects.filter(status='approved', response_date__gte=start_of_month).count()
        rejected = LeaveRequest.objects.filter(status='rejected', response_date__gte=start_of_month).count()

        return Response({
            'pending': pending,
            'approved_this_month': approved,
            'rejected_this_month': rejected,
        })

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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change user password"""
    user = request.user
    current_password = request.data.get('current_password')
    new_password = request.data.get('new_password')
    
    if not current_password or not new_password:
        return Response(
            {'error': 'Both current_password and new_password are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verify current password
    if not authenticate(username=user.username, password=current_password):
        return Response(
            {'error': 'Current password is incorrect'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate new password
    if len(new_password) < 8:
        return Response(
            {'error': 'New password must be at least 8 characters long'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Set new password
    user.set_password(new_password)
    user.save()
    
    return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)