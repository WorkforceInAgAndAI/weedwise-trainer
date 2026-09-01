import { useMemo, useState } from 'react';
import { Wind, Droplets, PawPrint, Bird, Tractor, Sprout, ArrowLeft, MapPin, Check, X } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';
import WeedImage from '@/components/game/WeedImage';
import { middleSchoolWeeds } from '@/data/gradeWeeds';
import { getSeedFact } from '@/data/seedFacts';
import { getDifficulty } from '@/lib/difficulty';

type Method = 'wind' | 'water' | 'animal' | 'bird' | 'machinery';

const METHOD_META: Record<Method, { Icon: React.ComponentType<{ className?: string }>; name: string; color: string; label: string }> = {
  wind:      { Icon: Wind,     name: 'Wind',           color: 'text-sky-600',   label: 'Float away on the breeze' },
  water:     { Icon: Droplets, name: 'Water',          color: 'text-blue-600',  label: 'Ride the rain water and the ditch' },
  animal:    { Icon: PawPrint, name: 'Animal fur',     color: 'text-amber-700', label: 'Hook onto the fur of a passing animal' },
  bird:      { Icon: Bird,     name: 'Bird or manure', color: 'text-rose-600',  label: 'Get eaten by an animal and travel inside it' },
  machinery: { Icon: Tractor,  name: 'Machinery',      color: 'text-slate-600', label: 'Hitch a ride on a tractor or combine' },
};

const ALL_METHODS: Method[] = ['wind', 'water', 'animal', 'bird', 'machinery'];

/** Turn the published dispersal sentence into the one travel mode that fits best. */
function methodFor(dispersal: string): Method {
  const d = dispersal.toLowerCase();
  if (d.includes('wind')) return 'wind';
  if (d.includes('water') || d.includes('flood') || d.includes('waterfowl')) return 'water';
  if (d.includes('fur') || d.includes('cling') || d.includes('bur') || d.includes('animal')) return 'animal';
  if (d.includes('bird') || d.includes('manure') || d.includes('eaten') || d.includes('digest')) return 'bird';
  return 'machinery';
}

/** Generic trip prompts — the story never hints at the right answer. */
const TRIPS = [
  'You want to visit your family in the next field over. How will you get there?',
  'The soil right here is crowded with your brothers and sisters. How will you move somewhere roomier?',
  'You would like to reach the ditch on the far side of the road. How will you travel?',
  'A new field was just planted a mile away. How will you get to it?',
  'Your plant has dried down and it is time to leave home. How will you go?',
  'You want to end up in a whole different county next spring. How will you travel that far?',
];

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function SeedJourney({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);
  const diff = getDifficulty(level, 'k5');

  // Seeds the player can choose to become this level.
  const seedChoices = useMemo(() => {
    return shuffle(middleSchoolWeeds)
      .slice(0, 6)
      .map(w => {
        const fact = getSeedFact(w.commonName, w.family, w.plantType);
        return { weed: w, fact, method: methodFor(fact.dispersal) };
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const [seedIdx, setSeedIdx] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<Method | null>(null);
  const [done, setDone] = useState(false);

  const seed = seedIdx !== null ? seedChoices[seedIdx] : null;
  const totalTrips = Math.min(Math.max(diff.rounds, 3), TRIPS.length);

  const trips = useMemo(() => shuffle(TRIPS).slice(0, totalTrips), [level, seedIdx, totalTrips]);

  // Up to five travel options per prompt; exactly one matches this species.
  const options = useMemo(() => {
    if (!seed) return [];
    const wrong = shuffle(ALL_METHODS.filter(m => m !== seed.method)).slice(0, 4);
    return shuffle([seed.method, ...wrong]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed?.weed.id, step]);

  const answered = picked !== null;
  const isCorrect = answered && picked === seed?.method;

  const choose = (m: Method) => {
    if (answered) return;
    setPicked(m);
    if (m === seed?.method) setScore(s => s + 1);
  };

  const next = () => {
    if (step + 1 >= trips.length) setDone(true);
    else { setStep(s => s + 1); setPicked(null); }
  };

  const restart = () => { setStep(0); setScore(0); setPicked(null); setDone(false); setSeedIdx(null); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };

  if (done) {
    return (
      <LevelComplete
        level={level}
        score={score}
        total={trips.length}
        onNextLevel={nextLevel}
        onStartOver={restart}
        onBack={onBack}
        title={score === trips.length ? 'Perfect journey! Your seed found new homes!' : 'Your seed traveled — try again for a perfect trip!'}
        gameId={gameId}
        gameName={gameName}
        gradeLabel={gradeLabel}
      />
    );
  }

  const header = (
    <div className="bg-card border-2 border-primary/40 rounded-lg p-4 mb-4 flex items-center gap-3">
      <button onClick={onBack} className="text-muted-foreground hover:text-foreground" aria-label="Back">
        <ArrowLeft className="w-5 h-5" />
      </button>
      <Sprout className="w-6 h-6 text-primary" />
      <div className="flex-1">
        <h1 className="font-display font-bold text-lg text-foreground">Seed Journey</h1>
        <p className="text-xs text-muted-foreground">Pick your seed, then travel the way your species really travels.</p>
      </div>
      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
    </div>
  );

  // Step 1 — choose which weed seed you are.
  if (!seed) {
    return (
      <div className="fixed inset-0 bg-background z-50 overflow-y-auto p-4">
        <div className="max-w-3xl mx-auto">
          {header}
          <p className="text-sm font-bold text-foreground mb-3">Which weed seed do you want to be?</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {seedChoices.map((s, i) => (
              <button
                key={s.weed.id}
                onClick={() => setSeedIdx(i)}
                className="rounded-xl border-2 border-border bg-card p-3 text-left hover:border-primary transition-colors"
              >
                <div className="w-full h-28 rounded-lg overflow-hidden bg-secondary mb-2">
                  <WeedImage weedId={s.weed.id} stage="seed" className="w-full h-full object-cover" />
                </div>
                <p className="text-sm font-bold text-foreground leading-tight">{s.weed.commonName}</p>
                <p className="text-[11px] italic text-muted-foreground">{s.weed.scientificName}</p>
              </button>
            ))}
          </div>
          <FarmerGuide message="Every weed seed travels its own way. Pick a seed and see if you can plan its trip!" />
        </div>
      </div>
    );
  }

  const trip = trips[step];

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto">
        {header}

        {/* Who you are */}
        <div className="rounded-xl border-2 border-border bg-card p-3 mb-4 flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0">
            <WeedImage weedId={seed.weed.id} stage="seed" className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">You are the seed of…</p>
            <p className="font-display font-bold text-lg text-foreground leading-tight">{seed.weed.commonName}</p>
            <p className="text-xs text-muted-foreground">{seed.fact.production}</p>
          </div>
          <div className="ml-auto text-sm font-semibold text-foreground bg-muted px-3 py-1 rounded-full">
            {step + 1} / {trips.length}
          </div>
        </div>

        {/* Trip prompt */}
        <div className="bg-card border-2 border-border rounded-lg p-5 space-y-4 animate-scale-in">
          <div className="flex items-start gap-2 text-sm text-primary font-semibold">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Trip {step + 1}</span>
          </div>
          <p className="text-foreground text-base leading-relaxed">{trip}</p>

          <div className="grid gap-3">
            {options.map(m => {
              const meta = METHOD_META[m];
              const isPick = picked === m;
              const isBest = m === seed.method;
              const state = !answered
                ? 'border-border bg-secondary/40 hover:border-primary/60 hover:bg-secondary'
                : isBest
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : isPick
                    ? 'border-destructive bg-destructive/10'
                    : 'border-border bg-secondary/40 opacity-60';
              return (
                <button
                  key={m}
                  onClick={() => choose(m)}
                  disabled={answered}
                  className={`p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3 ${state}`}
                >
                  <div className={`w-12 h-12 rounded-full bg-background border-2 border-current flex items-center justify-center ${meta.color}`}>
                    <meta.Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{meta.name}</div>
                    <div className="text-foreground font-medium">{meta.label}</div>
                  </div>
                  {answered && isBest && <Check className="w-6 h-6 text-emerald-600" />}
                  {answered && isPick && !isBest && <X className="w-6 h-6 text-destructive" />}
                </button>
              );
            })}
          </div>

          {answered && (
            <div className={`rounded-lg p-4 border-2 animate-scale-in ${isCorrect ? 'border-emerald-400 bg-emerald-500/10' : 'border-amber-400 bg-amber-500/10'}`}>
              <div className="font-bold mb-1 text-foreground">{isCorrect ? 'That is your ride!' : 'Not how your seed travels.'}</div>
              <p className="text-sm text-foreground">
                {seed.weed.commonName} seeds travel by <strong>{METHOD_META[seed.method].name.toLowerCase()}</strong>: {seed.fact.dispersal}.
              </p>
              <p className="text-xs text-muted-foreground mt-2">{seed.fact.seedDescription}</p>
              <button onClick={next} className="mt-3 w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90">
                {step + 1 >= trips.length ? 'Finish Journey' : 'Next Trip →'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          Correct so far: <span className="font-bold text-foreground">{score}</span> / {step + (answered ? 1 : 0)}
        </div>
      </div>

      <FarmerGuide message="Wind, water, animals, birds, or machinery — each weed seed has a favorite way to travel." />
    </div>
  );
}
