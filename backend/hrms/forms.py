from django import forms
# from .models import LeaveType
from .models import LeaveRequest

# class LeaveTypeForm(forms.ModelForm):
#     class Meta:
#         model = LeaveType
#         fields = ['name', 'code', 'description', 'max_days_per_year', 'is_paid']

class LeaveRequestForm(forms.ModelForm):
    class Meta:
        model = LeaveRequest
        fields = ['leave_type', 'start_date', 'end_date', 'reason']
