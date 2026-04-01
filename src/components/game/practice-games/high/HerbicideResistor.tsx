import { useState, useMemo } from 'react';
import { Dna } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const HERBICIDES = [
 { id: 'gly', name: 'Glyphosate (Group 9)', risk: 'high' },
 { id: 'als', name: 'ALS Inhibitor (Group 2)', risk: 'high' },
 { id: 'ppo', name: 'PPO Inhibitor (Group 14)', risk: 'low' },
 { id: 'multi', name: 'Multi-MOA Mix', risk: 'very-low' },
];
const CROPS_LIST = [
 { id: 'rr-soy', name: 'Roundup Ready Soybean', compatible: ['gly', 'ppo', 'multi'], rotationValue: 0.4 },
 { id: 'conv-corn', name: 'Conventional Corn', compatible: ['als', 'ppo', 'multi'], rotationValue: 0.7 },
 { id: 'wheat', name: 'Winter Wheat', compatible: ['als', 'ppo', 'multi'], rotationValue: 0.8 },
];

const SEASONS_DATA = [
 { year: 1, pressure: 'Low weed pressure. Waterhemp seedlings appearing.' },
 { year: 2, pressure: 'Moderate pressure. Some surviving weeds from Year 1.' },
 { year: 3, pressure: 'High pressure! Resistant biotypes detected.' },
];

function getYearExplanation(crop: string, herb: string, yearIdx: number, allChoices: { crop: string; herb: string }[]): string {
 const cropDef = CROPS_LIST.find(c => c.id === crop);
 const herbDef = HERBICIDES.find(h => h.id === herb);
 const compatible = cropDef?.compatible.includes(herb);
 const parts: string[] = [];

 if (!compatible) {
 parts.push(`${herbDef?.name} is not compatible with ${cropDef?.name}. This would damage your crop in practice.`);
 } else {
 parts.push(`${herbDef?.name} is compatible with ${cropDef?.name}.`);
 }

 if (herbDef?.risk === 'high') {
 const prevSameHerb = allChoices.slice(0, yearIdx).filter(c => c.herb === herb).length;
 if (prevSameHerb > 0) {
 parts.push(`You used this high-risk herbicide ${prevSameHerb + 1} times now. Repeated use of a single mode of action greatly increases resistance risk.`);
 } else {
 parts.push(`This herbicide has high resistance risk. Avoid using it repeatedly.`);
 }
 } else if (herb === 'multi') {
 parts.push(`Great choice! Multi-MOA mixes reduce selection pressure and slow resistance development.`);
 } else {
 parts.push(`${herbDef?.name} has ${herbDef?.risk} resistance risk — a reasonable choice.`);
 }

 const prevSameCrop = allChoices.slice(0, yearIdx).filter(c => c.crop === crop).length;
 if (prevSameCrop > 0) {
 parts.push(`Rotating crops helps break pest cycles. You've planted this crop ${prevSameCrop + 1} times.`);
 } else if (yearIdx > 0) {
 parts.push(`Good crop rotation! Different crops disrupt weed life cycles.`);
 }

 return parts.join(' ');
}

export default function HerbicideResistor({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
 const { addBadge } = useGameProgress();
 const [year, setYear] = useState(0);
 const [choices, setChoices] = useState<{ crop: string; herb: string }[]>([]);
 const [crop, setCrop] = useState<string | null>(null);
 const [herb, setHerb] = useState<string | null>(null);
 const [showReview, setShowReview] = useState(false);
 const [done, setDone] = useState(false);

 const submit = () => {
 if (!crop || !herb) return;
 const newChoices = [...choices, { crop, herb }];
 setChoices(newChoices);
 setShowReview(true);
 };

 const continueAfterReview = () => {
 setShowReview(false);
 setCrop(null); setHerb(null);
 if (year + 1 >= SEASONS_DATA.length) setDone(true);
 else setYear(y => y + 1);
 };

 const score = useMemo(() => {
 let pts = 0;
 const usedHerbs = choices.map(c => c.herb);
 const usedCrops = choices.map(c => c.crop);
 const uniqueHerbs = new Set(usedHerbs).size;
 const uniqueCrops = new Set(usedCrops).size;
 pts += uniqueHerbs * 2;
 pts += uniqueCrops * 2;
 const highRiskRepeats = usedHerbs.filter(h => h === 'gly' || h === 'als').length;
 pts -= highRiskRepeats > 1 ? (highRiskRepeats - 1) * 3 : 0;
 pts += usedHerbs.filter(h => h === 'multi').length * 2;
 choices.forEach(c => {
 const cropDef = CROPS_LIST.find(cr => cr.id === c.crop);
 if (cropDef?.compatible.includes(c.herb)) pts += 1;
 });
 return Math.max(0, pts);
 }, [choices]);

 const restart = () => { setYear(0); setChoices([]); setCrop(null); setHerb(null); setDone(false); setShowReview(false); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

 if (done) {
 addBadge({ gameId: 'herbicide-resistor', gameName: 'Herbicide Resistor', level: 'HS', score, total: 15 });
 return (
 <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
 <div className="max-w-lg mx-auto p-4 flex flex-col items-center justify-center min-h-full text-center">
 <Dna className="w-10 h-10 text-primary mb-3" />
 <h2 className="font-display font-bold text-2xl text-foreground mb-2">3-Year Plan Complete!</h2>
 <p className="text-foreground mb-2">Resistance Prevention Score: {score}</p>
 <div className="text-left bg-secondary/50 rounded-xl p-4 mb-4 max-w-sm w-full space-y-3">
 {choices.map((c, i) => (
 <div key={i} className="border-b border-border pb-2 last:border-0">
 <p className="text-sm font-bold text-foreground">Year {i + 1}: {CROPS_LIST.find(cr => cr.id === c.crop)?.name} + {HERBICIDES.find(h => h.id === c.herb)?.name}</p>
 <p className="text-xs text-muted-foreground mt-1">{getYearExplanation(c.crop, c.herb, i, choices)}</p>
 </div>
 ))}
 </div>
 <LevelComplete level={level} score={score} total={rounds?.length ?? 0} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
 </div>
 </div>
 );
 }

 if (showReview) {
 const lastChoice = choices[choices.length - 1];
 const explanation = getYearExplanation(lastChoice.crop, lastChoice.herb, choices.length - 1, choices);
 const cropDef = CROPS_LIST.find(c => c.id === lastChoice.crop);
 const herbDef = HERBICIDES.find(h => h.id === lastChoice.herb);
 const compatible = cropDef?.compatible.includes(lastChoice.herb);
 return (
 <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
 <div className="max-w-md w-full bg-card rounded-xl border border-border p-6">
 <h2 className="font-bold text-lg text-foreground mb-2">Year {choices.length} Review</h2>
 <p className="text-sm text-foreground mb-1">{cropDef?.name} + {herbDef?.name}</p>
 <div className={`p-3 rounded-lg mb-3 ${compatible ? 'bg-green-500/10 border border-green-500/30' : 'bg-destructive/10 border border-destructive/30'}`}>
 <p className="text-sm text-foreground">{explanation}</p>
 </div>
 <button onClick={continueAfterReview} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">
 {year + 1 >= SEASONS_DATA.length ? 'See Final Results' : `Continue to Year ${year + 2}`}
 </button>
 </div>
 </div>
 );
 }

 const s = SEASONS_DATA[year];
 return (
 <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
 <div className="max-w-lg mx-auto p-4">
 <div className="flex items-center gap-3 mb-4">
 <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
 <h1 className="font-display font-bold text-lg text-foreground">Herbicide Resistor</h1>
 <span className="ml-auto text-sm text-muted-foreground">Year {year + 1}/3</span>
 </div>
 <div className="bg-secondary/50 rounded-xl p-4 mb-4">
 <p className="text-sm text-foreground">{s.pressure}</p>
 </div>
 <p className="text-sm font-bold text-foreground mb-2">Choose your crop:</p>
 <div className="flex gap-2 mb-4">
 {CROPS_LIST.map(c => (
 <button key={c.id} onClick={() => setCrop(c.id)}
 className={`flex-1 p-3 rounded-xl border-2 text-center text-xs font-medium ${crop === c.id ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
 {c.name}
 </button>
 ))}
 </div>
 <p className="text-sm font-bold text-foreground mb-2">Choose your herbicide:</p>
 <div className="grid grid-cols-2 gap-2 mb-4">
 {HERBICIDES.map(h => (
 <button key={h.id} onClick={() => setHerb(h.id)}
 className={`p-3 rounded-xl border-2 text-center text-xs font-medium ${herb === h.id ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
 <p>{h.name}</p>
 <p className={`text-[10px] ${h.risk === 'high' ? 'text-destructive' : h.risk === 'low' ? 'text-amber-500' : 'text-green-600'}`}>
 Resistance risk: {h.risk}
 </p>
 </button>
 ))}
 </div>
 {crop && herb && <button onClick={submit} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Plant & Spray!</button>}
 </div>
 </div>
 );
}
