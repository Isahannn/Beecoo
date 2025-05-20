from rest_framework.views import APIView
from ..models.notification import Notification
from ..models.user import User
from ..models.social import Follow, Friendship
from ..serializers.user import FullUserProfileSerializer, UserSerializer
from rest_framework.pagination import PageNumberPagination
from rest_framework.filters import SearchFilter
from rest_framework.generics import ListAPIView
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.db import models
import random
import uuid
import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from ..serializers.user import UserSerializer

logger = logging.getLogger(__name__)

class UserPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def random_users(request):
    count = int(request.query_params.get('count', 4))
    exclude_id = request.user.id

    followed_ids = Follow.objects.filter(follower=request.user).values_list('following_id', flat=True)
    users = User.objects.exclude(id__in=[exclude_id, *followed_ids])
    users = list(users)
    random.shuffle(users)

    serializer = UserSerializer(users[:count], many=True)
    return Response(serializer.data)

class UserListView(ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    pagination_class = UserPagination
    filter_backends = [SearchFilter]
    search_fields = ['first_name', 'last_name', 'email']

    def get_queryset(self):
        return User.objects.exclude(id=self.request.user.id)

class UserProfileVieww(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        try:
            user = User.objects.get(id=id)
            serializer = FullUserProfileSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            raise NotFound(detail="User not found")


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from ..models.user import User
from ..models.social import Follow
from rest_framework.exceptions import NotFound


class FollowToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        try:
            user_to_follow = User.objects.get(id=id)
            if user_to_follow == request.user:
                return Response({'detail': 'Нельзя подписаться на самого себя'}, status=status.HTTP_400_BAD_REQUEST)

            follow, created = Follow.objects.get_or_create(follower=request.user, following=user_to_follow)
            if not created:
                return Response({'detail': 'Вы уже подписаны'}, status=status.HTTP_400_BAD_REQUEST)

            return Response({'detail': 'Подписка оформлена'}, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            raise NotFound(detail='Пользователь не найден')

    def delete(self, request, id):
        try:
            user_to_unfollow = User.objects.get(id=id)
            follow = Follow.objects.filter(follower=request.user, following=user_to_unfollow).first()
            if not follow:
                return Response({'detail': 'Вы не подписаны на этого пользователя'}, status=status.HTTP_400_BAD_REQUEST)

            follow.delete()
            return Response({'detail': 'Подписка отменена'}, status=status.HTTP_204_NO_CONTENT)
        except User.DoesNotExist:
            raise NotFound(detail='Пользователь не найден')

class FollowingListView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = UserPagination
    filter_backends = [SearchFilter]
    search_fields = ['first_name', 'last_name', 'email']

    def get(self, request):
        try:
            following = User.objects.filter(followers__follower=request.user)
            paginator = self.pagination_class()
            following = self.filter_queryset(following)
            paginated_following = paginator.paginate_queryset(following, request)
            serializer = UserSerializer(paginated_following, many=True)
            return paginator.get_paginated_response(serializer.data)
        except Exception as e:
            logger.error(f"Error in FollowingListView: {str(e)}")
            return Response({'detail': 'Server error'}, status=500)

class FollowersListView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = UserPagination
    filter_backends = [SearchFilter]
    search_fields = ['first_name', 'last_name', 'email']

    def get(self, request):
        try:
            followers = User.objects.filter(following__following=request.user)
            paginator = self.pagination_class()
            followers = self.filter_queryset(followers)
            paginated_followers = paginator.paginate_queryset(followers, request)
            serializer = UserSerializer(paginated_followers, many=True)
            return paginator.get_paginated_response(serializer.data)
        except Exception as e:
            logger.error(f"Error in FollowersListView: {str(e)}")
            return Response({'detail': 'Server error'}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def check_friendship(request, user_id):
    try:
        is_friend = Friendship.objects.filter(
            models.Q(user1=request.user, user2_id=user_id) |
            models.Q(user1_id=user_id, user2=request.user)
        ).exists()
        return Response({"is_friend": is_friend})
    except User.DoesNotExist:
        raise NotFound(detail="User not found")

class AddFriendView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        friend_id = request.data.get('friend_id')
        if not friend_id:
            return Response({'error': 'Friend ID required'}, status=400)
        try:
            friend = User.objects.get(id=friend_id)
            if friend == request.user:
                return Response({'error': 'Cannot add yourself as a friend'}, status=400)

            friendship, created = Friendship.objects.get_or_create(user1=request.user, user2=friend)
            if not created:
                return Response({'message': 'Already friends'}, status=200)

            Notification.objects.create(
                id=uuid.uuid4(),
                recipient=friend,
                sender=request.user,
                notification_type='friend',
                action='added',
                is_read=False
            )

            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'notifications_{friend.id}',
                {
                    'type': 'send_notification',
                    'notification': {
                        'sender': {'full_name': request.user.first_name},
                        'message': f'{request.user.first_name} добавил вас в друзья',
                    }
                }
            )
            return Response({'message': 'Friend added'}, status=200)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)



class FollowingPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


class FollowingNotMutualView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = FollowingPagination
    filter_backends = [SearchFilter]
    search_fields = ['first_name', 'last_name', 'email']

    def get(self, request):
        try:
            # Get users the current user follows
            following_ids = Follow.objects.filter(follower=request.user).values_list('following_id', flat=True)

            # Exclude friends (mutual follows)
            friendships = Friendship.objects.filter(
                Q(user1=request.user) | Q(user2=request.user)
            )
            friend_ids = set()
            for friendship in friendships:
                if friendship.user1 == request.user:
                    friend_ids.add(friendship.user2_id)
                else:
                    friend_ids.add(friendship.user1_id)

            # Non-mutual follows: following but not friends
            non_mutual_ids = set(following_ids) - friend_ids
            following = User.objects.filter(id__in=non_mutual_ids)

            # Apply search filter if provided
            if request.query_params.get('search'):
                following = self.filter_queryset(following)

            # Paginate results
            paginator = self.pagination_class()
            paginated_following = paginator.paginate_queryset(following, request)
            serializer = UserSerializer(
                paginated_following,
                many=True,
                context={'request': request}
            )
            return paginator.get_paginated_response(serializer.data)
        except Exception as e:
            logger.error(f"Error in FollowingNotMutualView: {str(e)}")
            return Response({'detail': 'Server error'}, status=500)

        from django.core.paginator import Paginator
        from rest_framework.decorators import api_view, authentication_classes, permission_classes
        from rest_framework.permissions import IsAuthenticated
        from rest_framework.response import Response
        from rest_framework.exceptions import NotFound
        from rest_framework import status
        from rest_framework_simplejwt.authentication import JWTAuthentication
        from django.db.models import Q
        from ..models.social import Follow
        from ..models.user import User
        from ..serializers.user import UserSerializer

        @api_view(['GET'])
        @authentication_classes([JWTAuthentication])
        @permission_classes([IsAuthenticated])
        def get_mutual_friends(request):
            user = request.user
            search = request.GET.get('search', '')
            page = int(request.GET.get('page', 1))

            following_ids = Follow.objects.filter(follower=user).values_list('following_id', flat=True)
            followers_ids = Follow.objects.filter(following=user).values_list('follower_id', flat=True)
            mutual_ids = set(following_ids).intersection(followers_ids)
            mutual_friends = User.objects.filter(id__in=mutual_ids)

            if search:
                mutual_friends = mutual_friends.filter(
                    Q(username__icontains=search) | Q(first_name__icontains=search) | Q(last_name__icontains=search)
                )

            paginator = Paginator(mutual_friends, 10)

            try:
                page_obj = paginator.page(page)
            except:
                raise NotFound('Invalid page')

            serializer = UserSerializer(page_obj, many=True)
            return Response({
                'results': serializer.data,
                'count': paginator.count,
                'num_pages': paginator.num_pages,
                'current_page': page
            }, status=status.HTTP_200_OK)
