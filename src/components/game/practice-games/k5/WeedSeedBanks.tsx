import { useState, useMemo, useCallback } from 'react';
import { collegiateWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import { useGameProgress } from '@/contexts/GameProgressContext';
import FarmerGuide from '@/components/game/FarmerGuide';
import { getDifficulty } from '@/lib/difficulty';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const MIN_PER_TYPE = 3;
const MAX_PER_TYPE = 40;

const seedWeeds = weeds.filter(w => w.id !== 'Field_Horsetail');

interface Pile { weed: typeof weeds[0]; count: number }

/**
 * Generates a round's piles with guaranteed-unique seed counts so that the
 * prediction step (highest/lowest seed count) never has a tie for the
 * max or min value.
 */
function generateRound(level: number, roundIdx: number, totalRounds: number, numWeedTypes: number): { piles: Pile[] } {
  const offset = ((level - 1) * totalRounds + roundIdx) * numWeedTypes;
  const rotated = [...seedWeeds.slice(offset % seedWeeds.length), ...seedWeeds.slice(0, offset % seedWeeds.length)];
  const chosen = shuffle(rotated).slice(0, numWeedTypes);

  // Draw unique counts without replacement from the allowed range so no two
  // piles ever tie (which would make the max/min prediction ambiguous).
  const range = MAX_PER_TYPE - MIN_PER_TYPE + 1;
  const pool = shuffle(Array.from({ length: range }, (_, i) => MIN_PER_TYPE + i)).slice(0, chosen.length);
  const piles = chosen.map((w, i) => ({ weed: w, count: pool[i] }));
  return { piles };
}

interface DragState { name: string; }

export default function WeedSeedBanks({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const { addBadge } = useGameProgress();
  const diff = getDifficulty(level, 'k5');
  const totalRounds = Math.max(2, Math.round(diff.rounds / 2));
  const numWeedTypes = diff.options + 1;

  const rounds = useMemo(
    () => Array.from({ length: totalRounds }, (_, i) => generateRound(level, i, totalRounds, numWeedTypes)),
    [level, totalRounds, numWeedTypes]
  );
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<'match' | 'matchReview' | 'summary' | 'predictMost' | 'predictLeast' | 'roundResult' | 'done'>('match');
  // pileIdx -> chosen weed name
  const [matches, setMatches] = useState<Record<number, string>>({});
  const [matchChecked, setMatchChecked] = useState(false);
  const [dragging, setDragging] = useState<DragState | null>(null);
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

  // Shuffled version for the prediction screens so students can't just pick the
  // first/last option in a sorted list. Recap panel still shows sorted order.
  const shuffledPiles = useMemo(() => shuffle(piles), [piles]);

  // Word bank: shuffled list of weed names from these piles.
  const nameChoices = useMemo(() => shuffle(piles.map(p => p.weed.commonName)), [piles]);
  const remainingNames = nameChoices.filter(n => !Object.values(matches).includes(n));

  const matchCorrectCount = matchChecked
    ? piles.filter((p, i) => matches[i] === p.weed.commonName).length
    : 0;
  const allMatched = piles.every((_, i) => !!matches[i]);

  const resetRound = useCallback(() => {
    setMatches({}); setMatchChecked(false); setPhase('match'); setDragging(null);
    setPredictMostAnswer(null); setPredictLeastAnswer(null);
    setPredictMostChecked(false); setPredictLeastChecked(false);
  }, []);

  const handleCheckMatch = () => {
    setMatchChecked(true);
    const correct = piles.filter((p, i) => matches[i] === p.weed.commonName).length;
    setTotalScore(s => s + correct);
    setPhase('matchReview');
  };
  const handleCheckMost = () => { setPredictMostChecked(true); if (predictMostAnswer === mostPrevalent) setTotalScore(s => s + 1); };
  const handleCheckLeast = () => { setPredictLeastChecked(true); if (predictLeastAnswer === leastPrevalent) setTotalScore(s => s + 1); };

  const nextRound = () => {
    if (round + 1 >= totalRounds) setPhase('done');
    else { setRound(r => r + 1); resetRound(); }
  };

  const dropOnPile = (pileIdx: number) => {
    if (matchChecked) return;
    if (!dragging) return;
    // Remove the name from any other pile it may already occupy, then assign.
    setMatches(m => {
      const n: Record<number, string> = {};
      for (const [k, v] of Object.entries(m)) {
        if (v !== dragging.name) n[Number(k)] = v;
      }
      n[pileIdx] = dragging.name;
      return n;
    });
    setDragging(null);
  };

  // Recap panel — shown beside prediction screens so students don't have to remember.
  const RecapPanel = () => (
    <aside className="md:w-72 shrink-0 border border-border rounded-xl bg-card p-3 self-start">
      <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-2">Round {round + 1} Recap</p>
      <p className="text-xs text-muted-foreground mb-3">These are the seed counts you just identified:</p>
      <ul className="space-y-2">
        {sortedPiles.map((p) => (
          <li key={p.weed.id} className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-lg overflow-hidden border border-border bg-secondary shrink-0">
              <WeedImage weedId={p.weed.id} stage="seed" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{p.weed.commonName}</p>
            </div>
            <span className="text-sm font-bold text-primary shrink-0">{p.count}</span>
          </li>
        ))}
      </ul>
    </aside>
  );

  if (phase === 'done') {
    addBadge({ gameId: 'weed-seed-banks', gameName: 'Weed Seed Banks', level: 'Collegiate', score: totalScore, total: totalScore + 10 });
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
            {round + 1 < totalRounds ? 'Next Round' : 'See Final Results'}
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
          <h1 className="font-display font-bold text-foreground text-lg flex-1">Predict Seed Bank Sizes</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
          <span className="text-sm text-muted-foreground">Round {round + 1}/{totalRounds}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <FarmerGuide
                gradeLabel="Collegiate"
                tone="intro"
                className="mb-3"
                message={isMost
                  ? "Look at the recap on the right and think about the seed counts you just identified. Which species produced the most seeds in this soil sample?"
                  : "Now consider the recap again. Which species produced the fewest seeds in this soil sample?"
                }
              />
              <p className="text-sm text-muted-foreground mb-4">Which weed produced the <span className="font-bold">{isMost ? 'most' : 'fewest'}</span> seeds in this sample?</p>
              <div className="grid gap-2 mb-4">
                {shuffledPiles.map(p => {
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
                      <span className="text-xs text-muted-foreground">{p.count} seeds</span>
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
                    {isMost ? 'Next: Predict Fewest Seeds' : 'Continue'}
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
          <span className="text-sm text-muted-foreground">Round {round + 1}/{totalRounds}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full">
          <FarmerGuide
            gradeLabel="Collegiate"
            tone="cheer"
            className="mb-4"
            message="Here's what's actually in the soil seed bank. Study the counts — you'll predict which species had the most and fewest seeds in a moment."
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

  if (phase === 'matchReview') {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-display font-bold text-foreground text-lg flex-1">Match Review</h1>
          <span className="text-sm text-muted-foreground">Round {round + 1}/{totalRounds}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-4xl mx-auto">
            <p className={`text-lg font-bold mb-4 text-center ${matchCorrectCount === piles.length ? 'text-green-500' : 'text-foreground'}`}>
              {matchCorrectCount}/{piles.length} matched correctly!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {piles.map((p, i) => {
                const chosenName = matches[i];
                const correct = chosenName === p.weed.commonName;
                return (
                  <div key={i} className={`rounded-2xl border-4 p-4 bg-card flex flex-col items-center gap-2 ${correct ? 'border-green-500 bg-green-500/5' : 'border-destructive bg-destructive/5'}`}>
                    <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-border bg-secondary">
                      <WeedImage weedId={p.weed.id} stage="seed" className="w-full h-full object-cover" />
                    </div>
                    <p className="text-sm font-bold text-foreground">{p.weed.commonName}</p>
                    {!correct && (
                      <p className="text-xs text-destructive">You said: {chosenName ?? '(no answer)'}</p>
                    )}
                  </div>
                );
              })}
            </div>
            <button onClick={() => setPhase('summary')} className="w-full max-w-md mx-auto block py-3 rounded-lg bg-primary text-primary-foreground font-bold">See Summary</button>
          </div>
        </div>
      </div>
    );
  }

  // Matching phase: all photos in a grid up top, all names in a word bank below.
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-display font-bold text-foreground text-lg flex-1">Match the Seeds</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">Round {round + 1}/{totalRounds}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-5xl mx-auto">
          <FarmerGuide
            gradeLabel="Collegiate"
            tone="intro"
            className="mb-4 max-w-2xl"
            message="Drag each name from the word bank onto the seed photo you think it matches. You won't be told right or wrong until you check all your matches at the end."
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {piles.map((p, i) => {
              const chosenName = matches[i];
              return (
                <div
                  key={i}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => dropOnPile(i)}
                  className={`rounded-2xl border-4 p-3 bg-card flex flex-col items-center gap-2 transition-all ${
                    chosenName ? 'border-primary/60' : 'border-dashed border-border'
                  }`}
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden border-2 border-border bg-secondary">
                    <WeedImage weedId={p.weed.id} stage="seed" className="w-full h-full object-cover" />
                  </div>
                  {chosenName ? (
                    <button
                      draggable
                      onDragStart={() => setDragging({ name: chosenName })}
                      onClick={() => setMatches(m => { const n = { ...m }; delete n[i]; return n; })}
                      className="w-full text-center px-2 py-2 rounded-lg font-bold text-xs border-2 border-primary bg-primary/10 text-primary hover:bg-primary/20 cursor-grab"
                    >
                      {chosenName}
                    </button>
                  ) : (
                    <div className="w-full text-center px-2 py-2 rounded-lg border-2 border-dashed border-muted-foreground/30 text-muted-foreground text-xs">
                      Drop name here
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="rounded-xl border border-border bg-card p-4 mb-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-bold mb-2">Word Bank</p>
            <div className="flex flex-wrap gap-2">
              {remainingNames.length === 0 && (
                <p className="text-xs text-muted-foreground">All names placed — check your matches below.</p>
              )}
              {remainingNames.map(name => (
                <button
                  key={name}
                  draggable
                  onDragStart={() => setDragging({ name })}
                  onDragEnd={() => setDragging(null)}
                  className="px-3 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium border border-border cursor-grab hover:bg-secondary/70"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {allMatched && (
            <button onClick={handleCheckMatch} className="w-full max-w-md mx-auto block py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Matches</button>
          )}
        </div>
      </div>
    </div>
  );
}
