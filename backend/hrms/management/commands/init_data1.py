from django.core.management.base import BaseCommand
from hrms.models import Employee, PerformanceCriterion, PerformanceReview, PerformanceScore
from datetime import date

class Command(BaseCommand):
    help = 'Initialize sample data for Performance'

    def handle(self, *args, **options):
        # 1. Tạo các tiêu chí nếu chưa có
        criteria_names = ['Goals', 'Communication', 'Teamwork', 'Initiative']
        criteria_objs = []
        for name in criteria_names:
            criterion, _ = PerformanceCriterion.objects.get_or_create(name=name)
            criteria_objs.append(criterion)

        # 2. Lấy các employee mẫu (giả sử đã có sẵn employee)
        employees = Employee.objects.all()
        if len(employees) < 2:
            self.stdout.write(self.style.WARNING('Not enough employees to create performance reviews'))
            return

        employee = employees[1]  # người được review
        reviewer = employees[0]  # người review

        # 3. Tạo PerformanceReview
        review, _ = PerformanceReview.objects.get_or_create(
            employee=employee,
            reviewer=reviewer,
            review_period_start=date(2023, 1, 1),
            review_period_end=date(2023, 12, 31),
            overall_rating=5,
            comments='Excellent performance throughout the year.',
            employee_comments='Thank you!',
        )

        # 4. Tạo PerformanceScore cho từng criterion
        scores_data = {
            'Goals': 5,
            'Communication': 4,
            'Teamwork': 5,
            'Initiative': 4,
        }

        for criterion in criteria_objs:
            PerformanceScore.objects.get_or_create(
                review=review,
                criterion=criterion,
                rating=scores_data.get(criterion.name, 3)
            )

        self.stdout.write(self.style.SUCCESS('Successfully populated Performance sample data'))
