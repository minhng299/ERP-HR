from django.urls import path
from .views import MySalaryView, SetBaseSalaryView

urlpatterns = [
    path('my-salary/', MySalaryView.as_view(), name='my-salary'),
    path('set-base-salary/', SetBaseSalaryView.as_view(), name='set-base-salary'),
]
