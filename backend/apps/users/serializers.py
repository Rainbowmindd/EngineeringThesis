from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password

User=get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    email=serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )

    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model=User
        fields = ('username', 'password', 'password2', 'email', 'first_name', 'last_name', 'role')
        # extra_kwargs = {
        #     'first_name': {'required': True},
        #     'last_name': {'required': True},
        # }
        def validate(selfself, attrs):
            if attrs['password'] != attrs['password2']:
                raise serializers.ValidationError({"password": "Password fields didn't match."})
            return attrs

        def create (self, validated_data):
            validated_data.pop('password2')
            user = User.objects.create_user(**validated_data)
            return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role')
