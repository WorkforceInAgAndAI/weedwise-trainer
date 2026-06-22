import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';
import { TRAIT_DEFS, COMPETITION_TRAITS, type CompetitionTrait } from '@/data/competitionTraits';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

type Weed = typeof weeds[0];

function traitsOf(w: Weed): CompetitionTrait[] {
  return COMPETITION_TRAITS[w.id] || [];
}

interface RoundOption { trait: CompetitionTrait; correct: boolean; reason: string; }
interface Round { question: string; competitorInfo: string; options: RoundOption[]; }

function buildRound(you: Weed, opponent: Weed): Round | null {
  const yourTraits = traitsOf(you);
  const oppTraits = traitsOf(opponent);
  const advantageTraits = yourTraits.filter(t => !oppTraits.includes(t));
  const sharedTraits = yourTraits.filter(t => oppTraits.includes(t));
  const oppOnly = oppTraits.filter(t => !yourTraits.includes(t));
  const neither = TRAIT_DEFS.map(d => d.key).filter(t => !yourTraits.includes(t) && !oppTraits.includes(t));

  if (advantageTraits.length === 0) return null;

  const correctTrait = shuffle(advantageTraits)[0];
  const fillerPool = shuffle([...sharedTraits, ...oppOnly, ...neither]);
  const options: RoundOption[] = [{
    trait: correctTrait,
    correct: true,
    reason: `${you.commonName} has ${correctTrait}, and ${opponent.commonName} does not — that's a true edge.`,
  }];

  for (const f of fillerPool) {
    if (options.length >= 3) break;
    if (options.some(o => o.trait === f)) continue;
    let reason: string;
    if (oppTraits.includes(f) && yourTraits.includes(f)) {
      reason = `Both ${you.commonName} and ${opponent.commonName} share ${f} — it cancels out.`;
    } else if (oppTraits.includes(f)) {
      reason = `${opponent.commonName} actually has ${f} and ${you.commonName} doesn't — that would backfire.`;
    } else {
      reason = `${you.commonName} doesn't have ${f} as a real survival trait.`;
    }
    options.push({ trait: f, correct: false, reason });
  }

  return {
    question: `Which of YOUR survival traits gives the best edge over ${opponent.commonName}?`,
    competitorInfo: '',
    options: shuffle(options),
  };
}

function getMatchupsForLevel(level: number) {
  // Only weeds that have trait data
  const pool = weeds.filter(w => (COMPETITION_TRAITS[w.id] || []).length > 0);
  const offset = (level - 1) * 8;
  const rotated = [...pool.slice(offset % pool.length), ...pool.slice(0, offset % pool.length)];
  const shuffled = shuffle(rotated);
  const result: { you: Weed; opponent: Weed }[] = [];
  // Only include matchups where 'you' has at least one trait the opponent doesn't
  for (let i = 0; i < shuffled.length && result.length < 4; i++) {
    const you = shuffled[i];
    const yourTraits = traitsOf(you);
    const opponent = shuffled.find(o => {
      if (o.id === you.id) return false;
      if (result.some(r => r.you.id === o.id || r.opponent.id === o.id)) return false;
      if (result.some(r => r.you.id === you.id)) return false;
      const oppT = traitsOf(o);
      return yourTraits.some(t => !oppT.includes(t));
    });
    if (opponent && !result.some(r => r.you.id === you.id)) {
      result.push({ you, opponent });
    }
  }
  return result;
}

function TraitBadgeList({ traits }: { traits: CompetitionTrait[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {traits.map(t => (
        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium leading-tight">{t}</span>
      ))}
      {traits.length === 0 && <span className="text-[10px] text-muted-foreground italic">no listed survival traits</span>}
    </div>
  );
}

export default function WeedCompetitors({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const matchups = useMemo(() => getMatchupsForLevel(level), [level]);

  const [matchIdx, setMatchIdx] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);

  const done = matchIdx >= matchups.length;
  const match = !done ? matchups[matchIdx] : null;
  const round = useMemo(() => match ? buildRound(match.you, match.opponent) : null, [match]);

  const pick = (idx: number) => {
    if (answered || !round) return;
    setPicked(idx);
    setAnswered(true);
    if (round.options[idx].correct) {
      setTotalPoints(t => t + 1);
    }
  };

  const nextMatch = () => {
    setMatchIdx(m => m + 1); setShowIntro(true); setPicked(null); setAnswered(false);
  };

  const restart = () => { setMatchIdx(0); setTotalPoints(0); setPicked(null); setAnswered(false); setShowIntro(true); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (done) {
    return <LevelComplete level={level} score={totalPoints} total={matchups.length} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} />;
  }

  if (showIntro && match) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
          <h1 className="font-bold text-foreground text-lg flex-1">Weed Competitors</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
          <span className="text-sm text-muted-foreground">Match {matchIdx + 1}/{matchups.length}</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4 max-w-md mx-auto">
          <h2 className="text-xl font-bold text-foreground">Match {matchIdx + 1}: Meet the Competitors</h2>

          <div className="w-full border border-border rounded-xl p-4 bg-card">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border shrink-0">
                <WeedImage weedId={match.you.id} stage="flower" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">{match.you.commonName} <span className="text-xs text-muted-foreground">(You)</span></p>
                <p className="text-xs text-muted-foreground">{match.you.plantType} · {match.you.lifeCycle}</p>
              </div>
            </div>
          </div>

          <div className="w-full border border-border rounded-xl p-4 bg-card">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border shrink-0">
                <WeedImage weedId={match.opponent.id} stage="flower" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">{match.opponent.commonName} <span className="text-xs text-muted-foreground">(Rival)</span></p>
                <p className="text-xs text-muted-foreground">{match.opponent.plantType} · {match.opponent.lifeCycle}</p>
              </div>
            </div>
          </div>

          <button onClick={() => setShowIntro(false)} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
            Start Match
          </button>
        </div>
      </div>
    );
  }

  const traitDef = (k: CompetitionTrait) => TRAIT_DEFS.find(d => d.key === k);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Weed Competitors</h1>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold ml-auto">Lv.{level}</span>
        <span className="text-sm text-muted-foreground">Match {matchIdx + 1}/{matchups.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center">
        <div className="w-full max-w-md rounded-2xl p-4 mb-4 border border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-border mb-2">
                <WeedImage weedId={match!.you.id} stage="flower" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs font-bold text-foreground">{match!.you.commonName}</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase">You</p>
            </div>
            <div className="flex flex-col items-center px-2">
              <span className="text-3xl font-black text-foreground">VS</span>
            </div>
            <div className="text-center flex-1">
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-border mb-2">
                <WeedImage weedId={match!.opponent.id} stage="flower" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs font-bold text-foreground">{match!.opponent.commonName}</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase">Rival</p>
            </div>
          </div>
        </div>

        {round && (
          <div className="w-full max-w-md bg-card rounded-xl border border-border p-4 mb-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Your Move</p>
            <p className="font-bold text-foreground text-base mb-4">{round.question}</p>
            <div className="flex flex-col gap-3">
              {round.options.map((opt, idx) => {
                const bg = !answered ? 'border-border bg-card hover:border-primary' :
                  idx === picked ? (opt.correct ? 'border-green-500 bg-green-500/20' : 'border-destructive bg-destructive/20') :
                  opt.correct ? 'border-green-500 bg-green-500/10' : 'border-border bg-card';
                const def = traitDef(opt.trait);
                return (
                  <button key={idx} onClick={() => pick(idx)} className={`p-3 rounded-xl border-2 text-left transition-all ${bg}`}>
                    <span className="font-bold text-sm text-foreground">{opt.trait}</span>
                    <p className="text-[11px] text-muted-foreground leading-tight mt-1">{def?.desc}</p>
                    {answered && <p className="text-xs text-foreground mt-2"><span className="font-semibold text-primary">Why:</span> {opt.reason}</p>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {answered && (
          <button onClick={nextMatch} className="px-8 py-3 rounded-xl bg-primary text-primary-foreground font-bold">
            {matchIdx + 1 >= matchups.length ? 'See Final Results' : 'Next Match'}
          </button>
        )}
      </div>
      <FloatingCoach grade="6-8" tip="Recall your weed's survival traits. Pick the one your rival doesn't share." />
    </div>
  );
}
