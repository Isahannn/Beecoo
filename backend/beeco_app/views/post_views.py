from rest_framework import viewsets, permissions
from rest_framework.pagination import PageNumberPagination
from ..models.Post import Post
from ..serializers.post import PostSerializer
from ..serializers.user import UserSerializer
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth.models import User
from random import sample


class PostPagination(PageNumberPagination):
    page_size = 10

class PostViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = ['rest_framework.permissions.IsAuthenticated']
    queryset = Post.objects.all().order_by("-created_at")
    serializer_class = PostSerializer
    pagination_class = PostPagination

    def get_queryset(self):
        user = self.request.user
        return Post.objects.exclude(author=user).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            return Response({'detail': 'Invalid page'}, status=400)


class UserViewSet(viewsets.ViewSet):
    @action(detail=False, methods=['get'], permission_classes=['rest_framework.permissions.IsAuthenticated'])
    def random(self, request):
        count = int(request.query_params.get('count', 3))
        users = User.objects.exclude(id=request.user.id)
        random_users = sample(list(users), min(count, len(users)))
        serializer = UserSerializer(random_users, many=True)
        return Response(serializer.data)

