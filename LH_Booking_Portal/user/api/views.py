from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from user.api.permissions import IsAdmin, IsFaculty, IsStudent 
from django.contrib.auth.tokens import default_token_generator
from rest_framework.authtoken.models import Token
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from django.core.mail import send_mail
from user.models import Authority
from user.api.serializers import UserSerializer, LoginSerializer, AuthoritySerializer, UserAuthorityCreateSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

    def create(self, request, *args, **kwargs):
        print(f"User: {request.user}, Role: {request.user.role}")
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            {"message": "User registered successfully, email sent.", "user": serializer.data},
            status=status.HTTP_201_CREATED
        )

class GetUserView(ListAPIView):
    queryset = User.objects.all()  
    serializer_class = UserSerializer  
    permission_classes = [IsAdmin]  
    
    def get_queryset(self):
        queryset = super().get_queryset()
        username = self.request.query_params.get("username", None)
        if username:
            queryset = queryset.filter(username__icontains=username)
        return queryset


class LoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):
        # print("Received login request:", request.data)  # Debugging
        
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"error": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)
        
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            return Response({"token": token.key, "user_id": user.id, "role": user.role}, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials."}, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]  # ✅ This allows anyone to access this view

    def post(self, request):
        email = request.data.get("email")
        user = User.objects.filter(email=email).first()

        if user:
            token = default_token_generator.make_token(user)
            reset_link = f"http://localhost:3000/reset-password/{user.pk}/{token}"

            send_mail(
                subject="Password Reset Request",
                message=f"Click the link below to reset your password:\n{reset_link}",
                from_email="admin@yourdomain.com",
                recipient_list=[user.email],
                fail_silently=False,
            )

            return Response({"message": "Reset link sent."}, status=status.HTTP_200_OK)
        
        return Response({"error": "User not found"}, status=status.HTTP_400_BAD_REQUEST)
    

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny] 

    def post(self, request, user_id, token):
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"error": "Invalid user"}, status=status.HTTP_400_BAD_REQUEST)

        print("Received request data:", request.data)  # Debugging

        if default_token_generator.check_token(user, token):
            new_password = request.data.get("password")
            
            if not new_password:
                return Response({"error": "Password is required"}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()

            return Response({"message": "Password has been reset successfully"}, status=status.HTTP_200_OK)
        
        return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        if request.auth:
            request.auth.delete()
            return Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid request or already logged out"}, status=status.HTTP_400_BAD_REQUEST)


class AuthorityListView(generics.ListAPIView):
    
    permission_classes = [IsAdmin]
    queryset = Authority.objects.all()
    serializer_class = AuthoritySerializer

class CreateAuthorityView(generics.CreateAPIView):

    permission_classes = [IsAdmin]
    queryset = Authority.objects.all()
    serializer_class = AuthoritySerializer
