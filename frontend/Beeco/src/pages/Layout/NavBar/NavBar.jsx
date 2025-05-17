import { useRef, useState } from "react";
import "./Navbar.css";
import { useAuth } from '../../../Context/AutoContext.jsx';

const items = [
  { name: "Домашняя страница" },
  { name: "Сообщения" },
  { name: "Пользователи" },
  { name: "Друзья" },
  { name: "Подписки" },
];

const Link = ({ item, activeItem, onClick }) => {
  const linkRef = useRef();

  return (
    <a
      className={item.name === activeItem?.name ? "active" : ""}
      ref={linkRef}
      onClick={() => onClick(item)}
    >
      {item.name}
    </a>
  );
};

const Search = () => (
  <div className="navbar-search">
    <input type="text" placeholder="Search" />
  </div>
);

export const Navbar = () => {
  const [activeItem, setActiveItem] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Состояние для меню
  const { user, logout } = useAuth(); // Предполагаем, что logout есть в контексте

  const handleLinkClick = (item) => {
    setActiveItem(item);
  };

  const handleLogout = () => {
    logout(); // Вызываем функцию выхода из контекста
    setIsMenuOpen(false);
  };

  const handleSwitchProfile = () => {
    // Здесь можно реализовать логику для смены профиля,
    // например, перенаправление на страницу входа
    window.location.href = "/login";
    setIsMenuOpen(false);
  };

  const username = user?.first_name || user?.username || "Гость";

  return (
    <section className="navbar-container">
      <nav className="navbar">
        <Search />
        <div className="navbar-menu">
          {items.map((item) => (
            <Link
              key={item.name}
              activeItem={activeItem}
              item={item}
              onClick={handleLinkClick}
            />
          ))}
        </div>
        <button className="navbar-post-button">Запостить</button>
        <div className="navbar-profile">
          <img src="https://via.placeholder.com/36" alt="Profile" />
          <span className="navbar-username">{username}</span>
          <span
            className="navbar-more"
            onMouseEnter={() => setIsMenuOpen(true)}
            onMouseLeave={() => setIsMenuOpen(false)}
          >
            ...
            {isMenuOpen && (
              <div className="navbar-dropdown">
                <div className="dropdown-item" onClick={handleLogout}>
                  Выйти
                </div>
                <div className="dropdown-item" onClick={handleSwitchProfile}>
                  Зайти с другого профиля
                </div>
              </div>
            )}
          </span>
        </div>
      </nav>
    </section>
  );
};