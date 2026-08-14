import { useMemo, useState } from 'react';
import { ArrowLeft, Sparkles, AlertTriangle, RotateCcw, ChevronRight, Check } from 'lucide-react';
import { getDifficulty } from '@/lib/difficulty';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';
import WeedImage from '@/components/game/WeedImage';

// -------- Mr. Plant Head! (K-5 Explorer, drag & drop) ---------------------
// Kids build "today's weed" out of REAL photographs of plant parts: a leaf,
// a flower, and seeds. Three photo choices per part — only the one that
// belongs to today's species is correct. Wrong photos bounce right back out
// of the slot so kids can try again.
// -------------------------------------------------------------------------

type PartKind = 'leaves' | 'flower' | 'seeds';
const PART_ORDER: PartKind[] = ['leaves', 'flower', 'seeds'];

const PART_LABELS: Record<PartKind, string> = {
  leaves: 'Leaves', flower: 'Flower', seeds: 'Seeds',
};

// Photo stage used for each part kind.
const PART_STAGE: Record<PartKind, string> = {
  leaves: 'vegetative', // leaf_1.jpg
  flower: 'flower',     // reprof_.jpg
  seeds: 'seed',        // seed_1.jpg — actual seeds, not the whole seed head
};

interface WeedCase { id: string; name: string; funFact: string; hints: Record<PartKind, string>; }

// K-5 module weeds that have leaf, flower, AND seed photographs.
const CASES: WeedCase[] = [
  {
    id: 'Dandelion', name: 'Dandelion',
    funFact: 'Its fluffy seed head is a natural parachute — one puff can send 200 seeds flying!',
    hints: { leaves: 'Jagged "lion-tooth" leaves', flower: 'Bright yellow flower', seeds: 'Tiny seeds with a fluffy parachute' },
  },
  {
    id: 'giant-foxtail', name: 'Giant Foxtail',
    funFact: 'Its seed head looks just like a fox\'s bushy tail!',
    hints: { leaves: 'Long ribbon-like grass blades', flower: 'Fuzzy nodding grass head', seeds: 'Small oval grass grains' },
  },
  {
    id: 'canada-thistle', name: 'Canada Thistle',
    funFact: 'Sharp spines protect it — never touch it without gloves!',
    hints: { leaves: 'Spiny, pointy-edged leaves', flower: 'Purple pom-pom flower', seeds: 'Slim brown seeds with silky hairs' },
  },
  {
    id: 'common_Milkweed', name: 'Common Milkweed',
    funFact: 'It\'s the ONLY plant Monarch caterpillars eat!',
    hints: { leaves: 'Big smooth oval leaves', flower: 'Pink puff-ball cluster', seeds: 'Flat brown seeds from a bumpy pod' },
  },
  {
    id: 'lambsquarters', name: 'Lambsquarters',
    funFact: 'Its leaves have a "sugar-coated" look from tiny white powder!',
    hints: { leaves: 'Diamond leaves dusted white', flower: 'Tiny green flower clusters', seeds: 'Thousands of shiny black seeds' },
  },
  {
    id: 'Wild_Carrot', name: 'Wild Carrot',
    funFact: 'Also called "Queen Anne\'s Lace" — its flower looks like fancy lace!',
    hints: { leaves: 'Feathery, fern-like leaves', flower: 'Flat lacy white flower', seeds: 'Bristly little seeds that cling' },
  },
  {
    id: 'Field_bindweed', name: 'Field Bindweed',
    funFact: 'A "playground bully" — its vines twist around and choke other plants!',
    hints: { leaves: 'Arrowhead-shaped leaves', flower: 'Pink-and-white trumpet flower', seeds: 'Dark seeds that live 50+ years' },
  },
];

function shuffle<T>(a: T[]): T[] { return [...a].sort(() => Math.random() - 0.5); }

interface SlotDef { id: string; kind: PartKind; x: number; y: number; size: number; label: string }
const SLOTS: SlotDef[] = [
  { id: 'flower', kind: 'flower', x: 200, y: 96, size: 132, label: 'Flower' },
  { id: 'leaves', kind: 'leaves', x: 108, y: 258, size: 128, label: 'Leaf' },
  { id: 'seeds', kind: 'seeds', x: 200, y: 414, size: 124, label: 'Seeds' },
];

interface PaletteItem { id: string; kind: PartKind; weedId: string; weedName: string; correct: boolean }
interface Placement { kind: PartKind; weedId: string; weedName: string; correct: boolean }

/** 3 photo options per part: today's weed + two other species. */
function buildRound(caseIdx: number) {
  const c = CASES[caseIdx];
  const others = shuffle(CASES.filter(x => x.id !== c.id)).slice(0, 2);
  const palette: Record<PartKind, PaletteItem[]> = { leaves: [], flower: [], seeds: [] };
  PART_ORDER.forEach(k => {
    const items: PaletteItem[] = [
      { id: `${k}-${c.id}`, kind: k, weedId: c.id, weedName: c.name, correct: true },
      ...others.map(o => ({ id: `${k}-${o.id}`, kind: k, weedId: o.id, weedName: o.name, correct: false })),
    ];
    palette[k] = shuffle(items);
  });
  return { case: c, palette };
}

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function PlantPartsHead({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);
  const diff = useMemo(() => getDifficulty(level, 'k5'), [level]);
  const roundsPerLevel = Math.max(2, Math.min(CASES.length, Math.round(diff.rounds / 2)));
  const [round, setRound] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [totalPossible, setTotalPossible] = useState(0);
  const [done, setDone] = useState(false);

  const [roundData, setRoundData] = useState(() => buildRound(Math.floor(Math.random() * CASES.length)));
  const [placements, setPlacements] = useState<Record<string, Placement>>({});
  const [bounce, setBounce] = useState<{ slotId: string; name: string } | null>(null);
  const [misses, setMisses] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [dragItem, setDragItem] = useState<PaletteItem | null>(null);
  const [showPreview, setShowPreview] = useState(true);

  const c = roundData.case;
  const slotsFilled = Object.keys(placements).length;

  function tryPlace(slot: SlotDef, item: PaletteItem | null) {
    if (!item || showResult || placements[slot.id]) return;
    if (item.kind !== slot.kind) return;
    if (!item.correct) {
      // Wrong species — bounce the photo back out of the slot.
      setMisses(m => m + 1);
      setBounce({ slotId: slot.id, name: item.weedName });
      window.setTimeout(() => setBounce(b => (b && b.slotId === slot.id ? null : b)), 900);
      setDragItem(null);
      return;
    }
    setPlacements(p => ({ ...p, [slot.id]: { kind: item.kind, weedId: item.weedId, weedName: item.weedName, correct: true } }));
    setDragItem(null);
  }

  function removePlacement(slotId: string) {
    if (showResult) return;
    setPlacements(p => { const n = { ...p }; delete n[slotId]; return n; });
  }

  const roundScore = Math.max(1, SLOTS.length - Math.min(misses, SLOTS.length - 1));

  function nextRound() {
    const nextTotalScore = totalScore + roundScore;
    const nextTotalPossible = totalPossible + SLOTS.length;
    setTotalScore(nextTotalScore);
    setTotalPossible(nextTotalPossible);
    if (round + 1 >= roundsPerLevel) { setDone(true); return; }
    setRound(round + 1);
    resetTo(Math.floor(Math.random() * CASES.length));
    setShowPreview(true);
  }

  function resetTo(idx: number) {
    setRoundData(buildRound(idx));
    setPlacements({});
    setMisses(0);
    setBounce(null);
    setShowResult(false);
  }

  function resetRound() { setPlacements({}); setBounce(null); setShowResult(false); }

  function startOver() {
    setLevel(1); setRound(0); setTotalScore(0); setTotalPossible(0); setDone(false);
    resetTo(Math.floor(Math.random() * CASES.length)); setShowPreview(true);
  }
  function nextLevel() {
    setLevel(l => l + 1); setRound(0); setTotalScore(0); setTotalPossible(0); setDone(false);
    resetTo(Math.floor(Math.random() * CASES.length)); setShowPreview(true);
  }

  if (done) {
    return (
      <LevelComplete
        level={level}
        score={totalScore}
        total={totalPossible}
        onNextLevel={nextLevel}
        onStartOver={startOver}
        onBack={onBack}
        title="Mr. Plant Head!"
        gameId={gameId}
        gameName={gameName}
        gradeLabel={gradeLabel}
        hideAccuracy
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-40 overflow-y-auto">
      {showPreview && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-background rounded-2xl shadow-2xl max-w-md w-full p-5" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Meet Your Plant</p>
              <h2 className="text-2xl font-bold text-foreground">{c.name}</h2>
            </div>
            <div className="rounded-xl overflow-hidden border-4 border-primary/30 mb-3 aspect-square bg-muted">
              <WeedImage weedId={c.id} stage="flower" className="w-full h-full object-cover" />
            </div>
            <p className="text-sm text-foreground mb-3"><span className="font-bold">Fun fact:</span> {c.funFact}</p>
            <button
              onClick={() => setShowPreview(false)}
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-lg font-bold hover:opacity-90"
            >
              Start Building! <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">Level {level}</span>
            <span className="px-3 py-1 rounded-full bg-muted text-foreground font-semibold">Round {round + 1} / {roundsPerLevel}</span>
            <span className="px-3 py-1 rounded-full bg-accent/20 text-accent-foreground font-semibold">Score {totalScore}</span>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" /> Mr. Plant Head!
        </h1>
        <p className="text-muted-foreground mb-3 text-lg">
          Build <span className="font-bold text-foreground">{c.name}</span>! Drag the real photo of its <b>leaf</b>, <b>flower</b>, and <b>seeds</b> onto the plant. Photos from other plants will bounce right back out!
        </p>

        <div className="mb-3 rounded-lg border-2 border-red-300 bg-red-50 p-3 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800"><strong>Real-life rule:</strong> Never touch or pull a real weed unless a trusted adult says it's safe.</p>
        </div>

        <div className="grid md:grid-cols-[1fr,minmax(300px,380px)] gap-5">
          {/* Plant body with slots */}
          <div className="relative rounded-xl overflow-hidden border-4 border-green-800/40 shadow-lg"
               style={{ background: 'linear-gradient(180deg, #e0f2fe 0%, #dbeafe 66%, #a3d977 66%, #8bbf55 71%, #8a5a34 71%, #5f3b21 100%)', aspectRatio: '5/6' }}>
            <svg viewBox="0 0 400 480" className="w-full h-full">
              <g opacity={0.9}>
                <path d="M200 340 C 196 280, 204 220, 200 150" stroke="#4d7c0f" strokeWidth={18} strokeLinecap="round" fill="none" />
                <path d="M200 262 Q 165 254, 140 256" stroke="#4d7c0f" strokeWidth={10} strokeLinecap="round" fill="none" />
                <g stroke="#8a5a34" strokeWidth={8} strokeLinecap="round" fill="none">
                  <path d="M200 340 L 200 388" />
                </g>
                <g stroke="#a97142" strokeWidth={5} strokeLinecap="round" fill="none">
                  <path d="M200 360 Q 165 375, 145 400" />
                  <path d="M200 370 Q 240 385, 258 410" />
                </g>
              </g>
              <line x1={0} y1={340} x2={400} y2={340} stroke="#3f6212" strokeWidth={3} strokeDasharray="6 4" />
              <text x={10} y={358} fontSize={12} fill="#fef3c7" fontWeight={700}>SOIL LINE</text>
              <text x={10} y={470} fontSize={11} fill="#fef3c7" fontWeight={700}>UNDERGROUND — seeds fall down here</text>

              {SLOTS.map(slot => {
                const placed = placements[slot.id];
                const isBouncing = bounce?.slotId === slot.id;
                return (
                  <foreignObject
                    key={slot.id}
                    x={slot.x - slot.size / 2}
                    y={slot.y - slot.size / 2}
                    width={slot.size}
                    height={slot.size}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => tryPlace(slot, dragItem)}
                  >
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); tryPlace(slot, dragItem); }}
                      onClick={() => (placed ? removePlacement(slot.id) : tryPlace(slot, dragItem))}
                      className={`w-full h-full rounded-full border-4 flex items-center justify-center overflow-hidden transition-all ${
                        placed ? 'border-green-500 bg-green-100/70 cursor-pointer'
                        : isBouncing ? 'border-red-500 bg-red-100/80 animate-bounce'
                        : 'border-dashed border-slate-500 bg-white/60 hover:bg-white/85'
                      }`}
                    >
                      {placed ? (
                        <div className="relative w-full h-full">
                          <WeedImage weedId={placed.weedId} stage={PART_STAGE[placed.kind]} className="w-full h-full object-cover" />
                          <div className="absolute -top-0 -right-0 w-7 h-7 rounded-full bg-green-600 flex items-center justify-center shadow">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        </div>
                      ) : isBouncing ? (
                        <span className="text-xs font-black text-red-700 text-center px-1 leading-tight">
                          That's {bounce?.name}!<br />Bounced out — try again
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-slate-700 text-center px-1 leading-tight">
                          {slot.label}<br /><span className="text-[11px] font-normal opacity-70">drop here</span>
                        </span>
                      )}
                    </div>
                  </foreignObject>
                );
              })}
            </svg>
          </div>

          {/* Parts bin */}
          <div className="space-y-3">
            <div className="rounded-lg border-2 border-border bg-card p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Today's Weed</p>
              <p className="text-xl font-bold text-foreground">{c.name}</p>
              <p className="text-xs text-muted-foreground mt-1 italic">"{c.funFact}"</p>
            </div>

            <div className="rounded-lg border-2 border-dashed border-border bg-card p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Parts Bin — pick the real {c.name} part</p>
              <div className="space-y-3">
                {PART_ORDER.map(k => (
                  <div key={k}>
                    <p className="text-sm font-bold text-foreground mb-1">
                      {PART_LABELS[k]} <span className="font-normal text-muted-foreground">— {c.hints[k]}</span>
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {roundData.palette[k].map(p => {
                        const used = Object.values(placements).some(pl => pl.kind === k);
                        return (
                          <button
                            key={p.id}
                            draggable={!showResult && !used}
                            onDragStart={() => setDragItem(p)}
                            onDragEnd={() => setDragItem(null)}
                            onClick={() => setDragItem(p)}
                            className={`aspect-square rounded-lg border-4 bg-white overflow-hidden transition-all ${
                              used ? 'opacity-30 pointer-events-none border-border'
                              : dragItem?.id === p.id ? 'border-primary scale-105 shadow-lg'
                              : 'border-border hover:border-primary hover:scale-105 cursor-grab active:cursor-grabbing'
                            }`}
                            title="Drag me onto the plant"
                          >
                            <WeedImage weedId={p.weedId} stage={PART_STAGE[k]} className="w-full h-full object-cover" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">Tip: tap a photo to pick it up, then tap the circle on the plant.</p>
            </div>

            {slotsFilled === SLOTS.length ? (
              <button onClick={nextRound} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90">
                {c.name} is complete! Next →
              </button>
            ) : (
              <button
                onClick={resetRound}
                className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground py-2 rounded border border-border"
              >
                <RotateCcw className="w-4 h-4" /> Start this plant over
              </button>
            )}

            <FarmerGuide tone="intro" message={`Look closely! Every plant has its very own leaf, flower, and seed. Match all three to build ${c.name}.`} />
          </div>
        </div>
      </div>
    </div>
  );
}
