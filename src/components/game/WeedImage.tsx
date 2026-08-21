import { useState, useMemo } from 'react';
import { resolveImageUrl } from '@/lib/imageMap';

const STAGE_PREFIX_MAP: Record<string, string> = {
 seed: 'seed',
 seedling: 'seedling',
 vegetative: 'leaf',
 leaf: 'leaf',
 flower: 'reprof',
 whole: 'reprof',
 mature: 'reprof',
 plant: 'reprof',
 reproductive: 'reprof',
 repro: 'reprof',
 seedhead: 'repros',
 fruit: 'repros',
 repros: 'repros',
 ligule: 'lig',
 male: 'male',
 female: 'female',
 rosette: 'rosette',
 shoot: 'shoot',
 underground: 'underground',
 stem: 'stem',
 pod: 'pod',
 seedpod: 'pod',
};

/** Reproductive images have no variant number: reprof_.jpg / repros_.jpg */
const NO_VARIANT_PREFIXES = ['reprof', 'repros'];

export function getImageSrc(weedId: string, stage: string, variant: 1 | 2 = 1, ext = 'jpg') {
 // Handle herbicide injury images like "g_01"
 if (stage.startsWith('g_')) {
  const filename = `Herbicide_Injury_Images/${stage}.${ext}`;
  return resolveImageUrl(weedId, filename) || `/images/${weedId}/Herbicide_Injury_Images/${filename}`;
 }
 const prefix = STAGE_PREFIX_MAP[stage.toLowerCase()] || 'leaf';
 if (NO_VARIANT_PREFIXES.includes(prefix)) {
  const filename = `${prefix}_.${ext}`;
  return resolveImageUrl(weedId, filename) || `/images/${weedId}/${filename}`;
 }
 // male/female images don't have variant numbers
 if (stage === 'male' || stage === 'female') {
  const filename = `${prefix}.${ext}`;
  return resolveImageUrl(weedId, filename) || `/images/${weedId}/${filename}`;
 }
 const filename = `${prefix}_${variant}.${ext}`;
 return resolveImageUrl(weedId, filename) || `/images/${weedId}/${filename}`;
}

export default function WeedImage({ weedId, stage, className, preferredVariant }: { weedId: string; stage: string; className?: string; preferredVariant?: 1 | 2 }) {
 const [errorCount, setErrorCount] = useState(0);

 // Build ordered list of resolved image URLs synchronously
 const resolvedAttempts = useMemo(() => {
  const exts = ['jpg', 'jpeg', 'png', 'webp'];
  const key = stage.toLowerCase();

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
  if (key === 'male' || key === 'female') {
   const prefix = key;
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

  const prefixForStage = STAGE_PREFIX_MAP[key] || 'leaf';

  // Reproductive images: single file per type (reprof_ = flower, repros_ = seed head).
  if (NO_VARIANT_PREFIXES.includes(prefixForStage)) {
   const urls: string[] = [];
   for (const ext of exts) {
    const url = resolveImageUrl(weedId, `${prefixForStage}_.${ext}`);
    if (url) urls.push(url);
   }
   // Legacy numbered reproductive files, then the other reproductive type.
   for (const name of ['repro_1', 'repro_2', 'repror_', prefixForStage === 'reprof' ? 'repros_' : 'reprof_']) {
    for (const ext of exts) {
     const url = resolveImageUrl(weedId, `${name}.${ext}`);
     if (url) urls.push(url);
    }
   }
   return urls;
  }

  // Same variant for every weed at a given stage, so side-by-side comparisons
  // (look-alikes, sorting games) always show the same kind of photo.
  const variant: 1 | 2 = preferredVariant ?? 1;
  const otherVariant: 1 | 2 = variant === 1 ? 2 : 1;
  const prefix = prefixForStage;
  
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
  if (urls.length === 0) {
   for (const name of ['reprof_', 'repros_']) {
    for (const ext of exts) {
     const url = resolveImageUrl(weedId, `${name}.${ext}`);
     if (url) urls.push(url);
    }
   }
  }
  return urls;
 }, [weedId, stage, preferredVariant]);

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
