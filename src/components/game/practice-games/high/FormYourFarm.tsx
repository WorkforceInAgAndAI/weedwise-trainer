import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { Leaf, Wheat, Tractor } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const CROPS = [
 { id: 'corn', name: 'Corn', competitiveness: 0.7 },
 { id: 'soybean', name: 'Soybean', competitiveness: 0.4 },
 { id: 'wheat', name: 'Wheat', competitiveness: 0.6 },
];
const SEASONS = [
 { id: 'early-spring', name: 'Early Spring', factor: 0.3 },
 { id: 'late-spring', name: 'Late Spring', factor: 0.6 },
 { id: 'summer', name: 'Summer', factor: 0.9 },
];

function getIdealDecision(severity: number, threshold: number, cropComp: number, seasonFactor: number): { decision: 'treat' | 'wait'; reason: string } {
 const canCropCompete = cropComp * (1 - seasonFactor) > 0.3;
 if (severity > threshold && !canCropCompete) {
 return { decision: 'treat', reason: `Density (${severity}/acre) exceeds your threshold (${threshold}/acre) and the crop can't outcompete at this time of year. Treatment is needed.` };
 }
 if (severity > threshold && canCropCompete) {
 return { decision: 'wait', reason: `Although density (${severity}/acre) exceeds threshold, the crop is competitive enough this season to suppress these weeds naturally.` };
 }
 return { decision: 'wait', reason: `Density (${severity}/acre) is below your threshold (${threshold}/acre). The crop can manage — no treatment needed yet.` };
}

export default function FormYourFarm({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
 const { addBadge } = useGameProgress();
 const [phase, setPhase] = useState<'design' | 'attack' | 'review'>('design');
 const [crop, setCrop] = useState(CROPS[0]);
 const [season, setSeason] = useState(SEASONS[0]);
 const [threshold, setThreshold] = useState(10);
 const [decisions, setDecisions] = useState<Record<string, 'treat' | 'wait'>>({});

 const attackWeeds = useMemo(() => shuffle(weeds).slice(0, 12).map(w => {
 const severity = Math.floor(Math.random() * 20) + 1;
 return { weed: w, severity };
 }), []);

 const startAttack = () => setPhase('attack');

 const decide = (wId: string, d: 'treat' | 'wait') => {
 setDecisions(prev => ({ ...prev, [wId]: d }));
 };

 const allDecided = Object.keys(decisions).length === attackWeeds.length;

 const evaluate = () => setPhase('review');

 const results = useMemo(() => {
 return attackWeeds.map(aw => {
 const ideal = getIdealDecision(aw.severity, threshold, crop.competitiveness, season.factor);
 const userChoice = decisions[aw.weed.id];
 const correct = userChoice === ideal.decision;
 return { ...aw, ideal: ideal.decision, reason: ideal.reason, userChoice, correct };
 });
 }, [attackWeeds, decisions, threshold, crop, season]);

 const score = results.filter(r => r.correct).length;

 const restart = () => { setPhase('design'); setDecisions({}); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

 if (phase === 'design') return (
 <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
 <div className="max-w-lg mx-auto p-4">
 <div className="flex items-center gap-3 mb-4">
 <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
 <h1 className="font-display font-bold text-lg text-foreground">Form Your Farm</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
 </div>
 <p className="text-sm text-muted-foreground text-center mb-4">Design your farm, then defend it against weeds!</p>
 <div className="mb-4">
 <p className="text-sm font-bold text-foreground mb-2">Choose your crop:</p>
 <div className="flex gap-2">
 {CROPS.map(c => (
 <button key={c.id} onClick={() => setCrop(c)}
 className={`flex-1 p-3 rounded-xl border-2 text-center ${crop.id === c.id ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
 <p className="text-sm font-bold text-foreground">{c.name}</p>
 </button>
 ))}
 </div>
 </div>
 <div className="mb-4">
 <p className="text-sm font-bold text-foreground mb-2">Season of weed pressure:</p>
 <div className="flex gap-2">
 {SEASONS.map(s => (
 <button key={s.id} onClick={() => setSeason(s)}
 className={`flex-1 p-3 rounded-xl border-2 text-center ${season.id === s.id ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
 <p className="text-xs font-bold text-foreground">{s.name}</p>
 </button>
 ))}
 </div>
 </div>
 <div className="mb-6">
 <p className="text-sm font-bold text-foreground mb-2">Economic Threshold: {threshold} weeds/acre</p>
 <input type="range" min={3} max={20} value={threshold} onChange={e => setThreshold(+e.target.value)} className="w-full" />
 </div>
 <button onClick={startAttack} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Start Season!</button>
 </div>
 </div>
 );

 if (phase === 'review') {
 addBadge({ gameId: 'form-farm', gameName: 'Form Your Farm', level: 'HS', score, total: attackWeeds.length });
 return (
 <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
 <div className="max-w-lg mx-auto p-4">
 <div className="flex items-center gap-3 mb-4">
 <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
 <h1 className="font-display font-bold text-lg text-foreground">Season Results</h1>
 </div>
 <div className="bg-card rounded-xl border border-border p-4 mb-4 text-center">
 <Leaf className="w-8 h-8 text-primary mx-auto mb-2" />
 <p className="font-bold text-foreground text-xl">{score}/{attackWeeds.length} correct decisions</p>
 <p className="text-sm text-muted-foreground">Crop: {crop.name} — Season: {season.name} — Threshold: {threshold}/acre</p>
 </div>
 <div className="space-y-3 mb-4">
 {results.map(r => (
 <div key={r.weed.id} className={`p-3 rounded-xl border-2 ${r.correct ? 'border-green-500 bg-green-500/5' : 'border-destructive bg-destructive/5'}`}>
 <div className="flex items-center gap-3 mb-2">
 <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
 <WeedImage weedId={r.weed.id} stage="plant" className="w-full h-full object-cover" />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-sm font-bold text-foreground">{r.weed.commonName}</p>
 <p className="text-[10px] text-muted-foreground">Density: {r.severity}/acre</p>
 </div>
 <div className="text-right">
 <p className={`text-xs font-bold ${r.correct ? 'text-green-500' : 'text-destructive'}`}>
 You: {r.userChoice}
 </p>
 {!r.correct && <p className="text-[10px] text-muted-foreground">Best: {r.ideal}</p>}
 </div>
 </div>
 <p className="text-xs text-muted-foreground">{r.reason}</p>
 </div>
 ))}
 </div>
 <LevelComplete level={level} score={score} total={results.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
 </div>
 </div>
 );
 }

 return (
 <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
 <div className="max-w-lg mx-auto p-4">
 <div className="flex items-center gap-3 mb-4">
 <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
 <h1 className="font-display font-bold text-lg text-foreground">Weed Attack!</h1>
 <span className="ml-auto text-xs text-muted-foreground">Threshold: {threshold}/acre</span>
 </div>
 <p className="text-sm text-muted-foreground text-center mb-3">For each weed: treat or wait based on severity vs. your threshold of {threshold}/acre</p>
 <div className="grid gap-2">
 {attackWeeds.map(aw => (
 <div key={aw.weed.id} className="flex items-center gap-3 p-3 rounded-xl border-2 border-border bg-card">
 <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
 <WeedImage weedId={aw.weed.id} stage="plant" className="w-full h-full object-cover" />
 </div>
 <div className="flex-1">
 <p className="text-xs font-bold text-foreground">{aw.weed.commonName}</p>
 <p className="text-[10px] text-muted-foreground">Density: {aw.severity}/acre</p>
 </div>
 <div className="flex gap-1">
 <button onClick={() => decide(aw.weed.id, 'treat')}
 className={`px-3 py-1 rounded-lg text-xs font-bold ${decisions[aw.weed.id] === 'treat' ? 'bg-destructive text-white' : 'bg-secondary text-foreground'}`}>Treat</button>
 <button onClick={() => decide(aw.weed.id, 'wait')}
 className={`px-3 py-1 rounded-lg text-xs font-bold ${decisions[aw.weed.id] === 'wait' ? 'bg-green-500 text-white' : 'bg-secondary text-foreground'}`}>Wait</button>
 </div>
 </div>
 ))}
 </div>
 {allDecided && <button onClick={evaluate} className="mt-4 w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Evaluate Season</button>}
 </div>
 </div>
 );
}
