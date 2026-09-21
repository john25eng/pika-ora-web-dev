from django.contrib.auth import login
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib import messages
from django.shortcuts import render, redirect
from django.urls import reverse_lazy
from .forms import PatientRegistrationForm


def register_view(request):
    if request.user.is_authenticated:
        return redirect('clinic:redirect_after_login')

    if request.method == 'POST':
        form = PatientRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f'Welcome, {user.first_name}! Your account has been created.')
            return redirect('clinic:redirect_after_login')
    else:
        form = PatientRegistrationForm()

    return render(request, 'accounts/register.html', {'form': form})


class CustomLoginView(LoginView):
    template_name = 'accounts/login.html'
    redirect_authenticated_user = True


class CustomLogoutView(LogoutView):
    next_page = reverse_lazy('accounts:login')
