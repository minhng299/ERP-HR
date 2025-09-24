from django.urls import path
from .views import MySalaryView

urlpatterns = [
    path('my-salary/', MySalaryView.as_view(), name='my-salary'),
]
