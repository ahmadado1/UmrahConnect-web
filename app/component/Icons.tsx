import type { ReactElement, ReactNode } from 'react';

type IconProps = {
  size?: number;
  className?: string;
  stroke?: string;
};

const defaults = { size: 48, stroke: '#C9A84C' };

function IconSvg({
  size = 48,
  className = '',
  stroke = '#C9A84C',
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <g stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </g>
    </svg>
  );
}

export function PrayerTimesIcon(props: IconProps) {
  const { size, className, stroke } = { ...defaults, ...props };
  return (
    <IconSvg size={size} className={className} stroke={stroke}>
      <circle cx="24" cy="26" r="12" />
      <path d="M24 26V18M24 26L30 30" />
      <path d="M14 14C16 10 20 8 24 8C30 8 35 12 36 18" />
    </IconSvg>
  );
}

export function QuranReaderIcon(props: IconProps) {
  const { size, className, stroke } = { ...defaults, ...props };
  return (
    <IconSvg size={size} className={className} stroke={stroke}>
      <path d="M10 12C10 12 14 10 24 10C34 10 38 12 38 12V36C38 36 34 34 24 34C14 34 10 36 10 36V12Z" />
      <path d="M24 10V34" />
      <path d="M15 18H21M27 18H33M15 24H21M27 24H33" />
    </IconSvg>
  );
}

export function UmrahGuideIcon(props: IconProps) {
  const { size, className, stroke } = { ...defaults, ...props };
  return (
    <IconSvg size={size} className={className} stroke={stroke}>
      <rect x="18" y="16" width="12" height="14" rx="1" />
      <path d="M16 30H32" />
      <circle cx="24" cy="24" r="16" strokeDasharray="3 4" opacity="0.7" />
    </IconSvg>
  );
}

export function AIGuideIcon(props: IconProps) {
  const { size, className, stroke } = { ...defaults, ...props };
  return (
    <IconSvg size={size} className={className} stroke={stroke}>
      <path d="M10 14C10 14 14 10 24 10C34 10 38 14 38 14V28C38 28 34 32 24 32C14 32 10 28 10 28V14Z" />
      <path d="M32 8L34 12L38 10L34 14" />
      <path d="M18 20L20 22L26 16" opacity="0.5" />
    </IconSvg>
  );
}

export function DuasDhikrIcon(props: IconProps) {
  const { size, className, stroke } = { ...defaults, ...props };
  return (
    <IconSvg size={size} className={className} stroke={stroke}>
      <path d="M16 28C16 22 19 18 24 18C29 18 32 22 32 28" />
      <path d="M14 28H34" />
      <circle cx="24" cy="34" r="2" fill={stroke} stroke="none" />
      <path d="M20 14L24 10L28 14" />
    </IconSvg>
  );
}

export function HotelsIcon(props: IconProps) {
  const { size, className, stroke } = { ...defaults, ...props };
  return (
    <IconSvg size={size} className={className} stroke={stroke}>
      <path d="M12 36V18L24 12L36 18V36" />
      <path d="M18 36V26H30V36" />
      <path d="M18 22H22M26 22H30M18 28H22M26 28H30" />
      <path d="M20 12C22 10 26 10 28 12" />
    </IconSvg>
  );
}

export function MapsNavigationIcon(props: IconProps) {
  const { size, className, stroke } = { ...defaults, ...props };
  return (
    <IconSvg size={size} className={className} stroke={stroke}>
      <circle cx="24" cy="24" r="14" />
      <path d="M24 10V38M10 24H38" />
      <path d="M24 14L28 24L24 34L20 24Z" fill={stroke} stroke="none" opacity="0.35" />
      <circle cx="24" cy="24" r="2" fill={stroke} stroke="none" />
    </IconSvg>
  );
}

export function QiblaIcon(props: IconProps) {
  const { size, className, stroke } = { ...defaults, ...props };
  return (
    <IconSvg size={size} className={className} stroke={stroke}>
      <circle cx="24" cy="24" r="14" />
      <path d="M24 8L26 22L24 36L22 22Z" fill={stroke} stroke="none" opacity="0.5" />
      <path d="M24 8V36M8 24H40" opacity="0.4" />
      <rect x="20" y="10" width="8" height="6" rx="1" />
    </IconSvg>
  );
}

export function TravelAgentsIcon(props: IconProps) {
  const { size, className, stroke } = { ...defaults, ...props };
  return (
    <IconSvg size={size} className={className} stroke={stroke}>
      <path d="M14 28C14 24 18 22 22 22H26C30 22 34 24 34 28V32H14V28Z" />
      <circle cx="24" cy="16" r="5" />
      <rect x="30" y="26" width="8" height="10" rx="1" />
      <path d="M32 30H36" />
    </IconSvg>
  );
}

export function FlightsIcon(props: IconProps) {
  const { size, className, stroke } = { ...defaults, ...props };
  return (
    <IconSvg size={size} className={className} stroke={stroke}>
      <path d="M8 26L20 22L28 14L36 16L32 24L40 28L32 30L28 38L20 30L8 32L12 26H8Z" />
      <path d="M10 12C12 10 16 10 18 12" opacity="0.6" />
    </IconSvg>
  );
}

export function ServicesIcon(props: IconProps) {
  const { size, className, stroke } = { ...defaults, ...props };
  return (
    <IconSvg size={size} className={className} stroke={stroke}>
      <rect x="10" y="14" width="12" height="12" rx="2" />
      <rect x="26" y="14" width="12" height="12" rx="2" />
      <rect x="10" y="30" width="12" height="12" rx="2" />
      <rect x="26" y="30" width="12" height="12" rx="2" />
    </IconSvg>
  );
}

export function KaabaIcon(props: IconProps) {
  const { size, className, stroke } = { ...defaults, ...props };
  return (
    <IconSvg size={size} className={className} stroke={stroke}>
      <path d="M14 32L24 10L34 32Z" />
      <path d="M12 32H36" />
      <path d="M16 32V28H32V32" />
      <path d="M20 24H28" />
    </IconSvg>
  );
}

export function CrescentMoonIcon(props: IconProps) {
  const { size, className, stroke } = { ...defaults, ...props };
  return (
    <IconSvg size={size} className={className} stroke={stroke}>
      <path d="M28 10C22 10 18 15 18 22C18 29 22 34 28 34C26 32 25 29 25 26C25 19 29 14 34 12C32 11 30 10 28 10Z" />
    </IconSvg>
  );
}

export function GlobeIcon(props: IconProps) {
  const { size, className, stroke } = { ...defaults, ...props };
  return (
    <IconSvg size={size} className={className} stroke={stroke}>
      <circle cx="24" cy="24" r="14" />
      <path d="M10 24H38M24 10C20 16 20 32 24 38C28 32 28 16 24 10Z" />
    </IconSvg>
  );
}

export function SmartphoneIcon(props: IconProps) {
  const { size, className, stroke } = { ...defaults, ...props };
  return (
    <IconSvg size={size} className={className} stroke={stroke}>
      <rect x="16" y="8" width="16" height="32" rx="3" />
      <path d="M22 36H26" />
    </IconSvg>
  );
}

export function AccountIcon(props: IconProps) {
  const { size, className, stroke } = { ...defaults, ...props };
  return (
    <IconSvg size={size} className={className} stroke={stroke}>
      <path d="M14 34V30C14 26 18 24 24 24C30 24 34 26 34 30V34" />
      <circle cx="24" cy="16" r="6" />
      <path d="M30 12L34 8" />
    </IconSvg>
  );
}

export function HeartIcon(props: IconProps) {
  const { size, className, stroke } = { ...defaults, ...props };
  return (
    <IconSvg size={size} className={className} stroke={stroke}>
      <path d="M24 36L12 24C8 20 8 14 12 11C15 8 20 9 24 13C28 9 33 8 36 11C40 14 40 20 36 24L24 36Z" />
    </IconSvg>
  );
}

export function MosqueIcon(props: IconProps) {
  const { size, className, stroke } = { ...defaults, ...props };
  return (
    <IconSvg size={size} className={className} stroke={stroke}>
      <path d="M24 10V14" />
      <path d="M20 14C22 12 26 12 28 14" />
      <path d="M12 34V22L24 16L36 22V34" />
      <path d="M10 34H38" />
      <circle cx="24" cy="26" r="2" />
    </IconSvg>
  );
}

export function LocationPinIcon(props: IconProps) {
  const { size, className, stroke } = { ...defaults, ...props };
  return (
    <IconSvg size={size} className={className} stroke={stroke}>
      <path d="M24 8C18 8 14 12 14 18C14 26 24 38 24 38C24 38 34 26 34 18C34 12 30 8 24 8Z" />
      <circle cx="24" cy="18" r="4" />
    </IconSvg>
  );
}

export function PriceTagIcon(props: IconProps) {
  const { size, className, stroke } = { ...defaults, ...props };
  return (
    <IconSvg size={size} className={className} stroke={stroke}>
      <path d="M12 14L24 8L36 14V30L24 36L12 30V14Z" />
      <circle cx="24" cy="22" r="4" />
      <path d="M24 20V24" />
    </IconSvg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  const { size = 24, className, stroke = 'currentColor' } = props;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 9L12 15L18 9" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MenuIcon({ size = 24, stroke = 'currentColor' }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7H20M4 12H20M4 17H20" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ size = 24, stroke = 'currentColor' }: { size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6L18 18M18 6L6 18" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function StarIcon({ filled = true, size = 14, stroke = '#C9A84C' }: { filled?: boolean; size?: number; stroke?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? stroke : 'none'} stroke={stroke} strokeWidth="1.5" aria-hidden="true">
      <path d="M12 3L14.5 9.5L21 10.5L16.5 15L18 21.5L12 18L6 21.5L7.5 15L3 10.5L9.5 9.5L12 3Z" />
    </svg>
  );
}

export type FeatureIconName =
  | 'prayer-times'
  | 'quran-reader'
  | 'ai-guide'
  | 'umrah-guide'
  | 'hotels'
  | 'services'
  | 'duas-dhikr'
  | 'maps'
  | 'qibla'
  | 'travel-agents'
  | 'flights';

const featureIconMap: Record<FeatureIconName, (props: IconProps) => ReactElement> = {
  'prayer-times': PrayerTimesIcon,
  'quran-reader': QuranReaderIcon,
  'ai-guide': AIGuideIcon,
  'umrah-guide': UmrahGuideIcon,
  hotels: HotelsIcon,
  services: ServicesIcon,
  'duas-dhikr': DuasDhikrIcon,
  maps: MapsNavigationIcon,
  qibla: QiblaIcon,
  'travel-agents': TravelAgentsIcon,
  flights: FlightsIcon,
};

export function FeatureIcon({
  name,
  size = 48,
  className = '',
}: {
  name: FeatureIconName;
  size?: number;
  className?: string;
}) {
  const Icon = featureIconMap[name];
  return (
    <span className={`svg-icon-wrap${className ? ` ${className}` : ''}`}>
      <Icon size={size} />
    </span>
  );
}
