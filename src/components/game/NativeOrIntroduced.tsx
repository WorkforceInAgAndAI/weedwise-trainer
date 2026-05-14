import { useState, useMemo, useEffect } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from './WeedImage';

interface Props {
 onComplete: (results: Array<{ weedId: string; correct: boolean }>) => void;
 onNext: () => void;
}

type Region = 'Native' | 'Europe' | 'Asia' | 'Africa' | 'Other Introduced';

const REGIONS: { id: Region; label: string; sub: string; tone: string }[] = [
  { id: 'Native',           label: 'Native',           sub: 'North America',     tone: 'bg-green-900/15 border-green-600/50' },
  { id: 'Europe',           label: 'Europe',           sub: 'Introduced',        tone: 'bg-amber-900/15 border-amber-600/50' },
  { id: 'Asia',             label: 'Asia',             sub: 'Introduced',        tone: 'bg-rose-900/15 border-rose-600/50' },
  { id: 'Africa',           label: 'Africa',           sub: 'Introduced',        tone: 'bg-orange-900/15 border-orange-600/50' },
  { id: 'Other Introduced', label: 'Other',            sub: 'S. America / Aus.', tone: 'bg-sky-900/15 border-sky-600/50' },
];

function getRegion(w: typeof weeds[0]): Region {
  if (w.origin === 'Native') return 'Native';
  const t = `${w.habitat} ${w.commonName} ${w.scientificName}`.toLowerCase();
  if (/europ|mediter/.test(t)) return 'Europe';
  if (/asia|china|japan|india|siberia/.test(t)) return 'Asia';
  if (/africa/.test(t)) return 'Africa';
  if (/south america|brazil|austral/.test(t)) return 'Other Introduced';
  // Fallback for introduced with no continent hint — Europe is the most common origin
  return 'Europe';
}

export default function NativeOrIntroduced({ onComplete, onNext }: Props) {
 const queue = useMemo(() => {
 return [...weeds].sort(() => Math.random() - 0.5).slice(0, 12).map(w => ({
   weedId: w.id, name: w.commonName, correct: getRegion(w),
 }));
 }, []);

 const [placements, setPlacements] = useState<Record<string, Region>>({});
 const [selected, setSelected] = useState<string | null>(null);
 const [checked, setChecked] = useState(false);
 const [bouncedIds, setBouncedIds] = useState<string[]>([]);
 const [retriedOnce, setRetriedOnce] = useState(false);

 const unplaced = queue.filter(q => !placements[q.weedId]);
 const allPlaced = unplaced.length === 0;

 const handleZoneDrop = (zone: Region) => {
 if (checked || !selected) return;
 setPlacements(prev => ({ ...prev, [selected]: zone }));
 setSelected(null);
 };

 const handleRemove = (weedId: string) => {
 if (checked) return;
 setPlacements(prev => {
 const n = { ...prev };
 delete n[weedId];
 return n;
 });
 };

 const handleCheck = () => {
 const wrong = queue.filter(q => placements[q.weedId] !== q.correct).map(q => q.weedId);
 setChecked(true);
 if (wrong.length > 0 && !retriedOnce) {
 // Bounce wrong ones back for retry — do not finalize yet
 setBouncedIds(wrong);
 } else {
 // Finalize on second pass (or first if all correct)
 onComplete(queue.map(q => ({
 weedId: q.weedId,
 correct: placements[q.weedId] === q.correct,
 })));
 }
 };

 // After bounce animation, remove wrong placements so user can re-do them
 useEffect(() => {
 if (bouncedIds.length === 0) return;
 const t = setTimeout(() => {
 setPlacements(p => { const n = { ...p }; bouncedIds.forEach(id => delete n[id]); return n; });
 setChecked(false);
 setRetriedOnce(true);
 setBouncedIds([]);
 }, 800);
 return () => clearTimeout(t);
 }, [bouncedIds]);

 const correctCount = checked ? queue.filter(q => placements[q.weedId] === q.correct).length : 0;

 return (
 <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4 animate-scale-in">
 <div>
  <h2 className="font-display font-bold text-lg text-foreground"> Where did this weed come from?</h2>
  <p className="text-sm text-muted-foreground">Tap a weed, then drop it into the correct region of origin.</p>
 </div>

  {/* Region drop zones */}
  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
    {REGIONS.map(region => {
      const inZone = queue.filter(q => placements[q.weedId] === region.id);
      return (
        <button
          key={region.id}
          onClick={() => handleZoneDrop(region.id)}
          className={`p-2 rounded-xl border-2 text-left transition-all min-h-[130px] ${region.tone} ${
            selected && !checked ? 'cursor-pointer ring-1 ring-primary/40' : 'cursor-default'
          }`}
        >
          <span className="text-xs font-bold text-foreground block">{region.label}</span>
          <span className="text-[9px] text-muted-foreground">{region.sub}</span>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {inZone.map(w => {
              const bouncing = bouncedIds.includes(w.weedId);
              return (
                <span
                  key={w.weedId}
                  onClick={e => { e.stopPropagation(); handleRemove(w.weedId); }}
                  className={`text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition-all duration-500 ${bouncing ? 'opacity-0 -translate-y-6 scale-50' : ''} ${
                    checked
                      ? w.correct === region.id ? 'bg-accent/30 text-accent' : 'bg-destructive/30 text-destructive line-through'
                      : 'bg-foreground/10 text-foreground hover:bg-destructive/20'
                  }`}
                >
                  {w.name}
                </span>
              );
            })}
          </div>
        </button>
      );
    })}
  </div>

 {/* Weed cards to drag */}
 {unplaced.length > 0 && (
 <div className="grid grid-cols-4 gap-2">
 {retriedOnce && (
 <p className="col-span-4 text-xs text-amber-600 font-semibold text-center">
 Try again — re-place the {unplaced.length} weed{unplaced.length === 1 ? '' : 's'} you missed.
 </p>
 )}
 {unplaced.map(item => (
 <button
 key={item.weedId}
 onClick={() => setSelected(selected === item.weedId ? null : item.weedId)}
 className={`p-2 rounded-lg border-2 transition-all text-center ${
 selected === item.weedId
 ? 'border-primary bg-primary/10 scale-105'
 : 'border-border bg-secondary/50 hover:border-primary/50'
 }`}
 >
 <div className="w-full h-14 mb-1 overflow-hidden rounded">
 <WeedImage weedId={item.weedId} stage="whole" className="w-full h-full" />
 </div>
 <span className="text-[10px] font-semibold text-foreground leading-tight block">{item.name}</span>
 </button>
 ))}
 </div>
 )}

 {!checked && allPlaced && (
 <button onClick={handleCheck} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
 Check Answers
 </button>
 )}

 {checked && (
 <div className="rounded-lg p-4 space-y-3 animate-scale-in border border-border bg-muted/30">
 <div className="text-lg font-bold text-foreground">{correctCount}/{queue.length} Correct!</div>
 {queue.filter(q => placements[q.weedId] !== q.correct).map(q => (
 <p key={q.weedId} className="text-sm text-muted-foreground">
 <span className="text-foreground font-semibold">{q.name}</span> → actually <span className="font-bold">{q.correct}</span>
 </p>
 ))}
 <button onClick={onNext} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">NEXT →</button>
 </div>
 )}
 </div>
 );
}
