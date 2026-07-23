'use client';

import { useState } from 'react';

const navLinks = [
  { href: '/#features', label: 'Features' },
  { href: '/hotels', label: 'Hotels' },
  { href: '/#download', label: 'Download' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

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
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? '✕' : '☰'}
      </button>

      <div className={`navbar-menu${open ? ' navbar-menu--open' : ''}`}>
        <div className="navbar-links">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={closeMenu}>
              {link.label}
            </a>
          ))}
        </div>
        <a href="/#download" className="navbar-download" onClick={closeMenu}>
          Download app
        </a>
      </div>
    </nav>
  );
}
