import { useState, useMemo } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { middleSchoolWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';
import { getDifficulty } from '@/lib/difficulty';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

// Group weeds by theme for level focus
const FAMILY_GROUPS = [...new Set(weeds.map(w => w.family))];
const THEMES = [
  ...FAMILY_GROUPS.map(f => ({ label: f, filter: (w: typeof weeds[0]) => w.family === f })),
  { label: 'Monocots', filter: (w: typeof weeds[0]) => w.plantType === 'Monocot' },
  { label: 'Dicots', filter: (w: typeof weeds[0]) => w.plantType === 'Dicot' },
  { label: 'Mixed', filter: () => true },
];

function getWeedsForLevel(level: number, count: number): typeof weeds {
  const themeIdx = (level - 1) % THEMES.length;
  const theme = THEMES[themeIdx];
  const pool = weeds.filter(theme.filter);
  // If not enough, supplement with all weeds
  if (pool.length < count) {
    const extra = weeds.filter(w => !pool.find(p => p.id === w.id));
    return shuffle([...pool, ...shuffle(extra)]).slice(0, count);
  }
  // Offset within pool to vary across levels using same theme
  const offset = Math.floor((level - 1) / THEMES.length) * 5;
  const shifted = [...pool.slice(offset % pool.length), ...pool.slice(0, offset % pool.length)];
  return shuffle(shifted).slice(0, count);
}

/** Builds a sequence of proposed names for a species: up to 2 wrong guesses
 * in a row, always ending with the correct common name. */
function buildProposals(weed: typeof weeds[0]): string[] {
  const wrongPool = shuffle(weeds.filter(w => w.id !== weed.id).map(w => w.commonName));
  const seq: string[] = [];
  let wrongCount = 0;
  let wrongIdx = 0;
  while (true) {
    const proposeCorrect = wrongCount >= 2 || Math.random() < 0.5;
    if (proposeCorrect) {
      seq.push(weed.commonName);
      break;
    }
    seq.push(wrongPool[wrongIdx % wrongPool.length]);
    wrongIdx++;
    wrongCount++;
  }
  return seq;
}

/** A small cartoon "little guy" character with a speech bubble proposing a name. */
function GuessBuddy({ name }: { name: string }) {
  return (
    <div className="flex items-end gap-3">
      <svg width="64" height="72" viewBox="0 0 64 72" className="shrink-0">
        {/* legs */}
        <rect x="22" y="58" width="6" height="12" rx="3" fill="currentColor" className="text-muted-foreground" />
        <rect x="36" y="58" width="6" height="12" rx="3" fill="currentColor" className="text-muted-foreground" />
        {/* body */}
        <rect x="14" y="30" width="36" height="30" rx="12" fill="currentColor" className="text-primary" />
        {/* arms */}
        <circle cx="12" cy="44" r="5" fill="currentColor" className="text-primary" />
        <circle cx="52" cy="44" r="5" fill="currentColor" className="text-primary" />
        {/* head */}
        <circle cx="32" cy="18" r="16" fill="currentColor" className="text-primary" />
        {/* eyes */}
        <circle cx="26" cy="16" r="2.5" fill="currentColor" className="text-primary-foreground" />
        <circle cx="38" cy="16" r="2.5" fill="currentColor" className="text-primary-foreground" />
        {/* smile */}
        <path d="M25 23 Q32 28 39 23" stroke="currentColor" strokeWidth="2" fill="none" className="text-primary-foreground" strokeLinecap="round" />
      </svg>
      <div className="relative bg-card border-2 border-border rounded-2xl rounded-bl-none px-4 py-2 max-w-[220px]">
        <p className="text-sm font-semibold text-foreground">I think it&apos;s {name}.</p>
      </div>
    </div>
  );
}

interface Round {
  weed: typeof weeds[0];
  proposals: string[];
}

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }
export default function NameTheWeed({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);
  const d = useMemo(() => getDifficulty(level, 'k5'), [level]);
  const rounds: Round[] = useMemo(() => {
    const levelWeeds = getWeedsForLevel(level, d.rounds);
    return levelWeeds.map(w => ({ weed: w, proposals: buildProposals(w) }));
  }, [level, d.rounds]);

  const [round, setRound] = useState(0);
  const [proposalIdx, setProposalIdx] = useState(0);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [mistakesInRound, setMistakesInRound] = useState(0);
  const [score, setScore] = useState(0);
  const [history, setHistory] = useState<{ weedId: string; name: string; correct: boolean }[]>([]);

  const done = round >= rounds.length;
  const r = !done ? rounds[round] : null;
  const proposedName = r ? r.proposals[proposalIdx] : null;
  const proposalIsCorrect = r && proposedName === r.weed.commonName;

  const answered = answer !== null;
  const judgmentCorrect = answered && r ? answer === proposalIsCorrect : false;

  const submit = (userAnswer: boolean) => {
    if (answered || !r) return;
    setAnswer(userAnswer);
    const ok = userAnswer === proposalIsCorrect;
    if (ok) setScore(s => s + 1);
    else setMistakesInRound(m => m + 1);
  };

  const next = () => {
    if (!r) return;
    if (proposalIsCorrect) {
      setHistory(h => [...h, { weedId: r.weed.id, name: r.weed.commonName, correct: mistakesInRound === 0 }]);
      setRound(i => i + 1);
      setProposalIdx(0);
      setMistakesInRound(0);
    } else {
      setProposalIdx(i => i + 1);
    }
    setAnswer(null);
  };

  const restart = () => { setRound(0); setProposalIdx(0); setAnswer(null); setMistakesInRound(0); setScore(0); setHistory([]); };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };
  const startOver = () => { setLevel(1); restart(); };

  if (done) return <LevelComplete level={level} score={score} total={rounds?.length ?? 0} onNextLevel={nextLevel} onStartOver={startOver} onBack={onBack} gameId={gameId} gameName={gameName} gradeLabel={gradeLabel} />;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
        <h1 className="font-bold text-foreground text-lg flex-1">Name the Weed</h1>
        <span className="text-sm text-muted-foreground">{round + 1}/{rounds.length}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
        <span className="text-sm font-bold text-primary ml-2">{score} pts</span>
      </div>
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 p-4 overflow-y-auto">
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-xl overflow-hidden border-2 border-border bg-secondary">
            <WeedImage weedId={r!.weed.id} stage="flower" className="w-full h-full object-cover" />
          </div>

          <GuessBuddy name={proposedName!} />

          {!answered && (
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-2">
              <button onClick={() => submit(true)}
                className="py-5 rounded-xl text-lg font-bold border-2 border-border bg-card text-foreground hover:border-primary hover:bg-primary/10 transition-all">
                True
              </button>
              <button onClick={() => submit(false)}
                className="py-5 rounded-xl text-lg font-bold border-2 border-border bg-card text-foreground hover:border-destructive hover:bg-destructive/10 transition-all">
                False
              </button>
            </div>
          )}

          {answered && (
            <div className="flex flex-col items-center gap-3 w-full max-w-sm mt-2">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 ${judgmentCorrect ? 'border-green-500 bg-green-500/10 text-green-500' : 'border-destructive bg-destructive/10 text-destructive'}`}>
                {judgmentCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                <p className="text-sm font-bold">
                  {judgmentCorrect
                    ? 'Nice work — that judgment was correct!'
                    : proposalIsCorrect
                      ? `Actually true! This is ${r!.weed.commonName}.`
                      : `Actually false — it's not ${proposedName}.`}
                </p>
              </div>
              {proposalIsCorrect && (
                <p className="text-xs italic text-muted-foreground text-center">{r!.weed.scientificName} • {r!.weed.family}</p>
              )}
              <button onClick={next} className="px-8 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
                {proposalIsCorrect ? (round + 1 < rounds.length ? 'Next Weed →' : 'See Results') : 'Next Guess →'}
              </button>
            </div>
          )}
        </div>

        {/* History side panel */}
        <div className="rounded-xl border-2 border-border bg-card p-3 overflow-y-auto">
          <p className="text-xs font-bold uppercase text-foreground mb-2">Identified ({history.length})</p>
          <div className="grid grid-cols-2 gap-2">
            {history.map((h, i) => (
              <div key={i} className="text-center">
                <div className={`aspect-square rounded-md overflow-hidden border-2 ${h.correct ? 'border-green-500' : 'border-destructive'}`}>
                  <WeedImage weedId={h.weedId} stage="flower" className="w-full h-full object-cover" />
                </div>
                <p className="text-[10px] mt-1 text-foreground truncate">{h.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <FloatingCoach grade="K-5" tip="A little guy will guess a name for each weed — decide if he's right with True or False!" />
    </div>
  );
}
