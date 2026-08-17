import { useMemo, useState } from 'react';
import WeedImage from '@/components/game/WeedImage';
import type { Weed } from '@/types/game';
import { getSeedFact } from '@/data/seedFacts';

interface Props {
  weeds: Weed[];
  onSelectWeed: (w: Weed) => void;
  /** 'list' = always-visible detail panels (6-8, 9-12). 'flip' = click to flip (collegiate). */
  mode?: 'list' | 'flip';
  seedDescription?: (w: Weed) => string;
}

function FlipPanel({ weed, description, onSelectWeed }: { weed: Weed; description: string; onSelectWeed: (w: Weed) => void }) {
  const [flipped, setFlipped] = useState(false);
  const fact = getSeedFact(weed.commonName, weed.family, weed.plantType);
  return (
    <button
      onClick={() => setFlipped(f => !f)}
      className="relative w-full h-64 [perspective:1000px] text-left"
      aria-label={`Flip ${weed.commonName} seed panel`}
    >
      <div
        className="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d]"
        style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        <div className="absolute inset-0 [backface-visibility:hidden] bg-card border border-border rounded-xl p-3 flex flex-col">
          <div className="flex-1 rounded-lg overflow-hidden bg-muted">
            <WeedImage weedId={weed.id} stage="seed" className="w-full h-full object-cover" />
          </div>
          <p className="font-display font-bold text-sm text-foreground text-center mt-2">{weed.commonName}</p>
          <p className="text-[10px] text-muted-foreground text-center">Click to flip</p>
        </div>
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-card border border-primary/40 rounded-xl p-3 overflow-y-auto space-y-2">
          <p className="text-sm font-bold text-primary italic">{weed.scientificName}</p>
          <p className="text-xs text-foreground">{description}</p>
          <p className="text-[11px] text-foreground"><span className="font-bold">Seed output:</span> {fact.production}</p>
          <p className="text-[11px] text-foreground"><span className="font-bold">Dispersal:</span> {fact.dispersal}</p>
          <span
            role="link"
            tabIndex={0}
            onClick={e => { e.stopPropagation(); onSelectWeed(weed); }}
            onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); onSelectWeed(weed); } }}
            className="text-[11px] text-primary underline cursor-pointer"
          >
            Open full profile
          </span>
        </div>
      </div>
    </button>
  );
}

/**
 * Seed reference panels grouped by plant family. Replaces the old seed
 * flashcard deck in the Seeds & Seed Banks modules.
 */
export default function SeedPanels({ weeds, onSelectWeed, mode = 'list', seedDescription }: Props) {
  const [query, setQuery] = useState('');

  const families = useMemo(() => {
    const filtered = weeds.filter(w => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return w.commonName.toLowerCase().includes(q) || w.scientificName.toLowerCase().includes(q) || w.family.toLowerCase().includes(q);
    });
    const map = new Map<string, Weed[]>();
    filtered.forEach(w => {
      if (!map.has(w.family)) map.set(w.family, []);
      map.get(w.family)!.push(w);
    });
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([family, list]) => [family, list.sort((a, b) => a.commonName.localeCompare(b.commonName))] as const);
  }, [weeds, query]);

  return (
    <div className="space-y-4">
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search a species or family..."
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
      />
      {families.map(([family, list]) => (
        <div key={family} className="space-y-2">
          <p className="font-display font-bold text-primary text-sm uppercase tracking-wide">
            {family} <span className="text-muted-foreground font-normal normal-case">({list.length})</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {list.map(w => {
              const description = seedDescription?.(w) ?? '';
              const fact = getSeedFact(w.commonName, w.family, w.plantType);
              return mode === 'flip' ? (
                <FlipPanel key={w.id} weed={w} description={description} onSelectWeed={onSelectWeed} />
              ) : (
                <div key={w.id} className="bg-card border border-border rounded-xl p-3 space-y-2">
                  <button
                    onClick={() => onSelectWeed(w)}
                    className="block w-full aspect-square rounded-lg overflow-hidden bg-muted hover:opacity-90"
                    aria-label={`Open ${w.commonName} profile`}
                  >
                    <WeedImage weedId={w.id} stage="seed" className="w-full h-full object-cover" />
                  </button>
                  <div>
                    <p className="font-display font-bold text-xs text-foreground">{w.commonName}</p>
                    <p className="text-[10px] italic text-primary">{w.scientificName}</p>
                  </div>
                  {description && <p className="text-[10px] text-muted-foreground">{description}</p>}
                  <p className="text-[10px] text-foreground"><span className="font-bold">Seed output:</span> {fact.production}</p>
                  <p className="text-[10px] text-foreground"><span className="font-bold">Dispersal:</span> {fact.dispersal}</p>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {families.length === 0 && <p className="text-sm text-muted-foreground">No species match that search.</p>}
    </div>
  );
}
