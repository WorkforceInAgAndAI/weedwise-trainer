import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface PyramidLevel { question: string; options: [string, string]; correctIdx: number; }

function buildPyramid(target: typeof weeds[0]): PyramidLevel[] {
 const isMonocot = target.plantType === 'Monocot';
 const wrongName = shuffle(weeds.filter(w => w.id !== target.id))[0]?.commonName || 'Unknown';
 const nameOptions: [string, string] = Math.random() > 0.5
 ? [target.commonName, wrongName]
 : [wrongName, target.commonName];
 const nameCorrect = nameOptions[0] === target.commonName ? 0 : 1;

 return [
 { question: 'Is this organism a plant or animal?', options: ['Plant', 'Animal'], correctIdx: 0 },
 { question: 'What type of leaf veins does it have?', options: ['Parallel veins (Monocot)', 'Branching veins (Dicot)'], correctIdx: isMonocot ? 0 : 1 },
 { question: 'Does this plant produce flowers?', options: ['Yes — Flowering', 'No — Non-flowering'], correctIdx: 0 },
 { question: 'Which plant family does it belong to?', options: [target.family, shuffle(weeds.filter(w => w.family !== target.family))[0]?.family || 'Poaceae'], correctIdx: 0 },
 { question: 'Identify this weed!', options: nameOptions, correctIdx: nameCorrect },
 ];
}

export default function TaxonomyTower({ onBack }: { onBack: () => void }) {
 const targets = useMemo(() => shuffle(weeds).slice(0, 4), []);
 const [targetIdx, setTargetIdx] = useState(0);
 const [level, setLevel] = useState(0);
 const [wrong, setWrong] = useState(false);
 const [found, setFound] = useState(false);

 const target = targets[targetIdx];
 const pyramid = useMemo(() => buildPyramid(target), [target]);
 const done = targetIdx >= targets.length;

 const choose = (idx: number) => {
 if (wrong) return;
 if (idx === pyramid[level].correctIdx) {
 if (level + 1 >= pyramid.length) { setFound(true); }
 else { setLevel(l => l + 1); }
 } else {
 setWrong(true);
 setTimeout(() => setWrong(false), 1200);
 }
 };

 const nextTarget = () => {
 setTargetIdx(i => i + 1);
 setLevel(0); setFound(false); setWrong(false);
 };

 const restart = () => { setTargetIdx(0); setLevel(0); setFound(false); setWrong(false); };

 if (done) return (
 <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
 <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
 <h2 className="text-2xl font-bold text-foreground mb-2">Pyramid Complete!</h2>
 <p className="text-muted-foreground mb-6">You classified {targets.length} weeds!</p>
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
 <h1 className="font-bold text-foreground text-lg flex-1">Taxonomy Tower</h1>
 <span className="text-sm text-muted-foreground">{targetIdx + 1}/{targets.length}</span>
 </div>
 <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
 <div className="bg-secondary/50 rounded-xl p-3 text-center">
 <p className="text-sm text-muted-foreground">Classify this weed:</p>
 </div>
 <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-primary/30">
 <WeedImage weedId={target.id} stage="vegetative" className="w-full h-full object-cover" />
 </div>

 {/* Pyramid visualization — widest at bottom, narrow at top */}
 <div className="w-full max-w-md flex flex-col items-center gap-2">
 {pyramid.map((_, i) => {
 const displayIdx = pyramid.length - 1 - i;
 const actualLevel = pyramid[displayIdx];
 const actualIdx = displayIdx;
 const widthPercent = 50 + (pyramid.length - 1 - actualIdx) * 10;

 return (
 <div key={actualIdx} className="w-full flex justify-center" style={{ maxWidth: `${widthPercent}%` }}>
 <div className={`w-full rounded-lg p-3 border-2 transition-all ${
 actualIdx < level ? 'bg-primary/10 border-primary/30' :
 actualIdx === level && !found ? 'bg-card border-primary animate-pulse' :
 found ? 'bg-primary/10 border-primary/30' : 'bg-secondary/30 border-border/50 opacity-40'
 }`}>
 {actualIdx <= level || found ? (
 <>
 <p className="text-xs text-muted-foreground mb-2 text-center">{actualLevel.question}</p>
 {actualIdx < level || found ? (
 <p className="text-sm font-bold text-primary text-center">{actualLevel.options[actualLevel.correctIdx]}</p>
 ) : (
 <div className="flex gap-2">
 {actualLevel.options.map((opt, oi) => (
 <button key={oi} onClick={() => choose(oi)}
 className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${wrong ? 'bg-destructive/20 text-destructive' : 'bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground'}`}>
 {opt}
 </button>
 ))}
 </div>
 )}
 </>
 ) : (
 <p className="text-sm text-muted-foreground text-center">Level {actualIdx + 1}</p>
 )}
 </div>
 </div>
 );
 })}
 </div>

 {found && (
 <div className="text-center mt-2">
 <p className="text-lg font-bold text-green-500 mb-3">You found {target.commonName}!</p>
 <button onClick={nextTarget} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next Weed →</button>
 </div>
 )}
 {wrong && <p className="text-destructive font-bold animate-pulse">Try again!</p>}
 </div>
 </div>
 );
}
