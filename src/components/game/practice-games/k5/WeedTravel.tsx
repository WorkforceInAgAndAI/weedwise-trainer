import { useState, useMemo } from 'react';
import { Wind, Droplets, PawPrint, Mountain, TreePine, Waves, Wheat, CloudRain, Sprout, Snowflake, Flame, Zap, Bug, Shovel, Star } from 'lucide-react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface SeedCharacter {
  weedId: string;
  name: string;
  traits: { wind: number; water: number; animal: number; heat: number; cold: number };
  description: string;
}

const ALL_SEED_CANDIDATES: Omit<SeedCharacter, 'weedId'>[] = [
  { name: 'Marestail Seed', traits: { wind: 3, water: 1, animal: 1, heat: 2, cold: 2 }, description: 'Tiny parachute seed — great at flying in the wind!' },
  { name: 'Morningglory Seed', traits: { wind: 1, water: 2, animal: 2, heat: 3, cold: 1 }, description: 'Hard round seed — tough and can survive heat!' },
  { name: 'Giant Ragweed Seed', traits: { wind: 1, water: 3, animal: 1, heat: 1, cold: 3 }, description: 'Heavy seed that floats well in water and survives cold!' },
  { name: 'Green Foxtail Seed', traits: { wind: 2, water: 1, animal: 3, heat: 2, cold: 2 }, description: 'Bristly seed that sticks to animal fur easily!' },
  { name: 'Kochia Seed', traits: { wind: 3, water: 1, animal: 1, heat: 3, cold: 1 }, description: 'Tumbleweed seed — rolls and flies with the wind!' },
  { name: 'Waterhemp Seed', traits: { wind: 2, water: 3, animal: 1, heat: 2, cold: 2 }, description: 'Smooth seed that loves wet areas and floods!' },
  { name: 'Palmer Amaranth Seed', traits: { wind: 1, water: 2, animal: 2, heat: 3, cold: 1 }, description: 'Fast-growing seed that thrives in hot conditions!' },
  { name: 'Canada Thistle Seed', traits: { wind: 3, water: 2, animal: 1, heat: 1, cold: 3 }, description: 'Fluffy seed that drifts in the wind and survives frost!' },
];

const WEED_IDS_FOR_SEEDS = ['marestail', 'morningglory', 'giant-ragweed', 'green-foxtail', 'kochia', 'waterhemp', 'palmer-amaranth', 'canada-thistle'];

function buildSeedCharacters(count: number = 5): SeedCharacter[] {
  const available: SeedCharacter[] = [];
  WEED_IDS_FOR_SEEDS.forEach((weedId, i) => {
    if (weeds.some(w => w.id === weedId) && ALL_SEED_CANDIDATES[i]) {
      available.push({ ...ALL_SEED_CANDIDATES[i], weedId });
    }
  });
  return shuffle(available).slice(0, count);
}

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
    threshold: number;
    successText: string;
    failText: string;
    nextOnSuccess: string;
    nextOnFail: string;
  }[];
}

// Each obstacle set has 7+ nodes so every path goes through at least 4 steps before finish
const OBSTACLE_SETS: AdventureNode[][] = [
  [
    { id: 'start_hill', obstacle: 'Rocky Hillside', ObstacleIcon: Mountain, description: 'A steep rocky hill blocks your path. How will you get past?', options: [
      { method: 'wind', label: 'Fly over with the wind', MethodIcon: Wind, traitKey: 'wind', threshold: 2, successText: 'Your light structure catches the breeze!', failText: 'Too heavy to fly over.', nextOnSuccess: 'forest', nextOnFail: 'river' },
      { method: 'animal', label: 'Hitch a ride on a bird', MethodIcon: PawPrint, traitKey: 'animal', threshold: 2, successText: 'A bird carries you over!', failText: 'Too smooth for the bird to grab.', nextOnSuccess: 'meadow', nextOnFail: 'river' },
    ]},
    { id: 'river', obstacle: 'Wide River', ObstacleIcon: Waves, description: 'A rushing river blocks your way.', options: [
      { method: 'water', label: 'Float across', MethodIcon: Droplets, traitKey: 'water', threshold: 2, successText: 'Your waterproof coat keeps you afloat!', failText: 'You sink!', nextOnSuccess: 'meadow', nextOnFail: 'hot_field' },
      { method: 'wind', label: 'Catch a gust across', MethodIcon: Wind, traitKey: 'wind', threshold: 3, successText: 'A strong gust launches you across!', failText: 'Not strong enough.', nextOnSuccess: 'forest', nextOnFail: 'hot_field' },
    ]},
    { id: 'forest', obstacle: 'Dense Forest', ObstacleIcon: TreePine, description: 'Thick trees block sunlight and wind.', options: [
      { method: 'animal', label: "Stick to a deer's fur", MethodIcon: PawPrint, traitKey: 'animal', threshold: 2, successText: 'Your hooks latch onto a deer!', failText: 'Too smooth to stick.', nextOnSuccess: 'bug_field', nextOnFail: 'meadow' },
      { method: 'water', label: 'Follow a forest stream', MethodIcon: Droplets, traitKey: 'water', threshold: 2, successText: 'You float along the stream!', failText: 'Stream too shallow.', nextOnSuccess: 'hot_field', nextOnFail: 'bug_field' },
    ]},
    { id: 'meadow', obstacle: 'Open Meadow', ObstacleIcon: Wheat, description: 'A wide open meadow with strong winds.', options: [
      { method: 'wind', label: 'Ride the wind', MethodIcon: Wind, traitKey: 'wind', threshold: 2, successText: 'You soar across!', failText: 'Too heavy.', nextOnSuccess: 'bug_field', nextOnFail: 'hot_field' },
      { method: 'animal', label: 'Stick to a cow', MethodIcon: PawPrint, traitKey: 'animal', threshold: 2, successText: 'A cow carries you!', failText: 'You bounce off.', nextOnSuccess: 'cold_snap', nextOnFail: 'bug_field' },
    ]},
    { id: 'bug_field', obstacle: 'Insect Swarm', ObstacleIcon: Bug, description: 'Hungry insects are everywhere looking for seeds to eat!', options: [
      { method: 'heat', label: 'Use your tough seed coat', MethodIcon: Flame, traitKey: 'heat', threshold: 2, successText: 'Your hard coat protects you from being eaten!', failText: 'An insect nibbles your coat.', nextOnSuccess: 'cold_snap', nextOnFail: 'hot_field' },
      { method: 'wind', label: 'Blow away from them', MethodIcon: Wind, traitKey: 'wind', threshold: 2, successText: 'You escape on a breeze!', failText: 'Not light enough to escape.', nextOnSuccess: 'cold_snap', nextOnFail: 'cold_snap' },
    ]},
    { id: 'hot_field', obstacle: 'Scorching Field', ObstacleIcon: Flame, description: 'The sun is blazing!', options: [
      { method: 'heat', label: 'Tough it out', MethodIcon: Flame, traitKey: 'heat', threshold: 2, successText: 'Your hard coat protects you!', failText: 'Too much heat!', nextOnSuccess: 'cold_snap', nextOnFail: 'cold_snap' },
      { method: 'water', label: 'Find shade near water', MethodIcon: Droplets, traitKey: 'water', threshold: 2, successText: 'You find a cool puddle!', failText: 'No water nearby.', nextOnSuccess: 'cold_snap', nextOnFail: 'cold_snap' },
    ]},
    { id: 'cold_snap', obstacle: 'Winter Freeze', ObstacleIcon: Snowflake, description: 'A cold snap hits!', options: [
      { method: 'cold', label: 'Hunker down and wait', MethodIcon: Snowflake, traitKey: 'cold', threshold: 2, successText: 'You survive the winter!', failText: 'The cold cracks your coat!', nextOnSuccess: 'finish', nextOnFail: 'finish' },
      { method: 'animal', label: 'Get buried by a squirrel', MethodIcon: PawPrint, traitKey: 'animal', threshold: 2, successText: 'Underground warmth!', failText: 'No squirrel wants you.', nextOnSuccess: 'finish', nextOnFail: 'finish' },
    ]},
  ],
  [
    { id: 'start_hill', obstacle: 'Muddy Swamp', ObstacleIcon: Droplets, description: 'A thick muddy swamp lies ahead. How do you cross?', options: [
      { method: 'water', label: 'Float through the mud', MethodIcon: Droplets, traitKey: 'water', threshold: 2, successText: 'You float right through!', failText: 'You sink into the mud.', nextOnSuccess: 'forest', nextOnFail: 'meadow' },
      { method: 'animal', label: 'Ride on a frog', MethodIcon: PawPrint, traitKey: 'animal', threshold: 2, successText: 'A frog leaps you across!', failText: 'The frog ignores you.', nextOnSuccess: 'hot_field', nextOnFail: 'river' },
    ]},
    { id: 'river', obstacle: 'Thunderstorm', ObstacleIcon: Zap, description: 'Lightning and heavy rain! Can you use it to your advantage?', options: [
      { method: 'water', label: 'Ride the rainwater', MethodIcon: Droplets, traitKey: 'water', threshold: 2, successText: 'The rain carries you downstream!', failText: 'You get stuck in a puddle.', nextOnSuccess: 'meadow', nextOnFail: 'plow_zone' },
      { method: 'wind', label: 'Catch storm winds', MethodIcon: Wind, traitKey: 'wind', threshold: 3, successText: 'The wind hurls you far!', failText: 'Too chaotic to fly.', nextOnSuccess: 'forest', nextOnFail: 'hot_field' },
    ]},
    { id: 'forest', obstacle: 'Tall Grass Prairie', ObstacleIcon: Wheat, description: 'Endless tall grasses compete for space.', options: [
      { method: 'heat', label: 'Use summer heat', MethodIcon: Flame, traitKey: 'heat', threshold: 2, successText: 'You thrive in the warmth!', failText: 'Too much competition.', nextOnSuccess: 'plow_zone', nextOnFail: 'meadow' },
      { method: 'animal', label: 'Stick to a rabbit', MethodIcon: PawPrint, traitKey: 'animal', threshold: 2, successText: 'A rabbit carries you out!', failText: 'You fall off.', nextOnSuccess: 'cold_snap', nextOnFail: 'hot_field' },
    ]},
    { id: 'meadow', obstacle: 'Sandy Desert', ObstacleIcon: Wind, description: 'Hot sand and dry winds everywhere.', options: [
      { method: 'heat', label: 'Endure the heat', MethodIcon: Flame, traitKey: 'heat', threshold: 3, successText: 'Your tough coat survives!', failText: 'The heat dries you out.', nextOnSuccess: 'plow_zone', nextOnFail: 'cold_snap' },
      { method: 'wind', label: 'Roll with the wind', MethodIcon: Wind, traitKey: 'wind', threshold: 2, successText: 'You tumble across!', failText: 'Too heavy to roll.', nextOnSuccess: 'cold_snap', nextOnFail: 'plow_zone' },
    ]},
    { id: 'plow_zone', obstacle: 'Plowed Field', ObstacleIcon: Shovel, description: 'A farmer is plowing the soil — seeds are being turned over!', options: [
      { method: 'cold', label: 'Go dormant underground', MethodIcon: Snowflake, traitKey: 'cold', threshold: 2, successText: 'You survive buried deep!', failText: 'The plow exposes you.', nextOnSuccess: 'cold_snap', nextOnFail: 'hot_field' },
      { method: 'water', label: 'Wash away with irrigation', MethodIcon: Droplets, traitKey: 'water', threshold: 2, successText: 'Water carries you to safety!', failText: 'No water available.', nextOnSuccess: 'cold_snap', nextOnFail: 'cold_snap' },
    ]},
    { id: 'hot_field', obstacle: 'Farm Equipment', ObstacleIcon: Shovel, description: 'Farm machinery is tilling the soil!', options: [
      { method: 'cold', label: 'Go dormant underground', MethodIcon: Snowflake, traitKey: 'cold', threshold: 2, successText: 'You survive buried deep!', failText: 'The plow exposes you.', nextOnSuccess: 'cold_snap', nextOnFail: 'cold_snap' },
      { method: 'animal', label: 'Hitch ride on equipment', MethodIcon: PawPrint, traitKey: 'animal', threshold: 2, successText: 'You travel to a new field!', failText: 'You fall off the machine.', nextOnSuccess: 'cold_snap', nextOnFail: 'cold_snap' },
    ]},
    { id: 'cold_snap', obstacle: 'Early Frost', ObstacleIcon: Snowflake, description: 'An unexpected frost arrives early!', options: [
      { method: 'cold', label: 'Tough out the cold', MethodIcon: Snowflake, traitKey: 'cold', threshold: 2, successText: 'You go dormant and wait!', failText: 'The frost is too much.', nextOnSuccess: 'finish', nextOnFail: 'finish' },
      { method: 'water', label: 'Hide in a warm stream', MethodIcon: Droplets, traitKey: 'water', threshold: 2, successText: 'The stream keeps you warm!', failText: 'No stream nearby.', nextOnSuccess: 'finish', nextOnFail: 'finish' },
    ]},
  ],
  [
    { id: 'start_hill', obstacle: 'Steep Ravine', ObstacleIcon: Mountain, description: 'A deep ravine cuts across your path!', options: [
      { method: 'wind', label: 'Glide across on a breeze', MethodIcon: Wind, traitKey: 'wind', threshold: 2, successText: 'You float across the gap!', failText: 'Not enough wind.', nextOnSuccess: 'creek', nextOnFail: 'grassland' },
      { method: 'water', label: 'Wash down and across', MethodIcon: Droplets, traitKey: 'water', threshold: 2, successText: 'Rainwater carries you through!', failText: 'You get stuck at the bottom.', nextOnSuccess: 'grassland', nextOnFail: 'creek' },
    ]},
    { id: 'creek', obstacle: 'Winding Creek', ObstacleIcon: Waves, description: 'A gentle creek winds through the landscape.', options: [
      { method: 'water', label: 'Float downstream', MethodIcon: Droplets, traitKey: 'water', threshold: 2, successText: 'The current takes you along!', failText: 'You waterlog and sink.', nextOnSuccess: 'insect_zone', nextOnFail: 'grassland' },
      { method: 'animal', label: 'Stick to a duck', MethodIcon: PawPrint, traitKey: 'animal', threshold: 2, successText: 'A duck carries you out!', failText: 'Too slippery for the duck.', nextOnSuccess: 'grassland', nextOnFail: 'insect_zone' },
    ]},
    { id: 'grassland', obstacle: 'Windy Grassland', ObstacleIcon: Wheat, description: 'Strong gusts blow across an open grassland.', options: [
      { method: 'wind', label: 'Sail with the gusts', MethodIcon: Wind, traitKey: 'wind', threshold: 2, successText: 'You fly across the field!', failText: 'You drop into the grass.', nextOnSuccess: 'insect_zone', nextOnFail: 'drought' },
      { method: 'heat', label: 'Wait for calm and sprint', MethodIcon: Flame, traitKey: 'heat', threshold: 2, successText: 'The warm sun helps you germinate quickly!', failText: 'Still too windy.', nextOnSuccess: 'drought', nextOnFail: 'insect_zone' },
    ]},
    { id: 'insect_zone', obstacle: 'Seed-Eating Insects', ObstacleIcon: Bug, description: 'Ground beetles are hunting for seeds!', options: [
      { method: 'animal', label: 'Stick to an animal to escape', MethodIcon: PawPrint, traitKey: 'animal', threshold: 2, successText: 'A mouse carries you away!', failText: 'The beetles find you.', nextOnSuccess: 'drought', nextOnFail: 'frost' },
      { method: 'cold', label: 'Go dormant to hide', MethodIcon: Snowflake, traitKey: 'cold', threshold: 2, successText: 'You play dead and they pass!', failText: 'They still find you.', nextOnSuccess: 'frost', nextOnFail: 'drought' },
    ]},
    { id: 'drought', obstacle: 'Summer Drought', ObstacleIcon: Flame, description: 'No rain for weeks — the soil is cracked and dry.', options: [
      { method: 'heat', label: 'Endure the drought', MethodIcon: Flame, traitKey: 'heat', threshold: 2, successText: 'Your tough coat holds moisture!', failText: 'You dry out.', nextOnSuccess: 'frost', nextOnFail: 'frost' },
      { method: 'water', label: 'Find underground moisture', MethodIcon: Droplets, traitKey: 'water', threshold: 3, successText: 'You find a damp crack!', failText: 'Bone dry everywhere.', nextOnSuccess: 'frost', nextOnFail: 'frost' },
    ]},
    { id: 'frost', obstacle: 'Late Season Frost', ObstacleIcon: Snowflake, description: 'A hard frost blankets the ground!', options: [
      { method: 'cold', label: 'Survive underground', MethodIcon: Snowflake, traitKey: 'cold', threshold: 2, successText: 'You emerge in spring!', failText: 'The freeze damages you.', nextOnSuccess: 'finish', nextOnFail: 'finish' },
      { method: 'heat', label: 'Wait for a warm spell', MethodIcon: Flame, traitKey: 'heat', threshold: 2, successText: 'A warm day gives you a chance!', failText: 'No warm spell comes.', nextOnSuccess: 'finish', nextOnFail: 'finish' },
    ]},
  ],
];

const FINISH_NODE: AdventureNode = {
  id: 'finish', obstacle: 'New Soil!', ObstacleIcon: Sprout,
  description: 'You made it to fresh soil! Time to grow!',
  options: [],
};

function getNode(id: string, obstacleSet: AdventureNode[]): AdventureNode {
  if (id === 'finish') return FINISH_NODE;
  return obstacleSet.find(n => n.id === id) || FINISH_NODE;
}

export default function WeedTravel({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const { addBadge } = useGameProgress();
  const seedCharacters = useMemo(() => buildSeedCharacters(5), [level]);
  const obstacleSet = useMemo(() => OBSTACLE_SETS[(level - 1) % OBSTACLE_SETS.length], [level]);

  const [chosenSeed, setChosenSeed] = useState<SeedCharacter | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState('start_hill');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [history, setHistory] = useState<{ node: string; success: boolean }[]>([]);
  const [gameOver, setGameOver] = useState(false);

  const node = getNode(currentNodeId, obstacleSet);
  const score = history.filter(h => h.success).length;
  const totalSteps = history.length;

  if (!chosenSeed) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-display font-bold text-foreground text-lg flex-1">Weed Travel</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-xl font-bold text-foreground text-center mb-2">Choose Your Seed!</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">Help a seed travel to a new location. Each seed has different abilities. Pick wisely!</p>
          <div className="grid gap-3 max-w-md mx-auto">
            {seedCharacters.map(sc => (
              <button key={sc.weedId} onClick={() => setChosenSeed(sc)}
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-border bg-card hover:border-primary transition-all text-left">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border shadow-md shrink-0">
                  <WeedImage weedId={sc.weedId} stage="seed" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground text-sm">{sc.name}</p>
                  <p className="text-xs text-muted-foreground mb-2">{sc.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(sc.traits).map(([key, val]) => (
                      <span key={key} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-foreground flex items-center gap-0.5">
                        {key}: {Array.from({ length: val }).map((_, si) => <Star key={si} className="w-2.5 h-2.5 fill-primary text-primary inline" />)}{Array.from({ length: 3 - val }).map((_, si) => <Star key={si} className="w-2.5 h-2.5 text-muted-foreground/30 inline" />)}
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
            <button onClick={() => { setLevel(l => l + 1); setChosenSeed(null); setCurrentNodeId('start_hill'); setSelectedOption(null); setAnswered(false); setHistory([]); setGameOver(false); }}
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next Level</button>
            <button onClick={() => { setLevel(1); setChosenSeed(null); setCurrentNodeId('start_hill'); setSelectedOption(null); setAnswered(false); setHistory([]); setGameOver(false); }}
              className="px-6 py-3 rounded-lg bg-secondary text-foreground font-bold">Start Over</button>
            <button onClick={onBack} className="px-6 py-3 rounded-lg border border-border text-foreground font-bold">Back to Games</button>
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
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-border shadow-sm">
            <WeedImage weedId={chosenSeed.weedId} stage="seed" className="w-full h-full object-cover" />
          </div>
          <span className="text-sm text-primary font-bold">{score} pts</span>
        </div>
      </div>
      <div className="flex-1 flex flex-col p-4 gap-4">
        <div className="flex items-center gap-1 justify-center">
          {history.map((h, i) => (
            <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${h.success ? 'bg-green-500/20 text-green-600' : 'bg-destructive/20 text-destructive'}`}>
              {h.success ? '+' : 'x'}
            </div>
          ))}
          <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
            <span className="text-primary text-xs font-bold">→</span>
          </div>
        </div>
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
                    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground mt-0.5">
                       Your {opt.traitKey}: {Array.from({ length: traitVal }).map((_, si) => <Star key={`y${si}`} className="w-2.5 h-2.5 fill-primary text-primary inline" />)}{Array.from({ length: 3 - traitVal }).map((_, si) => <Star key={`n${si}`} className="w-2.5 h-2.5 text-muted-foreground/30 inline" />)} (need {Array.from({ length: opt.threshold }).map((_, si) => <Star key={`t${si}`} className="w-2.5 h-2.5 fill-amber-500 text-amber-500 inline" />)})
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
              <button onClick={handleContinue} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Continue Journey</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
