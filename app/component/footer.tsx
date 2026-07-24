'use client';

import { HeartIcon } from './Icons';
import { Reveal } from './Reveal';

export default function Footer() {
  return (
    <Reveal slideFrom="up">
      <footer className="footer footer-full">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/logo.jpg" alt="UmrahConnect" />
              <span>UmrahConnect</span>
            </div>
            <p className="footer-tagline">Your complete Umrah &amp; Hajj companion</p>
            <p className="footer-made">
              Made with{' '}
              <span className="svg-icon-inline">
                <HeartIcon size={16} />
              </span>{' '}
              for pilgrims worldwide
            </p>
          </div>

          <div className="footer-links-col">
            <span className="footer-col-title">Explore</span>
            <a href="/#features">Features</a>
            <a href="/hotels">Hotels</a>
            <a href="/#download">Download</a>
            <a href="/contact">Contact</a>
            <a href="/privacy-policy">Privacy Policy</a>
          </div>

          <div className="footer-links-col">
            <span className="footer-col-title">Connect</span>
            <a
              href="https://instagram.com/myumrahconnect"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram @myumrahconnect
            </a>
            <a href="mailto:ahmadado6002@gmail.com">ahmadado6002@gmail.com</a>
            <span className="footer-developer">Developer: Ahmad Ado Muktar</span>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 UmrahConnect. All rights reserved.</p>
        </div>
      </footer>
    </Reveal>
  );
}
