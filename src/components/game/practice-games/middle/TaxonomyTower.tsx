import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface Level { question: string; optionA: string; optionB: string; correct: 'A' | 'B'; }

function buildLevels(target: typeof weeds[0]): Level[] {
  const levels: Level[] = [];
  levels.push({
    question: 'What type of plant is it?',
    optionA: 'Monocot', optionB: 'Dicot',
    correct: target.plantType === 'Monocot' ? 'A' : 'B',
  });
  const families = [...new Set(weeds.filter(w => w.plantType === target.plantType).map(w => w.family))];
  const otherFam = families.filter(f => f !== target.family);
  levels.push({
    question: 'Which plant family?',
    optionA: target.family, optionB: otherFam[0] || 'Poaceae',
    correct: 'A',
  });
  levels.push({
    question: 'What is its life cycle?',
    optionA: target.lifeCycle, optionB: target.lifeCycle === 'Annual' ? 'Perennial' : 'Annual',
    correct: 'A',
  });
  levels.push({
    question: 'Identify the weed!',
    optionA: target.commonName,
    optionB: shuffle(weeds.filter(w => w.id !== target.id))[0]?.commonName || 'Unknown',
    correct: 'A',
  });
  return levels.map(l => {
    if (Math.random() > 0.5 && l.correct === 'A') {
      return { ...l, optionA: l.optionB, optionB: l.optionA, correct: 'B' as const };
    }
    return l;
  });
}

export default function TaxonomyTower({ onBack }: { onBack: () => void }) {
  const target = useMemo(() => shuffle(weeds)[0], []);
  const levels = useMemo(() => buildLevels(target), [target]);
  const [step, setStep] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  const pick = (choice: 'A' | 'B') => {
    setTotal(t => t + 1);
    if (choice === levels[step].correct) {
      setScore(s => s + 1);
      setWrong(false);
      if (step + 1 >= levels.length) setDone(true);
      else setStep(s => s + 1);
    } else {
      setWrong(true);
    }
  };

  const restart = () => { setStep(0); setWrong(false); setDone(false); setScore(0); setTotal(0); };

  if (done) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-secondary mb-4">
          <WeedImage weedId={target.id} stage="vegetative" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-1">Tower Complete!</h2>
        <p className="text-foreground mb-1">You found <strong>{target.commonName}</strong></p>
        <p className="text-muted-foreground mb-6">{score}/{total} correct choices</p>
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
        <h1 className="font-bold text-foreground text-lg flex-1">Taxonomy Tower</h1>
        <span className="text-sm text-muted-foreground">Level {step + 1}/{levels.length}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-1 mb-6">
          {levels.map((_, i) => (
            <div key={i} className={`w-16 h-3 rounded ${i < step ? 'bg-green-500' : i === step ? 'bg-primary' : 'bg-secondary'}`} />
          ))}
        </div>
        <p className="text-foreground font-bold text-lg mb-1 text-center">{levels[step].question}</p>
        <p className="text-sm text-muted-foreground mb-4">Find: {target.commonName} ({target.family})</p>
        {wrong && <p className="text-destructive text-sm mb-2">Wrong! Try again.</p>}
        <div className="flex gap-4">
          <button onClick={() => pick('A')} className="px-6 py-4 rounded-xl border-2 border-border bg-card text-foreground font-bold hover:border-primary transition-all min-w-[120px]">
            {levels[step].optionA}
          </button>
          <button onClick={() => pick('B')} className="px-6 py-4 rounded-xl border-2 border-border bg-card text-foreground font-bold hover:border-primary transition-all min-w-[120px]">
            {levels[step].optionB}
          </button>
        </div>
      </div>
    </div>
  );
}
