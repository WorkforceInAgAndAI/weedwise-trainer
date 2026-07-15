import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Search,
  ShieldCheck,
  AlertTriangle,
  MapPin,
  Hash,
  Sprout,
  Leaf,
  Ruler,
  Flower2,
  HelpCircle,
  Check,
  X,
  Radio,
} from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';
import { weeds } from '@/data/weeds';
import type { Weed } from '@/types/game';

// ---- Weed Scout Report ---------------------------------------------------
// A farmer radios in a mystery weed sighting in one of their crop fields.
// The student is a Weed Scout who asks investigative questions to gather
// clues (location, quantity, growth stage, leaves, height, flowers, roots)
// and then identifies the invader from a lineup. No plant photo — students
// have to build a mental picture from the details, just like a real scout
// taking a report over the radio.
// --------------------------------------------------------------------------

type QuestionId =
  | 'location'
  | 'quantity'
  | 'stage'
  | 'leaves'
  | 'height'
  | 'flowers'
  | 'roots';

interface ScoutQuestion {
  id: QuestionId;
  label: string;
  Icon: typeof MapPin;
}

const QUESTIONS: ScoutQuestion[] = [
  { id: 'location', label: 'Where in the field is it?', Icon: MapPin },
  { id: 'quantity', label: 'How many plants are there?', Icon: Hash },
  { id: 'stage', label: 'What growth stage is it in?', Icon: Sprout },
  { id: 'leaves', label: 'What do the leaves look like?', Icon: Leaf },
  { id: 'height', label: 'How tall is it?', Icon: Ruler },
  { id: 'flowers', label: 'Any flowers or seed heads?', Icon: Flower2 },
  { id: 'roots', label: 'What are the roots or stems like?', Icon: HelpCircle },
];

const QUESTION_BUDGET = 4;
const ROUNDS_PER_LEVEL = 5;

const CROPS = ['soybean', 'corn', 'wheat', 'alfalfa'] as const;
const FIELD_SPOTS = [
  'the north edge of the field',
  'the low, wet spot near the ditch',
  'the fencerow along the road',
  'the middle of the crop rows',
  'right next to the driveway',
  'the south corner by the woods',
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
  stage: string;
  height: string;
  choices: Weed[];
  clues: Record<QuestionId, string>;
}

function buildRound(weed: Weed, allWeeds: Weed[]): Round {
  const crop = pick([...CROPS]);
  const spot = pick(FIELD_SPOTS);
  const quantity = pick([
    'just a small patch of about 5 plants',
    'a scattered handful — maybe 10 plants',
    'a big patch, more than 30 plants',
    'two or three plants popping up here and there',
  ]);
  const isPerennial = /perennial/i.test(weed.lifeCycle);
  const stage = pick(
    isPerennial
      ? [
          'coming back from last year — already leafy',
          'mature and spreading',
          'young shoots pushing up from old roots',
        ]
      : [
          'tiny seedlings, just a few leaves',
          'growing fast, knee-high already',
          'flowering and starting to make seeds',
        ]
  );

  const leafTrait =
    traitLike(weed, ['leaf', 'leaves', 'blade', 'lobed', 'hairy', 'smooth', 'midvein']) ||
    weed.traits[0];
  const heightTrait = traitLike(weed, ['tall', 'feet', 'inch', 'height', 'growth']);
  const height = heightTrait
    ? heightTrait
    : pick(['about as tall as your knee', 'up to your waist', 'short and low to the ground']);
  const flowerTrait =
    traitLike(weed, ['flower', 'seed', 'panicle', 'head', 'bloom', 'spike']) ||
    'small flowers with tiny seeds';
  const rootTrait =
    traitLike(weed, ['root', 'stem', 'stolon', 'rhizome', 'stalk', 'taproot']) ||
    `the plant is a ${weed.plantType === 'Monocot' ? 'grass-like' : 'broadleaf'} type`;

  const distractors = shuffle(allWeeds.filter(w => w.id !== weed.id)).slice(0, 3);
  const choices = shuffle([weed, ...distractors]);

  const clues: Record<QuestionId, string> = {
    location: `It's growing in ${spot} of a ${crop} field.`,
    quantity: `The farmer counted ${quantity}.`,
    stage: `Right now it's ${stage}.`,
    leaves: `The leaves: ${leafTrait.toLowerCase()}.`,
    height: `Height: ${height.toLowerCase()}.`,
    flowers: `Flowers/seeds: ${flowerTrait.toLowerCase()}.`,
    roots: `Stems or roots: ${rootTrait.toLowerCase()}.`,
  };

  return { weed, crop, spot, quantity, stage, height, choices, clues };
}

function buildRounds(): Round[] {
  const pool = shuffle(weeds).slice(0, ROUNDS_PER_LEVEL);
  return pool.map(w => buildRound(w, weeds));
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rounds = useMemo(() => buildRounds(), [level]);
  const round = rounds[step];

  const askedList = QUESTIONS.filter(q => asked.has(q.id));
  const remaining = QUESTION_BUDGET - asked.size;
  const readyToGuess = asked.size >= 2; // need at least a couple of clues

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
        title={score === rounds.length ? 'Master Weed Scout!' : 'Great scouting, Junior Detective!'}
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
        <div className="bg-card border-2 border-primary/40 rounded-lg p-4 mb-4 flex items-center gap-3">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground" aria-label="Back">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <Search className="w-7 h-7 text-primary" />
          <div className="flex-1">
            <h1 className="font-display font-bold text-xl text-foreground">Weed Scout Report</h1>
            <p className="text-sm text-muted-foreground">Ask smart questions to find the invader!</p>
          </div>
          <div className="text-base font-bold text-foreground bg-muted px-3 py-1 rounded-full">
            Case {step + 1} / {rounds.length}
          </div>
        </div>

        {/* Safety rule banner */}
        <div className="bg-warning/10 border-4 border-warning rounded-2xl p-4 mb-4 flex items-start gap-3 shadow-md">
          <div className="shrink-0 w-10 h-10 rounded-full bg-warning flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-warning-foreground" />
          </div>
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-warning-foreground mb-1">Scout's Safety Rule</p>
            <p className="text-base font-bold text-foreground leading-snug">
              A real scout never touches a mystery plant. Always ask a trusted adult before touching any weed.
            </p>
          </div>
        </div>

        {/* Radio call from farmer */}
        <div className="bg-primary/5 border-4 border-primary/40 rounded-2xl p-4 mb-4 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-5 h-5 text-primary" />
            <p className="text-xs font-extrabold uppercase tracking-wide text-primary">Farmer's Radio Call</p>
          </div>
          <p className="text-base font-bold text-foreground leading-snug">
            "Scout, come in! I've got a mystery weed showing up in my <span className="underline">{round.crop}</span> field.
            I'm not sure what it is — can you help me figure it out?"
          </p>
        </div>

        {/* Progress + budget */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex gap-1.5 flex-1">
            {rounds.map((_, i) => (
              <div key={i} className={`h-3 flex-1 rounded-full ${i < step ? 'bg-primary' : i === step ? 'bg-primary/60' : 'bg-muted'}`} />
            ))}
          </div>
          <div className="text-sm font-extrabold text-foreground bg-accent/20 border-2 border-accent px-3 py-1 rounded-full">
            Questions left: {Math.max(0, remaining)}
          </div>
        </div>

        {/* Question buttons */}
        {!guess && (
          <div className="bg-card border-4 border-primary/30 rounded-2xl p-4 mb-4 shadow-md">
            <h2 className="font-display font-extrabold text-lg text-foreground mb-1">Ask the farmer a question</h2>
            <p className="text-sm text-muted-foreground mb-3">
              You only have <strong>{QUESTION_BUDGET}</strong> questions. Choose the ones that will help you the most!
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUESTIONS.map(q => {
                const used = asked.has(q.id);
                const disabled = used || remaining <= 0;
                return (
                  <button
                    key={q.id}
                    onClick={() => ask(q.id)}
                    disabled={disabled}
                    className={`text-left rounded-xl border-2 p-3 flex items-center gap-3 transition-all ${
                      used
                        ? 'bg-muted border-muted text-muted-foreground'
                        : disabled
                          ? 'bg-muted/50 border-muted text-muted-foreground opacity-60'
                          : 'bg-card border-primary/40 hover:border-primary hover:bg-primary/5 text-foreground'
                    }`}
                  >
                    <q.Icon className="w-5 h-5 shrink-0 text-primary" />
                    <span className="font-bold text-base leading-snug">{q.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Scout notebook - clues gathered */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border-4 border-amber-500 rounded-2xl p-4 mb-4 shadow-md">
          <h2 className="font-display font-extrabold text-lg text-foreground mb-3">Scout Notebook</h2>
          {askedList.length === 0 ? (
            <p className="text-base text-muted-foreground italic">
              No notes yet. Ask a question above to gather your first clue!
            </p>
          ) : (
            <ul className="space-y-2">
              {askedList.map(q => (
                <li key={q.id} className="flex items-start gap-3 bg-card rounded-lg p-3 border-2 border-amber-300">
                  <q.Icon className="w-5 h-5 shrink-0 text-amber-700 dark:text-amber-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wide text-amber-700 dark:text-amber-400">{q.label}</p>
                    <p className="text-base font-bold text-foreground leading-snug">{round.clues[q.id]}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Guess lineup */}
        {readyToGuess && (
          <div className="bg-card border-4 border-primary/30 rounded-2xl p-4 mb-4 shadow-md">
            <h2 className="font-display font-extrabold text-lg text-foreground mb-1">
              {guess ? 'Your guess' : 'Ready? Name the invader!'}
            </h2>
            <p className="text-sm text-muted-foreground mb-3">
              {guess ? 'See how you did below.' : 'Pick the weed that best matches your notes.'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                    className={`text-left rounded-xl border-4 p-3 flex items-center justify-between gap-3 transition-all ${state}`}
                  >
                    <span className="font-extrabold text-base leading-snug">{c.commonName}</span>
                    {guess && isAnswer && <Check className="w-5 h-5 text-success shrink-0" />}
                    {guess && chosen && !isAnswer && <X className="w-5 h-5 text-destructive shrink-0" />}
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
                ? <><Check className="w-7 h-7 text-success" /> Case solved!</>
                : <><AlertTriangle className="w-7 h-7 text-warning" /> Not quite — the answer was {round.weed.commonName}.</>
              }
            </div>
            <p className="text-base text-foreground leading-snug mb-3">
              <strong>Scout tip:</strong> {round.weed.memoryHook}
            </p>
            <div className={`rounded-xl p-4 border-2 ${isToxic ? 'bg-destructive/10 border-destructive' : 'bg-success/10 border-success'}`}>
              <div className="flex items-center gap-2 mb-1">
                {isToxic
                  ? <><AlertTriangle className="w-5 h-5 text-destructive" /><span className="font-extrabold text-destructive">Do not touch!</span></>
                  : <><ShieldCheck className="w-5 h-5 text-success" /><span className="font-extrabold text-success">Safe to observe from a distance</span></>
                }
              </div>
              <p className="text-sm text-foreground leading-snug">
                {isToxic
                  ? `${round.weed.commonName} can be harmful. Always tell a trusted adult and never touch it unless they say it is safe.`
                  : `${round.weed.commonName} is usually safe to look at from a distance, but always ask a trusted adult before touching any plant.`
                }
              </p>
            </div>
            <button
              onClick={next}
              className="mt-4 w-full py-4 rounded-xl bg-primary text-primary-foreground font-extrabold text-lg hover:opacity-90"
            >
              {step + 1 >= rounds.length ? 'Finish the Shift!' : 'Next Case →'}
            </button>
          </div>
        )}

        <div className="mt-5 text-center text-base text-muted-foreground">
          Cases solved: <span className="font-extrabold text-foreground">{score}</span> / {step + (guess ? 1 : 0)}
        </div>

        <FarmerGuide
          message="A good scout doesn't need to see the plant right away — they ask smart questions first. Location, quantity, stage, and leaf shape can crack the case!"
          gradeLabel={gradeLabel}
          tone="intro"
          className="mt-5"
        />
      </div>
    </div>
  );
}

// legacy exports kept minimal — no interfaces/constants below.

// ---- Journalist-style observation game -----------------------------------
// The student is a "Weed Journalist." They see ONE plant and check off the
// observations that are true about it from a notebook of possibilities.
// Observations are pulled directly from each weed's real traits list.
// --------------------------------------------------------------------------

interface Observation {
  text: string;
  correct: boolean;
}

interface Round {
  weed: Weed;
  observations: Observation[];
}

const ROUNDS_PER_LEVEL = 6;
const TRUE_PER_ROUND = 2;
const FALSE_PER_ROUND = 2;

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function simplify(trait: string): string {
  // Trim clinical fragments; keep it kid-friendly.
  return trait.replace(/\s+up to.*$/i, '').trim();
}

function buildRound(weed: Weed): Round {
  const trueTraits = shuffle(weed.traits).slice(0, TRUE_PER_ROUND).map(simplify);

  const ownSet = new Set(weed.traits.map(t => t.toLowerCase()));
  const distractorPool = shuffle(
    weeds
      .filter(w => w.id !== weed.id)
      .flatMap(w => w.traits)
      .filter(t => !ownSet.has(t.toLowerCase()))
  );
  const falseTraits = distractorPool.slice(0, FALSE_PER_ROUND).map(simplify);

  const observations: Observation[] = shuffle([
    ...trueTraits.map(text => ({ text, correct: true })),
    ...falseTraits.map(text => ({ text, correct: false })),
  ]);

  return { weed, observations };
}

function buildRounds(): Round[] {
  return shuffle(weeds).slice(0, ROUNDS_PER_LEVEL).map(buildRound);
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
  const [picks, setPicks] = useState<Set<number>>(new Set());
  const [submitted, setSubmitted] = useState(false);
  const [done, setDone] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rounds = useMemo(() => buildRounds(), [level]);
  const round = rounds[step];

  const toggle = (idx: number) => {
    if (submitted) return;
    setPicks(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const submit = () => {
    if (submitted) return;
    // Round correct only when EVERY observation is categorized correctly:
    // every true one checked, every false one left unchecked.
    const allCorrect = round.observations.every((obs, i) =>
      obs.correct ? picks.has(i) : !picks.has(i)
    );
    if (allCorrect) setScore(s => s + 1);
    setSubmitted(true);
  };

  const next = () => {
    if (step + 1 >= rounds.length) {
      setDone(true);
    } else {
      setStep(s => s + 1);
      setPicks(new Set());
      setSubmitted(false);
    }
  };

  const restart = () => {
    setStep(0);
    setScore(0);
    setPicks(new Set());
    setSubmitted(false);
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
        title={score === rounds.length ? 'Front-Page Reporter!' : 'Great field notes, Junior Journalist!'}
        gameId={gameId}
        gameName={gameName}
        gradeLabel={gradeLabel}
      />
    );
  }

  const isToxic = !!round.weed.safetyNote;
  const trueCount = round.observations.filter(o => o.correct).length;

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-card border-2 border-primary/40 rounded-lg p-4 mb-4 flex items-center gap-3">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground" aria-label="Back">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <Newspaper className="w-7 h-7 text-primary" />
          <div className="flex-1">
            <h1 className="font-display font-bold text-xl text-foreground">Weed Journalist</h1>
            <p className="text-sm text-muted-foreground">Report only what you can really see!</p>
          </div>
          <div className="text-base font-bold text-foreground bg-muted px-3 py-1 rounded-full">
            Story {step + 1} / {rounds.length}
          </div>
        </div>

        {/* Safety rule banner */}
        <div className="bg-warning/10 border-4 border-warning rounded-2xl p-4 mb-4 flex items-start gap-3 shadow-md">
          <div className="shrink-0 w-10 h-10 rounded-full bg-warning flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-warning-foreground" />
          </div>
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-warning-foreground mb-1">Reporter's Safety Rule</p>
            <p className="text-base font-bold text-foreground leading-snug">
              Observe with your eyes from a safe distance. Never touch a weed unless a trusted adult tells you it is safe.
            </p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 mb-4">
          {rounds.map((_, i) => (
            <div key={i} className={`h-3 flex-1 rounded-full ${i < step ? 'bg-primary' : i === step ? 'bg-primary/60' : 'bg-muted'}`} />
          ))}
        </div>

        {/* Plant photo */}
        <div className="bg-card border-4 border-primary/30 rounded-2xl overflow-hidden mb-5 shadow-md">
          <div className="aspect-[4/3] sm:aspect-[16/9] bg-muted">
            <WeedImage weedId={round.weed.id} stage="flower" className="w-full h-full" />
          </div>
          <div className="px-4 py-3 bg-primary/5">
            <p className="text-xs font-extrabold uppercase tracking-wide text-primary">Today's assignment</p>
            <p className="text-xl font-display font-extrabold text-foreground">{round.weed.commonName}</p>
          </div>
        </div>

        {/* Notebook of observations */}
        <div className="bg-amber-50 dark:bg-amber-950/30 border-4 border-amber-500 rounded-2xl p-4 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <Notebook className="w-6 h-6 text-amber-700 dark:text-amber-400" />
            <h2 className="font-display font-extrabold text-lg text-foreground">Field Notes</h2>
          </div>
          <p className="text-base font-bold text-foreground mb-3">
            Check off every observation that is <span className="underline">really true</span> for this plant.
          </p>
          <div className="grid grid-cols-1 gap-3">
            {round.observations.map((obs, idx) => {
              const isChecked = picks.has(idx);
              let state = '';
              if (!submitted) {
                state = isChecked
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary';
              } else if (obs.correct && isChecked) {
                state = 'border-success bg-success/10 ring-2 ring-success/40';
              } else if (obs.correct && !isChecked) {
                state = 'border-warning bg-warning/10 ring-2 ring-warning/40';
              } else if (!obs.correct && isChecked) {
                state = 'border-destructive bg-destructive/10 ring-2 ring-destructive/40';
              } else {
                state = 'border-border bg-card opacity-60';
              }

              return (
                <button
                  key={idx}
                  onClick={() => toggle(idx)}
                  disabled={submitted}
                  className={`text-left rounded-xl border-4 p-3 transition-all flex items-start gap-3 ${state}`}
                >
                  <div className={`shrink-0 mt-0.5 w-7 h-7 rounded-md border-2 flex items-center justify-center
                    ${submitted
                      ? (obs.correct
                          ? 'bg-success border-success text-success-foreground'
                          : (isChecked ? 'bg-destructive border-destructive text-destructive-foreground' : 'border-border text-transparent'))
                      : (isChecked ? 'bg-primary border-primary text-primary-foreground' : 'border-primary/50 text-transparent')
                    }`}>
                    {submitted && !obs.correct && isChecked ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  </div>
                  <p className="text-base font-bold text-foreground leading-snug">{obs.text}</p>
                </button>
              );
            })}
          </div>

          {!submitted && (
            <button
              onClick={submit}
              className="mt-4 w-full py-4 rounded-xl bg-primary text-primary-foreground font-extrabold text-lg flex items-center justify-center gap-2 hover:opacity-90"
            >
              <Send className="w-5 h-5" /> Submit My Report
            </button>
          )}
        </div>

        {/* Feedback */}
        {submitted && (() => {
          const trueChecked = round.observations.filter((o, i) => o.correct && picks.has(i)).length;
          const falseChecked = round.observations.filter((o, i) => !o.correct && picks.has(i)).length;
          const perfect = trueChecked === trueCount && falseChecked === 0;
          return (
            <div className={`mt-5 rounded-2xl p-5 border-4 animate-scale-in
              ${perfect ? 'bg-success/10 border-success' : 'bg-warning/10 border-warning'}`}>
              <div className="text-2xl font-extrabold text-foreground mb-2 flex items-center gap-2">
                {perfect
                  ? <><Check className="w-7 h-7 text-success" /> Great reporting!</>
                  : <><AlertTriangle className="w-7 h-7 text-warning" /> Almost — check your notes!</>
                }
              </div>
              <p className="text-base text-foreground leading-snug mb-3">
                You found <strong>{trueChecked}</strong> of <strong>{trueCount}</strong> real observations
                {falseChecked > 0 && <> and picked <strong>{falseChecked}</strong> that were not true</>}.
                <span className="text-success"> Green</span> = real observation you found.
                <span className="text-warning"> Yellow</span> = real observation you missed.
                <span className="text-destructive"> Red</span> = not true for this plant.
              </p>
              <div className={`rounded-xl p-4 border-2 ${isToxic ? 'bg-destructive/10 border-destructive' : 'bg-success/10 border-success'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {isToxic
                    ? <><AlertTriangle className="w-5 h-5 text-destructive" /><span className="font-extrabold text-destructive">Do not touch!</span></>
                    : <><ShieldCheck className="w-5 h-5 text-success" /><span className="font-extrabold text-success">Safe to observe from a distance</span></>
                  }
                </div>
                <p className="text-sm text-foreground leading-snug">
                  {isToxic
                    ? `${round.weed.commonName} can be harmful. Always tell a trusted adult and never touch it unless they say it is safe.`
                    : `${round.weed.commonName} is usually safe to look at from a distance, but always ask a trusted adult before touching any plant.`
                  }
                </p>
              </div>
              <button
                onClick={next}
                className="mt-4 w-full py-4 rounded-xl bg-primary text-primary-foreground font-extrabold text-lg hover:opacity-90"
              >
                {step + 1 >= rounds.length ? 'Publish the Paper!' : 'Next Assignment →'}
              </button>
            </div>
          );
        })()}

        <div className="mt-5 text-center text-base text-muted-foreground">
          Stories published: <span className="font-extrabold text-foreground">{score}</span> / {step + (submitted ? 1 : 0)}
        </div>

        <FarmerGuide
          message="A great journalist reports only what they can really see. Check off each observation that is true, and leave the rest blank."
          gradeLabel={gradeLabel}
          tone="intro"
          className="mt-5"
        />
      </div>
    </div>
  );
}
