import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import fieldBg from '@/assets/images/field-background.jpg';
import { Droplets, AlertTriangle, TrendingUp } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const RATE_LEVELS = [
 { id: 'low', label: 'Low Rate (0.5x)', factor: 0.5, desc: 'Cheaper but higher resistance risk' },
 { id: 'standard', label: 'Standard Rate (1x)', factor: 1.0, desc: 'Label rate — recommended application' },
 { id: 'high', label: 'High Rate (1.5x)', factor: 1.5, desc: 'Maximum control but expensive' },
];

const HERBICIDE_MODES = [
 { id: 'gly', label: 'Glyphosate (Group 9)', resistanceRate: 0.4 },
 { id: 'als', label: 'ALS Inhibitor (Group 2)', resistanceRate: 0.5 },
 { id: 'ppo', label: 'PPO Inhibitor (Group 14)', resistanceRate: 0.1 },
 { id: 'multi', label: 'Tank Mix (Multiple MOA)', resistanceRate: 0.05 },
];

interface SprayRound {
 weed: typeof weeds[0];
 x: number;
 y: number;
 resistanceLevel: number;
}

export default function HerbicideApplicator({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
 const { addBadge } = useGameProgress();
 const fieldItems = useMemo(() => shuffle(weeds).slice(0, 6).map((w, i) => ({
 weed: w,
 x: 12 + (i % 3) * 30 + Math.random() * 10,
 y: 15 + Math.floor(i / 3) * 40 + Math.random() * 15,
 resistanceLevel: 0,
 })), []);

 const [sprayRound, setSprayRound] = useState(1);
 const [items, setItems] = useState<SprayRound[]>(fieldItems);
 const [selectedWeed, setSelectedWeed] = useState<number | null>(null);
 const [selectedHerb, setSelectedHerb] = useState<string | null>(null);
 const [selectedRate, setSelectedRate] = useState<string>('standard');
 const [roundResults, setRoundResults] = useState<{ weedName: string; killed: boolean; resistanceGain: number }[]>([]);
 const [showResults, setShowResults] = useState(false);
 const [totalScore, setTotalScore] = useState(0);

 const MAX_ROUNDS = 3;
 const done = sprayRound > MAX_ROUNDS;

 const applyHerbicide = () => {
 if (selectedWeed === null || !selectedHerb) return;
 const weed = items[selectedWeed];
 const herb = HERBICIDE_MODES.find(h => h.id === selectedHerb)!;
 const rate = RATE_LEVELS.find(r => r.id === selectedRate)!;

 // Kill effectiveness decreases with resistance level
 const baseKill = rate.factor * (1 - weed.resistanceLevel * 0.3);
 const killed = baseKill > 0.6 + Math.random() * 0.3;

 // Resistance increases more with single MOA and low rates
 const resistanceGain = herb.resistanceRate * (1 / rate.factor) * 0.3;

 setRoundResults(prev => [...prev, {
 weedName: weed.weed.commonName,
 killed,
 resistanceGain,
 }]);

 if (killed) {
 setTotalScore(s => s + 1);
 }

 setItems(prev => prev.map((it, i) => i === selectedWeed ? {
 ...it,
 resistanceLevel: Math.min(1, it.resistanceLevel + resistanceGain),
 } : it));

 setSelectedWeed(null);
 setSelectedHerb(null);
 setSelectedRate('standard');
 };

 const finishRound = () => {
 setShowResults(true);
 };

 const nextRound = () => {
 setShowResults(false);
 setRoundResults([]);
 // Regrow some weeds with increased resistance
 setItems(prev => prev.map(it => ({
 ...it,
 x: 12 + Math.random() * 70,
 y: 15 + Math.random() * 70,
 })));
 setSprayRound(r => r + 1);
 };

 const restart = () => {
 setSprayRound(1);
 setItems(fieldItems);
 setSelectedWeed(null);
 setSelectedHerb(null);
 setSelectedRate('standard');
 setRoundResults([]);
 setShowResults(false);
 setTotalScore(0);
 };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

 if (done) {
 addBadge({ gameId: 'herbicide-applicator', gameName: 'Herbicide Resistance', level: 'MS', score: totalScore, total: items.length * MAX_ROUNDS });
 return (
 <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
 <Droplets className="w-10 h-10 text-primary mb-3" />
 <h2 className="text-2xl font-bold text-foreground mb-2">Season Complete!</h2>
 <p className="text-lg text-foreground mb-2">{totalScore} weeds controlled over {MAX_ROUNDS} spray rounds</p>
 <p className="text-sm text-muted-foreground mb-6 max-w-sm text-center">
 {totalScore >= items.length * MAX_ROUNDS * 0.7
 ? 'Excellent resistance management! Rotating MOAs and using proper rates kept resistance low.'
 : 'Some weeds developed resistance. Try rotating herbicide modes of action and using label rates next time.'}
 </p>
 <LevelComplete level={level} score={correctCount} total={items.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
 </div>
 );
 }

 if (showResults) {
 return (
 <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
 <h2 className="font-bold text-xl text-foreground mb-4">Spray Round {sprayRound} Results</h2>
 <div className="w-full max-w-md space-y-2 mb-4">
 {roundResults.map((r, i) => (
 <div key={i} className={`p-3 rounded-lg border-2 ${r.killed ? 'border-green-500 bg-green-500/10' : 'border-destructive bg-destructive/10'}`}>
 <div className="flex items-center justify-between">
 <span className="text-sm font-medium text-foreground">{r.weedName}</span>
 <span className={`text-xs font-bold ${r.killed ? 'text-green-600' : 'text-destructive'}`}>{r.killed ? 'Controlled' : 'Survived'}</span>
 </div>
 {r.resistanceGain > 0.1 && (
 <div className="flex items-center gap-1 mt-1">
 <AlertTriangle className="w-3 h-3 text-amber-500" />
 <span className="text-[10px] text-amber-600">Resistance building ({Math.round(r.resistanceGain * 100)}% increase)</span>
 </div>
 )}
 </div>
 ))}
 </div>
 <div className="bg-card border border-border rounded-xl p-4 max-w-md w-full mb-4">
 <div className="flex items-center gap-2 mb-2">
 <TrendingUp className="w-4 h-4 text-muted-foreground" />
 <span className="text-sm font-bold text-foreground">Resistance Status</span>
 </div>
 {items.map((it, i) => (
 <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground py-1">
 <span className="flex-1">{it.weed.commonName}</span>
 <div className="w-20 h-2 bg-secondary rounded-full overflow-hidden">
 <div className="h-full bg-destructive rounded-full transition-all" style={{ width: `${it.resistanceLevel * 100}%` }} />
 </div>
 <span className="w-8 text-right">{Math.round(it.resistanceLevel * 100)}%</span>
 </div>
 ))}
 </div>
 <button onClick={nextRound} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
 {sprayRound < MAX_ROUNDS ? `Spray Round ${sprayRound + 1}` : 'See Final Results'}
 </button>
 </div>
 );
 }

 return (
 <div className="fixed inset-0 bg-background z-50 flex flex-col">
 <div className="flex items-center gap-3 p-4 border-b border-border">
 <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
 <h1 className="font-bold text-foreground text-lg flex-1">Herbicide Resistance</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
 <span className="text-sm text-muted-foreground">Round {sprayRound}/{MAX_ROUNDS}</span>
 </div>
 <div className="flex-1 relative overflow-hidden">
 <img src={fieldBg} alt="Field" className="absolute inset-0 w-full h-full object-cover" />
 <div className="absolute inset-0 bg-black/20" />
 {items.map((item, i) => (
 <button key={i} onClick={() => setSelectedWeed(i)}
 style={{ left: `${item.x}%`, top: `${item.y}%` }}
 className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all ${selectedWeed === i ? 'scale-125' : 'animate-pulse'}`}>
 <div className={`w-14 h-14 rounded-full overflow-hidden border-[3px] shadow-lg ${
 item.resistanceLevel > 0.5 ? 'border-destructive' : item.resistanceLevel > 0.2 ? 'border-amber-400' : 'border-white/80'
 }`}>
 <WeedImage weedId={item.weed.id} stage="vegetative" className="w-full h-full object-cover" />
 </div>
 </button>
 ))}
 </div>
 {selectedWeed !== null && (
 <div className="bg-card border-t-2 border-border p-4 max-h-[50vh] overflow-y-auto">
 <p className="font-bold text-foreground mb-1">{items[selectedWeed].weed.commonName}</p>
 <p className="text-xs text-muted-foreground mb-3">Resistance: {Math.round(items[selectedWeed].resistanceLevel * 100)}%</p>
 <p className="text-xs font-bold text-foreground mb-2">Herbicide Mode of Action:</p>
 <div className="grid grid-cols-2 gap-2 mb-3">
 {HERBICIDE_MODES.map(h => (
 <button key={h.id} onClick={() => setSelectedHerb(h.id)}
 className={`p-2 rounded-lg border-2 text-xs font-medium text-left ${selectedHerb === h.id ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}>
 {h.label}
 </button>
 ))}
 </div>
 <p className="text-xs font-bold text-foreground mb-2">Application Rate:</p>
 <div className="flex gap-2 mb-3">
 {RATE_LEVELS.map(r => (
 <button key={r.id} onClick={() => setSelectedRate(r.id)}
 className={`flex-1 p-2 rounded-lg border-2 text-xs text-center ${selectedRate === r.id ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}>
 <span className="font-bold block">{r.label}</span>
 <span className="text-[10px] text-muted-foreground">{r.desc}</span>
 </button>
 ))}
 </div>
 <div className="flex gap-2">
 <button onClick={applyHerbicide} disabled={!selectedHerb}
 className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-50">Apply</button>
 <button onClick={finishRound} className="py-3 px-4 rounded-lg bg-secondary text-foreground font-bold">End Round</button>
 </div>
 </div>
 )}
 {selectedWeed === null && (
 <div className="p-4 bg-card border-t border-border">
 <p className="text-sm text-muted-foreground text-center mb-2">Tap a weed to select herbicide and rate, or end the round.</p>
 <button onClick={finishRound} className="w-full py-3 rounded-lg bg-secondary text-foreground font-bold">End Spray Round</button>
 </div>
 )}
 </div>
 );
}
