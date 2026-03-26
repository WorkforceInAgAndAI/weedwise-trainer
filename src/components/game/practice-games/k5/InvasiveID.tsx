import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const MIDWEST_STATES = ['Iowa', 'Illinois', 'Indiana', 'Ohio', 'Minnesota', 'Wisconsin', 'Missouri', 'Kansas', 'Nebraska'];
const ORIGINS: Record<string, string> = {};
weeds.forEach(w => {
  if (w.origin === 'Introduced') {
    const regions = ['Asia', 'Europe', 'South America', 'Africa', 'Central America'];
    ORIGINS[w.id] = regions[Math.abs(w.id.charCodeAt(0)) % regions.length];
  }
});

export default function InvasiveID({ onBack }: { onBack: () => void }) {
  const rounds = useMemo(() => shuffle(weeds).slice(0, 8).map(w => ({
    weed: w,
    foundIn: MIDWEST_STATES[Math.floor(Math.random() * MIDWEST_STATES.length)],
    originRegion: w.origin === 'Introduced' ? (ORIGINS[w.id] || 'Europe') : 'North America',
  })), []);

  const [round, setRound] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);

  const done = round >= rounds.length;
  const r = !done ? rounds[round] : null;
  const isInvasive = r?.weed.origin === 'Introduced';

  const submit = (ans: 'native' | 'invasive') => {
    setChoice(ans);
    setAnswered(true);
    const correct = (ans === 'invasive') === isInvasive;
    if (correct) setScore(s => s + 1);
  };

  const next = () => { setRound(i => i + 1); setAnswered(false); setChoice(null); };

  if (done) return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🌐</div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Great Work!</h2>
        <p className="text-muted-foreground mb-6">Score: {score}/{rounds.length}</p>
        <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
      </div>
    </div>
  );

  const correct = choice ? ((choice === 'invasive') === isInvasive) : false;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Invasive ID</h1>
        <span className="text-sm text-muted-foreground">{round + 1}/{rounds.length}</span>
        <span className="text-sm font-bold text-primary ml-2">{score} pts</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4">
        <div className="w-36 h-36 rounded-xl overflow-hidden border-2 border-border bg-secondary">
          <WeedImage weedId={r!.weed.id} stage="vegetative" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-xl font-bold text-foreground">{r!.weed.commonName}</h2>
        <div className="bg-secondary/50 rounded-xl p-4 text-center max-w-sm">
          <p className="text-sm text-foreground">Originally from: <strong>{r!.originRegion}</strong></p>
          <p className="text-sm text-foreground">Found growing in: <strong>{r!.foundIn}</strong></p>
        </div>
        {!answered ? (
          <div className="flex gap-4">
            <button onClick={() => submit('native')} className="px-8 py-4 rounded-xl bg-primary text-primary-foreground text-lg font-bold">Native</button>
            <button onClick={() => submit('invasive')} className="px-8 py-4 rounded-xl bg-destructive/90 text-destructive-foreground text-lg font-bold">Invasive</button>
          </div>
        ) : (
          <div className="text-center max-w-sm">
            <p className={`text-lg font-bold mb-2 ${correct ? 'text-primary' : 'text-destructive'}`}>
              {correct ? 'Correct!' : `Not quite — this plant is ${isInvasive ? 'invasive' : 'native'}!`}
            </p>
            <p className="text-sm text-muted-foreground mb-3">
              {isInvasive ? `${r!.weed.commonName} was brought from ${r!.originRegion} and doesn't naturally belong in ${r!.foundIn}.` : `${r!.weed.commonName} naturally grows in North America.`}
            </p>
            <button onClick={next} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
