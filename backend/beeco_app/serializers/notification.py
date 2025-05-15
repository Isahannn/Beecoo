from rest_framework import serializers
from .auth import UserSerializer
from ..models.notification import Notification

class NotificationSerializer(serializers.ModelSerializer):
    actor = UserSerializer(read_only=True, source='sender')
    target = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id', 'actor', 'target', 'verb',
            'is_read', 'created_at'
        ]
        read_only_fields = fields

    def get_target(self, obj):
        if obj.content_object:
            return str(obj.content_object)
        return None
