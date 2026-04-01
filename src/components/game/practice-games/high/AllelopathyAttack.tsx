import { useState, useMemo } from 'react';
import { Leaf, Droplets, Layers, Wind, Swords, Flame, Bug, CloudRain, Sprout } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

const ALL_STRATEGIES = [
  { id: 'root-exudate', label: 'Root Exudates', Icon: Leaf, desc: 'Release chemicals from roots into soil' },
  { id: 'leaf-leach', label: 'Leaf Leachate', Icon: Droplets, desc: 'Rain washes inhibitors off your leaves into soil' },
  { id: 'decomposition', label: 'Decomposition Toxins', Icon: Layers, desc: 'Your decaying matter releases inhibitory compounds' },
  { id: 'volatile', label: 'Volatile Emissions', Icon: Wind, desc: 'Release gaseous inhibitors from leaves' },
  { id: 'root-crown', label: 'Crown Exudates', Icon: Sprout, desc: 'Release chemicals from the base of your stem' },
  { id: 'mulch-suppress', label: 'Mulch Suppression', Icon: Layers, desc: 'Your thick leaf litter physically and chemically blocks growth' },
  { id: 'pollen-inhibit', label: 'Pollen Inhibition', Icon: CloudRain, desc: 'Your pollen carries growth-inhibiting compounds' },
  { id: 'canopy-shade', label: 'Canopy Shade + Toxins', Icon: Flame, desc: 'Combine dense shade with chemical leaf drip' },
];

const PLAYER_WEEDS = [
  { id: 'waterhemp', name: 'Waterhemp' },
  { id: 'kochia', name: 'Kochia' },
  { id: 'palmer-amaranth', name: 'Palmer Amaranth' },
  { id: 'marestail', name: 'Marestail' },
  { id: 'giant-ragweed', name: 'Giant Ragweed' },
];

const SCENARIOS = [
  { enemy: 'large-crabgrass', enemyName: 'Crabgrass', situation: 'A shallow-rooted grass is invading your territory by spreading rapidly at the soil surface.', best: 'root-exudate', why: 'Root exudates directly suppress shallow-rooted competitors by inhibiting their root growth in the surrounding soil.' },
  { enemy: 'morningglory', enemyName: 'Morning Glory', situation: 'A climbing vine is using your stem for support and stealing your sunlight from above.', best: 'leaf-leach', why: 'Leaf leachate compounds wash down onto the vine below during rain, inhibiting its growth at the contact point.' },
  { enemy: 'lambsquarters', enemyName: 'Lambsquarters', situation: 'A fast-growing broadleaf is taking over the area where your old leaves fell last autumn.', best: 'decomposition', why: 'Your decomposing leaf litter releases phenolic acids that prevent Lambsquarters seedlings from establishing.' },
  { enemy: 'green-foxtail', enemyName: 'Green Foxtail', situation: 'A grass is growing nearby but not touching you. You need to suppress it at a distance.', best: 'volatile', why: 'Volatile chemical emissions can travel through air to inhibit nearby plant growth without physical contact.' },
  { enemy: 'velvetleaf', enemyName: 'Velvetleaf', situation: 'A competitor\'s roots are intertwined with yours underground, competing for water.', best: 'root-exudate', why: 'Exudates released directly from your roots create a chemical zone of inhibition around competing root systems.' },
  { enemy: 'giant-ragweed', enemyName: 'Giant Ragweed', situation: 'A competitor germinates each spring in the same soil patch where your biomass accumulated.', best: 'decomposition', why: 'The persistent allelopathic compounds from your decomposing tissues prevent seedling establishment in your territory.' },
  { enemy: 'yellow-foxtail', enemyName: 'Yellow Foxtail', situation: 'A grass seedling is emerging right next to the base of your stem.', best: 'root-crown', why: 'Crown exudates concentrate chemicals right where the seedling is trying to establish, suppressing it at close range.' },
  { enemy: 'johnsongrass', enemyName: 'Johnsongrass', situation: 'A tall, aggressive grass is spreading via rhizomes into your territory from 10 feet away.', best: 'volatile', why: 'Volatile emissions can travel through air to reach distant competitors without needing root-to-root contact.' },
  { enemy: 'kochia', enemyName: 'Kochia', situation: 'A low-growing competitor is germinating under your dense canopy of fallen leaves.', best: 'mulch-suppress', why: 'Your thick leaf mulch blocks light physically while releasing allelopathic compounds, creating a double barrier.' },
  { enemy: 'palmer-amaranth', enemyName: 'Palmer Amaranth', situation: 'A competitor is growing directly beneath your canopy in heavy shade.', best: 'canopy-shade', why: 'Combining dense shade with allelopathic leaf drip creates an environment too stressful for the competitor.' },
  { enemy: 'wild-oat', enemyName: 'Wild Oat', situation: 'A grass weed is flowering at the same time as you, and its pollen is landing on your territory.', best: 'pollen-inhibit', why: 'Your pollen carries growth-inhibiting compounds that affect nearby competitors during the flowering window.' },
  { enemy: 'marestail', enemyName: 'Marestail', situation: 'Small rosettes are forming in the soil crust around your base after a rain event.', best: 'leaf-leach', why: 'Rain washes allelopathic compounds from your leaves into the soil crust, inhibiting rosette establishment.' },
];

const TOTAL_ROUNDS = 10;

function pickStrategies(bestId: string): typeof ALL_STRATEGIES {
  const best = ALL_STRATEGIES.find(s => s.id === bestId)!;
  const others = shuffle(ALL_STRATEGIES.filter(s => s.id !== bestId)).slice(0, 3);
  return shuffle([best, ...others]);
}

export default function AllelopathyAttack({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const { addBadge } = useGameProgress();
  const [phase, setPhase] = useState<'select' | 'play' | 'done'>('select');
  const [playerWeed, setPlayerWeed] = useState(PLAYER_WEEDS[0]);
  const rounds = useMemo(() => shuffle([...SCENARIOS]).slice(0, TOTAL_ROUNDS), []);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);

  const currentStrategies = useMemo(() => {
    if (phase !== 'play' || idx >= rounds.length) return ALL_STRATEGIES.slice(0, 4);
    return pickStrategies(rounds[idx].best);
  }, [idx, phase]);

  const submit = (sId: string) => { if (answered) return; setPicked(sId); setAnswered(true); if (sId === rounds[idx].best) setScore(s => s + 1); };
  const next = () => { setIdx(i => i + 1); setPicked(null); setAnswered(false); };
  const restart = () => { setPhase('select'); setIdx(0); setPicked(null); setAnswered(false); setScore(0); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  // Character selection
  if (phase === 'select') {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 text-center">
        <Swords className="w-10 h-10 text-primary mb-3" />
        <h2 className="font-display font-bold text-2xl text-foreground mb-2">Allelopathy Attack</h2>
        <p className="text-sm text-muted-foreground mb-4">Choose your weed character!</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
          {PLAYER_WEEDS.map(w => (
            <button key={w.id} onClick={() => setPlayerWeed(w)}
              className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${playerWeed.id === w.id ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}>
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-border">
                <WeedImage weedId={w.id} stage="plant" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs font-bold text-foreground">{w.name}</p>
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={() => setPhase('play')} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold">Start Battle</button>
          <button onClick={onBack} className="px-6 py-3 rounded-xl bg-secondary text-foreground font-bold">Back</button>
        </div>
      </div>
    );
  }

  // Done screen
  if (idx >= rounds.length) {
    addBadge({ gameId: 'allelopathy', gameName: 'Allelopathy Attack', level: 'HS', score, total: rounds.length });
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 text-center">
        <Swords className="w-10 h-10 text-primary mb-3" />
        <h2 className="font-display font-bold text-2xl text-foreground mb-2">Battle Won!</h2>
        <p className="text-foreground mb-6">Score: {score} / {rounds.length}</p>
        <LevelComplete level={level} score={score} total={rounds?.length ?? 0} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
      </div>
    );
  }

  const s = rounds[idx];
  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-lg mx-auto p-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-foreground">←</button>
          <h1 className="font-display font-bold text-lg text-foreground">Allelopathy Attack</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
          <span className="ml-auto text-sm text-muted-foreground">{idx + 1}/{rounds.length}</span>
        </div>

        {/* You vs Enemy */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary">
              <WeedImage weedId={playerWeed.id} stage="plant" className="w-full h-full object-cover" />
            </div>
            <p className="text-xs font-bold text-primary mt-1">You ({playerWeed.name})</p>
          </div>
          <Swords className="w-6 h-6 text-muted-foreground" />
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-destructive">
              <WeedImage weedId={s.enemy} stage="plant" className="w-full h-full object-cover" />
            </div>
            <p className="text-xs font-bold text-destructive mt-1">{s.enemyName}</p>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mb-2">Choose an allelopathy strategy to suppress your enemy.</p>
        <div className="bg-destructive/10 rounded-xl p-4 mb-4 border border-destructive/30">
          <p className="text-sm text-foreground">{s.situation}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {currentStrategies.map(st => {
            const StIcon = st.Icon;
            let cls = 'border-border bg-card';
            if (answered && st.id === s.best) cls = 'border-green-500 bg-green-500/20';
            else if (answered && st.id === picked && st.id !== s.best) cls = 'border-destructive bg-destructive/20';
            return (
              <button key={st.id} onClick={() => submit(st.id)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${cls}`}>
                <StIcon className="w-6 h-6 mx-auto mb-1 text-foreground" />
                <p className="text-xs font-bold text-foreground">{st.label}</p>
                <p className="text-[10px] text-muted-foreground">{st.desc}</p>
              </button>
            );
          })}
        </div>
        {answered && (
          <div>
            <div className="bg-secondary/50 rounded-xl p-3 mb-3"><p className="text-sm text-foreground">{s.why}</p></div>
            <button onClick={next} className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
