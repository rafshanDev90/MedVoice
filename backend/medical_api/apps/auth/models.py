from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    role = models.CharField(
        max_length=20,
        choices=[('doctor', 'Doctor'), ('nurse', 'Nurse'), ('admin', 'Admin')],
        default='doctor',
    )
    specialization = models.CharField(max_length=200, blank=True, default='')
    license_number = models.CharField(max_length=50, blank=True, default='')

    class Meta:
        db_table = 'auth_user'

    def __str__(self):
        return f"{self.username} ({self.role})"