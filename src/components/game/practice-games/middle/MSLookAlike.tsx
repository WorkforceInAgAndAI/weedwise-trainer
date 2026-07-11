import { useState, useMemo } from 'react';
import { middleSchoolWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';
import { LOOKALIKE_TRIPLES } from '@/data/lookAlikeGroups';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

type Weed = typeof weeds[0];
interface Trio {
  weeds: Weed[];
  difference: string;
}

function buildTrios(): Trio[] {
  return LOOKALIKE_TRIPLES
    .map(t => {
      const ws = t.ids.map(id => weeds.find(w => w.id === id));
      if (ws.some(w => !w)) return null;
      return { weeds: ws as Weed[], difference: t.difference };
    })
    .filter((g): g is Trio => g !== null);
}

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function MSLookAlike({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);

  const trios = useMemo(() => {
    const all = buildTrios();
    const perLevel = 5;
    const offset = ((level - 1) * perLevel) % Math.max(all.length, 1);
    const picked: Trio[] = [];
    for (let i = 0; i < perLevel && all.length > 0; i++) {
      picked.push(all[(offset + i) % all.length]);
    }
    return shuffle(picked);
  }, [level]);

  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<{ targetName: string; correct: boolean; ids: string[] }[]>([]);

  const done = round >= trios.length;
  const trio = !done ? trios[round] : null;

  // Pick a target species per round and shuffle option order
  const { target, options } = useMemo(() => {
    if (!trio) return { target: null as Weed | null, options: [] as Weed[] };
    const idx = Math.floor(Math.random() * trio.weeds.length);
    const t = trio.weeds[idx];
    return { target: t as Weed | null, options: shuffle([...trio.weeds]) };
  }, [trio]);

  const restart = () => { setRound(0); setSelected(null); setSubmitted(false); setScore(0); setHistory([]); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  const submit = () => {
    if (!selected || !target) return;
    setSubmitted(true);
    const ok = selected === target.id;
    if (ok) setScore(s => s + 1);
    if (trio) setHistory(h => [...h, { targetName: target.commonName, correct: ok, ids: trio.weeds.map(w => w.id) }]);
  };

  const next = () => { setRound(r => r + 1); setSelected(null); setSubmitted(false); };

  if (done) return <LevelComplete level={level} score={score} total={trios.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} gameId={gameId} gameName={gameName} gradeLabel={gradeLabel} />;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Look-Alike Trios</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">{round + 1}/{trios.length}</span>
      </div>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 p-4 overflow-y-auto">
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-foreground font-bold text-lg text-center">
            Which one is <span className="text-primary">{target?.commonName}</span>
            {target && <span className="block text-xs italic text-primary mt-1">({target.scientificName})</span>}?
          </p>
          <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-3xl">
            {options.map(w => (
              <button
                key={w.id}
                onClick={() => !submitted && setSelected(w.id)}
                className={`rounded-xl overflow-hidden border-[3px] transition-all bg-card ${
                  selected === w.id ? 'border-primary scale-[1.02] shadow-lg' : 'border-border'
                } ${submitted && w.id === target?.id ? 'ring-2 ring-green-500' : ''} ${
                  submitted && selected === w.id && w.id !== target?.id ? 'ring-2 ring-destructive' : ''
                }`}
              >
                <div className="aspect-square bg-secondary">
                  <WeedImage weedId={w.id} stage="flower" className="w-full h-full object-cover" />
                </div>
                {submitted && (
                  <div className="p-2 text-center">
                    <p className={`text-xs font-bold leading-tight ${w.id === target?.id ? 'text-green-600' : 'text-foreground'}`}>{w.commonName}</p>
                    <p className="text-[10px] italic text-primary leading-tight mt-0.5">{w.scientificName}</p>
                  </div>
                )}
              </button>
            ))}
          </div>
          {!submitted ? (
            <button onClick={submit} disabled={!selected} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-50">Confirm</button>
          ) : (
            <div className="text-center max-w-2xl bg-card border border-border rounded-lg p-4 space-y-2">
              <p className={`text-lg font-bold ${selected === target?.id ? 'text-green-600' : 'text-destructive'}`}>
                {selected === target?.id
                  ? 'Correct!'
                  : `Not quite! You chose ${options.find(o => o.id === selected)?.commonName} (${options.find(o => o.id === selected)?.scientificName}). The correct answer was ${target?.commonName} (${target?.scientificName}).`}
              </p>
              <p className="text-sm text-foreground"><span className="font-semibold text-primary">How to tell them apart:</span> {trio?.difference}</p>
              <button onClick={next} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next →</button>
            </div>
          )}
        </div>

        <div className="rounded-xl border-2 border-border bg-card p-3 overflow-y-auto">
          <p className="text-xs font-bold uppercase text-foreground mb-2">Completed ({history.length})</p>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className={`p-2 rounded-md border-2 ${h.correct ? 'border-green-500/50 bg-green-500/5' : 'border-destructive/50 bg-destructive/5'}`}>
                <p className="text-[10px] font-bold text-foreground mb-1 truncate">{h.targetName}</p>
                <div className="grid grid-cols-3 gap-1">
                  {h.ids.map(id => (
                    <div key={id} className="aspect-square rounded overflow-hidden">
                      <WeedImage weedId={id} stage="flower" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <FloatingCoach grade="6-8" tip="Compare leaf shape, stem hairs, and flowers. Look-alike trios trip up even experienced scouts." />
    </div>
  );
}
