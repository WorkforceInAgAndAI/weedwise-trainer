import { useState, useMemo, useRef, useEffect } from 'react';
import { middleSchoolWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';
import { lookAlikeGroupsForPool } from '@/data/lookAlikeGroups';
import { getDifficulty } from '@/lib/difficulty';
import { Search } from 'lucide-react';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

/**
 * Strips species names out of a field clue so the magnifying glass only reveals
 * traits, never the answer. Every species name in the whole weed list is
 * scrubbed (not just the inspected one) so a clue can never leak a sibling's
 * or the target's name either.
 */
const NAME_WORDS: string[] = Array.from(
  new Set(
    weeds
      .flatMap(w => `${w.commonName} ${w.scientificName}`.toLowerCase().replace(/[^a-z\s-]/g, ' ').split(/[\s\-/]+/))
      .filter(w => w.length >= 3),
  ),
).sort((a, b) => b.length - a.length);

function traitOnlyClue(hook: string, commonName: string, scientificName: string): string {
  const extra = `${commonName} ${scientificName}`
    .toLowerCase()
    .replace(/[^a-z\s-]/g, ' ')
    .split(/[\s\-/]+/)
    .filter(w => w.length >= 3);
  let out = hook;
  [...extra, ...NAME_WORDS].forEach(w => {
    out = out.replace(new RegExp(`\\b${w}\\w*\\b`, 'gi'), 'this plant');
  });
  return out
    .replace(/(this plant[\s,'’s]*){2,}/gi, 'this plant ')
    .replace(/\s+([,.;])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}


type Weed = typeof weeds[0];
interface Trio {
  name: string;
  weeds: Weed[];
  difference: string;
  stage: 'flower' | 'vegetative';
}

function buildTrios(pool: Weed[] = weeds): Trio[] {
  // Only official look-alikes that are inside the given weed pool.
  return lookAlikeGroupsForPool(pool).map(g => ({
    name: g.name,
    weeds: g.weeds as Weed[],
    difference: g.difference,
    stage: g.stage,
  }));
}

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; weedPool?: Weed[] }

export default function MSLookAlike({ onBack, gameId, gameName, gradeLabel, weedPool }: Props) {
  const [level, setLevel] = useState(1);
  const d = useMemo(() => getDifficulty(level, 'ms'), [level]);

  const trios = useMemo(() => {
    const all = buildTrios(weedPool);
    const perLevel = Math.max(3, Math.round(d.rounds / 2));
    // Draw a fresh random group set at every level instead of advancing through
    // the same fixed list and adding only one new group.
    return shuffle(all).slice(0, Math.min(perLevel, all.length));
  }, [level, d.rounds, weedPool]);

  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<{ targetName: string; correct: boolean; ids: string[]; stage: 'flower' | 'vegetative' }[]>([]);

  // ---- Magnifying glass -------------------------------------------------
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [lens, setLens] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [inspecting, setInspecting] = useState<Weed | null>(null);

  const done = round >= trios.length;
  const trio = !done ? trios[round] : null;

  // Pick a target species per round and shuffle option order
  const { target, options } = useMemo(() => {
    if (!trio) return { target: null as Weed | null, options: [] as Weed[] };
    const idx = Math.floor(Math.random() * trio.weeds.length);
    const t = trio.weeds[idx];
    return { target: t as Weed | null, options: shuffle([...trio.weeds]) };
  }, [trio]);

  // Park the lens back at its home slot at the start of each round.
  useEffect(() => { setLens(null); setInspecting(null); }, [round, level]);

  const lensSize = 132;

  const moveLens = (clientX: number, clientY: number) => {
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setLens({ x: clientX - r.left, y: clientY - r.top });
    // Which option card is under the glass?
    const hit = options.find(w => {
      const c = cardRefs.current[w.id];
      if (!c) return false;
      const cr = c.getBoundingClientRect();
      return clientX >= cr.left && clientX <= cr.right && clientY >= cr.top && clientY <= cr.bottom;
    });
    setInspecting(hit ?? null);
  };

  const restart = () => { setRound(0); setSelected(null); setSubmitted(false); setScore(0); setHistory([]); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  const submit = (id: string) => {
    if (submitted || !target) return;
    setSelected(id);
    setSubmitted(true);
    const ok = id === target.id;
    if (ok) setScore(s => s + 1);
    if (trio) setHistory(h => [...h, { targetName: target.commonName, correct: ok, ids: trio.weeds.map(w => w.id), stage: trio.stage }]);
  };

  const next = () => { setRound(r => r + 1); setSelected(null); setSubmitted(false); };

  if (done) return <LevelComplete level={level} score={score} total={trios.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} gameId={gameId} gameName={gameName} gradeLabel={gradeLabel} />;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-50 via-sky-50 to-amber-50 dark:from-emerald-950 dark:via-sky-950 dark:to-slate-950 z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b-2 border-emerald-200 dark:border-emerald-900 bg-white/60 dark:bg-slate-900/60 backdrop-blur">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Look-Alikes</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">{round + 1}/{trios.length}</span>
      </div>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 p-4 overflow-y-auto">
        <div
          ref={stageRef}
          onPointerMove={e => { if (dragging) moveLens(e.clientX, e.clientY); }}
          onPointerUp={() => setDragging(false)}
          onPointerLeave={() => setDragging(false)}
          className="relative flex flex-col items-center justify-start gap-4 touch-none"
        >
          <p className="text-foreground font-bold text-lg text-center">
            Which one is <span className="text-primary">{target?.commonName}</span>
            {target && <span className="block text-xs italic text-primary mt-1">({target.scientificName})</span>}?
          </p>

          <div className={`grid gap-3 sm:gap-4 w-full ${options.length === 2 ? 'grid-cols-2 max-w-xl' : 'grid-cols-3 max-w-3xl'}`}>
            {options.map(w => (
              <div
                key={w.id}
                ref={el => { cardRefs.current[w.id] = el; }}
                className={`rounded-xl overflow-hidden border-[3px] bg-card transition-all ${
                  selected === w.id ? 'border-primary scale-[1.02] shadow-lg' : 'border-border'
                } ${submitted && w.id === target?.id ? 'ring-2 ring-green-500' : ''} ${
                  submitted && selected === w.id && w.id !== target?.id ? 'ring-2 ring-destructive' : ''
                } ${inspecting?.id === w.id ? 'ring-4 ring-amber-400' : ''}`}
              >
                <div className="aspect-square bg-secondary">
                  <WeedImage weedId={w.id} stage={trio?.stage ?? 'flower'} className="w-full h-full object-cover" />
                </div>
                {submitted ? (
                  <div className="p-2 text-center">
                    <p className={`text-xs font-bold leading-tight ${w.id === target?.id ? 'text-green-600' : 'text-foreground'}`}>{w.commonName}</p>
                    <p className="text-[10px] italic text-primary leading-tight mt-0.5">{w.scientificName}</p>
                  </div>
                ) : (
                  <button
                    onClick={() => submit(w.id)}
                    className="w-full py-2 bg-primary text-primary-foreground font-bold text-sm hover:opacity-90"
                  >
                    Select
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Magnifying glass tool */}
          {!submitted && (
            <div className="w-full max-w-3xl flex items-start gap-3">
              <div
                onPointerDown={e => {
                  e.preventDefault();
                  (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
                  setDragging(true);
                  moveLens(e.clientX, e.clientY);
                }}
                className="shrink-0 w-20 h-20 rounded-full border-4 border-amber-700 bg-amber-100/70 dark:bg-amber-900/40 flex items-center justify-center cursor-grab active:cursor-grabbing shadow-md"
                title="Drag the magnifying glass over a plant"
              >
                <Search className="w-8 h-8 text-amber-800 dark:text-amber-300" />
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="font-bold text-foreground">Field lens:</span> drag the magnifying glass on top of a
                plant to read a field clue about that species. Then press <span className="font-bold">Select</span>
                {' '}under the plant you think is the answer.
              </p>
            </div>
          )}

          {/* The lens itself, following the pointer */}
          {lens && !submitted && (
            <div
              className="pointer-events-none absolute z-30"
              style={{ left: lens.x, top: lens.y, transform: 'translate(-50%,-50%)' }}
            >
              <div
                className="rounded-full border-8 border-amber-800/80 bg-sky-200/20 backdrop-brightness-125 shadow-2xl"
                style={{ width: lensSize, height: lensSize }}
              />
              {inspecting && (
                <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 w-56 rounded-lg border-2 border-amber-500 bg-card p-2 shadow-xl">
                  <p className="text-[11px] font-bold text-foreground">Field clue</p>
                  <p className="text-xs text-foreground leading-snug">{traitOnlyClue(inspecting.memoryHook, inspecting.commonName, inspecting.scientificName)}</p>
                </div>
              )}
            </div>
          )}

          {submitted && (
            <div className="text-center max-w-2xl bg-card border border-border rounded-lg p-4 space-y-2">
              <p className={`text-lg font-bold ${selected === target?.id ? 'text-green-600' : 'text-destructive'}`}>
                {selected === target?.id
                  ? 'Correct!'
                  : `Not quite! You chose ${options.find(o => o.id === selected)?.commonName} (${options.find(o => o.id === selected)?.scientificName}). The correct answer was ${target?.commonName} (${target?.scientificName}).`}
              </p>
              <p className="text-xs font-bold uppercase tracking-wide text-primary">{trio?.name}</p>
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
                <div className={`grid gap-1 ${h.ids.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {h.ids.map(id => (
                    <div key={id} className="aspect-square rounded overflow-hidden">
                      <WeedImage weedId={id} stage={h.stage} className="w-full h-full object-cover" />
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
