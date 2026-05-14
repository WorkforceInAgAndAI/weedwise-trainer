import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

// Each invasive weed has multiple verified negative effects; we rotate which one shows per round
// so students see different impacts each time.
const EFFECTS_BY_WEED: Record<string, string[]> = {
  'waterhemp': [
    'Overtakes soybean fields and resists 7 different herbicide groups',
    'A single female plant produces over a million seeds in one season',
    'Reduces soybean yields by up to 40% when uncontrolled',
  ],
  'palmer-amaranth': [
    'Grows over 2 inches per day, blocking sunlight from crops',
    'Stalks grow so thick they break combines at harvest',
    'A single plant can cut corn yields by 50% in nearby rows',
  ],
  'kochia': [
    'Spreads rapidly as a tumbleweed across dry farmland',
    'Tolerates salty soils where most crops cannot grow',
    'Resistant to glyphosate and several other herbicides',
  ],
  'johnsongrass': [
    'Takes over pastures and is toxic to livestock when stressed',
    'Spreads aggressively from underground rhizomes — hard to kill',
    'Releases chemicals from roots that stunt nearby crops',
  ],
  'canada-thistle': [
    'Spreads by underground roots across meadows and fields',
    'Sharp spines injure livestock and make hay unpalatable',
    'Even a small root piece left in soil can grow a new plant',
  ],
  'giant-ragweed': [
    'Causes severe seasonal allergies in millions of people',
    'Shades out soybeans and corn, slashing yields by up to 90%',
    'Some populations resist both glyphosate and ALS herbicides',
  ],
  'marestail': [
    'One of the first weeds to resist glyphosate herbicide',
    'Tiny pappus seeds float for miles, spreading into new fields',
    'A single plant produces up to 200,000 seeds',
  ],
  'morningglory': [
    'Wraps around crops and pulls them down at harvest',
    'Vines clog combines, slowing soybean and corn harvest',
    'Hard seeds stay viable in the soil for over 20 years',
  ],
  'barnyardgrass': [
    'Steals water and nutrients from rice and corn fields',
    'Mimics rice seedlings, making it hard to spot and remove',
    'A single plant can produce 40,000 seeds in one season',
  ],
  'large-crabgrass': [
    'Invades lawns and gardens, crowding out desired plants',
    'Grows flat to dodge mower blades and keep spreading',
    'Thrives in hot, dry summer conditions when grass is stressed',
  ],
};

const ITEMS_PER_ROUND = 5;
const ROUNDS_PER_LEVEL = 3;

export default function InvasiveMatch({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const [roundNum, setRoundNum] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  const allInvasive = useMemo(() => {
    return weeds.filter(w => w.origin === 'Introduced' && EFFECTS_BY_WEED[w.id]);
  }, []);

  const items = useMemo(() => {
    const offset = ((level - 1) * ROUNDS_PER_LEVEL + roundNum) * ITEMS_PER_ROUND;
    const rotated = [...allInvasive.slice(offset % allInvasive.length), ...allInvasive.slice(0, offset % allInvasive.length)];
    return shuffle(rotated).slice(0, ITEMS_PER_ROUND).map(w => {
      const effects = EFFECTS_BY_WEED[w.id];
      // Rotate which effect is shown per (level, roundNum) so it varies each playthrough
      const idx = (level + roundNum + w.id.length) % effects.length;
      return { weed: w, effect: effects[idx] };
    });
  }, [level, roundNum, allInvasive]);

  const shuffledEffects = useMemo(() => shuffle(items.map(i => ({ weedId: i.weed.id, effect: i.effect }))), [items]);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [selectedWeed, setSelectedWeed] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [showReview, setShowReview] = useState(false);

  const resetRound = () => { setMatches({}); setSelectedWeed(null); setChecked(false); setShowReview(false); };
  const restart = () => { setRoundNum(0); setTotalScore(0); resetRound(); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  const handleEffectClick = (weedId: string) => {
    if (!selectedWeed || checked) return;
    setMatches(m => ({ ...m, [selectedWeed]: weedId }));
    setSelectedWeed(null);
  };

  const allMatched = Object.keys(matches).length === items.length;
  const correctCount = checked ? items.filter(i => matches[i.weed.id] === i.weed.id).length : 0;
  const done = roundNum >= ROUNDS_PER_LEVEL;

  if (done) {
    const total = ROUNDS_PER_LEVEL * ITEMS_PER_ROUND;
    return <LevelComplete level={level} score={totalScore} total={total} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />;
  }

  // Review screen with answer response
  if (showReview) return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Answer Review</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">Round {roundNum + 1}/{ROUNDS_PER_LEVEL}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-lg mx-auto space-y-3">
          <p className={`text-center text-lg font-bold mb-4 ${correctCount === items.length ? 'text-green-500' : 'text-foreground'}`}>
            {correctCount}/{items.length} correct!
          </p>
          {items.map(i => {
            const userMatch = matches[i.weed.id];
            const isCorrect = userMatch === i.weed.id;
            const userEffect = userMatch ? shuffledEffects.find(e => e.weedId === userMatch)?.effect : 'No answer';
            return (
              <div key={i.weed.id} className={`rounded-xl border-2 p-4 ${isCorrect ? 'border-green-500 bg-green-500/10' : 'border-destructive bg-destructive/10'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{isCorrect ? '✓' : '✗'}</span>
                  <span className="font-bold text-foreground">{i.weed.commonName}</span>
                </div>
                {!isCorrect && <p className="text-sm text-destructive mb-1">Your answer: {userEffect}</p>}
                <p className="text-sm text-green-600">Correct: {i.effect}</p>
              </div>
            );
          })}
          <button onClick={() => { setTotalScore(s => s + correctCount); setRoundNum(r => r + 1); resetRound(); }}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold mt-4">
            {roundNum + 1 < ROUNDS_PER_LEVEL ? `Round ${roundNum + 2} →` : 'See Results'}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Invasive Match</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">Round {roundNum + 1}/{ROUNDS_PER_LEVEL}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-sm text-muted-foreground mb-4 text-center">Match each invasive weed to the damage it causes</p>
        <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
          <div className="space-y-2">
            <p className="text-xs font-bold text-foreground text-center">Invasive Weeds</p>
            {items.map(i => (
              <button key={i.weed.id} onClick={() => !checked && setSelectedWeed(i.weed.id)}
                className={`w-full p-2 rounded-lg border-2 text-sm font-medium text-left transition-all flex items-center gap-2 ${
                  selectedWeed === i.weed.id ? 'border-primary bg-primary/10 text-primary' :
                  matches[i.weed.id] ? 'border-primary/30 bg-primary/5 text-foreground' : 'border-border text-foreground hover:border-primary/50'
                }`}>
                <div className="w-16 h-16 rounded-lg overflow-hidden border border-border bg-secondary shrink-0">
                  <WeedImage weedId={i.weed.id} stage="vegetative" className="w-full h-full object-cover" />
                </div>
                <span className="text-xs leading-tight">{i.weed.commonName}</span>
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-foreground text-center">Negative Effects</p>
            {shuffledEffects.map(e => {
              const matchedBy = Object.entries(matches).find(([, v]) => v === e.weedId)?.[0];
              return (
                <button key={e.weedId} onClick={() => handleEffectClick(e.weedId)}
                  className={`w-full py-2 px-3 rounded-lg border-2 text-xs text-left transition-all ${
                    matchedBy ? (checked ? (matchedBy === e.weedId ? 'border-green-500 bg-green-500/10' : 'border-destructive bg-destructive/10') : 'border-primary/30 bg-primary/5') :
                    selectedWeed ? 'border-border hover:border-primary cursor-pointer' : 'border-border'
                  } text-foreground`}>
                  {e.effect}
                </button>
              );
            })}
          </div>
        </div>
        {allMatched && !checked && (
          <button onClick={() => setChecked(true)} className="w-full max-w-lg mx-auto block mt-4 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Check Matches</button>
        )}
        {checked && (
          <div className="text-center mt-4">
            <p className="text-lg font-bold text-foreground mb-3">{correctCount}/{items.length} correct!</p>
            <button onClick={() => setShowReview(true)} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Review Answers →</button>
          </div>
        )}
      </div>
          <FloatingCoach grade="K-5" tip={`Each invasive weed causes its own kind of trouble. Match it to what it does to the field!`} />
</div>
  );
}
