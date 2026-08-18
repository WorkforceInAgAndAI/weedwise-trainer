import { useState, useMemo } from 'react';
import { collegiateWeedsAll as weeds } from '@/data/gradeWeeds';
import { hasImage } from '@/lib/imageMap';
import WeedImage from '@/components/game/WeedImage';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';
import { getDifficulty } from '@/lib/difficulty';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

// Ligule-only descriptions per grass weed. Focused strictly on the ligule
// (and adjacent collar/auricle landmarks where relevant). No flower or seed info.
const LIGULE_DESC: Record<string, string> = {
  'giant-foxtail': 'Ligule is a fringe of long hairs (~2 mm) — no membrane.',
  'yellow-foxtail': 'Ligule is a dense ring of stiff hairs (~1 mm) at the leaf base.',
  'green-foxtail': 'Ligule is a short fringe of hairs — finer than yellow foxtail.',
  barnyardgrass: 'No ligule present — the leaf collar is bare. A key ID feature.',
  'large-crabgrass': 'Membranous ligule that is jagged/toothed at the top, ~1-2 mm tall.',
  Woolly_cupgrass: 'Ligule is a short membrane topped with a fringe of hairs.',
  Shattercane_Sorghums: 'Membranous ligule, short and rounded with no hair fringe.',
  johnsongrass: 'Membranous ligule, tall (~2-5 mm) with a finely-toothed margin.',
  Quackgrass: 'Short membranous ligule with clasping auricles at the collar.',
  Nimblewill: 'Short membranous ligule, less than 1 mm tall, finely fringed.',
  Downy_brome: 'Short membranous ligule, jagged-toothed, with a hairy sheath.',
  Foxtail_barley: 'Very short membranous ligule with small clasping auricles.',
  Goosegrass: 'Toothed membranous ligule on a flattened, silvery leaf sheath.',
  'annual-ryegrass': 'Short membranous ligule with narrow clasping auricles.',
  'wild-oat': 'Tall, pointed membranous ligule (~4-6 mm) — no auricles.',
  Longspine_sandbur: 'Ligule is a dense fringe of short hairs at the collar.',
  Smooth_Witchgrass: 'Ligule is a fringe of hairs on a hairless, smooth sheath.',
  Witchgrass: 'Ligule is a fringe of hairs above a densely hairy leaf sheath.',
};

function getLiguleText(weed: { id: string; traits?: string[] }) {
  return LIGULE_DESC[weed.id] || 'Examine the ligule shape (membrane vs. fringe of hairs) at the leaf base.';
}

export default function LiguleLens({ onBack }: { onBack: () => void }) {
 const [level, setLevel] = useState(1);
 const { addBadge } = useGameProgress();
 const d = useMemo(() => getDifficulty(level, 'ms'), [level]);
 // True grasses only — sedges (Cyperaceae, e.g. yellow nutsedge) have no ligule.
 // Pull from the FULL species list (not just the 6-8 curriculum subset) so
 // students see every grass in the collection, not the same three each time.
 const allGrasses = useMemo(() => {
  const grasses = weeds.filter(w => w.family === 'Poaceae');
  const withLigule = grasses.filter(w => hasImage(w.id, 'lig_1.jpg') || hasImage(w.id, 'lig_1.jpeg') || hasImage(w.id, 'lig_1.png'));
  return withLigule.length >= 6 ? withLigule : grasses;
 }, []);

 const rounds = useMemo(() => {
  const pool = shuffle(allGrasses);
  // Cycle through ALL grasses each level starting at a new offset so students
  // don't see the same species repeated across levels.
  const perLevel = Math.min(d.rounds, pool.length);
  const offset = ((level - 1) * perLevel) % pool.length;
  const selected = pool.slice(offset).concat(pool).slice(0, perLevel);
  return selected.map(w => {
   const wrongCount = Math.max(2, d.options - 1);
   const wrong = shuffle(allGrasses.filter(g => g.id !== w.id)).slice(0, wrongCount).map(g => g.commonName);
   return { weed: w, options: shuffle([w.commonName, ...wrong]) };
  });
 }, [level, allGrasses, d.rounds, d.options]);

 const [round, setRound] = useState(0);
 const [selected, setSelected] = useState('');
 const [answered, setAnswered] = useState(false);
 const [score, setScore] = useState(0);
 const [zoom, setZoom] = useState(1.75);

 const done = round >= rounds.length;
 const current = !done ? rounds[round] : null;

 const submit = (opt: string) => {
  if (answered) return;
  setSelected(opt);
  setAnswered(true);
  if (opt === current!.weed.commonName) setScore(s => s + 1);
 };

 const next = () => { setRound(r => r + 1); setSelected(''); setAnswered(false); setZoom(1.75); };
 const restart = () => { setRound(0); setScore(0); setSelected(''); setAnswered(false); setZoom(1.75); };
 const nextLevel = () => { setLevel(l => l + 1); restart(); };
 const startOver = () => { setLevel(1); restart(); };

 if (done) {
  addBadge({ gameId: 'ligule-lens', gameName: 'Ligule Lens', level: 'MS', score, total: rounds.length });
  return (
   <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50 dark:from-emerald-950 dark:via-sky-950 dark:to-slate-950 z-50 flex flex-col items-center justify-center p-6">
    <h2 className="text-2xl font-bold text-foreground mb-2">Great Work!</h2>
    <p className="text-lg text-foreground mb-6">{score}/{rounds.length} correct</p>
    <LevelComplete level={level} score={score} total={rounds.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} gradeLabel="6-8" />
   </div>
  );
 }

 return (
  <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50 dark:from-emerald-950 dark:via-sky-950 dark:to-slate-950 z-50 flex flex-col">
   <div className="flex items-center gap-3 p-4 border-b-2 border-emerald-200 dark:border-emerald-900 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
    <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
    <h1 className="font-bold text-foreground text-lg flex-1">Ligule Lens</h1>
    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
    <span className="text-sm text-muted-foreground">{round + 1}/{rounds.length}</span>
   </div>
   <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
    <p className="text-sm text-muted-foreground mb-2">Zoom in on the ligule — identify the grass!</p>
     <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full overflow-hidden bg-secondary mb-3 border-4 border-primary">
      <div className="w-full h-full transition-transform duration-200" style={{ transform: `scale(${zoom})` }}>
       <WeedImage weedId={current!.weed.id} stage="ligule" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 rounded-full border-4 border-primary/30 pointer-events-none" />
      {/* Crosshair to help students centre on the leaf collar */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
       <div className="w-10 h-px bg-primary/40" />
       <div className="h-10 w-px bg-primary/40 absolute" />
      </div>
     </div>
     <div className="flex items-center gap-2 mb-4">
      <button onClick={() => setZoom(z => Math.max(1, +(z - 0.25).toFixed(2)))}
       className="w-10 h-10 rounded-full border-2 border-border bg-card flex items-center justify-center text-foreground hover:border-primary"
       aria-label="Zoom out"><ZoomOut className="w-4 h-4" /></button>
      <input type="range" min={1} max={5} step={0.25} value={zoom}
       onChange={e => setZoom(Number(e.target.value))}
       className="w-40 accent-primary" aria-label="Zoom level" />
      <button onClick={() => setZoom(z => Math.min(5, +(z + 0.25).toFixed(2)))}
       className="w-10 h-10 rounded-full border-2 border-border bg-card flex items-center justify-center text-foreground hover:border-primary"
       aria-label="Zoom in"><ZoomIn className="w-4 h-4" /></button>
      <button onClick={() => setZoom(1.75)}
       className="w-10 h-10 rounded-full border-2 border-border bg-card flex items-center justify-center text-foreground hover:border-primary"
       aria-label="Reset zoom"><RotateCcw className="w-4 h-4" /></button>
      <span className="text-xs font-mono text-muted-foreground w-12 text-right">{zoom.toFixed(2)}x</span>
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
