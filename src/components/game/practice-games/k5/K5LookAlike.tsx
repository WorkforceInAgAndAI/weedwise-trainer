import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

export default function K5LookAlike({ onBack }: { onBack: () => void }) {
 const pairs = useMemo(() => {
 const valid = weeds.filter(w => w.lookAlike && weeds.find(x => x.id === w.lookAlike.id));
 const used = new Set<string>();
 const result: { weed: typeof weeds[0]; alike: typeof weeds[0]; difference: string }[] = [];
 for (const w of shuffle(valid)) {
 if (used.has(w.id)) continue;
 const alike = weeds.find(x => x.id === w.lookAlike.id);
 if (!alike || used.has(alike.id)) continue;
 used.add(w.id); used.add(alike.id);
 result.push({ weed: w, alike, difference: w.lookAlike.difference });
 if (result.length >= 5) break;
 }
 return result;
 }, []);

 const [round, setRound] = useState(0);
 const [selected, setSelected] = useState<string | null>(null);
 const [submitted, setSubmitted] = useState(false);
 const [score, setScore] = useState(0);

 const done = round >= pairs.length;
 const pair = !done ? pairs[round] : null;
 const targetIsFirst = useMemo(() => Math.random() > 0.5, [round]);
 const target = pair ? pair.weed : null;
 const options = pair ? (targetIsFirst ? [pair.weed, pair.alike] : [pair.alike, pair.weed]) : [];

 const restart = () => { setRound(0); setSelected(null); setSubmitted(false); setScore(0); };

 const submit = () => {
 if (!selected || !target) return;
 setSubmitted(true);
 if (selected === target.id) setScore(s => s + 1);
 };

 const next = () => { setRound(r => r + 1); setSelected(null); setSubmitted(false); };

 if (done) return (
 <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
 <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
 <div className="text-5xl mb-4"></div>
 <h2 className="text-2xl font-bold text-foreground mb-2">Challenge Complete!</h2>
 <p className="text-muted-foreground mb-6">Score: {score} / {pairs.length}</p>
 <div className="flex gap-3 justify-center">
 <button onClick={restart} className="px-6 py-3 rounded-lg bg-secondary text-foreground font-bold">Play Again</button>
 <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
 </div>
 </div>
 </div>
 );

 return (
 <div className="fixed inset-0 bg-background z-50 flex flex-col">
 <div className="flex items-center gap-3 p-4 border-b border-border">
 <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
 <h1 className="font-bold text-foreground text-lg flex-1">Look-Alike Challenge</h1>
 <span className="text-sm text-muted-foreground">{round + 1}/{pairs.length}</span>
 </div>
 <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
 <p className="text-foreground font-bold text-lg">Which one is <span className="text-primary">{target?.commonName}</span>?</p>
 <div className="flex gap-4">
 {options.map(w => (
 <button key={w.id} onClick={() => !submitted && setSelected(w.id)}
 className={`w-36 sm:w-44 rounded-xl overflow-hidden border-3 transition-all ${
 selected === w.id ? 'border-primary scale-105 shadow-lg' : 'border-border'
 } ${submitted && w.id === target?.id ? 'ring-2 ring-green-500' : ''} ${submitted && selected === w.id && w.id !== target?.id ? 'ring-2 ring-destructive' : ''}`}>
 <div className="aspect-square bg-secondary">
 <WeedImage weedId={w.id} stage="vegetative" className="w-full h-full object-cover" />
 </div>
 {/* Only show name after submission */}
 {submitted && (
 <p className={`text-xs font-medium p-2 text-center ${w.id === target?.id ? 'text-green-500 font-bold' : 'text-foreground'}`}>{w.commonName}</p>
 )}
 </button>
 ))}
 </div>
 {!submitted ? (
 <button onClick={submit} disabled={!selected}
 className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-50">Confirm</button>
 ) : (
 <div className="text-center max-w-sm">
 <p className={`text-lg font-bold mb-2 ${selected === target?.id ? 'text-green-500' : 'text-destructive'}`}>
 {selected === target?.id ? 'Correct!' : 'Not quite!'}
 </p>
 <p className="text-sm text-muted-foreground mb-3">Key difference: {pair?.difference}</p>
 <button onClick={next} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next →</button>
 </div>
 )}
 </div>
 </div>
 );
}
