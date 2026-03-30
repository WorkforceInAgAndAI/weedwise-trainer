import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { useGameProgress } from '@/contexts/GameProgressContext';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

export default function LiguleLens({ onBack }: { onBack: () => void }) {
 const { addBadge } = useGameProgress();
 // Only include grasses (monocots)
 const grasses = useMemo(() => shuffle(weeds.filter(w => w.plantType === 'Monocot')), []);
 
 const rounds = useMemo(() => {
 const pool = grasses.slice(0, 8);
 return pool.map(w => {
 const wrong = shuffle(grasses.filter(g => g.id !== w.id)).slice(0, 3).map(g => g.commonName);
 return { weed: w, options: shuffle([w.commonName, ...wrong]) };
 });
 }, [grasses]);

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

 const next = () => { setRound(r => r + 1); setSelected(''); setAnswered(false); };
 const restart = () => { setRound(0); setScore(0); setSelected(''); setAnswered(false); };

 if (done) {
 addBadge({ gameId: 'ligule-lens', gameName: 'Ligule Lens', level: 'MS', score, total: rounds.length });
 return (
 <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
 <h2 className="text-2xl font-bold text-foreground mb-2">Great Work!</h2>
 <p className="text-lg text-foreground mb-6">{score}/{rounds.length} correct</p>
 <div className="flex gap-3">
 <button onClick={restart} className="px-6 py-3 rounded-lg bg-secondary text-foreground font-bold">Play Again</button>
 <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
 </div>
 </div>
 );
 }

 return (
 <div className="fixed inset-0 bg-background z-50 flex flex-col">
 <div className="flex items-center gap-3 p-4 border-b border-border">
 <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
 <h1 className="font-bold text-foreground text-lg flex-1">Ligule Lens</h1>
 <span className="text-sm text-muted-foreground">{round + 1}/{rounds.length}</span>
 </div>
 <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
 <p className="text-sm text-muted-foreground mb-2">Zoom in on the ligule — identify the grass!</p>
 <div className="relative w-48 h-48 rounded-full overflow-hidden bg-secondary mb-4 border-4 border-primary">
 <WeedImage weedId={current!.weed.id} stage="ligule" className="w-full h-full object-cover scale-150" />
 <div className="absolute inset-0 rounded-full border-4 border-primary/30" />
 </div>
 <p className="text-xs text-muted-foreground mb-4">{current!.weed.traits.find(t => t.toLowerCase().includes('ligule')) || current!.weed.traits[0]}</p>
 <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
 {current!.options.map(opt => {
 const isCorrect = opt === current!.weed.commonName;
 const bg = !answered ? 'border-border bg-card hover:border-primary' :
 opt === selected ? (isCorrect ? 'border-green-500 bg-green-500/20' : 'border-destructive bg-destructive/20') :
 isCorrect ? 'border-green-500 bg-green-500/20' : 'border-border bg-card';
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
