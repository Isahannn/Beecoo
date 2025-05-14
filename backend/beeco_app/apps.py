from django.apps import AppConfig
from django.apps import AppConfig

class BeecoAppConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'beeco_app'


class UserConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'beeco_app.user'