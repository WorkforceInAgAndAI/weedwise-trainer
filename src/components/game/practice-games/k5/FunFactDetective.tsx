import { useMemo, useState } from 'react';
import { ArrowLeft, Search, Check, X, Lightbulb } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';
import WeedImage from '@/components/game/WeedImage';

// The 14 weeds featured in the K-5 "14 Weeds You Can Spot!" learning module.
// Each entry mirrors the module's name, spot-it hint, and fun fact so students
// see the same clues they just learned.
interface WeedEntry {
  id: string;
  name: string;
  hint: string;      // Kid-friendly "spot it" hint (short + simple)
  funFact: string;   // Fun fact from the module (shortened where possible)
}

const ALL_WEEDS: WeedEntry[] = [
  { id: 'Dandelion',              name: 'Dandelion',              hint: 'Yellow flower that turns into a fluffy white puffball.', funFact: 'Blow on it and the tiny parachute seeds fly far, far away!' },
  { id: 'giant-foxtail',          name: 'Giant Foxtail',          hint: 'A fuzzy seed head shaped like a fox\u2019s bushy tail.', funFact: 'Rub a leaf and you can feel soft, fuzzy hairs!' },
  { id: 'lambsquarters',          name: 'Common Lambsquarters',   hint: 'Green leaves that look sprinkled with white flour.',    funFact: 'The "flour" is really a waxy powder \u2014 it wipes right off!' },
  { id: 'common_Milkweed',        name: 'Common Milkweed',        hint: 'Broad leaves with milky white sap inside.',              funFact: 'Monarch butterflies NEED this plant to grow up!' },
  { id: 'Wild_Carrot',            name: 'Wild Carrot',            hint: 'Tiny white flowers in a flat, lacy umbrella shape.',    funFact: 'People call it "Queen Anne\u2019s Lace" because it looks like lace!' },
  { id: 'canada-thistle',         name: 'Canada Thistle',         hint: 'Prickly, spiny leaves and small purple flower puffs.',   funFact: 'Its roots stretch underground like secret tunnels!' },
  { id: 'giant-ragweed',          name: 'Giant Ragweed',          hint: 'HUGE leaves shaped like giant 3-fingered hands.',        funFact: 'It can grow taller than YOU \u2014 sometimes 10 feet tall!' },
  { id: 'pennsylvania-smartweed', name: 'Pennsylvania Smartweed', hint: 'Pink flower spikes and leaves with a dark thumbprint mark.', funFact: 'That thumbprint is like a secret detective clue!' },
  { id: 'kochia',                 name: 'Kochia',                 hint: 'A bushy feathery plant that turns red in the fall.',    funFact: 'It snaps off and rolls like a tumbleweed for miles!' },
  { id: 'wild-parsnip',           name: 'Wild Parsnip',           hint: 'Tall plant with flat clusters of tiny yellow flowers.', funFact: 'DO NOT TOUCH! Its sap plus sunlight can burn your skin.' },
  { id: 'yellow-nutsedge',        name: 'Yellow Nutsedge',        hint: 'Shiny yellow-green grass with a triangle-shaped stem.', funFact: '"Sedges have edges" \u2014 you can feel 3 sides on the stem!' },
  { id: 'velvetleaf',             name: 'Velvetleaf',             hint: 'Big heart-shaped leaves that feel soft and fuzzy.',      funFact: 'The leaves feel just like velvet \u2014 super soft!' },
  { id: 'Field_bindweed',         name: 'Morningglory',           hint: 'Twisty vines with trumpet-shaped pink or purple flowers.', funFact: 'Its flowers open in the morning and shut when it gets hot!' },
  { id: 'Venice_mallow',          name: 'Venice Mallow',          hint: 'White flower with a dark purple bullseye in the middle.', funFact: 'Each flower only stays open for a few hours \u2014 then closes forever!' },
];

// Kids answer one clue at a time from a big grid of 3 photos (1 correct + 2 distractors).
const CHOICES_PER_ROUND = 3;
const ROUNDS_PER_LEVEL = 8;

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

interface Round {
  answer: WeedEntry;
  choices: WeedEntry[]; // includes the answer, shuffled
}

function buildRounds(): Round[] {
  const questionOrder = shuffle(ALL_WEEDS).slice(0, ROUNDS_PER_LEVEL);
  return questionOrder.map(answer => {
    const distractors = shuffle(ALL_WEEDS.filter(w => w.id !== answer.id)).slice(0, CHOICES_PER_ROUND - 1);
    return { answer, choices: shuffle([answer, ...distractors]) };
  });
}

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function FunFactDetective({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Rebuild the round set each level so kids see fresh cases.
  const rounds = useMemo(() => buildRounds(), [level]);
  const round = rounds[step];
  const answered = picked !== null;
  const isCorrect = answered && picked === round.answer.id;

  const choose = (id: string) => {
    if (answered) return;
    setPicked(id);
    if (id === round.answer.id) setScore(s => s + 1);
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
    const total = rounds.length;
    return (
      <LevelComplete
        level={level}
        score={score}
        total={total}
        onNextLevel={nextLevel}
        onStartOver={restart}
        onBack={onBack}
        title={score === total ? 'Top Weed Detective! Every clue solved!' : 'Great sleuthing, Detective!'}
        gameId={gameId}
        gameName={gameName}
        gradeLabel={gradeLabel}
      />
    );
  }

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
            <h1 className="font-display font-bold text-xl text-foreground">Fun Fact Detective</h1>
            <p className="text-sm text-muted-foreground">Read the clue, then tap the weed picture that matches!</p>
          </div>
          <div className="text-base font-bold text-foreground bg-muted px-3 py-1 rounded-full">
            {step + 1} / {rounds.length}
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1.5 mb-4">
          {rounds.map((_, i) => (
            <div key={i} className={`h-3 flex-1 rounded-full ${i < step ? 'bg-primary' : i === step ? 'bg-primary/60' : 'bg-muted'}`} />
          ))}
        </div>

        {/* One BIG clue card at the top */}
        <div className="bg-yellow-50 border-4 border-yellow-400 rounded-2xl p-5 mb-5 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center shadow">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div className="text-sm font-extrabold uppercase tracking-wide text-yellow-900">Detective Clue</div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-foreground leading-snug mb-3">
            {round.answer.funFact}
          </p>
          <div className="bg-white/70 rounded-lg p-3 border-2 border-yellow-300">
            <div className="text-[11px] font-extrabold uppercase tracking-wide text-yellow-800 mb-1">Extra hint</div>
            <p className="text-lg text-foreground leading-snug">{round.answer.hint}</p>
          </div>
        </div>

        {/* Big photo choices */}
        <div className="text-center text-base font-bold text-foreground mb-3">
          Which weed is it? Tap a picture!
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {round.choices.map(w => {
            const isPick = picked === w.id;
            const isAnswer = w.id === round.answer.id;
            const state = !answered
              ? 'border-border hover:border-primary hover:scale-[1.02]'
              : isAnswer
                ? 'border-emerald-500 ring-4 ring-emerald-300'
                : isPick
                  ? 'border-red-500 ring-4 ring-red-300'
                  : 'border-border opacity-50';
            return (
              <button
                key={w.id}
                onClick={() => choose(w.id)}
                disabled={answered}
                className={`relative rounded-2xl overflow-hidden border-4 transition-all bg-card shadow-md ${state}`}
                aria-label={`Choose ${w.name}`}
              >
                <div className="aspect-square">
                  <WeedImage weedId={w.id} stage="flower" className="w-full h-full" />
                </div>
                <div className={`py-3 px-2 text-center font-display font-extrabold text-lg
                  ${answered && isAnswer ? 'bg-emerald-500 text-white' :
                    answered && isPick    ? 'bg-red-500 text-white' :
                                            'bg-card text-foreground'}`}>
                  {answered ? w.name : '?'}
                </div>
                {answered && isAnswer && (
                  <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-1.5 shadow">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                )}
                {answered && isPick && !isAnswer && (
                  <div className="absolute top-2 right-2 bg-red-500 rounded-full p-1.5 shadow">
                    <X className="w-6 h-6 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback + next button */}
        {answered && (
          <div className={`mt-5 rounded-2xl p-5 border-4 animate-scale-in
            ${isCorrect ? 'bg-emerald-50 border-emerald-400' : 'bg-amber-50 border-amber-400'}`}>
            <div className="text-2xl font-extrabold text-foreground mb-2 flex items-center gap-2">
              {isCorrect
                ? <><Check className="w-7 h-7 text-emerald-600" /> Case solved!</>
                : <><X className="w-7 h-7 text-red-600" /> Not quite!</>
              }
            </div>
            <p className="text-base text-foreground leading-snug">
              {isCorrect
                ? <>Nice detective work! That was <strong>{round.answer.name}</strong>.</>
                : <>The answer was <strong>{round.answer.name}</strong>. Look for: {round.answer.hint}</>
              }
            </p>
            <button
              onClick={next}
              className="mt-4 w-full py-4 rounded-xl bg-primary text-primary-foreground font-extrabold text-lg hover:opacity-90"
            >
              {step + 1 >= rounds.length ? 'Finish the Case!' : 'Next Clue →'}
            </button>
          </div>
        )}

        <div className="mt-5 text-center text-base text-muted-foreground">
          Cases solved: <span className="font-extrabold text-foreground">{score}</span> / {step + (answered ? 1 : 0)}
        </div>
      </div>

      <FarmerGuide
        message="Read the fun-fact clue like a detective, then tap the picture you think matches. If you get it wrong, look at the extra hint next time!"
        gradeLabel={gradeLabel}
      />
    </div>
  );
}