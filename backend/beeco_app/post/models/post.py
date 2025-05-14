from backend.beeco_app.post.models.base_post import BasePost
from backend.beeco_app.managers import PostManager
from django.db import models
from django.utils.translation import gettext_lazy as _


class Post(BasePost):
    objects = PostManager()

    tags = models.ManyToManyField(
        'Tag',
        related_name='posts',
        verbose_name=_('tags'),
        blank=True
    )

    class Meta:
        verbose_name = _('пост')
        verbose_name_plural = _('посты')

    def save(self, *args, **kwargs):
        if not self.type:
            self.type = BasePost.Type.POST
        super().save(*args, **kwargs)