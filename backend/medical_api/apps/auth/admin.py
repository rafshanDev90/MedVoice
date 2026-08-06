from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'specialization']
    list_filter = ['role', 'is_staff', 'is_superuser']
    fieldsets = UserAdmin.fieldsets + (
        ('Medical Role', {'fields': ['role', 'specialization', 'license_number']}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Medical Role', {'fields': ['role', 'specialization', 'license_number']}),
    )