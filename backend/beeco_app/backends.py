import logging
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)

class EmailBackend(BaseBackend):
    def authenticate(self, request, email=None, password=None, **kwargs):
        logger.debug(f"EmailBackend: Attempting to authenticate email={email}")
        UserModel = get_user_model()
        try:
            user = UserModel.objects.get(email=email)
            logger.debug(f"EmailBackend: Found user with email={email}")
            if user.check_password(password):
                logger.debug(f"EmailBackend: Password valid for email={email}")
                if user.is_active:
                    return user
                else:
                    logger.warning(f"EmailBackend: User with email={email} is not active")
            else:
                logger.warning(f"EmailBackend: Invalid password for email={email}")
        except UserModel.DoesNotExist:
            logger.warning(f"EmailBackend: No user found with email={email}")
        return None

    def get_user(self, user_id):
        UserModel = get_user_model()
        try:
            user = UserModel.objects.get(pk=user_id)
            logger.debug(f"EmailBackend: Retrieved user with id={user_id}")
            return user
        except UserModel.DoesNotExist:
            logger.warning(f"EmailBackend: No user found with id={user_id}")
            return None