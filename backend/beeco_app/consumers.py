from channels.generic.websocket import AsyncWebsocketConsumer
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from asgiref.sync import sync_to_async
import json
import logging

logger = logging.getLogger(__name__)

class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            # Extract token from query string
            query_string = self.scope['query_string'].decode()
            token = None
            for param in query_string.split('&'):
                if param.startswith('token='):
                    token = param.split('token=')[1]
                    break

            if not token:
                logger.error("No token provided in WebSocket query string")
                await self.close(code=4000)
                return

            jwt_auth = JWTAuthentication()
            validated_token = await sync_to_async(jwt_auth.get_validated_token)(token)
            user = await sync_to_async(jwt_auth.get_user)(validated_token)
            self.scope['user'] = user

            self.group_name = f'notifications_{user.id}'
            await self.channel_layer.group_add(self.group_name, self.channel_name)

            logger.debug(f"WebSocket connected for user: {user.email} (ID: {user.id})")
            await self.accept()
        except AuthenticationFailed as e:
            logger.error(f"WebSocket authentication failed: {str(e)}")
            await self.close(code=4001)
        except Exception as e:
            logger.error(f"WebSocket connection error: {str(e)}")
            await self.close(code=4002)

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)
        logger.debug(f"WebSocket disconnected with code: {close_code}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            logger.debug(f"Received message: {data}")
            await self.send(text_data=json.dumps({
                'message': 'Notification received',
                'data': data
            }))
        except json.JSONDecodeError:
            logger.error("Invalid JSON received")
            await self.send(text_data=json.dumps({'error': 'Invalid JSON'}))

    async def send_notification(self, event):
        logger.debug(f"Sending notification to {self.group_name}: {event}")
        await self.send(text_data=json.dumps({
            'notification': event['notification']
        }))