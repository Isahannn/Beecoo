import "./Footer.css";

const Footer = () => {
  const footerLinks = [
    { name: "Домашняя страница", href: "/" },
    { name: "О нас", href: "/about" },
    { name: "Проекты", href: "/projects" },
    { name: "Контакты", href: "/contact" },
  ];

  const socialLinks = [
    { name: "GitHub", href: "https://github.com", icon: "github" },
    { name: "Twitter", href: "https://twitter.com", icon: "twitter" },
    { name: "LinkedIn", href: "https://linkedin.com", icon: "linkedin" },
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>Ваш Бренд</h2>
          <p>Создаем будущее с помощью технологий.</p>
        </div>
        <div className="footer-links">
          <h3>Навигация</h3>
          <ul>
            {footerLinks.map((link) => (
              <li key={link.name}>
                <a href={link.href}>{link.name}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer-social">
          <h3>Следите за нами</h3>
          <div className="social-icons">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
              >
                <span className={`icon-${social.icon}`}></span>
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Ваш Бренд. Все права защищены.</p>
      </div>
    </footer>
  );
};

export default Footer; // Changed to default export