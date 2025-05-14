from rest_framework import serializers
from backend.beeco_app.post.models import Post
from backend.beeco_app.post.models.comment import Comment
from backend.beeco_app.post.models.tag import Tag
from backend.beeco_app.post.models.like import Like
from django.utils.translation import gettext_lazy as _

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name', 'created_at']
        read_only_fields = ['id', 'created_at']


class PostSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    tags = serializers.PrimaryKeyRelatedField(many=True, queryset=Tag.objects.all())
    tag_ids = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(), write_only=True, many=True, required=False
    )

    class Meta:
        model = Post
        fields = ['id', 'title', 'description', 'created_at', 'updated_at', 'user', 'tags', 'tag_ids']
        read_only_fields = ['id', 'created_at', 'updated_at', 'user', 'tags']

    def create(self, validated_data):
        tags = validated_data.pop('tag_ids', [])
        post = Post.objects.create(**validated_data)
        post.tags.set(tags)
        return post

    def update(self, instance, validated_data):
        tags = validated_data.pop('tag_ids', None)
        instance = super().update(instance, validated_data)
        if tags is not None:
            instance.tags.set(tags)
        return instance


class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'post', 'parent_comment', 'text', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def validate(self, data):
        if data.get("parent_comment") and data["parent_comment"].post != data["post"]:
            raise serializers.ValidationError("Parent comment must belong to the same post.")
        return data


class LikeSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Like
        fields = ['id', 'user', 'post', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

    def validate(self, data):
        user = self.context['request'].user
        post = data.get('post')
        if Like.objects.filter(user=user, post=post).exists():
            raise serializers.ValidationError("You already liked this post.")
        return data


class TagSerializer(serializers.ModelSerializer):
    posts_count = serializers.SerializerMethodField()
    is_followed = serializers.SerializerMethodField()

    class Meta:
        model = Tag
        fields = [
            'id',
            'name',
            'created_at',
            'posts_count',
            'is_followed'
        ]
        read_only_fields = [
            'id',
            'created_at',
            'posts_count',
            'is_followed'
        ]

    def get_posts_count(self, obj):
        """Количество постов с этим тегом"""
        return obj.post_set.count()

    def get_is_followed(self, obj):
        """Проверяет, подписан ли текущий пользователь на тег"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.followers.filter(id=request.user.id).exists()
        return False

    def validate_name(self, value):
        """Валидация названия тега"""
        value = value.strip().lower()
        if len(value) < 2:
            raise serializers.ValidationError(_("Tag name must be at least 2 characters long."))
        if len(value) > 50:
            raise serializers.ValidationError(_("Tag name cannot exceed 50 characters."))
        return value

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['name'] = instance.name.capitalize()
        return representation