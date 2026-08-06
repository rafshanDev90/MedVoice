from django.conf import settings
from django.db import models


class Patient(models.Model):
    doctor = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='patients'
    )
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10, choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')])
    phone = models.CharField(max_length=20, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    address = models.TextField(blank=True, default='')
    emergency_contact = models.CharField(max_length=200, blank=True, default='')
    blood_group = models.CharField(max_length=10, blank=True, default='')
    medical_record_number = models.CharField(max_length=50, unique=True, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['last_name', 'first_name']
        indexes = [
            models.Index(fields=['doctor', 'medical_record_number'], name='patients_pa_doctor_mrn_idx'),
            models.Index(fields=['doctor', 'first_name', 'last_name'], name='patients_pa_doctor_name_idx'),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"