import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

export default function NameTheWeed({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
 const rounds = useMemo(() => {
 return shuffle(weeds).slice(0, 10).map(w => {
 const wrongs = shuffle(weeds.filter(x => x.id !== w.id)).slice(0, 3).map(x => x.commonName);
 return { weed: w, options: shuffle([w.commonName, ...wrongs]) };
 });
 }, []);

 const [round, setRound] = useState(0);
 const [selected, setSelected] = useState<string | null>(null);
 const [submitted, setSubmitted] = useState(false);
 const [score, setScore] = useState(0);

 const done = round >= rounds.length;
 const r = !done ? rounds[round] : null;

 const submit = (opt: string) => {
 setSelected(opt);
 setSubmitted(true);
 if (opt === r?.weed.commonName) setScore(s => s + 1);
 };

 const next = () => { setRound(i => i + 1); setSelected(null); setSubmitted(false); };

 const restart = () => { setRound(0); setSelected(null); setSubmitted(false); setScore(0); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

 if (done) return <LevelComplete level={level} score={score} total={rounds?.length ?? 0} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />;

 return (
 <div className="fixed inset-0 bg-background z-50 flex flex-col">
 <div className="flex items-center gap-3 p-4 border-b border-border">
 <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
 <h1 className="font-bold text-foreground text-lg flex-1">Name the Weed</h1>
 <span className="text-sm text-muted-foreground">{round + 1}/{rounds.length}</span>
 <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm font-bold text-primary ml-2">{score} pts</span>
 </div>
 <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
 <div className="w-40 h-40 rounded-xl overflow-hidden border-2 border-border bg-secondary">
 <WeedImage weedId={r!.weed.id} stage="plant" className="w-full h-full object-cover" />
 </div>
 <p className="text-sm text-muted-foreground text-center max-w-xs">{r!.weed.traits[0]}</p>
 <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
 {r!.options.map(opt => (
 <button key={opt} onClick={() => !submitted && submit(opt)}
 className={`py-3 px-4 rounded-lg text-sm font-bold transition-all border-2 ${
 submitted
 ? opt === r!.weed.commonName ? 'bg-green-500/20 border-green-500 text-green-500' : opt === selected ? 'bg-destructive/20 border-destructive text-destructive' : 'border-border text-muted-foreground'
 : 'border-border bg-card text-foreground hover:border-primary'
 }`}>{opt}</button>
 ))}
 </div>
 {submitted && (
 <button onClick={next} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold mt-2">Next →</button>
 )}
 </div>
 </div>
 );
}
