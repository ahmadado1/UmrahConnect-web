'use client';

import { useT } from '@/lib/i18n/I18nProvider';
import { HeartIcon, InstagramIcon, MailIcon } from './Icons';
import { Reveal } from './Reveal';

export default function Footer() {
  const { t } = useT();
  return (
    <Reveal slideFrom="up">
      <footer className="footer footer-full">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/logo.jpg" alt="UmrahConnect" />
              <span>UmrahConnect</span>
            </div>
            <p className="footer-tagline">{t.footer.tagline}</p>
            <p className="footer-made">
              {t.footer.made}{' '}
              <span className="svg-icon-inline">
                <HeartIcon size={16} />
              </span>{' '}
              {t.footer.madeAfter}
            </p>
          </div>

          <div className="footer-links-col">
            <span className="footer-col-title">{t.footer.explore}</span>
            <a href="/#features">{t.nav.features}</a>
            <a href="/hotels">{t.nav.hotels}</a>
            <a href="/#download">{t.nav.download}</a>
            <a href="/contact">{t.nav.contact}</a>
            <a href="/agents">{t.nav.agents}</a>
            <a href="/advertise">{t.footer.advertise}</a>
            <a href="/privacy-policy">{t.footer.privacy}</a>
            <a href="/delete-account">{t.footer.deleteAccount}</a>
          </div>

          <div className="footer-links-col">
            <span className="footer-col-title">{t.footer.connect}</span>
            <a
              href="https://instagram.com/umrahconnectapp"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-connect-link"
            >
              <InstagramIcon size={16} stroke="#C9A84C" />
              <span>@umrahconnectapp</span>
            </a>
            <a href="mailto:info@myumrahconnect.com" className="footer-connect-link">
              <MailIcon size={16} stroke="#C9A84C" />
              <span>info@myumrahconnect.com</span>
            </a>
            <span className="footer-developer">{t.footer.developer}</span>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{t.footer.rights}</p>
        </div>
      </footer>
    </Reveal>
  );
}
