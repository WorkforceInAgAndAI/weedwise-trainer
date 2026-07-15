import { useMemo, useState } from 'react';
import { ArrowLeft, Eye, Wind, AlertTriangle, ShieldCheck, Check, X } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';
import WeedImage from '@/components/game/WeedImage';
import { weeds } from '@/data/weeds';
import type { Weed } from '@/types/game';

interface Clue {
  sense: 'look' | 'smell' | 'caution';
  text: string;
}

// Kid-friendly, sense-based clues for weeds that need special safety awareness.
// Students use their eyes (and sometimes nose) from a safe distance.
const SENSE_CLUES: Record<string, Clue> = {
  Foxtail_barley: {
    sense: 'look',
    text: 'Look for a fuzzy seed head shaped like a fox tail with sharp, bristly awns that can poke skin.',
  },
  Horsenettle: {
    sense: 'caution',
    text: 'Look for a plant with sharp spines on the stems and small yellow berries.',
  },
  Buffalobur: {
    sense: 'caution',
    text: 'Look for a spiny plant with small yellow flowers and prickly seed burrs.',
  },
  Smooth_Groundcherry: {
    sense: 'look',
    text: 'Look for papery, lantern-shaped husks around green berries.',
  },
  Tall_morningglory: {
    sense: 'look',
    text: 'Look for twining vines with large, trumpet-shaped flowers.',
  },
  Horseweed: {
    sense: 'look',
    text: 'Look for a tall, hairy stem topped with a cluster of tiny white flowers.',
  },
  Jimsonweed: {
    sense: 'caution',
    text: 'Look for large, trumpet-shaped flowers and spiny, thorny seed pods.',
  },
  Eastern_black_nightshade: {
    sense: 'look',
    text: 'Look for small white star-shaped flowers and dark berries.',
  },
  'palmer-amaranth': {
    sense: 'look',
    text: 'Look for a tall weed with a long, thick flower spike and smooth stems.',
  },
  Catchweed_bedstraw: {
    sense: 'look',
    text: 'Look for a sticky, hairy vine that clings to clothes like Velcro.',
  },
  Henbit_deadnettle: {
    sense: 'look',
    text: 'Look for square stems and purple-pink flowers in early spring.',
  },
  Hemp_dogbane: {
    sense: 'caution',
    text: 'Look for reddish stems, opposite leaves, and small white flowers.',
  },
  common_Milkweed: {
    sense: 'caution',
    text: 'Look for thick pods that split open to release silky seeds; the sap is milky.',
  },
  'Honey-vine_climbing_milkweed': {
    sense: 'caution',
    text: 'Look for a climbing vine with heart-shaped leaves and small white flowers.',
  },
  Star_of_Bethlehem: {
    sense: 'caution',
    text: 'Look for grass-like leaves and star-shaped white flowers.',
  },
  Field_Horsetail: {
    sense: 'look',
    text: 'Look for a plant with jointed, hollow stems and a cone-like tip.',
  },
  Scouringrush: {
    sense: 'look',
    text: 'Look for a rough, jointed stem with no leaves and a dark cone tip.',
  },
  commonPokeweed: {
    sense: 'caution',
    text: 'Look for a tall plant with clusters of dark purple berries and reddish stems.',
  },
  Wild_Carrot: {
    sense: 'look',
    text: 'Look for a lacy white flower shaped like a flat umbrella and hairy stems.',
  },
  Spotted_spurge: {
    sense: 'caution',
    text: 'Look for a low plant with tiny spotted leaves and a milky sap.',
  },
  Toothed_spurge: {
    sense: 'caution',
    text: 'Look for a low plant with toothed leaves and a milky, irritating sap.',
  },
  kochia: {
    sense: 'look',
    text: 'Look for a bushy plant that turns red-purple and looks like a tumbleweed.',
  },
  'poison-hemlock': {
    sense: 'smell',
    text: 'Look for smooth stems with purple spots and a musty, mouse-like smell.',
  },
  'wild-parsnip': {
    sense: 'caution',
    text: 'Look for flat-topped yellow flower clusters and a tall, grooved stem.',
  },
  Marijuana: {
    sense: 'smell',
    text: 'Look for finger-like leaves and a strong, skunky smell.',
  },
};

function getClue(weed: Weed): Clue {
  if (SENSE_CLUES[weed.id]) return SENSE_CLUES[weed.id];
  // Safe weeds: build a "look" clue from the first trait, or a generic one.
  const trait = weed.traits[0] || `a ${weed.plantType.toLowerCase()} plant`;
  return {
    sense: 'look',
    text: `Look closely: ${trait}.`,
  };
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const ROUNDS_PER_LEVEL = 8;
const CHOICES_PER_ROUND = 3;

interface Observation {
  text: string;
  correct: boolean;
}

interface Round {
  weed: Weed;
  clue: Clue;
  observations: Observation[];
}

function buildRounds(): Round[] {
  const questionOrder = shuffle(weeds).slice(0, ROUNDS_PER_LEVEL);
  return questionOrder.map(weed => {
    const clue = getClue(weed);
    // Pull distractor observations from other weeds' clues.
    const distractorPool = shuffle(
      weeds
        .filter(w => w.id !== weed.id)
        .map(w => getClue(w).text)
        .filter(t => t !== clue.text)
    ).slice(0, CHOICES_PER_ROUND - 1);

    const observations: Observation[] = shuffle([
      { text: clue.text, correct: true },
      ...distractorPool.map(text => ({ text, correct: false })),
    ]);
    return { weed, clue, observations };
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
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  // Rebuild rounds each level so students get a fresh set of sense clues.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const rounds = useMemo(() => buildRounds(), [level]);
  const round = rounds[step];
  const answered = picked !== null;
  const isCorrect = answered && round.observations[picked!]?.correct === true;

  const choose = (idx: number) => {
    if (answered) return;
    setPicked(idx);
    if (round.observations[idx].correct) setScore(s => s + 1);
  };

  const next = () => {
    if (step + 1 >= rounds.length) {
      setDone(true);
    } else {
      setStep(s => s + 1);
      setPicked(null);
    }
  };

  const restart = () => {
    setStep(0);
    setScore(0);
    setPicked(null);
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
        title={score === rounds.length ? 'Super Safety Spotter!' : 'Nice observing, Safety Scout!'}
        gameId={gameId}
        gameName={gameName}
        gradeLabel={gradeLabel}
      />
    );
  }

  const SenseIcon = round.clue.sense === 'smell' ? Wind : round.clue.sense === 'caution' ? AlertTriangle : Eye;
  const isToxic = !!round.weed.safetyNote;

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="bg-card border-2 border-primary/40 rounded-lg p-4 mb-4 flex items-center gap-3">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground" aria-label="Back">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <Eye className="w-7 h-7 text-primary" />
          <div className="flex-1">
            <h1 className="font-display font-bold text-xl text-foreground">Sense Detective</h1>
            <p className="text-sm text-muted-foreground">Use your senses from a safe distance!</p>
          </div>
          <div className="text-base font-bold text-foreground bg-muted px-3 py-1 rounded-full">
            {step + 1} / {rounds.length}
          </div>
        </div>

        {/* Safety rule banner */}
        <div className="bg-warning/10 border-4 border-warning rounded-2xl p-4 mb-4 flex items-start gap-3 shadow-md">
          <div className="shrink-0 w-10 h-10 rounded-full bg-warning flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-warning-foreground" />
          </div>
          <div>
            <p className="text-sm font-extrabold uppercase tracking-wide text-warning-foreground mb-1">Safety Rule</p>
            <p className="text-base font-bold text-foreground leading-snug">
              Look with your eyes and smell with your nose from far away. Never touch a weed unless a trusted adult tells you it is safe.
            </p>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 mb-4">
          {rounds.map((_, i) => (
            <div key={i} className={`h-3 flex-1 rounded-full ${i < step ? 'bg-primary' : i === step ? 'bg-primary/60' : 'bg-muted'}`} />
          ))}
        </div>

        {/* Big plant photo */}
        <div className="bg-card border-4 border-primary/30 rounded-2xl overflow-hidden mb-5 shadow-md">
          <div className="aspect-[4/3] sm:aspect-[16/9] bg-muted">
            <WeedImage weedId={round.weed.id} stage="flower" className="w-full h-full" />
          </div>
          <div className="px-4 py-3 flex items-center gap-3 bg-primary/5">
            <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
              <SenseIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-primary">
                Look closely at this plant
              </p>
              <p className="text-sm text-muted-foreground">Use your eyes from a safe distance.</p>
            </div>
          </div>
        </div>

        {/* Observation choices */}
        <div className="text-center text-lg font-bold text-foreground mb-3">
          Which observation matches this plant?
        </div>
        <div className="grid grid-cols-1 gap-3">
          {round.observations.map((obs, idx) => {
            const isPick = picked === idx;
            const state = !answered
              ? 'border-border hover:border-primary hover:bg-primary/5'
              : obs.correct
                ? 'border-success bg-success/10 ring-2 ring-success/40'
                : isPick
                  ? 'border-destructive bg-destructive/10 ring-2 ring-destructive/40'
                  : 'border-border opacity-60';
            return (
              <button
                key={idx}
                onClick={() => choose(idx)}
                disabled={answered}
                className={`text-left rounded-2xl border-4 p-4 transition-all bg-card shadow-sm flex items-start gap-3 ${state}`}
              >
                <div className={`shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2
                  ${answered && obs.correct ? 'bg-success border-success text-success-foreground' :
                    answered && isPick      ? 'bg-destructive border-destructive text-destructive-foreground' :
                                              'border-primary/40 text-primary'}`}>
                  {answered && obs.correct ? <Check className="w-4 h-4" /> :
                   answered && isPick      ? <X className="w-4 h-4" /> :
                                             <span className="text-sm font-extrabold">{String.fromCharCode(65 + idx)}</span>}
                </div>
                <p className="text-base sm:text-lg font-bold text-foreground leading-snug">
                  {obs.text}
                </p>
              </button>
            );
          })}
        </div>

        {/* Feedback + next button */}
        {answered && (
          <div className={`mt-5 rounded-2xl p-5 border-4 animate-scale-in
            ${isCorrect ? 'bg-success/10 border-success' : 'bg-warning/10 border-warning'}`}>
            <div className="text-2xl font-extrabold text-foreground mb-2 flex items-center gap-2">
              {isCorrect
                ? <><Check className="w-7 h-7 text-success" /> Great spotting!</>
                : <><X className="w-7 h-7 text-destructive" /> Keep looking!</>
              }
            </div>
            <p className="text-base text-foreground leading-snug mb-3">
              {isCorrect
                ? <>Nice observing! This is <strong>{round.weed.commonName}</strong>. {round.clue.text}</>
                : <>This plant is <strong>{round.weed.commonName}</strong>. The matching observation was: <em>{round.clue.text}</em></>
              }
            </p>
            <div className={`rounded-xl p-4 border-2 ${isToxic ? 'bg-destructive/10 border-destructive' : 'bg-success/10 border-success'}`}>
              <div className="flex items-center gap-2 mb-1">
                {isToxic
                  ? <><AlertTriangle className="w-5 h-5 text-destructive" /><span className="font-extrabold text-destructive">Do not touch!</span></>
                  : <><ShieldCheck className="w-5 h-5 text-success" /><span className="font-extrabold text-success">Looks safe to observe</span></>
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
              {step + 1 >= rounds.length ? 'Finish the Mission!' : 'Next Plant →'}
            </button>
          </div>
        )}

        <div className="mt-5 text-center text-base text-muted-foreground">
          Plants observed: <span className="font-extrabold text-foreground">{score}</span> / {step + (answered ? 1 : 0)}
        </div>

        <FarmerGuide
          message="Use your eyes and nose like a nature detective. Stay back, never touch, and ask a trusted adult if you are not sure about a plant."
          gradeLabel={gradeLabel}
          tone="intro"
          className="mt-5"
        />
      </div>
    </div>
  );
}
