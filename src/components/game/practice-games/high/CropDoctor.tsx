import { useState, useMemo } from 'react';
import { Stethoscope } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const CASES = [
 { crop: 'Corn', symptom: 'White/bleached new growth, stunted plants', correct: 'HPPD Inhibitor injury (Group 27)', options: ['HPPD Inhibitor injury (Group 27)', 'ALS Inhibitor injury (Group 2)', 'Growth Regulator injury (Group 4)', 'PPO Inhibitor injury (Group 14)'], treatment: 'Irrigate to dilute, apply foliar micronutrients. Plants usually recover within 2 weeks.', reward: 500 },
 { crop: 'Soybean', symptom: 'Bronzing and necrotic spots on leaves appearing 2-3 days after spray', correct: 'PPO Inhibitor injury (Group 14)', options: ['PPO Inhibitor injury (Group 14)', 'Glyphosate injury (Group 9)', 'ACCase Inhibitor injury (Group 1)', 'ALS Inhibitor injury (Group 2)'], treatment: 'Damage is cosmetic if caught early. Monitor new growth for recovery.', reward: 400 },
 { crop: 'Wheat', symptom: 'Yellowing between leaf veins (interveinal chlorosis) on older leaves', correct: 'PSII Inhibitor injury (Group 5)', options: ['PSII Inhibitor injury (Group 5)', 'HPPD Inhibitor injury (Group 27)', 'PPO Inhibitor injury (Group 14)', 'ACCase Inhibitor injury (Group 1)'], treatment: 'Apply nitrogen foliar feed. Reduce herbicide rate on next application.', reward: 450 },
 { crop: 'Corn', symptom: 'Onion-leafing, roots wrapped around coleoptile, brace root malformation', correct: 'Growth Regulator injury (Group 4)', options: ['Growth Regulator injury (Group 4)', 'ALS Inhibitor injury (Group 2)', 'Glyphosate injury (Group 9)', 'HPPD Inhibitor injury (Group 27)'], treatment: 'No treatment available. Avoid Group 4 applications near corn emergence windows.', reward: 600 },
 { crop: 'Soybean', symptom: 'Stunting with shortened internodes, yellow/purple coloring on veins', correct: 'ALS Inhibitor injury (Group 2)', options: ['ALS Inhibitor injury (Group 2)', 'PPO Inhibitor injury (Group 14)', 'Glyphosate injury (Group 9)', 'Growth Regulator injury (Group 4)'], treatment: 'Check soil pH — high pH increases carryover. Apply activated charcoal if early.', reward: 550 },
];

export default function CropDoctor({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
 const { addBadge } = useGameProgress();
 const rounds = useMemo(() => shuffle(CASES).slice(0, 4).map(c => ({ ...c, options: shuffle(c.options) })), []);
 const [idx, setIdx] = useState(0);
 const [picked, setPicked] = useState<string | null>(null);
 const [answered, setAnswered] = useState(false);
 const [money, setMoney] = useState(0);
 const done = idx >= rounds.length;

 const submit = (opt: string) => { if (answered) return; setPicked(opt); setAnswered(true); if (opt === rounds[idx].correct) setMoney(m => m + rounds[idx].reward); };
 const next = () => { setIdx(i => i + 1); setPicked(null); setAnswered(false); };
 const restart = () => { setIdx(0); setPicked(null); setAnswered(false); setMoney(0); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

 if (done) {
 const correctCount = rounds.filter((r, i) => {
 // Approximate: we track money, so calculate
 return true; // Badge based on money
 }).length;
 addBadge({ gameId: 'crop-doctor', gameName: 'Crop Doctor', level: 'HS', score: Math.round(money / 500), total: rounds.length });
 return (
 <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 text-center">
 <Stethoscope className="w-10 h-10 text-primary mb-3" />
 <h2 className="font-display font-bold text-2xl text-foreground mb-2">Diagnosis Complete!</h2>
 <p className="text-foreground mb-6">Earned: ${money.toLocaleString()}</p>
 <LevelComplete level={level} score={score} total={rounds?.length ?? 0} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
 </div>
 );
 }

 const c = rounds[idx];
 return (
 <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
 <div className="max-w-lg mx-auto p-4">
 <div className="flex items-center gap-3 mb-4">
 <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
 <h1 className="font-display font-bold text-lg text-foreground">Crop Doctor</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
 <span className="ml-auto text-sm font-bold text-green-600">${money}</span>
 </div>
 <div className="bg-secondary/50 rounded-xl p-4 mb-4 text-center">
 <p className="text-lg font-bold text-foreground mb-2">{c.crop}</p>
 <p className="text-sm text-foreground font-medium">Symptom: {c.symptom}</p>
 </div>
 <p className="text-sm text-muted-foreground text-center mb-3">What caused this injury?</p>
 <div className="grid gap-2">
 {c.options.map(opt => {
 let cls = 'border-border bg-card';
 if (answered && opt === c.correct) cls = 'border-green-500 bg-green-500/20';
 else if (answered && opt === picked) cls = 'border-destructive bg-destructive/20';
 return (
 <button key={opt} onClick={() => submit(opt)} className={`p-3 rounded-xl border-2 text-left text-sm font-medium transition-all ${cls}`}>{opt}</button>
 );
 })}
 </div>
 {answered && (
 <div>
 <div className="bg-secondary/50 rounded-xl p-3 mt-3 mb-3">
 <p className="text-xs font-bold text-foreground mb-1">Treatment:</p>
 <p className="text-sm text-foreground">{c.treatment}</p>
 {picked === c.correct && <p className="text-xs text-green-600 mt-1">+${c.reward} earned!</p>}
 </div>
 <button onClick={next} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Next Case</button>
 </div>
 )}
 </div>
 </div>
 );
}
