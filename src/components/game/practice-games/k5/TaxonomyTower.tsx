import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface PyramidLevel { question: string; options: [string, string]; correctIdx: number; }

function buildPyramid(target: typeof weeds[0]): PyramidLevel[] {
 const isMonocot = target.plantType === 'Monocot';
 return [
  { question: 'Is this organism a plant or animal?', options: ['Plant', 'Animal'], correctIdx: 0 },
  { question: 'What type of leaf veins does it have?', options: ['Parallel veins (Monocot)', 'Branching veins (Dicot)'], correctIdx: isMonocot ? 0 : 1 },
  { question: 'Does this plant produce flowers?', options: ['Yes — Flowering', 'No — Non-flowering'], correctIdx: 0 },
 ];
}

/** Pick 8 weeds with a balanced mix of monocots and dicots */
function pickTargets(): typeof weeds {
 const monocots = shuffle(weeds.filter(w => w.plantType === 'Monocot'));
 const dicots = shuffle(weeds.filter(w => w.plantType === 'Dicot'));
 const picked: typeof weeds = [];
 // 4 monocots + 4 dicots (or as many as available)
 picked.push(...monocots.slice(0, 4));
 picked.push(...dicots.slice(0, 4));
 // Fill remainder if one category was short
 while (picked.length < 8) {
  const remaining = shuffle(weeds.filter(w => !picked.some(p => p.id === w.id)));
  if (remaining.length === 0) break;
  picked.push(remaining[0]);
 }
 return shuffle(picked);
}

export default function TaxonomyTower({ onBack }: { onBack: () => void }) {
 const { addBadge } = useGameProgress();
 const targets = useMemo(() => pickTargets(), []);
 const [targetIdx, setTargetIdx] = useState(0);
 const [level, setLevel] = useState(0);
 const [wrong, setWrong] = useState(false);
 const [found, setFound] = useState(false);
 const [score, setScore] = useState(0);

 const done = targetIdx >= targets.length;
 const target = targets[done ? 0 : targetIdx];
 const pyramid = useMemo(() => buildPyramid(target), [target]);

 const choose = (idx: number) => {
  if (wrong) return;
  if (idx === pyramid[level].correctIdx) {
   if (level + 1 >= pyramid.length) {
    setFound(true);
    setScore(s => s + 1);
   } else {
    setLevel(l => l + 1);
   }
  } else {
   setWrong(true);
   setTimeout(() => setWrong(false), 1200);
  }
 };

 const nextTarget = () => {
  setTargetIdx(i => i + 1);
  setLevel(0); setFound(false); setWrong(false);
 };

 const restart = () => { setTargetIdx(0); setLevel(0); setFound(false); setWrong(false); setScore(0); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

 if (done) {
  addBadge({ gameId: 'k5-taxonomy', gameName: 'Taxonomy Tower', level: 'K-5', score, total: targets.length });
  return (
   <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
    <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
     <h2 className="text-2xl font-display font-bold text-foreground mb-2">Pyramid Complete!</h2>
     <p className="text-muted-foreground mb-6">Score: {score} / {targets.length}</p>
     <div className="flex gap-3 justify-center">
      <button onClick={nextLevel} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next Level</button>
      <button onClick={startOver} className="px-6 py-3 rounded-lg bg-secondary text-foreground font-bold">Start Over</button>
      <button onClick={onBack} className="px-6 py-3 rounded-lg border border-border text-foreground font-bold">Back to Games</button>
     </div>
    </div>
   </div>
  );
 }

 return (
  <div className="fixed inset-0 bg-background z-50 flex flex-col">
   <div className="flex items-center gap-3 p-4 border-b border-border">
    <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
    <h1 className="font-display font-bold text-foreground text-lg flex-1">Taxonomy Tower</h1>
    <span className="text-sm text-muted-foreground">{targetIdx + 1}/{targets.length}</span>
   </div>
   <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
    <div className="bg-secondary/50 rounded-xl p-3 text-center">
     <p className="text-sm text-muted-foreground">Classify this weed:</p>
     <p className="font-display font-bold text-foreground text-lg">{target.commonName}</p>
    </div>
    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/30">
     <WeedImage weedId={target.id} stage="plant" className="w-full h-full object-cover" />
    </div>

    {/* Pyramid visualization — widest at bottom, narrow at top */}
    <div className="w-full max-w-md flex flex-col items-center gap-2">
     {pyramid.map((_, i) => {
      const displayIdx = pyramid.length - 1 - i;
      const actualLevel = pyramid[displayIdx];
      const actualIdx = displayIdx;
      const widthPercent = 60 + (pyramid.length - 1 - actualIdx) * 15;

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
