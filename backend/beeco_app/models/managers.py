from django.contrib.auth.base_user import BaseUserManager
from django.utils import timezone
from django.db import models
from django.db.models import Count, Q
from polymorphic.managers import PolymorphicManager


class CustomUserManager(BaseUserManager):

    def create_user(self, email, first_name, last_name, password=None, **extra_fields):
        if not email:
            raise ValueError('Email должен быть задан')
        email = self.normalize_email(email)
        user = self.model(
            email=email,
            first_name=first_name,
            last_name=last_name,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name, last_name,password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Суперпользователь должен иметь is_staff=True')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Суперпользователь должен иметь is_superuser=True')

        return self.create_user(email, first_name, last_name, password, **extra_fields)


class PostManager(PolymorphicManager):

    def get_queryset(self):
        return super().get_queryset().select_related('user') \
            .prefetch_related('tags') \
            .annotate(
                likes_count=Count('likes', distinct=True),
                comments_count=Count('comments', distinct=True)
            )

    def feed_for_user(self, user):

        following_pks = user.following.values_list('followed_id', flat=True)
        return self.get_queryset().filter(
            Q(user__in=following_pks) | Q(user=user)
        ).order_by('-created_at')

    def popular(self, days=7, limit=10):

        since = timezone.now() - timezone.timedelta(days=days)
        return self.get_queryset().filter(
            created_at__gte=since
        ).order_by('-likes_count')[:limit]


class GroupMemberManager(PolymorphicManager):

    def admins(self):

        return self.filter(group_members__role='admin')

    def open_groups(self):
        return self.filter(status='open', group_members__isnull=False)


class MembershipManager(models.Manager):

    def add_member(self, group, user, role='member'):

        if not group.can_user_join(user):
            return None
        return self.create(group=group, user=user, role=role)

    def remove_member(self, group, user):

        return self.filter(group=group, user=user).delete()

    def admins(self, group):
        return self.filter(group=group, role='admin')

    def members(self, group):

        return self.filter(group=group)
