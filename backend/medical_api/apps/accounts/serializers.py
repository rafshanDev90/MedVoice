from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer as BaseTokenObtainPairSerializer,
    TokenRefreshSerializer as BaseTokenRefreshSerializer,
)
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

ALLOWED_ROLES = [choice[0] for choice in User._meta.get_field('role').choices]


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    specialty = serializers.CharField(source='specialization', read_only=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'full_name',
            'role', 'specialty', 'license_number', 'avatar_url',
        ]
        read_only_fields = ['id', 'username']

    def get_full_name(self, obj):
        name = f"{obj.first_name} {obj.last_name}".strip()
        if not name:
            return obj.username
        if obj.role == 'doctor':
            return f"Dr. {name}" if not name.startswith('Dr.') else name
        return name

    def get_avatar_url(self, obj):
        return None


class UserMeSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        read_only_fields = ['id', 'username', 'role']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=ALLOWED_ROLES, default='doctor')

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'role', 'specialization', 'license_number']
        read_only_fields = ['id']

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return attrs


class CustomTokenObtainPairSerializer(BaseTokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        return token

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields[self.username_field].required = False
        self.fields['email'] = serializers.CharField(write_only=True, required=False)

    def validate(self, attrs):
        identifier = attrs.get(self.username_field) or attrs.get('email')
        if not identifier:
            raise serializers.ValidationError({
                self.username_field: 'This field is required.'
            })
        try:
            user = User.objects.get(email__iexact=identifier)
        except User.DoesNotExist:
            attrs[self.username_field] = identifier
        else:
            attrs[self.username_field] = user.username
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class CustomTokenRefreshSerializer(BaseTokenRefreshSerializer):
    def validate(self, attrs):
        user = None
        try:
            raw = RefreshToken(attrs["refresh"], verify=False)
            user = User.objects.get(pk=raw[api_settings.USER_ID_CLAIM])
        except (User.DoesNotExist, KeyError):
            pass
        data = super().validate(attrs)
        if user is not None:
            data["user"] = UserSerializer(user).data
        return data
