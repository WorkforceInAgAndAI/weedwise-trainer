import { ReactNode, createContext, useContext } from "react";
import {
  Fingerprint,
  Search,
  ClipboardCheck,
  NotebookPen,
  BookMarked,
  FlaskConical,
  ScrollText,
  Quote,
  Newspaper,
  PenLine,
  Beaker,
} from "lucide-react";

/* ============================================================
   Module theming
   6-8   → crime / detective case files
   9-12  → journalist / journal entries
   college → lab notebook
   ============================================================ */

export type ModuleTheme = "detective" | "journal" | "lab";

const ThemeCtx = createContext<ModuleTheme>("detective");

export function ModuleThemeProvider({ grade, children }: { grade?: string; children: ReactNode }) {
  const theme: ModuleTheme = grade === "collegiate" ? "lab" : grade === "high" ? "journal" : "detective";
  return <ThemeCtx.Provider value={theme}>{children}</ThemeCtx.Provider>;
}

export function useModuleTheme(): ModuleTheme {
  return useContext(ThemeCtx);
}

interface PanelProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  children: ReactNode;
}

/** One themed container used by every module block. */
export function ThemedPanel({ title, subtitle, badge, children }: PanelProps) {
  const theme = useModuleTheme();
  const label = badge ?? subtitle;

  if (theme === "journal") {
    return (
      <article className="rounded-lg border border-border bg-card overflow-hidden">
        <header className="px-4 sm:px-5 pt-4 pb-3 border-b-4 border-double border-primary/50">
          <div className="flex items-center gap-2 mb-1">
            <Newspaper className="w-4 h-4 text-primary shrink-0" />
            <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/80">
              {label ?? "Field Journal"}
            </span>
          </div>
          {title && (
            <h3 className="font-serif font-bold text-foreground text-lg sm:text-xl leading-tight">{title}</h3>
          )}
        </header>
        <div className="p-4 sm:p-5 text-foreground first-letter:font-serif">{children}</div>
      </article>
    );
  }

  if (theme === "lab") {
    return (
      <section
        className="rounded-lg border-2 border-primary/25 bg-card p-4 sm:p-5"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary) / 0.05) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.05) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      >
        <div className="flex items-start gap-2 mb-3 pb-2 border-b-2 border-primary/30">
          <Beaker className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-primary/70 leading-none mb-0.5 font-mono">
              {label ?? "Lab Notebook"}
            </p>
            {title && (
              <h3 className="font-display font-bold text-foreground text-base sm:text-lg leading-tight">{title}</h3>
            )}
          </div>
        </div>
        <div className="text-foreground">{children}</div>
      </section>
    );
  }

  return (
    <div className="rounded-xl border-2 border-amber-500/40 bg-card shadow-sm overflow-hidden">
      {(title || label) && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border-b border-amber-500/30 flex-wrap">
          <Fingerprint className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          {label && (
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-700 dark:text-amber-300">
              {label}
            </span>
          )}
          {title && <h3 className="font-display font-bold text-foreground text-sm sm:text-base">{title}</h3>}
        </div>
      )}
      <div className="p-4 text-foreground">{children}</div>
    </div>
  );
}

/** One themed callout used by every module aside. */
export function ThemedCallout({ heading, children }: { heading: string; children: ReactNode }) {
  const theme = useModuleTheme();
  const Icon = theme === "detective" ? Search : theme === "journal" ? PenLine : FlaskConical;
  const accent =
    theme === "detective"
      ? "border-amber-500 bg-amber-500/5 text-amber-700 dark:text-amber-300"
      : "border-primary bg-primary/5 text-primary";
  return (
    <div className={`rounded-lg border-l-4 p-3 my-3 ${accent}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" />
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold">{heading}</p>
      </div>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

/* ---- Backwards-compatible aliases: all delegate to the themed blocks ---- */

export function DetectiveCard({ title, badge, children }: { title?: string; badge?: string; children: ReactNode }) {
  return (
    <ThemedPanel title={title} badge={badge}>
      {children}
    </ThemedPanel>
  );
}

export function NotebookSection({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <ThemedPanel title={title} subtitle={subtitle}>
      {children}
    </ThemedPanel>
  );
}

export function CaseCallout({ heading, children }: { heading: string; children: ReactNode }) {
  return <ThemedCallout heading={heading}>{children}</ThemedCallout>;
}

export function FieldNote({ label = "Field note", children }: { label?: string; children: ReactNode }) {
  return <ThemedCallout heading={label}>{children}</ThemedCallout>;
}

export function LabCallout({ heading, children }: { heading: string; children: ReactNode; icon?: typeof FlaskConical }) {
  return <ThemedCallout heading={heading}>{children}</ThemedCallout>;
}

export function JournalHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const theme = useModuleTheme();
  const Icon = theme === "detective" ? Fingerprint : theme === "journal" ? Newspaper : ScrollText;
  return (
    <header
      className={`pb-2 mb-4 flex items-center gap-2 ${theme === "journal" ? "border-b-4 border-double border-primary/50" : "border-b-2 border-primary"}`}
    >
      <Icon className="w-5 h-5 text-primary" />
      <div>
        {subtitle && <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/70">{subtitle}</p>}
        <h2
          className={`font-bold text-lg text-foreground leading-tight ${theme === "journal" ? "font-serif text-xl" : "font-display"}`}
        >
          {title}
        </h2>
      </div>
    </header>
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

export function Citation({ children }: { children: ReactNode }) {
  return (
    <p className="text-[11px] text-muted-foreground italic flex gap-1.5 mt-2">
      <Quote className="w-3 h-3 mt-0.5 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export { NotebookPen };
