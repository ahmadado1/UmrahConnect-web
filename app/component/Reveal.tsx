'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react';

export function useInView(threshold = 0.15) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold, rootMargin: '0px 0px -5% 0px' },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

export type RevealSlideFrom =
  | 'up'
  | 'left'
  | 'right'
  | 'scale'
  | 'top'
  | 'left-lg'
  | 'right-lg'
  | 'hotel-card'
  | 'bounce';

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  slideFrom?: RevealSlideFrom;
  threshold?: number;
  as?: ElementType;
};

export function Reveal({
  children,
  className = '',
  delay = 0,
  slideFrom = 'up',
  threshold = 0.15,
  as: Tag = 'div',
}: RevealProps) {
  const { ref, inView } = useInView(threshold);
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`reveal reveal-from-${slideFrom}${active ? ' reveal-active' : ''}${inView ? ' reveal-visible' : ''}${className ? ` ${className}` : ''}`}
      style={{ '--reveal-delay': `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
