from django.contrib.auth import get_user_model
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from backend.beeco_app.post.models import Post
from backend.beeco_app.post.models.like import Like
from backend.beeco_app.post.models.comment import Comment
from ..notifications import send_notification

User = get_user_model()


def like_post(user: User, post: Post) -> None:

    if not Like.objects.filter(user=user, post=post).exists():
        Like.objects.create(user=user, post=post)

        _update_likes_count(post)

        if user != post.user:
            send_notification(
                receiver=post.user,
                message=f"{user.username} лайкнул ваш пост.",
                type="like",
                metadata={"post_id": post.id}
            )

        _send_ws_event(user=post.user, data={
            "event": "like",
            "user": user.username,
            "post_id": post.id,
        })


def comment_post(user: User, post: Post, text: str) -> Comment:
    comment = Comment.objects.create(user=user, post=post, text=text)
    _update_comments_count(post)

    if user != post.user:
        send_notification(
            receiver=post.user,
            message=f"{user.username} прокомментировал ваш пост.",
            type="comment",
            metadata={"post_id": post.id, "comment_id": comment.id}
        )

    _send_ws_event(user=post.user, data={
        "event": "comment",
        "user": user.username,
        "post_id": post.id,
        "comment_id": comment.id,
        "text": text,
    })

    return comment


def edit_comment(user: User, comment: Comment, new_text: str) -> None:

    if comment.user == user:
        comment.text = new_text
        comment.save(update_fields=['text'])

        _send_ws_event(user=comment.post.user, data={
            "event": "comment_edit",
            "user": user.username,
            "post_id": comment.post.id,
            "comment_id": comment.id,
            "new_text": new_text,
        })


def delete_comment(user: User, comment: Comment) -> None:

    if comment.user == user:
        post = comment.post
        comment_id = comment.id
        comment.delete()
        _update_comments_count(post)

        _send_ws_event(user=post.user, data={
            "event": "comment_delete",
            "user": user.username,
            "post_id": post.id,
            "comment_id": comment_id,
        })

def _update_likes_count(post: Post) -> None:
    post.likes_count = Like.objects.filter(post=post).count()
    post.save(update_fields=['likes_count'])


def _update_comments_count(post: Post) -> None:
    post.comments_count = Comment.objects.filter(post=post).count()
    post.save(update_fields=['comments_count'])


def _send_ws_event(user: User, data: dict) -> None:
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        f"user_{user.id}",
        {
            "type": "notify",
            "data": data,
        }
    )