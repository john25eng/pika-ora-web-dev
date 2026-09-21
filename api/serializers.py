from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from clinic.models import Doctor, AppointmentSlot, Appointment

User = get_user_model()


# ---------- users / auth ----------

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name',
            'email', 'phone_number', 'role', 'is_active',
        ]
        read_only_fields = ['id', 'role']


class RegisterSerializer(serializers.ModelSerializer):
    """Public registration - always creates a patient account, same rule as the
    template-based PatientRegistrationForm."""

    password = serializers.CharField(write_only=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, label='Confirm password')

    class Meta:
        model = User
        fields = [
            'username', 'first_name', 'last_name', 'email',
            'phone_number', 'password', 'password2',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({'password2': "Passwords don't match."})
        if User.objects.filter(username=attrs['username']).exists():
            raise serializers.ValidationError({'username': 'That username is already taken.'})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(role=User.Role.PATIENT, **validated_data)
        user.set_password(password)
        user.save()
        return user


class PatientAccountSerializer(serializers.ModelSerializer):
    """Used by admins to edit a patient's account details / active status."""

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'phone_number', 'is_active']


# ---------- clinic domain ----------

class DoctorSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = Doctor
        fields = [
            'id', 'first_name', 'last_name', 'full_name', 'specialty',
            'bio', 'photo', 'is_active', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class AppointmentSlotSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.full_name', read_only=True)

    class Meta:
        model = AppointmentSlot
        fields = [
            'id', 'doctor', 'doctor_name', 'date', 'start_time',
            'end_time', 'is_booked', 'created_at',
        ]
        read_only_fields = ['id', 'is_booked', 'created_at']

    def validate(self, attrs):
        start = attrs.get('start_time', getattr(self.instance, 'start_time', None))
        end = attrs.get('end_time', getattr(self.instance, 'end_time', None))
        if start and end and start >= end:
            raise serializers.ValidationError('Start time must be before end time.')
        return attrs


class AppointmentSerializer(serializers.ModelSerializer):
    """Read-heavy serializer used for listing appointments (patient + admin views)."""

    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    doctor_name = serializers.CharField(source='slot.doctor.full_name', read_only=True)
    date = serializers.DateField(source='slot.date', read_only=True)
    start_time = serializers.TimeField(source='slot.start_time', read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_name', 'slot', 'doctor_name',
            'date', 'start_time', 'status', 'notes', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'patient', 'slot', 'status', 'created_at', 'updated_at']


class AppointmentNoteSerializer(serializers.ModelSerializer):
    """Lets a patient edit only the note attached to their own appointment."""

    class Meta:
        model = Appointment
        fields = ['id', 'notes']
