import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface FollowUp {
  question: string;
  options: [string, string];
  correctIdx: number;
}

const FOLLOW_UP_POOL: FollowUp[] = [
  { question: 'How did you know?', options: ['Monocots have parallel veins in their leaves', 'Dicots have parallel veins in their leaves'], correctIdx: 0 },
  { question: 'How did you know?', options: ['Dicots have branching (net) veins in their leaves', 'Monocots have branching (net) veins in their leaves'], correctIdx: 0 },
  { question: 'Which has two cotyledons (seed leaves)?', options: ['Dicot', 'Monocot'], correctIdx: 0 },
  { question: 'Which has one cotyledon (seed leaf)?', options: ['Monocot', 'Dicot'], correctIdx: 0 },
  { question: 'Which typically has flower parts in multiples of 3?', options: ['Monocot', 'Dicot'], correctIdx: 0 },
  { question: 'Which typically has flower parts in multiples of 4 or 5?', options: ['Dicot', 'Monocot'], correctIdx: 0 },
  { question: 'Which has fibrous roots?', options: ['Monocot', 'Dicot'], correctIdx: 0 },
  { question: 'Which has a taproot system?', options: ['Dicot', 'Monocot'], correctIdx: 0 },
  { question: 'Grasses belong to which group?', options: ['Monocot', 'Dicot'], correctIdx: 0 },
  { question: 'Broadleaf weeds belong to which group?', options: ['Dicot', 'Monocot'], correctIdx: 0 },
  { question: 'Which group has scattered vascular bundles in the stem?', options: ['Monocot', 'Dicot'], correctIdx: 0 },
  { question: 'Which group has vascular bundles arranged in a ring?', options: ['Dicot', 'Monocot'], correctIdx: 0 },
  { question: 'What does the prefix di- mean?', options: ['2', '1'], correctIdx: 0 },
  { question: 'What does the prefix mono- mean?', options: ['1', '2'], correctIdx: 0 },
  { question: 'What does the suffix -cot mean?', options: ['Cotyledon', 'Root'], correctIdx: 0 },
  { question: 'What is a cotyledon?', options: ['A place where a seed stores food to give it energy to grow', 'The outer shell that protects a seed'], correctIdx: 0 },
];

const ROUNDS_PER_LEVEL = 5;

interface RoundData {
  monocot: typeof weeds[0];
  dicot: typeof weeds[0];
  followUp: FollowUp;
}

function buildRounds(level: number): RoundData[] {
  const monocots = shuffle(weeds.filter(w => w.plantType === 'Monocot'));
  const dicots = shuffle(weeds.filter(w => w.plantType === 'Dicot'));
  const offset = ((level - 1) * ROUNDS_PER_LEVEL) % Math.min(monocots.length, dicots.length);
  const rounds: RoundData[] = [];
  const followUps = shuffle([...FOLLOW_UP_POOL]);

  for (let i = 0; i < ROUNDS_PER_LEVEL; i++) {
    const mi = (offset + i) % monocots.length;
    const di = (offset + i) % dicots.length;
    rounds.push({
      monocot: monocots[mi],
      dicot: dicots[di],
      followUp: followUps[i % followUps.length],
    });
  }
  return rounds;
}

type Phase = 'identify' | 'followup' | 'result';

export default function TaxonomyTower({ onBack }: { onBack: () => void }) {
  const { addBadge } = useGameProgress();
  const [level, setLevel] = useState(1);
  const rounds = useMemo(() => buildRounds(level), [level]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('identify');
  const [score, setScore] = useState(0);
  const [identifyCorrect, setIdentifyCorrect] = useState(false);
  const [followUpCorrect, setFollowUpCorrect] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [swapped, setSwapped] = useState(false);

  const done = roundIdx >= rounds.length;
  const round = rounds[done ? 0 : roundIdx];

  // Randomize left/right placement
  const swap = useMemo(() => Math.random() > 0.5, [roundIdx, level]);
  const leftWeed = swap ? round.dicot : round.monocot;
  const rightWeed = swap ? round.monocot : round.dicot;

  const handleIdentify = (side: 'left' | 'right', label: 'Monocot' | 'Dicot') => {
    if (phase !== 'identify') return;
    const weed = side === 'left' ? leftWeed : rightWeed;
    const correct = weed.plantType === label;
    setIdentifyCorrect(correct);
    if (correct) setScore(s => s + 1);
    setPhase('followup');
  };

  const handleFollowUp = (idx: number) => {
    if (phase !== 'followup' || selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    const correct = idx === round.followUp.correctIdx;
    setFollowUpCorrect(correct);
    if (correct) setScore(s => s + 1);
    setTimeout(() => setPhase('result'), 1000);
  };

  const nextRound = () => {
    setRoundIdx(i => i + 1);
    setPhase('identify');
    setIdentifyCorrect(false);
    setFollowUpCorrect(false);
    setSelectedAnswer(null);
  };

  const restart = () => {
    setRoundIdx(0);
    setPhase('identify');
    setIdentifyCorrect(false);
    setFollowUpCorrect(false);
    setSelectedAnswer(null);
    setScore(0);
  };

  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (done) {
    addBadge({ gameId: 'k5-taxonomy', gameName: 'Monocot or Dicot?', level: 'K-5', score, total: rounds.length * 2 });
    return <LevelComplete level={level} score={score} total={rounds.length * 2} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />;
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Monocot or Dicot?</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">{roundIdx + 1}/{rounds.length}</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-4 gap-4 overflow-y-auto">
        {/* Show both weeds */}
        <div className="flex gap-6 items-start justify-center w-full max-w-lg">
          {[{ weed: leftWeed, side: 'left' as const }, { weed: rightWeed, side: 'right' as const }].map(({ weed, side }) => (
            <div key={weed.id + side} className="flex flex-col items-center gap-2 flex-1">
              <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-primary/30">
                <WeedImage weedId={weed.id} stage="plant" className="w-full h-full object-cover" />
              </div>
              <p className="text-sm font-bold text-foreground text-center">{weed.commonName}</p>
              {phase === 'identify' && (
                <div className="flex flex-col gap-1 w-full">
                  <button onClick={() => handleIdentify(side, 'Monocot')}
                    className="w-full py-2 rounded-lg text-sm font-medium bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                    Monocot
                  </button>
                  <button onClick={() => handleIdentify(side, 'Dicot')}
                    className="w-full py-2 rounded-lg text-sm font-medium bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
                    Dicot
                  </button>
                </div>
              )}
              {phase !== 'identify' && (
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${weed.plantType === 'Monocot' ? 'bg-blue-500/10 text-blue-600' : 'bg-orange-500/10 text-orange-600'}`}>
                  {weed.plantType}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Identify result */}
        {phase !== 'identify' && (
          <div className={`text-center px-4 py-2 rounded-lg ${identifyCorrect ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
            <p className="font-bold text-sm">
              {identifyCorrect ? 'Correct!' : `Not quite - ${round.monocot.commonName} is the Monocot and ${round.dicot.commonName} is the Dicot.`}
            </p>
          </div>
        )}

        {/* Follow-up question */}
        {phase === 'followup' && (
          <div className="w-full max-w-md bg-card border border-border rounded-xl p-4">
            <p className="text-sm font-bold text-foreground mb-3 text-center">{round.followUp.question}</p>
            <div className="flex flex-col gap-2">
              {round.followUp.options.map((opt, oi) => {
                let btnClass = 'bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground';
                if (selectedAnswer !== null) {
                  if (oi === round.followUp.correctIdx) btnClass = 'bg-green-500/20 text-green-700 border-green-500';
                  else if (oi === selectedAnswer) btnClass = 'bg-destructive/20 text-destructive border-destructive';
                }
                return (
                  <button key={oi} onClick={() => handleFollowUp(oi)}
                    className={`w-full py-3 rounded-lg text-sm font-medium transition-colors border ${btnClass}`}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Result screen */}
        {phase === 'result' && (
          <div className="w-full max-w-md bg-card border border-border rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Follow-up: {followUpCorrect ? 'Correct!' : 'Incorrect'}</p>
            <p className="text-xs text-muted-foreground mb-3">Answer: {round.followUp.options[round.followUp.correctIdx]}</p>
            <button onClick={nextRound}
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
              Next Round
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
