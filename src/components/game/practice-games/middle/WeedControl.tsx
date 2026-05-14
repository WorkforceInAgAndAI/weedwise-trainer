import { useState, useEffect, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import fieldBg from '@/assets/images/field-background.jpg';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';

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

function buildRound(level: number, round: number) {
 const offset = ((level - 1) * ROUNDS_PER_LEVEL + (round - 1)) * 8;
 const pool = shuffle(weeds);
 return pool.slice(offset % pool.length).concat(pool).slice(0, 8).map((w, i) => ({
  weed: w,
  x: 15 + (i % 4) * 20 + Math.random() * 10,
  y: 20 + Math.floor(i / 4) * 35 + Math.random() * 15,
  best: getBestMethod(w),
 }));
}

export default function WeedControl({ onBack }: { onBack: () => void }) {
 const [level, setLevel] = useState(1);
 const [round, setRound] = useState(1);

 const fieldWeeds = useMemo(() => buildRound(level, round), [level, round]);

 const [found, setFound] = useState<string[]>([]);
 const [current, setCurrent] = useState<string | null>(null);
 const [idChoice, setIdChoice] = useState<string | null>(null);
 const [identified, setIdentified] = useState(false);
 const [methodPick, setMethodPick] = useState<string | null>(null);
 const [score, setScore] = useState(0);
 const [timeLeft, setTimeLeft] = useState(120);
 const [roundResults, setRoundResults] = useState<{ weed: typeof weeds[0]; correct: boolean; method: string; best: string }[]>([]);
 const [showReview, setShowReview] = useState(false);
 const [totalScore, setTotalScore] = useState(0);

 const roundDone = found.length === fieldWeeds.length || timeLeft <= 0;

 useEffect(() => {
  if (roundDone) return;
  const t = setInterval(() => setTimeLeft(s => s - 1), 1000);
  return () => clearInterval(t);
 }, [roundDone]);

 const clickWeed = (id: string) => {
  if (roundDone || found.includes(id)) return;
  setCurrent(id);
  setIdentified(false);
  setMethodPick(null);
  setIdChoice(null);
 };

 const fw = current ? fieldWeeds.find(f => f.weed.id === current) : null;

 const idOptions = useMemo(() => {
  if (!fw) return [];
  const wrong = shuffle(fieldWeeds.filter(f => f.weed.id !== fw.weed.id)).slice(0, 3).map(f => f.weed.commonName);
  return shuffle([fw.weed.commonName, ...wrong]);
 }, [fw, fieldWeeds]);

 const identify = (name: string) => {
  setIdChoice(name);
  setIdentified(true);
 };

 const pickMethod = (mId: string) => {
  setMethodPick(mId);
  const correct = mId === fw?.best;
  if (correct) setScore(s => s + 1);
  setRoundResults(prev => [...prev, { weed: fw!.weed, correct, method: mId, best: fw!.best }]);
  setFound(f => [...f, current!]);
  setTimeout(() => { setCurrent(null); }, 800);
 };

 const resetRound = () => {
  setFound([]);
  setCurrent(null);
  setIdentified(false);
  setMethodPick(null);
  setIdChoice(null);
  setScore(0);
  setTimeLeft(120);
  setRoundResults([]);
  setShowReview(false);
 };

 // When round ends, show review
 useEffect(() => {
  if (roundDone && !showReview && roundResults.length > 0) {
   setTotalScore(s => s + score);
   setShowReview(true);
  }
 }, [roundDone]);

 const nextRound = () => {
  if (round < ROUNDS_PER_LEVEL) {
   setRound(r => r + 1);
   resetRound();
  }
 };

 const isLevelDone = round === ROUNDS_PER_LEVEL && showReview;

 const nextLevel = () => { setLevel(l => l + 1); setRound(1); setTotalScore(0); resetRound(); };
 const startOver = () => { setLevel(1); setRound(1); setTotalScore(0); resetRound(); };

 // Round review screen
 if (showReview) {
  const wrongResults = roundResults.filter(r => !r.correct);
  return (
   <div className="fixed inset-0 bg-background z-50 flex flex-col">
    <div className="flex items-center gap-3 p-4 border-b border-border">
     <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
     <h1 className="font-bold text-foreground text-lg flex-1">Round {round} Results</h1>
    </div>
    <div className="flex-1 overflow-y-auto p-4">
     <p className="text-lg font-bold text-foreground text-center mb-2">
      {timeLeft <= 0 ? "Time's Up!" : 'Field Clear!'} — {score}/{fieldWeeds.length} correct
     </p>
     {wrongResults.length > 0 && (
      <div className="space-y-2 max-w-md mx-auto mb-4">
       <p className="text-sm text-muted-foreground text-center">Review incorrect answers:</p>
       {wrongResults.map((r, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
         <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
          <WeedImage weedId={r.weed.id} stage="vegetative" className="w-full h-full object-cover" />
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
      <LevelComplete level={level} score={totalScore} total={fieldWeeds.length * ROUNDS_PER_LEVEL} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
     ) : (
      <button onClick={nextRound} className="w-full max-w-md mx-auto py-3 rounded-lg bg-primary text-primary-foreground font-bold block">
       Next Round
      </button>
     )}
    </div>
   </div>
  );
 }

 return (
  <div className="fixed inset-0 bg-background z-50 flex flex-col">
   <div className="flex items-center gap-3 p-4 border-b border-border">
    <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
    <h1 className="font-bold text-foreground text-lg flex-1">Weed Control</h1>
    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
    <span className="text-sm text-muted-foreground">R{round}/{ROUNDS_PER_LEVEL}</span>
    <span className="text-sm font-bold text-foreground">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
   </div>
   <div className="flex-1 relative overflow-hidden">
    <img src={fieldBg} alt="Field" className="absolute inset-0 w-full h-full object-cover" />
    <div className="absolute inset-0 bg-black/20" />
    {fieldWeeds.map(fw => (
     <button key={fw.weed.id} onClick={() => clickWeed(fw.weed.id)}
      style={{ left: `${fw.x}%`, top: `${fw.y}%` }}
      className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all ${found.includes(fw.weed.id) ? 'opacity-30 pointer-events-none' : 'animate-pulse'}`}>
      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white/70 bg-secondary shadow-lg">
       <WeedImage weedId={fw.weed.id} stage="seedling" className="w-full h-full object-cover" />
      </div>
     </button>
    ))}
   </div>
   {current && fw && (
    <div className="bg-card border-t-2 border-border p-4">
     <div className="flex items-center gap-3 mb-3">
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary">
       <WeedImage weedId={fw.weed.id} stage="vegetative" className="w-full h-full object-cover" />
      </div>
      <div className="flex-1">
       {!identified ? (
        <p className="text-sm font-bold text-foreground">Identify this weed:</p>
       ) : (
        <div>
         <p className="font-bold text-foreground text-lg">{fw.weed.commonName}</p>
         {idChoice !== fw.weed.commonName && (
          <p className="text-xs text-destructive">You guessed: {idChoice}</p>
         )}
        </div>
       )}
      </div>
     </div>
     {!identified && (
      <div className="grid grid-cols-2 gap-2 mb-2">
       {idOptions.map(name => (
        <button key={name} onClick={() => identify(name)}
         className="p-3 rounded-lg border-2 border-border bg-background text-sm font-bold text-foreground hover:border-primary transition-all">
         {name}
        </button>
       ))}
      </div>
     )}
     {identified && !methodPick && (
      <>
       <p className="text-sm font-bold text-foreground mb-2">Choose control method:</p>
       <div className="grid grid-cols-3 gap-2">
        {METHODS.map(m => (
         <button key={m.id} onClick={() => pickMethod(m.id)}
          className="p-2 rounded-lg border-2 border-border bg-background text-xs font-bold text-foreground hover:border-primary transition-all">
          {m.label}
         </button>
        ))}
       </div>
      </>
     )}
     {methodPick && (
      <p className={`font-bold text-center ${methodPick === fw.best ? 'text-green-500' : 'text-destructive'}`}>
       {methodPick === fw.best ? 'Correct!' : `Best: ${METHODS.find(m => m.id === fw.best)?.label}`}
      </p>
     )}
    </div>
   )}
        <FloatingCoach grade="6-8" tip={`IPM combines cultural, mechanical, biological, and chemical methods for the best result.`} />
</div>
 );
}
