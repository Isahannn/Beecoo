from rest_framework import serializers
from .auth import UserSerializer
from ..models.Post import Post, Tag
from ..models.interaction import Like, Comment
from .tag import TagSerializer
from django.utils.translation import gettext_lazy as _
import logging

logger = logging.getLogger(__name__)

class PostSerializer(serializers.ModelSerializer):
    is_liked = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    user = UserSerializer(read_only=True)
    tags = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')
    tag_ids = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False,
    )

    class Meta:
        model = Post
        fields = ['id', 'title', 'description', 'user', 'created_at', 'updated_at',
                  'likes_count', 'is_liked', 'tags', 'image', 'tag_ids']

    def get_is_liked(self, obj):
        user = self.context.get('request').user
        if user and user.is_authenticated:
            return obj.likes.filter(id=user.id).exists()
        return False

    def get_likes_count(self, obj):
        return obj.likes.count()

    def create(self, validated_data):
        tag_ids = validated_data.pop('tag_ids', [])

        # Если tag_ids - список из одной строки, которая сама по себе JSON-массив, распарсим ее
        if len(tag_ids) == 1 and isinstance(tag_ids[0], str):
            try:
                import json
                possible_list = json.loads(tag_ids[0])
                if isinstance(possible_list, list):
                    tag_ids = possible_list
            except Exception:
                pass

        post = Post.objects.create(**validated_data)
        if tag_ids:
            tags = Tag.objects.filter(id__in=tag_ids)
            post.tags.set(tags)
        return post


class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            'id', 'author', 'post', 'parent_comment',
            'text', 'created_at', 'replies', 'likes'
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