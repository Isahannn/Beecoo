from rest_framework import viewsets, permissions
from rest_framework.pagination import PageNumberPagination
from ..models.Post import Post
from ..serializers.post import PostSerializer
from rest_framework.exceptions import NotFound
from rest_framework.decorators import action
from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from ..serializers.user import UserSerializer,FullUserProfileSerializer
import logging
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from ..models.social import Friendship



from random import sample

User = get_user_model()
logger = logging.getLogger(__name__)


class StandardPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.select_related('user').prefetch_related('tags', 'likes').distinct()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    pagination_class = StandardPagination

    def get_queryset(self):
        queryset = super().get_queryset()
        user_id = self.request.query_params.get('user')
        if user_id:
            logger.debug(f"Filtering posts by user_id: {user_id}")
            try:
                queryset = queryset.filter(user__id=user_id)
                logger.debug(f"Filtered posts count: {queryset.count()}")
            except ValueError as e:
                logger.error(f"Invalid user_id: {user_id}, error: {str(e)}")
                queryset = queryset.none()  # Возвращаем пустой queryset при неверном user_id
        return queryset

    def perform_create(self, serializer):
        logger.debug(f"Creating post for user: {self.request.user.username}")
        serializer.save(user=self.request.user)

    def list(self, request, *args, **kwargs):
        try:
            response = super().list(request, *args, **kwargs)
            logger.debug(f"List response: {response.data.get('count')} posts returned")
            return response
        except NotFound:
            logger.warning("No posts found, returning empty response")
            return Response({
                "results": [],
                "next": None,
                "previous": None,
                "count": 0
            })

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=True, methods=['post', 'get'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        post = self.get_object()
        user = request.user

        if request.method == 'GET':
            liked = user in post.likes.all()
            return Response({'liked': liked, 'likes_count': post.likes.count()}, status=status.HTTP_200_OK)

        if request.method == 'POST':
            if user in post.likes.all():
                post.likes.remove(user)
                liked = False
            else:
                post.likes.add(user)
                liked = True
            return Response({'liked': liked, 'likes_count': post.likes.count()}, status=status.HTTP_200_OK)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='friends')
    def friends(self, request):
        user = request.user
        friendships = Friendship.objects.filter(Q(user1=user) | Q(user2=user))
        friend_ids = []
        for friendship in friendships:
            if friendship.user1 == user:
                friend_ids.append(friendship.user2_id)
            else:
                friend_ids.append(friendship.user1_id)
        friends = User.objects.filter(id__in=friend_ids)
        page = self.paginate_queryset(friends)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(friends, many=True)
        return Response(serializer.data)