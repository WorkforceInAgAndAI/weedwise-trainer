import { useState, useMemo } from 'react';
import { Leaf, Droplets, Layers, Wind, Swords, Flame, Bug, CloudRain, Sprout } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import { weeds } from '@/data/weeds';
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

const ALL_PLAYER_WEEDS = [
 { id: 'waterhemp', name: 'Waterhemp', bio: 'Waterhemp (Amaranthus tuberculatus) is a dioecious annual broadleaf native to the Midwest. It produces 250,000-1,000,000+ tiny seeds per plant and can grow over 2 inches per day in midsummer. It is one of the most herbicide-resistant weeds in North America, with confirmed resistance to 7 herbicide sites of action.' },
 { id: 'kochia', name: 'Kochia', bio: 'Kochia (Bassia scoparia) is an annual broadleaf introduced from Eurasia as an ornamental. It is drought- and salt-tolerant, thriving where other weeds cannot. At maturity, the plant breaks off at the base and tumbles across fields, dispersing up to 30,000 seeds. Kochia has developed resistance to ALS inhibitors, glyphosate, and synthetic auxins.' },
 { id: 'palmer-amaranth', name: 'Palmer Amaranth', bio: 'Palmer amaranth (Amaranthus palmeri) is native to the desert Southwest. It can grow 2-3 inches per day and reach over 8 feet tall. A single female plant can produce up to 1 million seeds, giving it enormous seed-bank replenishment potential. It has evolved resistance to at least 8 herbicide mechanisms of action.' },
 { id: 'marestail', name: 'Marestail', bio: 'Marestail / horseweed (Erigeron canadensis) is a winter or summer annual native to North America. Its tiny wind-dispersed seeds can travel hundreds of miles. It was among the first broadleaf weeds to evolve glyphosate resistance (2001 in Delaware). Fall-germinating rosettes are particularly difficult to control in no-till systems.' },
 { id: 'giant-ragweed', name: 'Giant Ragweed', bio: 'Giant ragweed (Ambrosia trifida) is one of the earliest-emerging summer annuals. It can reach 12-15 feet and produces large seeds with high vigor that emerge from deep in the soil profile. Its rapid canopy closure allows it to shade out crops within weeks of emergence. It is a major driver of crop yield loss in the Corn Belt.' },
 { id: 'canada-thistle', name: 'Canada Thistle', bio: 'Canada thistle (Cirsium arvense) is an aggressive creeping perennial introduced from Eurasia. It reproduces by wind-dispersed seeds and extensive lateral roots that can spread 10-12 feet per year. Root fragments as small as 0.25 inches can regenerate new plants. Its allelopathic root exudates suppress neighboring species.' },
 { id: 'johnsongrass', name: 'Johnsongrass', bio: 'Johnsongrass (Sorghum halepense) is a rhizomatous perennial grass introduced from the Mediterranean as a forage crop. It produces both seeds (up to 80,000 per plant) and vigorous rhizomes that spread laterally. It contains dhurrin, a cyanogenic glycoside that is allelopathic to surrounding plants. It is one of the world\'s ten worst weeds.' },
 { id: 'lambsquarters', name: 'Lambsquarters', bio: 'Common lambsquarters (Chenopodium album) is a cosmopolitan annual broadleaf. A single plant can produce 75,000+ seeds that remain viable in soil for decades. Its seedlings are highly competitive for light and nutrients, and its waxy leaf surface reduces herbicide uptake. It is among the most common cropland weeds worldwide.' },
];

const SCENARIOS = [
 { enemy: 'large-crabgrass', enemyName: 'Crabgrass', situation: 'Crabgrass (Digitaria sanguinalis) is a shallow-rooted C4 annual grass spreading rapidly at the soil surface via prostrate stems. Its roots stay in the top 2 inches of soil.', best: 'root-exudate', why: 'Root exudates directly suppress shallow-rooted competitors by releasing phenolic acids and other allelochemicals that inhibit root elongation in the top soil layer where crabgrass roots concentrate.' },
 { enemy: 'morningglory', enemyName: 'Morning Glory', situation: 'Ivyleaf morningglory (Ipomoea hederacea) is twining its stems up your canopy, using your structure for physical support while intercepting light above you.', best: 'leaf-leach', why: 'Leaf leachate compounds (phenolics and terpenes) wash downward during rain events onto the vine\'s contact points, inhibiting cell elongation where the vine grips your stems and leaves.' },
 { enemy: 'lambsquarters', enemyName: 'Lambsquarters', situation: 'Lambsquarters seedlings are germinating densely in the decomposing leaf litter you shed last autumn, taking advantage of the nutrient-rich zone.', best: 'decomposition', why: 'Your decomposing tissues release phenolic acids (ferulic acid, p-coumaric acid) and other allelochemicals that accumulate in the litter layer and inhibit seed germination and radicle growth of Lambsquarters seedlings.' },
 { enemy: 'green-foxtail', enemyName: 'Green Foxtail', situation: 'Green foxtail (Setaria viridis) is establishing several feet away in the same field row, beyond the reach of your root zone. No physical contact exists between you.', best: 'volatile', why: 'Volatile terpenes and other gaseous allelochemicals released from your leaf surfaces travel through air to reach competitors outside your root zone, inhibiting photosynthesis and growth at a distance.' },
 { enemy: 'velvetleaf', enemyName: 'Velvetleaf', situation: 'Velvetleaf (Abutilon theophrasti) has its deep taproot intertwined with yours, directly competing for soil water and nutrients in the same root zone.', best: 'root-exudate', why: 'Root exudates create a chemical inhibition zone directly around your root system, releasing compounds like sorgoleone or juglone analogs that suppress competitor roots sharing the same soil space.' },
 { enemy: 'giant-ragweed', enemyName: 'Giant Ragweed', situation: 'Giant ragweed germinates early each spring in the same patch where your plant biomass accumulated over winter, exploiting your nutrient-rich residue zone.', best: 'decomposition', why: 'Persistent allelopathic compounds from your decomposing tissues (hydroxamic acids, benzoxazinoids) accumulate over winter and create a hostile germination environment that persists into spring.' },
 { enemy: 'yellow-foxtail', enemyName: 'Yellow Foxtail', situation: 'Yellow foxtail (Setaria pumila) seedlings are emerging immediately adjacent to the base of your stem, within inches of your crown.', best: 'root-crown', why: 'Crown exudates concentrate allelochemicals at the stem base where they are most potent, creating a high-concentration inhibition zone that suppresses seedlings emerging in your immediate vicinity.' },
 { enemy: 'johnsongrass', enemyName: 'Johnsongrass', situation: 'Johnsongrass is advancing via rhizomes from 10+ feet away. Its underground stems are spreading toward your territory but are not yet in your root zone.', best: 'volatile', why: 'At this distance, only volatile emissions (terpenoids, essential oils) can reach the competitor through air, potentially slowing shoot emergence and photosynthetic efficiency before roots make contact.' },
 { enemy: 'kochia', enemyName: 'Kochia', situation: 'Kochia seedlings are germinating under your dense, thick canopy of fallen leaves where light is blocked and moisture is trapped.', best: 'mulch-suppress', why: 'Your thick leaf mulch creates a dual barrier: physical light exclusion reduces photosynthesis, while leaching allelopathic compounds from the mulch layer inhibit germination and root growth simultaneously.' },
 { enemy: 'palmer-amaranth', enemyName: 'Palmer Amaranth', situation: 'Palmer amaranth is growing directly beneath your dense canopy, in deep shade where your leaf drip continuously wets its foliage.', best: 'canopy-shade', why: 'Combining dense shade (reducing photosynthetically active radiation by 80-90%) with allelopathic leaf drip creates compounding stress that exceeds what either mechanism alone could achieve.' },
 { enemy: 'wild-oat', enemyName: 'Wild Oat', situation: 'Wild oat (Avena fatua) is flowering simultaneously with you. Its pollen is landing on soil and plant surfaces throughout your territory.', best: 'pollen-inhibit', why: 'Your pollen carries water-soluble growth-inhibiting compounds that, when deposited on competitor surfaces during the shared flowering window, can suppress pollen germination and reduce seed set.' },
 { enemy: 'marestail', enemyName: 'Marestail', situation: 'Small marestail rosettes are establishing in the soil crust around your base, germinating after a recent rain softened the surface.', best: 'leaf-leach', why: 'Rain events wash allelopathic phenolics from your leaf surfaces into the soil crust layer, creating inhibitory concentrations right where marestail rosettes are attempting to establish their root systems.' },
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
 const [phase, setPhase] = useState<'select' | 'bio' | 'play' | 'done'>('select');
 const [playerWeed, setPlayerWeed] = useState(ALL_PLAYER_WEEDS[0]);

 const availablePlayers = useMemo(() => {
  const pool = shuffle(ALL_PLAYER_WEEDS);
  const offset = ((level - 1) * 5) % pool.length;
  return pool.slice(offset).concat(pool).slice(0, 5);
 }, [level]);

 const rounds = useMemo(() => shuffle([...SCENARIOS]).slice(0, TOTAL_ROUNDS), [level]);
 const [idx, setIdx] = useState(0);
 const [picked, setPicked] = useState<string | null>(null);
 const [answered, setAnswered] = useState(false);
 const [score, setScore] = useState(0);

 const currentStrategies = useMemo(() => {
  if (phase !== 'play' || idx >= rounds.length) return ALL_STRATEGIES.slice(0, 4);
  return pickStrategies(rounds[idx].best);
 }, [idx, phase, rounds]);

 const submit = (sId: string) => { if (answered) return; setPicked(sId); setAnswered(true); if (sId === rounds[idx].best) setScore(s => s + 1); };
 const next = () => { setIdx(i => i + 1); setPicked(null); setAnswered(false); };
 const restart = () => { setPhase('select'); setIdx(0); setPicked(null); setAnswered(false); setScore(0); };
 const nextLevel = () => { setLevel(l => l + 1); restart(); };
 const startOver = () => { setLevel(1); restart(); };

 if (phase === 'select') {
  return (
   <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 text-center">
    <Swords className="w-10 h-10 text-primary mb-3" />
    <h2 className="font-display font-bold text-2xl text-foreground mb-2">Allelopathy Attack</h2>
    <p className="text-sm text-muted-foreground mb-4">Choose your weed character!</p>
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
     {availablePlayers.map(w => (
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
     <button onClick={() => setPhase('bio')} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold">Select</button>
     <button onClick={onBack} className="px-6 py-3 rounded-xl bg-secondary text-foreground font-bold">Back</button>
    </div>
   </div>
  );
 }

 if (phase === 'bio') {
  return (
   <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 text-center">
    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary mb-4">
     <WeedImage weedId={playerWeed.id} stage="plant" className="w-full h-full object-cover" />
    </div>
    <h2 className="font-display font-bold text-xl text-foreground mb-2">{playerWeed.name}</h2>
    <p className="text-sm text-muted-foreground max-w-md mb-6">{playerWeed.bio}</p>
    <button onClick={() => setPhase('play')} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold">Start Battle</button>
   </div>
  );
 }

 if (idx >= rounds.length) {
  addBadge({ gameId: 'allelopathy', gameName: 'Allelopathy Attack', level: 'HS', score, total: rounds.length });
  return (
   <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6 text-center">
    <Swords className="w-10 h-10 text-primary mb-3" />
    <h2 className="font-display font-bold text-2xl text-foreground mb-2">Battle Won!</h2>
    <p className="text-foreground mb-6">Score: {score} / {rounds.length}</p>
    <LevelComplete level={level} score={score} total={rounds.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
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
     <span className="text-sm text-muted-foreground">{idx + 1}/{rounds.length}</span>
    </div>
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