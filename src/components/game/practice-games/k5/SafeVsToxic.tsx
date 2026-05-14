import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

// Per-weed safe handling guidance, so the management answer differs by toxic plant.
// Each entry has 4 options with the safe ones varying based on the actual hazard.
interface RemovalOption { id: string; label: string; safe: boolean }
const SAFE_HANDLING_BY_WEED: Record<string, RemovalOption[]> = {
  'poison-hemlock': [
    { id: 'mask-gloves', label: 'Wear gloves AND a mask while pulling — sap and fumes are toxic', safe: true },
    { id: 'tell', label: 'Tell an adult — never touch it yourself', safe: true },
    { id: 'burn', label: 'Burn it in a bonfire to get rid of it', safe: false },
    { id: 'crush', label: 'Crush the leaves to smell what it is', safe: false },
  ],
  'poison-ivy': [
    { id: 'long-sleeves', label: 'Wear long sleeves, gloves, and pants — never touch the leaves', safe: true },
    { id: 'tell', label: 'Tell an adult to spot-treat with herbicide', safe: true },
    { id: 'pull-bare', label: 'Pull it bare-handed quickly', safe: false },
    { id: 'burn', label: 'Burn it — the smoke carries the rash-causing oils', safe: false },
  ],
  'horsenettle': [
    { id: 'gloves', label: 'Wear thick gloves — the spines on stems sting', safe: true },
    { id: 'tell', label: 'Tell an adult and stay away from the berries', safe: true },
    { id: 'eat-berries', label: 'Try the yellow berries — they look like tomatoes', safe: false },
    { id: 'bare', label: 'Pull bare-handed and toss them aside', safe: false },
  ],
  'jimsonweed': [
    { id: 'gloves', label: 'Wear gloves and wash hands afterwards — every part is poisonous', safe: true },
    { id: 'tell', label: 'Tell an adult — do not touch the seed pods', safe: true },
    { id: 'taste', label: 'Taste a seed to see what it is', safe: false },
    { id: 'rub-eyes', label: 'Touch the leaves then rub your eyes', safe: false },
  ],
  'common-burdock': [
    { id: 'gloves', label: 'Wear gloves to pull burs off — they hook into skin', safe: true },
    { id: 'tell', label: 'Tell an adult before touching the prickly burs', safe: true },
    { id: 'throw', label: 'Throw burs at friends as a joke', safe: false },
    { id: 'eat', label: 'Chew on the seed burs to see how they taste', safe: false },
  ],
  'canada-thistle': [
    { id: 'gloves', label: 'Wear thick gloves — the spines along the leaves prick', safe: true },
    { id: 'tell', label: 'Tell an adult before pulling — the spines hurt', safe: true },
    { id: 'bare', label: 'Pull it with bare hands as fast as you can', safe: false },
    { id: 'sit-on', label: 'Sit on it to flatten it', safe: false },
  ],
  'bull-thistle': [
    { id: 'gloves', label: 'Wear thick leather gloves — every leaf has long spines', safe: true },
    { id: 'tell', label: 'Tell an adult to mow or cut before flowering', safe: true },
    { id: 'grab', label: 'Grab it bare-handed — it does not look that sharp', safe: false },
    { id: 'eat-flower', label: 'Pick the purple flower like a normal flower', safe: false },
  ],
  'stinging-nettle': [
    { id: 'gloves', label: 'Wear gloves and long sleeves — the hairs sting on contact', safe: true },
    { id: 'tell', label: 'Tell an adult — do not brush against it', safe: true },
    { id: 'pull-bare', label: 'Pull it with bare hands quickly', safe: false },
    { id: 'rub', label: 'Rub the leaves on your arm to see what happens', safe: false },
  ],
};
const DEFAULT_REMOVAL_METHODS: RemovalOption[] = [
  { id: 'gloves', label: 'Wear gloves and pull it out', safe: true },
  { id: 'tell', label: 'Tell an adult and stay away', safe: true },
  { id: 'bare', label: 'Pull it out with bare hands', safe: false },
  { id: 'eat', label: 'Touch it to see if it stings', safe: false },
];
function getRemovalOptions(weedId: string): RemovalOption[] {
  return SAFE_HANDLING_BY_WEED[weedId] || DEFAULT_REMOVAL_METHODS;
}

const QUESTIONS_PER_LEVEL = 5;

export default function SafeVsToxic({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const rounds = useMemo(() => {
    const toxic = weeds.filter(w => w.safetyNote);
    const safe = weeds.filter(w => !w.safetyNote);
    const offset = (level - 1) * QUESTIONS_PER_LEVEL;
    const rotatedToxic = [...toxic.slice(offset % toxic.length), ...toxic.slice(0, offset % toxic.length)];
    return shuffle(rotatedToxic).slice(0, QUESTIONS_PER_LEVEL).map(tw => {
      const decoys = shuffle(safe.filter(s => s.family === tw.family || Math.random() > 0.5)).slice(0, 3);
      const group = shuffle([tw, ...decoys]);
      return { toxicWeed: tw, group };
    });
  }, [level]);

  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [identified, setIdentified] = useState(false);
  const [showToxicAnswer, setShowToxicAnswer] = useState(false);
  const [removalChoice, setRemovalChoice] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<Array<{ correct: boolean; weedName: string }>>([]);
  const [showSummary, setShowSummary] = useState(false);

  const done = round >= rounds.length;
  const r = !done ? rounds[round] : null;

  const identify = () => {
    setIdentified(true);
    const correct = selected === r?.toxicWeed.id;
    if (correct) setScore(s => s + 1);
    setResults(prev => [...prev, { correct, weedName: r?.toxicWeed.commonName || '' }]);
  };

  const chooseRemoval = (id: string) => setRemovalChoice(id);

  const next = () => {
    if (round + 1 >= rounds.length) {
      setShowSummary(true);
    } else {
      setRound(i => i + 1);
      setSelected(null);
      setIdentified(false);
      setShowToxicAnswer(false);
      setRemovalChoice(null);
    }
  };

  const restart = () => {
    setRound(0); setSelected(null); setIdentified(false); setShowToxicAnswer(false);
    setRemovalChoice(null); setScore(0); setResults([]); setShowSummary(false);
  };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  // Performance summary
  if (showSummary) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Performance Summary</h2>
        <p className="text-lg text-foreground mb-4">Score: <span className="font-bold text-primary">{score}/{rounds.length}</span></p>
        <div className="space-y-2 mb-6 w-full max-w-sm">
          {results.map((r, i) => (
            <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${r.correct ? 'bg-green-500/10 border border-green-500' : 'bg-destructive/10 border border-destructive'}`}>
              <span className="text-sm font-bold">{r.correct ? '✓' : '✗'}</span>
              <span className="text-sm text-foreground">{r.weedName}</span>
            </div>
          ))}
        </div>
        <LevelComplete level={level} score={score} total={rounds.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
      </div>
    );
  }

  if (done) return <LevelComplete level={level} score={score} total={rounds?.length ?? 0} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />;

  const foundCorrect = identified && selected === r?.toxicWeed.id;

  // Answer response screen after identification
  if (showToxicAnswer && r) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-bold text-foreground text-lg flex-1">Safe or Toxic?</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
          <span className="text-sm text-muted-foreground">{round + 1}/{rounds.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 max-w-md mx-auto">
          <div className="flex justify-center mb-3">
            <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-destructive bg-secondary">
              <WeedImage weedId={r.toxicWeed.id} stage="plant" className="w-full h-full object-cover" />
            </div>
          </div>
          <p className={`text-center text-lg font-bold mb-2 ${foundCorrect ? 'text-green-500' : 'text-destructive'}`}>
            {foundCorrect ? 'Correct! You found the toxic weed!' : `The toxic weed was ${r.toxicWeed.commonName}`}
          </p>
          <h3 className="text-center font-bold text-foreground text-lg mb-2">{r.toxicWeed.commonName}</h3>
          {r.toxicWeed.safetyNote && (
            <div className="bg-destructive/10 border border-destructive rounded-xl p-4 mb-4">
              <p className="text-sm font-bold text-destructive mb-1">⚠️ Why it's toxic:</p>
              <p className="text-sm text-foreground">{r.toxicWeed.safetyNote}</p>
            </div>
          )}

          {foundCorrect && !removalChoice && (
            <div className="space-y-2 mt-4">
              <p className="text-sm font-bold text-foreground text-center">How should you handle this toxic weed?</p>
              {getRemovalOptions(r.toxicWeed.id).map(m => (
                <button key={m.id} onClick={() => chooseRemoval(m.id)}
                  className="w-full py-2 px-3 rounded-lg border-2 border-border bg-card text-foreground text-sm font-medium text-left hover:border-primary transition-colors">
                  {m.label}
                </button>
              ))}
            </div>
          )}
          {(removalChoice || !foundCorrect) && (
            <div className="text-center mt-3">
              {removalChoice && (
                <p className={`text-sm font-bold mb-2 ${getRemovalOptions(r.toxicWeed.id).find(m => m.id === removalChoice)?.safe ? 'text-green-500' : 'text-destructive'}`}>
                  {getRemovalOptions(r.toxicWeed.id).find(m => m.id === removalChoice)?.safe ? 'Smart and safe choice!' : 'Not safe! Always tell an adult and wear protection.'}
                </p>
              )}
              <button onClick={next} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
                {round + 1 < rounds.length ? 'Next →' : 'See Summary'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Safe or Toxic?</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">{round + 1}/{rounds.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-sm text-muted-foreground mb-3 text-center">
          One of these weeds is toxic! Find it!
        </p>
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-4">
          {r!.group.map(w => (
            <button key={w.id} onClick={() => !identified && setSelected(w.id)}
              className={`rounded-xl overflow-hidden border-2 transition-all ${
                selected === w.id ? 'border-primary scale-105' : 'border-border hover:border-primary/50'
              }`}>
              <div className="aspect-square bg-secondary">
                <WeedImage weedId={w.id} stage="plant" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs font-medium text-foreground p-1.5 text-center">{w.commonName}</p>
            </button>
          ))}
        </div>
        {!identified && selected && (
          <button onClick={() => { identify(); setShowToxicAnswer(true); }}
            className="w-full max-w-sm mx-auto block py-3 rounded-lg bg-destructive text-destructive-foreground font-bold">
            That's the toxic one!
          </button>
        )}
      </div>
    </div>
  );
}
