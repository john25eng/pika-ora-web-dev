from django import forms
from clinic.models import Doctor, AppointmentSlot
from accounts.models import CustomUser


class BootstrapFormMixin:
    """applies bootstrap widget classes to every field automatically."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            if isinstance(field.widget, (forms.CheckboxInput,)):
                field.widget.attrs.update({'class': 'form-check-input'})
            elif isinstance(field.widget, forms.Select):
                field.widget.attrs.update({'class': 'form-select'})
            else:
                field.widget.attrs.update({'class': 'form-control'})


class DoctorForm(BootstrapFormMixin, forms.ModelForm):
    class Meta:
        model = Doctor
        fields = ['first_name', 'last_name', 'specialty', 'bio', 'photo', 'is_active']


class AppointmentSlotForm(BootstrapFormMixin, forms.ModelForm):
    class Meta:
        model = AppointmentSlot
        fields = ['doctor', 'date', 'start_time', 'end_time']
        widgets = {
            'date': forms.DateInput(attrs={'type': 'date'}),
            'start_time': forms.TimeInput(attrs={'type': 'time'}),
            'end_time': forms.TimeInput(attrs={'type': 'time'}),
        }

    def clean(self):
        cleaned_data = super().clean()
        start = cleaned_data.get('start_time')
        end = cleaned_data.get('end_time')
        if start and end and start >= end:
            raise forms.ValidationError('Start time must be before end time.')
        return cleaned_data


class PatientAccountForm(BootstrapFormMixin, forms.ModelForm):
    """used by admins to edit a patient's account details / active status."""
    class Meta:
        model = CustomUser
        fields = ['first_name', 'last_name', 'email', 'phone_number', 'is_active']
