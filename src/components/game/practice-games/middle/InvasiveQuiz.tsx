import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

type ArrivalMethod = 'accident' | 'purpose' | 'other-species';

interface TravelerRound {
  weed: typeof weeds[0];
  method: ArrivalMethod;
  story: string;
}

const ARRIVAL_LABELS: Record<ArrivalMethod, string> = {
  accident: 'By Accident',
  purpose: 'On Purpose',
  'other-species': 'Through Other Species',
};

const ARRIVAL_DESCRIPTIONS: Record<ArrivalMethod, string> = {
  accident: 'Arrived unintentionally through shipping, contaminated seed, or ballast water.',
  purpose: 'Brought intentionally for agriculture, landscaping, or erosion control.',
  'other-species': 'Spread by attaching to animals, livestock, or through other plant trade.',
};

function getArrivalMethod(w: typeof weeds[0]): ArrivalMethod {
  const t = `${w.habitat} ${w.commonName} ${w.management}`.toLowerCase();
  if (t.match(/ornament|garden|crop|forage|pasture|erosion|medicin|landscap/)) return 'purpose';
  if (t.match(/animal|bird|livest|fur|attach|hitchhik/)) return 'other-species';
  return 'accident';
}

function getStory(w: typeof weeds[0], method: ArrivalMethod): string {
  switch (method) {
    case 'purpose':
      return `${w.commonName} was likely brought to the Midwest intentionally, possibly as a forage crop, ornamental plant, or for erosion control. It escaped cultivation and became invasive.`;
    case 'other-species':
      return `${w.commonName} likely spread to the Midwest by hitchhiking on animals, livestock, or through contaminated hay and feed. Its seeds can attach to fur or feathers.`;
    case 'accident':
    default:
      return `${w.commonName} likely arrived in the Midwest accidentally through contaminated crop seed, shipping materials, or soil transported from other regions.`;
  }
}

export default function InvasiveQuiz({ onBack }: { onBack: () => void }) {
  const rounds = useMemo(() => {
    const introduced = shuffle(weeds.filter(w => w.origin === 'Introduced')).slice(0, 8);
    return introduced.map(w => {
      const method = getArrivalMethod(w);
      return { weed: w, method, story: getStory(w, method) } as TravelerRound;
    });
  }, []);

  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<ArrivalMethod | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const done = round >= rounds.length;
  const current = !done ? rounds[round] : null;

  const submit = (method: ArrivalMethod) => {
    if (answered) return;
    setSelected(method);
    setAnswered(true);
    if (method === current!.method) setScore(s => s + 1);
  };

  const next = () => { setRound(r => r + 1); setSelected(null); setAnswered(false); };
  const restart = () => { setRound(0); setScore(0); setSelected(null); setAnswered(false); };

  if (done) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Journey Complete!</h2>
        <p className="text-lg text-foreground mb-6">{score}/{rounds.length} correct</p>
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
        <h1 className="font-bold text-foreground text-lg flex-1">Invasive Travelers</h1>
        <span className="text-sm text-muted-foreground">{round + 1}/{rounds.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        <div className="bg-card border border-border rounded-xl p-4 max-w-md w-full flex gap-4 items-center mb-4">
          <div className="w-24 h-24 rounded-xl overflow-hidden bg-secondary flex-shrink-0">
            <WeedImage weedId={current!.weed.id} stage="vegetative" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground text-lg">{current!.weed.commonName}</p>
            <p className="text-xs text-muted-foreground italic">{current!.weed.scientificName}</p>
            <p className="text-xs text-muted-foreground mt-1">This weed is invasive in the Midwest.</p>
          </div>
        </div>

        <p className="font-bold text-foreground text-center mb-4">How did this weed most likely arrive in the Midwest?</p>

        <div className="flex flex-col gap-3 w-full max-w-md">
          {(Object.keys(ARRIVAL_LABELS) as ArrivalMethod[]).map(method => {
            const isCorrect = method === current!.method;
            const bg = !answered ? 'border-border bg-card hover:border-primary' :
              method === selected ? (isCorrect ? 'border-green-500 bg-green-500/20' : 'border-destructive bg-destructive/20') :
              isCorrect ? 'border-green-500 bg-green-500/20' : 'border-border bg-card';
            return (
              <button key={method} onClick={() => submit(method)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${bg}`}>
                <p className="font-bold text-sm text-foreground">{ARRIVAL_LABELS[method]}</p>
                <p className="text-xs text-muted-foreground mt-1">{ARRIVAL_DESCRIPTIONS[method]}</p>
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="mt-4 bg-card border border-border rounded-xl p-4 max-w-md w-full">
            <p className={`font-bold mb-2 ${selected === current!.method ? 'text-green-500' : 'text-destructive'}`}>
              {selected === current!.method ? 'Correct!' : 'Not quite!'}
            </p>
            <p className="text-sm text-muted-foreground">{current!.story}</p>
            <button onClick={next} className="mt-3 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold w-full">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
