import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { Leaf } from 'lucide-react';
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

const MANAGE_METHODS = [
 { id: 'pre', label: 'Pre-emergent Herbicide' },
 { id: 'post', label: 'Post-emergent Herbicide' },
 { id: 'cultivate', label: 'Cultivation' },
 { id: 'pull', label: 'Hand Pull' },
];

function getBestManage(w: typeof weeds[0]): string {
 const m = w.management.toLowerCase();
 if (m.includes('pre')) return 'pre';
 if (m.includes('post')) return 'post';
 if (m.includes('cultivat')) return 'cultivate';
 return 'pull';
}

function getIdealDecision(severity: number, threshold: number): 'treat' | 'wait' {
 return severity > threshold ? 'treat' : 'wait';
}

export default function FormYourFarm({ onBack }: { onBack: () => void }) {
 const [level, setLevel] = useState(1);
 const { addBadge } = useGameProgress();
 const [phase, setPhase] = useState<'design' | 'attack' | 'manage' | 'review'>('design');
 const [crop, setCrop] = useState(CROPS[0]);
 const [season, setSeason] = useState(SEASONS[0]);
 const [threshold, setThreshold] = useState(10);
 const [decisions, setDecisions] = useState<Record<string, 'treat' | 'wait'>>({});
 const [manageDecisions, setManageDecisions] = useState<Record<string, string>>({});

 const attackWeeds = useMemo(() => {
  const pool = shuffle(weeds);
  const offset = ((level - 1) * 12) % pool.length;
  const selected = pool.slice(offset).concat(pool).slice(0, 12);
  // Ensure some are above threshold
  return selected.map((w, i) => {
   let severity: number;
   if (i < 4) {
    // Force above threshold
    severity = threshold + Math.floor(Math.random() * 10) + 1;
   } else {
    severity = Math.floor(Math.random() * 20) + 1;
   }
   return { weed: w, severity };
  });
 }, [level, threshold]);

 const startAttack = () => setPhase('attack');
 const decide = (wId: string, d: 'treat' | 'wait') => setDecisions(prev => ({ ...prev, [wId]: d }));
 const allDecided = Object.keys(decisions).length === attackWeeds.length;

 const weedsToTreat = attackWeeds.filter(aw => decisions[aw.weed.id] === 'treat');
 const allManaged = Object.keys(manageDecisions).length === weedsToTreat.length;

 const goToManage = () => {
  if (weedsToTreat.length > 0) {
   setPhase('manage');
  } else {
   setPhase('review');
  }
 };

 const setManage = (wId: string, mId: string) => setManageDecisions(prev => ({ ...prev, [wId]: mId }));

 const evaluate = () => setPhase('review');

 const results = useMemo(() => {
  return attackWeeds.map(aw => {
   const ideal = getIdealDecision(aw.severity, threshold);
   const userChoice = decisions[aw.weed.id];
   const correct = userChoice === ideal;
   const managePick = manageDecisions[aw.weed.id];
   const bestManage = getBestManage(aw.weed);
   const manageCorrect = managePick === bestManage;
   return { ...aw, ideal, userChoice, correct, managePick, bestManage, manageCorrect };
  });
 }, [attackWeeds, decisions, threshold, manageDecisions]);

 const score = results.filter(r => r.correct).length + results.filter(r => r.managePick && r.manageCorrect).length;
 const total = attackWeeds.length + weedsToTreat.length;

 const restart = () => { setPhase('design'); setDecisions({}); setManageDecisions({}); };
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

 if (phase === 'manage') {
  return (
   <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
    <div className="max-w-lg mx-auto p-4">
     <div className="flex items-center gap-3 mb-4">
      <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
      <h1 className="font-display font-bold text-lg text-foreground">Manage Weeds</h1>
     </div>
     <p className="text-sm text-muted-foreground text-center mb-3">Choose a management method for each weed you decided to treat:</p>
     <div className="grid gap-3">
      {weedsToTreat.map(aw => (
       <div key={aw.weed.id} className="bg-card border border-border rounded-xl p-3">
        <div className="flex items-center gap-3 mb-2">
         <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
          <WeedImage weedId={aw.weed.id} stage="plant" className="w-full h-full object-cover" />
         </div>
         <div>
          <p className="text-sm font-bold text-foreground">{aw.weed.commonName}</p>
          <p className="text-[10px] text-muted-foreground">Density: {aw.severity}/acre</p>
         </div>
        </div>
        <div className="grid grid-cols-2 gap-1">
         {MANAGE_METHODS.map(m => (
          <button key={m.id} onClick={() => setManage(aw.weed.id, m.id)}
           className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-all ${manageDecisions[aw.weed.id] === m.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'}`}>
           {m.label}
          </button>
         ))}
        </div>
       </div>
      ))}
     </div>
     {allManaged && <button onClick={evaluate} className="mt-4 w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Evaluate Season</button>}
    </div>
   </div>
  );
 }

  if (phase === 'review') {
   addBadge({ gameId: 'form-farm', gameName: 'Form Your Farm', level: 'HS', score, total });
   const wrongDecisions = results.filter(r => !r.correct);
   const wrongManage = results.filter(r => r.managePick && !r.manageCorrect);
   return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
     <div className="max-w-lg mx-auto p-4">
      <div className="flex items-center gap-3 mb-4">
       <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
       <h1 className="font-display font-bold text-lg text-foreground">Season Results</h1>
      </div>
      <div className="bg-card rounded-xl border border-border p-4 mb-4 text-center">
       <Leaf className="w-8 h-8 text-primary mx-auto mb-2" />
       <p className="font-bold text-foreground text-xl">{score}/{total} correct</p>
       <p className="text-sm text-muted-foreground">Crop: {crop.name} -- Season: {season.name} -- Threshold: {threshold}/acre</p>
      </div>

      {wrongDecisions.length > 0 && (
       <div className="mb-4">
        <p className="text-sm font-bold text-foreground mb-2">Threshold decisions to review:</p>
        <div className="space-y-2">
         {wrongDecisions.map(r => (
          <div key={`dec-${r.weed.id}`} className="p-3 rounded-xl border-2 border-destructive bg-destructive/5">
           <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
             <WeedImage weedId={r.weed.id} stage="plant" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
             <p className="text-sm font-bold text-foreground">{r.weed.commonName}</p>
             <p className="text-[10px] text-muted-foreground">Density: {r.severity}/acre (Threshold: {threshold}/acre)</p>
             <p className="text-xs text-destructive">You chose: {r.userChoice} -- Best: {r.ideal}</p>
             <p className="text-[10px] text-muted-foreground mt-1">
              {r.ideal === 'treat' ? `At ${r.severity}/acre, this exceeds your threshold of ${threshold} and should be treated.` : `At ${r.severity}/acre, this is below your threshold -- waiting is the economical choice.`}
             </p>
            </div>
           </div>
          </div>
         ))}
        </div>
       </div>
      )}

      {wrongManage.length > 0 && (
       <div className="mb-4">
        <p className="text-sm font-bold text-foreground mb-2">Management methods to review:</p>
        <div className="space-y-2">
         {wrongManage.map(r => (
          <div key={`mgmt-${r.weed.id}`} className="p-3 rounded-xl border-2 border-destructive bg-destructive/5">
           <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
             <WeedImage weedId={r.weed.id} stage="plant" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
             <p className="text-sm font-bold text-foreground">{r.weed.commonName}</p>
             <p className="text-xs text-destructive">You chose: {MANAGE_METHODS.find(m => m.id === r.managePick)?.label}</p>
             <p className="text-xs text-green-600">Best: {MANAGE_METHODS.find(m => m.id === r.bestManage)?.label}</p>
             <p className="text-[10px] text-muted-foreground mt-1">{r.weed.management}</p>
            </div>
           </div>
          </div>
         ))}
        </div>
       </div>
      )}

      <div className="space-y-3 mb-4">
       <p className="text-sm font-bold text-foreground">All decisions:</p>
       {results.map(r => (
        <div key={r.weed.id} className={`p-3 rounded-xl border-2 ${r.correct && (!r.managePick || r.manageCorrect) ? 'border-green-500 bg-green-500/5' : 'border-destructive bg-destructive/5'}`}>
         <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
           <WeedImage weedId={r.weed.id} stage="plant" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
           <p className="text-sm font-bold text-foreground">{r.weed.commonName}</p>
           <p className="text-[10px] text-muted-foreground">Density: {r.severity}/acre</p>
          </div>
          <div className="text-right">
           <p className={`text-xs font-bold ${r.correct ? 'text-green-500' : 'text-destructive'}`}>
            {r.userChoice} {r.correct ? '(correct)' : `(best: ${r.ideal})`}
           </p>
           {r.managePick && (
            <p className={`text-[10px] ${r.manageCorrect ? 'text-green-500' : 'text-destructive'}`}>
             {MANAGE_METHODS.find(m => m.id === r.managePick)?.label} {r.manageCorrect ? '(correct)' : `(best: ${MANAGE_METHODS.find(m => m.id === r.bestManage)?.label})`}
            </p>
           )}
          </div>
         </div>
        </div>
       ))}
      </div>
      <LevelComplete level={level} score={score} total={total} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
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
         className={`px-3 py-1 rounded-lg text-xs font-bold ${decisions[aw.weed.id] === 'treat' ? 'bg-destructive text-destructive-foreground' : 'bg-secondary text-foreground'}`}>Treat</button>
        <button onClick={() => decide(aw.weed.id, 'wait')}
         className={`px-3 py-1 rounded-lg text-xs font-bold ${decisions[aw.weed.id] === 'wait' ? 'bg-green-500 text-primary-foreground' : 'bg-secondary text-foreground'}`}>Wait</button>
       </div>
      </div>
     ))}
    </div>
    {allDecided && <button onClick={goToManage} className="mt-4 w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Continue</button>}
   </div>
  </div>
 );
}
