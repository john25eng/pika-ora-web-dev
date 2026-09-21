from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """Allows access only to authenticated users with role == admin."""

    message = 'You do not have permission to perform this action.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_admin_user()
        )


class IsPatientRole(BasePermission):
    """Allows access only to authenticated users with role == patient."""

    message = 'This action is only available to patient accounts.'

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_patient_user()
        )
