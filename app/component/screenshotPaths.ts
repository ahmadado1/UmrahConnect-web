// App screenshots shown on the website, resized to 600 px wide WebP (tens of KB instead of
// 2 MB PNGs) so the page loads fast and scrolls smoothly. Originals stay in /public/images.
// The old "prayer times" screenshot (photo background) is no longer used.
export const APP_SCREENSHOTS = {
  home: '/images/opt/home.webp',
  aiGuide: '/images/opt/aiGuide.webp',
  quran: '/images/opt/quran.webp',
  mushaf: '/images/opt/mushaf.webp',
  umrahChecklist: '/images/opt/umrahChecklist.webp',
  guide: '/images/opt/guide.webp',
  services: '/images/opt/services.webp',
  maps: '/images/opt/maps.webp',
  qibla: '/images/opt/qibla.webp',
} as const;
