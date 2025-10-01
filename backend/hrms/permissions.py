# permissions.py
from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsManagerOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        if not hasattr(request.user, 'employee'):
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.employee.role == 'manager'

class IsEmployee(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'employee') and request.user.employee.role == 'employee'
# ile tự tạo để định nghĩa custom permissions cho hệ thống phân quyền (có thể dùng với Django REST Framework).