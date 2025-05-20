import React from "react";
import PostCard from "./PostCard.jsx";
import "../ListUser/UserPage/UsersPage.css";

const PostList = ({
  posts,
  currentUser,
  currentPage,
  totalPages,
  onPageChange,
  onDeletePost,
  isFetchingMore,
  fetchPosts,
}) => {
  console.log("PostList props:", { onDeletePostType: typeof onDeletePost, currentPage, totalPages });

  return (
    <div className="posts-list">
      {posts.length > 0 ? (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={currentUser}
            onDelete={onDeletePost}
            fetchPosts={fetchPosts}
          />
        ))
      ) : (
        <p className="no-users">Посты не найдены</p>
      )}
      {isFetchingMore && <p className="loading">Загрузка постов...</p>}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Назад
          </button>
          <span className="pagination-info">
            Страница {currentPage} из {totalPages}
          </span>
          <button
            className="pagination-button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Вперед
          </button>
        </div>
      )}
    </div>
  );
};

export default PostList;