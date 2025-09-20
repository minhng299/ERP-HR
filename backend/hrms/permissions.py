from rest_framework.permissions import BasePermission

class IsManager(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'employee') and request.user.employee.role == 'manager'

class IsEmployee(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'employee') and request.user.employee.role == 'employee'
# ile tự tạo để định nghĩa custom permissions cho hệ thống phân quyền (có thể dùng với Django REST Framework).