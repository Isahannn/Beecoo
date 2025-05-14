from django.urls import path
from ..user.views.user_views import (
    CustomAuthToken,
    RegisterUserView,
    UserProfileView,
    PublicUserProfileView,
    FollowToggleView,
)
from ..user.views.user_views import FollowersListView, FollowingListView  #

urlpatterns = [
    path('login/', CustomAuthToken.as_view(), name='login'),
    path('register/', RegisterUserView.as_view(), name='register'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/<uuid:id>/', PublicUserProfileView.as_view(), name='public-profile'),
    path('profile/<uuid:id>/follow/', FollowToggleView.as_view(), name='follow-toggle'),
    path('profile/followers/', FollowersListView.as_view(), name='followers-list'),
    path('profile/following/', FollowingListView.as_view(), name='following-list'),
]
