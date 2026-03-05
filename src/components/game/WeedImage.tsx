import { useState } from 'react';

const STAGE_PREFIX_MAP: Record<string, string> = {
  seedling: 'seedling',
  vegetative: 'veg',
  flower: 'repro',
  whole: 'plant',
};

const EXTENSIONS = ['jpg', 'jpeg'];

export function getImageSrc(weedId: string, stage: string, variant: 1 | 2 = 1, ext = 'jpg') {
  const prefix = STAGE_PREFIX_MAP[stage] || 'veg';
  return `/images/${weedId}/${prefix}_${variant}.${ext}`;
}

export default function WeedImage({ weedId, stage, className }: { weedId: string; stage: string; className?: string }) {
  const [variant] = useState<1 | 2>(() => (Math.random() < 0.5 ? 1 : 2));
  const [attemptIndex, setAttemptIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  // Try: variant + jpg, variant + jpeg, otherVariant + jpg, otherVariant + jpeg
  const otherVariant: 1 | 2 = variant === 1 ? 2 : 1;
  const attempts = [
    { v: variant, ext: 'jpg' },
    { v: variant, ext: 'jpeg' },
    { v: otherVariant, ext: 'jpg' },
    { v: otherVariant, ext: 'jpeg' },
  ];

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg text-muted-foreground text-xs p-2 ${className || ''}`}>
        No image
      </div>
    );
  }

  const current = attempts[attemptIndex];
  const src = getImageSrc(weedId, stage, current.v as 1 | 2, current.ext);

  return (
    <img
      src={src}
      alt=""
      className={`object-cover rounded-lg ${className || ''}`}
      onError={() => {
        if (attemptIndex < attempts.length - 1) {
          setAttemptIndex(attemptIndex + 1);
        } else {
          setFailed(true);
        }
      }}
    />
  );
}
