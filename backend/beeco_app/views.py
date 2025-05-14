from rest_framework import viewsets
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db import models
from .models.social import Follow, Friendship
from .models.chat import  Chat, ChatMessage
from .models.notification import Notification
from .serializers import NotificationSerializer, ChatSerializer, ChatMessageSerializer,UserSerializer,FullUserProfileSerializer
from rest_framework import generics, permissions
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.generics import RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models.user import User

from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import NotFound
from rest_framework.filters import SearchFilter

class UserPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class PublicUserProfileView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    serializer_class = FullUserProfileSerializer
    lookup_field = 'id'


class FollowToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        try:
            target_user = User.objects.get(id=id)
        except User.DoesNotExist:
            raise NotFound(detail="User not found")

        current_user = request.user

        if target_user == current_user:
            return Response({'detail': "You cannot follow yourself."}, status=400)

        if target_user in current_user.following.all():
            current_user.following.remove(target_user)
            return Response({'detail': "Unfollowed"}, status=200)
        else:
            current_user.following.add(target_user)
            return Response({'detail': "Followed"}, status=200)


class CustomAuthToken(ObtainAuthToken):

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        token = Token.objects.get(key=response.data['token'])
        user = token.user
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data
        })


class RegisterUserView(generics.CreateAPIView):

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        Token.objects.create(user=user)


class UserProfileView(APIView):

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class FollowersListView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = UserPagination
    filter_backends = [SearchFilter]
    search_fields = ['nickname', 'email']

    def get(self, request):
        followers = request.user.followers.all()
        paginator = self.pagination_class()
        followers = self.filter_queryset(followers)
        paginated_followers = paginator.paginate_queryset(followers, request)
        serializer = FullUserProfileSerializer(paginated_followers, many=True)
        return paginator.get_paginated_response(serializer.data)


class FollowingListView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = UserPagination
    filter_backends = [SearchFilter]
    search_fields = ['nickname', 'email']

    def get(self, request):
        following = request.user.following.all()
        paginator = self.pagination_class()
        following = self.filter_queryset(following)
        paginated_following = paginator.paginate_queryset(following, request)
        serializer = FullUserProfileSerializer(paginated_following, many=True)
        return paginator.get_paginated_response(serializer.data)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def follow_user(request, user_id):
    target_user = User.objects.get(id=user_id)
    Follow.objects.get_or_create(
        follower=request.user,
        following=target_user
    )
    return Response({"status": "subscribed"}, status=status.HTTP_201_CREATED)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_friendship(request, user_id):
    is_friend = Friendship.objects.filter(
        models.Q(user1=request.user, user2_id=user_id) |
        models.Q(user1_id=user_id, user2=request.user)
    ).exists()
    return Response({"is_friend": is_friend})

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

class ChatViewSet(viewsets.ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer

class ChatMessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer


class CustomTokenObtainView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            })
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


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
