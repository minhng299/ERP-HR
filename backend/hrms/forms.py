from django import forms
from .models import LeaveType

class LeaveTypeForm(forms.ModelForm):
    class Meta:
        model = LeaveType
        fields = ['name', 'code', 'description', 'max_days_per_year', 'is_paid']
