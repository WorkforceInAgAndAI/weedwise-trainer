import { useState } from 'react';
import { ZoomIn, ZoomOut, ChevronRight, ChevronDown, X, Maximize2 } from 'lucide-react';
import WeedImage from '@/components/game/WeedImage';
import type { Weed } from '@/types/game';

interface Props {
  weeds: Weed[];
  onSelectWeed: (w: Weed) => void;
}

const pyramidFor = (w: Weed) => [
  { level: 'Kingdom', value: 'Plantae', desc: 'All plants' },
  { level: 'Division', value: w.plantType === 'Non-flowering' ? 'Pteridophyta / non-flowering' : 'Magnoliophyta', desc: w.plantType === 'Non-flowering' ? 'Spore-producing plants' : 'Flowering plants (Angiosperms)' },
  { level: 'Class', value: w.plantType === 'Monocot' ? 'Monocotyledon' : w.plantType === 'Dicot' ? 'Dicotyledon' : 'Non-flowering', desc: w.plantType === 'Monocot' ? 'One seed leaf, parallel veins' : w.plantType === 'Dicot' ? 'Two seed leaves, branching veins' : 'No true flowers or seeds' },
  { level: 'Family', value: w.family, desc: 'Shared flower / leaf structure' },
  { level: 'Genus', value: w.scientificName.split(' ')[0], desc: 'Closely related species group' },
  { level: 'Species', value: w.scientificName, desc: `Unique organism: ${w.commonName}` },
];

function PyramidCard({ weed, onClose, onSelectWeed }: { weed: Weed; onClose: () => void; onSelectWeed: (w: Weed) => void }) {
  const widths = ['100%', '88%', '76%', '64%', '52%', '40%'];
  return (
    <div className="fixed inset-0 z-[60] bg-background/90 backdrop-blur-sm overflow-y-auto p-4" onClick={onClose}>
      <div className="max-w-lg mx-auto bg-card border border-border rounded-xl p-5 space-y-3 my-8" onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-border flex-shrink-0">
            <WeedImage weedId={weed.id} stage="flower" className="w-full h-full" />
          </div>
          <div className="flex-1">
            <p className="font-display font-bold text-foreground">{weed.commonName}</p>
            <p className="text-xs italic text-primary">{weed.scientificName}</p>
            <button onClick={() => { onClose(); onSelectWeed(weed); }} className="text-xs text-primary underline mt-1">Open full profile</button>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-foreground"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex flex-col items-center gap-1">
          {pyramidFor(weed).map((t, i) => (
            <div key={t.level} style={{ width: widths[i] }} className="bg-primary/10 border border-primary/30 rounded-lg p-2 text-center">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">{t.level}</p>
              <p className="text-sm font-bold text-foreground">{t.value}</p>
              <p className="text-[10px] text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TaxonomyExplorer({ weeds, onSelectWeed }: Props) {
  const [zoom, setZoom] = useState(1);
  const [open, setOpen] = useState<Record<string, boolean>>({ Plantae: true });
  const [pyramidWeed, setPyramidWeed] = useState<Weed | null>(null);

  const toggle = (k: string) => setOpen(o => ({ ...o, [k]: !o[k] }));

  const divisions: { key: string; label: string; sub: string; classes: { key: string; label: string; sub: string; members: Weed[] }[] }[] = [
    {
      key: 'div-flowering',
      label: 'Division: Magnoliophyta (Flowering Plants)',
      sub: 'Produce true flowers and seeds enclosed in fruit',
      classes: [
        { key: 'Dicotyledon', label: 'Class: Dicotyledon', sub: 'Two seed leaves · branching veins', members: weeds.filter(w => w.plantType === 'Dicot') },
        { key: 'Monocotyledon', label: 'Class: Monocotyledon', sub: 'One seed leaf · parallel veins', members: weeds.filter(w => w.plantType === 'Monocot') },
      ].filter(c => c.members.length > 0),
    },
    {
      key: 'div-nonflowering',
      label: 'Division: Non-flowering Plants',
      sub: 'Spore producers — no true flowers or seeds',
      classes: [
        { key: 'Non-flowering', label: 'Class: Non-flowering', sub: 'Ferns and allies', members: weeds.filter(w => w.plantType === 'Non-flowering') },
      ].filter(c => c.members.length > 0),
    },
  ].filter(d => d.classes.length > 0);

  const familiesOf = (members: Weed[]) => {
    const m = new Map<string, Weed[]>();
    members.forEach(w => m.set(w.family, [...(m.get(w.family) || []), w]));
    return [...m.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([fam, list]) => [fam, [...list].sort((a, b) => a.commonName.localeCompare(b.commonName))] as [string, Weed[]]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <p className="font-display font-bold text-foreground text-sm flex-1">Interactive Taxonomy Map</p>
        <button onClick={() => setZoom(z => Math.max(0.6, +(z - 0.1).toFixed(2)))} aria-label="Zoom out" className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground"><ZoomOut className="w-4 h-4" /></button>
        <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.min(2, +(z + 0.1).toFixed(2)))} aria-label="Zoom in" className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground"><ZoomIn className="w-4 h-4" /></button>
        <button onClick={() => setZoom(1)} aria-label="Reset zoom" className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-foreground"><Maximize2 className="w-4 h-4" /></button>
      </div>
      <p className="text-xs text-muted-foreground">
        Click any box to expand it. Work down the levels: Kingdom → Division (flowering or non-flowering) → Class → Family → Species.
        Dark boxes are groupings; green boxes are individual species — tap a species to see its full taxonomy pyramid.
      </p>

      <div className="overflow-auto rounded-lg border border-border bg-muted/20 p-3 max-h-[70vh]">
        <div style={{ transform: `scale(${zoom})`, transformOrigin: '0 0', width: `${100 / zoom}%` }}>
          {/* Kingdom */}
          <div className="rounded-lg border-2 border-foreground/70 bg-foreground/90 p-2">
            <button onClick={() => toggle('Plantae')} className="w-full flex items-center gap-2 text-left">
              {open.Plantae ? <ChevronDown className="w-4 h-4 text-background" /> : <ChevronRight className="w-4 h-4 text-background" />}
              <span className="font-display font-bold text-background text-sm">Kingdom Plantae</span>
              <span className="ml-auto text-[10px] text-background/70">{weeds.length} species</span>
            </button>
            {open.Plantae && (
              <div className="mt-2 space-y-2 pl-3 border-l-2 border-background/40">
                {divisions.map(d => {
                  const dCount = d.classes.reduce((n, c) => n + c.members.length, 0);
                  return (
                    <div key={d.key} className="rounded-lg border-2 border-foreground/60 bg-background p-2">
                      <button onClick={() => toggle(d.key)} className="w-full flex items-center gap-2 text-left">
                        {open[d.key] ? <ChevronDown className="w-4 h-4 text-foreground" /> : <ChevronRight className="w-4 h-4 text-foreground" />}
                        <span className="font-bold text-foreground text-sm">{d.label}</span>
                        <span className="ml-auto text-[10px] text-muted-foreground">{dCount} species</span>
                      </button>
                      <p className="text-[10px] text-muted-foreground pl-6">{d.sub}</p>
                      {open[d.key] && (
                        <div className="mt-2 space-y-2 pl-3 border-l-2 border-foreground/20">
                          {d.classes.map(c => (
                            <div key={c.key} className="rounded-lg border-2 border-foreground/50 bg-muted/40 p-2">
                              <button onClick={() => toggle(c.key)} className="w-full flex items-center gap-2 text-left">
                                {open[c.key] ? <ChevronDown className="w-4 h-4 text-foreground" /> : <ChevronRight className="w-4 h-4 text-foreground" />}
                                <span className="font-bold text-foreground text-sm">{c.label}</span>
                                <span className="ml-auto text-[10px] text-muted-foreground">{c.members.length} species</span>
                              </button>
                              <p className="text-[10px] text-muted-foreground pl-6">{c.sub}</p>
                              {open[c.key] && (
                                <div className="mt-2 space-y-2 max-h-[50vh] overflow-y-auto pr-1 pl-3 border-l-2 border-foreground/20">
                                  {familiesOf(c.members).map(([fam, list]) => {
                                    const key = `${c.key}:${fam}`;
                                    return (
                                      <div key={key} className="rounded-lg border-2 border-foreground/40 bg-secondary/60 p-2">
                                        <button onClick={() => toggle(key)} className="w-full flex items-center gap-2 text-left">
                                          {open[key] ? <ChevronDown className="w-4 h-4 text-foreground" /> : <ChevronRight className="w-4 h-4 text-foreground" />}
                                          <span className="font-bold text-foreground text-xs">Family: {fam}</span>
                                          <span className="ml-auto text-[10px] text-muted-foreground">{list.length}</span>
                                        </button>
                                        {open[key] && (
                                          <div className="mt-2 space-y-1.5 max-h-72 overflow-y-auto pr-1 pl-3 border-l-2 border-primary/30">
                                            {list.map(w => (
                                              <button
                                                key={w.id}
                                                onClick={() => setPyramidWeed(w)}
                                                className="w-full flex items-center gap-2 rounded-lg border-2 border-primary/60 bg-primary/10 p-1.5 text-left hover:border-primary transition-colors"
                                              >
                                                <div className="w-12 h-12 rounded overflow-hidden bg-muted flex-shrink-0">
                                                  <WeedImage weedId={w.id} stage="flower" className="w-full h-full" />
                                                </div>
                                                <div className="min-w-0">
                                                  <p className="text-[11px] font-bold text-foreground leading-tight truncate">{w.commonName}</p>
                                                  <p className="text-[10px] italic text-muted-foreground leading-tight truncate">{w.scientificName}</p>
                                                </div>
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {pyramidWeed && <PyramidCard weed={pyramidWeed} onClose={() => setPyramidWeed(null)} onSelectWeed={onSelectWeed} />}
    </div>
  );
}
