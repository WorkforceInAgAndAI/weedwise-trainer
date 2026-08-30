import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Hand, Shield, Brain, Bug, Zap, Sprout, Heart, Pause, Play as PlayIcon, ShieldAlert } from 'lucide-react';
import LevelComplete from '@/components/game/LevelComplete';
import FarmerGuide from '@/components/game/FarmerGuide';
import { getDifficulty } from '@/lib/difficulty';
import WeedImage from '@/components/game/WeedImage';

type PowerKey = 'pull' | 'block' | 'outsmart' | 'eat' | 'stop';

interface Cannon {
  key: PowerKey;
  name: string;
  power: string;
  blurb: string;
  Icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  cost: number;
  cooldownMs: number;
}

const CANNONS: Cannon[] = [
  { key: 'pull',     name: 'Pull It',     power: 'Super Strength',    blurb: 'Yank the weeds out by hand, roots and all.',        Icon: Hand,   color: 'text-orange-700', bg: 'bg-orange-100 border-orange-400',   cost: 1, cooldownMs: 500 },
  { key: 'block',    name: 'Block It',    power: 'Force Field',       blurb: 'Cover the soil so weed seeds never get sunlight.', Icon: Shield, color: 'text-sky-700',    bg: 'bg-sky-100 border-sky-400',         cost: 1, cooldownMs: 700 },
  { key: 'outsmart', name: 'Outsmart It', power: 'Brain Power',       blurb: 'Plant strong crops close together to crowd weeds out.', Icon: Brain, color: 'text-primary',  bg: 'bg-emerald-100 border-emerald-400', cost: 1, cooldownMs: 700 },
  { key: 'eat',      name: 'Swarm It',    power: 'Bug Buddies',       blurb: 'Send your bug buddies in to eat the weeds.',       Icon: Bug,    color: 'text-lime-700',   bg: 'bg-lime-100 border-lime-400',       cost: 2, cooldownMs: 900 },
  { key: 'stop',     name: 'Stop It',     power: 'Precision Blast',   blurb: 'Farmers spray a careful weed-control product.',    Icon: Zap,    color: 'text-yellow-700', bg: 'bg-yellow-100 border-yellow-400',   cost: 2, cooldownMs: 1100 },
];

interface WeedVillain {
  id: number;
  lane: number;         // 0..2
  pos: number;          // 0 (top) .. 100 (crops)
  speed: number;        // % per second
  weakness: PowerKey;
  name: string;
  hint: string;
  /** Real species photo shown on the advancing villain. */
  weedId: string;
  hp: number;
  maxHp: number;
  flash?: 'hit' | 'miss' | null;
}

interface Projectile {
  id: number;
  lane: number;
  weedId: number;       // target weed id
  cannonKey: PowerKey;
  fromPos: number;      // 0..100, where it starts (near crops)
  toPos: number;        // 0..100, weed position when fired
  startedAt: number;
}

// Weeds pulled from the K-5 "14 Weeds You Can Spot" curriculum with the
// weakness that matches the module's "5 ways to fight weeds" lesson.
const WEED_POOL: Omit<WeedVillain, 'id' | 'lane' | 'pos' | 'speed' | 'hp' | 'maxHp' | 'flash'>[] = [
  { name: 'Baby Dandelion',              weedId: 'Dandelion',       weakness: 'pull',     hint: 'Just a few young weeds — YANK them out!' },
  { name: 'Sleeping Lambsquarters Seeds',weedId: 'lambsquarters',   weakness: 'block',    hint: 'Weed seeds waiting for sunlight — mulch stops them!' },
  { name: 'Giant Foxtail Patch',         weedId: 'giant-foxtail',   weakness: 'outsmart', hint: 'Sneaking into row gaps — plant thicker crops!' },
  { name: 'Prickly Canada Thistle Hill', weedId: 'canada-thistle',  weakness: 'eat',      hint: 'Too steep for tractors — send in the hungry insects!' },
  { name: 'Field-Wide Waterhemp',        weedId: 'waterhemp',       weakness: 'stop',     hint: 'Millions of weeds across acres — precision spray!' },
  { name: 'One Big Burcucumber',         weedId: 'Burcucumber',     weakness: 'pull',     hint: 'A single grabby weed — pull it before it seeds!' },
  { name: 'Field Bindweed Seed Storm',   weedId: 'Field_bindweed',  weakness: 'block',    hint: 'Seeds on the wind — cover the soil!' },
  { name: 'Green Foxtail in Bare Spots', weedId: 'green-foxtail',   weakness: 'outsmart', hint: 'Thin crop rows let weeds in — outsmart the layout!' },
  { name: 'Pasture Common Ragweed',      weedId: 'common-ragweed',  weakness: 'eat',      hint: 'Big pasture — a swarm of leaf-munching bugs to the rescue!' },
  { name: 'Kochia Invasion',             weedId: 'kochia',          weakness: 'stop',     hint: 'Huge fields, tough weed — call the sprayer!' },
  { name: 'Young Velvetleaf',            weedId: 'velvetleaf',      weakness: 'pull',     hint: 'Small and young — pull by hand!' },
  { name: 'Yellow Nutsedge Seed Layer',  weedId: 'yellow-nutsedge', weakness: 'block',    hint: 'Block the sun so seeds cannot wake up!' },
];

interface Props { onBack: () => void; gameId?: string; gameName?: string; gradeLabel?: string; }

const LANES = 3;
const CROP_HP_START = 10;
const ENERGY_MAX = 12;
const ENERGY_REGEN = 2.6;   // per second
const PROJECTILE_MS = 320;  // travel time for a fired shot

export default function SquadDefense({ onBack, gameId, gameName, gradeLabel }: Props) {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [cropHp, setCropHp] = useState(CROP_HP_START);
  const [energy, setEnergy] = useState(ENERGY_MAX);
  const [weeds, setWeeds] = useState<WeedVillain[]>([]);
  const [selected, setSelected] = useState<PowerKey | null>(null);
  const [cooldowns, setCooldowns] = useState<Record<PowerKey, number>>({ pull: 0, block: 0, outsmart: 0, eat: 0, stop: 0 });
  const [defeated, setDefeated] = useState(0);
  const [escaped, setEscaped] = useState(0);
  const [running, setRunning] = useState(true);
  const [done, setDone] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; kind: 'good' | 'bad' } | null>(null);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);

  const nextId = useRef(1);
  const nextProjectileId = useRef(1);
  const spawnTimer = useRef(9999); // spawn the first weed immediately

  // Level tuning
  const diff = useMemo(() => getDifficulty(level, 'k5'), [level]);
  const config = useMemo(() => {
    // Gentle K-5 pacing: weeds march slowly and spawn far apart so students
    // have time to read each weakness badge before choosing a cannon.
    const spawnEverySec = Math.max(1.4, 2.8 - level * 0.15) / diff.speed;
    const speedMin = (3.0 + level * 0.5) * diff.speed;      // % per second
    const speedMax = (4.4 + level * 0.7) * diff.speed;
    const targetDefeated = 6 + level * 2;  // needed to win the level
    return { spawnEverySec, speedMin, speedMax, targetDefeated };
  }, [level, diff]);

  const fbTimeout = useRef<number | null>(null);
  const showFeedback = (text: string, kind: 'good' | 'bad') => {
    setFeedback({ text, kind });
    if (fbTimeout.current) window.clearTimeout(fbTimeout.current);
    fbTimeout.current = window.setTimeout(() => setFeedback(null), 1100);
  };

  // Main tick loop — drives weed advance (pos updates every animation frame)
  useEffect(() => {
    if (!running || done) return;
    let last = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;

      // energy regen
      setEnergy(e => Math.min(ENERGY_MAX, e + ENERGY_REGEN * dt));

      // cooldown decay
      setCooldowns(cd => {
        const out = { ...cd };
        (Object.keys(out) as PowerKey[]).forEach(k => { out[k] = Math.max(0, out[k] - dt * 1000); });
        return out;
      });

      // spawn
      spawnTimer.current += dt;
      if (spawnTimer.current >= config.spawnEverySec) {
        spawnTimer.current = 0;
        setWeeds(list => {
          // Never stack pictures: only spawn into a lane whose newest weed has
          // already marched well clear of the top of the field.
          const topOf = (lane: number) => {
            const inLane = list.filter(w => w.lane === lane);
            return inLane.length ? Math.min(...inLane.map(w => w.pos)) : 999;
          };
          const openLanes = [0, 1, 2].filter(l => topOf(l) > 26);
          if (!openLanes.length) return list;
          const lane = openLanes[Math.floor(Math.random() * openLanes.length)];
          const spec = WEED_POOL[Math.floor(Math.random() * WEED_POOL.length)];
          const speed = config.speedMin + Math.random() * (config.speedMax - config.speedMin);
          const hp = 1 + (Math.random() < 0.25 && level >= 2 ? 1 : 0);
          return [...list, {
            id: nextId.current++,
            lane,
            pos: 0,
            speed,
            hp,
            maxHp: hp,
            weakness: spec.weakness,
            name: spec.name,
            hint: spec.hint,
            weedId: spec.weedId,
            flash: null,
          }];
        });
      }

      // advance weeds — this is the only place `pos` changes, every frame,
      // so the villains steadily march toward the crop line.
      setWeeds(list => {
        let hpLoss = 0;
        let esc = 0;
        const kept: WeedVillain[] = [];
        for (const w of list) {
          const np = w.pos + w.speed * dt;
          if (np >= 100) {
            hpLoss += 1; esc += 1;
          } else {
            kept.push({ ...w, pos: np });
          }
        }
        if (hpLoss > 0) {
          setCropHp(hp => Math.max(0, hp - hpLoss));
          setEscaped(e => e + esc);
          showFeedback(`-${hpLoss} crop!`, 'bad');
        }
        return kept;
      });

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, done, config]);

  // Win/lose checks
  useEffect(() => {
    if (done) return;
    if (cropHp <= 0) { setDone(true); setRunning(false); }
    else if (defeated >= config.targetDefeated) { setDone(true); setRunning(false); }
  }, [cropHp, defeated, config.targetDefeated, done]);

  const resolveHit = (weedId: number, cannonKey: PowerKey) => {
    const hero = CANNONS.find(h => h.key === cannonKey)!;
    setWeeds(list => {
      const weed = list.find(w => w.id === weedId);
      if (!weed) return list;
      const match = hero.key === weed.weakness;
      if (match) {
        setScore(s => s + 10);
        setDefeated(d => d + 1);
        showFeedback(`${hero.name} saves the crops! +10`, 'good');
        window.setTimeout(() => setWeeds(l => l.filter(x => x.id !== weedId)), 220);
        return list.map(w => w.id === weedId ? { ...w, flash: 'hit', hp: 0 } : w);
      }
      // wrong power: chip 1 hp; if still alive, slow it a little; costs a small score penalty
      showFeedback(`Not quite — ${weed.name} needs a different cannon. Try again!`, 'bad');
      return list.map(w => {
        if (w.id !== weedId) return w;
        const nextHp = w.hp - 1;
        if (nextHp <= 0) {
          window.setTimeout(() => setWeeds(l => l.filter(x => x.id !== weedId)), 220);
          return { ...w, hp: 0, flash: 'miss' };
        }
        return { ...w, hp: nextHp, speed: Math.max(2, w.speed * 0.6), flash: 'miss' };
      });
    });
    window.setTimeout(() => setWeeds(list => list.map(w => w.id === weedId ? { ...w, flash: null } : w)), 300);
  };

  const fireOn = (weed: WeedVillain) => {
    if (!selected || done) { showFeedback('Arm a cannon first!', 'bad'); return; }
    const cannon = CANNONS.find(h => h.key === selected)!;
    if (cooldowns[cannon.key] > 0) { showFeedback(`${cannon.name} recharging…`, 'bad'); return; }
    if (energy < cannon.cost) { showFeedback('Not enough energy!', 'bad'); return; }
    setEnergy(e => e - cannon.cost);
    setCooldowns(cd => ({ ...cd, [cannon.key]: cannon.cooldownMs }));

    const projId = nextProjectileId.current++;
    setProjectiles(list => [...list, {
      id: projId,
      lane: weed.lane,
      weedId: weed.id,
      cannonKey: cannon.key,
      fromPos: 100,
      toPos: weed.pos,
      startedAt: performance.now(),
    }]);

    window.setTimeout(() => {
      setProjectiles(list => list.filter(p => p.id !== projId));
      resolveHit(weed.id, cannon.key);
    }, PROJECTILE_MS);
  };

  const restart = () => {
    nextId.current = 1; spawnTimer.current = 9999; // first weed appears right away
    setScore(0); setCropHp(CROP_HP_START); setEnergy(ENERGY_MAX); setWeeds([]);
    setSelected(null); setCooldowns({ pull: 0, block: 0, outsmart: 0, eat: 0, stop: 0 });
    setDefeated(0); setEscaped(0); setRunning(true); setDone(false); setFeedback(null);
    setProjectiles([]);
  };
  const nextLevel = () => { setLevel(l => l + 1); restart(); };

  if (done) {
    const won = cropHp > 0;
    return (
      <LevelComplete
        level={level}
        score={defeated}
        total={config.targetDefeated}
        onNextLevel={nextLevel}
        onStartOver={restart}
        onBack={onBack}
        title={won ? 'Squad Wins — Crops Saved!' : 'The crops need reinforcements — try again!'}
        gameId={gameId}
        gameName={gameName}
        gradeLabel={gradeLabel}
      />
    );
  }

  const laneWeeds = (n: number) => weeds.filter(w => w.lane === n);
  const laneProjectiles = (n: number) => projectiles.filter(p => p.lane === n);

  return (
    <div className="fixed top-[84px] inset-x-0 bottom-0 practice-game-extra-offset bg-background z-50 overflow-y-auto p-3 sm:p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-card border-2 border-primary/40 rounded-lg p-3 mb-3 flex items-center gap-3 flex-wrap">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground" aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Shield className="w-6 h-6 text-primary" />
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-lg text-foreground">Squad Defense</h1>
            <p className="text-xs text-muted-foreground truncate">Arm a cannon, aim at the matching weed, and fire — protect the crops from the weed wave!</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="px-2 py-1 rounded-full bg-primary/10 text-primary font-bold">Level {level}</span>
            <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">Score {score}</span>
            <button
              onClick={() => setRunning(r => !r)}
              className="p-1.5 rounded-full bg-muted hover:bg-muted/70 text-foreground"
              aria-label={running ? 'Pause' : 'Play'}
            >
              {running ? <Pause className="w-4 h-4" /> : <PlayIcon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div className="bg-card border border-border rounded-lg p-2">
            <div className="text-[10px] uppercase font-bold text-muted-foreground">Crop HP</div>
            <div className="flex items-center gap-1 mt-0.5">
              {Array.from({ length: CROP_HP_START }).map((_, i) => (
                <Heart key={i} className={`w-4 h-4 ${i < cropHp ? 'text-red-500 fill-red-500' : 'text-muted-foreground/40'}`} />
              ))}
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-2">
            <div className="text-[10px] uppercase font-bold text-muted-foreground">Energy</div>
            <div className="h-3 rounded-full bg-muted overflow-hidden mt-1">
              <div className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all" style={{ width: `${(energy / ENERGY_MAX) * 100}%` }} />
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{energy.toFixed(0)} / {ENERGY_MAX}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-2">
            <div className="text-[10px] uppercase font-bold text-muted-foreground">Weeds Beaten</div>
            <div className="text-lg font-bold text-emerald-700">{defeated} <span className="text-xs text-muted-foreground">/ {config.targetDefeated}</span></div>
          </div>
        </div>

        {/* Battlefield */}
        <div
          className="relative rounded-xl overflow-hidden border-2 border-emerald-800/40 shadow-lg"
          style={{ height: 'min(72vh, 640px)', minHeight: 480, background: 'linear-gradient(180deg, #a8d8b9 0%, #7dc290 55%, #4a8f5f 100%)' }}
        >
          {/* wave marker */}
          <div className="absolute inset-x-0 top-0 h-6 bg-red-500/10 border-b border-red-400/40 flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-red-800 z-10">
            Weed Wave Incoming
          </div>
          {/* lanes */}
          <div className="absolute inset-0 grid grid-cols-3 gap-0">
            {[0, 1, 2].map(l => (
              <div key={l} className="relative border-r last:border-r-0 border-emerald-900/10">
                {laneWeeds(l).map(w => {
                  const H = CANNONS.find(h => h.key === w.weakness)!;
                  const badgeState = w.flash === 'hit' ? 'scale-125 opacity-0' : w.flash === 'miss' ? 'animate-pulse ring-2 ring-red-500' : '';
                  return (
                    <button
                      key={w.id}
                      onClick={() => fireOn(w)}
                      className={`absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 ${badgeState}`}
                      style={{ top: `calc(24px + ${w.pos}% * 0.9)`, transition: w.flash ? 'transform 200ms, opacity 200ms' : 'none' }}
                    >
                      <div className="w-24 h-24 rounded-xl bg-white border-4 border-red-500 shadow-lg overflow-hidden relative">
                        <WeedImage weedId={w.weedId} stage="flower" className="w-full h-full object-cover" />
                        {w.maxHp > 1 && (
                          <div className="absolute -top-1 -right-1 text-[10px] font-bold text-red-900 bg-white rounded-full w-4 h-4 flex items-center justify-center border border-red-400">{w.hp}</div>
                        )}
                      </div>
                      <div className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white bg-black/60 flex items-center gap-0.5 border ${H.color.replace('text-','border-')}`}>
                        <H.Icon className="w-2.5 h-2.5" /> {H.name}
                      </div>
                      <div className="text-[9px] font-bold text-red-950 bg-white/85 px-1.5 py-0.5 rounded max-w-[130px] text-center truncate">
                        {w.name}
                      </div>
                    </button>
                  );
                })}

                {/* projectiles: fired shots traveling up toward their target */}
                {laneProjectiles(l).map(p => {
                  const C = CANNONS.find(h => h.key === p.cannonKey)!;
                  return (
                    <div
                      key={p.id}
                      className="absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none"
                      style={{
                        top: `calc(24px + ${p.toPos}% * 0.9)`,
                        animation: `squad-defense-shot ${PROJECTILE_MS}ms linear forwards`,
                        // custom props consumed by the keyframes below
                        // @ts-ignore -- CSS custom properties
                        '--from-top': `calc(24px + ${p.fromPos}% * 0.9)`,
                      } as React.CSSProperties}
                    >
                      <div className={`w-7 h-7 rounded-full bg-white border-2 shadow-md flex items-center justify-center ${C.color} ${C.bg.split(' ')[1]}`}>
                        <C.Icon className="w-4 h-4" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* crops row (defense line) */}
          <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-amber-900/50 to-transparent border-t-4 border-amber-800/60 flex items-end justify-around px-2 pb-1 z-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <Sprout key={i} className={`w-8 h-8 ${cropHp > 0 ? 'text-emerald-700' : 'text-stone-500'} drop-shadow`} />
            ))}
          </div>

          {/* feedback banner */}
          {feedback && (
            <div className={`absolute top-8 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full font-bold text-sm shadow-lg animate-scale-in z-30 ${feedback.kind === 'good' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
              {feedback.text}
            </div>
          )}
        </div>

        {/* Local keyframes for the projectile travel animation */}
        <style>{`
          @keyframes squad-defense-shot {
            from { top: var(--from-top); opacity: 1; }
            to   { opacity: 1; }
          }
        `}</style>

        {/* Cannon deck */}
        <div className="mt-3">
          <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1">
            {selected ? `Cannon armed: ${CANNONS.find(h => h.key === selected)!.name} — tap a weed to fire!` : 'Arm a cannon, then tap a weed with the matching label.'}
          </div>
          <div className="grid grid-cols-5 gap-2">
            {CANNONS.map(h => {
              const cd = cooldowns[h.key];
              const cdPct = Math.max(0, Math.min(100, (cd / h.cooldownMs) * 100));
              const disabled = cd > 0 || energy < h.cost;
              const isSel = selected === h.key;
              return (
                <button
                  key={h.key}
                  onClick={() => setSelected(isSel ? null : h.key)}
                  disabled={disabled}
                  aria-label={`${h.name} cannon`}
                  className={`relative overflow-hidden p-2 rounded-lg border-2 transition-all text-center ${h.bg} ${isSel ? 'ring-4 ring-primary scale-[1.03]' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                >
                  {cd > 0 && (
                    <div className="absolute inset-x-0 bottom-0 bg-black/40" style={{ height: `${cdPct}%` }} />
                  )}
                  {/* little cannon body: barrel + base, colored by power */}
                  <div className={`relative z-10 mx-auto w-11 h-9 flex flex-col items-center justify-end`}>
                    <div className={`w-4 h-5 rounded-t-full border-2 border-current ${h.color} bg-white`} />
                    <div className={`w-9 h-3 rounded-md border-2 border-current ${h.color} bg-white -mt-0.5 flex items-center justify-center`}>
                      <h.Icon className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="relative z-10 text-xs font-bold text-foreground mt-1">{h.name}</div>
                  <div className="relative z-10 text-[9px] uppercase tracking-wider text-muted-foreground">{h.power}</div>
                  <div className="relative z-10 text-[10px] text-foreground/80 leading-tight mt-0.5">{h.blurb}</div>
                  <div className="relative z-10 text-[10px] font-bold text-amber-800 mt-0.5">⚡ {h.cost}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Safety banner */}
        <div className="mt-3 bg-red-50 border-2 border-red-300 rounded-lg p-2 flex items-center gap-2 text-xs text-red-900">
          <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span><strong>Safety first:</strong> Never touch a real weed unless a trusted adult says it is safe. Some can sting, prick, or be toxic!</span>
        </div>

        <div className="mt-2 text-center text-[11px] text-muted-foreground">
          Weeds escaped: <span className="font-bold text-foreground">{escaped}</span>
        </div>
      </div>

      <FarmerGuide message="Arm the cannon that matches the weed's weakness, then tap the weed to fire! Wrong cannons still chip them a little — but the RIGHT cannon wipes the weed out in one hit." />
    </div>
  );
}
