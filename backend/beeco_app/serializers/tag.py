from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from ..models.tag import Tag

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
        return obj.post_set.count()

    def get_is_followed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.followers.filter(id=request.user.id).exists()
        return False

    def validate_name(self, value):
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

