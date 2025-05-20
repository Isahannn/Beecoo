from rest_framework import serializers
from ..models.notification import Notification
from .auth import UserSerializer

class NotificationSerializer(serializers.ModelSerializer):
    sender = UserSerializer()
    post_title = serializers.CharField(source='content_object.title', read_only=True, allow_null=True)

    class Meta:
        model = Notification
        fields = ['id', 'sender', 'post_title', 'notification_type', 'action', 'created_at', 'is_read']