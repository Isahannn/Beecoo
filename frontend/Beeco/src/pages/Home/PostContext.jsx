import { createContext, useContext, useState } from 'react';

export const PostContext = createContext();
export const usePosts = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePosts должен использоваться внутри PostProvider');
  }
  return context;
};

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addPost = (newPost) => {
    console.log('Adding post to context:', newPost);
    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <PostContext.Provider value={{ posts, loading, error, addPost, setPosts, setLoading, setError }}>
      {children}
    </PostContext.Provider>
  );
};