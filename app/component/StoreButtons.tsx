'use client';

// App Store / Google Play buttons as two big pills: white for iPhone, gold for Android.
import { useT } from '@/lib/i18n/I18nProvider';

export const APP_STORE_URL = 'https://apps.apple.com/us/app/umrahconnect/id6778753426';
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.myumrahconnect.app';

export default function StoreButtons({ className = '' }: { className?: string }) {
  const { t } = useT();
  return (
    <div className={`store-pills ${className}`.trim()}>
      <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="store-pill store-pill--ios">
        <span className="store-pill-small">{t.hero.freeIphone}</span>
        <span className="store-pill-big">{t.hero.appStore}</span>
      </a>
      <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className="store-pill store-pill--android">
        <span className="store-pill-small">{t.hero.freeAndroid}</span>
        <span className="store-pill-big">{t.hero.googlePlay}</span>
      </a>
    </div>
  );
}
