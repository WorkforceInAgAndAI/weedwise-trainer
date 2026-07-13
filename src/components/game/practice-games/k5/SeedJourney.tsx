import { useState } from 'react';
import { Wind, Droplets, PawPrint, Sprout, ArrowLeft, MapPin, Check, X } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';

type Method = 'wind' | 'water' | 'animal';

interface Choice {
  method: Method;
  label: string;
}

interface Scenario {
  place: string;
  story: string;
  best: Method;
  choices: [Choice, Choice];
  successText: string;
  failText: string;
}

// Six kid-friendly scenarios. In each one, TWO of the three dispersal methods
// are offered, and one is clearly the better fit for the setting.
const SCENARIOS: Scenario[] = [
  {
    place: 'On top of a tall dandelion in a windy meadow',
    story: 'The wind is blowing hard across an open field. A fluffy puffball is ready to launch. How will you travel to new soil?',
    best: 'wind',
    choices: [
      { method: 'wind', label: 'Open my parachute and float on the breeze' },
      { method: 'water', label: 'Wait for a puddle to carry me away' },
    ],
    successText: 'Your fluffy pappus catches the wind and carries you far across the meadow!',
    failText: 'There is no water here — you get stuck in the dry grass.',
  },
  {
    place: 'Beside a bubbling creek in the forest',
    story: 'A little stream flows past your plant. Your seed has a hard, waterproof coat. What is your best ride?',
    best: 'water',
    choices: [
      { method: 'water', label: 'Drop into the creek and float downstream' },
      { method: 'wind', label: 'Try to catch the wind under the tall trees' },
    ],
    successText: 'You float down the creek and land on a fresh sandy bank — perfect for growing!',
    failText: 'The trees block the wind. You barely move an inch.',
  },
  {
    place: 'On a bur clinging to a bushy plant on a deer trail',
    story: 'You are a spiky little bur. A deer is walking straight toward you! How do you travel?',
    best: 'animal',
    choices: [
      { method: 'animal', label: 'Hook onto the deer\u2019s fur for a ride' },
      { method: 'wind', label: 'Wait for a gust of wind to lift me' },
    ],
    successText: 'Your hooks grab the deer\u2019s fur — you ride miles to a brand-new forest!',
    failText: 'You are too heavy and spiky to float on the wind. You fall right back down.',
  },
  {
    place: 'Floating near the edge of a pond',
    story: 'A duck is swimming by. Your seed is smooth and light. What will you do?',
    best: 'water',
    choices: [
      { method: 'water', label: 'Float on the pond and let the current carry me' },
      { method: 'animal', label: 'Try to stick to the duck\u2019s smooth feathers' },
    ],
    successText: 'You bob along the water to a muddy shore — a great new home!',
    failText: 'The duck\u2019s feathers are too slippery. You slide right off.',
  },
  {
    place: 'On a tiny milkweed plant on a windy hill',
    story: 'A strong breeze blows across the hill. Your seed has silky white hairs. What is your best move?',
    best: 'wind',
    choices: [
      { method: 'wind', label: 'Spread my silky hairs and glide on the wind' },
      { method: 'animal', label: 'Hope a raccoon walks by and picks me up' },
    ],
    successText: 'Your silky hairs catch the wind and you soar high above the hill!',
    failText: 'No raccoons here today. You sit and wait\u2026 and wait.',
  },
  {
    place: 'Stuck to a berry a bird is about to eat',
    story: 'A hungry robin lands on your plant! Your seed is inside a bright red berry. What happens next?',
    best: 'animal',
    choices: [
      { method: 'animal', label: 'Let the bird eat me and carry me in its belly' },
      { method: 'water', label: 'Roll off the branch and hope to find a puddle' },
    ],
    successText: 'The bird flies far away and drops you (in its poop!) into fresh soil — free fertilizer included!',
    failText: 'There is no water on this branch. You fall and get stepped on.',
  },
];

const METHOD_META: Record<Method, { Icon: React.ComponentType<{ className?: string }>; name: string; color: string }> = {
  wind:   { Icon: Wind,     name: 'Wind',   color: 'text-sky-600' },
  water:  { Icon: Droplets, name: 'Water',  color: 'text-blue-600' },
  animal: { Icon: PawPrint, name: 'Animal', color: 'text-amber-700' },
};

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function SeedJourney({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  const scenario = SCENARIOS[step];
  const answered = picked !== null;
  const isCorrect = answered && scenario.choices[picked!].method === scenario.best;

  const choose = (idx: number) => {
    if (answered) return;
    setPicked(idx);
    if (scenario.choices[idx].method === scenario.best) setScore(s => s + 1);
  };

  const next = () => {
    if (step + 1 >= SCENARIOS.length) {
      setDone(true);
    } else {
      setStep(s => s + 1);
      setPicked(null);
    }
  };

  const restart = () => {
    setStep(0); setScore(0); setPicked(null); setDone(false);
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
        total={SCENARIOS.length}
        onNextLevel={nextLevel}
        onStartOver={restart}
        onBack={onBack}
        title={score === SCENARIOS.length ? 'Perfect journey! Your seed found a new home!' : 'Your seed traveled far — try again for a perfect trip!'}
        gameId={gameId}
        gameName={gameName}
        gradeLabel={gradeLabel}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-card border-2 border-primary/40 rounded-lg p-4 mb-4 flex items-center gap-3">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground" aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Sprout className="w-6 h-6 text-primary" />
          <div className="flex-1">
            <h1 className="font-display font-bold text-lg text-foreground">Seed Journey</h1>
            <p className="text-xs text-muted-foreground">Choose the best way for your seed to travel!</p>
          </div>
          <div className="text-sm font-semibold text-foreground bg-muted px-3 py-1 rounded-full">
            {step + 1} / {SCENARIOS.length}
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1 mb-4">
          {SCENARIOS.map((_, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full ${i < step ? 'bg-primary' : i === step ? 'bg-primary/60' : 'bg-muted'}`} />
          ))}
        </div>

        {/* Scenario card */}
        <div className="bg-card border-2 border-border rounded-lg p-5 space-y-4 animate-scale-in">
          <div className="flex items-start gap-2 text-sm text-primary font-semibold">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{scenario.place}</span>
          </div>
          <p className="text-foreground text-base leading-relaxed">{scenario.story}</p>

          {/* Choices */}
          <div className="grid gap-3">
            {scenario.choices.map((c, i) => {
              const meta = METHOD_META[c.method];
              const isPick = picked === i;
              const isBest = c.method === scenario.best;
              const state = !answered
                ? 'border-border bg-secondary/40 hover:border-primary/60 hover:bg-secondary'
                : isBest
                  ? 'border-emerald-500 bg-emerald-50'
                  : isPick
                    ? 'border-red-500 bg-red-50'
                    : 'border-border bg-secondary/40 opacity-60';
              return (
                <button
                  key={i}
                  onClick={() => choose(i)}
                  disabled={answered}
                  className={`p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3 ${state}`}
                >
                  <div className={`w-12 h-12 rounded-full bg-background border-2 border-current flex items-center justify-center ${meta.color}`}>
                    <meta.Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{meta.name}</div>
                    <div className="text-foreground font-medium">{c.label}</div>
                  </div>
                  {answered && isBest && <Check className="w-6 h-6 text-emerald-600" />}
                  {answered && isPick && !isBest && <X className="w-6 h-6 text-red-600" />}
                </button>
              );
            })}
          </div>

          {/* Feedback */}
          {answered && (
            <div className={`rounded-lg p-4 border-2 animate-scale-in ${isCorrect ? 'bg-emerald-50 border-emerald-300' : 'bg-amber-50 border-amber-300'}`}>
              <div className="font-bold mb-1 text-foreground">
                {isCorrect ? 'Great choice!' : 'Not the best ride!'}
              </div>
              <p className="text-sm text-foreground">
                {isCorrect ? scenario.successText : scenario.failText}
              </p>
              {!isCorrect && (
                <p className="text-xs text-muted-foreground mt-2">
                  The best travel plan here was <strong>{METHOD_META[scenario.best].name}</strong>.
                </p>
              )}
              <button
                onClick={next}
                className="mt-3 w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90"
              >
                {step + 1 >= SCENARIOS.length ? 'Finish Journey' : 'Next Scenario →'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          Correct so far: <span className="font-bold text-foreground">{score}</span> / {step + (answered ? 1 : 0)}
        </div>
      </div>

      <FarmerGuide message="Seeds can travel on the wind, in the water, or by hitching a ride on animals. Pick the best way for each scenario!" />
    </div>
  );
}