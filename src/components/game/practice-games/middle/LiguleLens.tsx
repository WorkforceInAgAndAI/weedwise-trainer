import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

// Ligule-only descriptions per grass weed. Focused strictly on the ligule
// (and adjacent collar/auricle landmarks where relevant). No flower or seed info.
const LIGULE_DESC: Record<string, string> = {
  giant_foxtail: 'Ligule is a fringe of long hairs (~2 mm) — no membrane.',
  yellow_foxtail: 'Ligule is a dense ring of stiff hairs (~1 mm) at the leaf base.',
  green_foxtail: 'Ligule is a short fringe of hairs — finer than yellow foxtail.',
  barnyardgrass: 'No ligule present — the leaf collar is bare. A key ID feature.',
  large_crabgrass: 'Membranous ligule that is jagged/toothed at the top, ~1-2 mm tall.',
  smooth_crabgrass: 'Membranous ligule that is short, smooth, and rounded.',
  fall_panicum: 'Membranous ligule fringed with fine hairs along the upper edge.',
  woolly_cupgrass: 'Ligule is a short membrane topped with a fringe of hairs.',
  shattercane: 'Membranous ligule, short and rounded with no hair fringe.',
  johnsongrass: 'Membranous ligule, tall (~2-5 mm) with a finely-toothed margin.',
  quackgrass: 'Short membranous ligule with clasping auricles at the collar.',
  wirestem_muhly: 'Short membranous ligule, less than 1 mm tall.',
  yellow_nutsedge: 'No true ligule — sedge has a triangular stem (sedges have edges).',
  purple_nutsedge: 'No true ligule — sedge with triangular stem (not a true grass).',
};

function getLiguleText(weed: { id: string; traits?: string[] }) {
  return LIGULE_DESC[weed.id] || 'Examine the ligule shape (membrane vs. fringe of hairs) at the leaf base.';
}

export default function LiguleLens({ onBack }: { onBack: () => void }) {
 const [level, setLevel] = useState(1);
 const { addBadge } = useGameProgress();
 const allGrasses = useMemo(() => weeds.filter(w => w.plantType === 'Monocot'), []);

 const rounds = useMemo(() => {
  const pool = shuffle(allGrasses);
  const offset = ((level - 1) * 8) % pool.length;
  const selected = pool.slice(offset).concat(pool).slice(0, Math.min(8, pool.length));
  return selected.map(w => {
   const wrong = shuffle(allGrasses.filter(g => g.id !== w.id)).slice(0, 3).map(g => g.commonName);
   return { weed: w, options: shuffle([w.commonName, ...wrong]) };
  });
 }, [level, allGrasses]);

 const [round, setRound] = useState(0);
 const [selected, setSelected] = useState('');
 const [answered, setAnswered] = useState(false);
 const [score, setScore] = useState(0);

 const done = round >= rounds.length;
 const current = !done ? rounds[round] : null;

 const submit = (opt: string) => {
  if (answered) return;
  setSelected(opt);
  setAnswered(true);
  if (opt === current!.weed.commonName) setScore(s => s + 1);
 };

 const next = () => { setRound(r => r + 1); setSelected(''); setAnswered(false); };
 const restart = () => { setRound(0); setScore(0); setSelected(''); setAnswered(false); };
 const nextLevel = () => { setLevel(l => l + 1); restart(); };
 const startOver = () => { setLevel(1); restart(); };

 if (done) {
  addBadge({ gameId: 'ligule-lens', gameName: 'Ligule Lens', level: 'MS', score, total: rounds.length });
  return (
   <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
    <h2 className="text-2xl font-bold text-foreground mb-2">Great Work!</h2>
    <p className="text-lg text-foreground mb-6">{score}/{rounds.length} correct</p>
    <LevelComplete level={level} score={score} total={rounds.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
   </div>
  );
 }

 return (
  <div className="fixed inset-0 bg-background z-50 flex flex-col">
   <div className="flex items-center gap-3 p-4 border-b border-border">
    <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
    <h1 className="font-bold text-foreground text-lg flex-1">Ligule Lens</h1>
    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
    <span className="text-sm text-muted-foreground">{round + 1}/{rounds.length}</span>
   </div>
   <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
    <p className="text-sm text-muted-foreground mb-2">Zoom in on the ligule — identify the grass!</p>
     <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full overflow-hidden bg-secondary mb-4 border-4 border-primary">
      <WeedImage weedId={current!.weed.id} stage="ligule" className="w-full h-full object-cover scale-[1.75]" />
      <div className="absolute inset-0 rounded-full border-4 border-primary/30" />
     </div>
    <p className="text-xs text-muted-foreground mb-4 max-w-md text-center"><span className="font-semibold text-foreground">Ligule:</span> {getLiguleText(current!.weed)}</p>
    <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
     {current!.options.map(opt => {
      const isCorrect = opt === current!.weed.commonName;
      const bg = !answered ? 'border-border bg-card hover:border-primary' :
       opt === selected ? (isCorrect ? 'border-green-500 bg-green-500/20' : 'border-destructive bg-destructive/20') :
       isCorrect ? 'border-green-500 bg-green-500/20' : 'border-border bg-card';
      return (
       <button key={opt} onClick={() => submit(opt)}
        className={`p-3 rounded-lg border-2 text-sm font-medium text-foreground transition-all ${bg}`}>
        {opt}
       </button>
      );
     })}
    </div>
    {answered && (
     <button onClick={next} className="mt-4 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next</button>
    )}
   </div>
        <FloatingCoach grade="6-8" tip={`Grass ID lives in the ligule, auricles, and collar. Look closely at the leaf base.`} />
</div>
 );
}
