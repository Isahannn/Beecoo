from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .user import User
import uuid


class Tag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(_('name'), max_length=50, unique=True)
    likes_count = models.IntegerField(_('likes count'), default=0)

    def __str__(self):
        return self.name

    def update_likes_count(self):
        self.likes_count = sum(post.likes_count for post in self.posts.all())
        self.save(update_fields=['likes_count'])

    class Meta:
        verbose_name = _('tag')
        verbose_name_plural = _('tags')
        ordering = ['name']

class BasePost(models.Model):
    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    title = models.CharField(_('Заголовок'), max_length=100, blank=True)
    likes_count = models.IntegerField(_('likes count'), default=0)
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='posts',
        verbose_name=_('Пользователь')
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
    image = models.ImageField(upload_to='posts/', null=True, blank=True)

    objects = models.Manager()

    class Meta:
        abstract = True
        ordering = ['-created_at']
        verbose_name = _('базовый пост')
        verbose_name_plural = _('базовые посты')

    def __str__(self):
        return self.title or f'Post {self.id}'

    def update_likes_count(self):
        self.likes_count = self.likes.count()
        self.save(update_fields=['likes_count'])

class Post(BasePost):
    class Meta:
        verbose_name = _('пост')
        verbose_name_plural = _('посты')