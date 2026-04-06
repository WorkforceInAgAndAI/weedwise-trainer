import { useState, useMemo } from 'react';
import { Stethoscope } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const CORN_CASES = [
 { crop: 'Corn', symptom: 'Onion-leafing, roots wrapped around coleoptile, brace root malformation', correct: '2,4-D (Group 4)', options: ['2,4-D (Group 4)', 'Mesotrione / Callisto (Group 27)', 'S-metolachlor / Dual II Magnum (Group 15)', 'Pendimethalin / Prowl (Group 3)'], treatment: 'No treatment available. Avoid Group 4 applications near corn emergence windows.', reward: 500 },
 { crop: 'Corn', symptom: 'Yellowing between veins on newest leaves, white leaf midribs, stunted growth', correct: 'Mesotrione / Callisto (Group 27)', options: ['Mesotrione / Callisto (Group 27)', '2,4-D (Group 4)', 'Acetochlor / Harness (Group 15)', 'Isoxaflutole / Balance Flexx (Group 27)'], treatment: 'Irrigate to dilute, apply foliar micronutrients. Plants usually recover within 2 weeks.', reward: 450 },
 { crop: 'Corn', symptom: 'Purple leaf margins and interveinal reddening in early growth stages', correct: 'S-metolachlor / Dual II Magnum (Group 15)', options: ['S-metolachlor / Dual II Magnum (Group 15)', 'Dicamba / Clarity (Group 4)', '2,4-D (Group 4)', 'Pendimethalin / Prowl (Group 3)'], treatment: 'Damage is typically cosmetic. Monitor new growth for recovery. Reduce rate if reapplying.', reward: 400 },
 { crop: 'Corn', symptom: 'Leaf "buggy-whipping," tightly rolled whorls that fail to unfurl properly', correct: 'Acetochlor / Harness (Group 15)', options: ['Acetochlor / Harness (Group 15)', 'Mesotrione / Callisto (Group 27)', 'Isoxaflutole / Balance Flexx (Group 27)', '2,4-D (Group 4)'], treatment: 'Plants often grow out of this. Avoid overlapping applications of Group 15 herbicides.', reward: 450 },
 { crop: 'Corn', symptom: 'Brittle stalks, malformed ear shoots, barren tips', correct: 'Dicamba / Clarity (Group 4)', options: ['Dicamba / Clarity (Group 4)', '2,4-D (Group 4)', 'S-metolachlor / Dual II Magnum (Group 15)', 'Pendimethalin / Prowl (Group 3)'], treatment: 'No treatment. Avoid dicamba applications after V5 corn to prevent ear malformation.', reward: 550 },
 { crop: 'Corn', symptom: 'Bleached or white leaves emerging from the whorl, dying if severe', correct: 'Isoxaflutole / Balance Flexx (Group 27)', options: ['Isoxaflutole / Balance Flexx (Group 27)', 'Mesotrione / Callisto (Group 27)', 'Acetochlor / Harness (Group 15)', 'Dicamba / Clarity (Group 4)'], treatment: 'Severe bleaching can kill tissue. Reduce rates on sandy soils with low organic matter.', reward: 500 },
 { crop: 'Corn', symptom: 'Root pruning, short stubby roots, poor water uptake', correct: 'Pendimethalin / Prowl (Group 3)', options: ['Pendimethalin / Prowl (Group 3)', 'S-metolachlor / Dual II Magnum (Group 15)', '2,4-D (Group 4)', 'Acetochlor / Harness (Group 15)'], treatment: 'Irrigate to move herbicide below root zone. Root recovery occurs as plants grow deeper.', reward: 500 },
];

const SOYBEAN_CASES = [
 { crop: 'Soybean', symptom: 'Puckered and cupped upper leaves, ruffled margins', correct: 'Dicamba / XtendiMax (Group 4)', options: ['Dicamba / XtendiMax (Group 4)', '2,4-D / Enlist One (Group 4)', 'Fomesafen / Flexstar (Group 14)', 'Flumioxazin / Valor (Group 14)'], treatment: 'Monitor new growth. Dicamba injury on tolerant beans is cosmetic; non-tolerant beans may suffer yield loss.', reward: 500 },
 { crop: 'Soybean', symptom: 'Leaf chlorosis at edges moving inward, necrosis at tips', correct: 'Fomesafen / Flexstar (Group 14)', options: ['Fomesafen / Flexstar (Group 14)', 'Dicamba / XtendiMax (Group 4)', 'Atrazine / Aatrex (Group 5) carryover', 'Paraquat / Gramoxone (Group 22)'], treatment: 'Damage is cosmetic if caught early. Monitor new growth for recovery.', reward: 400 },
 { crop: 'Soybean', symptom: 'Crinkled trifoliates, petioles bent downward (epinasty), shortened internodes', correct: '2,4-D / Enlist One (Group 4)', options: ['2,4-D / Enlist One (Group 4)', 'Dicamba / XtendiMax (Group 4)', 'S-metolachlor / Dual II Magnum (Group 15)', 'Fomesafen / Flexstar (Group 14)'], treatment: 'Epinasty from 2,4-D is usually reversible. Avoid spraying near non-tolerant soybeans.', reward: 450 },
 { crop: 'Soybean', symptom: 'Whitish or bleached new growth', correct: 'Mesotrione / Callisto (Group 27) drift', options: ['Mesotrione / Callisto (Group 27) drift', 'Fomesafen / Flexstar (Group 14)', 'Atrazine / Aatrex (Group 5) carryover', 'Flumioxazin / Valor (Group 14)'], treatment: 'Bleaching from HPPD drift usually resolves. Plants green up as new growth emerges.', reward: 450 },
 { crop: 'Soybean', symptom: 'Stunted plants, swollen hypocotyls, cracked stems at soil line', correct: 'S-metolachlor / Dual II Magnum (Group 15)', options: ['S-metolachlor / Dual II Magnum (Group 15)', '2,4-D / Enlist One (Group 4)', 'Flumioxazin / Valor (Group 14)', 'Paraquat / Gramoxone (Group 22)'], treatment: 'Avoid heavy rates on coarse-textured soils. Replanting may be needed in severe cases.', reward: 500 },
 { crop: 'Soybean', symptom: 'Interveinal chlorosis, necrotic spotting on lower leaves', correct: 'Atrazine / Aatrex (Group 5) carryover', options: ['Atrazine / Aatrex (Group 5) carryover', 'Fomesafen / Flexstar (Group 14)', 'Mesotrione / Callisto (Group 27) drift', 'Dicamba / XtendiMax (Group 4)'], treatment: 'Check soil pH — high pH increases atrazine carryover. Apply activated charcoal if early.', reward: 550 },
 { crop: 'Soybean', symptom: 'Necrotic leaf margins after rain, sunburn-like lesions', correct: 'Paraquat / Gramoxone (Group 22)', options: ['Paraquat / Gramoxone (Group 22)', 'Fomesafen / Flexstar (Group 14)', 'Atrazine / Aatrex (Group 5) carryover', 'Dicamba / XtendiMax (Group 4)'], treatment: 'Paraquat is contact-only. New growth should be clean. Ensure burndown timing is correct.', reward: 500 },
 { crop: 'Soybean', symptom: 'Distorted cotyledons, poor stand establishment', correct: 'Flumioxazin / Valor (Group 14)', options: ['Flumioxazin / Valor (Group 14)', 'S-metolachlor / Dual II Magnum (Group 15)', 'Paraquat / Gramoxone (Group 22)', '2,4-D / Enlist One (Group 4)'], treatment: 'Ensure proper application timing relative to planting. Avoid shallow planting depths.', reward: 450 },
];

const ALL_CASES = [...CORN_CASES, ...SOYBEAN_CASES];

export default function CropDoctor({ onBack }: { onBack: () => void }) {
 const [level, setLevel] = useState(1);
 const { addBadge } = useGameProgress();
 const rounds = useMemo(() => shuffle(ALL_CASES).slice(0, 8).map(c => ({ ...c, options: shuffle(c.options) })), [level]);
 const [idx, setIdx] = useState(0);
 const [picked, setPicked] = useState<string | null>(null);
 const [answered, setAnswered] = useState(false);
 const [money, setMoney] = useState(0);
 const [correctCount, setCorrectCount] = useState(0);
 const [results, setResults] = useState<{ case_: typeof ALL_CASES[0]; correct: boolean; picked: string }[]>([]);
 const done = idx >= rounds.length;

 const submit = (opt: string) => {
  if (answered) return;
  setPicked(opt);
  setAnswered(true);
  const correct = opt === rounds[idx].correct;
  if (correct) { setMoney(m => m + rounds[idx].reward); setCorrectCount(c => c + 1); }
  setResults(prev => [...prev, { case_: rounds[idx], correct, picked: opt }]);
 };
 const next = () => { setIdx(i => i + 1); setPicked(null); setAnswered(false); };
 const restart = () => { setIdx(0); setPicked(null); setAnswered(false); setMoney(0); setCorrectCount(0); setResults([]); };
 const nextLevel = () => { setLevel(l => l + 1); restart(); };
 const startOver = () => { setLevel(1); restart(); };

 if (done) {
  addBadge({ gameId: 'crop-doctor', gameName: 'Crop Doctor', level: 'HS', score: correctCount, total: rounds.length });
  const wrongResults = results.filter(r => !r.correct);
  return (
   <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
    <div className="max-w-lg mx-auto p-4 flex flex-col items-center">
     <Stethoscope className="w-10 h-10 text-primary mb-3" />
     <h2 className="font-display font-bold text-2xl text-foreground mb-2">Diagnosis Complete!</h2>
     <p className="text-foreground mb-1">Score: {correctCount}/{rounds.length}</p>
     <p className="text-muted-foreground mb-4">Earned: ${money.toLocaleString()}</p>
     {wrongResults.length > 0 && (
      <div className="w-full space-y-2 mb-4">
       <p className="text-sm text-muted-foreground text-center">Review incorrect diagnoses:</p>
       {wrongResults.map((r, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-3">
         <p className="text-sm font-bold text-foreground">{r.case_.crop}: {r.case_.symptom.slice(0, 60)}...</p>
         <p className="text-xs text-destructive">You: {r.picked}</p>
         <p className="text-xs text-green-600">Correct: {r.case_.correct}</p>
         <p className="text-[10px] text-muted-foreground mt-1">{r.case_.treatment}</p>
        </div>
       ))}
      </div>
     )}
     <LevelComplete level={level} score={correctCount} total={rounds.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
    </div>
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
     <span className="text-sm font-bold text-green-600">${money}</span>
    </div>
    <p className="text-xs text-muted-foreground text-center mb-2">Question {idx + 1} of {rounds.length}</p>
    <div className="bg-secondary/50 rounded-xl p-4 mb-4 text-center">
     <p className="text-lg font-bold text-foreground mb-2">{c.crop}</p>
     <p className="text-sm text-foreground font-medium">Symptom: {c.symptom}</p>
    </div>
    <p className="text-sm text-muted-foreground text-center mb-3">Which herbicide likely caused this injury?</p>
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
