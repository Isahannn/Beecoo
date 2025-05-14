from rest_framework import generics, permissions
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from backend.beeco_app.user.serializers.serializers import UserSerializer
from rest_framework.generics import RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from backend.beeco_app.user.models.user import User
from backend.beeco_app.user.serializers.profile_detail_serializer import FullUserProfileSerializer
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
