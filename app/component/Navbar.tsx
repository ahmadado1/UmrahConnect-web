'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useT } from '@/lib/i18n/I18nProvider';
import { getSupabase } from '@/lib/supabaseBrowser';
import LanguagePicker from './LanguagePicker';
import { CloseIcon, MenuIcon } from './Icons';

type Who = { initial: string; href: string } | null;

// Kept here (not in globals.css) so it always loads with the header.
const NAVBAR_CSS = `
  html, body { margin: 0; padding: 0; }
  .navbar { padding: clamp(18px, 2.6vw, 28px) clamp(16px, 5vw, 56px); position: sticky; top: 0; box-shadow: 0 2px 14px rgba(10, 25, 45, 0.22); }
  .navbar-logo img { width: 40px; height: 40px; }
  .navbar-links a[aria-current="page"] { color: #e8d5a3; }
  .navbar-auth { color: #fff; font-size: clamp(14px, 1.6vw, 18px); text-decoration: none; display: inline-flex; align-items: center; padding: 8px 4px; white-space: nowrap; }
  .navbar-auth:hover, .navbar-links a:hover { color: #e8d5a3; }
`;

/** Logged in? Then show a round avatar + "My account" instead of "Log in", on every page. */
function useWhoIsLoggedIn(): Who {
  const [who, setWho] = useState<Who>(null);

  useEffect(() => {
    const supabase = getSupabase();
    const fromSession = (session: Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']) => {
      if (!session) return null;
      const meta = session.user.user_metadata || {};
      const name = String(meta.full_name || meta.name || session.user.email || session.user.phone || '?');
      // Agencies go to Agent Zone, pilgrims to My account.
      const href = meta.user_type === 'agent' ? '/agents/home' : '/account';
      return { initial: name.trim().charAt(0).toUpperCase() || '?', href };
    };
    supabase.auth.getSession().then(({ data: { session } }) => setWho(fromSession(session)));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setWho(fromSession(session));
    });
    return () => subscription.unsubscribe();
  }, []);

  return who;
}

export default function Navbar() {
  const { t } = useT();
  const pathname = usePathname();
  const who = useWhoIsLoggedIn();
  const [open, setOpen] = useState(false);

  // Kept short on purpose: Download and Contact are in the gold button and the footer.
  const navLinks = [
    { href: '/#features', label: t.nav.features },
    { href: '/hotels', label: t.nav.hotels },
    { href: '/pricing', label: t.nav.pricing },
    { href: '/agents', label: t.nav.agents },
  ];

  function closeMenu() {
    setOpen(false);
  }

  return (
    <nav className="navbar">
      <style>{NAVBAR_CSS}</style>
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
            <a
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              aria-current={pathname !== '/' && link.href.startsWith(pathname) ? 'page' : undefined}
            >
              {link.label}
            </a>
          ))}
        </div>
        <LanguagePicker />
        {/* Logged in → "My account", otherwise "Log in". Same style as the other links. */}
        <a href={who ? who.href : '/login'} className="navbar-auth" onClick={closeMenu}>
          {who ? t.nav.myAccount : t.nav.login}
        </a>
        <a href="/#download" className="navbar-download" onClick={closeMenu}>
          {t.nav.downloadApp}
        </a>
      </div>
    </nav>
  );
}
