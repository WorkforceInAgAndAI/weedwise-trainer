import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface Round { weed: typeof weeds[0]; correct: 'Parallel' | 'Netted' }

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function LeafArtist({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);

  const rounds = useMemo<Round[]>(() => {
    const monocots = shuffle(weeds.filter(w => w.plantType === 'Monocot')).slice(0, 3);
    const dicots = shuffle(weeds.filter(w => w.plantType === 'Dicot')).slice(0, 3);
    return shuffle([
      ...monocots.map(w => ({ weed: w, correct: 'Parallel' as const })),
      ...dicots.map(w => ({ weed: w, correct: 'Netted' as const })),
    ]);
  }, [level]);

  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<'Parallel' | 'Netted' | null>(null);
  const [classified, setClassified] = useState<{ weed: typeof weeds[0]; correct: boolean; venation: string }[]>([]);

  const done = idx >= rounds.length;
  const r = !done ? rounds[idx] : null;

  const restart = () => { setIdx(0); setScore(0); setPicked(null); setClassified([]); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  const pick = (choice: 'Parallel' | 'Netted') => {
    if (picked || !r) return;
    setPicked(choice);
    const ok = choice === r.correct;
    if (ok) setScore(s => s + 1);
    setClassified(prev => [...prev, { weed: r.weed, correct: ok, venation: r.correct }]);
  };

  const next = () => { setPicked(null); setIdx(i => i + 1); };

  if (done) return <LevelComplete level={level} score={score} total={rounds.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} gameId={gameId} gameName={gameName} gradeLabel={gradeLabel} />;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-display font-bold text-foreground text-lg flex-1">Leaf Detective</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">{idx + 1}/{rounds.length}</span>
        <span className="text-sm font-bold text-primary ml-2">{score} pts</span>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 p-4 overflow-y-auto">
        {/* Main game */}
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="bg-secondary/50 rounded-xl p-3 max-w-md text-center">
            <p className="text-sm font-bold text-foreground">Look at the leaf veins.</p>
            <p className="text-xs text-muted-foreground">Are they <span className="font-bold text-primary">Parallel</span> (running side-by-side like grass) or <span className="font-bold text-primary">Netted</span> (branching like a net)?</p>
          </div>

          <div className="w-72 h-72 sm:w-96 sm:h-96 rounded-xl overflow-hidden border-2 border-border bg-secondary">
            <WeedImage weedId={r!.weed.id} stage="vegetative" className="w-full h-full object-cover" />
          </div>
          <p className="text-base font-bold text-foreground">{r!.weed.commonName}</p>

          {!picked ? (
            <div className="flex gap-4">
              <button onClick={() => pick('Parallel')} className="px-8 py-4 rounded-xl bg-primary text-primary-foreground text-lg font-bold hover:opacity-90">Parallel</button>
              <button onClick={() => pick('Netted')} className="px-8 py-4 rounded-xl bg-primary text-primary-foreground text-lg font-bold hover:opacity-90">Netted</button>
            </div>
          ) : (
            <div className="text-center max-w-md">
              <p className={`text-xl font-bold mb-2 ${picked === r!.correct ? 'text-green-500' : 'text-destructive'}`}>
                {picked === r!.correct ? 'Correct!' : `Not quite — it's ${r!.correct}.`}
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                {r!.correct === 'Parallel' ? `${r!.weed.commonName} is a monocot (grass-like). Its veins run in parallel lines.` : `${r!.weed.commonName} is a dicot (broadleaf). Its veins branch out in a net pattern.`}
              </p>
              <button onClick={next} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next →</button>
            </div>
          )}
        </div>

        {/* Side panel */}
        <div className="grid grid-rows-2 gap-3">
          {(['Parallel', 'Netted'] as const).map(v => {
            const items = classified.filter(c => c.venation === v);
            return (
              <div key={v} className="rounded-xl border-2 border-border bg-card p-3 overflow-y-auto">
                <p className="text-xs font-bold uppercase text-foreground mb-2">{v} ({items.length})</p>
                <div className="grid grid-cols-3 gap-2">
                  {items.map((c, i) => (
                    <div key={i} className="text-center">
                      <div className={`aspect-square rounded-md overflow-hidden border-2 ${c.correct ? 'border-green-500' : 'border-destructive'}`}>
                        <WeedImage weedId={c.weed.id} stage="vegetative" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[9px] mt-1 text-foreground truncate">{c.weed.commonName}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
          <FloatingCoach grade="K-5" tip={`Look at the lines on the leaf. Parallel lines run side by side. Netted lines branch out like a spider web.`} />
</div>
  );
}
