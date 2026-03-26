import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface TowerLevel { question: string; options: [string, string]; correctIdx: number; }

function buildTower(target: typeof weeds[0]): TowerLevel[] {
  const isMonocot = target.plantType === 'Monocot';
  const families = [...new Set(weeds.filter(w => w.plantType === target.plantType).map(w => w.family))];
  const wrongFamily = families.find(f => f !== target.family) || 'Poaceae';
  return [
    { question: 'Is this organism a plant or animal?', options: ['Plant', 'Animal'], correctIdx: 0 },
    { question: 'Does this plant produce flowers?', options: ['Yes — Flowering', 'No — Non-flowering'], correctIdx: 0 },
    { question: 'What type of leaf veins does it have?', options: ['Parallel veins (Monocot)', 'Branching veins (Dicot)'], correctIdx: isMonocot ? 0 : 1 },
    { question: 'Which plant family does it belong to?', options: isMonocot ? [target.family, wrongFamily] as [string, string] : [wrongFamily, target.family] as [string, string], correctIdx: isMonocot ? 0 : 1 },
  ];
}

export default function TaxonomyTower({ onBack }: { onBack: () => void }) {
  const targets = useMemo(() => shuffle(weeds).slice(0, 4), []);
  const [targetIdx, setTargetIdx] = useState(0);
  const [level, setLevel] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [found, setFound] = useState(false);

  const target = targets[targetIdx];
  const tower = useMemo(() => buildTower(target), [target]);
  const done = targetIdx >= targets.length;

  const choose = (idx: number) => {
    if (wrong) return;
    if (idx === tower[level].correctIdx) {
      if (level + 1 >= tower.length) { setFound(true); }
      else { setLevel(l => l + 1); }
    } else {
      setWrong(true);
      setTimeout(() => setWrong(false), 1200);
    }
  };

  const nextTarget = () => {
    setTargetIdx(i => i + 1);
    setLevel(0); setFound(false); setWrong(false);
  };

  const restart = () => { setTargetIdx(0); setLevel(0); setFound(false); setWrong(false); };

  if (done) return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🏗️</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Tower Complete!</h2>
        <p className="text-muted-foreground mb-6">You classified {targets.length} weeds!</p>
        <div className="flex gap-3 justify-center">
          <button onClick={restart} className="px-6 py-3 rounded-lg bg-secondary text-foreground font-bold">Play Again</button>
          <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Taxonomy Tower</h1>
        <span className="text-sm text-muted-foreground">{targetIdx + 1}/{targets.length}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        <div className="bg-secondary/50 rounded-xl p-3 text-center">
          <p className="text-sm text-muted-foreground">Find this weed:</p>
          <p className="font-bold text-foreground text-lg">{target.commonName}</p>
        </div>
        <div className="w-28 h-28 rounded-xl overflow-hidden border-2 border-primary/30">
          <WeedImage weedId={target.id} stage="vegetative" className="w-full h-full object-cover" />
        </div>

        {/* Tower visualization */}
        <div className="w-full max-w-sm space-y-2">
          {tower.map((lvl, i) => (
            <div key={i} className={`rounded-lg p-3 border-2 transition-all ${
              i < level ? 'bg-primary/10 border-primary/30' :
              i === level && !found ? 'bg-card border-primary animate-pulse' :
              found ? 'bg-primary/10 border-primary/30' : 'bg-secondary/30 border-border/50 opacity-40'
            }`}>
              {i <= level || found ? (
                <>
                  <p className="text-xs text-muted-foreground mb-2">{lvl.question}</p>
                  {i < level || found ? (
                    <p className="text-sm font-bold text-primary">{lvl.options[lvl.correctIdx]}</p>
                  ) : (
                    <div className="flex gap-2">
                      {lvl.options.map((opt, oi) => (
                        <button key={oi} onClick={() => choose(oi)}
                          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${wrong ? 'bg-destructive/20 text-destructive' : 'bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground'}`}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground text-center">Level {i + 1}</p>
              )}
            </div>
          ))}
        </div>

        {found && (
          <div className="text-center mt-2">
            <p className="text-lg font-bold text-green-500 mb-3">You found {target.commonName}!</p>
            <button onClick={nextTarget} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next Weed →</button>
          </div>
        )}
        {wrong && <p className="text-destructive font-bold animate-pulse">Try again!</p>}
      </div>
    </div>
  );
}
