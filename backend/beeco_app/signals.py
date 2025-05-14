from django.db.models.signals import post_save
from django.dispatch import receiver
from backend.beeco_app.models.Post import Post
from .models.social import Follow, Friendship


@receiver(post_save, sender=Post)
def add_created_as_admin( instance, created):
    if created and instance.user:
        pass


@receiver(post_save, sender=Follow)
def create_friendship_if_mutual( instance, created):
    if created:
        if Follow.objects.filter(
                follower=instance.following,
                following=instance.follower
        ).exists():
            Friendship.objects.get_or_create(
                user1=instance.follower,
                user2=instance.following
            )
