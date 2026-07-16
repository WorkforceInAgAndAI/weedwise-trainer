import { useState } from 'react';
import { ArrowLeft, Sparkles, AlertTriangle, RotateCcw, ChevronRight, Check, X } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';

// -------- Mr. Plant Head! (K-5 Explorer, drag & drop) ---------------------
// Kids drag cartoon plant parts (roots, stem, leaves, flower, seeds) onto
// the matching spots on a blank plant "body". Each round themes the parts
// around a K-5 module weed so students learn plant anatomy + species facts.
// -------------------------------------------------------------------------

type PartKind = 'roots' | 'stem' | 'leaves' | 'flower' | 'seeds';

// Each part has 3-4 visual styles so kids can build a custom plant every round.
// Any style dropped in the matching slot counts as correct — this is a
// creative anatomy game, not an identification quiz.
interface PartStyle { id: string; label: string; color: string; variant: string; }

const PART_STYLES: Record<PartKind, PartStyle[]> = {
  roots: [
    { id: 'taproot',  label: 'Taproot',        color: '#a16207', variant: 'taproot' },
    { id: 'fibrous',  label: 'Fibrous roots',  color: '#78716c', variant: 'fibrous' },
    { id: 'creeping', label: 'Creeping roots', color: '#7c2d12', variant: 'creeping' },
    { id: 'tuber',    label: 'Tuber (bulb)',   color: '#d97706', variant: 'tuber' },
  ],
  stem: [
    { id: 'thick',   label: 'Thick stem',     color: '#65a30d', variant: 'thick' },
    { id: 'grass',   label: 'Grass stalk',    color: '#84cc16', variant: 'grass' },
    { id: 'vine',    label: 'Twisty vine',    color: '#4ade80', variant: 'vine' },
    { id: 'prickly', label: 'Prickly stem',   color: '#4d7c0f', variant: 'prickly' },
  ],
  leaves: [
    { id: 'oval',     label: 'Oval leaf',      color: '#166534', variant: 'oval' },
    { id: 'jagged',   label: 'Jagged leaf',    color: '#15803d', variant: 'jagged' },
    { id: 'feathery', label: 'Feathery leaf',  color: '#14532d', variant: 'feathery' },
    { id: 'blade',    label: 'Grass blade',    color: '#4d7c0f', variant: 'blade' },
  ],
  flower: [
    { id: 'daisy',   label: 'Daisy',          color: '#facc15', variant: 'daisy' },
    { id: 'trumpet', label: 'Trumpet',        color: '#fce7f3', variant: 'trumpet' },
    { id: 'pompom',  label: 'Pom-pom',        color: '#c026d3', variant: 'pompom' },
    { id: 'lace',    label: 'Lace cluster',   color: '#f9fafb', variant: 'lace' },
  ],
  seeds: [
    { id: 'puff',   label: 'Puffball',        color: '#e5e7eb', variant: 'puff' },
    { id: 'pod',    label: 'Seed pod',        color: '#fde68a', variant: 'pod' },
    { id: 'silky',  label: 'Silky seeds',     color: '#f5f5f4', variant: 'silky' },
    { id: 'burry',  label: 'Sticky burs',     color: '#78350f', variant: 'burry' },
  ],
};

const PART_ORDER: PartKind[] = ['roots', 'stem', 'leaves', 'flower', 'seeds'];

// Each slot is a landing spot on the plant body. There can be more than one
// slot per PartKind (e.g. three leaves) — the drop is correct as long as the
// dragged item's `kind` matches the slot's `kind`.
interface SlotDef { id: string; kind: PartKind; x: number; y: number; w: number; h: number; label: string; oval?: boolean; }

const SLOTS: SlotDef[] = [
  { id: 'roots',        kind: 'roots',  x: 200, y: 400, w: 130, h: 110, label: 'Roots' },
  { id: 'stem',         kind: 'stem',   x: 200, y: 275, w: 70,  h: 160, label: 'Stem', oval: true },
  { id: 'leaves-left',  kind: 'leaves', x: 105, y: 240, w: 100, h: 100, label: 'Leaf' },
  { id: 'leaves-mid',   kind: 'leaves', x: 200, y: 200, w: 100, h: 100, label: 'Leaf' },
  { id: 'leaves-right', kind: 'leaves', x: 295, y: 240, w: 100, h: 100, label: 'Leaf' },
  { id: 'flower',       kind: 'flower', x: 200, y: 95,  w: 120, h: 120, label: 'Flower' },
  { id: 'seeds',        kind: 'seeds',  x: 325, y: 95,  w: 110, h: 110, label: 'Seeds' },
];

const PART_LABELS: Record<PartKind, string> = {
  roots: 'Roots', stem: 'Stem', leaves: 'Leaves', flower: 'Flower', seeds: 'Seeds',
};

interface WeedCase {
  name: string;
  funFact: string;
  parts: Record<PartKind, { color: string; hint: string; icon: string }>;
  /** Which of the PART_STYLES the real weed most looks like — shown after guess */
  actual?: Partial<Record<PartKind, string>>;
  distractors?: { kind: PartKind; color: string; icon: string; hint: string }[];
}

// K-5 module weeds — each with its own cartoon part styling
const CASES: WeedCase[] = [
  {
    name: 'Dandelion',
    funFact: 'Its fluffy seed head is a natural parachute — one puff can send 200 seeds flying!',
    parts: {
      roots:  { color: '#a16207', hint: 'Long tap-root as deep as the plant is tall',      icon: 'taproot' },
      stem:   { color: '#65a30d', hint: 'Hollow, milky green stem',                         icon: 'hollow-stem' },
      leaves: { color: '#166534', hint: 'Jagged, "lion-tooth" leaves in a rosette',         icon: 'jagged-leaf' },
      flower: { color: '#facc15', hint: 'Bright yellow, round flower',                      icon: 'yellow-round' },
      seeds:  { color: '#e5e7eb', hint: 'White fluffy parachute puffball',                  icon: 'puffball' },
    },
    actual: { roots: 'taproot', stem: 'thick', leaves: 'jagged', flower: 'daisy', seeds: 'puff' },
  },
  {
    name: 'Giant Foxtail',
    funFact: 'Its seed head looks just like a fox\'s bushy tail!',
    parts: {
      roots:  { color: '#78716c', hint: 'Skinny fibrous grass roots',                       icon: 'fibrous' },
      stem:   { color: '#84cc16', hint: 'Tall, thin grass stalk',                           icon: 'grass-stalk' },
      leaves: { color: '#4d7c0f', hint: 'Long, ribbon-like grass blades',                   icon: 'grass-blade' },
      flower: { color: '#a3a3a3', hint: 'Grasses have tiny hidden flowers',                 icon: 'grass-flower' },
      seeds:  { color: '#d97706', hint: 'Fuzzy tan seed head like a fox tail',              icon: 'foxtail' },
    },
    actual: { roots: 'fibrous', stem: 'grass', leaves: 'blade', flower: 'lace', seeds: 'silky' },
  },
  {
    name: 'Canada Thistle',
    funFact: 'Sharp spines protect it — never touch it without gloves!',
    parts: {
      roots:  { color: '#7c2d12', hint: 'Creeping roots that spread sideways',              icon: 'creeping' },
      stem:   { color: '#4d7c0f', hint: 'Prickly, ridged stem',                             icon: 'prickly-stem' },
      leaves: { color: '#166534', hint: 'Spiny, pointy-edged leaves',                       icon: 'spiny-leaf' },
      flower: { color: '#c026d3', hint: 'Purple pom-pom flower',                            icon: 'pompom-purple' },
      seeds:  { color: '#f5f5f4', hint: 'White silky seeds that float on the wind',         icon: 'silky' },
    },
    actual: { roots: 'creeping', stem: 'prickly', leaves: 'jagged', flower: 'pompom', seeds: 'silky' },
  },
  {
    name: 'Common Milkweed',
    funFact: 'It\'s the ONLY plant Monarch caterpillars eat!',
    parts: {
      roots:  { color: '#a16207', hint: 'Deep tap-root anchors this tall plant',            icon: 'taproot' },
      stem:   { color: '#65a30d', hint: 'Thick stem that oozes white milky sap',            icon: 'thick-stem' },
      leaves: { color: '#14532d', hint: 'Big, oval-shaped smooth leaves',                   icon: 'oval-leaf' },
      flower: { color: '#f472b6', hint: 'Pink puff-ball cluster of tiny flowers',           icon: 'pink-cluster' },
      seeds:  { color: '#fde68a', hint: 'Bumpy pod that pops open with silky seeds',        icon: 'pod' },
    },
    actual: { roots: 'taproot', stem: 'thick', leaves: 'oval', flower: 'pompom', seeds: 'pod' },
  },
  {
    name: 'Lambsquarters',
    funFact: 'Its leaves have a "sugar-coated" look from tiny white powder!',
    parts: {
      roots:  { color: '#a16207', hint: 'Branching tap-root',                               icon: 'taproot' },
      stem:   { color: '#a3e635', hint: 'Grooved stem with red streaks',                    icon: 'grooved-stem' },
      leaves: { color: '#4ade80', hint: 'Diamond-shaped leaves dusted with white powder',   icon: 'powdered-leaf' },
      flower: { color: '#84cc16', hint: 'Tiny green flower clusters (no bright color!)',    icon: 'green-cluster' },
      seeds:  { color: '#1c1917', hint: 'Thousands of tiny shiny black seeds',              icon: 'black-seeds' },
    },
    actual: { roots: 'taproot', stem: 'thick', leaves: 'oval', flower: 'lace', seeds: 'silky' },
  },
  {
    name: 'Wild Carrot',
    funFact: 'Also called "Queen Anne\'s Lace" — its flower looks like fancy lace!',
    parts: {
      roots:  { color: '#f97316', hint: 'Skinny white-orange tap-root (like a mini carrot!)', icon: 'carrot-root' },
      stem:   { color: '#65a30d', hint: 'Hairy, ridged stem',                                 icon: 'hairy-stem' },
      leaves: { color: '#15803d', hint: 'Feathery, fern-like leaves',                         icon: 'feathery-leaf' },
      flower: { color: '#f9fafb', hint: 'Flat, lacy white flower cluster',                    icon: 'lace-flower' },
      seeds:  { color: '#78350f', hint: 'Bristly little brown seeds that cling to fur',       icon: 'bristly' },
    },
    actual: { roots: 'taproot', stem: 'thick', leaves: 'feathery', flower: 'lace', seeds: 'burry' },
  },
  {
    name: 'Field Bindweed',
    funFact: 'A "playground bully" — its vines twist around and choke other plants!',
    parts: {
      roots:  { color: '#78350f', hint: 'Roots go 10 feet deep and creep sideways',         icon: 'deep-roots' },
      stem:   { color: '#4ade80', hint: 'Twisty vine stem that climbs',                     icon: 'vine-stem' },
      leaves: { color: '#166534', hint: 'Arrowhead-shaped leaves',                          icon: 'arrow-leaf' },
      flower: { color: '#fce7f3', hint: 'Pink-and-white trumpet flower',                    icon: 'trumpet' },
      seeds:  { color: '#57534e', hint: 'Small dark seeds that stay alive 50+ years',       icon: 'small-dark' },
    },
    actual: { roots: 'creeping', stem: 'vine', leaves: 'oval', flower: 'trumpet', seeds: 'pod' },
  },
];

function shuffle<T>(a: T[]): T[] { return [...a].sort(() => Math.random() - 0.5); }

const ROUNDS_PER_LEVEL = 3;

// ---------- Cartoon part renderers -----------------------------------------
function PartCartoon({ kind, color, size = 90, variant = 'default' }: { kind: PartKind; color: string; size?: number; variant?: string }) {
  const s = size;
  switch (kind) {
    case 'roots': {
      if (variant === 'fibrous') return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <g stroke={color} strokeWidth={2.5} strokeLinecap="round" fill="none">
            {Array.from({ length: 12 }).map((_, i) => {
              const x = 20 + i * 5;
              const sway = ((i % 3) - 1) * 6;
              return <path key={i} d={`M${x} 15 Q ${x + sway} 55, ${x + sway * 1.5} 92`} />;
            })}
          </g>
          <rect x={18} y={10} width={64} height={6} rx={3} fill={color} />
        </svg>
      );
      if (variant === 'creeping') return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <g stroke={color} strokeWidth={4} strokeLinecap="round" fill="none">
            <path d="M5 30 Q 30 20, 55 32 T 98 28" />
            <path d="M8 55 Q 32 45, 60 55 T 96 50" />
            <path d="M6 80 Q 28 70, 52 82 T 96 78" />
            <path d="M25 30 L 22 90 M 55 32 L 58 90 M 85 28 L 82 88" />
          </g>
        </svg>
      );
      if (variant === 'tuber') return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <ellipse cx={50} cy={60} rx={30} ry={26} fill={color} />
          <ellipse cx={40} cy={52} rx={5} ry={3} fill={color} opacity={0.7} />
          <ellipse cx={60} cy={70} rx={4} ry={2.5} fill={color} opacity={0.7} />
          <g stroke={color} strokeWidth={3} strokeLinecap="round" fill="none">
            <path d="M45 35 Q 45 20, 40 8" />
            <path d="M55 35 Q 55 22, 60 10" />
            <path d="M30 80 Q 22 90, 15 96" />
            <path d="M70 80 Q 82 90, 90 95" />
          </g>
        </svg>
      );
      // taproot default
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <path d="M42 10 L 58 10 L 55 90 L 45 90 Z" fill={color} />
          <g stroke={color} strokeWidth={2.5} strokeLinecap="round" fill="none">
            <path d="M48 30 L 25 40" />
            <path d="M52 45 L 78 55" />
            <path d="M48 60 L 22 68" />
            <path d="M52 75 L 76 82" />
          </g>
        </svg>
      );
    }
    case 'stem': {
      if (variant === 'grass') return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <rect x={48} y={5} width={4} height={90} rx={2} fill={color} />
          <path d="M50 30 Q 30 30, 20 20" stroke={color} strokeWidth={2} fill="none" />
          <path d="M50 55 Q 70 55, 80 45" stroke={color} strokeWidth={2} fill="none" />
        </svg>
      );
      if (variant === 'vine') return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <path d="M50 95 Q 20 80, 50 60 Q 80 45, 50 25 Q 25 12, 50 5" stroke={color} strokeWidth={6} fill="none" strokeLinecap="round" />
          <circle cx={30} cy={72} r={4} fill={color} />
          <circle cx={70} cy={45} r={4} fill={color} />
        </svg>
      );
      if (variant === 'prickly') return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <rect x={42} y={8} width={16} height={84} rx={4} fill={color} />
          {Array.from({ length: 10 }).map((_, i) => (
            <g key={i}>
              <polygon points={`40,${15 + i * 8} 32,${18 + i * 8} 40,${21 + i * 8}`} fill={color} />
              <polygon points={`60,${15 + i * 8} 68,${18 + i * 8} 60,${21 + i * 8}`} fill={color} />
            </g>
          ))}
        </svg>
      );
      // thick default
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <rect x={44} y={8} width={12} height={84} rx={6} fill={color} />
          <ellipse cx={38} cy={40} rx={10} ry={5} fill={color} opacity={0.7} />
          <ellipse cx={62} cy={60} rx={10} ry={5} fill={color} opacity={0.7} />
        </svg>
      );
    }
    case 'leaves': {
      if (variant === 'jagged') return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <polygon points="50,10 62,25 78,22 68,40 88,50 68,60 78,78 62,75 50,90 38,75 22,78 32,60 12,50 32,40 22,22 38,25" fill={color} />
        </svg>
      );
      if (variant === 'feathery') return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <line x1={50} y1={10} x2={50} y2={90} stroke={color} strokeWidth={3} />
          {Array.from({ length: 8 }).map((_, i) => {
            const y = 18 + i * 9;
            const len = 12 + Math.sin(i) * 8;
            return (
              <g key={i}>
                <ellipse cx={50 - len / 2} cy={y} rx={len / 2} ry={3} fill={color} />
                <ellipse cx={50 + len / 2} cy={y} rx={len / 2} ry={3} fill={color} />
              </g>
            );
          })}
        </svg>
      );
      if (variant === 'blade') return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <path d="M50 5 Q 60 50, 55 95 L 45 95 Q 40 50, 50 5 Z" fill={color} />
          <line x1={50} y1={10} x2={50} y2={90} stroke="#0f3d1e" strokeWidth={1} opacity={0.4} />
        </svg>
      );
      // oval default
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <path d="M50 15 C 15 25, 15 70, 50 90 C 85 70, 85 25, 50 15 Z" fill={color} />
          <path d="M50 20 L 50 88" stroke="#0f3d1e" strokeWidth={2} opacity={0.5} />
          <path d="M50 40 L 30 45 M 50 55 L 30 62 M 50 40 L 70 45 M 50 55 L 70 62" stroke="#0f3d1e" strokeWidth={1.5} opacity={0.5} />
        </svg>
      );
    }
    case 'flower': {
      if (variant === 'trumpet') return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <path d="M20 20 L 80 20 L 60 80 L 40 80 Z" fill={color} stroke="#78350f" strokeWidth={2} />
          <ellipse cx={50} cy={22} rx={30} ry={8} fill={color} stroke="#78350f" strokeWidth={2} />
          <circle cx={50} cy={60} r={5} fill="#fbbf24" />
        </svg>
      );
      if (variant === 'pompom') return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          {Array.from({ length: 20 }).map((_, i) => {
            const a = (i / 20) * Math.PI * 2;
            const r = 30;
            return <circle key={i} cx={50 + Math.cos(a) * r} cy={50 + Math.sin(a) * r} r={9} fill={color} />;
          })}
          <circle cx={50} cy={50} r={20} fill={color} />
        </svg>
      );
      if (variant === 'lace') return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          {Array.from({ length: 18 }).map((_, i) => {
            const a = (i / 18) * Math.PI * 2;
            const r = 22 + (i % 3) * 6;
            return <circle key={i} cx={50 + Math.cos(a) * r} cy={50 + Math.sin(a) * r} r={4} fill={color} stroke="#78350f" strokeWidth={0.5} />;
          })}
          <circle cx={50} cy={50} r={4} fill={color} stroke="#78350f" strokeWidth={0.5} />
        </svg>
      );
      // daisy default
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          {[0, 72, 144, 216, 288].map((deg, i) => (
            <ellipse key={i} cx={50} cy={28} rx={14} ry={22} fill={color} transform={`rotate(${deg} 50 50)`} />
          ))}
          <circle cx={50} cy={50} r={12} fill="#fbbf24" stroke="#78350f" strokeWidth={2} />
        </svg>
      );
    }
    case 'seeds': {
      if (variant === 'pod') return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <path d="M20 50 Q 50 15, 80 50 Q 50 85, 20 50 Z" fill={color} stroke="#78350f" strokeWidth={2} />
          {[35, 50, 65].map((cx, i) => (
            <circle key={i} cx={cx} cy={50} r={5} fill="#78350f" />
          ))}
        </svg>
      );
      if (variant === 'silky') return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            const r = 30;
            return (
              <g key={i} transform={`translate(${50 + Math.cos(a) * r} ${50 + Math.sin(a) * r})`}>
                <path d={`M0 0 Q 3 ${-15}, 0 -25`} stroke={color} strokeWidth={2} fill="none" />
                <ellipse cx={0} cy={2} rx={2} ry={4} fill="#78350f" />
              </g>
            );
          })}
          <circle cx={50} cy={50} r={6} fill={color} />
        </svg>
      );
      if (variant === 'burry') return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <circle cx={50} cy={50} r={22} fill={color} />
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const r1 = 22, r2 = 38;
            const x1 = 50 + Math.cos(a) * r1, y1 = 50 + Math.sin(a) * r1;
            const x2 = 50 + Math.cos(a) * r2, y2 = 50 + Math.sin(a) * r2;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={2.5} strokeLinecap="round" />;
          })}
        </svg>
      );
      // puff default
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <circle cx={50} cy={50} r={22} fill={color} opacity={0.4} />
          {Array.from({ length: 10 }).map((_, i) => {
            const angle = (i / 10) * Math.PI * 2;
            const r = 30;
            return (
              <g key={i} transform={`translate(${50 + Math.cos(angle) * r} ${50 + Math.sin(angle) * r}) rotate(${(angle * 180) / Math.PI + 90})`}>
                <ellipse cx={0} cy={0} rx={3} ry={9} fill={color} />
                <line x1={0} y1={-6} x2={0} y2={-18} stroke={color} strokeWidth={1.5} />
              </g>
            );
          })}
          <circle cx={50} cy={50} r={6} fill={color} />
        </svg>
      );
    }
  }
}

// ---------- Round setup ----------------------------------------------------
interface PaletteItem { id: string; kind: PartKind; color: string; variant: string; label: string; }
interface Placement { kind: PartKind; color: string; variant: string; label: string; correct: boolean; }

function buildRound(caseIdx: number) {
  const c = CASES[caseIdx];
  // Offer every style option for every part kind so students can build a
  // custom plant. Any style placed in the matching slot counts as correct.
  const palette: PaletteItem[] = [];
  PART_ORDER.forEach((k) => {
    PART_STYLES[k].forEach((s) => {
      palette.push({ id: `${k}-${s.id}`, kind: k, color: s.color, variant: s.variant, label: s.label });
    });
  });
  return { case: c, palette: shuffle(palette) };
}

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

export default function PlantPartsHead({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [totalPossible, setTotalPossible] = useState(0);
  const [done, setDone] = useState(false);

  const [caseIdx, setCaseIdx] = useState(() => Math.floor(Math.random() * CASES.length));
  const [roundData, setRoundData] = useState(() => buildRound(Math.floor(Math.random() * CASES.length)));
  const [placements, setPlacements] = useState<Partial<Record<PartKind, Placement>>>({});
  const [usedIds, setUsedIds] = useState<Set<string>>(new Set());
  const [showResult, setShowResult] = useState(false);
  const [dragItem, setDragItem] = useState<PaletteItem | null>(null);

  const availablePalette = roundData.palette.filter(p => !usedIds.has(p.id));
  const slotsFilled = Object.keys(placements).length;

  function handleDrop(slot: PartKind) {
    if (!dragItem || placements[slot] || showResult) return;
    const correct = dragItem.kind === slot;
    setPlacements(p => ({ ...p, [slot]: { kind: dragItem.kind, correct, color: dragItem.color, variant: dragItem.variant, label: dragItem.label } }));
    setUsedIds(s => new Set([...s, dragItem.id]));
    setDragItem(null);
  }

  function removePlacement(slot: PartKind) {
    if (showResult) return;
    const placed = placements[slot];
    if (!placed) return;
    const paletteEntry = roundData.palette.find(p => p.kind === placed.kind && p.variant === placed.variant && usedIds.has(p.id));
    setPlacements(p => { const n = { ...p }; delete n[slot]; return n; });
    if (paletteEntry) setUsedIds(s => { const n = new Set(s); n.delete(paletteEntry.id); return n; });
  }

  function checkRound() {
    setShowResult(true);
  }

  const correctCount = Object.values(placements).filter(p => p?.correct).length;

  function nextRound() {
    const nextTotalScore = totalScore + correctCount;
    const nextTotalPossible = totalPossible + PART_ORDER.length;
    const nextRoundNum = round + 1;
    if (nextRoundNum >= ROUNDS_PER_LEVEL) {
      setTotalScore(nextTotalScore);
      setTotalPossible(nextTotalPossible);
      setDone(true);
      return;
    }
    setTotalScore(nextTotalScore);
    setTotalPossible(nextTotalPossible);
    setRound(nextRoundNum);
    const newIdx = Math.floor(Math.random() * CASES.length);
    setCaseIdx(newIdx);
    setRoundData(buildRound(newIdx));
    setPlacements({});
    setUsedIds(new Set());
    setShowResult(false);
  }

  function resetRound() {
    setPlacements({});
    setUsedIds(new Set());
    setShowResult(false);
  }

  function startOver() {
    setLevel(1); setRound(0); setTotalScore(0); setTotalPossible(0); setDone(false);
    const idx = Math.floor(Math.random() * CASES.length);
    setCaseIdx(idx); setRoundData(buildRound(idx));
    setPlacements({}); setUsedIds(new Set()); setShowResult(false);
  }
  function nextLevel() {
    setLevel(l => l + 1); setRound(0); setTotalScore(0); setTotalPossible(0); setDone(false);
    const idx = Math.floor(Math.random() * CASES.length);
    setCaseIdx(idx); setRoundData(buildRound(idx));
    setPlacements({}); setUsedIds(new Set()); setShowResult(false);
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
      />
    );
  }

  const c = roundData.case;

  return (
    <div className="fixed inset-0 bg-background z-40 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold">Level {level}</span>
            <span className="px-3 py-1 rounded-full bg-muted text-foreground font-semibold">Round {round + 1} / {ROUNDS_PER_LEVEL}</span>
            <span className="px-3 py-1 rounded-full bg-accent/20 text-accent-foreground font-semibold">Score {totalScore + (showResult ? correctCount : 0)}</span>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" /> Mr. Plant Head!
        </h1>
        <p className="text-muted-foreground mb-3">
          Drag each cartoon plant part onto the matching spot on <span className="font-bold text-foreground">{c.name}</span>. Each part has only one correct home!
        </p>

        <div className="mb-3 rounded-lg border-2 border-red-300 bg-red-50 p-3 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-800"><strong>Real-life rule:</strong> Never touch or pull a real weed unless a trusted adult says it's safe.</p>
        </div>

        <div className="grid md:grid-cols-[1fr,280px] gap-4">
          {/* Plant body with slots */}
          <div className="relative rounded-xl overflow-hidden border-4 border-green-800/40 shadow-lg"
               style={{ background: 'linear-gradient(180deg, #e0f2fe 0%, #dbeafe 60%, #a3d977 60%, #6b9d3f 100%)', aspectRatio: '5/6' }}>
            <svg viewBox="0 0 400 480" className="w-full h-full">
              {/* Ground line */}
              <line x1={0} y1={340} x2={400} y2={340} stroke="#3f6212" strokeWidth={3} strokeDasharray="6 4" />
              <text x={10} y={355} fontSize={12} fill="#3f6212" fontWeight={700}>SOIL LINE</text>

              {/* Slot markers */}
              {PART_ORDER.map(kind => {
                const pos = SLOT_POS[kind];
                const placed = placements[kind];
                return (
                  <g key={kind}>
                    <foreignObject
                      x={pos.x - 55}
                      y={pos.y - 55}
                      width={110}
                      height={110}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(kind)}
                    >
                      <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.preventDefault(); handleDrop(kind); }}
                        onClick={() => placed && removePlacement(kind)}
                        className={`w-full h-full flex items-center justify-center rounded-full border-4 transition-all ${
                          placed
                            ? showResult
                              ? placed.correct
                                ? 'border-green-500 bg-green-100/70'
                                : 'border-red-500 bg-red-100/70'
                              : 'border-primary/60 bg-white/70 cursor-pointer'
                            : 'border-dashed border-slate-400 bg-white/40 hover:bg-white/70'
                        }`}
                        style={{ boxShadow: placed ? '0 4px 12px rgba(0,0,0,0.15)' : 'none' }}
                      >
                        {placed ? (
                          <div className="relative">
                            <PartCartoon kind={placed.kind} color={placed.color} variant={placed.variant} size={90} />
                            {showResult && (
                              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center shadow" style={{ background: placed.correct ? '#16a34a' : '#dc2626' }}>
                                {placed.correct ? <Check className="w-4 h-4 text-white" /> : <X className="w-4 h-4 text-white" />}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-600 text-center px-2">
                            {pos.label}<br /><span className="text-[10px] font-normal opacity-70">drop here</span>
                          </span>
                        )}
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Parts palette */}
          <div className="space-y-3">
            <div className="rounded-lg border-2 border-border bg-card p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Today's Weed</p>
              <p className="text-lg font-bold text-foreground">{c.name}</p>
              <p className="text-xs text-muted-foreground mt-1 italic">"{c.funFact}"</p>
            </div>

            <div className="rounded-lg border-2 border-dashed border-border bg-card p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Parts Bin ({availablePalette.length})</p>
              {availablePalette.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">All parts used!</p>
              ) : (
                <div className="space-y-3">
                  {PART_ORDER.map(k => {
                    const options = availablePalette.filter(p => p.kind === k);
                    if (options.length === 0) return null;
                    return (
                      <div key={k}>
                        <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-1">{SLOT_POS[k].label}</p>
                        <div className="grid grid-cols-4 gap-1.5">
                          {options.map(p => (
                            <div
                              key={p.id}
                              draggable={!showResult}
                              onDragStart={() => setDragItem(p)}
                              onDragEnd={() => setDragItem(null)}
                              className={`aspect-square rounded-lg border-2 border-border bg-white flex items-center justify-center ${
                                showResult ? 'opacity-50' : 'cursor-grab active:cursor-grabbing hover:scale-105 hover:border-primary'
                              } transition-all`}
                              title={`Drag ${p.label} onto the plant`}
                            >
                              <PartCartoon kind={p.kind} color={p.color} variant={p.variant} size={44} />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {!showResult && slotsFilled === PART_ORDER.length && (
              <button
                onClick={checkRound}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:opacity-90"
              >
                Check My Plant!
              </button>
            )}

            {!showResult && (
              <button
                onClick={resetRound}
                className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground py-2 rounded border border-border"
              >
                <RotateCcw className="w-4 h-4" /> Reset Round
              </button>
            )}

            {showResult && (
              <div className="rounded-lg bg-primary/5 border-2 border-primary/30 p-3 space-y-2">
                <p className="font-bold text-foreground">Your {c.name} is built!</p>
                <p className="text-[11px] text-muted-foreground">Here's what the real {c.name} looks like:</p>
                <div className="text-xs space-y-1">
                  {PART_ORDER.map(k => {
                    const placed = placements[k];
                    const actualId = c.actual?.[k];
                    const actualStyle = actualId ? PART_STYLES[k].find(s => s.id === actualId) : null;
                    const matched = placed && actualStyle && placed.variant === actualStyle.variant;
                    return (
                      <div key={k} className="flex gap-1 items-start">
                        <span className="font-semibold text-foreground shrink-0">{SLOT_POS[k].label}:</span>
                        <span className="text-muted-foreground">
                          {c.parts[k].hint}
                          {actualStyle && (
                            <span className={`ml-1 font-semibold ${matched ? 'text-green-700' : 'text-amber-700'}`}>
                              ({matched ? '★ you matched it!' : `real: ${actualStyle.label}`})
                            </span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={nextRound}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold hover:opacity-90"
                >
                  Next Round <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <FarmerGuide
            tone="intro"
            message={`Build ${c.name}! Tip: click a placed part to send it back to the bin if you want to move it.`}
          />
        </div>
      </div>
    </div>
  );
}
