import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface Choice { label: string; advantage: boolean; reason: string; }

function getCompetitorBehavior(opponent: typeof weeds[0], questionIdx: number): string {
  const behaviors = [
    opponent.lifeCycle === 'Annual'
      ? `${opponent.commonName} is an annual that germinates quickly in spring, racing for early sunlight.`
      : `${opponent.commonName} is a perennial with established root reserves, giving it a head start each spring.`,
    opponent.plantType === 'Monocot'
      ? `${opponent.commonName} grows narrow, upright leaves that form dense stands and intercept light efficiently.`
      : `${opponent.commonName} spreads broad leaves that shade out shorter plants nearby.`,
    opponent.actImmediately
      ? `${opponent.commonName} emerges early and grows aggressively — it will try to dominate before others can establish.`
      : `${opponent.commonName} waits for warmer conditions before emerging, avoiding early-season competition.`,
    `${opponent.commonName} has a ${opponent.lifeCycle.toLowerCase()} life cycle and can ${opponent.lifeCycle === 'Perennial' ? 'regrow from roots each year' : 'produce thousands of seeds in a single season'}.`,
    opponent.plantType === 'Monocot'
      ? `${opponent.commonName} has fibrous roots that grip the soil tightly, making it hard to remove.`
      : `${opponent.commonName} has a taproot that reaches deep for water, even during dry spells.`,
  ];
  return behaviors[questionIdx % behaviors.length];
}

function buildRound(you: typeof weeds[0], opponent: typeof weeds[0]) {
  const allChoices: { question: string; competitorInfo: string; options: Choice[] }[] = [
    {
      question: 'How will you spread your leaves?',
      competitorInfo: getCompetitorBehavior(opponent, 0),
      options: [
        { label: 'Broad flat leaves', advantage: you.plantType === 'Dicot', reason: 'Dicots shade out competitors with broad leaves.' },
        { label: 'Narrow upright leaves', advantage: you.plantType === 'Monocot', reason: 'Monocots grow densely and intercept light efficiently.' },
        { label: 'Rosette of basal leaves', advantage: you.lifeCycle === 'Biennial', reason: 'Rosette-forming plants hug the ground and crowd out neighbors.' },
      ],
    },
    {
      question: 'How will you reproduce?',
      competitorInfo: getCompetitorBehavior(opponent, 1),
      options: [
        { label: 'Produce thousands of seeds', advantage: you.lifeCycle === 'Annual', reason: 'Annuals rely on massive seed production to persist.' },
        { label: 'Spread by roots and rhizomes', advantage: you.lifeCycle === 'Perennial', reason: 'Perennials survive by spreading underground.' },
        { label: 'Produce seeds and vegetative offshoots', advantage: you.lifeCycle === 'Perennial', reason: 'Using both strategies maximizes reproduction success.' },
      ],
    },
    {
      question: 'When will you grow?',
      competitorInfo: getCompetitorBehavior(opponent, 2),
      options: [
        { label: 'Grow fast in spring', advantage: you.actImmediately, reason: 'Early growth captures resources first.' },
        { label: 'Wait for summer heat', advantage: !you.actImmediately, reason: 'Late growers avoid early competition.' },
        { label: 'Grow year-round in mild climates', advantage: you.lifeCycle === 'Perennial', reason: 'Continuous growth means constant resource capture.' },
      ],
    },
    {
      question: 'How will you compete for water?',
      competitorInfo: getCompetitorBehavior(opponent, 3),
      options: [
        { label: 'Deep taproot to reach groundwater', advantage: you.plantType === 'Dicot', reason: 'Deep roots access water that shallow-rooted plants cannot.' },
        { label: 'Dense fibrous roots near the surface', advantage: you.plantType === 'Monocot', reason: 'Fibrous roots efficiently absorb rain before it drains deep.' },
        { label: 'Store water in thick stems', advantage: false, reason: 'Few weeds store water this way — it is more common in succulents.' },
      ],
    },
    {
      question: 'How will you handle being mowed?',
      competitorInfo: getCompetitorBehavior(opponent, 4),
      options: [
        { label: 'Regrow from buds at the base', advantage: you.lifeCycle === 'Perennial', reason: 'Perennials store energy in roots and crowns for regrowth.' },
        { label: 'Quickly flower and set seed before the next mowing', advantage: you.lifeCycle === 'Annual', reason: 'Annuals that flower fast can reproduce before being cut again.' },
        { label: 'Grow flat along the ground below the mower blade', advantage: true, reason: 'Prostrate growth avoids mowing damage entirely.' },
      ],
    },
  ];
  // Pick 3 random questions for variety
  return shuffle(allChoices).slice(0, 3);
}

function getMatchupsForLevel(level: number) {
  const offset = (level - 1) * 8;
  const rotated = [...weeds.slice(offset % weeds.length), ...weeds.slice(0, offset % weeds.length)];
  const pool = shuffle(rotated);
  const result: { you: typeof weeds[0]; opponent: typeof weeds[0] }[] = [];
  for (let i = 0; i + 1 < pool.length && result.length < 4; i += 2) {
    result.push({ you: pool[i], opponent: pool[i + 1] });
  }
  return result;
}

export default function WeedCompetitors({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const matchups = useMemo(() => getMatchupsForLevel(level), [level]);

  const [matchIdx, setMatchIdx] = useState(0);
  const [step, setStep] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [showMatchResult, setShowMatchResult] = useState(false);
  const [points, setPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const done = matchIdx >= matchups.length;
  const match = !done ? matchups[matchIdx] : null;
  const rounds = useMemo(() => match ? buildRound(match.you, match.opponent) : [], [match]);

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
    if (step + 1 >= rounds.length) {
      // Show match result screen
      setShowMatchResult(true);
    } else {
      setStep(s => s + 1);
    }
    setPicked(null);
    setAnswered(false);
  };

  const nextMatch = () => {
    setMatchIdx(m => m + 1);
    setStep(0);
    setPoints(0);
    setShowIntro(true);
    setShowMatchResult(false);
  };

  const restart = () => { setMatchIdx(0); setStep(0); setPoints(0); setTotalPoints(0); setPicked(null); setAnswered(false); setShowIntro(true); setShowMatchResult(false); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (done) {
    return <LevelComplete level={level} score={totalPoints} total={matchups.length * 3} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />;
  }

  // Match result screen
  if (showMatchResult && match) {
    const youWon = points >= 2;
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-bold text-foreground text-lg flex-1">Match Result</h1>
          <span className="text-sm text-muted-foreground">Match {matchIdx + 1}/{matchups.length}</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-md mx-auto gap-4">
          <h2 className={`text-2xl font-bold ${youWon ? 'text-green-500' : 'text-destructive'}`}>
            {youWon ? `${match.you.commonName} Wins!` : `${match.opponent.commonName} Wins!`}
          </h2>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border mb-2">
                <WeedImage weedId={match.you.id} stage="vegetative" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs font-bold text-foreground">{match.you.commonName}</p>
              <p className="text-lg font-bold text-foreground">{points}</p>
            </div>
            <span className="text-2xl font-black text-muted-foreground">-</span>
            <div className="text-center">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-border mb-2">
                <WeedImage weedId={match.opponent.id} stage="vegetative" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs font-bold text-foreground">{match.opponent.commonName}</p>
              <p className="text-lg font-bold text-foreground">{rounds.length - points}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            {youWon
              ? `${match.you.commonName} made better strategic choices and out-competed ${match.opponent.commonName}!`
              : `${match.opponent.commonName} had the advantage this time. Different traits help in different conditions.`}
          </p>
          <button onClick={nextMatch} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
            {matchIdx + 1 < matchups.length ? 'Next Match' : 'See Final Results'}
          </button>
        </div>
      </div>
    );
  }

  // Match intro screen
  if (showIntro && match) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-bold text-foreground text-lg flex-1">Weed Competitors</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
          <span className="text-sm text-muted-foreground">Match {matchIdx + 1}/{matchups.length}</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 max-w-md mx-auto">
          <h2 className="text-xl font-bold text-foreground">Match {matchIdx + 1}: Meet the Competitors</h2>

          <div className="w-full border border-border rounded-xl p-4 bg-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border shrink-0">
                <WeedImage weedId={match.you.id} stage="vegetative" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">{match.you.commonName} <span className="text-xs text-muted-foreground">(You)</span></p>
                <p className="text-xs text-muted-foreground">{match.you.plantType} - {match.you.lifeCycle}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{match.you.traits[0]}</p>
          </div>

          <div className="w-full border border-border rounded-xl p-4 bg-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border shrink-0">
                <WeedImage weedId={match.opponent.id} stage="vegetative" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">{match.opponent.commonName} <span className="text-xs text-muted-foreground">(Rival)</span></p>
                <p className="text-xs text-muted-foreground">{match.opponent.plantType} - {match.opponent.lifeCycle}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{match.opponent.traits[0]}</p>
          </div>

          <button onClick={() => setShowIntro(false)} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
            Start Match
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Weed Competitors</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">Match {matchIdx + 1}/{matchups.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        {/* Match header */}
        <div className="w-full max-w-md rounded-2xl p-4 mb-4 border border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-border mb-2">
                <WeedImage weedId={match!.you.id} stage="vegetative" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs font-bold text-foreground">{match!.you.commonName}</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase">You</p>
            </div>
            <div className="flex flex-col items-center px-2">
              <span className="text-3xl font-black text-foreground">VS</span>
              <div className="flex gap-1 mt-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className={`w-3 h-3 rounded-full ${i < points ? 'bg-green-500' : i < step ? 'bg-destructive' : 'bg-border'}`} />
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Round {step + 1}/3</p>
            </div>
            <div className="text-center flex-1">
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-border mb-2">
                <WeedImage weedId={match!.opponent.id} stage="vegetative" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs font-bold text-foreground">{match!.opponent.commonName}</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Rival</p>
            </div>
          </div>
        </div>

        {/* Competitor info */}
        <div className="w-full max-w-md bg-card rounded-xl border border-border p-3 mb-3">
          <p className="text-xs font-bold text-foreground mb-1">Competitor Intel:</p>
          <p className="text-xs text-muted-foreground">{rounds[step]?.competitorInfo}</p>
        </div>

        {/* Question card */}
        <div className="w-full max-w-md bg-card rounded-xl border border-border p-4 mb-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Your Move</p>
          <p className="font-bold text-foreground text-lg mb-4">{rounds[step]?.question}</p>
          <div className="flex flex-col gap-3">
            {rounds[step]?.options.map((opt, idx) => {
              const bg = !answered ? 'border-border bg-card hover:border-primary' :
                idx === picked ? (opt.advantage ? 'border-green-500 bg-green-500/20' : 'border-destructive bg-destructive/20') :
                opt.advantage ? 'border-green-500 bg-green-500/10' : 'border-border bg-card';
              return (
                <button key={idx} onClick={() => pick(idx)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${bg}`}>
                  <span className="font-bold text-sm text-foreground">{opt.label}</span>
                  {answered && <p className="text-xs text-muted-foreground mt-1">{opt.reason}</p>}
                </button>
              );
            })}
          </div>
        </div>

        {answered && (
          <button onClick={nextStep} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold">
            {step + 1 >= rounds.length ? 'See Match Result' : 'Next Round'}
          </button>
        )}
      </div>
    </div>
  );
}
