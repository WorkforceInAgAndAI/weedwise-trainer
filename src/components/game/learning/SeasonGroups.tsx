import WeedImage from '@/components/game/WeedImage';
import type { Weed } from '@/types/game';
import { COOL_SEASON_NAMES, WARM_SEASON_NAMES, matchesSeason } from '@/data/seasonGroups';

interface Props {
  weeds: Weed[];
  onSelectWeed: (w: Weed) => void;
  stage?: string;
}

/** Cool-season vs warm-season species boxes shown in the Life Cycles module (6-8 and up). */
export default function SeasonGroups({ weeds, onSelectWeed, stage = 'flower' }: Props) {
  const groups = [
    {
      key: 'cool',
      label: 'Cool-Season Weeds',
      color: 'bg-sky-500/70',
      desc: 'Germinate in fall or early spring while soils are cool (roughly 40-60 °F) and complete most growth before summer crops close canopy. Many overwinter as low rosettes and compete with the crop very early in the season.',
      list: weeds.filter(w => matchesSeason(w.commonName, COOL_SEASON_NAMES)),
    },
    {
      key: 'warm',
      label: 'Warm-Season Weeds',
      color: 'bg-amber-500/70',
      desc: 'Germinate once soils warm in late spring (above roughly 60 °F) and grow most vigorously through the hottest months. These species dominate mid-summer corn and soybean fields.',
      list: weeds.filter(w => matchesSeason(w.commonName, WARM_SEASON_NAMES)),
    },
  ];

  return (
    <div className="space-y-3">
      <p className="font-display font-bold text-primary text-sm uppercase tracking-wide">Season of Growth</p>
      {groups.map(g => (
        <div key={g.key} className="bg-card border border-border rounded-lg p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className={`inline-block w-3 h-3 rounded ${g.color}`} />
            <h3 className="font-display font-bold text-foreground text-base">
              {g.label} <span className="text-xs text-muted-foreground font-normal">({g.list.length})</span>
            </h3>
          </div>
          <p className="text-sm text-foreground">{g.desc}</p>
          <div className="overflow-x-auto pb-2 -mx-1">
            <div className="flex gap-3 px-1" style={{ minWidth: `${Math.max(g.list.length, 1) * 7}rem` }}>
              {[...g.list].sort((a, b) => a.commonName.localeCompare(b.commonName)).map(w => (
                <div key={w.id} className="text-center shrink-0 w-24">
                  <button
                    onClick={() => onSelectWeed(w)}
                    className="block w-24 h-24 rounded-lg overflow-hidden bg-muted border border-border hover:border-primary"
                  >
                    <WeedImage weedId={w.id} stage={stage} className="w-full h-full" />
                  </button>
                  <button onClick={() => onSelectWeed(w)} className="text-[10px] mt-1 text-foreground hover:text-primary">
                    {w.commonName}
                  </button>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">← Slide to see all {g.list.length} →</p>
        </div>
      ))}
    </div>
  );
}
