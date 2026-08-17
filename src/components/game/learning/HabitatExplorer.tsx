import { useMemo, useState } from 'react';
import WeedImage from '@/components/game/WeedImage';
import type { Weed } from '@/types/game';
import {
  HABITAT_HOUSES,
  HABITAT_DEFINITIONS,
  objectiveTraits,
  resolveHabitatHome,
  type HabitatId,
} from '@/data/habitatHomes';

interface Props {
  weeds: Weed[];
  onSelectWeed: (w: Weed) => void;
  /** Photo stage per grade: 6-8 reproductive, 9-12 vegetative, collegiate seedling. */
  stage?: string;
}

/**
 * Habitats & Climate explorer used by the 6-8, 9-12 and collegiate modules.
 * Species are grouped into the seven site-based habitats and presented in a
 * horizontal sliding bar with objective (third-person) site descriptors.
 */
export default function HabitatExplorer({ weeds, onSelectWeed, stage = 'flower' }: Props) {
  const [active, setActive] = useState<HabitatId>('cropland');

  const grouped = useMemo(() => {
    const map = new Map<HabitatId, Weed[]>();
    HABITAT_HOUSES.forEach(h => map.set(h.id, []));
    weeds.forEach(w => {
      const home = resolveHabitatHome(w.commonName);
      home?.habitats.forEach(h => map.get(h)?.push(w));
    });
    map.forEach(list => list.sort((a, b) => a.commonName.localeCompare(b.commonName)));
    return map;
  }, [weeds]);

  const house = HABITAT_HOUSES.find(h => h.id === active)!;
  const list = grouped.get(active) ?? [];

  return (
    <div className="space-y-4">
      {/* Habitat selector */}
      <div className="overflow-x-auto pb-1 -mx-1">
        <div className="flex gap-2 px-1">
          {HABITAT_HOUSES.map(h => {
            const count = grouped.get(h.id)?.length ?? 0;
            const on = h.id === active;
            return (
              <button
                key={h.id}
                onClick={() => setActive(h.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold border transition-colors ${
                  on
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-foreground border-border hover:border-primary'
                }`}
              >
                {h.label} <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Definition panel */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-2">
        <p className="font-display font-bold text-foreground text-base">{house.label}</p>
        <p className="text-sm text-foreground">{HABITAT_DEFINITIONS[active]}</p>
        <p className="text-xs text-muted-foreground">{house.blurb}</p>
      </div>

      {/* Species sliding bar */}
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">No species in this grade's pool occupy this habitat.</p>
      ) : (
        <div className="bg-card border border-border rounded-xl p-4 space-y-2">
          <div className="overflow-x-auto pb-2 -mx-1">
            <div className="flex gap-3 px-1" style={{ minWidth: `${list.length * 12}rem` }}>
              {list.map(w => {
                const traits = objectiveTraits(resolveHabitatHome(w.commonName)?.traits ?? []);
                return (
                  <div key={w.id} className="shrink-0 w-44 bg-background border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => onSelectWeed(w)}
                      className="block w-full h-32 bg-muted hover:opacity-90"
                      aria-label={`Open ${w.commonName} profile`}
                    >
                      <WeedImage weedId={w.id} stage={stage} className="w-full h-full" />
                    </button>
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => onSelectWeed(w)}
                        className="text-left text-xs font-bold text-foreground hover:text-primary"
                      >
                        {w.commonName}
                      </button>
                      <p className="text-[10px] italic text-primary leading-tight">{w.scientificName}</p>
                      <ul className="text-[10px] text-muted-foreground list-disc pl-3 space-y-0.5">
                        {traits.slice(0, 3).map((t, i) => (
                          <li key={i}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">← Slide to see all {list.length} species →</p>
        </div>
      )}
    </div>
  );
}
