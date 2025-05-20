import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../Context/AutoContext.jsx";
import { usePosts } from "./PostContext.jsx";
import axios from "axios";
import PostList from "./PostList";
import FriendSuggestions from "./FriendSuggestions/FriendSuggestions.jsx";
import Recommendation from "./Recommendation";
import PostModal from "./PostModal";
import "./Home.css";
import "../ListUser/UserPage/UsersPage.css";

const Home = () => {
  const { user, isAuthenticated, getToken } = useAuth();
  const name = user?.first_name || "Гость";
  const { posts, setPosts, addPost, setLoading, setError } = usePosts();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [friendSuggestions, setFriendSuggestions] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const postsPerPage = 10;

  console.log("Home: setPosts type:", typeof setPosts);

  const fetchPosts = async (pageNum) => {
    if (!isAuthenticated) {
      setError("Пожалуйста, войдите в аккаунт");
      return;
    }
    setLoading(true);
    setLoadingPosts(true);
    try {
      const token = getToken();
      if (!token) throw new Error("Токен авторизации отсутствует");
      const response = await axios.get(
        `http://localhost:8000/api/posts/?page=${pageNum}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const { results, count } = response.data;
      console.log("Fetched posts:", results);
      setPosts((prev) => {
        const existingIds = new Set(prev.map((post) => post.id));
        const newPosts = results.filter((post) => !existingIds.has(post.id));
        return [...prev, ...newPosts];
      });
      setTotalPages(Math.ceil(count / postsPerPage));
      setError(null);
    } catch (error) {
      console.error("Ошибка загрузки постов:", error.response?.data || error.message);
      setError("Не удалось загрузить посты: " + (error.message || "Неизвестная ошибка"));
    } finally {
      setLoading(false);
      setLoadingPosts(false);
    }
  };

  const fetchFriendSuggestions = async () => {
    if (!isAuthenticated) return;
    setLoadingFriends(true);
    try {
      const token = getToken();
      if (!token) throw new Error("Токен авторизации отсутствует");
      const response = await axios.get("http://localhost:8000/users/random/?count=3", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const users = response.data;
      const suggestions = [];
      for (const potential of users) {
        if (potential.id === user?.id) continue;
        const res = await axios.get(`http://localhost:8000/check-friendship/${potential.id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.data.is_friend) {
          suggestions.push(potential);
          if (suggestions.length >= 3) break;
        }
      }
      setFriendSuggestions(suggestions);
    } catch (error) {
      console.error("Ошибка загрузки предложений дружбы:", error.response?.data || error.message);
      setError("Не удалось загрузить рекомендации друзей");
    } finally {
      setLoadingFriends(false);
    }
  };

  const sendFriendRequest = async (userId) => {
    if (!isAuthenticated) {
      setError("Пожалуйста, войдите в аккаунт");
      return;
    }
    try {
      const token = getToken();
      if (!token) throw new Error("Токен авторизации отсутствует");
      console.log(`Sending follow request to user: ${userId}`);
      const response = await axios.post(
        `http://localhost:8000/user/${userId}/follow/`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );
      console.log("Follow request successful:", response.data);
      setFriendSuggestions((prev) => prev.filter((f) => f.id !== userId));
      setError(null);
      return response.data;
    } catch (error) {
      console.error("Ошибка отправки запроса на подписку:", error.response?.data || error.message);
      const errorMessage = error.response?.data?.detail || "Ошибка при отправке запроса на подписку";
      setError(errorMessage);
      throw error;
    }
  };

  useEffect(() => {
    fetchPosts(currentPage);
    if (currentPage === 1) fetchFriendSuggestions();
  }, [currentPage, isAuthenticated]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  const handleDeletePost = useCallback((deletedPostId) => {
    console.log("handleDeletePost called with ID:", deletedPostId);
    if (typeof setPosts !== "function") {
      console.error("setPosts is not a function in handleDeletePost");
      setError("Ошибка: невозможно обновить список постов");
      return;
    }
    setPosts((prev) => {
      const newPosts = prev.filter((post) => post.id !== deletedPostId);
      console.log("Updated posts after deletion:", newPosts);
      return newPosts;
    });
  }, [setPosts, setError]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handlePostCreated = (newPost) => {
    console.log("New post created:", newPost);
    addPost(newPost);
    setCurrentPage(1);
    setTimeout(() => {
      fetchPosts(1);
    }, 1000);
  };

  return (
    <div className="home-container">
      <div className="main-content">
        <h1>Домашняя страница</h1>
        <p className="username">Добро пожаловать, {name}!</p>
        <PostList
          posts={posts}
          currentUser={user}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onDeletePost={handleDeletePost}
          isFetchingMore={loadingPosts}
          fetchPosts={() => fetchPosts(currentPage)}
        />
        {isModalOpen && (
          <PostModal onClose={handleCloseModal} onPostCreated={handlePostCreated} />
        )}
      </div>
      <aside className="sidebar">
        <Recommendation text="Интересная новость: Новый проект запущен!" />
        <FriendSuggestions
          suggestions={friendSuggestions}
          loading={loadingFriends}
          onAddFriend={sendFriendRequest}
        />
      </aside>
    </div>
  );
};

export default Home;