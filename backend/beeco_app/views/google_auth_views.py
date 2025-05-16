#beeco_app/views/google_auth_views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests
from google.auth.exceptions import GoogleAuthError
from rest_framework_simplejwt.tokens import RefreshToken

GOOGLE_CLIENT_ID = '604621430295-16qjcu4fjjbda1uc13kc5ufpjinr3ai4.apps.googleusercontent.com'

User = get_user_model()
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    token = request.data.get('token')
    if not token:
        return Response({'error': 'Token is required'}, status=400)

    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        email = idinfo['email']
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')

        user, created = User.objects.get_or_create(username=email, defaults={
            'email': email,
            'first_name': first_name,
            'last_name': last_name,
        })

        if created:
            user.set_unusable_password()
            user.save()

        tokens = get_tokens_for_user(user)

        return Response({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'tokens': tokens,
            'created': created,
        })

    except (ValueError, GoogleAuthError) as e:
        return Response({'error': 'Invalid token', 'details': str(e)}, status=400)
