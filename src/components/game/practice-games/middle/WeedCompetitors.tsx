import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface Choice { label: string; advantage: boolean; reason: string; }

function buildRound(you: typeof weeds[0], opponent: typeof weeds[0]) {
 const choices: { question: string; options: Choice[] }[] = [
 {
 question: 'How will you spread your leaves?',
 options: [
 { label: 'Broad flat leaves', advantage: you.plantType === 'Dicot', reason: 'Dicots shade out competitors with broad leaves.' },
 { label: 'Narrow upright leaves', advantage: you.plantType === 'Monocot', reason: 'Monocots grow densely and intercept light efficiently.' },
 ],
 },
 {
 question: 'How will you reproduce?',
 options: [
 { label: 'Produce thousands of seeds', advantage: you.lifeCycle === 'Annual', reason: 'Annuals rely on massive seed production to persist.' },
 { label: 'Spread by roots and rhizomes', advantage: you.lifeCycle === 'Perennial', reason: 'Perennials survive by spreading underground.' },
 ],
 },
 {
 question: 'When will you grow?',
 options: [
 { label: 'Grow fast in spring', advantage: you.actImmediately, reason: 'Early growth captures resources first.' },
 { label: 'Wait for summer heat', advantage: !you.actImmediately, reason: 'Late growers avoid early competition.' },
 ],
 },
 ];
 return choices;
}

export default function WeedCompetitors({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
 const matchups = useMemo(() => {
 const pool = shuffle(weeds);
 const result: { you: typeof weeds[0]; opponent: typeof weeds[0] }[] = [];
 for (let i = 0; i + 1 < pool.length && result.length < 4; i += 2) {
 result.push({ you: pool[i], opponent: pool[i + 1] });
 }
 return result;
 }, []);

 const [matchIdx, setMatchIdx] = useState(0);
 const [step, setStep] = useState(0);
 const [points, setPoints] = useState(0);
 const [totalPoints, setTotalPoints] = useState(0);
 const [picked, setPicked] = useState<number | null>(null);
 const [answered, setAnswered] = useState(false);

 const done = matchIdx >= matchups.length;
 const match = !done ? matchups[matchIdx] : null;
 const rounds = useMemo(() => match ? buildRound(match.you, match.opponent) : [], [match]);

 const pick = (idx: number) => {
 if (answered) return;
 setPicked(idx);
 setAnswered(true);
 if (rounds[step].options[idx].advantage) {
 setPoints(p => p + 1);
 setTotalPoints(t => t + 1);
 }
 };

 const nextStep = () => {
 if (step + 1 >= rounds.length) {
 setMatchIdx(m => m + 1);
 setStep(0);
 setPoints(0);
 } else {
 setStep(s => s + 1);
 }
 setPicked(null);
 setAnswered(false);
 };

 const restart = () => { setMatchIdx(0); setStep(0); setPoints(0); setTotalPoints(0); setPicked(null); setAnswered(false); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

 if (done) {
 return (
 <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
 <h2 className="text-2xl font-bold text-foreground mb-2">Competition Over!</h2>
 <p className="text-lg text-foreground mb-6">{totalPoints}/{matchups.length * 3} advantages won</p>
 <LevelComplete level={level} score={score} total={rounds?.length ?? 0} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
 </div>
 );
 }

 return (
 <div className="fixed inset-0 bg-background z-50 flex flex-col">
 <div className="flex items-center gap-3 p-4 border-b border-border">
 <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
 <h1 className="font-bold text-foreground text-lg flex-1">Weed Competitors</h1>
 <span className="text-sm text-muted-foreground">Match {matchIdx + 1}/{matchups.length}</span>
 </div>
 <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
 {/* Boxing match header */}
 <div className="w-full max-w-md bg-gradient-to-r from-destructive/20 via-secondary to-primary/20 rounded-2xl p-4 mb-4">
 <div className="flex items-center justify-between">
 <div className="text-center flex-1">
 <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-card border-3 border-destructive mb-2 shadow-lg">
 <WeedImage weedId={match!.you.id} stage="vegetative" className="w-full h-full object-cover" />
 </div>
 <p className="text-xs font-bold text-foreground">{match!.you.commonName}</p>
 <p className="text-[10px] text-destructive font-bold uppercase">You</p>
 </div>
 <div className="flex flex-col items-center px-2">
 <span className="text-3xl font-black text-foreground">VS</span>
 <div className="flex gap-1 mt-1">
 {[0, 1, 2].map(i => (
 <div key={i} className={`w-3 h-3 rounded-full ${i < points ? 'bg-green-500' : i < step ? 'bg-destructive' : 'bg-border'}`} />
 ))}
 </div>
 <p className="text-[10px] text-muted-foreground mt-1">Round {step + 1}/3</p>
 </div>
 <div className="text-center flex-1">
 <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-card border-3 border-primary mb-2 shadow-lg">
 <WeedImage weedId={match!.opponent.id} stage="vegetative" className="w-full h-full object-cover" />
 </div>
 <p className="text-xs font-bold text-foreground">{match!.opponent.commonName}</p>
 <p className="text-[10px] text-primary font-bold uppercase">Rival</p>
 </div>
 </div>
 </div>

 {/* Question card */}
 <div className="w-full max-w-md bg-card rounded-xl border-2 border-border p-4 mb-4">
 <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Your Move</p>
 <p className="font-bold text-foreground text-lg mb-4">{rounds[step]?.question}</p>
 <div className="flex flex-col gap-3">
 {rounds[step]?.options.map((opt, idx) => {
 const bg = !answered ? 'border-border bg-background hover:border-primary' :
 idx === picked ? (opt.advantage ? 'border-green-500 bg-green-500/20' : 'border-destructive bg-destructive/20') :
 opt.advantage ? 'border-green-500 bg-green-500/10' : 'border-border bg-background';
 return (
 <button key={idx} onClick={() => pick(idx)}
 className={`p-4 rounded-xl border-2 text-left transition-all ${bg}`}>
 <span className="font-bold text-sm text-foreground">{opt.label}</span>
 {answered && <p className="text-xs text-muted-foreground mt-1">{opt.reason}</p>}
 </button>
 );
 })}
 </div>
 </div>

 {answered && (
 <button onClick={nextStep} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold">
 {step + 1 >= rounds.length ? 'Next Match →' : 'Next Round →'}
 </button>
 )}
 </div>
 </div>
 );
}
