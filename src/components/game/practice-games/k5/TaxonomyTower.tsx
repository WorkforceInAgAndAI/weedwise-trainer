import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface FollowUp { question: string; options: [string, string]; correctIdx: number }

const FOLLOW_UP_POOL: FollowUp[] = [
  { question: 'Which group has parallel veins in their leaves?', options: ['Monocots', 'Dicots'], correctIdx: 0 },
  { question: 'Which group has branching (net) veins in their leaves?', options: ['Dicots', 'Monocots'], correctIdx: 0 },
  { question: 'Which has two cotyledons (seed leaves)?', options: ['Dicot', 'Monocot'], correctIdx: 0 },
  { question: 'Which has one cotyledon (seed leaf)?', options: ['Monocot', 'Dicot'], correctIdx: 0 },
  { question: 'Which typically has flower parts in multiples of 3?', options: ['Monocot', 'Dicot'], correctIdx: 0 },
  { question: 'Which typically has flower parts in multiples of 4 or 5?', options: ['Dicot', 'Monocot'], correctIdx: 0 },
  { question: 'Which has fibrous roots?', options: ['Monocot', 'Dicot'], correctIdx: 0 },
  { question: 'Which has a taproot system?', options: ['Dicot', 'Monocot'], correctIdx: 0 },
  { question: 'Grasses belong to which group?', options: ['Monocot', 'Dicot'], correctIdx: 0 },
  { question: 'Broadleaf weeds belong to which group?', options: ['Dicot', 'Monocot'], correctIdx: 0 },
  { question: 'What does the prefix "mono-" mean?', options: ['1', '2'], correctIdx: 0 },
  { question: 'What does the prefix "di-" mean?', options: ['2', '1'], correctIdx: 0 },
];

const ROUND_SIZE = 6;

interface RoundData { items: typeof weeds; followUp: FollowUp; }

function buildRound(level: number): RoundData {
  const monocots = shuffle(weeds.filter(w => w.plantType === 'Monocot')).slice(0, 3);
  const dicots = shuffle(weeds.filter(w => w.plantType === 'Dicot')).slice(0, 3);
  return { items: shuffle([...monocots, ...dicots]), followUp: FOLLOW_UP_POOL[(level - 1) % FOLLOW_UP_POOL.length] };
}

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function TaxonomyTower({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);
  const round = useMemo(() => buildRound(level), [level]);
  const [placements, setPlacements] = useState<Record<string, 'Monocot' | 'Dicot'>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [phase, setPhase] = useState<'sort' | 'check' | 'followup' | 'done'>('sort');
  const [followAns, setFollowAns] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [doneAll, setDoneAll] = useState(false);

  const restart = () => { setPlacements({}); setSelectedId(null); setPhase('sort'); setFollowAns(null); setScore(0); setDoneAll(false); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  const placeIn = (bucket: 'Monocot' | 'Dicot') => {
    if (!selectedId || phase !== 'sort') return;
    setPlacements(p => ({ ...p, [selectedId]: bucket }));
    setSelectedId(null);
  };
  const unplaced = round.items.filter(w => !placements[w.id]);

  const check = () => {
    const correctCount = round.items.filter(w => placements[w.id] === w.plantType).length;
    setScore(s => s + correctCount);
    setPhase('followup');
  };

  const submitFollow = (i: number) => {
    if (followAns !== null) return;
    setFollowAns(i);
    if (i === round.followUp.correctIdx) setScore(s => s + 1);
  };

  if (doneAll) return <LevelComplete level={level} score={score} total={ROUND_SIZE + 1} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} gameId={gameId} gameName={gameName} gradeLabel={gradeLabel} />;

  const monocotBucket = round.items.filter(w => placements[w.id] === 'Monocot');
  const dicotBucket = round.items.filter(w => placements[w.id] === 'Dicot');

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Monocot or Dicot?</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-5xl mx-auto space-y-4">
          <p className="text-center text-sm text-muted-foreground">Tap a weed, then drop it into the correct bucket.</p>

          {/* Buckets */}
          <div className="grid grid-cols-2 gap-4">
            {([
              { label: 'Monocot', items: monocotBucket, color: 'border-blue-400 bg-blue-500/5' },
              { label: 'Dicot', items: dicotBucket, color: 'border-orange-400 bg-orange-500/5' },
            ] as const).map(b => (
              <button key={b.label} onClick={() => placeIn(b.label as 'Monocot' | 'Dicot')}
                className={`min-h-[180px] rounded-xl border-2 ${b.color} p-3 text-left ${selectedId && phase === 'sort' ? 'cursor-pointer hover:ring-2 ring-primary' : ''}`}>
                <p className="text-sm font-bold uppercase mb-2 text-foreground">{b.label} ({b.items.length})</p>
                <div className="grid grid-cols-3 gap-2">
                  {b.items.map(w => (
                    <div key={w.id} className="text-center">
                      <div className={`aspect-square rounded-md overflow-hidden border-2 ${
                        phase === 'sort' ? 'border-border' : (placements[w.id] === w.plantType ? 'border-green-500' : 'border-destructive')
                      }`}>
                        <WeedImage weedId={w.id} stage="flower" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[10px] mt-1 text-foreground">{w.commonName}</p>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* Unplaced cards */}
          {phase === 'sort' && unplaced.length > 0 && (
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2 uppercase">Pick a weed:</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {unplaced.map(w => (
                  <button key={w.id} onClick={() => setSelectedId(selectedId === w.id ? null : w.id)}
                    className={`p-2 rounded-lg border-2 text-center transition-all ${selectedId === w.id ? 'border-primary bg-primary/10 scale-105' : 'border-border bg-card hover:border-primary/50'}`}>
                    <div className="aspect-square rounded-md overflow-hidden bg-secondary mb-1">
                      <WeedImage weedId={w.id} stage="flower" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[10px] font-semibold text-foreground">{w.commonName}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {phase === 'sort' && unplaced.length === 0 && (
            <button onClick={check} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Answers</button>
          )}

          {/* Follow-up */}
          {phase === 'followup' && (
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              <p className="text-sm font-bold text-foreground">{round.followUp.question}</p>
              <div className="flex flex-col gap-2">
                {round.followUp.options.map((opt, i) => {
                  let cls = 'bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground';
                  if (followAns !== null) {
                    if (i === round.followUp.correctIdx) cls = 'bg-green-500/20 text-green-700 border-green-500';
                    else if (i === followAns) cls = 'bg-destructive/20 text-destructive border-destructive';
                  }
                  return (
                    <button key={i} onClick={() => submitFollow(i)} className={`w-full py-3 rounded-lg text-sm font-medium border ${cls}`}>{opt}</button>
                  );
                })}
              </div>
              {followAns !== null && (
                <button onClick={() => setDoneAll(true)} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Finish Level →</button>
              )}
            </div>
          )}
        </div>
      </div>
          <FloatingCoach grade="K-5" tip={`Monocots have one seed leaf and parallel veins. Dicots have two seed leaves and netted veins!`} />
</div>
  );
}
