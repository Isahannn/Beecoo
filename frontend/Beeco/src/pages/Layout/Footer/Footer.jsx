import "./Footer.css";

const Footer = () => {
  const footerLinks = [
    { name: "Домашняя страница", href: "/" },
    { name: "О нас", href: "/about" },
    { name: "Проекты", href: "/projects" },
    { name: "Контакты", href: "/contact" },
  ];

  const socialLinks = [
    { name: "GitHub", href: "https://github.com", icon: "fab fa-github" },
    { name: "Twitter", href: "https://twitter.com", icon: "fab fa-twitter" },
    { name: "LinkedIn", href: "https://linkedin.com", icon: "fab fa-linkedin" },
  ];

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="top">
          <div className="top-text">
            <h2>Ваш Бренд</h2>
            <h3>Создаем будущее с помощью технологий</h3>
          </div>
          <button>Связаться с нами</button>
        </div>
        <div className="bottom">
          <div className="logo-content">
            <div className="bottom-nav">
              <h4>Навигация</h4>
              <nav>
                <ul>
                  {footerLinks.map((link) => (
                    <li key={link.name}>
                      <a href={link.href}>{link.name}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <div className="socials">
              <h4>Следите за нами</h4>
              <div className="socials-icons">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                  >
                    <span className={social.icon}></span>
                  </a>
                ))}
              </div>
            </div>
          </div>
          <h4 className="copyright">
            © {new Date().getYear()} Ваш Бренд. Все права защищены.
          </h4>
        </div>
      </div>
    </footer>
  );
};

export default Footer;