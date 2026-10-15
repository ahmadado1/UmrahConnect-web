'use client';

import { useState } from 'react';
import { useT } from '@/lib/i18n/I18nProvider';
import LanguagePicker from './LanguagePicker';
import { CloseIcon, MenuIcon } from './Icons';

export default function Navbar() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const navLinks = [
    { href: '/#features', label: t.nav.features },
    { href: '/hotels', label: t.nav.hotels },
    { href: '/#download', label: t.nav.download },
    { href: '/pricing', label: t.nav.pricing },
    { href: '/contact', label: t.nav.contact },
    { href: '/agents', label: t.nav.agents },
    { href: '/login', label: t.nav.login },
  ];

  function closeMenu() {
    setOpen(false);
  }

  return (
    <nav className="navbar">
      <a href="/" className="navbar-logo" onClick={closeMenu}>
        <img src="/logo.jpg" alt="UmrahConnect" />
        <span>UmrahConnect</span>
      </a>

      <button
        type="button"
        className="navbar-toggle"
        aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <CloseIcon size={22} stroke="#fff" /> : <MenuIcon size={22} stroke="#fff" />}
      </button>

      <div className={`navbar-menu${open ? ' navbar-menu--open' : ''}`}>
        <div className="navbar-links">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={closeMenu}>
              {link.label}
            </a>
          ))}
        </div>
        <LanguagePicker />
        <a href="/#download" className="navbar-download" onClick={closeMenu}>
          {t.nav.downloadApp}
        </a>
      </div>
    </nav>
  );
}
