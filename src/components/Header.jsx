import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { navLinks, pageNavSections } from '../data/siteData';
import './Header.css';

function NavItem({
  path,
  label,
  closeMenu,
  activeMenu,
  setActiveMenu
}) {
  const sections = pageNavSections[path] ?? [];
  const location = useLocation();
  const isOnPage = location.pathname === path;

  if (!sections.length) {
    return (
      <li>
        <NavLink to={path} end={path === '/'} className={({ isActive }) => (isActive ? 'active' : undefined)} onClick={closeMenu}>
          {label}
        </NavLink>
      </li>
    );
  }

  return (
    <li
      className="header__nav-item header__nav-item--has-menu"
      onMouseEnter={() => setActiveMenu(label)}
      onMouseLeave={() => setActiveMenu(null)}
    >
      <NavLink
        to={path}
        end={path === '/'}
        className={({ isActive }) => (isActive ? 'active' : undefined)}
        onClick={closeMenu}
      >
        {label}
      </NavLink>
      {activeMenu === label && (
        <div className="header__submenu" role="menu">
          {sections.map(({ id, label: sectionLabel }) => (
            <Link
              key={id}
              to={`${path}#${id}`}
              role="menuitem"
              className="header__submenu-link"
              onClick={closeMenu}
            >
              {sectionLabel}
            </Link>
          ))}
        </div>
      )}
    </li>
  );
}


export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="header">
      <div className="container header__inner">
        <Link to="/" className="header__brand" onClick={closeMenu}>
          <img src="/logos/liams-logo-symbol.png" alt="LIAMS crest" className="header__logo" />
          <span className="header__brand-text">
            <strong>LIAMS</strong>
            <small>Loyola Institute of Advanced Multidisciplinary Studies</small>
          </span>
        </Link>

        <button
          type="button"
          className={`header__toggle ${menuOpen ? 'is-open' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`header__nav ${menuOpen ? 'is-open' : ''}`} aria-label="Main">
          <ul>
            {navLinks.map(({ path, label }) => (
              <NavItem
                key={path}
                path={path}
                label={label}
                closeMenu={closeMenu}
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
              />
            ))}
          </ul>
          <Link to="/contact" className="btn btn--primary header__cta" onClick={closeMenu}>
            Contact Us
          </Link>
        </nav>
      </div>
    </header>
  );
}
