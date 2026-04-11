import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import { Ship, Package, Bug } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';
import LevelComplete from '@/components/game/LevelComplete';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

type ArrivalMethod = 'accident' | 'purpose' | 'other-species';

const ARRIVAL_LABELS: Record<ArrivalMethod, { label: string; Icon: typeof Ship }> = {
  accident: { label: 'By Accident', Icon: Ship },
  purpose: { label: 'On Purpose', Icon: Package },
  'other-species': { label: 'Through Other Species', Icon: Bug },
};

const ARRIVAL_DESCRIPTIONS: Record<ArrivalMethod, string> = {
  accident: 'Arrived unintentionally through shipping, contaminated seed, or ballast water.',
  purpose: 'Brought intentionally for agriculture, landscaping, or erosion control.',
  'other-species': 'Spread by attaching to animals, livestock, or through other plant trade.',
};

// Detailed arrival stories keyed by weed id
const WEED_ARRIVAL_DATA: Record<string, { method: ArrivalMethod; story: string }> = {
  'canada-thistle': {
    method: 'accident',
    story: 'Canada Thistle (Cirsium arvense) arrived in North America through contaminated imported crop seed in the 1700s. Despite its name, it originated in southeastern Europe and western Asia. Its deep creeping root system and wind-dispersed seeds allowed it to spread rapidly across agricultural lands.',
  },
  'caraway': {
    method: 'purpose',
    story: 'Caraway (Carum carvi) was intentionally introduced for culinary and medicinal use. Its aromatic seeds are used in baking and traditional medicine. It commonly spread beyond cultivation through seed contamination in hay and grain shipments.',
  },
  'lambsquarters': {
    method: 'purpose',
    story: 'Common Lambsquarters (Chenopodium album) was likely introduced by early European settlers as a food crop -- its leaves are edible and nutritious. It also spread readily in contaminated seed lots and is now one of the most common weeds in North American croplands.',
  },
  'velvetleaf': {
    method: 'purpose',
    story: 'Velvetleaf (Abutilon theophrasti) was brought intentionally from China in the early 1700s for fiber production. Farmers hoped to use its stem fibers like jute, but it escaped cultivation and became one of the most persistent weeds in corn and soybean fields across the Midwest.',
  },
  'kochia': {
    method: 'purpose',
    story: 'Kochia (Bassia scoparia) was introduced to the United States from Europe and Asia as an ornamental plant in the 1800s. It was also valued as drought-tolerant forage. Its tumbleweed-like habit allows mature plants to break off and roll across landscapes, dispersing seeds over great distances.',
  },
  'johnsongrass': {
    method: 'purpose',
    story: 'Johnsongrass (Sorghum halepense) was deliberately imported from the Mediterranean region in the 1830s as a forage crop for livestock. It escaped cultivation due to its aggressive rhizome system and prolific seed production, becoming one of the most problematic weeds in the southern United States.',
  },
  'palmer-amaranth': {
    method: 'other-species',
    story: 'Palmer Amaranth (Amaranthus palmeri) is native to the southwestern U.S. and northern Mexico, but spread far beyond its native range through contaminated hay, livestock feed, seed, farm equipment, wildlife, and irrigation water. It is now one of the most aggressive and herbicide-resistant weeds in the Midwest.',
  },
  'wild-oat': {
    method: 'accident',
    story: 'Wild Oat (Avena fatua) was introduced from Eurasia, likely as a contaminant in crop seed shipments. Its seeds closely resemble cultivated oats, making it difficult to separate from grain. It is now a major weed in small grain crops throughout North America.',
  },
  'wild-parsnip': {
    method: 'purpose',
    story: 'Wild Parsnip (Pastinaca sativa) was introduced from Europe as a food and medicinal plant. The cultivated parsnip escaped gardens and roadsides and naturalized across much of North America. Its sap contains furanocoumarins that cause severe burns when skin is exposed to sunlight.',
  },
  'poison-hemlock': {
    method: 'accident',
    story: 'Poison Hemlock (Conium maculatum) was introduced from Europe and West Asia, likely as an accidental contaminant in seed or soil. It may also have been brought as an ornamental or medicinal plant. All parts of the plant are highly toxic to humans and livestock.',
  },
  'morningglory': {
    method: 'purpose',
    story: 'Morningglory species were introduced from tropical Americas, often as ornamental garden plants prized for their colorful flowers. They escaped cultivation and became persistent weeds in row crops, using their twining habit to climb and smother crop plants.',
  },
  'marestail': {
    method: 'accident',
    story: 'Marestail/Horseweed (Erigeron canadensis) is actually native to North America but has become increasingly problematic due to herbicide resistance. Its tiny seeds are wind-dispersed and can travel hundreds of miles, allowing resistant populations to spread rapidly across agricultural regions.',
  },
  'large-crabgrass': {
    method: 'accident',
    story: 'Large Crabgrass (Digitaria sanguinalis) was introduced from Eurasia, likely through contaminated crop seed and soil movement. It thrives in warm-season disturbed soils and is now one of the most common lawn and agricultural weeds across North America.',
  },
  'giant-foxtail': {
    method: 'accident',
    story: 'Giant Foxtail (Setaria faberi) was introduced from China, likely as a contaminant in millet seed. First identified in the U.S. in the 1930s, it rapidly spread through the Corn Belt and is now one of the most common annual grass weeds in Midwest crop fields.',
  },
  'green-foxtail': {
    method: 'accident',
    story: 'Green Foxtail (Setaria viridis) was introduced from Eurasia through contaminated grain shipments. It is now found across all of North America and is especially common in disturbed soils, roadsides, and crop fields.',
  },
  'yellow-foxtail': {
    method: 'accident',
    story: 'Yellow Foxtail (Setaria pumila) was introduced from Europe, arriving as a contaminant in crop seed. It is distinguished from other foxtails by the long hairs at the base of each leaf blade and its compact, yellowish seed head.',
  },
  'giant-ragweed': {
    method: 'accident',
    story: 'Giant Ragweed (Ambrosia trifida) is actually native to North America but has become increasingly weedy in agricultural settings. Its large seeds and rapid early-season growth make it highly competitive in corn and soybean fields. Herbicide-resistant populations are spreading across the Midwest.',
  },
  'annual-ryegrass': {
    method: 'purpose',
    story: 'Annual Ryegrass (Lolium multiflorum) was intentionally introduced from Europe as a forage and cover crop. While it provides excellent erosion control and livestock feed, it has escaped managed settings and developed herbicide resistance in some populations, becoming problematic in wheat and other small grain fields.',
  },
  'barnyardgrass': {
    method: 'accident',
    story: 'Barnyardgrass (Echinochloa crus-galli) was introduced from Eurasia, likely through contaminated rice and grain seed. It is especially problematic in rice paddies and other wet agricultural environments, where it mimics the appearance of rice seedlings.',
  },
  'yellow-nutsedge': {
    method: 'accident',
    story: 'Yellow Nutsedge (Cyperus esculentus) likely spread to North America through contaminated soil and plant material. Its underground tubers (nutlets) can persist in soil for years and are easily spread by tillage equipment, making it extremely difficult to eradicate once established.',
  },
  'pennsylvania-smartweed': {
    method: 'accident',
    story: 'Pennsylvania Smartweed (Persicaria pensylvanica) is native to North America. It thrives in moist, fertile soils and is commonly found in crop fields, particularly in low-lying areas. Its seeds can remain viable in soil for decades.',
  },
  'golden-alexanders': {
    method: 'accident',
    story: 'Golden Alexanders (Zizia aurea) is native to North America and is actually a beneficial wildflower. It supports pollinators and is found in prairies and woodland edges. It can be confused with toxic look-alikes like Wild Parsnip and Poison Hemlock.',
  },
  'volunteer-sunflower': {
    method: 'accident',
    story: 'Volunteer Sunflower (Helianthus annuus) is native to North America but becomes a weed when it grows from seeds left behind after a sunflower crop. These volunteers compete with the current crop for water, nutrients, and light, and can harbor diseases and pests.',
  },
};

function getArrivalData(w: typeof weeds[0]): { method: ArrivalMethod; story: string } {
  if (WEED_ARRIVAL_DATA[w.id]) return WEED_ARRIVAL_DATA[w.id];
  // Fallback based on traits
  const t = `${w.habitat} ${w.commonName} ${w.management}`.toLowerCase();
  let method: ArrivalMethod = 'accident';
  if (t.match(/ornament|garden|crop|forage|pasture|erosion|medicin|landscap/)) method = 'purpose';
  else if (t.match(/animal|bird|livest|fur|attach|hitchhik/)) method = 'other-species';

  const stories: Record<ArrivalMethod, string> = {
    purpose: `${w.commonName} (${w.scientificName}) was likely brought to North America intentionally for agricultural use, ornamental planting, or erosion control. Over time it escaped managed areas and established wild populations in ${w.habitat.toLowerCase()}.`,
    'other-species': `${w.commonName} (${w.scientificName}) likely spread by hitchhiking on animals, livestock, or through contaminated plant trade. Its seeds can attach to fur, feathers, or clothing. It is now commonly found in ${w.habitat.toLowerCase()}.`,
    accident: `${w.commonName} (${w.scientificName}) likely arrived accidentally through contaminated crop seed, shipping materials, or soil. It now thrives in ${w.habitat.toLowerCase()}.`,
  };
  return { method, story: stories[method] };
}

export default function InvasiveQuiz({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const { addBadge } = useGameProgress();
  const rounds = useMemo(() => {
    const introduced = weeds.filter(w => w.origin === 'Introduced' || WEED_ARRIVAL_DATA[w.id]);
    const offset = ((level - 1) * 8) % introduced.length;
    const rotated = [...introduced.slice(offset), ...introduced.slice(0, offset)];
    return shuffle(rotated).slice(0, 8).map(w => {
      const data = getArrivalData(w);
      return { weed: w, method: data.method, story: data.story };
    });
  }, [level]);

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
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (done) {
    addBadge({ gameId: 'invasive-travelers', gameName: 'Invasive Travelers', level: 'MS', score, total: rounds.length });
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
        <Ship className="w-10 h-10 text-primary mb-3" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Journey Complete!</h2>
        <p className="text-lg text-foreground mb-6">{score}/{rounds.length} correct</p>
        <LevelComplete level={level} score={score} total={rounds.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Invasive Travelers</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
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
            <p className="text-xs text-muted-foreground mt-1">Family: {current!.weed.family}</p>
          </div>
        </div>

        <p className="font-bold text-foreground text-center mb-4">How did this weed most likely arrive in North America?</p>

        <div className="flex flex-col gap-3 w-full max-w-md">
          {(Object.keys(ARRIVAL_LABELS) as ArrivalMethod[]).map(method => {
            const isCorrect = method === current!.method;
            const { label, Icon } = ARRIVAL_LABELS[method];
            const bg = !answered ? 'border-border bg-card hover:border-primary' :
              method === selected ? (isCorrect ? 'border-green-500 bg-green-500/20' : 'border-destructive bg-destructive/20') :
              isCorrect ? 'border-green-500 bg-green-500/20' : 'border-border bg-card';
            return (
              <button key={method} onClick={() => submit(method)}
                className={`p-4 rounded-lg border-2 text-left transition-all flex items-start gap-3 ${bg}`}>
                <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{ARRIVAL_DESCRIPTIONS[method]}</p>
                </div>
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="mt-4 bg-card border border-border rounded-xl p-4 max-w-md w-full">
            <p className={`font-bold mb-2 ${selected === current!.method ? 'text-green-500' : 'text-destructive'}`}>
              {selected === current!.method ? 'Correct!' : 'Not quite!'}
            </p>
            <p className="text-sm text-foreground leading-relaxed">{current!.story}</p>
            {current!.weed.memoryHook && (
              <p className="text-xs text-muted-foreground mt-2 italic">Tip: {current!.weed.memoryHook}</p>
            )}
            <button onClick={next} className="mt-3 px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold w-full">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
