import { useCallback, useEffect, useState } from 'react';
import { useGameProgress } from '@/contexts/GameProgressContext';

/**
 * Cross-game "Weed Hero Store" wallet + inventory.
 *
 * Coins are earned from the badges students win in Practice games, and the
 * items they buy carry over into the Play (Farm) module as extra gear.
 * Purchases persist in localStorage so a student keeps their hero between
 * sessions on the same device.
 */

export type StoreBand = 'k5' | 'ms' | 'hs';

export type StoreCategory = 'outfit' | 'power' | 'tool' | 'equipment';

export interface StoreItem {
  id: string;
  name: string;
  cost: number;
  category: StoreCategory;
  desc: string;
  /** What it does once the student takes it into the Farm (Play) module. */
  farmPerk: string;
  /** Slot for wearables so only one item shows per body area. */
  slot?: 'head' | 'body' | 'hands' | 'feet' | 'cape';
}

/* ------------------------------- Catalogs ------------------------------- */

export const K5_ITEMS: StoreItem[] = [
  // Clothing — build your Weed Control Superhero
  { id: 'k5-hat',    name: 'Scout Cap',          cost: 60,  category: 'outfit', slot: 'head',  desc: 'A sunny field cap for long scouting days.', farmPerk: 'Scouting shows one extra weed clue.' },
  { id: 'k5-helmet', name: 'Hero Helmet',        cost: 140, category: 'outfit', slot: 'head',  desc: 'Shiny helmet with a leaf crest.',           farmPerk: 'Scouting shows two extra weed clues.' },
  { id: 'k5-suit',   name: 'Green Hero Suit',    cost: 120, category: 'outfit', slot: 'body',  desc: 'Leafy super-suit with a seedling badge.',   farmPerk: 'Your crops start the season healthier.' },
  { id: 'k5-vest',   name: 'Safety Vest',        cost: 80,  category: 'outfit', slot: 'body',  desc: 'Bright vest so everyone can see you.',      farmPerk: 'Safety reminders appear before risky jobs.' },
  { id: 'k5-gloves', name: 'Garden Gloves',      cost: 70,  category: 'outfit', slot: 'hands', desc: 'Never touch a weed with bare hands!',       farmPerk: 'Hand-pulling is safe and faster.' },
  { id: 'k5-boots',  name: 'Muddy Field Boots',  cost: 90,  category: 'outfit', slot: 'feet',  desc: 'Stomp through any muddy row.',              farmPerk: 'Walk the whole field in one visit.' },
  { id: 'k5-cape',   name: 'Sunshine Cape',      cost: 160, category: 'outfit', slot: 'cape',  desc: 'A cape that glows like sunlight.',          farmPerk: 'Crops grow back faster after weed damage.' },
  // Powers — used in the Farm module
  { id: 'k5-pull',   name: 'Super Strength Pull', cost: 100, category: 'power', desc: 'Yank a big weed right out of the ground.',        farmPerk: 'Farm action: pull one weed for free.' },
  { id: 'k5-mulch',  name: 'Mulch Blanket Blast', cost: 130, category: 'power', desc: 'Cover the soil so weed seeds stay asleep.',       farmPerk: 'Farm action: stops new weeds for one season.' },
  { id: 'k5-goat',   name: 'Goat Squad Call',     cost: 150, category: 'power', desc: 'Hungry goats munch the weeds in a pasture.',      farmPerk: 'Farm action: clears weeds in one field corner.' },
  { id: 'k5-bee',    name: 'Pollinator Friends',  cost: 110, category: 'power', desc: 'Bees and butterflies help your crops.',           farmPerk: 'Farm bonus: extra yield at harvest.' },
  { id: 'k5-rain',   name: 'Rain Cloud Helper',   cost: 120, category: 'power', desc: 'Bring a gentle rain to thirsty crops.',           farmPerk: 'Farm action: water the crops once per season.' },
];

export const MS_ITEMS: StoreItem[] = [
  { id: 'ms-hoe',       name: 'Stirrup Hoe',            cost: 120, category: 'tool', desc: 'Slices young weeds just below the soil surface.',    farmPerk: 'Cultural control: removes seedling-stage weeds.' },
  { id: 'ms-cultivator',name: 'Row Cultivator',         cost: 220, category: 'tool', desc: 'Between-row mechanical control for small weeds.',    farmPerk: 'Mechanical action available in the Farm module.' },
  { id: 'ms-mulch',     name: 'Cover-Crop Seeder',      cost: 260, category: 'tool', desc: 'Plants a cereal rye cover crop to shade out weeds.', farmPerk: 'Cuts new weed emergence next season.' },
  { id: 'ms-backpack',  name: 'Backpack Sprayer',       cost: 240, category: 'tool', desc: 'Targeted spot spraying for escaped weeds.',          farmPerk: 'Spot-treat individual weeds without full spray cost.' },
  { id: 'ms-hand-lens', name: '10x Hand Lens',          cost: 90,  category: 'tool', desc: 'Check leaf hairs, ligules, and collars up close.',   farmPerk: 'Identification hints during scouting.' },
  { id: 'ms-quadrat',   name: 'Scouting Quadrat',       cost: 110, category: 'tool', desc: 'Count weeds per square meter for density.',          farmPerk: 'Shows weed density vs. economic threshold.' },
  { id: 'ms-ppe',       name: 'PPE Kit',                cost: 150, category: 'equipment', desc: 'Gloves, goggles, and a chemical-resistant apron.', farmPerk: 'Required before any herbicide job — unlocks chemical actions.' },
  { id: 'ms-mower',     name: 'Pasture Mower',          cost: 280, category: 'equipment', desc: 'Clip weeds before they set seed.',              farmPerk: 'Stops seed production on tall pasture weeds.' },
  { id: 'ms-flame',     name: 'Flame Weeder',           cost: 300, category: 'equipment', desc: 'Heat bursts kill weed seedlings without chemicals.', farmPerk: 'Non-chemical control on emerged seedlings.' },
];

export const HS_ITEMS: StoreItem[] = [
  { id: 'hs-boom',      name: 'Self-Propelled Boom Sprayer', cost: 600, category: 'equipment', desc: '90-ft boom with rate controller for uniform coverage.', farmPerk: 'Full-field herbicide passes at lower cost per acre.' },
  { id: 'hs-nozzles',   name: 'Air-Induction Nozzle Set',    cost: 200, category: 'tool',      desc: 'Coarse droplets that dramatically cut drift.',          farmPerk: 'Reduces drift penalties in the Farm module.' },
  { id: 'hs-rowunit',   name: 'High-Residue Row Cultivator', cost: 520, category: 'equipment', desc: 'Cultivates in heavy residue no-till fields.',           farmPerk: 'Mechanical control without burying residue.' },
  { id: 'hs-drill',     name: 'Cover-Crop Drill',            cost: 480, category: 'equipment', desc: 'Seeds cereal rye for weed suppression.',                farmPerk: 'Lowers next-season weed pressure.' },
  { id: 'hs-drone',     name: 'Scouting Drone',              cost: 450, category: 'tool',      desc: 'Aerial NDVI imagery flags weed escapes.',               farmPerk: 'Reveals hidden weed patches when scouting.' },
  { id: 'hs-seeker',    name: 'Green-on-Brown Spot Sprayer', cost: 700, category: 'equipment', desc: 'Optical sensors spray only where weeds are.',           farmPerk: 'Big herbicide savings on burndown passes.' },
  { id: 'hs-soiltest',  name: 'Soil Test Kit',               cost: 160, category: 'tool',      desc: 'pH and organic matter drive herbicide carryover.',      farmPerk: 'Warns about carryover injury before you spray.' },
  { id: 'hs-weather',   name: 'Field Weather Station',       cost: 320, category: 'tool',      desc: 'Wind, inversion, and temperature at the boom.',         farmPerk: 'Predicts safe spray windows.' },
  { id: 'hs-resistance',name: 'Resistance Screening Service',cost: 380, category: 'tool',      desc: 'Lab-tests escapes for herbicide resistance.',           farmPerk: 'Identifies resistant biotypes before rescue treatments.' },
  { id: 'hs-ppe',       name: 'Applicator PPE + Respirator', cost: 220, category: 'equipment', desc: 'Label-required protection for restricted-use products.', farmPerk: 'Unlocks restricted-use herbicide actions.' },
];

export const BAND_CATALOG: Record<StoreBand, StoreItem[]> = { k5: K5_ITEMS, ms: MS_ITEMS, hs: HS_ITEMS };

export const BAND_TITLE: Record<StoreBand, string> = {
  k5: 'Weed Hero Store',
  ms: 'Field Tool Shop',
  hs: 'Farm Equipment Dealer',
};

/* ------------------------------ Persistence ----------------------------- */

interface Persisted { spent: number; owned: string[]; }

const KEY = (band: StoreBand) => `weednet-store:${band}`;

function read(band: StoreBand): Persisted {
  if (typeof window === 'undefined') return { spent: 0, owned: [] };
  try {
    const raw = window.localStorage.getItem(KEY(band));
    if (!raw) return { spent: 0, owned: [] };
    const p = JSON.parse(raw) as Partial<Persisted>;
    return { spent: typeof p.spent === 'number' ? p.spent : 0, owned: Array.isArray(p.owned) ? p.owned : [] };
  } catch { return { spent: 0, owned: [] }; }
}

function write(band: StoreBand, state: Persisted) {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(KEY(band), JSON.stringify(state)); } catch { /* noop */ }
}

/** Items a student owns, readable outside of React (used by the Farm module). */
export function ownedItems(band: StoreBand): StoreItem[] {
  const ids = new Set(read(band).owned);
  return BAND_CATALOG[band].filter(i => ids.has(i.id));
}

/* -------------------------------- The hook ------------------------------ */

const BASE_COINS = 200;     // starter allowance so every student can buy something
const COINS_PER_BADGE = 40;

export function usePracticeStore(band: StoreBand) {
  const { badges } = useGameProgress();
  const [state, setState] = useState<Persisted>(() => read(band));

  useEffect(() => { setState(read(band)); }, [band]);
  useEffect(() => { write(band, state); }, [band, state]);

  // Coins come from badge performance: every badge pays out, better scores pay more.
  const earned = BASE_COINS + badges.reduce((sum, b) => {
    const pct = b.total > 0 ? b.score / b.total : 0;
    return sum + COINS_PER_BADGE + Math.round(pct * 60);
  }, 0);

  const coins = Math.max(0, earned - state.spent);

  const owns = useCallback((id: string) => state.owned.includes(id), [state.owned]);

  const buy = useCallback((item: StoreItem) => {
    setState(s => {
      if (s.owned.includes(item.id)) return s;
      if (earned - s.spent < item.cost) return s;
      return { spent: s.spent + item.cost, owned: [...s.owned, item.id] };
    });
  }, [earned]);

  const reset = useCallback(() => setState({ spent: 0, owned: [] }), []);

  const owned = BAND_CATALOG[band].filter(i => state.owned.includes(i.id));

  return { coins, earned, owned, ownedIds: state.owned, owns, buy, reset, catalog: BAND_CATALOG[band] };
}
