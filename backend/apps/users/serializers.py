from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password
from apps.schedules.models import AvailableSlot
from apps.reservations.models import Reservation

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )

    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name', 'role')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'student'),
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role')

#admin section
class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer dla użytkowników w panelu admina"""
    full_name = serializers.SerializerMethodField()
    consultations_count = serializers.SerializerMethodField()
    reservations_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'role', 'is_active', 'date_joined',
            'consultations_count', 'reservations_count'
        ]
        read_only_fields = ['id', 'date_joined']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}" if obj.first_name else obj.username

    def get_consultations_count(self, obj):
        """Liczba konsultacji dla wykładowcy"""
        if obj.role == 'lecturer':
            return AvailableSlot.objects.filter(lecturer=obj).count()
        return 0

    def get_reservations_count(self, obj):
        """Liczba rezerwacji dla studenta"""
        if obj.role == 'student':
            return Reservation.objects.filter(student=obj).count()
        return 0


class AdminReservationSerializer(serializers.ModelSerializer):
    """Serializer dla rezerwacji w panelu admina"""
    student_name = serializers.SerializerMethodField()
    lecturer_name = serializers.SerializerMethodField()

    class Meta:
        model = Reservation
        fields = [
            'id', 'student', 'student_name', 'time_window',
            'lecturer_name', 'start_time', 'status', 'created_at'
        ]

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}" if obj.student.first_name else obj.student.username

    def get_lecturer_name(self, obj):
        lecturer = obj.time_window.lecturer
        return f"{lecturer.first_name} {lecturer.last_name}" if lecturer.first_name else lecturer.username