import logging
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from ..serializers.user import UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from ..models.user import User
from ..serializers.auth import RegisterSerializer

logger = logging.getLogger(__name__)


class CustomAuthToken(APIView):
    def post(self, request, *args, **kwargs):
        identifier = request.data.get('identifier')
        password = request.data.get('password')
        logger.debug(f"Login attempt with email: {identifier}")

        if not identifier or not password:
            logger.error("Missing email or password")
            return Response(
                {'detail': 'Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        user = authenticate(request=request, email=identifier, password=password)
        if not user:
            logger.warning(f"Invalid credentials for email: {identifier}")
            return Response(
                {'detail': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        token, created = Token.objects.get_or_create(user=user)
        logger.info(f"User {identifier} authenticated successfully")
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)


class CustomTokenObtainView(APIView):
    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        logger.debug(f"Login attempt with email: {email}")  # Отладка

        if not email or not password:
            logger.error("Missing email or password")
            return Response(
                {'detail': 'Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(email=email, password=password)
        if user:
            logger.info(f"User {email} authenticated successfully")
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)

        logger.warning(f"Invalid credentials for email: {email}")
        return Response(
            {'detail': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )


class LoginView(APIView):
    def post(self, request):
        logger.info(f"Login request data: {request.data}")
        email = request.data.get('email') or request.data.get('identifier')  # Support both
        password = request.data.get('password')
        if not email or not password:
            logger.error("Missing email or password")
            return Response({'error': 'Missing email or password'}, status=status.HTTP_400_BAD_REQUEST)
        user = authenticate(request=request, email=email, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            logger.info(f"User {email} authenticated successfully")
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data,
            })
        logger.warning(f"Invalid credentials for email: {email}")
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
class RegisterView(APIView):
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        if not email or not password:
            return Response({'error': 'Missing email or password'}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already taken'}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(email=email, password=password)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
        })


class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return token


class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def check_email_exists(request):
    email = request.GET.get('email')
    exists = User.objects.filter(email=email).exists()
    return Response({'exists': exists})
