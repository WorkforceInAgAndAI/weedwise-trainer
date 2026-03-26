import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface Choice { label: string; advantage: boolean; reason: string; }

function buildRound(you: typeof weeds[0], opponent: typeof weeds[0]) {
  const choices: { question: string; options: Choice[] }[] = [
    {
      question: 'How will you spread your leaves?',
      options: [
        { label: 'Broad flat leaves', advantage: you.plantType === 'Dicot', reason: 'Dicots shade out competitors with broad leaves.' },
        { label: 'Narrow upright leaves', advantage: you.plantType === 'Monocot', reason: 'Monocots grow densely and intercept light efficiently.' },
      ],
    },
    {
      question: 'How will you reproduce?',
      options: [
        { label: 'Produce thousands of seeds', advantage: you.lifeCycle === 'Annual', reason: 'Annuals rely on massive seed production to persist.' },
        { label: 'Spread by roots and rhizomes', advantage: you.lifeCycle === 'Perennial', reason: 'Perennials survive by spreading underground.' },
      ],
    },
    {
      question: 'When will you grow?',
      options: [
        { label: 'Grow fast in spring', advantage: you.actImmediately, reason: 'Early growth captures resources first.' },
        { label: 'Wait for summer heat', advantage: !you.actImmediately, reason: 'Late growers avoid early competition.' },
      ],
    },
  ];
  return choices;
}

export default function WeedCompetitors({ onBack }: { onBack: () => void }) {
  const matchups = useMemo(() => {
    const pool = shuffle(weeds);
    const result: { you: typeof weeds[0]; opponent: typeof weeds[0] }[] = [];
    for (let i = 0; i + 1 < pool.length && result.length < 4; i += 2) {
      result.push({ you: pool[i], opponent: pool[i + 1] });
    }
    return result;
  }, []);

  const [matchIdx, setMatchIdx] = useState(0);
  const [step, setStep] = useState(0);
  const [points, setPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const done = matchIdx >= matchups.length;
  const match = !done ? matchups[matchIdx] : null;
  const rounds = useMemo(() => match ? buildRound(match.you, match.opponent) : [], [match]);
  const stepDone = step >= rounds.length;

  const pick = (idx: number) => {
    if (answered) return;
    setPicked(idx);
    setAnswered(true);
    if (rounds[step].options[idx].advantage) {
      setPoints(p => p + 1);
      setTotalPoints(t => t + 1);
    }
  };

  const nextStep = () => {
    if (stepDone || step + 1 >= rounds.length) {
      setMatchIdx(m => m + 1);
      setStep(0);
      setPoints(0);
    } else {
      setStep(s => s + 1);
    }
    setPicked(null);
    setAnswered(false);
  };

  const restart = () => { setMatchIdx(0); setStep(0); setPoints(0); setTotalPoints(0); setPicked(null); setAnswered(false); };

  if (done) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Competition Over!</h2>
        <p className="text-lg text-foreground mb-6">{totalPoints}/{matchups.length * 3} advantages won</p>
        <div className="flex gap-3">
          <button onClick={restart} className="px-6 py-3 rounded-lg bg-secondary text-foreground font-bold">Play Again</button>
          <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Weed Competitors</h1>
        <span className="text-sm text-muted-foreground">Match {matchIdx + 1}/{matchups.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-center">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary mb-1">
              <WeedImage weedId={match!.you.id} stage="vegetative" className="w-full h-full object-cover" />
            </div>
            <p className="text-xs font-bold text-foreground">You: {match!.you.commonName}</p>
          </div>
          <span className="text-2xl font-bold text-muted-foreground">VS</span>
          <div className="text-center">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary mb-1">
              <WeedImage weedId={match!.opponent.id} stage="vegetative" className="w-full h-full object-cover" />
            </div>
            <p className="text-xs font-bold text-foreground">{match!.opponent.commonName}</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-1">Round {step + 1}/3 — Score: {points}/3</p>
        <p className="font-bold text-foreground mb-4 text-center">{rounds[step]?.question}</p>
        <div className="flex flex-col gap-3 w-full max-w-sm">
          {rounds[step]?.options.map((opt, idx) => {
            const bg = !answered ? 'border-border bg-card hover:border-primary' :
              idx === picked ? (opt.advantage ? 'border-green-500 bg-green-500/20' : 'border-destructive bg-destructive/20') :
              opt.advantage ? 'border-green-500 bg-green-500/10' : 'border-border bg-card';
            return (
              <button key={idx} onClick={() => pick(idx)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${bg}`}>
                <span className="font-bold text-sm text-foreground">{opt.label}</span>
                {answered && <p className="text-xs text-muted-foreground mt-1">{opt.reason}</p>}
              </button>
            );
          })}
        </div>
        {answered && (
          <button onClick={nextStep} className="mt-4 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
            {step + 1 >= rounds.length ? 'Next Match' : 'Next Round'}
          </button>
        )}
      </div>
    </div>
  );
}
