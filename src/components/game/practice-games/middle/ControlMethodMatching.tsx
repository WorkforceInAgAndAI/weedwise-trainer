import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { FlaskConical } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const HERBICIDE_GROUPS = [
 { id: 'group2', label: 'ALS Inhibitors (Group 2)', targets: 'broadleaf', moa: 'Inhibits amino acid synthesis', resistance: 'High risk — over 160 resistant species globally' },
 { id: 'group4', label: 'Synthetic Auxins (Group 4)', targets: 'broadleaf', moa: 'Mimics plant hormones causing uncontrolled growth', resistance: 'Low risk — few resistant species' },
 { id: 'group9', label: 'Glyphosate (Group 9)', targets: 'both', moa: 'Inhibits EPSPS enzyme in amino acid pathway', resistance: 'High risk — 50+ resistant species including Palmer Amaranth, Waterhemp' },
 { id: 'group15', label: 'Long-chain FA Inhibitors (Group 15)', targets: 'grass', moa: 'Inhibits cell division in root meristems', resistance: 'Low risk — very few resistant biotypes' },
 { id: 'group1', label: 'ACCase Inhibitors (Group 1)', targets: 'grass', moa: 'Inhibits lipid synthesis in grasses', resistance: 'Moderate risk — resistance in wild oat, foxtails' },
 { id: 'group5', label: 'PSII Inhibitors (Group 5)', targets: 'broadleaf', moa: 'Blocks photosynthesis at photosystem II', resistance: 'Moderate risk — resistance in several broadleaf species' },
 { id: 'group14', label: 'PPO Inhibitors (Group 14)', targets: 'both', moa: 'Causes cell membrane disruption', resistance: 'Low risk — emerging resistance in waterhemp' },
 { id: 'group27', label: 'HPPD Inhibitors (Group 27)', targets: 'broadleaf', moa: 'Bleaches new growth by inhibiting pigment synthesis', resistance: 'Low risk — relatively new MOA' },
];

function getBestGroup(w: typeof weeds[0]): string {
 const m = w.management.toLowerCase();
 if (m.includes('group 2') || m.includes('als')) return 'group2';
 if (m.includes('group 4') || m.includes('auxin')) return 'group4';
 if (m.includes('group 9') || m.includes('glyphosate')) return 'group9';
 if (m.includes('group 15')) return 'group15';
 if (m.includes('group 1') || m.includes('accase')) return 'group1';
 if (m.includes('ppo') || m.includes('group 14')) return 'group14';
 return w.plantType === 'Monocot' ? 'group1' : 'group4';
}

export default function ControlMethodMatching({ onBack }: { onBack: () => void }) {
 const [level, setLevel] = useState(1);
 const { addBadge } = useGameProgress();

 const items = useMemo(() => {
  const pool = shuffle(weeds);
  const offset = ((level - 1) * 10) % pool.length;
  const selected = pool.slice(offset).concat(pool).slice(0, 10);
  return selected.map(w => {
   const bestGroupId = getBestGroup(w);
   const correctGroup = HERBICIDE_GROUPS.find(g => g.id === bestGroupId)!;
   const otherGroups = shuffle(HERBICIDE_GROUPS.filter(g => g.id !== bestGroupId)).slice(0, 3);
   const options = shuffle([correctGroup, ...otherGroups]);
   return { weed: w, type: w.plantType === 'Monocot' ? 'grass' : 'broadleaf', bestGroupId, options };
  });
 }, [level]);

 const [idx, setIdx] = useState(0);
 const [selected, setSelected] = useState<string | null>(null);
 const [answered, setAnswered] = useState(false);
 const [score, setScore] = useState(0);

 const done = idx >= items.length;
 const current = !done ? items[idx] : null;

 const submit = (gId: string) => {
  if (answered) return;
  setSelected(gId);
  setAnswered(true);
  if (gId === current!.bestGroupId) setScore(s => s + 1);
 };

 const next = () => { setIdx(i => i + 1); setSelected(null); setAnswered(false); };
 const restart = () => { setIdx(0); setScore(0); setSelected(null); setAnswered(false); };
 const nextLevel = () => { setLevel(l => l + 1); restart(); };
 const startOver = () => { setLevel(1); restart(); };

 if (done) {
  addBadge({ gameId: 'control-matching', gameName: 'Control Method Matching', level: 'MS', score, total: items.length });
  return (
   <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
    <FlaskConical className="w-10 h-10 text-primary mb-3" />
    <h2 className="text-2xl font-bold text-foreground mb-2">Great Work!</h2>
    <p className="text-lg text-foreground mb-6">{score}/{items.length} correct</p>
    <LevelComplete level={level} score={score} total={items.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
   </div>
  );
 }

 const correctGroupData = HERBICIDE_GROUPS.find(g => g.id === current!.bestGroupId)!;

 return (
  <div className="fixed inset-0 bg-background z-50 flex flex-col">
   <div className="flex items-center gap-3 p-4 border-b border-border">
    <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
    <h1 className="font-bold text-foreground text-lg flex-1">Control Method Matching</h1>
    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
    <span className="text-sm text-muted-foreground">{idx + 1}/{items.length}</span>
   </div>
   <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
    <div className="w-36 h-36 rounded-xl overflow-hidden bg-secondary mb-3">
     <WeedImage weedId={current!.weed.id} stage="vegetative" className="w-full h-full object-cover" />
    </div>
    <p className="font-bold text-foreground mb-1">{current!.weed.commonName}</p>
    <p className="text-xs text-muted-foreground mb-1">Type: {current!.weed.plantType} ({current!.type})</p>
    <p className="text-xs text-muted-foreground mb-4">Which herbicide group is most effective against this weed?</p>
    <div className="flex flex-col gap-2 w-full max-w-sm">
     {current!.options.map(g => {
      const isCorrect = g.id === current!.bestGroupId;
      const bg = !answered ? 'border-border bg-card hover:border-primary' :
       g.id === selected ? (isCorrect ? 'border-green-500 bg-green-500/20' : 'border-destructive bg-destructive/20') :
       isCorrect ? 'border-green-500 bg-green-500/10' : 'border-border bg-card';
      return (
       <button key={g.id} onClick={() => submit(g.id)}
        className={`p-3 rounded-lg border-2 text-left text-sm font-medium text-foreground transition-all ${bg}`}>
        <span>{g.label}</span>
        {answered && <span className="text-xs text-muted-foreground ml-2">({g.targets})</span>}
       </button>
      );
     })}
    </div>
    {answered && (
     <div className="mt-4 bg-card border border-border rounded-xl p-4 max-w-sm w-full">
      <p className={`font-bold mb-2 ${selected === current!.bestGroupId ? 'text-green-500' : 'text-destructive'}`}>
       {selected === current!.bestGroupId ? 'Correct!' : 'Not quite!'}
      </p>
      <p className="text-xs text-muted-foreground mb-1">Mode of Action: {correctGroupData.moa}</p>
      <p className="text-xs text-muted-foreground">Resistance: {correctGroupData.resistance}</p>
      <button onClick={next} className="mt-3 w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next</button>
     </div>
    )}
   </div>
  </div>
 );
}
