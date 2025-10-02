from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Employee, Department, Position, Attendance, LeaveRequest, LeaveType, Performance
from django.core.exceptions import ValidationError
from django.utils import timezone

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'password']

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class PositionSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    class Meta:
        model = Position
        fields = '__all__'
        # department_name sẽ tự động được trả về cùng các trường khác

class EmployeeSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    department_name = serializers.CharField(source='department.name', read_only=True)
    position_title = serializers.CharField(source='position.title', read_only=True)
    manager_name = serializers.SerializerMethodField()
    class Meta:
        model = Employee
        fields = '__all__'

    def create(self, validated_data):
        user_data = validated_data.pop('user')
        user = User.objects.create_user(**user_data)
        employee = Employee.objects.create(user=user, **validated_data)
        return employee

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', None)
        # Update user fields if provided
        if user_data:
            user = instance.user
            for attr, value in user_data.items():
                if attr == 'password' and value:
                    user.set_password(value)
                elif value is not None:
                    setattr(user, attr, value)
            user.save()
        # Update employee fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

    def get_manager_name(self, obj):
        if obj.manager:
            return f"{obj.manager.user.first_name} {obj.manager.user.last_name}"
        return None

class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    hours_worked_display = serializers.SerializerMethodField()
    can_check_in = serializers.SerializerMethodField()
    can_check_out = serializers.SerializerMethodField()
    can_start_break = serializers.SerializerMethodField()
    can_end_break = serializers.SerializerMethodField()
    
    # Override duration fields to handle serialization issues
    break_duration = serializers.SerializerMethodField()
    total_hours = serializers.SerializerMethodField()
    overtime_hours = serializers.SerializerMethodField()
    
    class Meta:
        model = Attendance
        fields = [
            'id', 'employee', 'employee_name', 'department_name', 'date',
            'check_in', 'check_out', 'break_duration', 'total_hours',
            'notes', 'status', 'status_display', 'location', 'late_arrival',
            'early_departure', 'overtime_hours', 'break_start', 'break_end',
            'expected_start', 'expected_end', 'hours_worked_display',
            'can_check_in', 'can_check_out', 'can_start_break', 'can_end_break',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'total_hours', 'late_arrival', 'early_departure', 'overtime_hours',
            'created_at', 'updated_at', 'status_display', 'hours_worked_display',
            'break_duration'
        ]
    
    def get_employee_name(self, obj):
        return f"{obj.employee.user.first_name} {obj.employee.user.last_name}"
    
    def get_department_name(self, obj):
        return obj.employee.department.name if obj.employee.department else None
    
    def get_status_display(self, obj):
        try:
            return obj.get_status_display_with_time()
        except:
            return obj.get_status_display()
    
    def get_hours_worked_display(self, obj):
        try:
            return obj.hours_worked_display
        except:
            return "0h 0m"
    
    def get_break_duration(self, obj):
        """Safely serialize break_duration field"""
        try:
            if obj.break_duration:
                if hasattr(obj.break_duration, 'total_seconds'):
                    # It's a proper timedelta object
                    total_seconds = int(obj.break_duration.total_seconds())
                    hours = total_seconds // 3600
                    minutes = (total_seconds % 3600) // 60
                    return f"{hours:02d}:{minutes:02d}:00"
                else:
                    # It might be a string, return as is
                    return str(obj.break_duration)
            return "00:00:00"
        except:
            return "00:00:00"
    
    def get_total_hours(self, obj):
        """Safely serialize total_hours field"""
        try:
            if obj.total_hours:
                if hasattr(obj.total_hours, 'total_seconds'):
                    # It's a proper timedelta object
                    total_seconds = int(obj.total_hours.total_seconds())
                    hours = total_seconds // 3600
                    minutes = (total_seconds % 3600) // 60
                    return f"{hours:02d}:{minutes:02d}:00"
                else:
                    # It might be a string, return as is
                    return str(obj.total_hours)
            return None
        except:
            return None
    
    def get_overtime_hours(self, obj):
        """Safely serialize overtime_hours field"""
        try:
            if obj.overtime_hours:
                if hasattr(obj.overtime_hours, 'total_seconds'):
                    # It's a proper timedelta object
                    total_seconds = int(obj.overtime_hours.total_seconds())
                    hours = total_seconds // 3600
                    minutes = (total_seconds % 3600) // 60
                    return f"{hours:02d}:{minutes:02d}:00"
                else:
                    # It might be a string, return as is
                    return str(obj.overtime_hours)
            return None
        except:
            return None
    
    def get_can_check_in(self, obj):
        return obj.can_check_in()
    
    def get_can_check_out(self, obj):
        return obj.can_check_out()
    
    def get_can_start_break(self, obj):
        return obj.can_start_break()
    
    def get_can_end_break(self, obj):
        return obj.can_end_break()

class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = '__all__'

class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    approved_by_name = serializers.SerializerMethodField()
    days_requested = serializers.SerializerMethodField()
    
    class Meta:
        model = LeaveRequest
        fields = ['employee_id', 'leave_type', 'start_date', 'end_date', 'reason',
                  'employee_name', 'leave_type_name', 'approved_by_name', 'days_requested', 'status', 'id', 'response_date']
    
    def validate(self, data):
        if data['end_date'] < data['start_date']:
            raise serializers.ValidationError("End date must be after start date.")
        return data
    
    def get_employee_name(self, obj):
        return f"{obj.employee.user.first_name} {obj.employee.user.last_name}"
    
    def create(self, validated_data):
        user = self.context['request'].user
        employee = user.employee  # nếu có quan hệ OneToOne giữa User và Employee
        return LeaveRequest.objects.create(employee=employee, **validated_data)
    
    def update(self, instance, validated_data):
        if validated_data.get('status') == 'cancelled' and instance.status == 'pending':
            instance.status = 'cancelled'
            instance.response_date = timezone.now()
            instance.save()
        return instance

    def get_days_requested(self, obj):
        return obj.days_requested
    
    def get_approved_by_name(self, obj):
        if obj.approved_by:
            return f"{obj.approved_by.user.first_name} {obj.approved_by.user.last_name}"
        return None

class PerformanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    reviewer_name = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Performance
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'reviewer']

    def get_employee_name(self, obj):
        return f"{obj.employee.user.first_name} {obj.employee.user.last_name}"

    def get_reviewer_name(self, obj):
        if obj.reviewer:
            return f"{obj.reviewer.user.first_name} {obj.reviewer.user.last_name}"
        return None

    def create(self, validated_data):
        validated_data['reviewer'] = self.context['request'].user.employee
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get("request")
        role = getattr(request.user.employee, "role", None)

        # --- Employee update (feedback only) ---
        if role == "employee":
            if instance.status != "submitted":
                raise serializers.ValidationError(
                    {"non_field_errors": ["Employee chỉ được phản hồi khi review đang ở trạng thái submitted"]}
                )
            instance.employee_comments = validated_data.get("employee_comments", instance.employee_comments)
            instance.status = "feedback"  # đổi trạng thái
            instance.save()
            return instance

        if role == "manager":
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            if request and request.method == "PUT":
                try:
                    instance.full_clean()
                except ValidationError as e:
                    raise serializers.ValidationError(e.message_dict or e.messages)

            instance.save()
            return instance
        # Nếu role khác thì fallback
        return super().update(instance, validated_data)
    
    def validate(self, attrs):
        request = self.context.get("request")
        # auto gán reviewer nếu có user.employee
        if request and request.user.is_authenticated:
            reviewer = getattr(request.user, "manager", None)
            if reviewer:
                attrs["reviewer"] = reviewer
        # Chỉ validate toàn bộ khi POST hoặc PUT
        if request and request.method in ["POST", "PUT"]:
            instance = Performance(**attrs)
            try:
                instance.full_clean()
            except ValidationError as e:
                raise serializers.ValidationError(e.message_dict or e.messages)
        return attrs