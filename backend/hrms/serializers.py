from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Employee, Department, Position, Attendance, LeaveRequest, LeaveType, Performance
from django.core.exceptions import ValidationError

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'password']

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class PositionSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    class Meta:
        model = Position
        fields = '__all__'

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

    def get_manager_name(self, obj):
        if obj.manager:
            return f"{obj.manager.user.first_name} {obj.manager.user.last_name}"
        return None

class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Attendance
        fields = '__all__'
    
    def get_employee_name(self, obj):
        return f"{obj.employee.user.first_name} {obj.employee.user.last_name}"

class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = '__all__'

# class LeaveRequestSerializer(serializers.ModelSerializer):
#     employee_name = serializers.SerializerMethodField()
#     leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
#     approved_by_name = serializers.SerializerMethodField()
    
#     class Meta:
#         model = LeaveRequest
#         fields = '__all__'
    
#     def get_employee_name(self, obj):
#         return f"{obj.employee.user.first_name} {obj.employee.user.last_name}"
    
#     def get_approved_by_name(self, obj):
#         if obj.approved_by:
#             return f"{obj.approved_by.user.first_name} {obj.approved_by.user.last_name}"
#         return None
# 
# tranh ngay am
class LeaveRequestSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    approved_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = LeaveRequest
        fields = '__all__'
    
    def validate(self, data):
        if data['end_date'] < data['start_date']:
            raise serializers.ValidationError("End date must be after start date.")
        return data
    
    def get_employee_name(self, obj):
        return f"{obj.employee.user.first_name} {obj.employee.user.last_name}"
    
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
        return f"{obj.reviewer.user.first_name} {obj.reviewer.user.last_name}"

    def create(self, validated_data):
        validated_data['reviewer'] = self.context['request'].user.employee
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get("request")
        role = getattr(request.user.employee, "role", None)

        # Nếu là employee → chỉ được thêm employee_comments khi status = submitted
        if role == "employee":
            if instance.status != "submitted":
                raise serializers.ValidationError("Employee chỉ được phản hồi khi review đang ở trạng thái submitted")
            instance.employee_comments = validated_data.get("employee_comments", instance.employee_comments)
            instance.status = "feedback"  # đổi trạng thái sang feedback
            instance.save()
            return instance

        # Nếu là manager → xử lý logic draft, feedback, finalize
        if role == "manager":
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            try:
                instance.full_clean()
            except ValidationError as e:
                raise serializers.ValidationError(e.message_dict or e.messages)
            instance.save()
            return instance

        return super().update(instance, validated_data)
    
    def validate(self, attrs):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            reviewer = getattr(request.user, "employee", None)
            if reviewer:
                attrs["reviewer"] = reviewer

        instance = Performance(**attrs)
        try:
            instance.full_clean()
        except ValidationError as e:
            raise serializers.ValidationError(e.message_dict or e.messages)
        return attrs