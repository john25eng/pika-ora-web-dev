from django import forms
from .models import Appointment


class AppointmentNoteForm(forms.ModelForm):
    """lets a patient edit the note attached to their own appointment."""
    class Meta:
        model = Appointment
        fields = ['notes']
        widgets = {
            'notes': forms.Textarea(attrs={
                'rows': 3, 'class': 'form-control',
                'placeholder': 'Reason for visit, symptoms, etc. (optional)'
            }),
        }
