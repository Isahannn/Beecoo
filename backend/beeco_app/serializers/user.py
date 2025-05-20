from rest_framework import serializers
from ..models.user import User
from ..models.social import Follow, Friendship
from django.db.models import Q

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    is_friend = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()
    is_followed_by = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'full_name', 'bio', 'avatar', 'is_friend', 'is_following', 'is_followed_by']

    def get_is_friend(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Friendship.objects.filter(
                Q(user1=request.user, user2=obj) | Q(user1=obj, user2=request.user)
            ).exists()
        return False

    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Follow.objects.filter(follower=request.user, following=obj).exists()
        return False

    def get_is_followed_by(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Follow.objects.filter(follower=obj, following=request.user).exists()
        return False

class FullUserProfileSerializer(UserSerializer):
    stats = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['stats']

    def get_stats(self, obj):
        return {
            'followers_count': obj.followers.count(),
            'following_count': obj.following.count(),
            'friends_count': obj.friends.count(),
            'posts_count': obj.posts.count()
        }