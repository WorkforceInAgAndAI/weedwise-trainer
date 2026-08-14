import { useState, useMemo } from 'react';
import { collegiateWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import { getDifficulty, levelSlice } from '@/lib/difficulty';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

/** Plant parts / life stages shown together, mirroring the 9-12 version. */
const STAGES: Array<{ key: string; label: string }> = [
  { key: 'seedling', label: 'Seedling' },
  { key: 'vegetative', label: 'Leaves' },
  { key: 'flower', label: 'Flower' },
  { key: 'repros', label: 'Seed head' },
  { key: 'seed', label: 'Seed' },
];

export default function NameTheWeed({ onBack }: { onBack: () => void }) {
 const [level, setLevel] = useState(1);
 const d = useMemo(() => getDifficulty(level, 'hs'), [level]);
 const rounds = useMemo(() => {
  const selected = levelSlice(shuffle(weeds), level, d.rounds);
  return selected.map(w => {
   // Distractors must be distinct species AND distinct scientific names, so the
   // photo shown always has exactly one matching answer.
   const wrong: string[] = [];
   for (const x of shuffle(weeds)) {
    if (x.id === w.id || x.scientificName === w.scientificName) continue;
    if (wrong.includes(x.scientificName)) continue;
    wrong.push(x.scientificName);
    if (wrong.length >= Math.max(1, d.options - 1)) break;
   }
   return { weed: w, options: shuffle([w.scientificName, ...wrong]) };
  });
 }, [level, d.rounds, d.options]);

 const [idx, setIdx] = useState(0);
 const [picked, setPicked] = useState<string | null>(null);
 const [submitted, setSubmitted] = useState(false);
 const [score, setScore] = useState(0);

 const current = rounds[idx];
 const done = idx >= rounds.length;

 const submit = (opt: string) => {
  if (submitted) return;
  setPicked(opt);
  setSubmitted(true);
  if (opt === current.weed.scientificName) setScore(s => s + 1);
 };

 const next = () => { setPicked(null); setSubmitted(false); setIdx(i => i + 1); };
 const restart = () => { setPicked(null); setSubmitted(false); setIdx(0); setScore(0); };
 const nextLevel = () => { setLevel(l => l + 1); restart(); };
 const startOver = () => { setLevel(1); restart(); };

 if (done) return <LevelComplete level={level} score={score} total={rounds.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />;

 return (
  <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
   <div className="max-w-lg mx-auto p-4">
    <div className="flex items-center gap-3 mb-4">
     <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
     <h1 className="font-display font-bold text-lg text-foreground">Name the Weed (Scientific)</h1>
     <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
     <span className="text-sm text-muted-foreground">{idx + 1}/{rounds.length}</span>
    </div>
    <div className="mb-4">
     <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-2 text-center">Plant parts / life stages</p>
     <div className="grid grid-cols-3 gap-2">
      {STAGES.map(({ key, label }) => (
       <figure key={key} className="bg-card border border-border rounded-lg p-1.5">
        <div className="h-20 sm:h-24 rounded-md overflow-hidden bg-secondary">
         <WeedImage key={`${current.weed.id}-${key}`} weedId={current.weed.id} stage={key} className="w-full h-full object-cover" />
        </div>
        <figcaption className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mt-1 text-center">{label}</figcaption>
       </figure>
      ))}
     </div>
    </div>
    {d.showHints && <p className="text-sm text-muted-foreground text-center mb-1 italic">{current.weed.traits[0]}</p>}
    {d.showHints && <p className="text-xs text-muted-foreground text-center mb-4">Common: {current.weed.commonName} -- Family: {current.weed.family}</p>}
    {submitted && !d.showHints && (
     <p className="text-xs text-muted-foreground text-center mb-4">{current.weed.commonName} -- {current.weed.family}</p>
    )}
    <div className="grid gap-2 sm:grid-cols-2">
     {current.options.map(opt => {
      let cls = 'border-border bg-card hover:border-primary';
      if (submitted) {
       if (opt === current.weed.scientificName) cls = 'border-green-500 bg-green-500/20 text-green-700';
       else if (opt === picked) cls = 'border-destructive bg-destructive/20 text-destructive';
      }
      return (
       <button key={opt} onClick={() => submit(opt)}
        className={`p-3 rounded-xl border-2 text-left font-medium italic transition-all ${cls}`}>
        {opt}
       </button>
      );
     })}
    </div>
    {submitted && <button onClick={next} className="mt-4 w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Next</button>}
   </div>
  </div>
 );
}
