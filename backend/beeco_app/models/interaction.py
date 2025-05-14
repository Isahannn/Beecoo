import uuid
from .user import User
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _




class Like(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='likes',
        verbose_name=_('user')
    )
    likes_count = models.IntegerField(default=0)
    post = models.ForeignKey(
        'beeco_app.Post',
        on_delete=models.CASCADE,
        related_name='likes',
        verbose_name=_('post')
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True, db_index=True)

    class Meta:
        unique_together = ('user', 'post')
        ordering = ['-created_at']
        verbose_name = _('like')
        verbose_name_plural = _('likes')
        indexes = [
            models.Index(fields=['user', 'post']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.user.username if self.user else 'Anonymous'} liked post {self.post.id}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if hasattr(self.post, 'update_likes_count'):
            self.post.update_likes_count()

    def delete(self, *args, **kwargs):
        post = self.post
        super().delete(*args, **kwargs)
        if hasattr(post, 'update_likes_count'):
            post.update_likes_count()


class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    post = models.ForeignKey('beeco_app.Post', on_delete=models.CASCADE, related_name='comments')
    parent_comment = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    text = models.TextField(_('text'))
    created_at = models.DateTimeField(_('created at'), default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('comment')
        verbose_name_plural = _('comments')

    def __str__(self):
        return f"Comment by {self.user} on {self.post}"
