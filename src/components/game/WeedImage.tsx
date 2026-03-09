import { useState, useMemo } from 'react';
import { resolveImageUrl } from '@/lib/imageMap';

const STAGE_PREFIX_MAP: Record<string, string> = {
  seedling: 'seedling',
  vegetative: 'veg',
  flower: 'repro',
  whole: 'plant',
  ligule: 'ligule',
};

export function getImageSrc(weedId: string, stage: string, variant: 1 | 2 = 1, ext = 'jpg') {
  const prefix = STAGE_PREFIX_MAP[stage] || 'veg';
  const filename = `${prefix}_${variant}.${ext}`;
  return resolveImageUrl(weedId, filename) || `/images/${weedId}/${filename}`;
}

export default function WeedImage({ weedId, stage, className }: { weedId: string; stage: string; className?: string }) {
  const [errorCount, setErrorCount] = useState(0);

  // Build ordered list of resolved image URLs synchronously
  const resolvedAttempts = useMemo(() => {
    const variant = Math.random() < 0.5 ? 1 : 2;
    const otherVariant = variant === 1 ? 2 : 1;
    const prefix = STAGE_PREFIX_MAP[stage] || 'veg';
    const exts = ['jpg', 'jpeg', 'png', 'webp'];
    
    const urls: string[] = [];
    // Primary variant first, all extensions
    for (const ext of exts) {
      const url = resolveImageUrl(weedId, `${prefix}_${variant}.${ext}`);
      if (url) urls.push(url);
    }
    // Then other variant
    for (const ext of exts) {
      const url = resolveImageUrl(weedId, `${prefix}_${otherVariant}.${ext}`);
      if (url) urls.push(url);
    }
    // Fallback: try 'plant' stage if original stage had no images
    if (urls.length === 0 && prefix !== 'plant') {
      for (const v of [variant, otherVariant]) {
        for (const ext of exts) {
          const url = resolveImageUrl(weedId, `plant_${v}.${ext}`);
          if (url) urls.push(url);
        }
      }
    }
    return urls;
  }, [weedId, stage]);

  if (resolvedAttempts.length === 0 || errorCount >= resolvedAttempts.length) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-lg text-muted-foreground text-xs p-2 ${className || ''}`}>
        No image
      </div>
    );
  }

  const src = resolvedAttempts[errorCount];

  return (
    <img
      src={src}
      alt=""
      className={`object-cover rounded-lg ${className || ''}`}
      onError={() => setErrorCount(prev => prev + 1)}
    />
  );
}
