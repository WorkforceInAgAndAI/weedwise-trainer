import { useState, useMemo } from 'react';
import { Shield, Dna, FlaskConical, Sprout } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const MECHANISMS = [
 { id: 'physical', label: 'Physical Dormancy', Icon: Shield, desc: 'Hard seed coat prevents water absorption' },
 { id: 'physiological', label: 'Physiological Dormancy', Icon: Dna, desc: 'Internal hormones inhibit germination until conditions change' },
 { id: 'chemical', label: 'Chemical Dormancy', Icon: FlaskConical, desc: 'Chemical inhibitors prevent germination until leached out' },
 { id: 'morphological', label: 'Morphological Dormancy', Icon: Sprout, desc: 'Embryo not fully developed at seed maturity' },
];

const SCENARIOS = [
 { desc: "It's mid-winter and the soil is frozen solid. You need to survive until spring thaw.", best: 'physical', why: 'A tough seed coat protects you from freezing damage and mechanical stress until temperatures warm.' },
 { desc: 'Heavy rains have saturated the soil. Other seeds are germinating and dying from a late frost.', best: 'physiological', why: 'Internal hormone regulation keeps you dormant despite favorable moisture, waiting for consistent warmth.' },
 { desc: 'The soil is rich with allelopathic chemicals from a previous crop that kills young seedlings.', best: 'chemical', why: 'Your own chemical inhibitors keep you dormant until rain leaches the toxins from the surrounding soil.' },
 { desc: "You've just been shed from the parent plant in late summer. Other seeds that germinate now will die in winter.", best: 'morphological', why: 'Your embryo is still developing, forcing a delay that ensures germination in the optimal spring window.' },
 { desc: 'A farmer just tilled the field, burying you 6 inches deep with no light exposure.', best: 'physical', why: 'Your impermeable seed coat lets you persist in the soil seed bank for years until brought back to the surface.' },
 { desc: 'A hot, dry summer has parched the topsoil. Seeds germinating now will die of drought.', best: 'physiological', why: 'Hormonal regulation detects insufficient moisture signals and keeps germination suppressed until fall rains arrive.' },
 { desc: 'A wildfire just swept through the field, scorching the topsoil. You need to survive intense heat.', best: 'physical', why: 'A thick, heat-resistant seed coat insulates the embryo from fire damage, allowing germination after the burn.' },
 { desc: 'The field has been flooded for weeks. Oxygen levels in the soil are dangerously low.', best: 'chemical', why: 'Chemical inhibitors prevent germination in low-oxygen conditions, keeping you safe until floodwaters recede and soil aerates.' },
 { desc: 'You landed on bare rock with almost no soil. Nutrients are extremely scarce.', best: 'morphological', why: 'Your underdeveloped embryo delays germination until erosion or organic matter creates a viable micro-habitat.' },
 { desc: 'Herbicide was just sprayed across the field. Young seedlings are dying within days of emergence.', best: 'physiological', why: 'Hormonal dormancy prevents germination during the active herbicide window, letting you emerge after breakdown.' },
 { desc: 'Animals are actively foraging in the field, eating any seeds they find on the surface.', best: 'physical', why: "A hard seed coat lets you pass through an animal's digestive tract unharmed, dispersing you to new locations." },
 { desc: 'A cover crop has been planted, shading the soil and reducing light reaching the ground.', best: 'morphological', why: 'Your immature embryo keeps you dormant under shade until the cover crop is terminated and light returns.' },
];

export default function SleepySeeds({ onBack }: { onBack: () => void }) {
 const [level, setLevel] = useState(1);
 const { addBadge } = useGameProgress();

 const rounds = useMemo(() => {
  const pool = shuffle(SCENARIOS);
  const offset = ((level - 1) * 10) % pool.length;
  return pool.slice(offset).concat(pool).slice(0, 10);
 }, [level]);

  const seedWeeds = useMemo(() => {
   const pool = shuffle([...weeds].filter(w => w.id !== 'Field_Horsetail'));
   const offset = ((level - 1) * 10) % pool.length;
   return pool.slice(offset).concat(pool).slice(0, 10);
  }, [level]);

 const [idx, setIdx] = useState(0);
 const [phase, setPhase] = useState<'seedId' | 'dormancy'>('seedId');
 const [seedIdOptions, setSeedIdOptions] = useState<string[]>([]);
 const [seedIdAnswer, setSeedIdAnswer] = useState<string | null>(null);
 const [seedIdChecked, setSeedIdChecked] = useState(false);
 const [picked, setPicked] = useState<string | null>(null);
 const [answered, setAnswered] = useState(false);
 const [score, setScore] = useState(0);
 const done = idx >= rounds.length;

 useMemo(() => {
  if (idx < seedWeeds.length) {
   const correct = seedWeeds[idx];
   const others = shuffle(weeds.filter(w => w.id !== correct.id)).slice(0, 3);
   setSeedIdOptions(shuffle([correct, ...others]).map(w => w.id));
   setSeedIdAnswer(null);
   setSeedIdChecked(false);
  }
 }, [idx, seedWeeds]);

 const submitSeedId = (weedId: string) => {
  if (seedIdChecked) return;
  setSeedIdAnswer(weedId);
  setSeedIdChecked(true);
  if (weedId === seedWeeds[idx]?.id) setScore(s => s + 1);
 };

 const goToDormancy = () => { setPhase('dormancy'); setPicked(null); setAnswered(false); };

 const submitDormancy = (mId: string) => {
  if (answered) return;
  setPicked(mId);
  setAnswered(true);
  if (mId === rounds[idx].best) setScore(s => s + 1);
 };

 const next = () => { setIdx(i => i + 1); setPhase('seedId'); setPicked(null); setAnswered(false); };
 const restart = () => { setIdx(0); setPhase('seedId'); setPicked(null); setAnswered(false); setScore(0); };
 const nextLevel = () => { setLevel(l => l + 1); restart(); };
 const startOver = () => { setLevel(1); restart(); };

 if (done) {
  const total = rounds.length * 2;
  addBadge({ gameId: 'sleepy-seeds', gameName: 'Sleepy Seeds', level: 'HS', score, total });
  return (
   <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 text-center">
    <Shield className="w-10 h-10 text-primary mb-3" />
    <h2 className="font-display font-bold text-2xl text-foreground mb-2">Seeds Survived!</h2>
    <p className="text-foreground mb-6">Score: {score} / {total}</p>
    <LevelComplete level={level} score={score} total={total} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
   </div>
  );
 }

 const s = rounds[idx];
 const currentSeedWeed = seedWeeds[idx];

 if (phase === 'seedId' && currentSeedWeed) {
  return (
   <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
    <div className="max-w-lg mx-auto p-4">
     <div className="flex items-center gap-3 mb-4">
      <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
      <h1 className="font-display font-bold text-lg text-foreground">Sleepy Seeds</h1>
      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
      <span className="text-sm text-muted-foreground">{idx + 1}/{rounds.length}</span>
     </div>
     <p className="text-center text-sm text-muted-foreground mb-3">Identify which weed this seed belongs to:</p>
     <div className="flex justify-center mb-4">
      <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/30 bg-secondary">
       <WeedImage weedId={currentSeedWeed.id} stage="seed" className="w-full h-full object-cover" />
      </div>
     </div>
     <div className="grid grid-cols-2 gap-3 mb-4">
      {seedIdOptions.map(wId => {
       const w = weeds.find(x => x.id === wId);
       if (!w) return null;
       let cls = 'border-border bg-card';
       if (seedIdChecked && wId === currentSeedWeed.id) cls = 'border-green-500 bg-green-500/20';
       else if (seedIdChecked && wId === seedIdAnswer) cls = 'border-destructive bg-destructive/20';
       return (
        <button key={wId} onClick={() => submitSeedId(wId)}
         className={`p-3 rounded-xl border-2 text-center transition-all ${cls}`}>
         <div className="w-12 h-12 rounded-full overflow-hidden mx-auto mb-1 bg-secondary">
          <WeedImage weedId={wId} stage="plant" className="w-full h-full object-cover" />
         </div>
         <p className="text-xs font-bold text-foreground">{w.commonName}</p>
        </button>
       );
      })}
     </div>
     {seedIdChecked && (
      <div>
       <div className="bg-secondary/50 rounded-xl p-3 mb-3">
        <p className="text-sm text-foreground">
         {seedIdAnswer === currentSeedWeed.id
          ? `Correct! This seed belongs to ${currentSeedWeed.commonName}.`
          : `This seed belongs to ${currentSeedWeed.commonName}, not ${weeds.find(w => w.id === seedIdAnswer)?.commonName || 'unknown'}.`}
        </p>
       </div>
       <button onClick={goToDormancy} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Choose Dormancy Strategy</button>
      </div>
     )}
    </div>
   </div>
  );
 }

 return (
  <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
   <div className="max-w-lg mx-auto p-4">
    <div className="flex items-center gap-3 mb-4">
     <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
     <h1 className="font-display font-bold text-lg text-foreground">Sleepy Seeds</h1>
     <span className="text-sm text-muted-foreground ml-auto">{idx + 1}/{rounds.length}</span>
    </div>
    <p className="text-center text-sm text-muted-foreground mb-2">You are a {currentSeedWeed?.commonName} seed! Choose the best dormancy strategy to survive.</p>
    <div className="bg-secondary/50 rounded-xl p-4 mb-4">
     <p className="text-foreground text-sm">{s.desc}</p>
    </div>
    <div className="grid grid-cols-2 gap-3 mb-4">
     {MECHANISMS.map(m => {
      const MIcon = m.Icon;
      let cls = 'border-border bg-card';
      if (answered && m.id === s.best) cls = 'border-green-500 bg-green-500/20';
      else if (answered && m.id === picked) cls = 'border-destructive bg-destructive/20';
      return (
       <button key={m.id} onClick={() => submitDormancy(m.id)}
        className={`p-3 rounded-xl border-2 text-center transition-all ${cls}`}>
        <MIcon className="w-6 h-6 mx-auto mb-1 text-foreground" />
        <p className="text-xs font-bold text-foreground">{m.label}</p>
        <p className="text-[10px] text-muted-foreground">{m.desc}</p>
       </button>
      );
     })}
    </div>
    {answered && (
     <div>
      <div className="bg-secondary/50 rounded-xl p-3 mb-3"><p className="text-sm text-foreground">{s.why}</p></div>
      <button onClick={next} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Next</button>
     </div>
    )}
   </div>
  </div>
 );
}
