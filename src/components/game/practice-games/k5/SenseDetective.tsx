import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Search,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Hash,
  Leaf,
  Flower2,
  Check,
  X,
  Radio,
  Ruler,
  Palette,
  Hand,
  Sprout,
} from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';
import { weeds } from '@/data/weeds';
import type { Weed } from '@/types/game';

// ---- Weed Scout Report (K-5 Easy Mode) ------------------------------------
// A farmer radios in a mystery weed. Young scouts ask simple questions to
// gather clues and pick the weed from a lineup. No photos — they use words
// and their listening skills, just like a real scout talking on a walkie-talkie.
// --------------------------------------------------------------------------

type QuestionId =
  | 'location'
  | 'quantity'
  | 'leaves'
  | 'flowers'
  | 'height'
  | 'color'
  | 'stem'
  | 'seeds';

interface ScoutQuestion {
  id: QuestionId;
  label: string;
  helper: string;
  Icon: typeof MapPin;
}

const ALL_QUESTIONS: ScoutQuestion[] = [
  {
    id: 'location',
    label: 'Where is it?',
    helper: 'Pick a place in the field.',
    Icon: MapPin,
  },
  {
    id: 'quantity',
    label: 'How many?',
    helper: 'Is it one plant or a big patch?',
    Icon: Hash,
  },
  {
    id: 'leaves',
    label: 'What do the leaves look like?',
    helper: 'Are they big, small, smooth, or hairy?',
    Icon: Leaf,
  },
  {
    id: 'flowers',
    label: 'Does it have flowers?',
    helper: 'What color or shape are they?',
    Icon: Flower2,
  },
  {
    id: 'height',
    label: 'How tall is it?',
    helper: 'Ankle-high, knee-high, or taller than you?',
    Icon: Ruler,
  },
  {
    id: 'color',
    label: 'What color is the plant?',
    helper: 'Bright green, dusty, or reddish?',
    Icon: Palette,
  },
  {
    id: 'stem',
    label: 'What is the stem like?',
    helper: 'Smooth, hairy, spiny, or hollow?',
    Icon: Hand,
  },
  {
    id: 'seeds',
    label: 'What about the seeds?',
    helper: 'Fluffy, sticky, or in a pod?',
    Icon: Sprout,
  },
];

const QUESTION_BUDGET = 3;
const ROUNDS_PER_LEVEL = 3;
// How many question choices the scout sees each round (rotates through the pool)
const QUESTIONS_PER_ROUND = 4;

const CROPS = ['soybean', 'corn', 'wheat', 'alfalfa'] as const;
const FIELD_SPOTS = [
  'the edge of the field',
  'the wet spot near the ditch',
  'the fencerow along the road',
  'the middle of the crop rows',
  'right next to the driveway',
  'the corner by the woods',
];

const HEIGHTS = [
  'about ankle-high',
  'about knee-high',
  'up to my waist',
  'taller than a grown-up',
];
const PLANT_COLORS = [
  'a bright grass-green',
  'a dusty gray-green',
  'a dark blue-green',
  'green with reddish streaks',
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Pick a trait that mentions any of the given keywords, else null. */
function traitLike(weed: Weed, keywords: string[]): string | null {
  const hit = weed.traits.find(t =>
    keywords.some(k => t.toLowerCase().includes(k))
  );
  return hit || null;
}

interface Round {
  weed: Weed;
  crop: string;
  spot: string;
  quantity: string;
  choices: Weed[];
  clues: Record<QuestionId, string>;
  questions: ScoutQuestion[];
}

function buildRound(weed: Weed, allWeeds: Weed[], questions: ScoutQuestion[]): Round {
  const crop = pick([...CROPS]);
  const spot = pick(FIELD_SPOTS);
  const quantity = pick([
    'just a few plants',
    'a small patch',
    'a big patch',
    'only one or two plants',
  ]);

  const leafTrait =
    traitLike(weed, ['leaf', 'leaves', 'blade', 'lobed', 'hairy', 'smooth', 'midvein']) ||
    weed.traits[0];
  const flowerTrait =
    traitLike(weed, ['flower', 'seed', 'panicle', 'head', 'bloom', 'spike']) ||
    'small flowers with tiny seeds';
  const stemTrait =
    traitLike(weed, ['stem', 'stalk', 'hollow', 'spine', 'prickle', 'ridged', 'grooved']) ||
    'a plain green stem';
  const seedTrait =
    traitLike(weed, ['seed', 'pod', 'bur', 'fluff', 'silky', 'parachute', 'cluster']) ||
    'tiny seeds you can barely see';
  const height = pick(HEIGHTS);
  const plantColor = pick(PLANT_COLORS);

  const distractors = shuffle(allWeeds.filter(w => w.id !== weed.id)).slice(0, 3);
  const choices = shuffle([weed, ...distractors]);

  const clues: Record<QuestionId, string> = {
    location: `It is growing in ${spot} of a ${crop} field.`,
    quantity: `The farmer saw ${quantity}.`,
    leaves: `The leaves are ${leafTrait.toLowerCase()}.`,
    flowers: `The flowers or seeds look like ${flowerTrait.toLowerCase()}.`,
    height: `The plant is ${height}.`,
    color: `Overall the plant looks ${plantColor}.`,
    stem: `The stem is ${stemTrait.toLowerCase()}.`,
    seeds: `Its seeds are ${seedTrait.toLowerCase()}.`,
  };

  return { weed, crop, spot, quantity, choices, clues, questions };
}

function buildRounds(level: number): Round[] {
  const pool = shuffle(weeds).slice(0, ROUNDS_PER_LEVEL);
  return pool.map((w, i) => {
    // Rotate the question window based on level + round index so students
    // encounter a different mix of questions each case.
    const offset = ((level - 1) * ROUNDS_PER_LEVEL + i) % ALL_QUESTIONS.length;
    const rotated = [...ALL_QUESTIONS.slice(offset), ...ALL_QUESTIONS.slice(0, offset)];
    const questions = rotated.slice(0, QUESTIONS_PER_ROUND);
    return buildRound(w, weeds, questions);
  });
}

interface Props {
  onBack: () => void;
  gameId?: string;
  gameName?: string;
  gradeLabel?: string;
}

export default function SenseDetective({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [asked, setAsked] = useState<Set<QuestionId>>(new Set());
  const [guess, setGuess] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const rounds = useMemo(() => buildRounds(level), [level]);
  const round = rounds[step];

  const askedList = round.questions.filter(q => asked.has(q.id));
  const remaining = QUESTION_BUDGET - asked.size;
  const readyToGuess = asked.size >= 2;

  const ask = (id: QuestionId) => {
    if (guess) return;
    if (asked.has(id) || remaining <= 0) return;
    setAsked(prev => new Set(prev).add(id));
  };

  const makeGuess = (id: string) => {
    if (guess) return;
    setGuess(id);
    if (id === round.weed.id) setScore(s => s + 1);
  };

  const next = () => {
    if (step + 1 >= rounds.length) {
      setDone(true);
    } else {
      setStep(s => s + 1);
      setAsked(new Set());
      setGuess(null);
    }
  };

  const restart = () => {
    setStep(0);
    setScore(0);
    setAsked(new Set());
    setGuess(null);
    setDone(false);
  };

  const nextLevel = () => {
    setLevel(l => l + 1);
    restart();
  };

  if (done) {
    return (
      <LevelComplete
        level={level}
        score={score}
        total={rounds.length}
        onNextLevel={nextLevel}
        onStartOver={restart}
        onBack={onBack}
        title={score === rounds.length ? 'Top Weed Scout!' : 'Nice scouting!'}
        gameId={gameId}
        gameName={gameName}
        gradeLabel={gradeLabel}
      />
    );
  }

  const isToxic = !!round.weed.safetyNote;
  const isCorrect = guess === round.weed.id;

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-card border-2 border-primary/40 rounded-xl p-4 mb-4 flex items-center gap-3">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground" aria-label="Back">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <Search className="w-8 h-8 text-primary" />
          <div className="flex-1">
            <h1 className="font-display font-bold text-2xl text-foreground">Weed Scout Report</h1>
            <p className="text-base text-muted-foreground">Listen to the clues and name the weed!</p>
          </div>
          <div className="text-lg font-extrabold text-foreground bg-muted px-4 py-1.5 rounded-full">
            Case {step + 1} / {rounds.length}
          </div>
        </div>

        {/* Safety rule banner */}
        <div className="bg-warning/10 border-4 border-warning rounded-2xl p-4 mb-4 flex items-start gap-3 shadow-md">
          <div className="shrink-0 w-12 h-12 rounded-full bg-warning flex items-center justify-center">
            <ShieldCheck className="w-7 h-7 text-warning-foreground" />
          </div>
          <div>
            <p className="text-base font-extrabold uppercase tracking-wide text-warning-foreground mb-1">Safety First</p>
            <p className="text-lg font-bold text-foreground leading-snug">
              Never touch a mystery weed. Ask a trusted adult before touching any plant.
            </p>
          </div>
        </div>

        {/* Radio call from farmer */}
        <div className="bg-primary/5 border-4 border-primary/40 rounded-2xl p-4 mb-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-6 h-6 text-primary" />
            <p className="text-sm font-extrabold uppercase tracking-wide text-primary">Farmer's Call</p>
          </div>
          <p className="text-lg font-bold text-foreground leading-snug">
            "Scout, I found a mystery weed in my <span className="underline">{round.crop}</span> field.
            Can you help me figure out what it is?"
          </p>
        </div>

        {/* Progress + budget */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-2 flex-1">
            {rounds.map((_, i) => (
              <div key={i} className={`h-4 flex-1 rounded-full ${i < step ? 'bg-primary' : i === step ? 'bg-primary/60' : 'bg-muted'}`} />
            ))}
          </div>
          <div className="text-base font-extrabold text-foreground bg-accent/20 border-2 border-accent px-4 py-1.5 rounded-full">
            Questions left: {Math.max(0, remaining)}
          </div>
        </div>

        {/* Question buttons */}
        {!guess && (
          <div className="bg-card border-4 border-primary/30 rounded-2xl p-4 mb-4 shadow-md">
            <h2 className="font-display font-extrabold text-xl text-foreground mb-1">Ask a question</h2>
            <p className="text-base text-muted-foreground mb-4">
              You can ask <strong>{QUESTION_BUDGET}</strong> questions. Pick the ones that help the most!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {round.questions.map(q => {
                const used = asked.has(q.id);
                const disabled = used || remaining <= 0;
                return (
                  <button
                    key={q.id}
                    onClick={() => ask(q.id)}
                    disabled={disabled}
                    className={`text-left rounded-2xl border-4 p-4 flex items-center gap-4 transition-all ${
                      used
                        ? 'bg-muted border-muted text-muted-foreground'
                        : disabled
                          ? 'bg-muted/50 border-muted text-muted-foreground opacity-60'
                          : 'bg-card border-primary/40 hover:border-primary hover:bg-primary/5 text-foreground'
                    }`}
                  >
                    <div className="shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <q.Icon className="w-7 h-7 text-primary" />
                    </div>
                    <div>
                      <span className="font-extrabold text-lg leading-snug block">{q.label}</span>
                      <span className="text-sm text-muted-foreground font-medium">{q.helper}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Scout notebook - clues gathered */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border-4 border-amber-500 rounded-2xl p-4 mb-4 shadow-md">
          <h2 className="font-display font-extrabold text-xl text-foreground mb-3">My Clue Notebook</h2>
          {askedList.length === 0 ? (
            <p className="text-lg text-muted-foreground italic">
              No clues yet. Ask a question above to get started!
            </p>
          ) : (
            <ul className="space-y-3">
              {askedList.map(q => (
                <li key={q.id} className="flex items-start gap-4 bg-card rounded-xl p-4 border-2 border-amber-300">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                    <q.Icon className="w-6 h-6 text-amber-700 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold uppercase tracking-wide text-amber-700 dark:text-amber-400">{q.label}</p>
                    <p className="text-lg font-bold text-foreground leading-snug">{round.clues[q.id]}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Guess lineup */}
        {readyToGuess && (
          <div className="bg-card border-4 border-primary/30 rounded-2xl p-4 mb-4 shadow-md">
            <h2 className="font-display font-extrabold text-xl text-foreground mb-1">
              {guess ? 'Your guess' : 'Which weed is it?'}
            </h2>
            <p className="text-base text-muted-foreground mb-4">
              {guess ? 'See how you did below.' : 'Tap the weed that matches your clues.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {round.choices.map(c => {
                const chosen = guess === c.id;
                const isAnswer = round.weed.id === c.id;
                let state = 'bg-card border-primary/40 hover:border-primary hover:bg-primary/5 text-foreground';
                if (guess) {
                  if (isAnswer) state = 'bg-success/15 border-success text-foreground';
                  else if (chosen) state = 'bg-destructive/15 border-destructive text-foreground';
                  else state = 'bg-muted border-muted text-muted-foreground opacity-70';
                }
                return (
                  <button
                    key={c.id}
                    onClick={() => makeGuess(c.id)}
                    disabled={!!guess}
                    className={`text-left rounded-2xl border-4 p-4 flex items-center justify-between gap-3 transition-all ${state}`}
                  >
                    <span className="font-extrabold text-xl leading-snug">{c.commonName}</span>
                    {guess && isAnswer && <Check className="w-7 h-7 text-success shrink-0" />}
                    {guess && chosen && !isAnswer && <X className="w-7 h-7 text-destructive shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Feedback */}
        {guess && (
          <div className={`rounded-2xl p-5 border-4 animate-scale-in
            ${isCorrect ? 'bg-success/10 border-success' : 'bg-warning/10 border-warning'}`}>
            <div className="text-2xl font-extrabold text-foreground mb-2 flex items-center gap-2">
              {isCorrect
                ? <><Check className="w-8 h-8 text-success" /> You solved it!</>
                : <><AlertTriangle className="w-8 h-8 text-warning" /> The answer was {round.weed.commonName}.</>
              }
            </div>
            <p className="text-lg text-foreground leading-snug mb-3">
              <strong>Scout tip:</strong> {round.weed.memoryHook}
            </p>
            <div className={`rounded-xl p-4 border-2 ${isToxic ? 'bg-destructive/10 border-destructive' : 'bg-success/10 border-success'}`}>
              <div className="flex items-center gap-2 mb-1">
                {isToxic
                  ? <><AlertTriangle className="w-6 h-6 text-destructive" /><span className="font-extrabold text-destructive text-lg">Do not touch!</span></>
                  : <><ShieldCheck className="w-6 h-6 text-success" /><span className="font-extrabold text-success text-lg">Look, but do not touch</span></>
                }
              </div>
              <p className="text-base text-foreground leading-snug">
                {isToxic
                  ? `${round.weed.commonName} can be harmful. Tell a trusted adult and never touch it unless they say it is safe.`
                  : `${round.weed.commonName} is safe to look at from far away, but always ask a trusted adult before touching any plant.`
                }
              </p>
            </div>
            <button
              onClick={next}
              className="mt-4 w-full py-4 rounded-xl bg-primary text-primary-foreground font-extrabold text-xl hover:opacity-90"
            >
              {step + 1 >= rounds.length ? 'Finish!' : 'Next Case →'}
            </button>
          </div>
        )}

        <div className="mt-5 text-center text-lg text-muted-foreground">
          Cases solved: <span className="font-extrabold text-foreground">{score}</span> / {step + (guess ? 1 : 0)}
        </div>

        <FarmerGuide
          message="A good scout listens closely. Ask about where the weed is, how many there are, and what the leaves and flowers look like. Then pick the best answer!"
          gradeLabel={gradeLabel}
          tone="intro"
          className="mt-5"
        />
      </div>
    </div>
  );
}
