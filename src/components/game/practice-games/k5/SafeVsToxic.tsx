import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';
import { AlertTriangle, Stethoscope, ShieldCheck, MapPin } from 'lucide-react';

// Deeper, kid-friendly safety profile per toxic weed.
interface SafetyProfile {
  symptoms: string;
  ifExposed: string;
  wherFound: string;
  funFact: string;
}
const SAFETY_PROFILE: Record<string, SafetyProfile> = {
  'poison-hemlock': {
    symptoms: 'Touching the sap can cause skin rash; eating any part can cause trembling, weakness, and trouble breathing.',
    ifExposed: 'Wash skin with soap and water right away. If anyone eats any part, call Poison Control (1-800-222-1222) immediately.',
    wherFound: 'Roadsides, ditches, fence rows, and stream banks across the Midwest.',
    funFact: 'You can spot it by purple blotches on smooth, hollow stems and a musty mouse-like smell.',
  },
  'poison-ivy': {
    symptoms: 'An itchy, blistering rash from urushiol oil — even from touching tools, pets, or clothes that brushed it.',
    ifExposed: 'Wash skin with cool soapy water within 30 minutes. Wash any clothes or tools that touched it separately.',
    wherFound: 'Wood edges, fence rows, and disturbed ground. "Leaves of three, let it be."',
    funFact: 'Burning poison ivy is dangerous — the smoke can cause a serious lung reaction.',
  },
  'horsenettle': {
    symptoms: 'Sharp spines on stems and leaves can prick. The yellow berries are poisonous if eaten.',
    ifExposed: 'Clean any pricks with soap and water. Never eat the berries — call Poison Control if anyone does.',
    wherFound: 'Pastures, hayfields, and crop fields, especially in sandy soils.',
    funFact: 'It is in the same family as tomatoes and potatoes — but the berries are toxic, not food!',
  },
  'jimsonweed': {
    symptoms: 'Every part is poisonous. Eating seeds can cause confusion, fast heartbeat, and hallucinations.',
    ifExposed: 'Do not touch your eyes after handling. Wash hands well. Call Poison Control if any is swallowed.',
    wherFound: 'Old farmyards, livestock lots, and crop field edges with rich soil.',
    funFact: 'The spiny seedpods earned it the nickname "thornapple."',
  },
  'common-burdock': {
    symptoms: 'The hooked burs grab skin, hair, and clothing and are hard to remove.',
    ifExposed: 'Use gloves to remove burs from clothes and pets. Comb hair carefully if burs catch.',
    wherFound: 'Pastures, fence rows, and trails — especially where animals brush past.',
    funFact: 'Burdock burs were the inspiration for VELCRO® — a Swiss inventor copied the hooks!',
  },
  'canada-thistle': {
    symptoms: 'Spines along the leaves and flower heads prick skin and can cause infection if not cleaned.',
    ifExposed: 'Pull out any spines with tweezers, wash with soap, and watch for redness.',
    wherFound: 'Pastures, roadsides, and crop fields — it spreads from creeping underground roots.',
    funFact: 'One Canada Thistle plant can grow a root system 15 feet deep.',
  },
  'bull-thistle': {
    symptoms: 'Long, sharp spines on every leaf can puncture skin and even gloves.',
    ifExposed: 'Wash any pokes with soap and water. Use leather gloves to handle the plant.',
    wherFound: 'Pastures, roadsides, and disturbed ground across the Midwest.',
    funFact: 'Bull Thistle is biennial — it makes a leafy rosette one year, then a tall flower stalk the next.',
  },
  'stinging-nettle': {
    symptoms: 'Tiny stinging hairs inject formic acid and cause burning, itching, and red bumps.',
    ifExposed: 'Do not rub! Rinse with cool water, then apply a paste of baking soda and water.',
    wherFound: 'Wet woods, stream banks, and shady fence rows with rich soil.',
    funFact: 'Once cooked, the leaves lose their sting and can be eaten like spinach!',
  },
};
const DEFAULT_PROFILE: SafetyProfile = {
  symptoms: 'May cause skin irritation or other reactions if handled or eaten.',
  ifExposed: 'Wash skin with soap and water. Tell an adult and call Poison Control (1-800-222-1222) if anyone eats any part.',
  wherFound: 'Disturbed soil, field edges, and roadsides.',
  funFact: 'Knowing toxic weeds keeps you, your family, and your animals safe.',
};
function getSafetyProfile(weedId: string) { return SAFETY_PROFILE[weedId] || DEFAULT_PROFILE; }

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

// Per-weed safe handling guidance, so the management answer differs by toxic plant.
// Each entry has 4 options with the safe ones varying based on the actual hazard.
interface RemovalOption { id: string; label: string; safe: boolean }
const SAFE_HANDLING_BY_WEED: Record<string, RemovalOption[]> = {
  'poison-hemlock': [
    { id: 'mask-gloves', label: 'Wear gloves AND a mask while pulling — sap and fumes are toxic', safe: true },
    { id: 'tell', label: 'Tell an adult — never touch it yourself', safe: true },
    { id: 'burn', label: 'Burn it in a bonfire to get rid of it', safe: false },
    { id: 'crush', label: 'Crush the leaves to smell what it is', safe: false },
  ],
  'poison-ivy': [
    { id: 'long-sleeves', label: 'Wear long sleeves, gloves, and pants — never touch the leaves', safe: true },
    { id: 'tell', label: 'Tell an adult to spot-treat with herbicide', safe: true },
    { id: 'pull-bare', label: 'Pull it bare-handed quickly', safe: false },
    { id: 'burn', label: 'Burn it — the smoke carries the rash-causing oils', safe: false },
  ],
  'horsenettle': [
    { id: 'gloves', label: 'Wear thick gloves — the spines on stems sting', safe: true },
    { id: 'tell', label: 'Tell an adult and stay away from the berries', safe: true },
    { id: 'eat-berries', label: 'Try the yellow berries — they look like tomatoes', safe: false },
    { id: 'bare', label: 'Pull bare-handed and toss them aside', safe: false },
  ],
  'jimsonweed': [
    { id: 'gloves', label: 'Wear gloves and wash hands afterwards — every part is poisonous', safe: true },
    { id: 'tell', label: 'Tell an adult — do not touch the seed pods', safe: true },
    { id: 'taste', label: 'Taste a seed to see what it is', safe: false },
    { id: 'rub-eyes', label: 'Touch the leaves then rub your eyes', safe: false },
  ],
  'common-burdock': [
    { id: 'gloves', label: 'Wear gloves to pull burs off — they hook into skin', safe: true },
    { id: 'tell', label: 'Tell an adult before touching the prickly burs', safe: true },
    { id: 'throw', label: 'Throw burs at friends as a joke', safe: false },
    { id: 'eat', label: 'Chew on the seed burs to see how they taste', safe: false },
  ],
  'canada-thistle': [
    { id: 'gloves', label: 'Wear thick gloves — the spines along the leaves prick', safe: true },
    { id: 'tell', label: 'Tell an adult before pulling — the spines hurt', safe: true },
    { id: 'bare', label: 'Pull it with bare hands as fast as you can', safe: false },
    { id: 'sit-on', label: 'Sit on it to flatten it', safe: false },
  ],
  'bull-thistle': [
    { id: 'gloves', label: 'Wear thick leather gloves — every leaf has long spines', safe: true },
    { id: 'tell', label: 'Tell an adult to mow or cut before flowering', safe: true },
    { id: 'grab', label: 'Grab it bare-handed — it does not look that sharp', safe: false },
    { id: 'eat-flower', label: 'Pick the purple flower like a normal flower', safe: false },
  ],
  'stinging-nettle': [
    { id: 'gloves', label: 'Wear gloves and long sleeves — the hairs sting on contact', safe: true },
    { id: 'tell', label: 'Tell an adult — do not brush against it', safe: true },
    { id: 'pull-bare', label: 'Pull it with bare hands quickly', safe: false },
    { id: 'rub', label: 'Rub the leaves on your arm to see what happens', safe: false },
  ],
};
const DEFAULT_REMOVAL_METHODS: RemovalOption[] = [
  { id: 'gloves', label: 'Wear gloves and pull it out', safe: true },
  { id: 'tell', label: 'Tell an adult and stay away', safe: true },
  { id: 'bare', label: 'Pull it out with bare hands', safe: false },
  { id: 'eat', label: 'Touch it to see if it stings', safe: false },
];
function getRemovalOptions(weedId: string): RemovalOption[] {
  return SAFE_HANDLING_BY_WEED[weedId] || DEFAULT_REMOVAL_METHODS;
}

const QUESTIONS_PER_LEVEL = 5;

export default function SafeVsToxic({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const rounds = useMemo(() => {
    const toxic = weeds.filter(w => w.safetyNote);
    const safe = weeds.filter(w => !w.safetyNote);
    const offset = (level - 1) * QUESTIONS_PER_LEVEL;
    const rotatedToxic = [...toxic.slice(offset % toxic.length), ...toxic.slice(0, offset % toxic.length)];
    return shuffle(rotatedToxic).slice(0, QUESTIONS_PER_LEVEL).map(tw => {
      const decoys = shuffle(safe.filter(s => s.family === tw.family || Math.random() > 0.5)).slice(0, 3);
      const group = shuffle([tw, ...decoys]);
      return { toxicWeed: tw, group };
    });
  }, [level]);

  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [identified, setIdentified] = useState(false);
  const [showToxicAnswer, setShowToxicAnswer] = useState(false);
  const [removalChoice, setRemovalChoice] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<Array<{ correct: boolean; weedName: string }>>([]);
  const [showSummary, setShowSummary] = useState(false);

  const done = round >= rounds.length;
  const r = !done ? rounds[round] : null;

  const identify = () => {
    setIdentified(true);
    const correct = selected === r?.toxicWeed.id;
    if (correct) setScore(s => s + 1);
    setResults(prev => [...prev, { correct, weedName: r?.toxicWeed.commonName || '' }]);
  };

  const chooseRemoval = (id: string) => setRemovalChoice(id);

  const next = () => {
    if (round + 1 >= rounds.length) {
      setShowSummary(true);
    } else {
      setRound(i => i + 1);
      setSelected(null);
      setIdentified(false);
      setShowToxicAnswer(false);
      setRemovalChoice(null);
    }
  };

  const restart = () => {
    setRound(0); setSelected(null); setIdentified(false); setShowToxicAnswer(false);
    setRemovalChoice(null); setScore(0); setResults([]); setShowSummary(false);
  };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  // Performance summary
  if (showSummary) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Performance Summary</h2>
        <p className="text-lg text-foreground mb-4">Score: <span className="font-bold text-primary">{score}/{rounds.length}</span></p>
        <div className="space-y-2 mb-6 w-full max-w-sm">
          {results.map((r, i) => (
            <div key={i} className={`flex items-center gap-2 px-4 py-2 rounded-lg ${r.correct ? 'bg-green-500/10 border border-green-500' : 'bg-destructive/10 border border-destructive'}`}>
              <span className="text-sm font-bold">{r.correct ? '✓' : '✗'}</span>
              <span className="text-sm text-foreground">{r.weedName}</span>
            </div>
          ))}
        </div>
        <LevelComplete level={level} score={score} total={rounds.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
      </div>
    );
  }

  if (done) return <LevelComplete level={level} score={score} total={rounds?.length ?? 0} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />;

  const foundCorrect = identified && selected === r?.toxicWeed.id;

  // Answer response screen after identification
  if (showToxicAnswer && r) {
    const profile = getSafetyProfile(r.toxicWeed.id);
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-bold text-foreground text-lg flex-1">Safe or Toxic?</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
          <span className="text-sm text-muted-foreground">{round + 1}/{rounds.length}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
          <FarmerGuide
            gradeLabel="K-5"
            tone={foundCorrect ? 'correct' : 'wrong'}
            className="mb-3"
            message={foundCorrect
              ? `Great eye! ${r.toxicWeed.commonName} is one to watch out for. Read what makes it toxic, then choose how to handle it safely.`
              : `That one is safe. The toxic weed was ${r.toxicWeed.commonName}. Let's learn what makes it dangerous so you can spot it next time.`
            }
          />
          <div className="flex justify-center mb-3">
            <div className="w-40 h-40 rounded-xl overflow-hidden border-2 border-destructive bg-secondary">
              <WeedImage weedId={r.toxicWeed.id} stage="flower" className="w-full h-full object-cover" />
            </div>
          </div>
          <h3 className="text-center font-bold text-foreground text-lg mb-2">{r.toxicWeed.commonName}</h3>
          <p className="text-center text-xs italic text-muted-foreground mb-3">{r.toxicWeed.scientificName}</p>

          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            {r.toxicWeed.safetyNote && (
              <div className="bg-destructive/10 border border-destructive rounded-xl p-3 sm:col-span-2">
                <p className="text-sm font-bold text-destructive mb-1 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Why it's toxic</p>
                <p className="text-sm text-foreground">{r.toxicWeed.safetyNote}</p>
              </div>
            )}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-400 rounded-xl p-3">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1"><Stethoscope className="w-4 h-4" /> Symptoms</p>
              <p className="text-xs text-foreground leading-snug">{profile.symptoms}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-400 rounded-xl p-3">
              <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> If you touch or eat it</p>
              <p className="text-xs text-foreground leading-snug">{profile.ifExposed}</p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-500 rounded-xl p-3">
              <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-1 flex items-center gap-1"><MapPin className="w-4 h-4" /> Where it grows</p>
              <p className="text-xs text-foreground leading-snug">{profile.wherFound}</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-3">
              <p className="text-xs font-bold text-foreground mb-1">Did you know?</p>
              <p className="text-xs text-muted-foreground leading-snug">{profile.funFact}</p>
            </div>
          </div>

          {foundCorrect && !removalChoice && (
            <div className="space-y-2 mt-4">
              <p className="text-sm font-bold text-foreground text-center">Now — how should you safely handle {r.toxicWeed.commonName}?</p>
              {getRemovalOptions(r.toxicWeed.id).map(m => (
                <button key={m.id} onClick={() => chooseRemoval(m.id)}
                  className="w-full py-2 px-3 rounded-lg border-2 border-border bg-card text-foreground text-sm font-medium text-left hover:border-primary transition-colors">
                  {m.label}
                </button>
              ))}
            </div>
          )}
          {(removalChoice || !foundCorrect) && (
            <div className="text-center mt-3">
              {removalChoice && (
                <FarmerGuide
                  gradeLabel="K-5"
                  className="mb-3 text-left"
                  tone={getRemovalOptions(r.toxicWeed.id).find(m => m.id === removalChoice)?.safe ? 'correct' : 'wrong'}
                  message={getRemovalOptions(r.toxicWeed.id).find(m => m.id === removalChoice)?.safe
                    ? `Smart and safe! Always tell an adult, wear the right gear, and never put any plant part in your mouth.`
                    : `That's not safe. Remember: ${profile.ifExposed}`
                  }
                />
              )}
              <button onClick={next} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
                {round + 1 < rounds.length ? 'Next →' : 'See Summary'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Safe or Toxic?</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">{round + 1}/{rounds.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <FarmerGuide
          gradeLabel="K-5"
          tone="intro"
          className="max-w-md mx-auto mb-3"
          message="One of these four weeds is toxic. Look at leaves, stems, and flowers — then tap your guess!"
        />
        <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto mb-4">
          {r!.group.map(w => (
            <button key={w.id} onClick={() => !identified && setSelected(w.id)}
              className={`rounded-xl overflow-hidden border-2 transition-all ${
                selected === w.id ? 'border-primary scale-105' : 'border-border hover:border-primary/50'
              }`}>
              <div className="aspect-square bg-secondary">
                <WeedImage weedId={w.id} stage="flower" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs font-medium text-foreground p-1.5 text-center">{w.commonName}</p>
            </button>
          ))}
        </div>
        {!identified && selected && (
          <button onClick={() => { identify(); setShowToxicAnswer(true); }}
            className="w-full max-w-sm mx-auto block py-3 rounded-lg bg-destructive text-destructive-foreground font-bold">
            That's the toxic one!
          </button>
        )}
      </div>
    </div>
  );
}
