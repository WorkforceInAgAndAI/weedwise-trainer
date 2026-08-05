/**
 * Shared level-based difficulty scaling for all practice mini-games.
 *
 * Every mini-game tracks a `level` that increases when the player chooses
 * "Next Level" on the LevelComplete screen. These helpers make each level
 * measurably harder than the last so replays are never identical.
 */

export type GradeBand = 'k5' | 'ms' | 'hs';

export interface Difficulty {
  /** 1-based level */
  level: number;
  /** number of questions / cases / pairs in the level */
  rounds: number;
  /** number of multiple-choice options to present */
  options: number;
  /** seconds allowed (for timed games); Infinity when untimed at low levels */
  seconds: number;
  /** speed / spawn-rate multiplier for action games (1 = base) */
  speed: number;
  /** show the helper hint text under the prompt */
  showHints: boolean;
  /** prefer distractors from the same family (harder look-alikes) */
  hardDistractors: boolean;
  /** ask with scientific names instead of common names */
  useScientificNames: boolean;
}

const BASE: Record<GradeBand, { rounds: number; options: number; seconds: number }> = {
  k5: { rounds: 5, options: 3, seconds: 75 },
  ms: { rounds: 6, options: 4, seconds: 65 },
  hs: { rounds: 8, options: 4, seconds: 55 },
};

const MAX: Record<GradeBand, { rounds: number; options: number }> = {
  k5: { rounds: 9, options: 4 },
  ms: { rounds: 12, options: 6 },
  hs: { rounds: 14, options: 6 },
};

export function getDifficulty(level: number, band: GradeBand = 'ms'): Difficulty {
  const l = Math.max(1, Math.floor(level || 1));
  const step = l - 1;
  const base = BASE[band];
  const max = MAX[band];

  return {
    level: l,
    rounds: Math.min(max.rounds, base.rounds + Math.floor(step * (band === 'k5' ? 1 : 1.5))),
    options: Math.min(max.options, base.options + Math.floor(step / 2)),
    seconds: Math.max(band === 'k5' ? 35 : 25, base.seconds - step * 5),
    speed: 1 + step * (band === 'k5' ? 0.12 : 0.18),
    showHints: band === 'k5' ? l <= 2 : l <= 1,
    hardDistractors: l >= (band === 'k5' ? 3 : 2),
    useScientificNames: band === 'hs' && l >= 3,
  };
}

/**
 * Rotate a pool by level so a player never sees the same species set twice
 * in a row, then take `count` items.
 */
export function levelSlice<T>(pool: T[], level: number, count: number): T[] {
  if (pool.length === 0) return [];
  const offset = ((Math.max(1, level) - 1) * count) % pool.length;
  return pool.slice(offset).concat(pool).slice(0, Math.min(count, pool.length));
}
