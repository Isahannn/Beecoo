import { useRef, useState } from "react";
import "./Navbar.css";

const menuItems = [
  { name: "Домашняя страница", icon: "home" },
  { name: "Сообщение", icon: "message" },
  { name: "Поиск", icon: "search" },
  { name: "Запостить", icon: "post_add" },
];

const Link = ({ item, activeItem, onClick }) => {
  const linkRef = useRef();

  return (
    <a
      ref={linkRef}
      className={item.name === activeItem?.name ? "active" : ""}
      onClick={() => onClick(item)}
    >
      <span className="material-symbols-outlined">{item.icon}</span>
      {item.name}
    </a>
  );
};


export const Navbar = ({ userData }) => {
  const [activeItem, setActiveItem] = useState(null);

  const handleLinkClick = (item) => {
    setActiveItem(item);
  };

  const avatarUrl = userData?.avatar || "https://via.placeholder.com/40";
  const username = userData?.username || "Имя Пользователя";

  return (
    <section className="page navbar-3-page">
      <nav className="navbar">
        <div className="navbar-menu">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              item={item}
              activeItem={activeItem}
              onClick={handleLinkClick}
            />
          ))}
        </div>
        <div className="navbar-3-profile">
          <img src={avatarUrl} alt="Profile" />
          <span>{username}</span>
        </div>
      </nav>
    </section>
  );
};