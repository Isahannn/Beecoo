import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from google.oauth2 import id_token
from google.auth.transport import requests
from google.auth.exceptions import GoogleAuthError
from rest_framework_simplejwt.tokens import RefreshToken


logger = logging.getLogger(__name__)

GOOGLE_CLIENT_ID = '604621430295-16qjcu4fjjbda1uc13kc5ufpjinr3ai4.apps.googleusercontent.com'

User = get_user_model()


def get_tokens_for_user(user):
    try:
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }
    except Exception as e:
        logger.error(f"Ошибка генерации токенов для пользователя {user.email}: {str(e)}")
        raise


@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    token = request.data.get('token')

    if not token:
        logger.warning("Запрос без токена")
        return Response({'error': 'Токен обязателен'}, status=status.HTTP_400_BAD_REQUEST)

    if not isinstance(token, str) or '.' not in token:
        logger.warning(f"Неверный формат токена: {token[:10]}...")
        return Response({'error': 'Неверный формат токена'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10
        )
        logger.info(f"Токен проверен для email: {idinfo.get('email')}")

        email = idinfo['email']
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')

        try:
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'first_name': first_name,
                    'last_name': last_name,
                }
            )

            if created:
                user.set_unusable_password()
                user.save()
                logger.info(f"Создан новый пользователь: {email}")
            else:
                if user.first_name != first_name or user.last_name != last_name:
                    user.first_name = first_name
                    user.last_name = last_name
                    user.save()
                    logger.info(f"Обновлены данные пользователя: {email}")

        except Exception as e:
            logger.error(f"Ошибка создания/обновления пользователя {email}: {str(e)}")
            return Response(
                {'error': 'Ошибка обработки пользователя', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        tokens = get_tokens_for_user(user)

        return Response({
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'tokens': tokens,
            'created': created,
        }, status=status.HTTP_200_OK)

    except (ValueError, GoogleAuthError) as e:
        logger.error(f"Неверный токен: {str(e)}")
        return Response(
            {'error': 'Неверный токен', 'details': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Внутренняя ошибка сервера: {str(e)}")
        return Response(
            {'error': 'Внутренняя ошибка сервера', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )