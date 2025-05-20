from rest_framework import viewsets
from ..models.Post import Tag
from rest_framework.permissions import AllowAny
from ..serializers.tag import TagSerializer

class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [AllowAny]