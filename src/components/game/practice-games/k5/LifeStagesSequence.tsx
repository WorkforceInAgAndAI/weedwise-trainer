import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

// Removed 'whole' (mature plant) per requirements
const STAGES = ['seedling', 'vegetative', 'flower'];
const STAGE_LABELS: Record<string, string> = { seedling: 'Seedling', vegetative: 'Vegetative', flower: 'Reproductive' };

export default function LifeStagesSequence({ onBack }: { onBack: () => void }) {
 const targets = useMemo(() => shuffle(weeds).slice(0, 4), []);
 const [targetIdx, setTargetIdx] = useState(0);
 const [order, setOrder] = useState<string[]>(() => shuffle([...STAGES]));
 const [checked, setChecked] = useState(false);
 const [score, setScore] = useState(0);

 const target = targets[targetIdx];
 const done = targetIdx >= targets.length;

 const restart = () => { setTargetIdx(0); setOrder(shuffle([...STAGES])); setChecked(false); setScore(0); };

 const swap = (i: number, j: number) => {
 if (checked) return;
 const next = [...order];
 [next[i], next[j]] = [next[j], next[i]];
 setOrder(next);
 };

 const check = () => {
 setChecked(true);
 const correct = order.every((s, i) => s === STAGES[i]);
 if (correct) setScore(sc => sc + 1);
 };

 const next = () => {
 setTargetIdx(i => i + 1);
 setOrder(shuffle([...STAGES]));
 setChecked(false);
 };

 const isCorrect = checked && order.every((s, i) => s === STAGES[i]);

 if (done) return (
 <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
 <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
 <h2 className="text-2xl font-display font-bold text-foreground mb-2">All Done!</h2>
 <p className="text-muted-foreground mb-6">You got {score} / {targets.length} correct!</p>
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
 <h1 className="font-display font-bold text-foreground text-lg flex-1">Life Stages Sequence</h1>
 <span className="text-sm text-muted-foreground">{targetIdx + 1}/{targets.length}</span>
 </div>
 <div className="flex-1 flex flex-col items-center justify-center p-4 gap-6">
 <p className="text-foreground font-bold text-lg">Put <span className="text-primary">{target.commonName}</span> in order</p>
 <div className="flex gap-4 flex-wrap justify-center">
 {order.map((stage, i) => (
 <div key={stage} className={`flex flex-col items-center gap-2 ${checked ? (stage === STAGES[i] ? '' : 'opacity-50') : ''}`}>
 <div className="flex gap-1 mb-1">
 {i > 0 && !checked && (
 <button onClick={() => swap(i, i - 1)} className="text-sm px-3 py-1 rounded bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground">←</button>
 )}
 {i < order.length - 1 && !checked && (
 <button onClick={() => swap(i, i + 1)} className="text-sm px-3 py-1 rounded bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground">→</button>
 )}
 </div>
 <div className={`w-28 h-28 sm:w-36 sm:h-36 rounded-xl overflow-hidden border-3 ${checked ? (stage === STAGES[i] ? 'border-success' : 'border-destructive') : 'border-border'}`}>
 <WeedImage weedId={target.id} stage={stage} className="w-full h-full object-cover" />
 </div>
 {/* No captions — images only */}
 <span className="text-sm font-bold text-foreground">{i + 1}</span>
 </div>
 ))}
 </div>
 {!checked ? (
 <button onClick={check} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold mt-2">Check Order</button>
 ) : (
 <div className="text-center">
 <p className={`text-lg font-bold mb-3 ${isCorrect ? 'text-success' : 'text-destructive'}`}>
 {isCorrect ? 'Perfect order!' : `Not quite — correct: ${STAGES.map(s => STAGE_LABELS[s]).join(' → ')}`}
 </p>
 <button onClick={next} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next →</button>
 </div>
 )}
 </div>
 </div>
 );
}
