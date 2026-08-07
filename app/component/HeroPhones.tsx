import PhoneMockup from './PhoneMockup';
import { APP_SCREENSHOTS } from './screenshotPaths';

export default function HeroPhones() {
  return (
    <div className="hero-phones">
      <div className="hero-phones-stack hero-float">
        <div className="hero-phone hero-phone--back">
          <PhoneMockup
            src={APP_SCREENSHOTS.qibla}
            alt="UmrahConnect Qibla compass screen"
          />
        </div>
        <div className="hero-phone hero-phone--front">
          <PhoneMockup
            src={APP_SCREENSHOTS.home}
            alt="UmrahConnect home and prayer screen"
          />
        </div>
      </div>
    </div>
  );
}
