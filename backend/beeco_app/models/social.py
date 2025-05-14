from django.db import models
from .user import User

class Follow(models.Model):
    follower = models.ForeignKey(
        User,
        related_name='user_following',
        on_delete=models.CASCADE,
        verbose_name='Подписчик'
    )
    following = models.ForeignKey(
        User,
        related_name='user_followers',
        on_delete=models.CASCADE,
        verbose_name='Автор'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата подписки'
    )

    class Meta:
        unique_together = ('follower', 'following')
        verbose_name = 'Подписка'
        verbose_name_plural = 'Подписки'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.follower} → {self.following}'


class Friendship(models.Model):
    user1 = models.ForeignKey(
        User,
        related_name='friendships_initiated',
        on_delete=models.CASCADE,
        verbose_name='Пользователь 1'
    )
    user2 = models.ForeignKey(
        User,
        related_name='friendships_received',
        on_delete=models.CASCADE,
        verbose_name='Пользователь 2'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Дата создания'
    )

    class Meta:
        unique_together = ('user1', 'user2')
        verbose_name = 'Дружба'
        verbose_name_plural = 'Дружбы'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user1} ↔ {self.user2}'