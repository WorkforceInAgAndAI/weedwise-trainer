import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { Search } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';
import { hasImage } from '@/lib/imageMap';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const DIOECIOUS_CANDIDATES = [
 { id: 'waterhemp', name: 'Waterhemp', maleDesc: 'Has drooping, tassel-like flower clusters that shed pollen into the wind', femaleDesc: 'Has compact, dense seed heads packed tightly along the stem' },
 { id: 'palmer-amaranth', name: 'Palmer Amaranth', maleDesc: 'Has soft, drooping seed heads that release pollen', femaleDesc: 'Has long, spiny, rigid seed heads that feel prickly to touch' },
 { id: 'giant-ragweed', name: 'Giant Ragweed', maleDesc: 'Has terminal racemes (long flower spikes) that release abundant pollen', femaleDesc: 'Has flowers in leaf axils that develop into bur-like fruits' },
 { id: 'common-ragweed', name: 'Common Ragweed', maleDesc: 'Has prominent terminal flower spikes that produce copious pollen', femaleDesc: 'Has small flowers in upper leaf axils that form bur-like fruits' },
];

interface Round {
  id: string;
  name: string;
  maleDesc: string;
  femaleDesc: string;
  descriptionIsForMale: boolean; // true = description describes male, false = describes female
}

export default function SpotTheDifferences({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const { addBadge } = useGameProgress();

  const availableSpecies = useMemo(() =>
    DIOECIOUS_CANDIDATES.filter(sp =>
      hasImage(sp.id, 'male.jpg') && hasImage(sp.id, 'female.jpg')
    ), []
  );

  const rounds = useMemo(() => {
    if (availableSpecies.length === 0) return [];
    const pool = [...availableSpecies];
    // Build 3 rounds per level using rotation
    const result: Round[] = [];
    for (let i = 0; i < 3; i++) {
      const idx = ((level - 1) * 3 + i) % pool.length;
      const sp = pool[idx];
      // Randomly decide whether the description is for male or female
      const descIsForMale = Math.random() < 0.5;
      result.push({
        ...sp,
        descriptionIsForMale: descIsForMale,
      });
    }
    return result;
  }, [level, availableSpecies]);

  const [rIdx, setRIdx] = useState(0);
  const [answer, setAnswer] = useState<'male' | 'female' | null>(null);
  const [score, setScore] = useState(0);
  const done = rIdx >= rounds.length;

  const current = !done ? rounds[rIdx] : null;

  const handleAnswer = (choice: 'male' | 'female') => {
    if (answer !== null) return;
    setAnswer(choice);
    // The description describes one plant. If descriptionIsForMale, correct answer is 'male'
    const correctAnswer = current!.descriptionIsForMale ? 'male' : 'female';
    if (choice === correctAnswer) setScore(s => s + 1);
  };

  const isCorrect = answer !== null && answer === (current?.descriptionIsForMale ? 'male' : 'female');
  const description = current ? (current.descriptionIsForMale ? current.maleDesc : current.femaleDesc) : '';

  const next = () => { setRIdx(r => r + 1); setAnswer(null); };
  const restart = () => { setRIdx(0); setAnswer(null); setScore(0); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (availableSpecies.length === 0) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 text-center">
        <Search className="w-10 h-10 text-muted-foreground mb-3" />
        <h2 className="font-display font-bold text-xl text-foreground mb-2">No Dioecious Images Available</h2>
        <p className="text-muted-foreground mb-4">Male and female images (male.jpg, female.jpg) need to be uploaded to weed image folders.</p>
        <button onClick={onBack} className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-bold">Go Back</button>
      </div>
    );
  }

  if (done) {
    addBadge({ gameId: 'spot-differences', gameName: 'Spot the Differences', level: 'HS', score, total: rounds.length });
    return <LevelComplete level={level} score={score} total={rounds.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />;
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
          <h1 className="font-display font-bold text-lg text-foreground">Spot the Differences</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
          <span className="text-sm text-muted-foreground">{rIdx + 1}/{rounds.length}</span>
        </div>

        <p className="text-center font-bold text-foreground text-lg mb-1">{current!.name}</p>
        <p className="text-center text-sm text-muted-foreground mb-4">Which plant does this description match?</p>

        {/* Description card */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-4 text-center">
          <p className="text-sm font-medium text-foreground">"{description}"</p>
        </div>

        {/* Two plant images side by side */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="text-center">
            <div className={`w-full aspect-square rounded-xl overflow-hidden border-3 bg-secondary mb-2 cursor-pointer transition-all ${
              answer === null ? 'border-border hover:border-primary' :
              answer === 'male' ? (isCorrect ? 'border-green-500' : 'border-destructive') :
              (current!.descriptionIsForMale ? 'border-green-500' : 'border-border')
            }`}
              onClick={() => handleAnswer('male')}>
              <WeedImage weedId={current!.id} stage="male" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Plant A (Male)</span>
          </div>
          <div className="text-center">
            <div className={`w-full aspect-square rounded-xl overflow-hidden border-3 bg-secondary mb-2 cursor-pointer transition-all ${
              answer === null ? 'border-border hover:border-primary' :
              answer === 'female' ? (isCorrect ? 'border-green-500' : 'border-destructive') :
              (!current!.descriptionIsForMale ? 'border-green-500' : 'border-border')
            }`}
              onClick={() => handleAnswer('female')}>
              <WeedImage weedId={current!.id} stage="female" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Plant B (Female)</span>
          </div>
        </div>

        {/* Feedback */}
        {answer !== null && (
          <div className="text-center mb-4">
            <p className={`text-lg font-bold mb-2 ${isCorrect ? 'text-green-500' : 'text-destructive'}`}>
              {isCorrect ? 'Correct!' : `Incorrect — that description matches the ${current!.descriptionIsForMale ? 'male' : 'female'} plant.`}
            </p>
            <div className="bg-secondary rounded-lg p-3 text-left text-sm space-y-1 mb-3">
              <p className="text-foreground"><span className="font-bold">Male:</span> {current!.maleDesc}</p>
              <p className="text-foreground"><span className="font-bold">Female:</span> {current!.femaleDesc}</p>
            </div>
            <button onClick={next} className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold">
              {rIdx + 1 < rounds.length ? 'Next Species' : 'See Results'}
            </button>
          </div>
        )}

        {answer === null && (
          <p className="text-center text-sm text-muted-foreground">Click the plant that matches the description above</p>
        )}
      </div>
    </div>
  );
}
