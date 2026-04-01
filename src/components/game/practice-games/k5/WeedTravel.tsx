import { useState, useMemo } from 'react';
import { Wind, Droplets, PawPrint, Mountain, TreePine, Waves, Wheat, CloudRain, Sprout, Snowflake, Flame } from 'lucide-react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

/* ─── Seed characters with trait-based abilities ─── */
interface SeedCharacter {
  weedId: string;
  name: string;
  traits: { wind: number; water: number; animal: number; heat: number; cold: number };
  description: string;
}

function buildSeedCharacters(): SeedCharacter[] {
  const candidates = [
    { weedId: 'marestail', name: 'Marestail Seed', traits: { wind: 3, water: 1, animal: 1, heat: 2, cold: 2 }, description: 'Tiny parachute seed — great at flying in the wind!' },
    { weedId: 'morningglory', name: 'Morningglory Seed', traits: { wind: 1, water: 2, animal: 2, heat: 3, cold: 1 }, description: 'Hard round seed — tough and can survive heat!' },
    { weedId: 'giant-ragweed', name: 'Giant Ragweed Seed', traits: { wind: 1, water: 3, animal: 1, heat: 1, cold: 3 }, description: 'Heavy seed that floats well in water and survives cold!' },
    { weedId: 'green-foxtail', name: 'Green Foxtail Seed', traits: { wind: 2, water: 1, animal: 3, heat: 2, cold: 2 }, description: 'Bristly seed that sticks to animal fur easily!' },
    { weedId: 'kochia', name: 'Kochia Seed', traits: { wind: 3, water: 1, animal: 1, heat: 3, cold: 1 }, description: 'Tumbleweed seed — rolls and flies with the wind!' },
  ];
  return candidates.filter(c => weeds.some(w => w.id === c.weedId));
}

/* ─── Adventure nodes ─── */
interface AdventureNode {
  id: string;
  obstacle: string;
  ObstacleIcon: React.ComponentType<{ className?: string }>;
  description: string;
  options: {
    method: string;
    label: string;
    MethodIcon: React.ComponentType<{ className?: string }>;
    traitKey: keyof SeedCharacter['traits'];
    threshold: number; // need this trait level to succeed
    successText: string;
    failText: string;
    nextOnSuccess: string; // id of next node
    nextOnFail: string;
  }[];
}

const NODES: AdventureNode[] = [
  {
    id: 'start_hill', obstacle: 'Rocky Hillside', ObstacleIcon: Mountain,
    description: 'A steep rocky hill blocks your path. How will you get past?',
    options: [
      { method: 'wind', label: 'Fly over with the wind', MethodIcon: Wind, traitKey: 'wind', threshold: 2, successText: 'Your light structure catches the breeze and carries you right over the rocks!', failText: 'You\'re too heavy to fly over — you tumble back down.', nextOnSuccess: 'forest', nextOnFail: 'river' },
      { method: 'animal', label: 'Hitch a ride on a bird', MethodIcon: PawPrint, traitKey: 'animal', threshold: 2, successText: 'A bird picks you up and carries you over the hill!', failText: 'You\'re too smooth for the bird to grab. You slide off!', nextOnSuccess: 'meadow', nextOnFail: 'river' },
    ]
  },
  {
    id: 'river', obstacle: 'Wide River', ObstacleIcon: Waves,
    description: 'A rushing river blocks your way. How do you cross?',
    options: [
      { method: 'water', label: 'Float across', MethodIcon: Droplets, traitKey: 'water', threshold: 2, successText: 'Your waterproof coat keeps you afloat downstream to new soil!', failText: 'You sink to the bottom — seeds need to keep moving!', nextOnSuccess: 'meadow', nextOnFail: 'hot_field' },
      { method: 'wind', label: 'Catch a gust across', MethodIcon: Wind, traitKey: 'wind', threshold: 3, successText: 'A strong gust launches you across the river!', failText: 'The wind isn\'t strong enough. You land in the water and drift.', nextOnSuccess: 'forest', nextOnFail: 'hot_field' },
    ]
  },
  {
    id: 'forest', obstacle: 'Dense Forest', ObstacleIcon: TreePine,
    description: 'Thick trees block sunlight and wind. How do you travel through?',
    options: [
      { method: 'animal', label: 'Stick to a deer\'s fur', MethodIcon: PawPrint, traitKey: 'animal', threshold: 2, successText: 'Your hooks latch onto a passing deer and carry you through!', failText: 'You\'re too smooth to stick. The deer walks past you.', nextOnSuccess: 'cold_snap', nextOnFail: 'meadow' },
      { method: 'water', label: 'Follow a forest stream', MethodIcon: Droplets, traitKey: 'water', threshold: 2, successText: 'You float along the little stream through the forest!', failText: 'The stream is too shallow and you get stuck in mud.', nextOnSuccess: 'hot_field', nextOnFail: 'cold_snap' },
    ]
  },
  {
    id: 'meadow', obstacle: 'Open Meadow', ObstacleIcon: Wheat,
    description: 'A wide open meadow with strong winds. Perfect opportunity!',
    options: [
      { method: 'wind', label: 'Ride the wind across', MethodIcon: Wind, traitKey: 'wind', threshold: 2, successText: 'Like a tiny parachute, you soar across the meadow!', failText: 'You\'re too heavy — you only roll a short distance.', nextOnSuccess: 'cold_snap', nextOnFail: 'hot_field' },
      { method: 'animal', label: 'Stick to a cow', MethodIcon: PawPrint, traitKey: 'animal', threshold: 2, successText: 'A cow brushes past and carries you across the field!', failText: 'You bounce off the cow\'s smooth hide.', nextOnSuccess: 'finish', nextOnFail: 'cold_snap' },
    ]
  },
  {
    id: 'hot_field', obstacle: 'Scorching Field', ObstacleIcon: Flame,
    description: 'The sun is blazing and the soil is hot! Can you survive the heat?',
    options: [
      { method: 'heat', label: 'Tough it out', MethodIcon: Flame, traitKey: 'heat', threshold: 2, successText: 'Your hard seed coat protects you from the heat!', failText: 'The heat is too much — you dry out!', nextOnSuccess: 'finish', nextOnFail: 'cold_snap' },
      { method: 'water', label: 'Find shade near water', MethodIcon: Droplets, traitKey: 'water', threshold: 2, successText: 'You roll into a cool, shady puddle and survive!', failText: 'There\'s no water nearby. The heat wilts you.', nextOnSuccess: 'finish', nextOnFail: 'finish' },
    ]
  },
  {
    id: 'cold_snap', obstacle: 'Winter Freeze', ObstacleIcon: Snowflake,
    description: 'A cold snap hits! Can your seed survive the freezing temperatures?',
    options: [
      { method: 'cold', label: 'Hunker down and wait', MethodIcon: Snowflake, traitKey: 'cold', threshold: 2, successText: 'You go dormant and survive the winter — ready to sprout in spring!', failText: 'The cold cracks your seed coat. That\'s tough!', nextOnSuccess: 'finish', nextOnFail: 'finish' },
      { method: 'animal', label: 'Get buried by a squirrel', MethodIcon: PawPrint, traitKey: 'animal', threshold: 2, successText: 'A squirrel buries you underground where it\'s warmer!', failText: 'No squirrel wants to carry you. Brrr!', nextOnSuccess: 'finish', nextOnFail: 'finish' },
    ]
  },
];

const FINISH_NODE: AdventureNode = {
  id: 'finish', obstacle: 'New Soil!', ObstacleIcon: Sprout,
  description: 'You made it to fresh soil! Time to grow!',
  options: [],
};

function getNode(id: string): AdventureNode {
  if (id === 'finish') return FINISH_NODE;
  return NODES.find(n => n.id === id) || FINISH_NODE;
}

export default function WeedTravel({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const { addBadge } = useGameProgress();
  const seedCharacters = useMemo(() => buildSeedCharacters(), []);

  const [chosenSeed, setChosenSeed] = useState<SeedCharacter | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState('start_hill');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [history, setHistory] = useState<{ node: string; success: boolean }[]>([]);
  const [gameOver, setGameOver] = useState(false);

  const node = getNode(currentNodeId);
  const score = history.filter(h => h.success).length;
  const totalSteps = history.length;

  // Seed selection screen
  if (!chosenSeed) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-display font-bold text-foreground text-lg flex-1">Weed Travel</h1>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-xl font-bold text-foreground text-center mb-2">Choose Your Seed!</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">Each seed has different abilities. Pick wisely — your seed's traits determine which paths you can take!</p>
          <div className="grid gap-3 max-w-md mx-auto">
            {seedCharacters.map(sc => (
              <button key={sc.weedId} onClick={() => setChosenSeed(sc)}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-border bg-card hover:border-primary transition-all text-left">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md shrink-0">
                  <WeedImage weedId={sc.weedId} stage="seed" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground text-sm">{sc.name}</p>
                  <p className="text-xs text-muted-foreground mb-2">{sc.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(sc.traits).map(([key, val]) => (
                      <span key={key} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-foreground">
                        {key}: {'★'.repeat(val)}{'☆'.repeat(3 - val)}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Game over / finish
  if (gameOver || currentNodeId === 'finish') {
    const reached = currentNodeId === 'finish';
    addBadge({ gameId: 'weed-travel', gameName: 'Weed Travel', level: 'K-5', score, total: totalSteps });
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full text-center">
          <Sprout className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">{reached ? 'You Made It!' : 'Journey Over!'}</h2>
          <p className="text-muted-foreground mb-1">Playing as: {chosenSeed.name}</p>
          <p className="text-muted-foreground mb-6">Obstacles conquered: {score}/{totalSteps}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setChosenSeed(null); setCurrentNodeId('start_hill'); setSelectedOption(null); setAnswered(false); setHistory([]); setGameOver(false); }}
              className="px-6 py-3 rounded-lg bg-secondary text-foreground font-bold">Play Again</button>
            <button onClick={onBack} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Back to Games</button>
          </div>
        </div>
      </div>
    );
  }

  const ObstIcon = node.ObstacleIcon;

  const handleChoose = () => {
    if (selectedOption === null) return;
    const opt = node.options[selectedOption];
    const traitVal = chosenSeed.traits[opt.traitKey];
    const success = traitVal >= opt.threshold;
    setAnswered(true);
    setSucceeded(success);
    setHistory(h => [...h, { node: currentNodeId, success }]);
  };

  const handleContinue = () => {
    if (selectedOption === null) return;
    const opt = node.options[selectedOption];
    const nextId = succeeded ? opt.nextOnSuccess : opt.nextOnFail;
    setCurrentNodeId(nextId);
    setSelectedOption(null);
    setAnswered(false);
    setSucceeded(false);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-display font-bold text-foreground text-lg flex-1">Weed Travel</h1>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm">
            <WeedImage weedId={chosenSeed.weedId} stage="seed" className="w-full h-full object-cover" />
          </div>
          <span className="text-sm text-primary font-bold">{score} pts</span>
        </div>
      </div>
      <div className="flex-1 flex flex-col p-4 gap-4">
        {/* Journey progress */}
        <div className="flex items-center gap-1 justify-center">
          {history.map((h, i) => (
            <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${h.success ? 'bg-green-500/20 text-green-600' : 'bg-destructive/20 text-destructive'}`}>
              {h.success ? '✓' : '✗'}
            </div>
          ))}
          <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
            <span className="text-primary text-xs font-bold">→</span>
          </div>
        </div>

        {/* Current obstacle */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 max-w-md mx-auto w-full">
          <div className="bg-card border-2 border-border rounded-2xl p-6 w-full text-center">
            <ObstIcon className="w-12 h-12 mx-auto mb-3 text-primary" />
            <h2 className="font-display font-bold text-foreground text-lg mb-1">{node.obstacle}</h2>
            <p className="text-muted-foreground text-sm">{node.description}</p>
          </div>

          <div className="flex flex-col gap-3 w-full">
            {node.options.map((opt, i) => {
              const OptIcon = opt.MethodIcon;
              const traitVal = chosenSeed.traits[opt.traitKey];
              return (
                <button key={i} onClick={() => !answered && setSelectedOption(i)}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                    answered
                      ? i === selectedOption ? (succeeded ? 'border-green-500 bg-green-500/10' : 'border-destructive bg-destructive/10') : 'border-border opacity-50'
                      : selectedOption === i ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                  }`}>
                  <OptIcon className="w-8 h-8 text-foreground shrink-0" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-foreground">{opt.label}</span>
                    <span className="block text-[10px] text-muted-foreground mt-0.5">
                      Your {opt.traitKey}: {'★'.repeat(traitVal)}{'☆'.repeat(3 - traitVal)} (need {'★'.repeat(opt.threshold)})
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {!answered ? (
            <button onClick={handleChoose} disabled={selectedOption === null} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-50">Go!</button>
          ) : (
            <div className="w-full text-center bg-card border border-border rounded-xl p-4">
              <p className={`text-lg font-bold mb-2 ${succeeded ? 'text-green-500' : 'text-destructive'}`}>
                {succeeded ? 'You made it!' : 'Blocked!'}
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                {node.options[selectedOption!][succeeded ? 'successText' : 'failText']}
              </p>
              <button onClick={handleContinue} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Continue Journey →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
