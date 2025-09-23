from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Employee, Department, Position, Attendance, LeaveRequest, LeaveType, Performance

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
        read_only_fields = ['created_at', 'updated_at', 'status']

    def get_employee_name(self, obj):
        return f"{obj.employee.user.first_name} {obj.employee.user.last_name}"

    def get_reviewer_name(self, obj):
        # Chỉ trả về tên nếu reviewer là manager
        if obj.reviewer.role == 'manager':
            return f"{obj.reviewer.user.first_name} {obj.reviewer.user.last_name}"
        return None

    def validate(self, data):
        # Kiểm tra ngày bắt đầu và kết thúc
        if data['review_period_start'] > data['review_period_end']:
            raise serializers.ValidationError("Review period start date must be before the end date.")
        
        # Kiểm tra giá trị đánh giá
        for field in ['overall_rating', 'goals_achievement', 'communication', 'teamwork', 'initiative']:
            if field in data and not (1 <= data[field] <= 5):
                raise serializers.ValidationError(f"{field.replace('_', ' ').capitalize()} must be between 1 and 5.")
        
        # Kiểm tra nhân viên và người đánh giá thuộc cùng phòng ban
        reviewer = self.context['request'].user.employee
        employee = data.get('employee')
        if reviewer.department != employee.department:
            raise serializers.ValidationError("Reviewer and employee must belong to the same department.")
        
        # Kiểm tra trạng thái hợp lệ (nếu có)
        if self.instance:  # Nếu đang cập nhật
            valid_transitions = {
                'draft': ['submitted'],
                'submitted': ['finalized'],
                'finalized': [],
            }
            previous_status = self.instance.status
            new_status = data.get('status', previous_status)
            if new_status not in valid_transitions[previous_status]:
                raise serializers.ValidationError(
                    f"Invalid status transition from {previous_status} to {new_status}."
                )
        
        # Kiểm tra kỳ đánh giá không trùng lặp
        overlapping_reviews = Performance.objects.filter(
            employee=data['employee'],
            review_period_start__lte=data['review_period_end'],
            review_period_end__gte=data['review_period_start'],
        ).exclude(pk=self.instance.pk if self.instance else None)
        if overlapping_reviews.exists():
            raise serializers.ValidationError("Review period overlaps with an existing review for this employee.")
        
        return data