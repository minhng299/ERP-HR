from django.db import models

class SalaryRecord(models.Model):
    employee_id = models.IntegerField()
    base_salary = models.DecimalField(max_digits=12, decimal_places=2)
    bonus = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    deductions = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total_salary = models.DecimalField(max_digits=12, decimal_places=2)
    month = models.DateField()

    def __str__(self):
        return f"Salary for employee {self.employee_id} - {self.month}"
