from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdminUser(BasePermission):
    message = 'Only administrators can perform this action.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )


class IsDoctor(BasePermission):
    message = 'Only doctors can perform this action.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'doctor'
        )


class IsNurse(BasePermission):
    message = 'Only nurses can perform this action.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'nurse'
        )


class IsDoctorOrNurse(BasePermission):
    message = 'Only doctors or nurses can perform this action.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ('doctor', 'nurse')
        )


class IsDoctorOrAdmin(BasePermission):
    message = 'Only doctors or administrators can perform this action.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in ('doctor', 'admin')
        )


class IsAdminOrReadOnly(BasePermission):
    message = 'Only administrators can modify this resource.'

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.role == 'admin'
