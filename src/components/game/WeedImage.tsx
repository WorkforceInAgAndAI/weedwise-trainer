import { useState, useMemo } from 'react';
import { resolveImageUrl } from '@/lib/imageMap';

const STAGE_PREFIX_MAP: Record<string, string> = {
 seed: 'seed',
 seedling: 'seedling',
 vegetative: 'leaf',
 flower: 'repro',
 whole: 'repro',
 ligule: 'lig',
 male: 'male',
 female: 'female',
 rosette: 'rosette',
 shoot: 'shoot',
 underground: 'underground',
};

export function getImageSrc(weedId: string, stage: string, variant: 1 | 2 = 1, ext = 'jpg') {
 // Handle herbicide injury images like "g_01"
 if (stage.startsWith('g_')) {
  const filename = `Herbicide_Injury_Images/${stage}.${ext}`;
  return resolveImageUrl(weedId, filename) || `/images/${weedId}/Herbicide_Injury_Images/${filename}`;
 }
 const prefix = STAGE_PREFIX_MAP[stage] || 'leaf';
 // male/female images don't have variant numbers
 if (stage === 'male' || stage === 'female') {
  const filename = `${prefix}.${ext}`;
  return resolveImageUrl(weedId, filename) || `/images/${weedId}/${filename}`;
 }
 const filename = `${prefix}_${variant}.${ext}`;
 return resolveImageUrl(weedId, filename) || `/images/${weedId}/${filename}`;
}

export default function WeedImage({ weedId, stage, className }: { weedId: string; stage: string; className?: string }) {
 const [errorCount, setErrorCount] = useState(0);

 // Build ordered list of resolved image URLs synchronously
 const resolvedAttempts = useMemo(() => {
  const exts = ['jpg', 'jpeg', 'png', 'webp'];

  // Handle herbicide injury images
  if (stage.startsWith('g_')) {
   const urls: string[] = [];
   for (const ext of exts) {
    const url = resolveImageUrl(weedId, `Herbicide_Injury_Images/${stage}.${ext}`);
    if (url) urls.push(url);
   }
   return urls;
  }

  // Male/female images (no variant number)
  if (stage === 'male' || stage === 'female') {
   const prefix = stage;
   const urls: string[] = [];
   // Prefer seed-head variants when available — they're the clearest way to tell male vs. female apart
   for (const ext of exts) {
    const url = resolveImageUrl(weedId, `${prefix}_seedhead.${ext}`);
    if (url) urls.push(url);
   }
   for (const ext of exts) {
    const url = resolveImageUrl(weedId, `${prefix}.${ext}`);
    if (url) urls.push(url);
   }
   return urls;
  }

  // Deterministic variant per (weedId, stage). Random selection here would
  // reshuffle whenever the component re-mounts (e.g. a weed card moves between
  // DOM parents in drag-and-drop games), which read to students as "the
  // picture changed mid-round". A stable hash keeps the same image for the
  // life of a round while still varying across weeds.
  const hash = `${weedId}|${stage}`.split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 7);
  const variant: 1 | 2 = Math.abs(hash) % 2 === 0 ? 1 : 2;
  const otherVariant: 1 | 2 = variant === 1 ? 2 : 1;
  const prefix = STAGE_PREFIX_MAP[stage] || 'leaf';
  
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
  // Fallback: try 'repro' stage if original stage had no images
  if (urls.length === 0 && prefix !== 'repro') {
   for (const v of [variant, otherVariant]) {
    for (const ext of exts) {
     const url = resolveImageUrl(weedId, `repro_${v}.${ext}`);
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
