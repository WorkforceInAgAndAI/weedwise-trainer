import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

function buildAllPairs() {
  const valid = weeds.filter(w => w.lookAlike && weeds.find(x => x.id === w.lookAlike.id));
  const used = new Set<string>();
  const result: { weed: typeof weeds[0]; alike: typeof weeds[0]; difference: string }[] = [];
  for (const w of shuffle(valid)) {
    if (used.has(w.id)) continue;
    const alike = weeds.find(x => x.id === w.lookAlike.id);
    if (!alike || used.has(alike.id)) continue;
    used.add(w.id); used.add(alike.id);
    result.push({ weed: w, alike, difference: w.lookAlike.difference });
  }
  return result;
}

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }
export default function K5LookAlike({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);

  // Build a large pool and rotate based on level
  const pairs = useMemo(() => {
    const allPairs = buildAllPairs();
    const pairsPerLevel = 5;
    // Offset by level so different pairs each time, with wrap-around allowing some repeats
    const offset = ((level - 1) * pairsPerLevel) % Math.max(allPairs.length, 1);
    const selected: typeof allPairs = [];
    for (let i = 0; i < pairsPerLevel && allPairs.length > 0; i++) {
      selected.push(allPairs[(offset + i) % allPairs.length]);
    }
    return shuffle(selected);
  }, [level]);

  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<{ targetName: string; correct: boolean; weedId: string; alikeId: string }[]>([]);

  const done = round >= pairs.length;
  const pair = !done ? pairs[round] : null;
  const targetIsFirst = useMemo(() => Math.random() > 0.5, [round]);
  const target = pair ? pair.weed : null;
  const options = pair ? (targetIsFirst ? [pair.weed, pair.alike] : [pair.alike, pair.weed]) : [];

  const restart = () => { setRound(0); setSelected(null); setSubmitted(false); setScore(0); setHistory([]); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  const submit = () => {
    if (!selected || !target) return;
    setSubmitted(true);
    const ok = selected === target.id;
    if (ok) setScore(s => s + 1);
    if (pair) setHistory(h => [...h, { targetName: target.commonName, correct: ok, weedId: pair.weed.id, alikeId: pair.alike.id }]);
  };

  const next = () => { setRound(r => r + 1); setSelected(null); setSubmitted(false); };

  if (done) return <LevelComplete level={level} score={score} total={pairs.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} gameId={gameId} gameName={gameName} gradeLabel={gradeLabel} />;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Look-Alike Challenge</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">{round + 1}/{pairs.length}</span>
      </div>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 p-4 overflow-y-auto">
      <div className="flex flex-col items-center justify-center gap-4">
        <p className="text-foreground font-bold text-lg">Which one is <span className="text-primary">{target?.commonName}</span>?</p>
        <div className="flex gap-4">
          {options.map(w => (
            <button key={w.id} onClick={() => !submitted && setSelected(w.id)}
              className={`w-56 sm:w-64 rounded-xl overflow-hidden border-3 transition-all ${
                selected === w.id ? 'border-primary scale-105 shadow-lg' : 'border-border'
              } ${submitted && w.id === target?.id ? 'ring-2 ring-green-500' : ''} ${submitted && selected === w.id && w.id !== target?.id ? 'ring-2 ring-destructive' : ''}`}>
              <div className="aspect-square bg-secondary">
                <WeedImage weedId={w.id} stage="flower" className="w-full h-full object-cover" />
              </div>
              {submitted && (
                <p className={`text-xs font-medium p-2 text-center ${w.id === target?.id ? 'text-green-500 font-bold' : 'text-foreground'}`}>{w.commonName}</p>
              )}
            </button>
          ))}
        </div>
        {!submitted ? (
          <button onClick={submit} disabled={!selected}
            className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-50">Confirm</button>
        ) : (
          <div className="text-center max-w-sm">
            <p className={`text-lg font-bold mb-2 ${selected === target?.id ? 'text-green-500' : 'text-destructive'}`}>
              {selected === target?.id ? 'Correct!' : 'Not quite!'}
            </p>
            <p className="text-sm text-muted-foreground mb-3">Key difference: {pair?.difference}</p>
            <button onClick={next} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next →</button>
          </div>
        )}
      </div>
      {/* History side panel */}
      <div className="rounded-xl border-2 border-border bg-card p-3 overflow-y-auto">
        <p className="text-xs font-bold uppercase text-foreground mb-2">Completed ({history.length})</p>
        <div className="space-y-2">
          {history.map((h, i) => (
            <div key={i} className={`p-2 rounded-md border-2 ${h.correct ? 'border-green-500/50 bg-green-500/5' : 'border-destructive/50 bg-destructive/5'}`}>
              <p className="text-[10px] font-bold text-foreground mb-1 truncate">{h.targetName}</p>
              <div className="grid grid-cols-2 gap-1">
                <div className="aspect-square rounded overflow-hidden">
                  <WeedImage weedId={h.weedId} stage="flower" className="w-full h-full object-cover" />
                </div>
                <div className="aspect-square rounded overflow-hidden">
                  <WeedImage weedId={h.alikeId} stage="flower" className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
          <FloatingCoach grade="K-5" tip={`Look-alikes are tricky! Compare leaf shape, edges, and stems carefully before you tap.`} />
</div>
  );
}
