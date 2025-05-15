from rest_framework import serializers
from .auth import UserSerializer
from ..models.Post import Post
from ..models.interaction import Like, Comment
from .tag import TagSerializer
from django.utils.translation import gettext_lazy as _

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    tag_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Tag.objects.all(),
        write_only=True,
        source='tags'
    )
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'title', 'content', 'author', 'tags',
            'tag_ids', 'created_at', 'updated_at',
            'likes_count', 'comments_count', 'is_liked'
        ]
        read_only_fields = [
            'id', 'author', 'created_at',
            'updated_at', 'tags'
        ]

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(user=request.user).exists()
        return False


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'author', 'post', 'parent_comment',
            'text', 'created_at', 'replies'
        ]
        read_only_fields = ['id', 'author', 'created_at']

    def get_replies(self, obj):
        replies = obj.replies.all()
        return CommentSerializer(replies, many=True).data


class LikeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Like
        fields = ['id', 'user', 'post', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

    def validate(self, data):
        if Like.objects.filter(
                user=self.context['request'].user,
                post=data['post']
        ).exists():
            raise serializers.ValidationError(
                _("You already liked this post.")
            )
        return data
