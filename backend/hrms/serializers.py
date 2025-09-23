
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Employee, Department, Position, Attendance, LeaveRequest, LeaveType, Performance

# --- SignUp Serializer ---

class SignUpSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=150)
    employee_id = serializers.CharField(max_length=20)
    phone_number = serializers.CharField(max_length=17)
    address = serializers.CharField()
    date_of_birth = serializers.DateField()
    hire_date = serializers.DateField()
    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all())
    position = serializers.PrimaryKeyRelatedField(queryset=Position.objects.all())
    salary = serializers.DecimalField(max_digits=10, decimal_places=2)
    manager = serializers.PrimaryKeyRelatedField(queryset=Employee.objects.all(), required=False, allow_null=True)
    profile_picture = serializers.URLField(required=False, allow_blank=True)
    # role field is omitted from input; always set to 'employee' in create()

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def validate_employee_id(self, value):
        if Employee.objects.filter(employee_id=value).exists():
            raise serializers.ValidationError("Employee ID already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
        )
        employee = Employee.objects.create(
            user=user,
            employee_id=validated_data['employee_id'],
            phone_number=validated_data['phone_number'],
            address=validated_data['address'],
            date_of_birth=validated_data['date_of_birth'],
            hire_date=validated_data['hire_date'],
            department=validated_data['department'],
            position=validated_data['position'],
            salary=validated_data['salary'],
            manager=validated_data.get('manager'),
            profile_picture=validated_data.get('profile_picture', ''),
            role='employee',  # Always set to employee
        )
        return employee

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
    
    class Meta:
        model = Performance
        fields = '__all__'
    
    def get_employee_name(self, obj):
        return f"{obj.employee.user.first_name} {obj.employee.user.last_name}"
    
    def get_reviewer_name(self, obj):
        return f"{obj.reviewer.user.first_name} {obj.reviewer.user.last_name}"
