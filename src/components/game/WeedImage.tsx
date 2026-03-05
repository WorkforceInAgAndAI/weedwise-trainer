import { useState } from 'react';
import { resolveImageUrl } from '@/lib/imageMap';

const STAGE_PREFIX_MAP: Record<string, string> = {
  seedling: 'seedling',
  vegetative: 'veg',
  flower: 'repro',
  whole: 'plant',
};

export function getImageSrc(weedId: string, stage: string, variant: 1 | 2 = 1, ext = 'jpg') {
  const prefix = STAGE_PREFIX_MAP[stage] || 'veg';
  const filename = `${prefix}_${variant}.${ext}`;
  return resolveImageUrl(weedId, filename) || `/images/${weedId}/${filename}`;
}

export default function WeedImage({ weedId, stage, className }: { weedId: string; stage: string; className?: string }) {
  const [variant] = useState<1 | 2>(() => (Math.random() < 0.5 ? 1 : 2));
  const [attemptIndex, setAttemptIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  const otherVariant: 1 | 2 = variant === 1 ? 2 : 1;
  const prefix = STAGE_PREFIX_MAP[stage] || 'veg';

  // Build attempts using the resolved image map
  const attempts = [
    `${prefix}_${variant}.jpg`,
    `${prefix}_${variant}.jpeg`,
    `${prefix}_${otherVariant}.jpg`,
    `${prefix}_${otherVariant}.jpeg`,
  ];

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg text-muted-foreground text-xs p-2 ${className || ''}`}>
        No image
      </div>
    );
  }

  const filename = attempts[attemptIndex];
  const src = resolveImageUrl(weedId, filename);

  // If this attempt has no resolved URL, skip to next
  if (!src) {
    if (attemptIndex < attempts.length - 1) {
      // Use a micro-task to avoid setting state during render
      const nextIndex = attemptIndex + 1;
      // Find next valid attempt
      let found = false;
      for (let i = nextIndex; i < attempts.length; i++) {
        if (resolveImageUrl(weedId, attempts[i])) {
          if (i !== attemptIndex) {
            setTimeout(() => setAttemptIndex(i), 0);
          }
          found = true;
          break;
        }
      }
      if (!found) {
        setTimeout(() => setFailed(true), 0);
      }
      return null; // render nothing while resolving
    }
    setTimeout(() => setFailed(true), 0);
    return null;
  }

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
