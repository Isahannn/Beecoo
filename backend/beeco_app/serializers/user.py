from rest_framework import serializers
from ..models.user import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name','date_of_birth', 'avatar', 'date_joined']

class FullUserProfileSerializer(UserSerializer):
    stats = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['stats']

    def get_stats(self, obj):
        return {
            'followers_count': obj.followers.count(),
            'following_count': obj.following.count(),
            'friends_count': obj.friends.count(),
            'posts_count': obj.post_set.count()
        }
