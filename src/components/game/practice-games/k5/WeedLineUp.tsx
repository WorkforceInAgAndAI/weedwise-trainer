import { useMemo, useState } from 'react';
import { weeds } from '@/data/weeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';
import { ShieldAlert, Fingerprint, Gavel } from 'lucide-react';

const shuffle = <T,>(a: T[]): T[] => [...a].sort(() => Math.random() - 0.5);

// A "case file" for the Weed Line-Up. Each case has:
//  criminalId: the bad-weed that must be picked out of the lineup
//  lineupIds: 3 look-alike suspects (must include criminalId)
//  crime: what the bad weed is wanted for (kid-friendly)
//  tell: the visible clue in the "sketch" that only matches the criminal
//  verdict: short explanation shown after the arrest
interface Case {
 criminalId: string;
 lineupIds: string[];
 crime: string;
 tell: string;
 verdict: string;
}

const CASES: Case[] = [
 {
  criminalId: 'poison-hemlock',
  lineupIds: ['poison-hemlock', 'Wild_Carrot', 'golden-alexanders'],
  crime: 'Wanted for being one of the most POISONOUS plants in the field',
  tell: 'Smooth stem with dark PURPLE SPOTS and a musty smell — no hairs',
  verdict: 'Poison Hemlock has purple-spotted smooth stems. Wild carrot has a hairy stem, and Golden Alexanders has yellow flowers. Never touch this plant!',
 },
 {
  criminalId: 'wild-parsnip',
  lineupIds: ['wild-parsnip', 'golden-alexanders', 'Wild_Carrot'],
  crime: 'Wanted for SAP that burns skin in the sunshine',
  tell: 'YELLOW flat-topped flowers on a tall smooth stem with grooves',
  verdict: 'Wild Parsnip has yellow umbels and sap that burns. Golden Alexanders is a safe native yellow. Wild carrot has WHITE flowers.',
 },
 {
  criminalId: 'Jimsonweed',
  lineupIds: ['Jimsonweed', 'Horsenettle', 'Eastern_black_nightshade'],
  crime: 'Wanted for TOXIC trumpet flowers and spiky seed pods',
  tell: 'Big white or purple TRUMPET flower and a SPIKY egg-shaped seed pod',
  verdict: 'Jimsonweed has huge trumpet flowers and spiny pods. All parts are toxic!',
 },
 {
  criminalId: 'palmer-amaranth',
  lineupIds: ['palmer-amaranth', 'waterhemp', 'Redroot_pigweed'],
  crime: 'Wanted for CROP-CROWDING — grows 2 inches a day in soybean fields',
  tell: 'SMOOTH (no hairs) stem, super long leaf stalks, and a very long prickly seed spike',
  verdict: 'Palmer amaranth has hairless stems and long leaf stalks. Redroot pigweed has a HAIRY stem. Waterhemp has skinny willow-like leaves.',
 },
 {
  criminalId: 'Buffalobur',
  lineupIds: ['Buffalobur', 'Horsenettle', 'Smooth_Groundcherry'],
  crime: 'Wanted for SHARP SPINES all over its stems and leaves',
  tell: 'YELLOW flowers and a bur covered in prickles — spines EVERYWHERE',
  verdict: 'Buffalobur is spiny all over with yellow flowers. Horsenettle has white-purple flowers and orange berries. Groundcherry has a papery lantern husk.',
 },
 {
  criminalId: 'Field_bindweed',
  lineupIds: ['Field_bindweed', 'Hedge_bindweed', 'Tall_morningglory'],
  crime: 'Wanted for STRANGLING crops with its twisting vines',
  tell: 'SMALL white or pink trumpet and ARROWHEAD-shaped leaves',
  verdict: 'Field bindweed has small flowers and arrowhead leaves. Hedge bindweed is bigger. Morningglory has heart-shaped leaves.',
 },
 {
  criminalId: 'canada-thistle',
  lineupIds: ['canada-thistle', 'Musk_thistle', 'Common_Burdock'],
  crime: 'Wanted for SPREADING underground and taking over pastures',
  tell: 'MANY small purple flower heads clustered together on one plant',
  verdict: 'Canada thistle spreads by creeping roots and has clusters of small heads. Musk thistle has ONE big nodding head. Burdock has round hooked burs.',
 },
 {
  criminalId: 'giant-ragweed',
  lineupIds: ['giant-ragweed', 'common-ragweed', 'velvetleaf'],
  crime: 'Wanted for TOWERING over crops and causing allergies',
  tell: 'Very TALL plant with big 3–5 lobed leaves shaped like a hand',
  verdict: 'Giant ragweed has huge hand-shaped leaves. Common ragweed has feathery leaves. Velvetleaf has heart-shaped fuzzy leaves.',
 },
 {
  criminalId: 'Horsenettle',
  lineupIds: ['Horsenettle', 'Eastern_black_nightshade', 'Smooth_Groundcherry'],
  crime: 'Wanted for TOXIC orange berries and spiny stems',
  tell: 'STAR-shaped white-purple flowers and prickles on the stem',
  verdict: 'Horsenettle is spiny with orange berries. Black nightshade has no spines and black berries. Groundcherry has a papery husk.',
 },
 {
  criminalId: 'Downy_brome',
  lineupIds: ['Downy_brome', 'Quackgrass', 'Foxtail_barley'],
  crime: 'Wanted for turning DRY and starting wildfires in fields',
  tell: 'HAIRY all over with a DROOPING soft seed head',
  verdict: 'Downy brome (cheatgrass) is hairy with a droopy head. Quackgrass has clasping auricles and rhizomes. Foxtail barley has long bristly awns.',
 },
];

const CASES_PER_LEVEL = 4;

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string }

export default function WeedLineUp({ onBack, gameId, gameName, gradeLabel }: Props) {
 const [level, setLevel] = useState(1);
 const [round, setRound] = useState(0);
 const [score, setScore] = useState(0);
 const [picked, setPicked] = useState<string | null>(null);

 const roundCases = useMemo(() => {
  const offset = ((level - 1) * CASES_PER_LEVEL) % CASES.length;
  const rotated = [...CASES.slice(offset), ...CASES.slice(0, offset)];
  return shuffle(rotated).slice(0, CASES_PER_LEVEL);
 }, [level]);

 const c = roundCases[round];
 const lineup = useMemo(() => (c ? shuffle(c.lineupIds) : []), [c]);

 const done = round >= roundCases.length;
 if (done) {
  return (
   <LevelComplete
    level={level}
    score={score}
    total={roundCases.length}
    onNextLevel={() => { setLevel(l => l + 1); setRound(0); setScore(0); setPicked(null); }}
    onStartOver={() => { setLevel(1); setRound(0); setScore(0); setPicked(null); }}
    onBack={onBack}
    gameId={gameId}
    gameName={gameName}
    gradeLabel={gradeLabel}
   />
  );
 }

 const criminal = weeds.find(w => w.id === c.criminalId);
 const isCorrect = picked === c.criminalId;

 const submit = (id: string) => {
  if (picked) return;
  setPicked(id);
  if (id === c.criminalId) setScore(s => s + 1);
 };

 const next = () => { setRound(r => r + 1); setPicked(null); };

 return (
  <div className="fixed inset-0 bg-background z-50 flex flex-col">
   <div className="flex items-center gap-3 p-4 border-b border-border">
    <button onClick={onBack} className="text-muted-foreground hover:text-foreground text-xl">←</button>
    <Fingerprint className="w-5 h-5 text-primary" />
    <h1 className="font-bold text-foreground text-lg flex-1">Weed Line-Up</h1>
    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">Lv.{level}</span>
    <span className="text-sm text-muted-foreground">Case {round + 1}/{roundCases.length}</span>
   </div>

   {/* Safety banner */}
   <div className="bg-red-50 dark:bg-red-950/40 border-b-2 border-red-500 px-4 py-2 flex items-center gap-2">
    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
    <p className="text-xs text-red-900 dark:text-red-100 font-medium">
     Never touch a mystery weed unless a trusted adult tells you it is safe.
    </p>
   </div>

   <div className="flex-1 overflow-y-auto p-4">
    <div className="max-w-4xl mx-auto space-y-4">
     {/* Case file */}
     <div className="rounded-xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/30 p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-amber-700 dark:text-amber-300 mb-1">Case File · Detective's Report</p>
      <p className="text-base font-bold text-foreground mb-2">{c.crime}</p>
      <p className="text-sm text-foreground">
       <span className="font-bold">Eyewitness clue:</span> {c.tell}
      </p>
     </div>

     {/* Sketch + Lineup */}
     <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4 items-start">
      {/* Suspect sketch */}
      <div className="rounded-xl border-4 border-dashed border-foreground/70 bg-neutral-100 dark:bg-neutral-900 p-3">
       <p className="text-[10px] font-black uppercase tracking-widest text-center text-foreground mb-2">Suspect Sketch</p>
        <div className="aspect-square rounded-md overflow-hidden bg-neutral-200 dark:bg-neutral-800">
        {criminal && (
         <div className="w-full h-full" style={{ filter: 'grayscale(1) contrast(1.6) brightness(0.95)' }}>
          <WeedImage weedId={criminal.id} stage="flower" preferredVariant={1} className="w-full h-full object-cover mix-blend-multiply" />
         </div>
        )}
       </div>
       <p className="text-[10px] text-center text-muted-foreground mt-2 italic">Rough sketch — no colors, no name</p>
      </div>

      {/* Line-Up */}
      <div>
       <p className="text-xs font-black uppercase tracking-widest text-foreground mb-2 text-center">The Line-Up · Pick the Bad Weed</p>
       <div className="grid grid-cols-3 gap-3">
        {lineup.map((id, i) => {
         const w = weeds.find(x => x.id === id)!;
         const isThis = picked === id;
         const isBad = id === c.criminalId;
         const showResult = picked !== null;
         return (
          <button
           key={id}
           onClick={() => submit(id)}
           disabled={!!picked}
           className={`rounded-xl border-4 overflow-hidden transition-all bg-card text-left ${
            !picked ? 'border-border hover:border-primary hover:scale-105' : ''
           } ${showResult && isBad ? 'border-green-500 ring-2 ring-green-500' : ''} ${
            showResult && isThis && !isBad ? 'border-destructive ring-2 ring-destructive' : ''
           }`}
          >
           <div className="relative aspect-square bg-neutral-800">
            <WeedImage weedId={id} stage="flower" preferredVariant={2} className="w-full h-full object-cover" />
            {/* mugshot height chart */}
            <div className="absolute inset-y-0 left-0 w-3 bg-gradient-to-b from-white/90 via-white/60 to-white/90 flex flex-col justify-between py-1">
             {[0,1,2,3,4].map(n => <div key={n} className="h-px bg-black/70" />)}
            </div>
            <div className="absolute top-1 right-1 bg-black text-white text-[10px] font-black px-1.5 py-0.5 rounded">
             #{i + 1}
            </div>
           </div>
           <div className="p-2 text-center">
            {showResult ? (
             <p className={`text-xs font-bold ${isBad ? 'text-green-600' : 'text-foreground'}`}>{w.commonName}</p>
            ) : (
             <p className="text-[10px] font-mono uppercase text-muted-foreground">Suspect #{i + 1}</p>
            )}
           </div>
          </button>
         );
        })}
       </div>
      </div>
     </div>

     {/* Verdict */}
     {picked && (
      <div className={`rounded-xl border-2 p-4 ${isCorrect ? 'border-green-500 bg-green-500/10' : 'border-destructive bg-destructive/10'}`}>
       <div className="flex items-center gap-2 mb-2">
        <Gavel className={`w-5 h-5 ${isCorrect ? 'text-green-600' : 'text-destructive'}`} />
        <p className={`text-lg font-black ${isCorrect ? 'text-green-600' : 'text-destructive'}`}>
         {isCorrect ? `GUILTY! ${criminal?.commonName} arrested.` : `Innocent! You picked the wrong suspect.`}
        </p>
       </div>
       <p className="text-sm text-foreground">{c.verdict}</p>
       <button onClick={next} className="mt-3 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-bold">
        {round + 1 < roundCases.length ? 'Next Case →' : 'Close the File'}
       </button>
      </div>
     )}
    </div>
   </div>

   <FloatingCoach grade="K-5" tip={`Detective tip: read the clue, then hunt for that feature in the line-up. Some suspects look almost the same — study every mugshot before you decide.`} />
  </div>
 );
}
