from functools import wraps
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.shortcuts import redirect


def admin_required(view_func):
    """restricts a view to authenticated users with role == admin."""
    @wraps(view_func)
    @login_required
    def wrapper(request, *args, **kwargs):
        if not request.user.is_admin_user():
            messages.error(request, 'You do not have permission to access the admin dashboard.')
            return redirect('clinic:redirect_after_login')
        return view_func(request, *args, **kwargs)
    return wrapper


def patient_required(view_func):
    """restricts a view to authenticated users with role == patient."""
    @wraps(view_func)
    @login_required
    def wrapper(request, *args, **kwargs):
        if not request.user.is_patient_user():
            messages.error(request, 'This page is only available to patient accounts.')
            return redirect('dashboard:home')
        return view_func(request, *args, **kwargs)
    return wrapper
