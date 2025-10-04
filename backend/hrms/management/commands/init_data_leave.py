from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from hrms.models import Employee, LeaveType, LeaveRequest, LeavePenalty
from datetime import date

class Command(BaseCommand):
    help = 'Khởi tạo dữ liệu mẫu cho chức năng leave: LeaveType, LeaveRequest cho các nhân viên mẫu'

    def handle(self, *args, **options):
        # Xóa dữ liệu cũ để tránh lỗi trùng lặp
        # LeaveRequest.objects.all().delete()
        # LeavePenalty.objects.all().delete()
        # LeaveType.objects.all().delete()
        # 1. Tạo các loại nghỉ phép
        leave_types = [
            {
                'name': 'Bệnh, bất khả kháng',
                'description': 'Nghỉ bệnh hoặc lý do bất khả kháng',
                'max_days_per_year': 15,
                'is_paid': True
            },
            {
                'name': 'Còn lại',
                'description': 'Các loại nghỉ khác ngoài bệnh, bất khả kháng',
                'max_days_per_year': 10,
                'is_paid': False
            },
        ]
        leave_type_objs = []
        for leave_data in leave_types:
            obj, created = LeaveType.objects.get_or_create(name=leave_data['name'], defaults=leave_data)
            leave_type_objs.append(obj)
            self.stdout.write(f"LeaveType '{leave_data['name']}' - created: {created}")

            # 1b. Khởi tạo LeavePenalty cho từng loại nghỉ

            penalty_configs = [
                {'name': 'Bệnh, bất khả kháng', 'percent': 0.00},
                {'name': 'Còn lại', 'percent': 50.00},
            ]
            for config in penalty_configs:
                lt = next((lt for lt in leave_type_objs if lt.name == config['name']), None)
                if lt:
                    obj, created = LeavePenalty.objects.get_or_create(leave_type=lt, defaults={'penalty_percent': config['percent']})
                    self.stdout.write(f"LeavePenalty '{lt.name}' - {config['percent']}% - created: {created}")

        # 2. Tạo một số yêu cầu nghỉ phép mẫu cho các nhân viên
        employees = Employee.objects.all()[:2]  # lấy 2 nhân viên đầu tiên
        sample_requests = []
        if len(employees) > 1:
            # Dump nhiều đơn cho mỗi loại, mỗi nhân viên
            for i in range(5):
                sample_requests.append({
                    'employee': employees[0],
                    'leave_type': leave_type_objs[0],
                    'start_date': date(2025, 9, 10+i),
                    'end_date': date(2025, 9, 10+i),
                    'days_requested': 1,
                    'reason': f'Bị ốm lần {i+1}',
                    'status': 'approved' if i % 2 == 0 else 'pending',
                    'approved_by': employees[1] if i % 2 == 0 else None,
                    'comments': 'Đã duyệt nghỉ bệnh' if i % 2 == 0 else '',
                })
                sample_requests.append({
                    'employee': employees[1],
                    'leave_type': leave_type_objs[1],
                    'start_date': date(2025, 9, 15+i),
                    'end_date': date(2025, 9, 15+i),
                    'days_requested': 1,
                    'reason': f'Nghỉ việc riêng lần {i+1}',
                    'status': 'approved' if i % 2 == 1 else 'pending',
                    'approved_by': employees[0] if i % 2 == 1 else None,
                    'comments': 'Đã duyệt nghỉ việc riêng' if i % 2 == 1 else '',
                })
        for req in sample_requests:
            if req['employee'] and req['leave_type']:
                obj, created = LeaveRequest.objects.get_or_create(
                    employee=req['employee'],
                    leave_type=req['leave_type'],
                    start_date=req['start_date'],
                    end_date=req['end_date'],
                    defaults={
                        'days_requested': req['days_requested'],
                        'reason': req['reason'],
                        'status': req['status'],
                        'approved_by': req['approved_by'],
                        'comments': req['comments'],
                    }
                )
                self.stdout.write(f"LeaveRequest for {req['employee']} - created: {created}")
        self.stdout.write(self.style.SUCCESS('Successfully populated LeaveType and LeaveRequest sample data'))
