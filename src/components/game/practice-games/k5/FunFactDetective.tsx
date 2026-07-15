import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Search, Check, X, Lightbulb, Camera, FileText } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';
import WeedImage from '@/components/game/WeedImage';

// The 14 weeds featured in the K-5 "14 Weeds You Can Spot!" learning module.
// Each entry mirrors the module's name, spot-it hint, and fun fact so students
// see the same clues they just learned.
interface WeedEntry {
  id: string;
  name: string;
  spotIt: string;
  funFact: string;
}

const ALL_WEEDS: WeedEntry[] = [
  { id: 'Dandelion',                name: 'Dandelion',                spotIt: 'Bright yellow flowers that turn into fluffy white puffballs.',                              funFact: 'One big puff of wind and those parachute seeds can float far, far away!' },
  { id: 'giant-foxtail',            name: 'Giant Foxtail',            spotIt: 'A fuzzy seed head that curves over like a fox\u2019s bushy tail.',                          funFact: 'Rub a leaf and you can feel tiny hairs like soft fuzz.' },
  { id: 'lambsquarters',            name: 'Common Lambsquarters',     spotIt: 'Green leaves that look sprinkled with a light dusting of flour.',                          funFact: 'The "flour" is really a waxy powder \u2014 wipe it and it comes right off!' },
  { id: 'common_Milkweed',          name: 'Common Milkweed',          spotIt: 'Broad leaves with milky white sap and pink-purple flower clusters.',                       funFact: 'Monarch butterflies NEED this plant \u2014 but in a crop field it is still a weed.' },
  { id: 'Wild_Carrot',              name: 'Wild Carrot',              spotIt: 'Flat clusters of tiny white flowers like lacy umbrellas ("Queen Anne\u2019s Lace").',      funFact: 'It is a biennial \u2014 it takes TWO whole years to finish its life cycle.' },
  { id: 'canada-thistle',           name: 'Canada Thistle',           spotIt: 'Spiny, prickly lobed leaves and small purple flower puffs.',                                funFact: 'Its long roots stretch out underground like secret tunnels!' },
  { id: 'giant-ragweed',            name: 'Giant Ragweed',            spotIt: 'HUGE 3-lobed leaves shaped like giant hands \u2014 sometimes taller than you!',            funFact: 'Its tiny green flowers make so much pollen they can make people sneeze all summer.' },
  { id: 'pennsylvania-smartweed',   name: 'Pennsylvania Smartweed',   spotIt: 'Pink flower spikes and leaves with a dark smudge shaped like a thumbprint.',                funFact: 'That thumbprint mark is the fastest way to be a smartweed detective!' },
  { id: 'kochia',                   name: 'Kochia',                   spotIt: 'A bushy, feathery green plant that turns red in fall \u2014 like a tumbleweed!',            funFact: 'One kochia plant can roll for miles, scattering seeds the whole way.' },
  { id: 'wild-parsnip',             name: 'Wild Parsnip',             spotIt: 'Tall plant with flat-topped clusters of tiny yellow flowers.',                              funFact: 'WARNING \u2014 never touch it! Its sap plus sunlight can give you a nasty burn.' },
  { id: 'yellow-nutsedge',          name: 'Yellow Nutsedge',          spotIt: 'Shiny yellow-green grass with a stem you can feel has 3 triangle sides.',                  funFact: '"Sedges have edges" \u2014 a rhyme scientists use to remember the triangle stem.' },
  { id: 'velvetleaf',               name: 'Velvetleaf',               spotIt: 'Big heart-shaped leaves that feel soft and fuzzy \u2014 just like velvet!',                funFact: 'Its seed pods look like tiny crowns sitting on top of the plant.' },
  { id: 'Field_bindweed',           name: 'Morningglory',             spotIt: 'Twisty vines that climb, with trumpet-shaped purple, pink, or blue flowers.',              funFact: 'The flowers open in the morning and close up when the sun gets hot!' },
  { id: 'Venice_mallow',            name: 'Venice Mallow',            spotIt: 'Creamy white flowers with a dark purple bullseye center.',                                  funFact: 'Each flower only stays open for a few hours before it closes forever.' },
];

const PAIRS_PER_ROUND = 4;
const TOTAL_ROUNDS = 4; // 4 rounds x 4 pairs = 16 attempts covering all 14 weeds

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pickRound(seed: number): WeedEntry[] {
  // Deterministic-ish sampling that changes each round without repeating within one round
  return shuffle(ALL_WEEDS).slice(0, PAIRS_PER_ROUND);
}

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function FunFactDetective({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(0);           // 0-indexed round within the level
  const [score, setScore] = useState(0);           // correct matches so far
  const [attempted, setAttempted] = useState(0);   // total attempts so far
  const [done, setDone] = useState(false);

  // Build the current round's data
  const pairs = useMemo(() => pickRound(round + level * 31), [round, level]);
  const shuffledPhotos = useMemo(() => shuffle(pairs), [pairs]);
  const shuffledCards = useMemo(() => shuffle(pairs), [pairs]);

  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [selPhoto, setSelPhoto] = useState<string | null>(null);
  const [selCard, setSelCard] = useState<string | null>(null);
  const [wrong, setWrong] = useState<{ photo: string; card: string } | null>(null);

  // Reset per-round selection state whenever round or level changes
  useEffect(() => {
    setMatched(new Set());
    setSelPhoto(null);
    setSelCard(null);
    setWrong(null);
  }, [round, level]);

  const tryResolve = (photoId: string | null, cardId: string | null) => {
    if (!photoId || !cardId) return;
    setAttempted(a => a + 1);
    if (photoId === cardId) {
      setScore(s => s + 1);
      setMatched(prev => {
        const n = new Set(prev);
        n.add(photoId);
        return n;
      });
      setSelPhoto(null);
      setSelCard(null);
    } else {
      setWrong({ photo: photoId, card: cardId });
      setTimeout(() => {
        setWrong(null);
        setSelPhoto(null);
        setSelCard(null);
      }, 900);
    }
  };

  const clickPhoto = (id: string) => {
    if (matched.has(id) || wrong) return;
    const next = selPhoto === id ? null : id;
    setSelPhoto(next);
    if (next && selCard) tryResolve(next, selCard);
  };

  const clickCard = (id: string) => {
    if (matched.has(id) || wrong) return;
    const next = selCard === id ? null : id;
    setSelCard(next);
    if (next && selPhoto) tryResolve(selPhoto, next);
  };

  const roundComplete = matched.size === pairs.length;

  const nextRound = () => {
    if (round + 1 >= TOTAL_ROUNDS) {
      setDone(true);
    } else {
      setRound(r => r + 1);
    }
  };

  const restart = () => {
    setLevel(1);
    setRound(0);
    setScore(0);
    setAttempted(0);
    setDone(false);
  };

  const nextLevel = () => {
    setLevel(l => l + 1);
    setRound(0);
    setScore(0);
    setAttempted(0);
    setDone(false);
  };

  if (done) {
    const total = PAIRS_PER_ROUND * TOTAL_ROUNDS;
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-card border-2 border-primary/40 rounded-lg p-4 mb-4 flex items-center gap-3">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground" aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Search className="w-6 h-6 text-primary" />
          <div className="flex-1">
            <h1 className="font-display font-bold text-lg text-foreground">Fun Fact Detective</h1>
            <p className="text-xs text-muted-foreground">Read the clue card, then tap the weed photo it matches!</p>
          </div>
          <div className="text-sm font-semibold text-foreground bg-muted px-3 py-1 rounded-full">
            Round {round + 1} / {TOTAL_ROUNDS}
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
            <div key={i} className={`h-2 flex-1 rounded-full ${i < round ? 'bg-primary' : i === round ? 'bg-primary/60' : 'bg-muted'}`} />
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Photos column */}
          <div className="bg-card border-2 border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3 text-primary font-bold">
              <Camera className="w-4 h-4" />
              <span className="text-sm uppercase tracking-wide">Case Photos</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {shuffledPhotos.map(w => {
                const isMatched = matched.has(w.id);
                const isSelected = selPhoto === w.id;
                const isWrong = wrong?.photo === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => clickPhoto(w.id)}
                    disabled={isMatched}
                    className={`relative rounded-lg overflow-hidden border-4 transition-all aspect-square
                      ${isMatched ? 'border-emerald-500 opacity-70' :
                        isWrong ? 'border-red-500 animate-pulse' :
                        isSelected ? 'border-primary ring-2 ring-primary/40 scale-[1.02]' :
                        'border-border hover:border-primary/60'}`}
                    aria-label={isMatched ? `Matched: ${w.name}` : 'Weed photo'}
                  >
                    <WeedImage weedId={w.id} stage="flower" className="w-full h-full" />
                    {isMatched && (
                      <div className="absolute inset-x-0 bottom-0 bg-emerald-600/90 text-white text-xs font-bold py-1 px-2 flex items-center gap-1 justify-center">
                        <Check className="w-3 h-3" /> {w.name}
                      </div>
                    )}
                    {isWrong && (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                        <X className="w-10 h-10 text-red-600" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clue cards column */}
          <div className="bg-card border-2 border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3 text-primary font-bold">
              <FileText className="w-4 h-4" />
              <span className="text-sm uppercase tracking-wide">Detective Clue Cards</span>
            </div>
            <div className="grid gap-3">
              {shuffledCards.map(w => {
                const isMatched = matched.has(w.id);
                const isSelected = selCard === w.id;
                const isWrong = wrong?.card === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => clickCard(w.id)}
                    disabled={isMatched}
                    className={`text-left p-3 rounded-lg border-2 transition-all
                      ${isMatched ? 'border-emerald-500 bg-emerald-50 opacity-70' :
                        isWrong ? 'border-red-500 bg-red-50 animate-pulse' :
                        isSelected ? 'border-primary bg-primary/5 ring-2 ring-primary/40' :
                        'border-border bg-secondary/40 hover:border-primary/60 hover:bg-secondary'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <Search className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="font-display font-bold text-foreground">
                        {isMatched ? w.name : '???'}
                      </div>
                      {isMatched && <Check className="w-4 h-4 text-emerald-600 ml-auto" />}
                    </div>
                    <div className="flex items-start gap-2 mt-2 pl-1">
                      <Lightbulb className="w-4 h-4 mt-0.5 text-yellow-600 shrink-0" />
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Fun fact clue</div>
                        <p className="text-sm text-foreground leading-snug">{w.funFact}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground italic mt-2 pl-6">Spot it: {w.spotIt}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Round complete banner */}
        {roundComplete && (
          <div className="mt-4 bg-emerald-50 border-2 border-emerald-300 rounded-lg p-4 animate-scale-in">
            <div className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
              <Check className="w-5 h-5" /> Round {round + 1} solved!
            </div>
            <p className="text-sm text-emerald-900 mb-3">
              You matched all {pairs.length} weeds. Ready for the next case file?
            </p>
            <button
              onClick={nextRound}
              className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90"
            >
              {round + 1 >= TOTAL_ROUNDS ? 'Close the Case!' : 'Next Round →'}
            </button>
          </div>
        )}

        <div className="mt-4 text-center text-xs text-muted-foreground">
          Cases solved: <span className="font-bold text-foreground">{score}</span> / {attempted}
        </div>
      </div>

      <FarmerGuide
        message="Read each fun-fact clue like a detective! Match the weird, wonderful facts from the module to the right weed photo."
        gradeLabel={gradeLabel}
      />
    </div>
  );
}