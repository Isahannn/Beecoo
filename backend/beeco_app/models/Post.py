import uuid
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .user import User

class BasePost(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    title = models.CharField(_('Заголовок'), max_length=100, blank=True)
    user = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='posts'
    )
    description = models.TextField(_('Описание'), blank=True)
    created_at = models.DateTimeField(_('Дата создания'), default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(_('Дата обновления'), auto_now=True)
    tags = models.ManyToManyField(
        'Tag',
        related_name='posts',
        blank=True,
        verbose_name=_('Теги')
    )

    objects = models.Manager()

    class Meta:
        abstract = True
        ordering = ['-created_at']
        verbose_name = _('базовый пост')
        verbose_name_plural = _('базовые посты')

    def __str__(self):
        return self.title or f"Post {self.id}"

class Post(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Post by {self.user.username}"