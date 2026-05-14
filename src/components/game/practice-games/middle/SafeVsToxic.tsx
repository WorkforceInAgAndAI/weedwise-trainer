import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';
import { AlertTriangle, Stethoscope, ShieldCheck, MapPin, Beaker } from 'lucide-react';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface SafetyProfile {
  toxin: string;
  symptoms: string;
  ifExposed: string;
  whereFound: string;
  livestock: string;
  funFact: string;
}

const PROFILES: Record<string, SafetyProfile> = {
  'poison-hemlock': {
    toxin: 'Coniine and γ-coniceine — piperidine alkaloids that block neuromuscular signals.',
    symptoms: 'Trembling, salivation, weakness, slow pulse, then respiratory paralysis. Skin contact can cause dermatitis.',
    ifExposed: 'Wash exposed skin with soap and water. For ingestion call Poison Control (1-800-222-1222) immediately.',
    whereFound: 'Roadsides, ditches, fence rows, and stream banks across the Midwest.',
    livestock: 'Lethal to cattle, horses, sheep, swine — even in small amounts of cured hay.',
    funFact: 'Look for purple-blotched, hollow stems and a musty, mouse-like smell.',
  },
  'poison-ivy': {
    toxin: 'Urushiol — an oily resin that causes severe contact dermatitis.',
    symptoms: 'Intensely itchy, blistering rash 12-72 hours after contact. Burning the plant produces dangerous smoke.',
    ifExposed: 'Wash skin with cool soapy water within 30 minutes. Wash any clothing or tools separately.',
    whereFound: 'Wood edges, fence rows, and disturbed ground. "Leaves of three, let it be."',
    livestock: 'Generally not toxic to livestock when grazed, but humans handling exposed animals can react.',
    funFact: 'The urushiol oil stays active on tools and clothing for 1-5 years.',
  },
  'horsenettle': {
    toxin: 'Solanine glycoalkaloids — concentrated in unripe berries and foliage.',
    symptoms: 'Nausea, vomiting, abdominal pain. Spines on stems and leaves can puncture skin.',
    ifExposed: 'Clean spine pricks; for ingestion, contact Poison Control immediately.',
    whereFound: 'Pastures, hayfields, and crop fields, especially in sandy soils.',
    livestock: 'Toxic to cattle and horses; dried plants in hay remain toxic.',
    funFact: 'In the same family as tomatoes and potatoes (Solanaceae) — but the berries are toxic.',
  },
  'jimsonweed': {
    toxin: 'Tropane alkaloids (atropine, scopolamine, hyoscyamine) — affect the nervous system.',
    symptoms: 'Dilated pupils, hallucinations, fast heartbeat, dry mouth, seizures. All parts toxic.',
    ifExposed: 'Avoid eye contact after handling. Call Poison Control if any part is ingested.',
    whereFound: 'Old farmyards, livestock lots, and crop field edges with rich soil.',
    livestock: 'Toxic to all livestock; seeds are the most concentrated source.',
    funFact: 'The spiny seedpods earned it the nickname "thornapple."',
  },
  'common-burdock': {
    toxin: 'No chemical toxin — physical hazard from hooked burs.',
    symptoms: 'Burs hook into skin, hair, fur, and clothing; can cause eye injury in livestock.',
    ifExposed: 'Use gloves to remove burs. Comb pet fur and clothing carefully.',
    whereFound: 'Pastures, fence rows, and trails — especially where animals brush past.',
    livestock: 'Burs lower wool/fleece value and can cause eye ulcers in cattle and sheep.',
    funFact: 'Burdock burs inspired VELCRO® — invented by George de Mestral in 1941.',
  },
  'canada-thistle': {
    toxin: 'Mechanical hazard from spines; nitrates can accumulate in stressed plants.',
    symptoms: 'Spine punctures, infection risk; nitrate poisoning possible in livestock.',
    ifExposed: 'Pull out spines with tweezers, wash with soap, watch for redness.',
    whereFound: 'Pastures, roadsides, and crop fields — spreads from creeping rhizomes.',
    livestock: 'Avoided by grazers when other forage is available; reduces pasture quality.',
    funFact: 'A single Canada Thistle plant can grow a root system 15 feet deep.',
  },
  'bull-thistle': {
    toxin: 'Mechanical hazard from long, sharp spines on every leaf.',
    symptoms: 'Spines puncture skin and even leather gloves; mouth injuries in grazing livestock.',
    ifExposed: 'Wash punctures with soap and water; use thick leather gloves to handle.',
    whereFound: 'Pastures, roadsides, and disturbed ground across the Midwest.',
    livestock: 'Painful to graze; reduces forage productivity in pastures.',
    funFact: 'Bull Thistle is biennial — rosette one year, tall flower stalk the next.',
  },
  'stinging-nettle': {
    toxin: 'Stinging hairs deliver formic acid, histamine, acetylcholine, and serotonin.',
    symptoms: 'Immediate burning, itching, and red welts that last hours.',
    ifExposed: 'Do NOT rub. Rinse with cool water; apply baking soda paste or hydrocortisone cream.',
    whereFound: 'Wet woods, stream banks, and shady fence rows with rich soil.',
    livestock: 'Avoided when growing; cooking or drying destroys the sting (sometimes fed as hay).',
    funFact: 'Cooked nettle leaves are edible and high in iron — the sting cooks out.',
  },
};

const DEFAULT_PROFILE: SafetyProfile = {
  toxin: 'Variable; consult species-specific resources before handling.',
  symptoms: 'May cause skin irritation, dermatitis, or other reactions if handled or ingested.',
  ifExposed: 'Wash skin with soap and water. Call Poison Control (1-800-222-1222) for any ingestion.',
  whereFound: 'Disturbed soil, field edges, and roadsides.',
  livestock: 'Some plants are toxic to livestock — identify before letting animals graze.',
  funFact: 'Knowing toxic weeds keeps you, your family, and your animals safe.',
};

interface RemovalOption { id: string; label: string; safe: boolean }

const REMOVAL_BY_WEED: Record<string, RemovalOption[]> = {
  'poison-hemlock': [
    { id: 'ppe', label: 'Wear gloves, mask, and long sleeves; spot-treat with herbicide before flowering', safe: true },
    { id: 'mow-mature', label: 'Mow at full bloom to disperse seed', safe: false },
    { id: 'burn', label: 'Burn the plants to dispose of them quickly', safe: false },
    { id: 'compost', label: 'Compost the plant material', safe: false },
  ],
  'poison-ivy': [
    { id: 'ppe', label: 'Cover all skin; cut at base and bag for landfill (do not compost)', safe: true },
    { id: 'pull-bare', label: 'Pull bare-handed quickly to avoid prolonged contact', safe: false },
    { id: 'burn', label: 'Burn it — the fire destroys the urushiol', safe: false },
    { id: 'mow', label: 'Mow it down with a string trimmer', safe: false },
  ],
  'horsenettle': [
    { id: 'ppe', label: 'Wear thick gloves; mow before berries form, then spot-spray regrowth', safe: true },
    { id: 'eat-berries', label: 'Pick the yellow berries by hand for disposal', safe: false },
    { id: 'till-mature', label: 'Till in mature plants to spread the rhizomes', safe: false },
    { id: 'graze', label: 'Let livestock graze to control it', safe: false },
  ],
  'jimsonweed': [
    { id: 'ppe', label: 'Wear gloves; remove before seedpods open and bag for landfill', safe: true },
    { id: 'taste', label: 'Crush a leaf to confirm ID by smell', safe: false },
    { id: 'compost', label: 'Compost mature plants with seedpods', safe: false },
    { id: 'graze', label: 'Mow into hay for livestock feed', safe: false },
  ],
  'common-burdock': [
    { id: 'ppe', label: 'Wear gloves; cut taproot with a spade before bur formation', safe: true },
    { id: 'pull-burs', label: 'Pull mature plants by the burs', safe: false },
    { id: 'mow-flower', label: 'Mow once flowering — burs will already be set', safe: false },
    { id: 'leave', label: 'Leave for wildlife to disperse', safe: false },
  ],
  'canada-thistle': [
    { id: 'ppe', label: 'Wear thick gloves; mow at bud stage and follow up with systemic herbicide', safe: true },
    { id: 'till', label: 'Till repeatedly to chop the rhizomes', safe: false },
    { id: 'pull-bare', label: 'Pull plants bare-handed to remove the root', safe: false },
    { id: 'ignore', label: 'Leave small patches alone', safe: false },
  ],
  'bull-thistle': [
    { id: 'ppe', label: 'Wear leather gloves; cut taproot below the crown before flowering', safe: true },
    { id: 'mow-bloom', label: 'Mow at full bloom to scatter seed', safe: false },
    { id: 'grab', label: 'Grab and yank by hand', safe: false },
    { id: 'graze', label: 'Let cattle eat the spiny rosettes', safe: false },
  ],
  'stinging-nettle': [
    { id: 'ppe', label: 'Wear gloves and long sleeves; cut and bag, or spot-treat with herbicide', safe: true },
    { id: 'rub', label: 'Brush leaves with bare arms to "build immunity"', safe: false },
    { id: 'pull-bare', label: 'Pull bare-handed quickly', safe: false },
    { id: 'burn', label: 'Burn it on site to destroy the stinging hairs', safe: false },
  ],
};

const DEFAULT_REMOVAL: RemovalOption[] = [
  { id: 'ppe', label: 'Wear gloves and proper PPE; identify before handling', safe: true },
  { id: 'bare', label: 'Pull bare-handed for speed', safe: false },
  { id: 'burn', label: 'Burn on site for disposal', safe: false },
  { id: 'compost', label: 'Compost the mature plants', safe: false },
];

function getProfile(id: string) { return PROFILES[id] || DEFAULT_PROFILE; }
function getRemoval(id: string) { return shuffle(REMOVAL_BY_WEED[id] || DEFAULT_REMOVAL); }

const QUESTIONS_PER_LEVEL = 6;

export default function SafeVsToxic({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const rounds = useMemo(() => {
    const toxic = weeds.filter(w => w.safetyNote);
    const safe = weeds.filter(w => !w.safetyNote);
    const offset = ((level - 1) * QUESTIONS_PER_LEVEL) % Math.max(toxic.length, 1);
    const rotated = [...toxic.slice(offset), ...toxic.slice(0, offset)];
    return shuffle(rotated).slice(0, QUESTIONS_PER_LEVEL).map(t => {
      const others = shuffle(safe).slice(0, 3);
      return { toxic: t, options: shuffle([t, ...others]) };
    });
  }, [level]);

  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [phase, setPhase] = useState<'identify' | 'review' | 'remove' | 'done'>('identify');
  const [removalPick, setRemovalPick] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<{ weed: string; identified: boolean; safeRemoval: boolean }[]>([]);

  const finished = round >= rounds.length;
  const current = !finished ? rounds[round] : null;
  const removalOpts = useMemo(() => current ? getRemoval(current.toxic.id) : [], [current?.toxic.id]);

  const identify = (id: string) => {
    if (phase !== 'identify') return;
    setSelected(id);
    setPhase('review');
  };

  const continueFromReview = () => {
    if (selected === current!.toxic.id) {
      setScore(s => s + 1);
      setPhase('remove');
    } else {
      setResults(r => [...r, { weed: current!.toxic.commonName, identified: false, safeRemoval: false }]);
      setPhase('done');
    }
  };

  const remove = (id: string) => {
    setRemovalPick(id);
    const opt = removalOpts.find(o => o.id === id);
    const safeRemoval = !!opt?.safe;
    if (safeRemoval) setScore(s => s + 1);
    setResults(r => [...r, { weed: current!.toxic.commonName, identified: true, safeRemoval }]);
    setPhase('done');
  };

  const next = () => {
    setRound(r => r + 1);
    setSelected(null);
    setPhase('identify');
    setRemovalPick(null);
  };

  const restart = () => {
    setRound(0); setScore(0); setSelected(null); setPhase('identify');
    setRemovalPick(null); setResults([]);
  };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (finished) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-start p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold text-foreground mb-2">Round Summary</h2>
        <p className="text-lg text-foreground mb-4">{score}/{rounds.length * 2} points</p>
        <div className="w-full max-w-md space-y-2 mb-6">
          {results.map((r, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
              <span className={`text-lg font-bold ${r.identified ? 'text-green-500' : 'text-destructive'}`}>
                {r.identified ? (r.safeRemoval ? 'Perfect' : 'Partial') : 'Missed'}
              </span>
              <span className="text-sm text-foreground flex-1">{r.weed}</span>
              <span className="text-xs text-muted-foreground">
                {r.identified && r.safeRemoval ? '2/2' : r.identified ? '1/2' : '0/2'}
              </span>
            </div>
          ))}
        </div>
        <LevelComplete level={level} score={score} total={rounds.length * 2} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />
      </div>
    );
  }

  const profile = current ? getProfile(current.toxic.id) : DEFAULT_PROFILE;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Safe or Toxic?</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">{round + 1}/{rounds.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {phase === 'identify' && (
          <>
            <p className="text-sm text-muted-foreground mb-3 text-center">Find the toxic weed!</p>
            <div className="grid grid-cols-2 gap-3 max-w-2xl mx-auto">
              {current!.options.map(w => (
                <button key={w.id} onClick={() => identify(w.id)}
                  className="flex flex-col items-center p-3 rounded-xl border-2 border-border bg-card hover:border-primary transition-all">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg overflow-hidden bg-secondary mb-2">
                    <WeedImage weedId={w.id} stage="vegetative" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-base font-medium text-foreground">{w.commonName}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {phase === 'review' && (
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col items-center mb-3">
              <div className="w-64 h-64 rounded-xl overflow-hidden bg-secondary mb-3 border-2 border-destructive">
                <WeedImage weedId={current!.toxic.id} stage="vegetative" className="w-full h-full object-cover" />
              </div>
              {selected === current!.toxic.id ? (
                <p className="text-green-500 font-bold text-lg">Correct! You identified the toxic weed.</p>
              ) : (
                <p className="text-destructive font-bold text-lg">Not quite!</p>
              )}
              <p className="font-bold text-foreground text-xl mt-1">{current!.toxic.commonName}</p>
              <p className="text-xs italic text-muted-foreground">{current!.toxic.scientificName}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 mb-4">
              {current!.toxic.safetyNote && (
                <div className="bg-destructive/10 border border-destructive rounded-xl p-3 sm:col-span-2">
                  <p className="text-sm font-bold text-destructive mb-1 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Why it's toxic</p>
                  <p className="text-sm text-foreground">{current!.toxic.safetyNote}</p>
                </div>
              )}
              <div className="bg-card border border-border rounded-xl p-3">
                <p className="text-xs font-bold text-foreground mb-1 flex items-center gap-1"><Beaker className="w-4 h-4" /> Active toxin</p>
                <p className="text-xs text-muted-foreground leading-snug">{profile.toxin}</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-400 rounded-xl p-3">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1"><Stethoscope className="w-4 h-4" /> Symptoms</p>
                <p className="text-xs text-foreground leading-snug">{profile.symptoms}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-400 rounded-xl p-3">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> If exposed</p>
                <p className="text-xs text-foreground leading-snug">{profile.ifExposed}</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/30 border border-green-500 rounded-xl p-3">
                <p className="text-xs font-bold text-green-700 dark:text-green-400 mb-1 flex items-center gap-1"><MapPin className="w-4 h-4" /> Where it grows</p>
                <p className="text-xs text-foreground leading-snug">{profile.whereFound}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3">
                <p className="text-xs font-bold text-foreground mb-1">Livestock impact</p>
                <p className="text-xs text-muted-foreground leading-snug">{profile.livestock}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 sm:col-span-2">
                <p className="text-xs font-bold text-foreground mb-1">Did you know?</p>
                <p className="text-xs text-muted-foreground leading-snug">{profile.funFact}</p>
              </div>
            </div>
            <div className="text-center">
              <button onClick={continueFromReview} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
                {selected === current!.toxic.id ? 'Plan a safe removal →' : 'Continue'}
              </button>
            </div>
          </div>
        )}

        {phase === 'remove' && (
          <div className="max-w-2xl mx-auto">
            <p className="text-foreground font-bold text-center mb-3">Choose the safest removal plan for {current!.toxic.commonName}:</p>
            <div className="flex flex-col gap-2">
              {removalOpts.map(opt => (
                <button key={opt.id} onClick={() => remove(opt.id)}
                  className="text-left p-3 rounded-lg border-2 border-border bg-card text-sm text-foreground font-medium hover:border-primary transition-all">
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div className="text-center mt-8 max-w-md mx-auto">
            {removalPick ? (
              <>
                <p className={`font-bold text-lg mb-2 ${removalOpts.find(o => o.id === removalPick)?.safe ? 'text-green-500' : 'text-destructive'}`}>
                  {removalOpts.find(o => o.id === removalPick)?.safe ? 'Safe removal — well done!' : 'That approach is unsafe.'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">{profile.ifExposed}</p>
              </>
            ) : (
              <p className="font-bold text-lg text-destructive mb-2">The toxic weed was {current!.toxic.commonName}.</p>
            )}
            <button onClick={next} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Next</button>
          </div>
        )}
      </div>
      <FloatingCoach grade="6-8" tip={`Some weeds cause rashes, illness, or harm livestock. Always identify before handling.`} />
    </div>
  );
}
