// Hero picture: three phones fanned out (Guide · Home · Mushaf), with a glowing crescent
// and "Labbayk Allahumma labbayk" above them. The middle phone is the biggest, in front.
import PhoneMockup from './PhoneMockup';
import { APP_SCREENSHOTS } from './screenshotPaths';

export default function HeroPhones() {
  return (
    <div className="hero-phones hero-enter-phones">
      {/* Decoration (hidden from screen readers) */}
      <div className="hero-deco" aria-hidden="true">
        <span className="hero-moon" />
        <span className="hero-labbayk" lang="ar" dir="rtl">لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ</span>
      </div>

      <div className="hero-fan">
        <div className="hero-fan-phone hero-fan-phone--left">
          <PhoneMockup src={APP_SCREENSHOTS.guide} alt="UmrahConnect guide with prayer times" />
        </div>
        <div className="hero-fan-phone hero-fan-phone--right">
          <PhoneMockup src={APP_SCREENSHOTS.mushaf} alt="UmrahConnect Quran Mushaf page" />
        </div>
        <div className="hero-fan-phone hero-fan-phone--center hero-float">
          <PhoneMockup src={APP_SCREENSHOTS.home} alt="UmrahConnect home screen" />
        </div>
      </div>
    </div>
  );
}
