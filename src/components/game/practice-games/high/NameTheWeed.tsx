import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

export default function NameTheWeed({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
 const rounds = useMemo(() => {
 const pool = shuffle(weeds).slice(0, 10);
 return pool.map(w => {
 const wrong = shuffle(weeds.filter(x => x.id !== w.id)).slice(0, 3).map(x => x.scientificName);
 return { weed: w, options: shuffle([w.scientificName, ...wrong]) };
 });
 }, []);

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

 if (done) return <LevelComplete level={level} score={score} total={rounds?.length ?? 0} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />;

 return (
 <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
 <div className="max-w-lg mx-auto p-4">
 <div className="flex items-center gap-3 mb-4">
 <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
 <h1 className="font-display font-bold text-lg text-foreground">Name the Weed (Scientific)</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
 <span className="ml-auto text-sm text-muted-foreground">{idx + 1}/{rounds.length}</span>
 </div>
 <div className="flex justify-center mb-4">
 <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-border bg-secondary">
 <WeedImage weedId={current.weed.id} stage="plant" className="w-full h-full object-cover" />
 </div>
 </div>
 <p className="text-sm text-muted-foreground text-center mb-1 italic">{current.weed.traits[0]}</p>
 <p className="text-xs text-muted-foreground text-center mb-4">Common: {current.weed.commonName} · Family: {current.weed.family}</p>
 <div className="grid gap-2">
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
