import { useState, useMemo, useEffect } from 'react';
import { collegiateWeeds as weeds } from '@/data/gradeWeeds';
import WeedImage from '@/components/game/WeedImage';
import LevelComplete from '@/components/game/LevelComplete';
import FloatingCoach from '@/components/game/FloatingCoach';
import { getDifficulty } from '@/lib/difficulty';
import { Landmark, TrendingDown, TrendingUp, CloudRain, Sun, Tractor, Sprout } from 'lucide-react';

const SEASONS = 5;

type ConditionId = 'wet' | 'dry' | 'tillage' | 'normal';

interface Condition {
  id: ConditionId;
  name: string;
  note: string;
  /** fraction of the seed bank that germinates this season */
  germ: number;
  Icon: typeof CloudRain;
}

const CONDITIONS: Condition[] = [
  { id: 'wet', name: 'Wet Spring', note: 'Lots of seeds have favorable conditions to germinate — more weeds emerge, so more seeds leave the bank.', germ: 0.30, Icon: CloudRain },
  { id: 'dry', name: 'Dry Spring', note: 'Fewer seeds germinate. The field looks clean — but the seeds are still in the bank!', germ: 0.10, Icon: Sun },
  { id: 'tillage', name: 'Soil Disturbance', note: 'Tillage moved buried seeds near the surface. The balance did not change — but access to the account did.', germ: 0.26, Icon: Tractor },
  { id: 'normal', name: 'Average Spring', note: 'A typical season. A normal share of the seed bank germinates.', germ: 0.20, Icon: Sprout },
];

interface Practice {
  id: string;
  name: string;
  cost: number;
  /** share of emerged weeds stopped before they set seed */
  control: number;
  blurb: string;
}

const PRACTICES: Practice[] = [
  { id: 'cultivate', name: 'Cultivation', cost: 500, control: 0.45, blurb: 'Controls many emerged weeds between the rows.' },
  { id: 'cover', name: 'Cover Crop', cost: 800, control: 0.35, blurb: 'Suppresses emergence and shades out small weeds.' },
  { id: 'hand', name: 'Hand Weeding', cost: 300, control: 0.20, blurb: 'Great for small patches and escapes.' },
  { id: 'crop', name: 'Competitive Crop', cost: 700, control: 0.30, blurb: 'A thick, fast canopy helps the crop beat the weeds.' },
];

interface Statement {
  year: number;
  start: number;
  withdrawals: number;
  deposits: number;
  end: number;
  condition: string;
  spent: number;
}


const INTRO_SLIDES = [
  {
    Icon: Landmark,
    title: 'Welcome to the Weed Bank',
    body: 'Every field has a hidden bank account: the weed seed bank in the soil. You have just been hired to manage Field 12N for Farmer Sam. Your job is to shrink that balance over 5 seasons.',
  },
  {
    Icon: TrendingDown,
    title: 'Withdrawals shrink the bank',
    body: 'Seeds leave the bank when they germinate, get eaten, or lose viability. Every weed that sprouts is a withdrawal — as long as you kill it before it flowers.',
  },
  {
    Icon: TrendingUp,
    title: 'Deposits grow the bank',
    body: 'Any weed that escapes control and sets seed makes a huge deposit — one plant can return thousands of seeds. Escapes are what break the account.',
  },
  {
    Icon: Tractor,
    title: 'How each season works',
    body: '1. Read the Farm Conditions card — weather and tillage change how many seeds germinate.\n2. Spend your Farm Dollars on management practices.\n3. Run the season and read your bank statement.\nAfter 5 seasons, you are ranked on how much you shrank the seed bank.',
  },
];

const fmt = (n: number) => n.toLocaleString();

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

export default function WeedBank({ onBack }: { onBack: () => void }) {
  const [level, setLevel] = useState(1);
  const diff = useMemo(() => getDifficulty(level, 'ms'), [level]);

  // Harder levels: bigger starting bank, smaller yearly budget, seedier weeds
  const startBalance = 10000 + (level - 1) * 4000;
  const budget = Math.max(700, 1500 - (level - 1) * 150);

  const [balance, setBalance] = useState(startBalance);
  const [year, setYear] = useState(1);
  const [condition, setCondition] = useState<Condition>(() => pick(CONDITIONS));
  const [selected, setSelected] = useState<string[]>([]);
  const [phase, setPhase] = useState<'plan' | 'result' | 'done'>('plan');
  const [last, setLast] = useState<Statement | null>(null);
  const [history, setHistory] = useState<Statement[]>([]);
  const [featured, setFeatured] = useState(() => pick(weeds));
  const [runId, setRunId] = useState(0);
  const [introStep, setIntroStep] = useState(0);

  useEffect(() => {
    setBalance(startBalance);
    setYear(1);
    setHistory([]);
    setLast(null);
    setSelected([]);
    setPhase('plan');
    setCondition(pick(CONDITIONS));
    setFeatured(pick(weeds));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level, runId]);

  const spent = selected.reduce((s, id) => s + (PRACTICES.find(p => p.id === id)?.cost ?? 0), 0);
  const remaining = budget - spent;

  const toggle = (p: Practice) => {
    if (phase !== 'plan') return;
    setSelected(prev => prev.includes(p.id)
      ? prev.filter(x => x !== p.id)
      : (p.cost <= remaining ? [...prev, p.id] : prev));
  };

  const runSeason = () => {
    const germinated = Math.round(balance * condition.germ);
    const naturalLoss = Math.round(balance * 0.07); // seeds die / lose viability / are eaten
    const control = Math.min(0.95, selected.reduce((s, id) => s + (PRACTICES.find(p => p.id === id)?.control ?? 0), 0));
    const survivors = Math.round(germinated * (1 - control));
    // each escaped weed returns a big deposit of new seed
    const seedsPerEscape = 6 + Math.floor(level / 2);
    const deposits = survivors * seedsPerEscape;
    const withdrawals = germinated + naturalLoss;
    const end = Math.max(0, balance - withdrawals + deposits);

    const stmt: Statement = { year, start: balance, withdrawals, deposits, end, condition: condition.name, spent };
    setLast(stmt);
    setHistory(h => [...h, stmt]);
    setBalance(end);
    setPhase('result');
  };

  const nextYear = () => {
    if (year >= SEASONS) { setPhase('done'); return; }
    setYear(y => y + 1);
    setCondition(pick(CONDITIONS));
    setFeatured(pick(weeds));
    setSelected([]);
    setPhase('plan');
  };

  const reduction = startBalance > 0 ? (startBalance - balance) / startBalance : 0;
  const score = Math.max(0, Math.round(reduction * 100));
  const rank = reduction >= 0.6 ? '🥇 Seed Bank Master' : reduction >= 0.25 ? '🥈 Weed Warrior' : reduction > 0 ? '🥉 Farm in Training' : 'Seed Bank Grew — Try a New Strategy';

  const maxBar = Math.max(startBalance, ...history.map(h => h.end), balance, 1);

  // --- Intro walkthrough: sets up the storyline every time the game opens ---
  if (introStep < INTRO_SLIDES.length) {
    const slide = INTRO_SLIDES[introStep];
    const SlideIcon = slide.Icon;
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-emerald-950 via-emerald-900 to-amber-950 p-4">
        <div className="max-w-xl mx-auto mt-4">
          <div className="rounded-2xl border-2 border-amber-400/60 bg-card shadow-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-primary text-primary-foreground">
              <Landmark className="w-6 h-6" />
              <p className="text-sm font-black tracking-wide">FIRST NATIONAL WEED BANK</p>
              <button onClick={onBack} className="ml-auto text-[11px] font-bold underline underline-offset-2">Exit</button>
            </div>
            <div className="p-6 text-center">
              <SlideIcon className="w-12 h-12 mx-auto text-primary mb-3" />
              <h2 className="text-xl font-black text-foreground mb-2">{slide.title}</h2>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{slide.body}</p>
              <div className="flex items-center justify-center gap-1.5 my-5">
                {INTRO_SLIDES.map((_, i) => (
                  <span key={i} className={`h-2 rounded-full transition-all ${i === introStep ? 'w-6 bg-primary' : 'w-2 bg-muted'}`} />
                ))}
              </div>
              <div className="flex gap-2 justify-center">
                {introStep > 0 && (
                  <button onClick={() => setIntroStep(s => s - 1)} className="px-4 py-2 rounded-full border-2 border-border font-bold text-foreground">Back</button>
                )}
                <button onClick={() => setIntroStep(s => s + 1)} className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-bold">
                  {introStep === INTRO_SLIDES.length - 1 ? 'Open my account →' : 'Next →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-emerald-950 via-emerald-900 to-amber-950 p-3 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-3">
        {/* Bank header */}
        <div className="rounded-xl border-2 border-amber-400/60 bg-card shadow-lg overflow-hidden">
          <div className="flex items-center justify-between gap-2 px-4 py-3 bg-primary text-primary-foreground">
            <div className="flex items-center gap-2">
              <Landmark className="w-6 h-6" />
              <div>
                <p className="text-sm font-black tracking-wide">FIRST NATIONAL WEED BANK</p>
                <p className="text-[10px] opacity-80">Account holder: Farmer Sam · Field 12N</p>
              </div>
            </div>
            <button onClick={onBack} className="text-[11px] font-bold underline underline-offset-2">Exit</button>
          </div>

          <div className="grid grid-cols-3 gap-2 p-4">
            <div className="col-span-3 sm:col-span-1 rounded-lg border-2 border-border bg-secondary p-3">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Current Balance</p>
              <p className="text-2xl font-black text-foreground tabular-nums">{fmt(balance)}</p>
              <p className="text-[10px] text-muted-foreground">weed seeds in the soil</p>
            </div>
            <div className="rounded-lg border-2 border-border bg-secondary p-3">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Season</p>
              <p className="text-2xl font-black text-foreground">{year}/{SEASONS}</p>
            </div>
            <div className="rounded-lg border-2 border-border bg-secondary p-3">
              <p className="text-[10px] uppercase font-bold text-muted-foreground">Farm Dollars</p>
              <p className="text-2xl font-black text-foreground tabular-nums">${fmt(remaining)}</p>
              <p className="text-[10px] text-muted-foreground">of ${fmt(budget)} this year</p>
            </div>
          </div>

          {/* Vault */}
          <div className="px-4 pb-4">
            <div className="relative h-24 rounded-lg border-2 border-amber-500/70 bg-gradient-to-b from-amber-950/40 to-amber-900/70 overflow-hidden">
              <div
                className="absolute inset-x-0 bottom-0 bg-[radial-gradient(circle,rgba(255,255,255,0.35)_1.5px,transparent_1.6px)] bg-[length:14px_14px] bg-emerald-700/70 transition-all duration-700"
                style={{ height: `${Math.min(100, (balance / maxBar) * 100)}%` }}
              />
              <p className="absolute top-1 left-2 text-[10px] font-bold text-amber-200/90">THE VAULT UNDER THE FIELD</p>
            </div>
          </div>
        </div>

        {phase === 'plan' && (
          <div className="rounded-xl border-2 border-border bg-card p-4 space-y-3">
            <div className="flex items-start gap-3 rounded-lg border-2 border-sky-500/60 bg-sky-500/10 p-3">
              <condition.Icon className="w-6 h-6 text-sky-600 shrink-0" />
              <div>
                <p className="text-sm font-black text-foreground">Farm Conditions Card: {condition.name}</p>
                <p className="text-xs text-muted-foreground">{condition.note}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border-2 border-border bg-secondary p-2">
              <div className="w-14 h-14 rounded overflow-hidden bg-card shrink-0">
                <WeedImage weedId={featured.id} stage="flower" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">This year&apos;s biggest depositor</p>
                <p className="text-sm font-bold text-foreground truncate">{featured.commonName}</p>
                <p className="text-[11px] text-muted-foreground">Every escaped plant makes a new deposit into your bank.</p>
              </div>
            </div>

            <p className="text-xs font-bold text-foreground">Choose your management (spend up to ${fmt(budget)}):</p>
            <div className="grid grid-cols-2 gap-2">
              {PRACTICES.map(p => {
                const on = selected.includes(p.id);
                const afford = on || p.cost <= remaining;
                return (
                  <button key={p.id} onClick={() => toggle(p)} disabled={!afford}
                    className={`text-left p-2.5 rounded-lg border-2 transition ${on ? 'border-primary bg-primary/10' : 'border-border bg-secondary hover:border-primary/50'} ${afford ? '' : 'opacity-40 cursor-not-allowed'}`}>
                    <p className="text-xs font-bold text-foreground">{p.name} · ${fmt(p.cost)}</p>
                    <p className="text-[10px] text-muted-foreground">{p.blurb}</p>
                  </button>
                );
              })}
            </div>

            {selected.length === 0 && (
              <p className="text-[11px] font-bold text-destructive">⚠️ Spending $0 is allowed — but uncontrolled weeds may make a large deposit into your seed bank.</p>
            )}

            <button onClick={runSeason} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-black text-sm">
              Grow the Season →
            </button>
          </div>
        )}

        {phase === 'result' && last && (
          <div className="rounded-xl border-2 border-border bg-card p-4 space-y-3">
            <p className="text-sm font-black text-foreground">Year {last.year} Transactions</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border-2 border-green-600 bg-green-600/10 p-3">
                <div className="flex items-center gap-1 text-green-700"><TrendingDown className="w-4 h-4" /><span className="text-[10px] font-bold uppercase">Withdrawal</span></div>
                <p className="text-xl font-black text-green-700 tabular-nums">−{fmt(last.withdrawals)}</p>
                <p className="text-[10px] text-muted-foreground">Seeds that germinated, died, or lost viability.</p>
              </div>
              <div className={`rounded-lg border-2 p-3 ${last.deposits > 0 ? 'border-destructive bg-destructive/10' : 'border-border bg-secondary'}`}>
                <div className={`flex items-center gap-1 ${last.deposits > 0 ? 'text-destructive' : 'text-muted-foreground'}`}><TrendingUp className="w-4 h-4" /><span className="text-[10px] font-bold uppercase">Deposit</span></div>
                <p className={`text-xl font-black tabular-nums ${last.deposits > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>+{fmt(last.deposits)}</p>
                <p className="text-[10px] text-muted-foreground">{last.deposits > 0 ? 'Escaped weeds produced new seed.' : 'No weeds set seed — no new deposit!'}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {last.deposits === 0
                ? 'Nice! You removed weeds before they could make another deposit.'
                : 'Some weeds survived long enough to put seed back into the soil for future years.'}
            </p>

            {/* Statement table */}
            <div className="overflow-x-auto rounded-lg border-2 border-border">
              <table className="w-full text-[11px]">
                <thead className="bg-secondary text-muted-foreground">
                  <tr>
                    <th className="p-1.5 text-left font-bold">Year</th>
                    <th className="p-1.5 text-right font-bold">Starting</th>
                    <th className="p-1.5 text-right font-bold">Withdrawals</th>
                    <th className="p-1.5 text-right font-bold">Deposits</th>
                    <th className="p-1.5 text-right font-bold">Ending</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.year} className="border-t border-border">
                      <td className="p-1.5 font-bold text-foreground">{h.year}</td>
                      <td className="p-1.5 text-right tabular-nums text-foreground">{fmt(h.start)}</td>
                      <td className="p-1.5 text-right tabular-nums text-green-700">−{fmt(h.withdrawals)}</td>
                      <td className="p-1.5 text-right tabular-nums text-destructive">+{fmt(h.deposits)}</td>
                      <td className="p-1.5 text-right tabular-nums font-bold text-foreground">{fmt(h.end)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bar graph */}
            <div className="flex items-end gap-2 h-24 p-2 rounded-lg bg-secondary border-2 border-border">
              {[{ year: 0, end: startBalance }, ...history].map(h => (
                <div key={h.year} className="flex-1 flex flex-col items-center justify-end gap-1">
                  <span className="text-[9px] tabular-nums text-muted-foreground">{fmt(h.end)}</span>
                  <div className="w-full rounded-t bg-primary" style={{ height: `${Math.max(4, (h.end / maxBar) * 70)}px` }} />
                  <span className="text-[9px] text-muted-foreground">{h.year === 0 ? 'Start' : `Y${h.year}`}</span>
                </div>
              ))}
            </div>

            <button onClick={nextYear} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-black text-sm">
              {year >= SEASONS ? 'See Final Statement' : `Continue to Year ${year + 1} →`}
            </button>
          </div>
        )}

        {phase === 'done' && (
          <div className="rounded-xl border-2 border-border bg-card p-4 space-y-3">
            <p className="text-center text-lg font-black text-foreground">{rank}</p>
            <p className="text-center text-xs text-muted-foreground">
              You started at {fmt(startBalance)} seeds and finished at {fmt(balance)} seeds
              {reduction > 0 ? ` — a ${Math.round(reduction * 100)}% smaller seed bank.` : '.'}
            </p>
            <p className="text-center text-xs font-bold text-primary">
              &ldquo;Don&apos;t just manage the weeds you see — manage the seeds you don&apos;t see.&rdquo;
            </p>
            <LevelComplete
              level={level}
              score={score}
              total={100}
              gameId="weed-bank"
              gameName="Weed Bank"
              gradeLabel="6-8"
              onNextLevel={() => setLevel(l => l + 1)}
              onStartOver={() => setRunId(r => r + 1)}
              onBack={onBack}
            />
          </div>
        )}
      </div>

      <FloatingCoach grade="6-8" tip={`A dry spring hides the problem — the seeds are still in the bank. Level ${diff.level}: keep escapes at zero to shrink the balance every year.`} />
    </div>
  );
}