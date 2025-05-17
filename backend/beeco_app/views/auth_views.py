import logging
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from ..models.user import User
from ..serializers.auth import CustomAuthTokenSerializer, RegisterSerializer
from ..serializers.user import UserSerializer

logger = logging.getLogger(__name__)

class CustomAuthToken(ObtainAuthToken):
    serializer_class = CustomAuthTokenSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)

class CustomTokenObtainView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        logger.debug(f"Login attempt with email: {email}")

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

class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.save()
        token = Token.objects.create(user=user)

        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    authentication_classes = [TokenAuthentication]

    def post(self, request):
        try:
            request.user.auth_token.delete()
            return Response({"detail": "Успешный выход."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"detail": "Недействительный токен."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def check_email_exists(request):
    email = request.GET.get('email')
    exists = User.objects.filter(email=email).exists()
    return Response({'exists': exists})

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def random_users(request):
    count = int(request.query_params.get('count', 4))
    exclude_id = request.user.id
    users = User.objects.exclude(id=exclude_id).order_by('?')[:count]
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([permissions.IsAuthenticated])
def verify_token(request):
    return Response({
        "status": "valid",
        "user": UserSerializer(request.user).data
    }, status=status.HTTP_200_OK)

def login_view(request):
    user = authenticate(username=request.POST['username'], password=request.POST['password'])
    if user:
        token, created = Token.objects.get_or_create(user=user)
        return Response({'token': token.key})
    return Response({'error': 'Invalid credentials'}, status=401)