import uuid
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _

class Tag(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(_('name'), max_length=50, unique=True)
    created_at = models.DateTimeField(_('created at'), default=timezone.now, db_index=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _('tag')
        verbose_name_plural = _('tags')
        ordering = ['name']
