import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

export default function NativeLookAlike({ onBack }: { onBack: () => void }) {
  const pairs = useMemo(() => {
    const result: { native: typeof weeds[0]; introduced: typeof weeds[0] }[] = [];
    const natives = weeds.filter(w => w.origin === 'Native' && w.lookAlike);
    for (const n of shuffle(natives)) {
      const match = weeds.find(w => w.id === n.lookAlike.id && w.origin === 'Introduced');
      if (match && !result.find(r => r.native.id === n.id || r.introduced.id === match.id)) {
        result.push({ native: n, introduced: match });
      }
      if (result.length >= 5) break;
    }
    if (result.length < 5) {
      const families = [...new Set(weeds.map(w => w.family))];
      for (const fam of shuffle(families)) {
        const nats = weeds.filter(w => w.family === fam && w.origin === 'Native');
        const intros = weeds.filter(w => w.family === fam && w.origin === 'Introduced');
        if (nats.length && intros.length) {
          const n = shuffle(nats)[0];
          const i = shuffle(intros)[0];
          if (!result.find(r => r.native.id === n.id || r.introduced.id === i.id)) {
            result.push({ native: n, introduced: i });
          }
        }
        if (result.length >= 5) break;
      }
    }
    return result;
  }, []);

  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<'left' | 'right' | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const done = round >= pairs.length;
  const pair = !done ? pairs[round] : null;
  const nativeIsLeft = useMemo(() => Math.random() > 0.5, [round]);
  const left = pair ? (nativeIsLeft ? pair.native : pair.introduced) : null;
  const right = pair ? (nativeIsLeft ? pair.introduced : pair.native) : null;

  const submit = () => {
    if (!selected) return;
    setSubmitted(true);
    const pickedNative = (selected === 'left' && nativeIsLeft) || (selected === 'right' && !nativeIsLeft);
    if (pickedNative) setScore(s => s + 1);
  };

  const next = () => { setRound(r => r + 1); setSelected(null); setSubmitted(false); };
  const restart = () => { setRound(0); setScore(0); setSelected(null); setSubmitted(false); };

  if (done) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Challenge Complete!</h2>
        <p className="text-lg text-foreground mb-6">{score}/{pairs.length} correct</p>
        <div className="flex gap-3">
          <button onClick={restart} className="px-6 py-3 rounded-lg bg-secondary text-foreground font-bold">Play Again</button>
          <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
        </div>
      </div>
    );
  }

  const correctSide = nativeIsLeft ? 'left' : 'right';

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Native vs. Introduced</h1>
        <span className="text-sm text-muted-foreground">{round + 1}/{pairs.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        <p className="text-sm text-muted-foreground mb-4 text-center">Which plant is native?</p>
        <div className="flex gap-4 mb-4">
          {[{ side: 'left' as const, weed: left! }, { side: 'right' as const, weed: right! }].map(({ side, weed }) => {
            const isCorrect = side === correctSide;
            const border = !submitted ? (selected === side ? 'border-primary' : 'border-border') :
              side === selected ? (isCorrect ? 'border-green-500' : 'border-destructive') :
              isCorrect ? 'border-green-500' : 'border-border';
            return (
              <button key={side} onClick={() => !submitted && setSelected(side)}
                className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${border} bg-card`}>
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-secondary mb-2">
                  <WeedImage weedId={weed.id} stage="vegetative" className="w-full h-full object-cover" />
                </div>
                <p className="text-sm font-bold text-foreground">{weed.commonName}</p>
                {submitted && <p className={`text-xs font-medium ${weed.origin === 'Native' ? 'text-green-500' : 'text-amber-500'}`}>{weed.origin}</p>}
              </button>
            );
          })}
        </div>
        {!submitted && selected && (
          <button onClick={submit} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Confirm</button>
        )}
        {submitted && (
          <div className="text-center">
            <p className={`font-bold mb-1 ${selected === correctSide ? 'text-green-500' : 'text-destructive'}`}>
              {selected === correctSide ? 'Correct!' : 'Not quite!'}
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              {pair!.native.commonName} is native. {pair!.introduced.commonName} is introduced.
            </p>
            <button onClick={next} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
