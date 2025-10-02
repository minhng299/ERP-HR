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
    
    def destroy(self, request, *args, **kwargs):
        """
        Custom delete method to ensure proper cleanup of User and related data
        """
        employee = self.get_object()
        
        # Store user reference before deletion
        user = employee.user
        
        # Check if user has permission to delete this employee
        if request.user.employee.role != 'manager':
            return Response({'error': 'Only managers can delete employees'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        # Prevent self-deletion
        if employee.user == request.user:
            return Response({'error': 'Cannot delete your own employee record'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Delete the employee (this will trigger the signal to delete the user)
            employee.delete()
            
            return Response({'message': f'Employee {employee.employee_id} and associated user account deleted successfully'}, 
                          status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': f'Failed to delete employee: {str(e)}'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.select_related('employee__user', 'employee__department').all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['employee', 'date', 'status']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by current user if not manager
        if not hasattr(self.request.user, 'employee') or self.request.user.employee.role != 'manager':
            if hasattr(self.request.user, 'employee'):
                queryset = queryset.filter(employee=self.request.user.employee)
            else:
                queryset = queryset.none()
        
        # Date range filtering
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(date__gte=date_from)
        if date_to:
            queryset = queryset.filter(date__lte=date_to)
            
        return queryset.order_by('-date')
    
    @action(detail=False, methods=['post'])
    def check_in(self, request):
        """Real-time check-in with current timestamp"""
        try:
            employee = request.user.employee
        except Employee.DoesNotExist:
            return Response({'error': 'Employee profile not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        today = timezone.now().date()
        current_time = timezone.now().time()
        
        # Check if employee is on approved leave today
        approved_leave = LeaveRequest.objects.filter(
            employee=employee,
            status='approved',
            start_date__lte=today,
            end_date__gte=today
        ).first()
        
        if approved_leave:
            return Response({
                'error': f'Cannot check in while on {approved_leave.leave_type.name} leave',
                'leave_type': approved_leave.leave_type.name,
                'leave_dates': f'{approved_leave.start_date} to {approved_leave.end_date}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create attendance record for today
        attendance, created = Attendance.objects.get_or_create(
            employee=employee,
            date=today,
            defaults={
                'check_in': current_time,
                'status': 'checked_in',
                'location': self.get_client_ip(request),
                'break_duration': timedelta(hours=0),
                'total_hours': None,
                'overtime_hours': timedelta(hours=0)
            }
        )
        
        if not created:
            if attendance.status == 'on_leave':
                return Response({
                    'error': 'Cannot check in while on leave',
                    'leave_type': attendance.get_leave_type_display()
                }, status=status.HTTP_400_BAD_REQUEST)
            elif attendance.status == 'checked_in':
                return Response({'error': 'Already checked in today'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            elif attendance.status == 'checked_out':
                return Response({'error': 'Already completed attendance for today'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            else:
                # Update existing incomplete record
                attendance.check_in = current_time
                attendance.status = 'checked_in'
                attendance.location = self.get_client_ip(request)
        
        attendance.save()
        serializer = self.get_serializer(attendance)
        
        return Response({
            'message': 'Checked in successfully',
            'time': current_time.strftime('%I:%M %p'),
            'is_late': attendance.is_late(),
            'attendance': serializer.data
        })
    
    @action(detail=False, methods=['post'])
    def check_out(self, request):
        """Real-time check-out with calculations"""
        try:
            employee = request.user.employee
        except Employee.DoesNotExist:
            return Response({'error': 'Employee profile not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        today = timezone.now().date()
        current_time = timezone.now().time()
        
        try:
            attendance = Attendance.objects.get(employee=employee, date=today)
        except Attendance.DoesNotExist:
            return Response({'error': 'No check-in record found for today'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        if not attendance.can_check_out():
            return Response({'error': f'Cannot check out. Current status: {attendance.get_status_display()}'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        if attendance.check_out:
            return Response({'error': 'Already checked out today'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # End break if currently on break
        if attendance.status == 'on_break':
            attendance.break_end = current_time
            if attendance.break_start:
                from datetime import datetime, timedelta
                break_start_dt = datetime.combine(today, attendance.break_start)
                break_end_dt = datetime.combine(today, current_time)
                additional_break = break_end_dt - break_start_dt
                attendance.break_duration += additional_break
        
        attendance.check_out = current_time
        attendance.status = 'checked_out'
        attendance.save()
        
        serializer = self.get_serializer(attendance)
        
        return Response({
            'message': 'Checked out successfully',
            'time': current_time.strftime('%H:%M'),
            'total_hours': attendance.hours_worked_display,
            'is_early_departure': attendance.is_early_departure(),
            'overtime_hours': str(attendance.overtime_hours) if attendance.overtime_hours else None,
            'attendance': serializer.data
        })
    
    @action(detail=False, methods=['post'])
    def start_break(self, request):
        """Start break period"""
        try:
            employee = request.user.employee
        except Employee.DoesNotExist:
            return Response({'error': 'Employee profile not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        today = timezone.now().date()
        current_time = timezone.now().time()
        
        try:
            attendance = Attendance.objects.get(employee=employee, date=today)
        except Attendance.DoesNotExist:
            return Response({'error': 'No check-in record found for today'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        if not attendance.can_start_break():
            return Response({'error': f'Cannot start break. Current status: {attendance.get_status_display()}'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        attendance.break_start = current_time
        attendance.status = 'on_break'
        attendance.save()
        
        return Response({
            'message': 'Break started',
            'time': current_time.strftime('%H:%M')
        })
    
    @action(detail=False, methods=['post'])
    def end_break(self, request):
        """End break period"""
        try:
            employee = request.user.employee
        except Employee.DoesNotExist:
            return Response({'error': 'Employee profile not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        today = timezone.now().date()
        current_time = timezone.now().time()
        
        try:
            attendance = Attendance.objects.get(employee=employee, date=today)
        except Attendance.DoesNotExist:
            return Response({'error': 'No check-in record found for today'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        if not attendance.can_end_break():
            return Response({'error': f'Cannot end break. Current status: {attendance.get_status_display()}'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        attendance.break_end = current_time
        attendance.status = 'checked_in'
        
        # Calculate break duration
        if attendance.break_start:
            from datetime import datetime
            break_start_dt = datetime.combine(today, attendance.break_start)
            break_end_dt = datetime.combine(today, current_time)
            break_duration = break_end_dt - break_start_dt
            attendance.break_duration += break_duration
        
        attendance.save()
        
        return Response({
            'message': 'Break ended',
            'time': current_time.strftime('%H:%M'),
            'break_duration': str(break_duration) if 'break_duration' in locals() else None
        })
    
    @action(detail=False, methods=['get'])
    def current_status(self, request):
        """Get current attendance status for today"""
        try:
            employee = request.user.employee
        except Employee.DoesNotExist:
            return Response({'error': 'Employee profile not found'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        today = timezone.now().date()
        
        # Check if employee is on approved leave today
        approved_leave = LeaveRequest.objects.filter(
            employee=employee,
            status='approved',
            start_date__lte=today,
            end_date__gte=today
        ).first()
        
        if approved_leave:
            return Response({
                'status': 'on_leave',
                'message': f'You are on {approved_leave.leave_type.name} leave',
                'leave_type': approved_leave.leave_type.name,
                'leave_dates': f'{approved_leave.start_date} to {approved_leave.end_date}',
                'can_check_in': False,
                'can_check_out': False,
                'can_start_break': False,
                'can_end_break': False,
                'attendance': None,
                'current_time': timezone.now().time().strftime('%I:%M %p')
            })
        
        try:
            attendance = Attendance.objects.get(employee=employee, date=today)
            serializer = self.get_serializer(attendance)
        except Attendance.DoesNotExist:
            # Create a default record for status checking
            attendance = Attendance(employee=employee, date=today, status='not_started')
            serializer = self.get_serializer(attendance)
        
        return Response({
            'attendance': serializer.data,
            'can_check_in': attendance.can_check_in(),
            'can_check_out': attendance.can_check_out(),
            'can_start_break': attendance.can_start_break(),
            'can_end_break': attendance.can_end_break(),
            'current_time': timezone.now().time().strftime('%I:%M %p')
        })
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's attendance for all employees (managers only)"""
        if not hasattr(request.user, 'employee') or request.user.employee.role != 'manager':
            return Response({'error': 'Manager access required'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        today = timezone.now().date()
        attendance = Attendance.objects.filter(date=today).select_related('employee__user', 'employee__department')
        serializer = self.get_serializer(attendance, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get attendance statistics"""
        today = timezone.now().date()
        
        if hasattr(request.user, 'employee') and request.user.employee.role == 'manager':
            # Manager can see all stats
            queryset = Attendance.objects.filter(date=today)
        else:
            # Employee can only see their own stats
            if hasattr(request.user, 'employee'):
                queryset = Attendance.objects.filter(date=today, employee=request.user.employee)
            else:
                return Response({'error': 'Employee profile not found'}, 
                              status=status.HTTP_404_NOT_FOUND)
        
        total_present = queryset.filter(status__in=['checked_in', 'on_break', 'checked_out']).count()
        checked_out = queryset.filter(status='checked_out').count()
        late_arrivals = queryset.filter(late_arrival=True).count()
        on_break = queryset.filter(status='on_break').count()
        
        # Calculate average hours (only for completed attendance)
        completed_attendance = queryset.filter(status='checked_out', total_hours__isnull=False)
        avg_hours = 0
        if completed_attendance.exists():
            total_seconds = sum(a.total_hours.total_seconds() for a in completed_attendance)
            avg_hours = total_seconds / completed_attendance.count() / 3600
        
        return Response({
            'total_present': total_present,
            'checked_out': checked_out,
            'late_arrivals': late_arrivals,
            'on_break': on_break,
            'average_hours': round(avg_hours, 1)
        })
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

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