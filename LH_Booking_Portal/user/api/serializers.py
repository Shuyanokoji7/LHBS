from rest_framework import serializers
from user.models import User, Authority, UserAuthority
from rest_framework.authtoken.models import Token
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.authtoken.models import Token
from rest_framework import serializers


class AuthoritySerializer(serializers.ModelSerializer):
    class Meta:
        model = Authority
        fields = ['id', 'name', 'email']


class UserAuthoritySerializer(serializers.ModelSerializer):
    authority = AuthoritySerializer()  # Nested representation

    class Meta:
        model = UserAuthority
        fields = ['authority', 'order']


class UserAuthorityCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserAuthority
        fields = ['user', 'authority', 'order']

    def create(self, validated_data):
        return UserAuthority.objects.create(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    # Expect input as a list of authority IDs.
    authorities = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    # For output, return the ordered authorities in a nested representation.
    ordered_authorities = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        # Including the user's id ensures we have a reference to the created user.
        fields = ['id', 'username', 'email', 'role', 'authorities', 'ordered_authorities']

    def get_ordered_authorities(self, obj):
        user_auths = obj.get_ordered_authorities()
        return UserAuthoritySerializer(user_auths, many=True).data

    def create(self, validated_data):
        # Extract the list of authority IDs; default to empty if not provided.
        authorities_ids = validated_data.pop('authorities', [])
        random_password = get_random_string(12)
        user = User(**validated_data)
        user.set_password(random_password)
        user.save()

        # Create UserAuthority entries preserving the order sent.
        for order, authority_id in enumerate(authorities_ids):
            try:
                authority_instance = Authority.objects.get(id=authority_id)
            except Authority.DoesNotExist:
                raise serializers.ValidationError(f"Authority with id {authority_id} does not exist.")
            UserAuthority.objects.create(user=user, authority=authority_instance, order=order)

        token, _ = Token.objects.get_or_create(user=user)

        # Prepare a comma-separated string of authority names for the email.
        user_auths = user.get_ordered_authorities()
        authority_names = ", ".join([ua.authority.name for ua in user_auths])

        send_mail(
            'Your New Account Details',
            (
                f'Hello {user.username},\n\nYour account has been created successfully!\n'
                f'Your login credentials:\n'
                f'Username: {user.username}\n'
                f'Password: {random_password}\n'
                f'Auth Token: {token.key}\n\n'
                f'Your clearance authorities (in order): {authority_names}'
            ),
            settings.EMAIL_HOST_USER,  # Sender email
            [user.email],  # Recipient email
            fail_silently=False,
        )

        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        from django.contrib.auth import authenticate
        user = authenticate(username=data['username'], password=data['password'])

        if user is None:
            raise serializers.ValidationError("Invalid username or password")

        token, _ = Token.objects.get_or_create(user=user)

        return {'token': token.key, 'user': UserSerializer(user).data}