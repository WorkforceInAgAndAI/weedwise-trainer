import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface PyramidLevel { question: string; options: [string, string]; correctIdx: number; }

function buildPyramid(target: typeof weeds[0]): PyramidLevel[] {
  const isMonocot = target.plantType === 'Monocot';
  const wrongName = shuffle(weeds.filter(w => w.id !== target.id))[0]?.commonName || 'Unknown';
  const nameOptions: [string, string] = Math.random() > 0.5
    ? [target.commonName, wrongName]
    : [wrongName, target.commonName];
  const nameCorrect = nameOptions[0] === target.commonName ? 0 : 1;

  return [
    { question: 'Is this organism a plant or animal?', options: ['Plant', 'Animal'], correctIdx: 0 },
    { question: 'What type of leaf veins does it have?', options: ['Parallel veins (Monocot)', 'Branching veins (Dicot)'], correctIdx: isMonocot ? 0 : 1 },
    { question: 'Which plant family does it belong to?', options: [target.family, shuffle(weeds.filter(w => w.family !== target.family))[0]?.family || 'Poaceae'], correctIdx: 0 },
    { question: 'Identify this weed!', options: nameOptions, correctIdx: nameCorrect },
  ];
}

const ROUNDS_PER_LEVEL = 5;

function getTargetsForLevel(level: number): typeof weeds {
  const offset = (level - 1) * ROUNDS_PER_LEVEL;
  const rotated = [...weeds.slice(offset % weeds.length), ...weeds.slice(0, offset % weeds.length)];
  return shuffle(rotated).slice(0, ROUNDS_PER_LEVEL);
}

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string }

export default function TaxonomyTower({ onBack }: Props) {
  const [level, setLevel] = useState(1);
  const targets = useMemo(() => getTargetsForLevel(level), [level]);
  const [targetIdx, setTargetIdx] = useState(0);
  const [pyramidLevel, setPyramidLevel] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [found, setFound] = useState(false);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<{ weed: typeof weeds[0] }[]>([]);

  const target = targets[targetIdx];
  const pyramid = useMemo(() => buildPyramid(target), [target]);
  const done = targetIdx >= targets.length;

  const choose = (idx: number) => {
    if (wrong) return;
    if (idx === pyramid[pyramidLevel].correctIdx) {
      if (pyramidLevel + 1 >= pyramid.length) {
        setFound(true);
        setScore(s => s + 1);
        setHistory(h => [...h, { weed: target }]);
      } else {
        setPyramidLevel(l => l + 1);
      }
    } else {
      setWrong(true);
      setTimeout(() => setWrong(false), 1200);
    }
  };

  const nextTarget = () => {
    setTargetIdx(i => i + 1);
    setPyramidLevel(0); setFound(false); setWrong(false);
  };

  const restart = () => { setTargetIdx(0); setPyramidLevel(0); setFound(false); setWrong(false); setScore(0); setHistory([]); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (done) return <LevelComplete level={level} score={score} total={ROUNDS_PER_LEVEL} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Taxonomy Tower</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">{targetIdx + 1}/{targets.length}</span>
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_220px] gap-4 p-4">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="bg-secondary/50 rounded-xl p-3 text-center">
            <p className="text-sm text-muted-foreground">Classify this weed:</p>
          </div>
          <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-xl overflow-hidden border-2 border-primary/30">
            <WeedImage weedId={target.id} stage="vegetative" className="w-full h-full object-cover" />
          </div>

          <div className="w-full max-w-md flex flex-col items-center gap-2">
          {pyramid.map((_, i) => {
            const displayIdx = pyramid.length - 1 - i;
            const actualLevel = pyramid[displayIdx];
            const actualIdx = displayIdx;
            const widthPercent = 50 + (pyramid.length - 1 - actualIdx) * 10;

            return (
              <div key={actualIdx} className="w-full flex justify-center" style={{ maxWidth: `${widthPercent}%` }}>
                <div className={`w-full rounded-lg p-3 border-2 transition-all ${
                  actualIdx < pyramidLevel ? 'bg-primary/10 border-primary/30' :
                  actualIdx === pyramidLevel && !found ? 'bg-card border-primary animate-pulse' :
                  found ? 'bg-primary/10 border-primary/30' : 'bg-secondary/30 border-border/50 opacity-40'
                }`}>
                  {actualIdx <= pyramidLevel || found ? (
                    <>
                      <p className="text-xs text-muted-foreground mb-2 text-center">{actualLevel.question}</p>
                      {actualIdx < pyramidLevel || found ? (
                        <p className="text-sm font-bold text-primary text-center">{actualLevel.options[actualLevel.correctIdx]}</p>
                      ) : (
                        <div className="flex gap-2">
                          {actualLevel.options.map((opt, oi) => (
                            <button key={oi} onClick={() => choose(oi)}
                              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${wrong ? 'bg-destructive/20 text-destructive' : 'bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground'}`}>
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center">Level {actualIdx + 1}</p>
                  )}
                </div>
              </div>
            );
          })}
          </div>

          {found && (
            <div className="text-center mt-2">
              <p className="text-lg font-bold text-green-500 mb-3">You found {target.commonName}!</p>
              <button onClick={nextTarget} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next Weed</button>
            </div>
          )}
          {wrong && <p className="text-destructive font-bold animate-pulse">Try again!</p>}
        </div>

        {/* Side collection of classified weeds */}
        <div className="rounded-xl border-2 border-border bg-card p-3 h-fit md:sticky md:top-4">
          <p className="text-xs font-bold uppercase text-foreground mb-3">Classified ({history.length})</p>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {history.length === 0 && <p className="text-xs text-muted-foreground italic">Climbed weeds collect here.</p>}
            {history.map((h, i) => (
              <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg border border-green-500/40 bg-green-500/5">
                <div className="w-10 h-10 rounded overflow-hidden bg-secondary shrink-0">
                  <WeedImage weedId={h.weed.id} stage="vegetative" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{h.weed.commonName}</p>
                  <p className="text-[10px] text-muted-foreground italic truncate">{h.weed.plantType}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
          <FloatingCoach grade="6-8" tip={`Family → Genus → Species. Use leaf and flower traits to climb the taxonomy ladder.`} />
</div>
  );
}
