import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './Navbar.css';
import shnareLogo from '../assets/ShnareLogo.jpg';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo" onClick={() => setMenuOpen(false)}>
          <img src={shnareLogo} alt="Shnare" className="navbar__logo-img" />
          <span className="navbar__logo-text">shnare</span>
        </Link>

        {/* Desktop links */}
        <div className="navbar__links">
          <Link to="/browse"  className={`navbar__link ${isActive('/browse')  ? 'navbar__link--active' : ''}`}>Istraži</Link>
          {user && (
            <Link to="/upload" className={`navbar__link ${isActive('/upload') ? 'navbar__link--active' : ''}`}>
              <span className="navbar__link-plus">+</span> Upload
            </Link>
          )}
          <Link to="/contact" className={`navbar__link ${isActive('/contact') ? 'navbar__link--active' : ''}`}>Kontakt</Link>
          {user?.role === 'admin' && (
            <Link to="/admin" className={`navbar__link navbar__link--admin ${isActive('/admin') ? 'navbar__link--active' : ''}`}>
              ⚙ Admin
            </Link>
          )}
        </div>

        {/* Auth */}
        <div className="navbar__auth">
          {user ? (
            <>
              <Link to="/profile" className="navbar__user" onClick={() => setMenuOpen(false)}>
                <div className="navbar__avatar">
                  {user.avatar
                    ? <img src={user.avatar} alt={user.name} />
                    : <span>{user.name?.charAt(0).toUpperCase()}</span>
                  }
                </div>
                <span className="navbar__user-name">{user.name}</span>
              </Link>
              <button className="navbar__logout" onClick={handleLogout}>Odjavi se</button>
            </>
          ) : (
            <>
              <Link to="/login"    className="navbar__login">Prijavi se</Link>
              <Link to="/register" className="navbar__register">Registruj se</Link>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`navbar__burger ${menuOpen ? 'navbar__burger--open' : ''}`}
          onClick={() => setMenuOpen((p) => !p)}
          aria-label="Meni"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`navbar__mobile ${menuOpen ? 'navbar__mobile--open' : ''}`}>
        <Link to="/browse"  className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>Istraži</Link>
        {user && <Link to="/upload"  className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>+ Upload</Link>}
        <Link to="/contact" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>Kontakt</Link>
        {user?.role === 'admin' && (
          <Link to="/admin" className="navbar__mobile-link navbar__mobile-link--admin" onClick={() => setMenuOpen(false)}>⚙ Admin</Link>
        )}
        <div className="navbar__mobile-divider" />
        {user ? (
          <>
            <Link to="/profile" className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>👤 {user.name}</Link>
            <button className="navbar__mobile-logout" onClick={handleLogout}>Odjavi se</button>
          </>
        ) : (
          <>
            <Link to="/login"    className="navbar__mobile-link" onClick={() => setMenuOpen(false)}>Prijavi se</Link>
            <Link to="/register" className="navbar__mobile-btn"  onClick={() => setMenuOpen(false)}>Registruj se</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;