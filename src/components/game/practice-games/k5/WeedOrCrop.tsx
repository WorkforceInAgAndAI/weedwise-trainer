import { useState, useEffect, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import { getCropImages } from '@/lib/imageMap';
import FloatingCoach from '@/components/game/FloatingCoach';

const CROP_FOLDERS = ['Alfalfa', 'Barley', 'Canola', 'Corn', 'Cotton', 'Field Peas', 'Millet', 'Mungbean', 'Oats', 'Potatoes', 'Pumpkin', 'Rice', 'Sorghum', 'Soybean', 'Sugarcane', 'Wheat'];

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface RoundItem { type: 'weed' | 'crop'; name: string; weedId?: string; cropImage?: string; }

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }
export default function WeedOrCrop({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);
  const [classified, setClassified] = useState<{ name: string; type: 'weed' | 'crop'; correct: boolean; weedId?: string; cropImage?: string }[]>([]);
  const rounds = useMemo(() => {
    const weedPool = shuffle([...weeds]);
    const selectedWeeds = weedPool.slice(0, 5);
    const weedItems: RoundItem[] = selectedWeeds.map(w => ({ type: 'weed', name: w.commonName, weedId: w.id }));

    // Use local crop images from folder names
    const cropItems: RoundItem[] = [];
    shuffle([...CROP_FOLDERS]).forEach(name => {
      const images = getCropImages(name);
      if (images.length > 0) {
        const randomImg = images[Math.floor(Math.random() * images.length)];
        cropItems.push({ type: 'crop', name, cropImage: randomImg });
      }
    });
    const selectedCrops = cropItems.slice(0, 5);

    // Combine and randomly shuffle for a natural mix
    const combined = shuffle([...weedItems, ...selectedCrops]);
    return combined;
  }, [level]);

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(10);
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);

  const restart = () => { setRound(0); setScore(0); setTimer(10); setAnswered(false); setCorrect(null); setDone(false); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); setClassified([]); };
  const startOver = () => { setLevel(1); restart(); setClassified([]); };

  useEffect(() => {
    if (answered || done) return;
    if (timer <= 0) { setAnswered(true); setCorrect(false); return; }
    const t = setTimeout(() => setTimer(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, answered, done]);

  const handleAnswer = (choice: 'weed' | 'crop') => {
    if (answered) return;
    setAnswered(true);
    const item = rounds[round];
    const ok = choice === item.type;
    setCorrect(ok);
    if (ok) setScore(s => s + 1);
    setClassified(prev => [...prev, { name: item.name, type: item.type, correct: ok, weedId: item.weedId, cropImage: item.cropImage }]);
  };

  const next = () => {
    if (round + 1 >= rounds.length) { setDone(true); return; }
    setRound(r => r + 1); setTimer(10); setAnswered(false); setCorrect(null);
  };

  if (done) return <LevelComplete level={level} score={score} total={rounds?.length ?? 0} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} gameId={gameId} gameName={gameName} gradeLabel={gradeLabel} />;

  const item = rounds[round];
  const weedBucket = classified.filter(c => c.type === 'weed');
  const cropBucket = classified.filter(c => c.type === 'crop');
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">&#8592;</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Weed or Crop?</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">Round {round + 1}/{rounds.length}</span>
        <span className="text-sm font-bold text-primary ml-2">Score: {score}</span>
      </div>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 p-4 overflow-y-auto">
      <div className="flex flex-col items-center justify-center gap-5">
        <div className="w-full max-w-md">
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-1000 rounded-full ${timer <= 3 ? 'bg-destructive' : 'bg-primary'}`} style={{ width: `${(timer / 10) * 100}%` }} />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-1">{timer}s</p>
        </div>
        <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-2xl bg-secondary flex items-center justify-center overflow-hidden border-2 border-border">
          {item.weedId ? (
            <WeedImage weedId={item.weedId} stage="flower" className="w-full h-full object-cover" />
          ) : item.cropImage ? (
            <img src={item.cropImage} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">{item.name}</div>
          )}
        </div>
        <p className="text-xl font-bold text-foreground">{item.name}</p>
        {!answered ? (
          <div className="flex gap-4">
            <button onClick={() => handleAnswer('weed')} className="px-8 py-4 rounded-xl bg-destructive/90 text-destructive-foreground text-lg font-bold hover:bg-destructive transition-colors">Weed</button>
            <button onClick={() => handleAnswer('crop')} className="px-8 py-4 rounded-xl bg-primary text-primary-foreground text-lg font-bold hover:opacity-90 transition-opacity">Crop</button>
          </div>
        ) : (
          <div className="text-center">
            <p className={`text-xl font-bold mb-3 ${correct ? 'text-green-500' : 'text-destructive'}`}>
              {correct ? 'Correct!' : `Wrong — it's a ${item.type}!`}
            </p>
            <button onClick={next} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next</button>
          </div>
        )}
      </div>
      {/* Classification side panel */}
      <div className="grid grid-rows-2 gap-3">
        {([
          { label: 'Weeds', items: weedBucket, color: 'border-destructive/40 bg-destructive/5' },
          { label: 'Crops', items: cropBucket, color: 'border-primary/40 bg-primary/5' },
        ]).map(b => (
          <div key={b.label} className={`rounded-xl border-2 p-3 overflow-y-auto ${b.color}`}>
            <p className="text-xs font-bold uppercase text-foreground mb-2">{b.label} ({b.items.length})</p>
            <div className="grid grid-cols-3 gap-2">
              {b.items.map((c, i) => (
                <div key={i} className="text-center">
                  <div className={`aspect-square rounded-md overflow-hidden border-2 ${c.correct ? 'border-green-500' : 'border-destructive'}`}>
                    {c.weedId ? <WeedImage weedId={c.weedId} stage="flower" className="w-full h-full object-cover" /> :
                      c.cropImage ? <img src={c.cropImage} alt={c.name} className="w-full h-full object-cover" /> : null}
                  </div>
                  <p className="text-[9px] mt-1 text-foreground truncate">{c.name}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      </div>
          <FloatingCoach grade="K-5" tip={`Crops are planted on purpose. Weeds show up where we don't want them. Look at the leaves!`} />
</div>
  );
}
