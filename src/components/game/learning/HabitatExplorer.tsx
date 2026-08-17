import { useMemo } from 'react';
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
 * Environment Profiles explorer used by the 6-8, 9-12 and collegiate modules.
 * Every site-based habitat is laid out on the page (no tabs to click), each with
 * its formal definition and a sliding bar of the species that occupy it.
 */
export default function HabitatExplorer({ weeds, onSelectWeed, stage = 'flower' }: Props) {
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

  return (
    <div className="space-y-4">
      {HABITAT_HOUSES.map(house => {
        const list = grouped.get(house.id) ?? [];
        return (
          <section key={house.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="space-y-1">
              <p className="font-display font-bold text-foreground text-base">
                {house.label} <span className="text-xs font-normal text-muted-foreground">({list.length} species)</span>
              </p>
              <p className="text-sm text-foreground">{HABITAT_DEFINITIONS[house.id]}</p>
              <p className="text-xs text-muted-foreground">{house.blurb}</p>
            </div>

            {list.length === 0 ? (
              <p className="text-sm text-muted-foreground">No species in this grade's pool occupy this habitat.</p>
            ) : (
              <div className="space-y-2">
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
          </section>
        );
      })}
    </div>
  );
}
