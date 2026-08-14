import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageCircle } from 'lucide-react';
import { usePracticeStore, type StoreBand } from '@/lib/practiceStore';

/**
 * Animated Weed Control Superhero.
 *
 * The same character students build in the K-5 store, but alive: it bobs,
 * blinks, waves, and its cape flutters. Used in the store preview and as a
 * floating buddy inside every practice game.
 */
export function HeroCharacter({
  ownedIds, className = '', animated = true, cheering = false,
}: { ownedIds: string[]; className?: string; animated?: boolean; cheering?: boolean }) {
  const has = (id: string) => ownedIds.includes(id);
  const helmet = has('k5-helmet');
  const cap = has('k5-hat') && !helmet;
  const suit = has('k5-suit');
  const vest = has('k5-vest');
  const gloves = has('k5-gloves');
  const boots = has('k5-boots');
  const cape = has('k5-cape');

  const idle = animated ? 'hero-bob' : '';

  return (
    <svg viewBox="0 0 200 260" className={className} role="img" aria-label="Your weed control superhero character">
      <style>{`
        @keyframes heroBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes heroWave { 0%,100% { transform: rotate(0deg); } 25% { transform: rotate(-26deg); } 60% { transform: rotate(10deg); } }
        @keyframes heroCape { 0%,100% { transform: skewX(0deg) scaleX(1); } 50% { transform: skewX(-7deg) scaleX(1.05); } }
        @keyframes heroBlink { 0%,92%,100% { transform: scaleY(1); } 96% { transform: scaleY(0.1); } }
        @keyframes heroCheer { 0%,100% { transform: translateY(0) rotate(0deg); } 30% { transform: translateY(-12px) rotate(-4deg); } 65% { transform: translateY(-4px) rotate(4deg); } }
        .hero-bob { animation: heroBob 2.6s ease-in-out infinite; transform-origin: 100px 200px; }
        .hero-cheer { animation: heroCheer 0.9s ease-in-out infinite; transform-origin: 100px 230px; }
        .hero-wave { animation: heroWave 2.2s ease-in-out infinite; transform-origin: 142px 112px; }
        .hero-cape-fly { animation: heroCape 2.4s ease-in-out infinite; transform-origin: 100px 95px; }
        .hero-eye { animation: heroBlink 4.5s linear infinite; transform-origin: center; transform-box: fill-box; }
      `}</style>
      <g className={cheering ? 'hero-cheer' : idle}>
        {cape && <path className={animated ? 'hero-cape-fly' : ''} d="M65 95 L40 215 L100 200 L160 215 L135 95 Z" fill="#fbbf24" opacity="0.9" />}
        {/* legs */}
        <rect x="83" y="175" width="14" height="52" rx="6" fill="#3f6212" />
        <rect x="103" y="175" width="14" height="52" rx="6" fill="#3f6212" />
        {/* boots */}
        <rect x="78" y={boots ? 214 : 222} width="24" height={boots ? 22 : 14} rx="6" fill={boots ? '#78350f' : '#1f2937'} />
        <rect x="98" y={boots ? 214 : 222} width="24" height={boots ? 22 : 14} rx="6" fill={boots ? '#78350f' : '#1f2937'} />
        {/* body */}
        <rect x="70" y="100" width="60" height="82" rx="20" fill={suit ? '#16a34a' : '#64748b'} />
        {vest && <rect x="72" y="104" width="56" height="60" rx="16" fill="#f59e0b" opacity="0.92" />}
        {vest && <rect x="72" y="126" width="56" height="8" fill="#e5e7eb" opacity="0.9" />}
        {suit && <circle cx="100" cy="128" r="13" fill="#ecfdf5" />}
        {suit && <path d="M100 121 c7 3 8 12 0 14 c-8 -2 -7 -11 0 -14 z" fill="#15803d" />}
        {/* left arm */}
        <rect x="48" y="106" width="20" height="62" rx="10" fill={suit ? '#16a34a' : '#64748b'} />
        <circle cx="58" cy="174" r="11" fill={gloves ? '#0ea5e9' : '#fcd9b6'} />
        {/* right arm waves */}
        <g className={animated ? 'hero-wave' : ''}>
          <rect x="132" y="106" width="20" height="62" rx="10" fill={suit ? '#16a34a' : '#64748b'} />
          <circle cx="142" cy="174" r="11" fill={gloves ? '#0ea5e9' : '#fcd9b6'} />
        </g>
        {/* head */}
        <circle cx="100" cy="72" r="28" fill="#fcd9b6" />
        <circle className={animated ? 'hero-eye' : ''} cx="91" cy="70" r="3.4" fill="#1f2937" />
        <circle className={animated ? 'hero-eye' : ''} cx="109" cy="70" r="3.4" fill="#1f2937" />
        <path d="M90 82 q10 9 20 0" stroke="#1f2937" strokeWidth="3" fill="none" strokeLinecap="round" />
        {cap && <><path d="M70 60 a30 30 0 0 1 60 0 z" fill="#0ea5e9" /><rect x="98" y="54" width="46" height="8" rx="4" fill="#0284c7" /></>}
        {helmet && <>
          <path d="M68 62 a32 32 0 0 1 64 0 z" fill="#22c55e" />
          <rect x="66" y="60" width="68" height="9" rx="4" fill="#15803d" />
          <path d="M100 20 c9 6 10 18 0 24 c-10 -6 -9 -18 0 -24 z" fill="#84cc16" />
        </>}
      </g>
    </svg>
  );
}

const CHEERS = [
  'Look closely at the leaves — shape is the best clue!',
  'Weed heroes never give up. Try one more!',
  'Nice scouting! Every weed you learn protects a crop.',
  'Remember: never touch a real weed unless a trusted adult says it is safe.',
  'Slow down and check the whole plant, not just the flower.',
  'Earn badges, earn coins — then upgrade my gear in the Store!',
  'Roots, stems, leaves, flowers, seeds. Weeds have them all!',
  'You are the field detective. I am just the sidekick!',
];

/**
 * Floating animated hero buddy that follows students through every practice
 * game. Collapsible so it never blocks gameplay.
 */
export default function HeroBuddy({
  band = 'k5', name = 'Your Weed Hero', tips,
}: { band?: StoreBand; name?: string; tips?: string[] }) {
  const store = usePracticeStore('k5');
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [cheering, setCheering] = useState(false);

  // Messages are game-specific when the hero is inside a game.
  const messages = useMemo(
    () => (tips && tips.length ? tips.filter(Boolean) : CHEERS),
    [tips]
  );

  // Pop a message up every so often, then tuck it away after 3 seconds so it
  // can never sit on top of Farmer Joe or any game controls.
  useEffect(() => {
    let hide: number | undefined;
    const show = () => {
      setIdx(i => (i + 1) % messages.length);
      setOpen(true);
      hide = window.setTimeout(() => setOpen(false), 3000);
    };
    const first = window.setTimeout(show, 1500);
    const loop = window.setInterval(show, 20000);
    return () => { window.clearTimeout(first); window.clearInterval(loop); if (hide) window.clearTimeout(hide); };
  }, [messages]);

  const owned = useMemo(() => store.ownedIds, [store.ownedIds]);

  const cheer = () => {
    setOpen(true);
    setCheering(true);
    setIdx(i => (i + 1) % messages.length);
    setTimeout(() => setCheering(false), 1400);
    setTimeout(() => setOpen(false), 3000);
  };

  if (typeof document === 'undefined') return null;

  const node = (
    <div className="fixed bottom-3 right-3 z-[2147483000] flex flex-col items-end gap-2 pointer-events-none print:hidden">
      {open && (
        <div className="pointer-events-auto relative max-w-[220px] rounded-2xl border-2 border-emerald-600 bg-emerald-50 dark:bg-emerald-950/95 backdrop-blur px-3 py-2 shadow-lg animate-scale-in">
          <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <MessageCircle className="w-3 h-3" /> {name}
            </p>
            <p className="text-xs text-foreground leading-snug">{messages[idx % messages.length]}</p>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Hide your weed hero" className="shrink-0 text-emerald-700 hover:text-emerald-900 dark:text-emerald-400">
            <X className="w-4 h-4" />
          </button>
          </div>
        </div>
      )}
      <button
        onClick={open ? () => setOpen(false) : cheer}
        aria-label={open ? 'Hide your weed hero' : 'Show your weed hero'}
        className="pointer-events-auto w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 border-2 border-emerald-600 shadow-lg flex items-center justify-center opacity-80 hover:opacity-100 hover:scale-105 transition-all"
      >
        <HeroCharacter ownedIds={owned} cheering={cheering} className="w-10 h-10" />
      </button>
    </div>
  );

  return createPortal(node, document.body);
}
