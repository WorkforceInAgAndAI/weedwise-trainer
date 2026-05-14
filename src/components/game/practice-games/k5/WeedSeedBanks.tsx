import { useState, useMemo, useCallback } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const TOTAL_ROUNDS = 3;
const NUM_WEED_TYPES = 5;
const MIN_PER_TYPE = 3;
const MAX_PER_TYPE = 12;

const seedWeeds = weeds.filter(w => w.id !== 'Field_Horsetail');

interface Pile { weed: typeof weeds[0]; count: number }

function generateRound(level: number, roundIdx: number): { piles: Pile[] } {
  const offset = ((level - 1) * TOTAL_ROUNDS + roundIdx) * NUM_WEED_TYPES;
  const rotated = [...seedWeeds.slice(offset % seedWeeds.length), ...seedWeeds.slice(0, offset % seedWeeds.length)];
  const chosen = shuffle(rotated).slice(0, NUM_WEED_TYPES);
  const piles = chosen.map(w => ({
    weed: w,
    count: MIN_PER_TYPE + Math.floor(Math.random() * (MAX_PER_TYPE - MIN_PER_TYPE + 1)),
  }));
  return { piles };
}

export default function WeedSeedBanks({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const { addBadge } = useGameProgress();

  const rounds = useMemo(() => Array.from({ length: TOTAL_ROUNDS }, (_, i) => generateRound(level, i)), [level]);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<'match' | 'summary' | 'predictMost' | 'predictLeast' | 'roundResult' | 'done'>('match');
  // pileIdx -> chosen weed name
  const [matches, setMatches] = useState<Record<number, string>>({});
  const [matchChecked, setMatchChecked] = useState(false);
  const [predictMostAnswer, setPredictMostAnswer] = useState<string | null>(null);
  const [predictLeastAnswer, setPredictLeastAnswer] = useState<string | null>(null);
  const [predictMostChecked, setPredictMostChecked] = useState(false);
  const [predictLeastChecked, setPredictLeastChecked] = useState(false);
  const [totalScore, setTotalScore] = useState(0);

  const currentRound = rounds[round];
  const piles = currentRound.piles;

  // Sorted by count desc for prediction logic and recap.
  const sortedPiles = useMemo(() => [...piles].sort((a, b) => b.count - a.count), [piles]);
  const mostPrevalent = sortedPiles[0]?.weed.commonName ?? '';
  const leastPrevalent = sortedPiles[sortedPiles.length - 1]?.weed.commonName ?? '';

  // Choices for matching: shuffled list of weed names from these piles.
  const nameChoices = useMemo(() => shuffle(piles.map(p => p.weed.commonName)), [piles]);

  const matchCorrectCount = matchChecked
    ? piles.filter((p, i) => matches[i] === p.weed.commonName).length
    : 0;
  const allMatched = piles.every((_, i) => !!matches[i]);

  const resetRound = useCallback(() => {
    setMatches({}); setMatchChecked(false); setPhase('match');
    setPredictMostAnswer(null); setPredictLeastAnswer(null);
    setPredictMostChecked(false); setPredictLeastChecked(false);
  }, []);

  const handleCheckMatch = () => {
    setMatchChecked(true);
    const correct = piles.filter((p, i) => matches[i] === p.weed.commonName).length;
    setTotalScore(s => s + correct);
  };
  const handleCheckMost = () => { setPredictMostChecked(true); if (predictMostAnswer === mostPrevalent) setTotalScore(s => s + 1); };
  const handleCheckLeast = () => { setPredictLeastChecked(true); if (predictLeastAnswer === leastPrevalent) setTotalScore(s => s + 1); };

  const nextRound = () => {
    if (round + 1 >= TOTAL_ROUNDS) setPhase('done');
    else { setRound(r => r + 1); resetRound(); }
  };

  // Recap panel — shown beside prediction screens so students don't have to remember.
  const RecapPanel = () => (
    <aside className="md:w-72 shrink-0 border border-border rounded-xl bg-card p-3 self-start">
      <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-2">Round {round + 1} Recap</p>
      <p className="text-xs text-muted-foreground mb-3">These are the seed counts you just identified:</p>
      <ul className="space-y-2">
        {sortedPiles.map((p, i) => (
          <li key={p.weed.id} className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-secondary shrink-0">
              <WeedImage weedId={p.weed.id} stage="seed" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{p.weed.commonName}</p>
              <p className="text-[10px] text-muted-foreground">{i === 0 ? 'Most seeds' : i === sortedPiles.length - 1 ? 'Fewest seeds' : ''}</p>
            </div>
            <span className="text-sm font-bold text-primary shrink-0">{p.count}</span>
          </li>
        ))}
      </ul>
    </aside>
  );

  if (phase === 'done') {
    addBadge({ gameId: 'weed-seed-banks', gameName: 'Weed Seed Banks', level: 'K-5', score: totalScore, total: totalScore + 10 });
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">All Rounds Complete!</h2>
          <p className="text-muted-foreground mb-2">Total Score: {totalScore}</p>
          <p className="text-sm text-muted-foreground mb-6">Weed seed banks can hold thousands of seeds in the soil, waiting years to sprout!</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => { setLevel(l => l + 1); setRound(0); resetRound(); setTotalScore(0); }} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next Level</button>
            <button onClick={() => { setLevel(1); setRound(0); resetRound(); setTotalScore(0); }} className="px-6 py-3 rounded-lg bg-secondary text-foreground font-bold">Start Over</button>
            <button onClick={onBack} className="px-6 py-3 rounded-lg border border-border text-foreground font-bold">Back to Games</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'roundResult') {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-display font-bold text-foreground mb-2">Round {round + 1} Complete!</h2>
          <p className="text-muted-foreground mb-1">Most Prevalent: <span className="font-bold text-foreground">{mostPrevalent}</span></p>
          <p className="text-muted-foreground mb-1">Least Prevalent: <span className="font-bold text-foreground">{leastPrevalent}</span></p>
          <p className="text-sm text-muted-foreground mt-3 mb-6">
            {predictMostAnswer === mostPrevalent && predictLeastAnswer === leastPrevalent
              ? 'Great predictions!' : 'Keep observing — seed counts tell us about future weed pressure!'}
          </p>
          <button onClick={nextRound} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
            {round + 1 < TOTAL_ROUNDS ? 'Next Round' : 'See Final Results'}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'predictLeast' || phase === 'predictMost') {
    const isMost = phase === 'predictMost';
    const answer = isMost ? predictMostAnswer : predictLeastAnswer;
    const setAnswer = isMost ? setPredictMostAnswer : setPredictLeastAnswer;
    const checked = isMost ? predictMostChecked : predictLeastChecked;
    const handleCheck = isMost ? handleCheckMost : handleCheckLeast;
    const correctName = isMost ? mostPrevalent : leastPrevalent;
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-display font-bold text-foreground text-lg flex-1">Predict: {isMost ? 'Most' : 'Least'} Prevalent</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
          <span className="text-sm text-muted-foreground">Round {round + 1}/{TOTAL_ROUNDS}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <FarmerGuide
                gradeLabel="K-5"
                tone="intro"
                className="mb-3"
                message={isMost
                  ? "Look at the recap on the right. Which weed had the MOST seeds in the soil? Those will probably show up most next year!"
                  : "Now check the recap. Which weed had the FEWEST seeds? Those should be least common next year."
                }
              />
              <p className="text-sm text-muted-foreground mb-4">Which weed will be <span className="font-bold">{isMost ? 'most' : 'least'}</span> prevalent next year?</p>
              <div className="grid gap-2 mb-4">
                {sortedPiles.map(p => {
                  let cls = 'border-border bg-card text-foreground';
                  if (checked && p.weed.commonName === correctName) cls = 'border-green-500 bg-green-500/20 text-foreground';
                  else if (checked && answer === p.weed.commonName && p.weed.commonName !== correctName) cls = 'border-destructive bg-destructive/20 text-foreground';
                  else if (answer === p.weed.commonName) cls = 'border-primary bg-primary/10 text-primary';
                  return (
                    <button key={p.weed.id} onClick={() => !checked && setAnswer(p.weed.commonName)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all ${cls}`}>
                      <div className="w-12 h-12 rounded-lg overflow-hidden border-2 border-border shrink-0">
                        <WeedImage weedId={p.weed.id} stage="seed" className="w-full h-full object-cover" />
                      </div>
                      <span className="flex-1 text-left">{p.weed.commonName}</span>
                    </button>
                  );
                })}
              </div>
              {answer && !checked && (
                <button onClick={handleCheck} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Prediction</button>
              )}
              {checked && (
                <div className="text-center mt-3">
                  <p className={`font-bold mb-3 ${answer === correctName ? 'text-green-500' : 'text-foreground'}`}>
                    {answer === correctName ? 'Correct!' : `The answer was ${correctName}`}
                  </p>
                  <button onClick={() => setPhase(isMost ? 'predictLeast' : 'roundResult')} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
                    {isMost ? 'Next: Predict Least Prevalent' : 'Continue'}
                  </button>
                </div>
              )}
            </div>
            <RecapPanel />
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'summary') {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-display font-bold text-foreground text-lg flex-1">Seed Bank Summary</h1>
          <span className="text-sm text-muted-foreground">Round {round + 1}/{TOTAL_ROUNDS}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full">
          <FarmerGuide
            gradeLabel="K-5"
            tone="cheer"
            className="mb-4"
            message="Nice work matching the seeds! Here's what's in the soil seed bank. Take a good look — you'll predict next year's most and least common weeds in a moment."
          />
          <div className="grid gap-2 mb-6">
            {sortedPiles.map(fc => (
              <div key={fc.weed.id} className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border bg-card">
                <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-border shadow-sm shrink-0">
                  <WeedImage weedId={fc.weed.id} stage="seed" className="w-full h-full object-cover" />
                </div>
                <span className="flex-1 font-medium text-foreground text-sm">{fc.weed.commonName}</span>
                <span className="text-primary font-bold">{fc.count} seeds</span>
              </div>
            ))}
          </div>
          <button onClick={() => setPhase('predictMost')} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold">
            Make Predictions
          </button>
        </div>
      </div>
    );
  }

  // Matching phase
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-display font-bold text-foreground text-lg flex-1">Match the Seeds</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">Round {round + 1}/{TOTAL_ROUNDS}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-5xl mx-auto">
          <FarmerGuide
            gradeLabel="K-5"
            tone="intro"
            className="mb-4 max-w-2xl"
            message="I dug up some soil and counted the seeds in each pile. Tap a weed name, then tap the pile of seeds it matches!"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            {piles.map((p, i) => {
              const chosenName = matches[i];
              const correct = matchChecked && chosenName === p.weed.commonName;
              const wrong = matchChecked && chosenName && chosenName !== p.weed.commonName;
              return (
                <div key={i}
                  className={`rounded-2xl border-4 p-4 bg-card flex flex-col items-center gap-3 transition-all ${
                    correct ? 'border-green-500 bg-green-500/5'
                    : wrong ? 'border-destructive bg-destructive/5'
                    : 'border-border'
                  }`}>
                  <div className="w-40 h-40 rounded-xl overflow-hidden border-2 border-border bg-secondary">
                    <WeedImage weedId={p.weed.id} stage="seed" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-sm text-muted-foreground">Pile of <span className="font-bold text-foreground">{p.count}</span> seeds</p>
                  {chosenName ? (
                    <button
                      disabled={matchChecked}
                      onClick={() => setMatches(m => { const n = { ...m }; delete n[i]; return n; })}
                      className={`w-full text-center px-3 py-2 rounded-lg font-bold text-sm border-2 ${
                        correct ? 'border-green-500 bg-green-500/10 text-green-700'
                        : wrong ? 'border-destructive bg-destructive/10 text-destructive'
                        : 'border-primary bg-primary/10 text-primary hover:bg-primary/20'
                      }`}>
                      {chosenName}
                      {matchChecked && wrong && <span className="block text-xs mt-1">Actually: {p.weed.commonName}</span>}
                    </button>
                  ) : (
                    <NameDropTarget
                      onChoose={(name) => setMatches(m => ({ ...m, [i]: name }))}
                      choices={nameChoices.filter(n => !Object.values(matches).includes(n))}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {!matchChecked && allMatched && (
            <button onClick={handleCheckMatch} className="w-full max-w-md mx-auto block py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Matches</button>
          )}
          {matchChecked && (
            <div className="text-center">
              <p className={`text-lg font-bold mb-3 ${matchCorrectCount === piles.length ? 'text-green-500' : 'text-foreground'}`}>
                {matchCorrectCount}/{piles.length} matched correctly!
              </p>
              <button onClick={() => setPhase('summary')} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">See Summary</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Inline name picker per pile — shows remaining unused names as buttons.
function NameDropTarget({ onChoose, choices }: { onChoose: (n: string) => void; choices: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-3 py-2 rounded-lg border-2 border-dashed border-primary/40 text-primary text-sm font-bold hover:bg-primary/5"
      >
        {open ? 'Close' : 'Pick a name'}
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-1.5">
          {choices.map(c => (
            <button key={c} onClick={() => { onChoose(c); setOpen(false); }}
              className="px-3 py-2 rounded-md bg-secondary text-foreground text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors">
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
