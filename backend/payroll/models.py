from django.db import models

class SalaryRecord(models.Model):
    employee_id = models.IntegerField()
    base_salary = models.DecimalField(max_digits=12, decimal_places=2)
    bonus = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_salary = models.DecimalField(max_digits=12, decimal_places=2)
    month = models.DateField()
    # Attendance integration fields
    total_hours_worked = models.DecimalField(max_digits=6, decimal_places=2, default=0, help_text="Total hours worked this month")
    overtime_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0, help_text="Overtime hours this month")
    late_days = models.IntegerField(default=0, help_text="Number of late arrival days")
    absent_days = models.IntegerField(default=0, help_text="Number of absent days")
    incomplete_days = models.IntegerField(default=0, help_text="Number of incomplete attendance days")

    def __str__(self):
        return f"Salary for employee {self.employee_id} - {self.month}"
