import { useMemo, useState } from 'react';
import { ArrowLeft, Newspaper, Check, X, ShieldCheck, AlertTriangle, Notebook, Send } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';
import WeedImage from '@/components/game/WeedImage';
import { weeds } from '@/data/weeds';
import type { Weed } from '@/types/game';

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
