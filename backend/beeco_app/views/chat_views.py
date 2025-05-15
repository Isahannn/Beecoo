from rest_framework import viewsets
from ..models.chat import Chat, ChatMessage
from ..serializers.chat import ChatSerializer, ChatMessageSerializer


class ChatViewSet(viewsets.ModelViewSet):
    queryset = Chat.objects.all()
    serializer_class = ChatSerializer


class ChatMessageViewSet(viewsets.ModelViewSet):
    queryset = ChatMessage.objects.all()
    serializer_class = ChatMessageSerializer
