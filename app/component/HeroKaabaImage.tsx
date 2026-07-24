'use client';

import { useState } from 'react';

const KAABA_IMAGE_PRIMARY =
  'https://images.unsplash.com/photo-1564769662533-4f00a87b4056?w=600';
const KAABA_IMAGE_BACKUP =
  'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600';

export default function HeroKaabaImage() {
  const [src, setSrc] = useState(KAABA_IMAGE_PRIMARY);

  return (
    <div className="hero-emoji">
      <div className="hero-float">
        <img
          src={src}
          alt="The Kaaba at Masjid al-Haram in Makkah"
          className="hero-kaaba-image"
          width={600}
          height={800}
          loading="eager"
          decoding="async"
          onError={() => {
            if (src !== KAABA_IMAGE_BACKUP) {
              setSrc(KAABA_IMAGE_BACKUP);
            }
          }}
        />
      </div>
    </div>
  );
}
