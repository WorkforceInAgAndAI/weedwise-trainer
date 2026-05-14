import { useState, useMemo } from 'react';
import { FlaskConical } from 'lucide-react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import {
  HERBICIDE_MOA,
  SYMPTOM_TYPES,
  getBestMOAForWeed,
  type HerbicideMOA,
} from '@/data/herbicides';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

/** High school gets the full MOA table; pick 5 random options per question */
function buildOptions(correct: HerbicideMOA): HerbicideMOA[] {
  const others = shuffle(HERBICIDE_MOA.filter(h => h.id !== correct.id)).slice(0, 4);
  return shuffle([correct, ...others]);
}

export default function ControlMethodMatching({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);

  const items = useMemo(() => {
    const pool = shuffle(weeds);
    const offset = ((level - 1) * 8) % pool.length;
    return pool.slice(offset).concat(pool).slice(0, 8).map(w => {
      const bestId = getBestMOAForWeed(w);
      const bestMOA = HERBICIDE_MOA.find(h => h.id === bestId)!;
      const options = buildOptions(bestMOA);
      return { weed: w, bestId, bestMOA, options };
    });
  }, [level]);

  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<{ weed: typeof weeds[0]; correct: boolean; picked: string; best: string }[]>([]);
  const done = idx >= items.length;

  const submit = (gId: string) => {
    if (answered) return;
    setPicked(gId);
    setAnswered(true);
    const correct = gId === items[idx].bestId;
    if (correct) setScore(s => s + 1);
    setResults(prev => [...prev, { weed: items[idx].weed, correct, picked: gId, best: items[idx].bestId }]);
  };
  const next = () => { setIdx(i => i + 1); setPicked(null); setAnswered(false); };
  const restart = () => { setIdx(0); setPicked(null); setAnswered(false); setScore(0); setResults([]); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (done) {
    const wrongResults = results.filter(r => !r.correct);
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
        <div className="max-w-lg mx-auto p-4 flex flex-col items-center">
          <FlaskConical className="w-10 h-10 text-primary mb-3" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Round Complete!</h2>
          <p className="text-lg text-foreground mb-4">{score}/{items.length} correct</p>
          {wrongResults.length > 0 && (
            <div className="w-full space-y-2 mb-4">
              <p className="text-sm text-muted-foreground text-center">Review incorrect:</p>
              {wrongResults.map((r, i) => {
                const pickedMOA = HERBICIDE_MOA.find(h => h.id === r.picked);
                const bestMOA = HERBICIDE_MOA.find(h => h.id === r.best);
                return (
                  <div key={i} className="bg-card border border-border rounded-xl p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                      <WeedImage weedId={r.weed.id} stage="flower" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-foreground text-sm">{r.weed.commonName}</p>
                      <p className="text-xs text-destructive">
                        You: {pickedMOA ? `${pickedMOA.moa} (Group ${pickedMOA.group})` : r.picked}
                      </p>
                      <p className="text-xs text-green-600">
                        Correct: {bestMOA ? `${bestMOA.moa} (Group ${bestMOA.group})` : r.best}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <LevelComplete level={level} score={score} total={items.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
        </div>
      </div>
    );
  }

  const cur = items[idx];
  const symptomInfo = SYMPTOM_TYPES[cur.bestMOA.symptomType];
  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
          <h1 className="font-display font-bold text-lg text-foreground">Mode of Action Match</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
          <span className="text-sm text-muted-foreground">{idx + 1}/{items.length}</span>
        </div>
        <div className="flex justify-center mb-3">
          <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-border">
            <WeedImage weedId={cur.weed.id} stage="flower" className="w-full h-full object-cover" />
          </div>
        </div>
        <p className="text-center font-bold text-foreground mb-1">{cur.weed.commonName}</p>
        <p className="text-center text-xs text-muted-foreground mb-4">{cur.weed.plantType} -- {cur.weed.family}</p>
        <p className="text-sm text-muted-foreground text-center mb-3">Which herbicide mode of action targets this weed?</p>
        <div className="grid gap-2">
          {cur.options.map(g => {
            let cls = 'border-border bg-card';
            if (answered && g.id === cur.bestId) cls = 'border-green-500 bg-green-500/20';
            else if (answered && g.id === picked) cls = 'border-destructive bg-destructive/20';
            return (
              <button key={g.id} onClick={() => submit(g.id)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${cls}`}>
                <p className="text-sm font-bold text-foreground">{g.moa} (Group {g.group})</p>
                <p className="text-[10px] text-muted-foreground">
                  {g.timing} -- {g.spectrum} -- chemical: {g.brands[0]}
                </p>
              </button>
            );
          })}
        </div>
        {answered && (
          <div className="mt-3 bg-card border border-border rounded-xl p-3">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">Symptom:</span> {symptomInfo?.label} — {symptomInfo?.description}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-semibold">Resistance:</span> {cur.bestMOA.resistanceLevel} — {cur.bestMOA.resistanceNotes}
            </p>
          </div>
        )}
        {answered && <button onClick={next} className="mt-4 w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Next</button>}
      </div>
    </div>
  );
}
