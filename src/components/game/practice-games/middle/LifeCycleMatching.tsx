import { useState, useMemo, useEffect } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const CYCLES = ['Annual', 'Biennial', 'Perennial'] as const;

function getCycleType(w: typeof weeds[0]): string {
 const lc = w.lifeCycle.toLowerCase();
 if (lc.includes('biennial')) return 'Biennial';
 if (lc.includes('perennial')) return 'Perennial';
 return 'Annual';
}

function buildRound(level: number, roundNum: number) {
 const byType: Record<string, typeof weeds[0][]> = { Annual: [], Biennial: [], Perennial: [] };
 weeds.forEach(w => byType[getCycleType(w)].push(w));
 const seed = level * 100 + roundNum;
 const picks: { weed: typeof weeds[0]; correct: string }[] = [];
 for (const type of CYCLES) {
  const pool = shuffle(byType[type]);
  const offset = ((seed + CYCLES.indexOf(type)) * 3) % pool.length;
  for (let i = 0; i < Math.min(3, pool.length); i++) {
   picks.push({ weed: pool[(offset + i) % pool.length], correct: type });
  }
 }
 return shuffle(picks).slice(0, 9);
}

export default function LifeCycleMatching({ onBack }: { onBack: () => void }) {
 const [level, setLevel] = useState(1);
 const [round, setRound] = useState(1);
 const ROUNDS_PER_LEVEL = 3;

 const items = useMemo(() => buildRound(level, round), [level, round]);

 const [placements, setPlacements] = useState<Record<string, string>>({});
 const [selected, setSelected] = useState<string | null>(null);
 const [checked, setChecked] = useState(false);
 const [reviewing, setReviewing] = useState(false);
 const [totalScore, setTotalScore] = useState(0);
 const [bouncedIds, setBouncedIds] = useState<string[]>([]);

 useEffect(() => {
 if (bouncedIds.length === 0) return;
 const t = setTimeout(() => {
 setPlacements(p => { const n = { ...p }; bouncedIds.forEach(id => delete n[id]); return n; });
 setChecked(false);
 setBouncedIds([]);
 }, 700);
 return () => clearTimeout(t);
 }, [bouncedIds]);

 const unplaced = items.filter(i => !placements[i.weed.id]);
 const allPlaced = Object.keys(placements).length === items.length;

 const handleDrop = (cycle: string) => {
  if (!selected || checked) return;
  setPlacements(p => ({ ...p, [selected]: cycle }));
  setSelected(null);
 };

 const handleRemove = (weedId: string) => {
  if (checked) return;
  setPlacements(p => { const n = { ...p }; delete n[weedId]; return n; });
 };

 const correctCount = checked ? items.filter(i => placements[i.weed.id] === i.correct).length : 0;
 const wrongItems = checked ? items.filter(i => placements[i.weed.id] !== i.correct) : [];

 const resetRound = () => { setPlacements({}); setSelected(null); setChecked(false); setReviewing(false); };

 const handleCheck = () => {
  setChecked(true);
  const cc = items.filter(i => placements[i.weed.id] === i.correct).length;
  const wrong = items.filter(i => placements[i.weed.id] !== i.correct).map(i => i.weed.id);
  if (wrong.length === 0) {
   setTotalScore(s => s + cc);
  } else {
   // bounce wrong ones back so user retries them
   setBouncedIds(wrong);
  }
 };

 const nextRound = () => {
  if (round < ROUNDS_PER_LEVEL) {
   setRound(r => r + 1);
   resetRound();
  }
 };

 const isLevelDone = round === ROUNDS_PER_LEVEL && checked && !reviewing;

 const nextLevel = () => { setLevel(l => l + 1); setRound(1); setTotalScore(0); resetRound(); };
 const startOver = () => { setLevel(1); setRound(1); setTotalScore(0); resetRound(); };

 // Review screen for wrong answers
 if (reviewing && wrongItems.length > 0) {
  return (
   <div className="fixed inset-0 bg-background z-50 flex flex-col">
    <div className="flex items-center gap-3 p-4 border-b border-border">
     <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
     <h1 className="font-bold text-foreground text-lg flex-1">Review Incorrect Answers</h1>
    </div>
    <div className="flex-1 overflow-y-auto p-4">
     <p className="text-sm text-muted-foreground mb-4 text-center">
      You got {correctCount}/{items.length} correct. Let's review the ones you missed:
     </p>
     <div className="space-y-3 max-w-md mx-auto">
      {wrongItems.map(i => (
       <div key={i.weed.id} className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-3 mb-2">
         <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
          <WeedImage weedId={i.weed.id} stage="vegetative" className="w-full h-full object-cover" />
         </div>
         <div>
          <p className="font-bold text-foreground">{i.weed.commonName}</p>
          <p className="text-xs text-muted-foreground italic">{i.weed.scientificName}</p>
         </div>
        </div>
        <div className="flex gap-2 text-xs mb-1">
         <span className="px-2 py-0.5 rounded bg-destructive/20 text-destructive font-bold">Your answer: {placements[i.weed.id]}</span>
         <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-700 font-bold">Correct: {i.correct}</span>
        </div>
        <p className="text-xs text-muted-foreground">Life cycle: {i.weed.lifeCycle}</p>
       </div>
      ))}
     </div>
     <button onClick={() => {
      setReviewing(false);
      if (round < ROUNDS_PER_LEVEL) {
       // will show checked state briefly then user clicks next
      }
     }} className="w-full max-w-md mx-auto mt-4 py-3 rounded-lg bg-primary text-primary-foreground font-bold block">
      Continue
     </button>
    </div>
   </div>
  );
 }

 // Level complete screen
 if (isLevelDone) {
  return (
   <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
    <h2 className="text-2xl font-bold text-foreground mb-2">Level {level} Complete</h2>
    <p className="text-lg text-foreground mb-6">{totalScore}/{items.length * ROUNDS_PER_LEVEL} correct across {ROUNDS_PER_LEVEL} rounds</p>
    <LevelComplete level={level} score={totalScore} total={items.length * ROUNDS_PER_LEVEL} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
   </div>
  );
 }

 return (
  <div className="fixed inset-0 bg-background z-50 flex flex-col">
   <div className="flex items-center gap-3 p-4 border-b border-border">
    <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
    <h1 className="font-bold text-foreground text-lg flex-1">Life Cycle Sort</h1>
    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
    <span className="text-sm text-muted-foreground">Round {round}/{ROUNDS_PER_LEVEL}</span>
   </div>
   <div className="flex-1 overflow-y-auto p-4">
    <p className="text-sm text-muted-foreground mb-3 text-center">Tap a weed, then tap a life cycle category to sort it</p>

    <div className="grid grid-cols-3 gap-3 mb-4">
     {CYCLES.map(cycle => {
      const placed = items.filter(i => placements[i.weed.id] === cycle);
      return (
       <button key={cycle} onClick={() => handleDrop(cycle)}
        className={`rounded-xl border-2 p-3 min-h-[160px] transition-all text-left ${
         selected ? 'border-primary bg-primary/5 cursor-pointer hover:bg-primary/10' : 'border-border bg-card'
        }`}>
        <p className="text-sm font-bold text-foreground text-center mb-2">{cycle}</p>
        <div className="space-y-2">
         {placed.map(i => (
          <div key={i.weed.id} className={`flex items-center gap-1 p-1.5 rounded-lg transition-all duration-500 ${
           bouncedIds.includes(i.weed.id) ? 'opacity-0 -translate-y-8 scale-50' :
           checked ? (i.correct === cycle ? 'bg-green-500/20 border border-green-500' : 'bg-destructive/20 border border-destructive') : 'bg-secondary'
          }`}>
           <div className="w-8 h-8 rounded overflow-hidden bg-secondary flex-shrink-0">
            <WeedImage weedId={i.weed.id} stage="vegetative" className="w-full h-full object-cover" />
           </div>
           <span className="text-[10px] font-medium text-foreground flex-1 truncate">{i.weed.commonName}</span>
           {!checked && (
            <button onClick={e => { e.stopPropagation(); handleRemove(i.weed.id); }} className="text-muted-foreground hover:text-foreground text-xs">x</button>
           )}
          </div>
         ))}
        </div>
       </button>
      );
     })}
    </div>

    {unplaced.length > 0 && (
     <div className="flex flex-wrap gap-2 justify-center mb-4">
      {unplaced.map(i => (
       <button key={i.weed.id} onClick={() => setSelected(selected === i.weed.id ? null : i.weed.id)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
         selected === i.weed.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-card text-foreground hover:border-primary/50'
        }`}>
        <div className="w-8 h-8 rounded overflow-hidden bg-secondary">
         <WeedImage weedId={i.weed.id} stage="vegetative" className="w-full h-full object-cover" />
        </div>
        {i.weed.commonName}
       </button>
      ))}
     </div>
    )}

    {allPlaced && !checked && (
     <button onClick={handleCheck} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Answers</button>
    )}
    {checked && !reviewing && (
     <div className="text-center mt-4">
      <p className={`text-lg font-bold mb-3 ${correctCount === items.length ? 'text-green-500' : 'text-foreground'}`}>{correctCount}/{items.length} correct!</p>
      {round < ROUNDS_PER_LEVEL ? (
       <button onClick={nextRound} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next Round</button>
      ) : null}
     </div>
    )}
   </div>
        <FloatingCoach grade="6-8" tip={`Annuals finish in one season; biennials take two; perennials persist year after year.`} />
</div>
 );
}
