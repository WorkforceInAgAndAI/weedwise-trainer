import { useState } from 'react';

const STAGE_PREFIX_MAP: Record<string, string> = {
  seedling: 'seedling',
  vegetative: 'veg',
  flower: 'repro',
  whole: 'plant',
};

export function getImageSrc(weedId: string, stage: string, variant: 1 | 2 = 1) {
  const prefix = STAGE_PREFIX_MAP[stage] || 'veg';
  return `/images/${weedId}/${prefix}_${variant}.jpg`;
}

export default function WeedImage({ weedId, stage, className }: { weedId: string; stage: string; className?: string }) {
  const [variant] = useState<1 | 2>(() => (Math.random() < 0.5 ? 1 : 2));
  const [fallback, setFallback] = useState(false);
  const [failed, setFailed] = useState(false);
  const src = getImageSrc(weedId, stage, fallback ? (variant === 1 ? 2 : 1) : variant);
  if (failed) return <div className={`flex items-center justify-center bg-muted rounded-lg text-muted-foreground text-xs p-2 ${className || ''}`}>No image</div>;
  return <img src={src} alt="" className={`object-cover rounded-lg ${className || ''}`} onError={() => { if (!fallback) setFallback(true); else setFailed(true); }} />;
}
