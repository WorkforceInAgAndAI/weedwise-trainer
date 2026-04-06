import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { Layers } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface TowerLevel { question: string; options: [string, string]; correct: number; }

function buildTower(target: typeof weeds[0]): TowerLevel[] {
 const levels: TowerLevel[] = [];
 levels.push({ question: 'Kingdom?', options: ['Plantae', 'Fungi'], correct: 0 });
 const isMono = target.plantType === 'Monocot';
 levels.push({ question: 'Class?', options: isMono ? ['Monocotyledon', 'Dicotyledon'] : ['Dicotyledon', 'Monocotyledon'], correct: 0 });
 levels.push({ question: 'Division?', options: ['Flowering (Angiosperm)', 'Non-flowering'], correct: 0 });
 const families = [...new Set(weeds.map(w => w.family))];
 const wrongFam = shuffle(families.filter(f => f !== target.family))[0] || 'Unknown';
 const famOpts = shuffle([target.family, wrongFam]) as [string, string];
 levels.push({ question: 'Family?', options: famOpts, correct: famOpts.indexOf(target.family) });
 const species = target.scientificName;
 const wrongSp = shuffle(weeds.filter(w => w.family === target.family && w.id !== target.id))[0]?.scientificName
  || shuffle(weeds.filter(w => w.id !== target.id))[0]?.scientificName || 'Unknown species';
 const spOpts = shuffle([species, wrongSp]) as [string, string];
 levels.push({ question: 'Species?', options: spOpts, correct: spOpts.indexOf(species) });
 return levels;
}

export default function TaxonomyTower({ onBack }: { onBack: () => void }) {
 const [gameLevel, setGameLevel] = useState(1);
 const { addBadge } = useGameProgress();
 const targets = useMemo(() => {
  const pool = shuffle(weeds);
  const offset = ((gameLevel - 1) * 5) % pool.length;
  return pool.slice(offset).concat(pool).slice(0, 5);
 }, [gameLevel]);
 const [tIdx, setTIdx] = useState(0);
 const tower = useMemo(() => buildTower(targets[tIdx % targets.length]), [tIdx, targets]);
 const [towerLevel, setTowerLevel] = useState(0);
 const [wrong, setWrong] = useState(false);
 const [score, setScore] = useState(0);
 const done = tIdx >= targets.length;

 const choose = (i: number) => {
  if (i === tower[towerLevel].correct) {
   setWrong(false);
   if (towerLevel + 1 >= tower.length) { setScore(s => s + 1); setTIdx(t => t + 1); setTowerLevel(0); }
   else setTowerLevel(l => l + 1);
  } else setWrong(true);
 };

 const restart = () => { setTIdx(0); setTowerLevel(0); setScore(0); setWrong(false); };
 const nextLevel = () => { setGameLevel(l => l + 1); restart(); };
 const startOver = () => { setGameLevel(1); restart(); };

 if (done) {
  addBadge({ gameId: 'hs-taxonomy', gameName: 'Taxonomy Tower', level: 'HS', score, total: targets.length });
  return (
   <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 text-center">
    <Layers className="w-10 h-10 text-primary mb-3" />
    <h2 className="font-display font-bold text-2xl text-foreground mb-2">Pyramid Complete!</h2>
    <p className="text-foreground mb-6">Score: {score} / {targets.length}</p>
    <LevelComplete level={gameLevel} score={score} total={targets.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
   </div>
  );
 }

 const t = targets[tIdx];
 const pyramidWidths = ['100%', '85%', '70%', '55%', '40%'];

 return (
  <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
   <div className="max-w-lg mx-auto p-4">
    <div className="flex items-center gap-3 mb-4">
     <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
     <h1 className="font-display font-bold text-lg text-foreground">Taxonomy Tower</h1>
     <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{gameLevel}</span>
     <span className="text-sm text-muted-foreground">{tIdx + 1}/{targets.length}</span>
    </div>
    <div className="flex justify-center mb-4">
     <div className="w-36 h-36 rounded-2xl overflow-hidden border-2 border-border">
      <WeedImage weedId={t.id} stage="plant" className="w-full h-full object-cover" />
     </div>
    </div>
    <p className="text-center text-sm text-muted-foreground mb-4">Identify: <strong className="text-foreground">{t.commonName}</strong></p>
    <div className="flex flex-col-reverse gap-2 items-center">
     {tower.map((lv, i) => (
      <div key={i} style={{ width: pyramidWidths[i] }}
       className={`p-3 rounded-xl border-2 transition-all ${i < towerLevel ? 'border-green-500 bg-green-500/10' : i === towerLevel ? 'border-primary bg-primary/10' : 'border-border bg-secondary/30 opacity-50'}`}>
       <p className="text-xs text-muted-foreground mb-1 text-center">{lv.question}</p>
       {i === towerLevel ? (
        <div className="grid grid-cols-2 gap-2">
         {lv.options.map((opt, oi) => (
          <button key={oi} onClick={() => choose(oi)} className="px-3 py-2 rounded-lg bg-card border border-border text-sm font-medium text-foreground hover:border-primary transition-colors">{opt}</button>
         ))}
        </div>
       ) : i < towerLevel ? (
        <p className="text-sm font-medium text-green-600 text-center">{lv.options[lv.correct]}</p>
       ) : null}
      </div>
     ))}
    </div>
    {wrong && <p className="text-center text-sm text-destructive mt-3">Wrong — try again!</p>}
   </div>
  </div>
 );
}
