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
 const wrong = shuffle(weeds.filter(x => x.id !== w.id)).slice(0, 3).map(x => x.commonName);
 const options = shuffle([w.commonName, ...wrong]);
 return { weed: w, options };
 });
 }, []);

 const [round, setRound] = useState(0);
 const [selected, setSelected] = useState('');
 const [answered, setAnswered] = useState(false);
 const [score, setScore] = useState(0);

 const done = round >= rounds.length;
 const current = !done ? rounds[round] : null;

 const submit = (opt: string) => {
 if (answered) return;
 setSelected(opt);
 setAnswered(true);
 if (opt === current!.weed.commonName) setScore(s => s + 1);
 };

 const next = () => { setAnswered(false); setSelected(''); setRound(r => r + 1); };
 const restart = () => { setRound(0); setScore(0); setAnswered(false); setSelected(''); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

 if (done) {
 return (
 <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
 <h2 className="text-2xl font-bold text-foreground mb-2">Great Work!</h2>
 <p className="text-lg text-foreground mb-6">{score}/{rounds.length} correct</p>
 <LevelComplete level={level} score={score} total={rounds?.length ?? 0} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
 </div>
 );
 }

 return (
 <div className="fixed inset-0 bg-background z-50 flex flex-col">
 <div className="flex items-center gap-3 p-4 border-b border-border">
 <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
 <h1 className="font-bold text-foreground text-lg flex-1">Name the Weed</h1>
 <span className="text-sm text-muted-foreground">{round + 1}/{rounds.length}</span>
 </div>
 <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
 <div className="w-48 h-48 rounded-xl overflow-hidden bg-secondary mb-4">
 <WeedImage weedId={current!.weed.id} stage="vegetative" className="w-full h-full object-cover" />
 </div>
 <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">{current!.weed.traits[0]}</p>
 <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
 {current!.options.map(opt => {
 const isCorrect = opt === current!.weed.commonName;
 const bg = !answered ? 'bg-card border-border hover:border-primary' :
 opt === selected ? (isCorrect ? 'bg-green-500/20 border-green-500' : 'bg-destructive/20 border-destructive') :
 isCorrect ? 'bg-green-500/20 border-green-500' : 'bg-card border-border';
 return (
 <button key={opt} onClick={() => submit(opt)}
 className={`p-3 rounded-lg border-2 text-sm font-medium text-foreground transition-all ${bg}`}>
 {opt}
 </button>
 );
 })}
 </div>
 {answered && (
 <button onClick={next} className="mt-4 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next</button>
 )}
 </div>
 </div>
 );
}
