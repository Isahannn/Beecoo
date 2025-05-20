import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import axios from "axios";
import "../Layout/NavBar/Navbar.css";
import { useAuth } from "../../Context/AutoContext.jsx";

const PostModal = ({ onClose, onPostCreated }) => {
  const { getToken } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [tags, setTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        console.log("Fetching tags from /api/tags/");
        const token = getToken();
        if (!token) {
          throw new Error("No auth token found");
        }
        console.log("Auth token for tags:", token);
        const response = await axios.get("http://localhost:8000/api/tags/", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        console.log("Tags API response:", response.data);
        const tagsData = response.data.results || response.data || [];
        if (Array.isArray(tagsData)) {
          setTags(tagsData);
          console.log("Loaded tags:", tagsData);
          if (tagsData.length === 0) {
            console.warn("No tags found0205");
            setError("Нет доступных категорий.");
          }
        } else {
          console.error("Tags data is not an array:", tagsData);
          setTags([]);
          setError("Ошибка загрузки категорий. Проверьте API /api/tags/.");
        }
      } catch (error) {
        console.error("Error fetching tags:", error.response?.data || error.message);
        setTags([]);
        setError(
          error.response?.data?.detail ||
            error.message ||
            "Не удалось загрузить категории."
        );
      }
    };
    fetchTags();
  }, [getToken]);

  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
    );
  }, []);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleClipClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);

    let tagIds = category ? [category] : [];
    tagIds.forEach((tagId) => formData.append("tag_ids", tagId));

    if (image) {
      formData.append("image", image);
    }

    try {
      const token = getToken();
      if (!token) throw new Error("No auth token found");
      console.log("Sending formData:", {
        title,
        description,
        tag_ids: tagIds,
        image: image?.name,
      });
      console.log("Auth token for post:", token);
      const response = await axios.post(
        "http://localhost:8000/api/posts/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Post created, response:", response.data);
      console.log("Created post user ID:", response.data.user?.id);
      // Check if onPostCreated is a function before calling
      if (typeof onPostCreated === "function") {
        onPostCreated(response.data);
      } else {
        console.warn("onPostCreated is not a function, skipping callback");
      }
      handleClose();
    } catch (error) {
      console.error("Error creating post:", error.response?.data || error.message);
      setError(
        "Ошибка при создании поста: " +
          (error.response?.data?.detail || error.message)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    const el = modalRef.current;
    if (!el) return;
    gsap.to(el, {
      opacity: 0,
      y: 50,
      scale: 0.95,
      duration: 0.3,
      ease: "power2.in",
      onComplete: onClose,
    });
  };

  return (
    <div className="modal" onClick={handleClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        <span className="close" onClick={handleClose}>
          ×
        </span>
        {error && (
          <div className="error-message" style={{ color: "red", marginBottom: "10px" }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="textbox title-with-clip">
            <input
              type="text"
              placeholder=" "
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <label>Название</label>
            <span className="clip-icon" onClick={handleClipClick}>
              📎
            </span>
          </div>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
          <div className="textbox">
            <textarea
              placeholder=" "
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <label>Описание</label>
          </div>
          <div className="textbox">
            <select
              value={category}
              onChange={(e) => {
                console.log("Category changed to:", e.target.value);
                setCategory(e.target.value);
              }}
            >
              <option value="">Выберите категорию</option>
              {Array.isArray(tags) && tags.length > 0 ? (
                tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  Нет доступных категорий
                </option>
              )}
            </select>
            <label>Категория</label>
          </div>
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Отправка..." : "Запостить"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostModal;