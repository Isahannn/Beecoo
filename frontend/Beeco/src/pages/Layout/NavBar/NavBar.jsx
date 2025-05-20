import { useRef, useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import "./Navbar.css";
import { useAuth } from '../../../Context/AutoContext.jsx';
import PostModal from '../../Home/PostModal.jsx';
import logo from '../../../../public/images/logo.jpeg'

const items = [
  { name: "Домашняя страница",path: "/home"  },
  { name: "Пользователи", path: '/users' },
  { name: "Друзья", path: '/friends' },
  { name: "Подписки" ,path: '/following' },
];

const LinkItem = ({ item, activeItem, onClick }) => {
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLinkClick = (item) => {
    setActiveItem(item);
    navigate(item.path);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const handleSwitchProfile = () => {
    logout();
    window.location.href = "/login";
    setIsMenuOpen(false);
  };

  const username = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : "Гость";

  return (
    <section className="navbar-container">
      <nav className="navbar">
          <div className="logo" >
            <img src={logo} alt="Логотип"/>
        </div>

        <Search/>
        <div className="navbar-menu">
          {items.map((item) => (
            <LinkItem
              key={item.name}
              activeItem={activeItem}
              item={item}
              onClick={handleLinkClick}
            />
          ))}
        </div>
        <button
          className="navbar-post-button"
          onClick={() => setIsModalOpen(true)}
        >
          Запостить
        </button>
        <div className="navbar-profile">
          <img
            src={user?.avatar || 'https://placehold.co/36x36'}
            alt="User Avatar"
          />
          {user?.id ? (
            <Link to={`/user/${user.id}`} className="navbar-username">
              {username}
            </Link>
          ) : (
            <span className="navbar-username">{username}</span>
          )}
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
      {isModalOpen && <PostModal onClose={() => setIsModalOpen(false)} />}
    </section>
  );
};