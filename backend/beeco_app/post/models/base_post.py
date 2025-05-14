from django.db import models
from django.utils.translation import gettext_lazy as _
import uuid
from django.utils import timezone


class BasePost(models.Model):
    class Status(models.TextChoices):
        OPEN = 'open', _('Открытая')
        CLOSED = 'closed', _('Закрытая')
        DRAFT = 'draft', _('Черновик')

    class Type(models.TextChoices):
        POST = 'post', _('Пост')
        GROUP = 'group', _('Группа')

    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    title = models.CharField(_('Заголовок'), max_length=100, blank=True)
    user = models.ForeignKey(
        'User',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='%(class)s'
    )
    description = models.TextField(_('Описание'), blank=True)
    created_at = models.DateTimeField(_('Дата создания'), default=timezone.now, db_index=True)
    updated_at = models.DateTimeField(_('Дата обновления'), auto_now=True)
    tags = models.ManyToManyField(
        'Tag',
        related_name='%(class)s',
        blank=True,
        verbose_name=_('Теги')
    )
    type = models.CharField(max_length=10, choices=Type.choices, default=Type.POST, null=False, editable=False)

    objects = models.Manager()

    class Meta:
        abstract = True
        ordering = ['-created_at']
        verbose_name = _('базовый пост')
        verbose_name_plural = _('базовые посты')

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.type:
            self.type = self.Type.POST
        super().save(*args, **kwargs)
