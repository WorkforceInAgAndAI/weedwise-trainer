import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import midwestMap from '@/assets/images/midwest-map.jpg';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const MIDWEST_STATES: { name: string; x: number; y: number }[] = [
  { name: 'Minnesota', x: 52, y: 24 },
  { name: 'Wisconsin', x: 60, y: 28 },
  { name: 'Iowa', x: 50, y: 42 },
  { name: 'Illinois', x: 58, y: 50 },
  { name: 'Indiana', x: 65, y: 50 },
  { name: 'Ohio', x: 72, y: 46 },
  { name: 'Missouri', x: 52, y: 60 },
  { name: 'Kansas', x: 40, y: 58 },
  { name: 'Nebraska', x: 38, y: 40 },
  { name: 'Michigan', x: 67, y: 30 },
  { name: 'North Dakota', x: 42, y: 18 },
  { name: 'South Dakota', x: 42, y: 28 },
];

const ORIGINS: Record<string, string> = {};
weeds.forEach(w => {
  if (w.origin === 'Introduced') {
    const regions = ['Asia', 'Europe', 'South America', 'Africa', 'Central America'];
    ORIGINS[w.id] = regions[Math.abs(w.id.charCodeAt(0)) % regions.length];
  }
});

const QUESTIONS_PER_ROUND = 8;
const ROUNDS_PER_LEVEL = 3;

export default function InvasiveID({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);

  const allRounds = useMemo(() => {
    const result: Array<Array<{ weed: typeof weeds[0]; state: typeof MIDWEST_STATES[0]; originRegion: string }>> = [];
    for (let r = 0; r < ROUNDS_PER_LEVEL; r++) {
      const offset = ((level - 1) * ROUNDS_PER_LEVEL + r) * QUESTIONS_PER_ROUND;
      const rotated = [...weeds.slice(offset % weeds.length), ...weeds.slice(0, offset % weeds.length)];
      const roundWeeds = shuffle(rotated).slice(0, QUESTIONS_PER_ROUND).map((w, i) => ({
        weed: w,
        state: MIDWEST_STATES[i % MIDWEST_STATES.length],
        originRegion: w.origin === 'Introduced' ? (ORIGINS[w.id] || 'Europe') : 'North America',
      }));
      result.push(roundWeeds);
    }
    return result;
  }, [level]);

  const [roundIdx, setRoundIdx] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [roundScore, setRoundScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [clickedDot, setClickedDot] = useState(false);
  const [showRoundSummary, setShowRoundSummary] = useState(false);

  const rounds = allRounds[roundIdx] || [];
  const done = roundIdx >= ROUNDS_PER_LEVEL;
  const r = questionIdx < rounds.length ? rounds[questionIdx] : null;
  const isInvasive = r?.weed.origin === 'Introduced';
  const roundDone = questionIdx >= rounds.length;

  const reset = () => { setQuestionIdx(0); setAnswered(false); setRoundScore(0); setChoice(null); setClickedDot(false); setShowRoundSummary(false); };
  const restart = () => { setRoundIdx(0); setTotalScore(0); reset(); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  const submit = (ans: 'native' | 'invasive') => {
    setChoice(ans);
    setAnswered(true);
    const correct = (ans === 'invasive') === isInvasive;
    if (correct) setRoundScore(s => s + 1);
  };

  const next = () => {
    if (questionIdx + 1 >= rounds.length) {
      setShowRoundSummary(true);
    } else {
      setQuestionIdx(i => i + 1);
      setAnswered(false);
      setChoice(null);
      setClickedDot(false);
    }
  };

  const nextRound = () => {
    setTotalScore(s => s + roundScore);
    setRoundIdx(r => r + 1);
    reset();
  };

  if (done) {
    const total = ROUNDS_PER_LEVEL * QUESTIONS_PER_ROUND;
    return <LevelComplete level={level} score={totalScore} total={total} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />;
  }

  // Round summary
  if (showRoundSummary) {
    const invasiveCount = rounds.filter(r => r.weed.origin === 'Introduced').length;
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-display font-bold text-foreground mb-2">Round {roundIdx + 1} Complete!</h2>
          <p className="text-foreground mb-1">Score: <span className="font-bold text-primary">{roundScore}/{rounds.length}</span></p>
          <p className="text-sm text-muted-foreground mb-2">Invasive species found: {invasiveCount} of {rounds.length}</p>
          <div className="space-y-2 my-4 max-h-48 overflow-y-auto">
            {rounds.map((q, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-left">
                <span className={q.weed.origin === 'Introduced' ? 'text-destructive font-bold' : 'text-green-500 font-bold'}>
                  {q.weed.origin === 'Introduced' ? 'Invasive' : 'Native'}
                </span>
                <span className="text-foreground">{q.weed.commonName}</span>
              </div>
            ))}
          </div>
          <button onClick={nextRound} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
            {roundIdx + 1 < ROUNDS_PER_LEVEL ? `Round ${roundIdx + 2} →` : 'See Results'}
          </button>
        </div>
      </div>
    );
  }

  const correct = choice ? ((choice === 'invasive') === isInvasive) : false;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Invasive ID</h1>
        <span className="text-sm text-muted-foreground">R{roundIdx + 1} • {questionIdx + 1}/{rounds.length}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm font-bold text-primary ml-2">{roundScore} pts</span>
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_240px] gap-4 p-4">
        {/* Left: bigger map + interaction */}
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="relative w-full max-w-3xl aspect-[16/10] rounded-2xl border-2 border-border overflow-hidden">
            <img src={midwestMap} alt="U.S. Midwest map" className="absolute inset-0 w-full h-full object-cover" />
            {MIDWEST_STATES.map(s => {
              const isCurrentDot = r && s.name === r.state.name;
              return (
                <button key={s.name}
                  onClick={() => isCurrentDot && !clickedDot && setClickedDot(true)}
                  className={`absolute w-7 h-7 rounded-full border-2 transition-all ${
                    isCurrentDot
                      ? clickedDot ? 'bg-primary border-primary scale-125' : 'bg-rose-500 border-rose-400 animate-pulse scale-110 cursor-pointer'
                      : 'bg-muted-foreground/30 border-border/50'
                  }`}
                  style={{ left: `${s.x}%`, top: `${s.y}%`, transform: 'translate(-50%, -50%)' }}
                  title={s.name}
                />
              );
            })}
          </div>
          {!clickedDot ? (
            <p className="text-sm text-muted-foreground text-center animate-pulse">Tap the glowing dot to investigate!</p>
          ) : (
            <>
              <div className="bg-card border border-border rounded-xl p-4 max-w-md w-full flex gap-4 items-center">
                <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-border bg-secondary flex-shrink-0">
                  <WeedImage weedId={r!.weed.id} stage="flower" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-foreground">{r!.weed.commonName}</h2>
                  <p className="text-sm text-muted-foreground">Found in: <strong>{r!.state.name}</strong></p>
                  <p className="text-sm text-muted-foreground">Originally from: <strong>{r!.originRegion}</strong></p>
                </div>
              </div>
              {!answered ? (
                <div className="flex gap-4">
                  <button onClick={() => submit('native')} className="px-8 py-4 rounded-xl bg-primary text-primary-foreground text-lg font-bold">Native</button>
                  <button onClick={() => submit('invasive')} className="px-8 py-4 rounded-xl bg-destructive/90 text-destructive-foreground text-lg font-bold">Invasive</button>
                </div>
              ) : (
                <div className="text-center max-w-sm">
                  <p className={`text-lg font-bold mb-2 ${correct ? 'text-green-500' : 'text-destructive'}`}>
                    {correct ? 'Correct!' : `Not quite — this plant is ${isInvasive ? 'invasive' : 'native'}!`}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    {isInvasive ? `${r!.weed.commonName} was brought from ${r!.originRegion}.` : `${r!.weed.commonName} naturally grows in North America.`}
                  </p>
                  <button onClick={next} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next →</button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: collected weeds split by Native vs Invasive */}
        <div className="space-y-3">
          <div className="rounded-xl border-2 border-destructive/40 bg-destructive/5 p-3">
            <p className="text-xs font-bold uppercase text-destructive mb-2">Invasive ({rounds.slice(0, questionIdx + (answered ? 1 : 0)).filter(q => q.weed.origin === 'Introduced').length})</p>
            <div className="flex flex-wrap gap-1.5">
              {rounds.slice(0, questionIdx + (answered ? 1 : 0))
                .filter(q => q.weed.origin === 'Introduced')
                .map((q, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background border border-border text-xs">
                    <div className="w-7 h-7 rounded overflow-hidden bg-secondary">
                      <WeedImage weedId={q.weed.id} stage="flower" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-foreground">{q.weed.commonName}</span>
                  </div>
                ))}
              {rounds.slice(0, questionIdx + (answered ? 1 : 0)).filter(q => q.weed.origin === 'Introduced').length === 0 && (
                <span className="text-xs text-muted-foreground italic">None yet</span>
              )}
            </div>
          </div>
          <div className="rounded-xl border-2 border-green-500/40 bg-green-500/5 p-3">
            <p className="text-xs font-bold uppercase text-green-600 mb-2">Native ({rounds.slice(0, questionIdx + (answered ? 1 : 0)).filter(q => q.weed.origin === 'Native').length})</p>
            <div className="flex flex-wrap gap-1.5">
              {rounds.slice(0, questionIdx + (answered ? 1 : 0))
                .filter(q => q.weed.origin === 'Native')
                .map((q, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-background border border-border text-xs">
                    <div className="w-7 h-7 rounded overflow-hidden bg-secondary">
                      <WeedImage weedId={q.weed.id} stage="flower" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-foreground">{q.weed.commonName}</span>
                  </div>
                ))}
              {rounds.slice(0, questionIdx + (answered ? 1 : 0)).filter(q => q.weed.origin === 'Native').length === 0 && (
                <span className="text-xs text-muted-foreground italic">None yet</span>
              )}
            </div>
          </div>
        </div>
      </div>
          <FloatingCoach grade="K-5" tip={`Invasive species don't belong here naturally — they crowd out native plants. Look for the ones that came from far away!`} />
</div>
  );
}
