from rest_framework import serializers
from backend.beeco_app.user.models.user import User
from backend.beeco_app.post.models.post import Post
from backend.beeco_app.post.serializers import PostSerializer


class FullUserProfileSerializer(serializers.ModelSerializer):
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    friends_count = serializers.SerializerMethodField()
    posts = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'nickname',
            'avatar', 'location', 'bio', 'date_of_birth', 'date_joined',
            'followers_count', 'following_count', 'friends_count', 'posts'
        ]

    def get_followers_count(self, obj):
        return obj.followers.count()

    def get_following_count(self, obj):
        return obj.following.count()

    def get_friends_count(self, obj):
        return obj.friends.count()

    def get_posts(self, obj):
        posts = Post.objects.filter(author=obj).order_by('-created_at')
        return PostSerializer(posts, many=True).data
