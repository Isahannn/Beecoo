from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from Beeco.beeco_app.post.models.post import Post
from backend.beeco_app.post.serializers import PostSerializer, CommentSerializer
from backend.beeco_app.post.service.post_service import like_post, comment_post

User = get_user_model()

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user


class CommentPagination(PageNumberPagination):
    page_size = 10
    page_query_param = 'comment_page'


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at', 'tags__name']

    def get_queryset(self):
        queryset = super().get_queryset()
        tag_name = self.request.query_params.get('tag')
        if tag_name:
            queryset = queryset.filter(tags__name=tag_name)
        return queryset

    def retrieve(self, request, *args, **kwargs):
        post = self.get_object()
        serializer = self.get_serializer(post)

        comment_qs = post.comment_set.all().order_by('-created_at')
        paginator = CommentPagination()
        paginated_comments = paginator.paginate_queryset(comment_qs, request)

        comment_serializer = CommentSerializer(paginated_comments, many=True, context={'request': request})

        return Response({
            **serializer.data,
            'comments': comment_serializer.data,
            'comments_pagination': {
                'count': paginator.page.paginator.count,
                'next': paginator.get_next_link(),
                'previous': paginator.get_previous_link()
            }
        })


    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        post = self.get_object()
        like_post(request.user, post)
        return Response({"detail": "Post liked"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def comment(self, request, pk=None):
        post = self.get_object()
        text = request.data.get("text")
        if not text:
            return Response({"detail": "Text is required"}, status=status.HTTP_400_BAD_REQUEST)
        comment = comment_post(request.user, post, text)
        return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def edit_comment(self, request, pk=None):
        post = self.get_object()
        comment_id = request.data.get('comment_id')
        text = request.data.get('text')

        if not comment_id or not text:
            return Response({"detail": "comment_id and text are required"}, status=status.HTTP_400_BAD_REQUEST)

        comment = get_object_or_404(post.comment_set, id=comment_id)

        if comment.user != request.user:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        comment.text = text
        comment.save(update_fields=['text'])

        return Response(CommentSerializer(comment).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['delete'], permission_classes=[permissions.IsAuthenticated])
    def delete_comment(self, request, pk=None):
        post = self.get_object()
        comment_id = request.query_params.get('comment_id')

        if not comment_id:
            return Response({"detail": "comment_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        comment = get_object_or_404(post.comment_set, id=comment_id)

        if comment.user != request.user:
            return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)

        comment.delete()
        return Response({"detail": "Comment deleted"}, status=status.HTTP_204_NO_CONTENT)