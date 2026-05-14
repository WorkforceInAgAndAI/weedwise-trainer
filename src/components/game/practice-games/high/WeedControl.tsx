import { useState, useEffect, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import fieldBg from '@/assets/images/field-background.jpg';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);
const ROUNDS_PER_LEVEL = 3;

const METHODS = [
 { id: 'cultivate', label: 'Cultivation' },
 { id: 'tillage', label: 'Tillage' },
 { id: 'hoe', label: 'Hoeing' },
 { id: 'pull', label: 'Hand Pull' },
 { id: 'pre', label: 'Pre-emergent Herbicide' },
 { id: 'post', label: 'Post-emergent Herbicide' },
];

function getBestMethod(w: typeof weeds[0]): string {
 const m = w.management.toLowerCase();
 if (m.includes('pre')) return 'pre';
 if (m.includes('post')) return 'post';
 if (m.includes('cultivat')) return 'cultivate';
 if (m.includes('till')) return 'tillage';
 if (m.includes('pull') || m.includes('roguing')) return 'pull';
 return 'hoe';
}

function getMethodExplanation(weed: typeof weeds[0], chosen: string, best: string): string {
 const bestLabel = METHODS.find(m => m.id === best)?.label || best;
 if (chosen === best) return `Correct! ${bestLabel} is the best method for ${weed.commonName}. ${weed.management}`;
 const chosenLabel = METHODS.find(m => m.id === chosen)?.label || chosen;
 return `${chosenLabel} isn't ideal here. ${bestLabel} works best for ${weed.commonName} because: ${weed.management}`;
}

function buildRound(level: number, round: number) {
 const pool = shuffle(weeds);
 const offset = ((level - 1) * ROUNDS_PER_LEVEL + round) * 8;
 return pool.slice(offset % pool.length).concat(pool).slice(0, 8).map((w, i) => ({
  weed: w,
  x: 15 + (i % 4) * 20 + Math.random() * 10,
  y: 20 + Math.floor(i / 4) * 35 + Math.random() * 15,
  best: getBestMethod(w),
 }));
}

export default function WeedControl({ onBack }: { onBack: () => void }) {
 const [level, setLevel] = useState(1);
 const [round, setRound] = useState(0);

 const fieldWeeds = useMemo(() => buildRound(level, round), [level, round]);

 const [items, setItems] = useState(fieldWeeds.map(w => ({ ...w, found: false, managed: false })));
 const [active, setActive] = useState<number | null>(null);
 const [methodPick, setMethodPick] = useState<string | null>(null);
 const [explanation, setExplanation] = useState('');
 const [time, setTime] = useState(120);
 const [score, setScore] = useState(0);
 const [totalScore, setTotalScore] = useState(0);
 const [roundResults, setRoundResults] = useState<{ weed: typeof weeds[0]; correct: boolean; method: string; best: string }[]>([]);
 const [showReview, setShowReview] = useState(false);

 // Reset items when round changes
 useMemo(() => {
  setItems(fieldWeeds.map(w => ({ ...w, found: false, managed: false })));
  setActive(null);
  setMethodPick(null);
  setExplanation('');
  setTime(120);
  setScore(0);
  setRoundResults([]);
  setShowReview(false);
 }, [fieldWeeds]);

 const roundDone = time <= 0 || items.every(i => i.managed);

 useEffect(() => { if (roundDone) return; const t = setInterval(() => setTime(s => s - 1), 1000); return () => clearInterval(t); }, [roundDone]);

 useEffect(() => {
  if (roundDone && !showReview && items.some(i => i.managed)) {
   setTotalScore(s => s + score);
   setShowReview(true);
  }
 }, [roundDone]);

 const clickWeed = (idx: number) => {
  if (roundDone || items[idx].managed) return;
  setActive(idx);
  setMethodPick(null);
  setExplanation('');
 };

 const manage = (mId: string) => {
  if (active === null) return;
  const correct = mId === items[active].best;
  if (correct) setScore(s => s + 1);
  setMethodPick(mId);
  setExplanation(getMethodExplanation(items[active].weed, mId, items[active].best));
  setRoundResults(prev => [...prev, { weed: items[active].weed, correct, method: mId, best: items[active].best }]);
 };

 const dismissExplanation = () => {
  if (active === null) return;
  setItems(it => it.map((w, i) => i === active ? { ...w, managed: true } : w));
  setActive(null);
  setMethodPick(null);
  setExplanation('');
 };

 const nextRound = () => {
  if (round + 1 < ROUNDS_PER_LEVEL) {
   setRound(r => r + 1);
  }
 };

 const isLevelDone = round === ROUNDS_PER_LEVEL - 1 && showReview;

 const nextLevel = () => { setLevel(l => l + 1); setRound(0); setTotalScore(0); };
 const startOver = () => { setLevel(1); setRound(0); setTotalScore(0); };

 // Round review
 if (showReview) {
  const wrongResults = roundResults.filter(r => !r.correct);
  return (
   <div className="fixed inset-0 bg-background z-50 flex flex-col">
    <div className="flex items-center gap-3 p-4 border-b border-border">
     <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
     <h1 className="font-bold text-foreground text-lg flex-1">Round {round + 1} Results</h1>
    </div>
    <div className="flex-1 overflow-y-auto p-4">
     <p className="text-lg font-bold text-foreground text-center mb-2">
      {time <= 0 ? "Time's Up!" : 'Field Clear!'} -- {score}/{items.length} correct
     </p>
     {wrongResults.length > 0 && (
      <div className="space-y-2 max-w-md mx-auto mb-4">
       <p className="text-sm text-muted-foreground text-center">Review incorrect answers:</p>
       {wrongResults.map((r, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
         <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
          <WeedImage weedId={r.weed.id} stage="flower" className="w-full h-full object-cover" />
         </div>
         <div className="flex-1">
          <p className="font-bold text-foreground text-sm">{r.weed.commonName}</p>
          <p className="text-xs text-destructive">Your pick: {METHODS.find(m => m.id === r.method)?.label}</p>
          <p className="text-xs text-green-600">Best: {METHODS.find(m => m.id === r.best)?.label}</p>
         </div>
        </div>
       ))}
      </div>
     )}
     {isLevelDone ? (
      <LevelComplete level={level} score={totalScore} total={items.length * ROUNDS_PER_LEVEL} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
     ) : (
      <button onClick={nextRound} className="w-full max-w-md mx-auto py-3 rounded-lg bg-primary text-primary-foreground font-bold block">Next Round</button>
     )}
    </div>
   </div>
  );
 }

 return (
  <div className="fixed inset-0 bg-background z-50 flex flex-col">
   <div className="flex items-center gap-3 p-4 border-b border-border">
    <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
    <h1 className="font-display font-bold text-lg text-foreground">Weed Control</h1>
    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
    <span className="text-sm text-muted-foreground">R{round + 1}/{ROUNDS_PER_LEVEL}</span>
    <span className="text-sm font-mono text-foreground">{Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}</span>
   </div>
   <div className="flex-1 relative overflow-hidden">
    <img src={fieldBg} alt="Field" className="absolute inset-0 w-full h-full object-cover" />
    <div className="absolute inset-0 bg-black/20" />
    {items.map((w, i) => !w.managed && (
     <button key={i} onClick={() => clickWeed(i)}
      className={`absolute w-14 h-14 rounded-full transition-all ${active === i ? 'scale-125 z-10' : 'animate-pulse'}`}
      style={{ left: `${w.x}%`, top: `${w.y}%` }}>
      <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/70 bg-secondary shadow-lg">
       <WeedImage weedId={w.weed.id} stage="flower" className="w-full h-full object-cover" />
      </div>
     </button>
    ))}
   </div>
   {active !== null && (
    <div className="bg-card border-t-2 border-border p-4">
     <div className="flex items-start gap-3 mb-3">
      <div className="w-24 h-24 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
       <WeedImage weedId={items[active].weed.id} stage="flower" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1">
       <p className="font-bold text-foreground text-lg">{items[active].weed.commonName}</p>
       <p className="text-xs italic text-muted-foreground">{items[active].weed.scientificName}</p>
      </div>
     </div>
     {!methodPick ? (
      <div className="grid grid-cols-3 gap-2">
       {METHODS.map(m => (
        <button key={m.id} onClick={() => manage(m.id)} className="px-3 py-2 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors">{m.label}</button>
       ))}
      </div>
     ) : (
      <div>
       <p className={`font-bold mb-2 ${methodPick === items[active].best ? 'text-green-500' : 'text-destructive'}`}>
        {methodPick === items[active].best ? 'Correct!' : 'Not the best choice'}
       </p>
       <p className="text-sm text-muted-foreground mb-3">{explanation}</p>
       <button onClick={dismissExplanation} className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm">Continue</button>
      </div>
     )}
    </div>
   )}
  </div>
 );
}
