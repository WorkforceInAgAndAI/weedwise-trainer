import { useState, useMemo } from 'react';
import { Wind, Droplets, PawPrint, Mountain, TreePine, Waves, Wheat, CloudRain } from 'lucide-react';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface Challenge {
  id: number;
  obstacle: string;
  ObstacleIcon: React.ComponentType<{ className?: string }>;
  description: string;
  correctMethod: string;
  options: { method: string; MethodIcon: React.ComponentType<{ className?: string }>; label: string }[];
  explanation: string;
}

const CHALLENGES: Challenge[] = [
  { id: 1, obstacle: 'Rocky Hillside', ObstacleIcon: Mountain, description: 'Steep rocks block your path. How do you get across?', correctMethod: 'wind', options: [{ method: 'wind', MethodIcon: Wind, label: 'Fly with the wind' }, { method: 'water', MethodIcon: Droplets, label: 'Float in water' }, { method: 'animal', MethodIcon: PawPrint, label: 'Hitch a ride' }], explanation: 'Light seeds with fluffy structures can fly over obstacles on the wind!' },
  { id: 2, obstacle: 'Wide River', ObstacleIcon: Waves, description: 'A river blocks your way. How do you cross?', correctMethod: 'water', options: [{ method: 'wind', MethodIcon: Wind, label: 'Blow across' }, { method: 'water', MethodIcon: Droplets, label: 'Float across' }, { method: 'animal', MethodIcon: PawPrint, label: 'Ride a bird' }], explanation: 'Many seeds have waterproof coats that let them float downstream to new areas!' },
  { id: 3, obstacle: 'Dense Forest', ObstacleIcon: TreePine, description: 'Thick trees block sunlight and wind. How do you travel?', correctMethod: 'animal', options: [{ method: 'wind', MethodIcon: Wind, label: 'Catch a breeze' }, { method: 'water', MethodIcon: Droplets, label: 'Find a stream' }, { method: 'animal', MethodIcon: PawPrint, label: 'Stick to an animal' }], explanation: 'Seeds with hooks or burrs stick to animal fur and get carried through dense areas!' },
  { id: 4, obstacle: 'Open Field', ObstacleIcon: Wheat, description: 'A huge flat field with strong winds. Perfect for...', correctMethod: 'wind', options: [{ method: 'wind', MethodIcon: Wind, label: 'Ride the wind' }, { method: 'water', MethodIcon: Droplets, label: 'Wait for rain' }, { method: 'animal', MethodIcon: PawPrint, label: 'Find a cow' }], explanation: 'Dandelion-like seeds with parachutes can travel miles across open fields!' },
  { id: 5, obstacle: 'Rainy Meadow', ObstacleIcon: CloudRain, description: 'Heavy rain is creating streams everywhere!', correctMethod: 'water', options: [{ method: 'wind', MethodIcon: Wind, label: 'Use wind gusts' }, { method: 'water', MethodIcon: Droplets, label: 'Ride the rainwater' }, { method: 'animal', MethodIcon: PawPrint, label: 'Catch an insect' }], explanation: 'Rain can wash seeds into streams and carry them to new growing spots!' },
];

export default function WeedTravel({ onBack }: { onBack: () => void }) {
  const challenges = useMemo(() => shuffle([...CHALLENGES]).slice(0, 4), []);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const done = step >= challenges.length;
  const ch = !done ? challenges[step] : null;
  const correct = answered && selected === ch?.correctMethod;

  const restart = () => { setStep(0); setSelected(null); setAnswered(false); setScore(0); };

  const submit = () => {
    if (!selected) return;
    setAnswered(true);
    if (selected === ch?.correctMethod) setScore(s => s + 1);
  };

  const next = () => { setStep(s => s + 1); setSelected(null); setAnswered(false); };

  if (done) return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
        <Wind className="w-12 h-12 mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-display font-bold text-foreground mb-2">Journey Complete!</h2>
        <p className="text-muted-foreground mb-6">You traveled {score}/{challenges.length} legs successfully!</p>
        <div className="flex gap-3 justify-center">
          <button onClick={restart} className="px-6 py-3 rounded-lg bg-secondary text-foreground font-bold">Play Again</button>
          <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
        </div>
      </div>
    </div>
  );

  const ObstIcon = ch!.ObstacleIcon;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-display font-bold text-foreground text-lg flex-1">Weed Travel</h1>
        <span className="text-sm text-primary font-bold">{score} pts</span>
      </div>
      <div className="flex-1 flex flex-col p-4 gap-4">
        {/* Path visualization */}
        <div className="relative flex items-center justify-between w-full max-w-lg mx-auto px-4 py-6">
          <div className="absolute top-1/2 left-8 right-8 h-2 bg-secondary rounded-full -translate-y-1/2" />
          <div className="absolute top-1/2 left-8 h-2 bg-primary rounded-full -translate-y-1/2 transition-all duration-500"
            style={{ width: `${(step / challenges.length) * (100 - 16)}%` }} />

          {challenges.map((c, i) => {
            const StopIcon = c.ObstacleIcon;
            return (
              <div key={c.id} className="relative z-10 flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-[3px] transition-all ${
                  i < step ? 'bg-success/20 border-success' :
                  i === step ? 'bg-primary/20 border-primary scale-110 shadow-lg' :
                  'bg-secondary border-border'
                }`}>
                  {i < step ? <span className="text-success text-sm font-bold">✓</span> : <StopIcon className="w-5 h-5 text-foreground" />}
                </div>
                <span className={`text-[10px] mt-1 font-medium ${i === step ? 'text-primary' : 'text-muted-foreground'}`}>
                  {i < step ? 'Passed' : i === step ? 'Here' : `Stop ${i + 1}`}
                </span>
              </div>
            );
          })}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-secondary border-[3px] border-border flex items-center justify-center">
              <span className="text-foreground text-sm font-bold">END</span>
            </div>
            <span className="text-[10px] mt-1 font-medium text-muted-foreground">Finish</span>
          </div>
        </div>

        {/* Current challenge */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 max-w-md mx-auto w-full">
          <div className="bg-card border-2 border-border rounded-2xl p-6 w-full text-center">
            <ObstIcon className="w-12 h-12 mx-auto mb-3 text-primary" />
            <h2 className="font-display font-bold text-foreground text-lg mb-1">{ch!.obstacle}</h2>
            <p className="text-muted-foreground text-sm">{ch!.description}</p>
          </div>

          <div className="flex gap-3 w-full">
            {ch!.options.map(opt => {
              const OptIcon = opt.MethodIcon;
              return (
                <button key={opt.method} onClick={() => !answered && setSelected(opt.method)}
                  className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    answered
                      ? opt.method === ch!.correctMethod ? 'border-success bg-success/10' : opt.method === selected ? 'border-destructive bg-destructive/10' : 'border-border opacity-50'
                      : selected === opt.method ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                  }`}>
                  <OptIcon className="w-8 h-8 text-foreground" />
                  <span className="text-xs font-medium text-foreground">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {!answered ? (
            <button onClick={submit} disabled={!selected} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-50">Go!</button>
          ) : (
            <div className="w-full text-center bg-card border border-border rounded-xl p-4">
              <p className={`text-lg font-bold mb-2 ${correct ? 'text-success' : 'text-destructive'}`}>
                {correct ? 'Great choice!' : 'Not the best way!'}
              </p>
              <p className="text-sm text-muted-foreground mb-3">{ch!.explanation}</p>
              <button onClick={next} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Continue Journey →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
