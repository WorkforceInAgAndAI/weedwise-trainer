import { useMemo, useState } from 'react';
import { GRASS_FEATURES, GRASS_CLUE_FIELDS, type GrassFeature } from '@/data/grassFeatures';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import { getDifficulty, levelSlice } from '@/lib/difficulty';
import { Lock, Microscope, CheckCircle2, XCircle, ZoomIn, ZoomOut } from 'lucide-react';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string }

export default function GrassID({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);
  const d = useMemo(() => getDifficulty(level, 'hs'), [level]);

  // Only grasses that actually exist in the species dataset.
  const pool = useMemo(
    () => GRASS_FEATURES.filter((g) => weeds.some((w) => w.id === g.id)),
    [],
  );

  const rounds = useMemo(() => {
    const selection = levelSlice(shuffle(pool), level, Math.min(d.rounds, pool.length));
    return selection.map((target) => {
      const others = pool.filter((g) => g.id !== target.id);
      // Harder levels pull distractors that share the same ligule type.
      const similar = others.filter((g) => g.liguleType === target.liguleType);
      const distractPool = d.hardDistractors && similar.length >= d.options - 1 ? similar : others;
      const wrong = shuffle(distractPool).slice(0, d.options - 1);
      return { target, options: shuffle([target, ...wrong]) };
    });
  }, [pool, level, d.rounds, d.options, d.hardDistractors]);

  const [round, setRound] = useState(0);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [picked, setPicked] = useState<GrassFeature | null>(null);
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [zoom, setZoom] = useState(1.6);

  const done = round >= rounds.length;
  const current = done ? null : rounds[round];
  const answered = picked !== null;

  const reveal = (key: string) => {
    if (answered || revealed.includes(key)) return;
    setRevealed((r) => [...r, key]);
  };

  const answer = (g: GrassFeature) => {
    if (answered) return;
    setPicked(g);
    const earned = g.id === current!.target.id ? Math.max(1, 4 - revealed.length) : 0;
    setScore((s) => s + earned);
    setMaxScore((m) => m + 4);
  };

  const next = () => { setRound((r) => r + 1); setRevealed([]); setPicked(null); setZoom(1.6); };
  const restart = () => { setRound(0); setScore(0); setMaxScore(0); setRevealed([]); setPicked(null); setZoom(1.6); };
  const nextLevel = () => { setLevel((l) => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (done) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-y-auto flex items-center justify-center p-6">
        <LevelComplete
          level={level}
          score={score}
          total={maxScore}
          onNextLevel={nextLevel}
          onStartOver={startOver}
          onBack={onBack}
          title="Grass ID Lab"
          gameId={gameId ?? 'grass-id-lab'}
          gameName={gameName ?? 'Grass ID Lab'}
          gradeLabel={gradeLabel ?? 'Collegiate'}
        />
      </div>
    );
  }

  const target = current!.target;
  const pointsNow = Math.max(1, 4 - revealed.length);

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <Microscope className="w-5 h-5 text-primary" />
          <h1 className="font-display font-bold text-foreground text-lg flex-1">Grass ID Lab</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
          <span className="text-sm text-muted-foreground">Specimen {round + 1}/{rounds.length}</span>
          <span className="text-sm font-bold text-foreground">{score} pts</span>
        </div>

        <p className="text-sm text-muted-foreground">
          Work the specimen like a herbarium sheet: start with the <strong className="text-foreground">ligule</strong> and{' '}
          <strong className="text-foreground">seed head</strong>, then unlock written characters only if you need them.
          Naming it with no clues is worth <strong className="text-foreground">4 points</strong> — each clue costs one.
        </p>

        {/* Specimen imagery */}
        <div className="grid lg:grid-cols-2 gap-4">
          <figure className="bg-card border-2 border-primary/40 rounded-xl p-3">
            <figcaption className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wide text-primary">Ligule / collar</span>
              <span className="flex items-center gap-1">
                <button onClick={() => setZoom((z) => Math.max(1, +(z - 0.25).toFixed(2)))}
                  className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-foreground hover:border-primary"
                  aria-label="Zoom out"><ZoomOut className="w-3.5 h-3.5" /></button>
                <button onClick={() => setZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)))}
                  className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-foreground hover:border-primary"
                  aria-label="Zoom in"><ZoomIn className="w-3.5 h-3.5" /></button>
                <span className="text-[10px] font-mono text-muted-foreground w-10 text-right">{zoom.toFixed(2)}x</span>
              </span>
            </figcaption>
            <div className="h-64 sm:h-80 rounded-lg overflow-hidden bg-muted">
              <div className="w-full h-full transition-transform duration-200" style={{ transform: `scale(${zoom})` }}>
                <WeedImage weedId={target.id} stage="ligule" className="w-full h-full" />
              </div>
            </div>
          </figure>

          <figure className="bg-card border-2 border-accent/40 rounded-xl p-3">
            <figcaption className="text-xs font-bold uppercase tracking-wide text-accent mb-2">Reproductive — seed head</figcaption>
            <div className="h-64 sm:h-80 rounded-lg overflow-hidden bg-muted">
              <WeedImage weedId={target.id} stage="repros" className="w-full h-full" />
            </div>
          </figure>
        </div>

        {/* Secondary imagery */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {([['vegetative', 'Vegetative'], ['seedling', 'Seedling'], ['seed', 'Seed']] as const).map(([stage, label]) => (
            <figure key={stage} className="bg-card border border-border rounded-lg p-2">
              <figcaption className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">{label}</figcaption>
              <div className="h-24 sm:h-28 rounded-md overflow-hidden bg-muted">
                <WeedImage weedId={target.id} stage={stage} className="w-full h-full" />
              </div>
            </figure>
          ))}
        </div>

        {/* Clue cards */}
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
            Diagnostic characters {answered ? '' : `· worth ${pointsNow} pt${pointsNow === 1 ? '' : 's'} if you answer now`}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {GRASS_CLUE_FIELDS.map(({ key, label }) => {
              const open = answered || revealed.includes(key as string);
              return (
                <button
                  key={key as string}
                  onClick={() => reveal(key as string)}
                  disabled={open}
                  className={`text-left p-3 rounded-lg border transition-colors ${
                    open ? 'bg-secondary border-border cursor-default' : 'bg-card border-dashed border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    {!open && <Lock className="w-3 h-3 text-primary" />}
                    {label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 leading-snug">
                    {open ? String(target[key]) : 'Tap to reveal (−1 point)'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Answer options */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 pb-24">
          {current!.options.map((opt) => {
            const isTarget = opt.id === target.id;
            const cls = !answered
              ? 'border-border bg-card hover:border-primary'
              : isTarget
                ? 'border-success bg-success/15'
                : opt.id === picked?.id
                  ? 'border-destructive bg-destructive/15'
                  : 'border-border bg-card opacity-60';
            return (
              <button key={opt.id} onClick={() => answer(opt)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${cls}`}>
                <span className="flex items-center gap-2">
                  {answered && isTarget && <CheckCircle2 className="w-4 h-4 text-success shrink-0" />}
                  {answered && !isTarget && opt.id === picked?.id && <XCircle className="w-4 h-4 text-destructive shrink-0" />}
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{opt.commonName}</span>
                    <span className="block text-xs italic text-muted-foreground">{opt.scientificName}</span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {answered && (
        <div className="fixed bottom-0 left-0 right-0 z-[60] bg-card/95 backdrop-blur border-t-2 border-border p-3">
          <div className="max-w-6xl mx-auto flex items-center gap-4">
            <p className="flex-1 text-sm text-foreground">
              <strong>{target.commonName}</strong> — {target.quickTip}
            </p>
            <button onClick={next} className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              {round + 1 >= rounds.length ? 'Finish' : 'Next specimen'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
