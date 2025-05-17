import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../Context/AutoContext.jsx";
import "./Home.css";

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const name = user?.first_name || "Гость";

  // Posts state
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Friend suggestions state
  const [friendSuggestions, setFriendSuggestions] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  const observerRef = useRef(null);
  const token = localStorage.getItem("auth_token");

  const fetchPosts = async (pageNum) => {
    if (!isAuthenticated || !hasNext || !token) return;
    setLoadingPosts(true);
    try {
      const response = await axios.get(`http://localhost:8000/posts/?page=${pageNum}`, {
        headers: { Authorization: `Token ${token}` },
      });
      const { results, next } = response.data;
      setPosts((prev) => [...prev, ...results]);
      setHasNext(!!next);
    } catch (error) {
      console.error("Ошибка загрузки постов:", error.response?.data || error.message);
      setHasNext(false);
    } finally {
      setLoadingPosts(false);
    }
  };

  const fetchFriendSuggestions = async () => {
    if (!isAuthenticated || !token) return;
    setLoadingFriends(true);
    try {
      const response = await axios.get("http://localhost:8000/users/random/?count=3", {
        headers: { Authorization: `Token ${token}` },
      });
      const users = response.data;

      // Filter out current user and existing friends
      const suggestions = [];
      for (const potentialFriend of users) {
        if (potentialFriend.id === user?.id) continue;

        const friendshipResponse = await axios.get(
          `http://localhost:8000/check-friendship/${potentialFriend.id}/`,
          { headers: { Authorization: `Token ${token}` } }
        );
        if (!friendshipResponse.data.is_following) {
          suggestions.push(potentialFriend);
          if (suggestions.length >= 3) break;
        }
      }
      setFriendSuggestions(suggestions);
    } catch (error) {
      console.error("Ошибка загрузки предложений дружбы:", error.response?.data || error.message);
    } finally {
      setLoadingFriends(false);
    }
  };

  const sendFriendRequest = async (userId) => {
    if (!token) return;
    try {
      await axios.post(
        `http://localhost:8000/follow/${userId}/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
      setFriendSuggestions((prev) => prev.filter((friend) => friend.id !== userId));
      alert("Запрос на дружбу отправлен!");
    } catch (error) {
      console.error("Ошибка отправки запроса на дружбу:", error.response?.data || error.message);
      alert("Ошибка при отправке запроса на дружбу.");
    }
  };

  // Load posts and friend suggestions on page or auth/token change
  useEffect(() => {
    fetchPosts(page);
    // Only fetch friend suggestions once when authenticated and token changes
    if (page === 1) fetchFriendSuggestions();
  }, [page, isAuthenticated, token]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingPosts && hasNext) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.1 }
    );
    if (observerRef.current) {
      observer.observe(observerRef.current);
    }
    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [loadingPosts, hasNext]);

  return (
    <div className="home-container">
      <div className="main-content">
        <h1>Эта страница</h1>
        <p className="username">Добро пожаловать, {name}!</p>
        <div className="posts">
          {posts.map((post) => (
            <div key={post.id} className="post-card">
              <h3>{post.author.first_name}</h3>
              {post.title && <h4>{post.title}</h4>}
              <p>{post.description}</p>
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
              {post.tags.length > 0 && (
                <div className="tags">
                  {post.tags.map((tag) => (
                    <span key={tag.id} className="tag">{tag.name}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loadingPosts && <div className="loading">Загрузка постов...</div>}
          <div ref={observerRef} className="observer"></div>
        </div>
      </div>
      <aside className="sidebar">
        <div className="recommendations">
          <h2>Рекомендации</h2>
          <div className="recommendation-item">
            <p>Интересная новость: Новый проект запущен!</p>
          </div>
        </div>
        <div className="friend-suggestions">
          <h2>Предложения дружбы</h2>
          {loadingFriends ? (
            <div className="loading">Загрузка...</div>
          ) : friendSuggestions.length > 0 ? (
            friendSuggestions.map((friend) => (
              <div key={friend.id} className="friend-item">
                <img
                  src={friend.avatar || "https://via.placeholder.com/50"}
                  alt={friend.first_name}
                />
                <p>{friend.first_name}</p>
                <button
                  className="friend-button"
                  onClick={() => sendFriendRequest(friend.id)}
                >
                  Подружиться
                </button>
              </div>
            ))
          ) : (
            <p>Нет предложений дружбы.</p>
          )}
        </div>
      </aside>
    </div>
  );
};

export default Home;
