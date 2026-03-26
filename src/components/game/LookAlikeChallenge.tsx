import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import type { Weed } from '@/types/game';
import WeedImage from './WeedImage';

// Group weeds by family, only families with 2+ members
function getFamilyPairs(): Array<[Weed, Weed]> {
  const byFamily: Record<string, Weed[]> = {};
  weeds.forEach(w => {
    if (!byFamily[w.family]) byFamily[w.family] = [];
    byFamily[w.family].push(w);
  });
  const pairs: Array<[Weed, Weed]> = [];
  Object.values(byFamily).forEach(group => {
    if (group.length < 2) return;
    for (let i = 0; i < group.length - 1; i++) {
      for (let j = i + 1; j < group.length; j++) {
        pairs.push([group[i], group[j]]);
      }
    }
  });
  return pairs;
}

// Invasive vs native pairs from the same family
function getInvasiveNativePairs(): Array<[Weed, Weed]> {
  const invasive = weeds.filter(w => w.origin === 'Introduced');
  const native = weeds.filter(w => w.origin === 'Native');
  const pairs: Array<[Weed, Weed]> = [];
  const used = new Set<string>();
  invasive.forEach(inv => {
    const match = native.find(nat => nat.family === inv.family && !used.has(nat.id));
    if (match) {
      used.add(match.id);
      used.add(inv.id);
      pairs.push([inv, match]);
    }
  });
  return pairs;
}

interface Props {
  onComplete: (results: Array<{ weedId: string; correct: boolean }>) => void;
  onNext: () => void;
}

export default function LookAlikeChallenge({ onComplete, onNext }: Props) {
  const STAGES = ['seedling', 'vegetative', 'flower', 'whole'] as const;
  const pair = useMemo(() => {
    const pairs = getFamilyPairs();
    const p = pairs[Math.floor(Math.random() * pairs.length)];
    const flipped = Math.random() < 0.5;
    const stage = STAGES[Math.floor(Math.random() * STAGES.length)];
    return { weedA: flipped ? p[1] : p[0], weedB: flipped ? p[0] : p[1], target: flipped ? p[1] : p[0], stage };
  }, []);

  const [choice, setChoice] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = choice === pair.target.id;

  const handleSubmit = () => {
    if (!choice) return;
    setSubmitted(true);
    onComplete([
      { weedId: pair.target.id, correct: isCorrect },
    ]);
  };

  const lookAlikeInfo = pair.weedA.lookAlike.id === pair.weedB.id
    ? pair.weedA.lookAlike.difference
    : pair.weedB.lookAlike.id === pair.weedA.id
      ? pair.weedB.lookAlike.difference
      : `${pair.weedA.commonName} and ${pair.weedB.commonName} are both in the ${pair.weedA.family} family.`;

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6 space-y-4 animate-scale-in">
      <div>
        <h2 className="font-display font-bold text-lg text-foreground">🔍 Look-Alike Challenge</h2>
        <p className="text-sm text-muted-foreground">Both species are in the <span className="text-primary font-semibold">{pair.weedA.family}</span> family. Which image shows <span className="text-foreground font-bold">{pair.target.commonName}</span>?</p>
      </div>

      {/* Side by side images */}
      <div className="grid grid-cols-2 gap-4">
        {[pair.weedA, pair.weedB].map(w => (
          <button key={w.id} onClick={() => !submitted && setChoice(w.id)}
            disabled={submitted}
            className={`rounded-xl border-2 overflow-hidden transition-all ${
              submitted
                ? w.id === pair.target.id ? 'border-accent ring-2 ring-accent/30' : choice === w.id ? 'border-destructive' : 'border-border opacity-50'
                : choice === w.id ? 'border-primary ring-2 ring-primary/30 scale-[1.02]' : 'border-border hover:border-primary/50'
            }`}>
            <div className="h-40 sm:h-52 overflow-hidden">
              <WeedImage weedId={w.id} stage={pair.stage} className="w-full h-full" />
            </div>
            <div className="p-3 bg-secondary/50">
              {submitted ? (
                <div className="text-sm font-semibold text-foreground">{w.commonName}</div>
              ) : (
                <div className="text-sm text-muted-foreground">Tap to select</div>
              )}
              {submitted && (
                <ul className="text-[10px] text-muted-foreground mt-1 space-y-0.5">
                  {w.traits.slice(0, 2).map((t, i) => <li key={i}>• {t}</li>)}
                </ul>
              )}
            </div>
          </button>
        ))}
      </div>

      {!submitted && choice && (
        <button onClick={handleSubmit} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity">
          Confirm Selection
        </button>
      )}

      {submitted && (
        <div className={`rounded-lg p-4 space-y-2 animate-scale-in ${isCorrect ? 'bg-accent/15 border border-accent/50' : 'bg-destructive/15 border border-destructive/50'}`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{isCorrect ? '✅' : '❌'}</span>
            <span className={`font-display font-bold ${isCorrect ? 'text-accent' : 'text-destructive'}`}>{isCorrect ? 'Correct!' : 'Not Quite'}</span>
          </div>
          <p className="text-sm text-foreground"><span className="text-primary font-semibold">Key difference:</span> {lookAlikeInfo}</p>
          <button onClick={onNext} className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity mt-2">NEXT →</button>
        </div>
      )}
    </div>
  );
}
