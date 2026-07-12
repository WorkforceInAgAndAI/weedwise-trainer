import { ReactNode } from "react";
import { Fingerprint, Search, ClipboardCheck, NotebookPen, BookMarked, FlaskConical, ScrollText, Quote } from "lucide-react";

/* ============================================================
   6-8 "Field Detective" theme
   Warm amber accent on card surfaces. Case-file framing.
   ============================================================ */

export function DetectiveCard({ title, badge, children }: { title?: string; badge?: string; children: ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-amber-500/40 bg-card shadow-sm overflow-hidden">
      {(title || badge) && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border-b border-amber-500/30">
          <Fingerprint className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          {badge && (
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-700 dark:text-amber-300">
              {badge}
            </span>
          )}
          {title && <h3 className="font-display font-bold text-foreground text-sm sm:text-base">{title}</h3>}
        </div>
      )}
      <div className="p-4 text-foreground">{children}</div>
    </div>
  );
}

export function EvidenceTag({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "clue" | "suspect" | "verdict" }) {
  const toneMap = {
    neutral: "bg-secondary text-secondary-foreground border-border",
    clue: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/40",
    suspect: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/40",
    verdict: "bg-success/10 text-success border-success/40",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded border ${toneMap[tone]}`}>
      {label}
    </span>
  );
}

export function CaseCallout({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border-l-4 border-amber-500 bg-amber-500/5 p-3 my-3">
      <div className="flex items-center gap-2 mb-1">
        <Search className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-700 dark:text-amber-300">{heading}</p>
      </div>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

/* ============================================================
   9-12 "Researcher's Notebook" theme
   Ruled-paper accents, hypothesis / finding callouts.
   ============================================================ */

export function NotebookSection({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section
      className="rounded-lg border-2 border-primary/25 bg-card p-4 sm:p-5"
      style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 27px, hsl(var(--primary) / 0.06) 28px)" }}
    >
      <div className="flex items-start gap-2 mb-3 pb-2 border-b-2 border-primary/30">
        <NotebookPen className="w-5 h-5 text-primary mt-0.5 shrink-0" />
        <div>
          {subtitle && (
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary/70 leading-none mb-0.5">
              {subtitle}
            </p>
          )}
          <h3 className="font-display font-bold text-foreground text-base sm:text-lg leading-tight">{title}</h3>
        </div>
      </div>
      <div className="text-foreground">{children}</div>
    </section>
  );
}

export function FieldNote({ label = "Field note", children }: { label?: string; children: ReactNode }) {
  return (
    <aside className="rounded border-l-4 border-primary bg-primary/5 p-3 my-3">
      <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary mb-1">{label}</p>
      <div className="text-sm text-foreground italic">{children}</div>
    </aside>
  );
}

export function SelfCheck({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded border-2 border-dashed border-primary/40 bg-background p-3 my-3">
      <summary className="cursor-pointer list-none flex items-center gap-2 font-semibold text-sm text-foreground">
        <ClipboardCheck className="w-4 h-4 text-primary" />
        <span className="flex-1">{question}</span>
        <span className="text-xs text-primary group-open:hidden">Reveal</span>
        <span className="text-xs text-muted-foreground hidden group-open:inline">Hide</span>
      </summary>
      <p className="mt-2 pt-2 border-t border-primary/20 text-sm text-foreground">{answer}</p>
    </details>
  );
}

/* ============================================================
   Collegiate "Diagnostic Key / Lab Journal" theme
   Clean scientific layout, dichotomous couplets, term sidebars.
   ============================================================ */

export function KeyCouplet({ number, a, b }: { number: number; a: ReactNode; b: ReactNode }) {
  return (
    <div className="rounded border border-border bg-card overflow-hidden my-3 font-serif">
      <div className="grid grid-cols-[3rem_1fr] border-b border-border">
        <div className="bg-secondary/50 flex items-center justify-center font-bold text-sm text-muted-foreground">{number}a</div>
        <div className="p-3 text-sm text-foreground">{a}</div>
      </div>
      <div className="grid grid-cols-[3rem_1fr]">
        <div className="bg-secondary/50 flex items-center justify-center font-bold text-sm text-muted-foreground">{number}b</div>
        <div className="p-3 text-sm text-foreground">{b}</div>
      </div>
    </div>
  );
}

export function TermSidebar({ terms }: { terms: { term: string; def: string }[] }) {
  return (
    <aside className="rounded border border-border bg-secondary/40 p-3 my-3">
      <div className="flex items-center gap-2 mb-2">
        <BookMarked className="w-4 h-4 text-primary" />
        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary">Terminology</p>
      </div>
      <dl className="space-y-1.5 text-sm">
        {terms.map((t) => (
          <div key={t.term}>
            <dt className="font-semibold text-foreground inline">{t.term}. </dt>
            <dd className="inline text-muted-foreground">{t.def}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

export function LabCallout({ heading, children, icon: Icon = FlaskConical }: { heading: string; children: ReactNode; icon?: typeof FlaskConical }) {
  return (
    <div className="rounded border-l-4 border-primary bg-primary/5 p-3 my-3">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-primary" />
        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary">{heading}</p>
      </div>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

export function Citation({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] text-muted-foreground italic flex gap-1.5 mt-2">
      <Quote className="w-3 h-3 mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export function JournalHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="border-b-2 border-primary pb-2 mb-4 flex items-center gap-2">
      <ScrollText className="w-5 h-5 text-primary" />
      <div>
        {subtitle && <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/70">{subtitle}</p>}
        <h2 className="font-display font-bold text-lg text-foreground leading-tight">{title}</h2>
      </div>
    </header>
  );
}