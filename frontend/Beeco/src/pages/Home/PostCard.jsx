import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Добавляем useNavigate
import { useAuth } from "../../Context/AutoContext.jsx";
import "./PostCard.css";

const PostCard = ({ post, currentUser, onDelete, fetchPosts }) => {
  const { getToken, isAuthenticated } = useAuth();
  const navigate = useNavigate(); // Для навигации
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [error, setError] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const canDelete = currentUser && post.user && currentUser.id === post.user.id;
  console.log("PostCard props:", {
    postId: post.id,
    postTitle: post.title,
    currentUserId: currentUser?.id,
    postUserId: post.user?.id,
    canDelete,
    onDeleteType: typeof onDelete,
  });

  const handleLike = async () => {
    if (!isAuthenticated) {
      setError("Войдите, чтобы поставить лайк");
      return;
    }
    setError(null);
    try {
      const token = getToken();
      if (!token) throw new Error("Токен авторизации отсутствует");
      const response = await fetch(`http://localhost:8000/api/posts/${post.id}/like/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikesCount(data.likes_count);
      } else {
        const data = await response.json();
        console.warn("Ошибка при лайке:", data);
        setError(data.detail || "Не удалось поставить лайк");
      }
    } catch (error) {
      console.error("Ошибка при лайке:", error.message);
      setError(error.message || "Ошибка сети");
    }
  };

  const handleDelete = async () => {
    if (!isAuthenticated) {
      setError("Войдите, чтобы удалить пост");
      return;
    }
    setError(null);
    const postId = post.id;
    console.log("Deleting post:", postId, "by user:", currentUser?.id);
    if (typeof onDelete === "function") {
      onDelete(postId);
    } else {
      console.error("onDelete не является функцией, пропуск обновления UI");
      setError("Не удалось обновить интерфейс: onDelete не передан");
    }
    try {
      const token = getToken();
      if (!token) throw new Error("Токен авторизации отсутствует");
      const response = await fetch(`http://localhost:8000/api/posts/${postId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const data = await response.json();
        console.error("Ошибка удаления поста:", response.status, data);
        setError(data.detail || "Не удалось удалить пост");
        if (typeof fetchPosts === "function") {
          console.log("Refetching posts due to delete failure");
          await fetchPosts();
        }
      } else {
        console.log("Post deleted successfully:", postId);
        setIsMenuOpen(false);
      }
    } catch (err) {
      console.error("Ошибка сети:", err);
      setError(err.message || "Ошибка сети");
      if (typeof fetchPosts === "function") {
        await fetchPosts();
      }
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleAvatarClick = () => {
    if (post.user?.id) {
      console.log("Navigating to profile:", post.user.id);
      navigate(`/user/${post.user.id}`);
    } else {
      console.warn("User ID not found for post:", post.id);
      setError("Не удалось перейти на профиль: пользователь не найден");
    }
  };

  return (
    <div className="post-card">
      {error && (
        <div className="error-message" style={{ color: "red", marginBottom: "10px" }}>
          {error}
        </div>
      )}
      <div className="post-header">
        <img
          src={post.user?.avatar || "https://placehold.co/40x40"}
          alt="User Avatar"
          className="user-avatar"
          onClick={handleAvatarClick} // Добавляем обработчик
          style={{ cursor: "pointer" }} // Указываем, что элемент кликабелен
        />
        <div className="user-info">
          <h3 className="post-title">{post.title || "Без заголовка"}</h3>
          <p className="post-author">
            Автор:{" "}
            {post.user
              ? `${post.user.first_name || "Неизвестный"} ${post.user.last_name || ""}`
              : "Неизвестный"}
          </p>
        </div>
      </div>

      <p className="post-description">{post.description || "Нет описания"}</p>

      {post.image && (
        <img
          src={post.image.startsWith("http") ? post.image : `http://localhost:8000${post.image}`}
          alt="Post"
          className="post-image"
        />
      )}

      <div className="post-footer">
        <button
          className={`like-button ${isLiked ? "liked" : ""}`}
          onClick={handleLike}
          disabled={!isAuthenticated}
        >
          ❤️
        </button>
        <span className="likes-count">{likesCount}</span>
        <span className="post-date">{new Date(post.created_at).toLocaleDateString()}</span>

        {canDelete && (
          <div className="post-menu">
            <button className="menu-button" onClick={toggleMenu} aria-label="Опции поста">
              ⋮
            </button>
            {isMenuOpen && (
              <div className="menu-dropdown">
                <button className="menu-item delete-button" onClick={handleDelete}>
                  Удалить
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
