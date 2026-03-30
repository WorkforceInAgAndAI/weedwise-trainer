import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const REMOVAL = ['Wear gloves and pull carefully', 'Use a herbicide spray', 'Mow the area', 'Dig out the root system'];

export default function SafeVsToxic({ onBack }: { onBack: () => void }) {
 const rounds = useMemo(() => {
 const toxic = weeds.filter(w => w.safetyNote);
 const safe = weeds.filter(w => !w.safetyNote);
 return shuffle(toxic).slice(0, 5).map(t => {
 const others = shuffle(safe).slice(0, 3);
 const all = shuffle([t, ...others]);
 return { toxic: t, options: all };
 });
 }, []);

 const [round, setRound] = useState(0);
 const [selected, setSelected] = useState<string | null>(null);
 const [phase, setPhase] = useState<'identify' | 'remove' | 'done'>('identify');
 const [removalPick, setRemovalPick] = useState<number | null>(null);
 const [score, setScore] = useState(0);

 const finished = round >= rounds.length;
 const current = !finished ? rounds[round] : null;

 const identify = (id: string) => {
 if (phase !== 'identify') return;
 setSelected(id);
 if (id === current!.toxic.id) {
 setScore(s => s + 1);
 setPhase('remove');
 } else {
 setPhase('done');
 }
 };

 const remove = (idx: number) => {
 setRemovalPick(idx);
 if (idx === 0) setScore(s => s + 1);
 setPhase('done');
 };

 const next = () => { setRound(r => r + 1); setSelected(null); setPhase('identify'); setRemovalPick(null); };
 const restart = () => { setRound(0); setScore(0); setSelected(null); setPhase('identify'); setRemovalPick(null); };

 if (finished) {
 return (
 <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
 <h2 className="text-2xl font-bold text-foreground mb-2">Great Work!</h2>
 <p className="text-lg text-foreground mb-6">{score}/{rounds.length * 2} points</p>
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
 <h1 className="font-bold text-foreground text-lg flex-1">Safe vs. Toxic</h1>
 <span className="text-sm text-muted-foreground">{round + 1}/{rounds.length}</span>
 </div>
 <div className="flex-1 overflow-y-auto p-4">
 {phase === 'identify' && (
 <>
 <p className="text-sm text-muted-foreground mb-3 text-center">Find the toxic weed!</p>
 <div className="grid grid-cols-2 gap-3">
 {current!.options.map(w => (
 <button key={w.id} onClick={() => identify(w.id)}
 className="flex flex-col items-center p-3 rounded-xl border-2 border-border bg-card hover:border-primary transition-all">
 <div className="w-24 h-24 rounded-lg overflow-hidden bg-secondary mb-2">
 <WeedImage weedId={w.id} stage="vegetative" className="w-full h-full object-cover" />
 </div>
 <span className="text-xs font-medium text-foreground">{w.commonName}</span>
 </button>
 ))}
 </div>
 </>
 )}
 {phase === 'remove' && (
 <div className="text-center">
 <p className="text-green-500 font-bold mb-2">Correct! Now how should you remove it?</p>
 <p className="text-xs text-muted-foreground mb-4">{current!.toxic.safetyNote}</p>
 <div className="flex flex-col gap-2 max-w-sm mx-auto">
 {REMOVAL.map((r, i) => (
 <button key={i} onClick={() => remove(i)}
 className="p-3 rounded-lg border-2 border-border bg-card text-sm text-foreground font-medium hover:border-primary transition-all">
 {r}
 </button>
 ))}
 </div>
 </div>
 )}
 {phase === 'done' && (
 <div className="text-center mt-8">
 <p className={`font-bold text-lg mb-2 ${selected === current!.toxic.id ? 'text-green-500' : 'text-destructive'}`}>
 {selected === current!.toxic.id ? (removalPick === 0 ? 'Perfect!' : 'Good find! Gloves are the safest option.') : `The toxic weed was ${current!.toxic.commonName}`}
 </p>
 {current!.toxic.safetyNote && <p className="text-xs text-muted-foreground mb-4 max-w-sm mx-auto">{current!.toxic.safetyNote}</p>}
 <button onClick={next} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next</button>
 </div>
 )}
 </div>
 </div>
 );
}
