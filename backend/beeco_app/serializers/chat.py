from rest_framework import serializers
from .auth import UserSerializer
from ..models.chat import Chat, ChatMessage

class ChatSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Chat
        fields = [
            'id', 'participants',
            'last_message', 'unread_count',
            'created_at', 'updated_at'
        ]

    def get_last_message(self, obj):
        last_msg = obj.messages.last()
        if last_msg:
            return ChatMessageSerializer(last_msg).data
        return None

    def get_unread_count(self, obj):
        user = self.context['request'].user
        return obj.messages.filter(
            is_read=False
        ).exclude(sender=user).count()


class ChatMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)

    class Meta:
        model = ChatMessage
        fields = [
            'id', 'chat', 'sender',
            'text', 'created_at', 'is_read'
        ]
        read_only_fields = [
            'id', 'chat', 'sender',
            'created_at'
        ]
