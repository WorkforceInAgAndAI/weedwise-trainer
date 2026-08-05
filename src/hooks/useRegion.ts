import { useCallback, useEffect, useState } from 'react';
import { REGIONS, getRegion, type Region } from '@/data/regions';

const KEY = 'weednet-region';

/** Read the saved region id synchronously (safe at module scope). */
export function getStoredRegionId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function getStoredRegion(): Region | null {
  return getRegion(getStoredRegionId());
}

export function useRegion() {
  const [regionId, setRegionId] = useState<string | null>(() => getStoredRegionId());

  useEffect(() => {
    const sync = () => setRegionId(getStoredRegionId());
    window.addEventListener('storage', sync);
    window.addEventListener('weednet-region-change', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('weednet-region-change', sync);
    };
  }, []);

  const setRegion = useCallback((id: string | null) => {
    try {
      if (id) window.localStorage.setItem(KEY, id);
      else window.localStorage.removeItem(KEY);
    } catch {
      /* storage unavailable */
    }
    setRegionId(id);
    window.dispatchEvent(new Event('weednet-region-change'));
    // Weed pools are built at module load, so reload to apply the new region
    // everywhere (learning modules, practice games, glossary).
    window.setTimeout(() => window.location.reload(), 150);
  }, []);

  return { regionId, region: getRegion(regionId), setRegion, regions: REGIONS };
}
