import { Tractor, Lightbulb } from "lucide-react";
import { useState } from "react";

type GradeLevel = "K-5" | "6-8" | "9-12" | string;

interface FarmerGuideProps {
  message: string;
  gradeLabel?: GradeLevel;
  tone?: "intro" | "hint" | "correct" | "wrong" | "cheer";
  className?: string;
  compact?: boolean;
}

/**
 * Farmer character guide. Shows a friendly farmer with a speech bubble.
 * Used heavily in K-5 (storyline + hints + wrong-answer coaching),
 * lightly in 6-8 (intro + on-request hints only), and not in 9-12.
 */
export default function FarmerGuide({ message, gradeLabel, tone = "intro", className = "", compact = false }: FarmerGuideProps) {
  // High school: never show character.
  if (gradeLabel === "9-12") return null;

  const toneCls: Record<string, string> = {
    intro: "bg-card border-primary/40",
    hint: "bg-amber-50 border-amber-400 dark:bg-amber-950/40 dark:border-amber-600",
    correct: "bg-green-50 border-green-500 dark:bg-green-950/40 dark:border-green-600",
    wrong: "bg-orange-50 border-orange-400 dark:bg-orange-950/40 dark:border-orange-600",
    cheer: "bg-primary/5 border-primary/40",
  };

  return (
    <div className={`flex items-start gap-2 ${className}`}>
      <div className={`shrink-0 ${compact ? "w-10 h-10" : "w-14 h-14"} rounded-full bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-500 flex items-center justify-center`}>
        <Tractor className={`${compact ? "w-5 h-5" : "w-7 h-7"} text-amber-700 dark:text-amber-400`} />
      </div>
      <div className={`relative flex-1 rounded-xl border-2 px-3 py-2 ${toneCls[tone]}`}>
        <div className="absolute -left-2 top-3 w-3 h-3 rotate-45 border-l-2 border-b-2 border-inherit bg-inherit" style={{ background: "inherit" }} />
        <p className="text-[11px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-0.5">Farmer Joe</p>
        <p className="text-sm text-foreground leading-snug">{message}</p>
      </div>
    </div>
  );
}

/**
 * Returns whether hints should auto-show (K-5), be on-request (6-8), or be unavailable (9-12).
 */
export function getHintMode(gradeLabel?: string): "auto" | "request" | "off" {
  if (gradeLabel === "9-12") return "off";
  if (gradeLabel === "6-8") return "request";
  return "auto";
}

/**
 * On-request hint button for 6-8 (and optionally K-5). Hidden in 9-12.
 * Renders a small lightbulb button; on click reveals Farmer Joe's hint bubble.
 */
export function HintButton({ hint, gradeLabel, className = "" }: { hint: string; gradeLabel?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  if (gradeLabel === "9-12") return null;
  return (
    <div className={`flex flex-col items-end gap-2 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-full border-2 border-amber-500 bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-200 transition-colors"
        aria-label="Ask Farmer Joe for a hint"
      >
        <Lightbulb className="w-4 h-4" />
        {open ? "Hide hint" : "Hint"}
      </button>
      {open && <FarmerGuide message={hint} gradeLabel={gradeLabel} tone="hint" compact className="w-full max-w-md" />}
    </div>
  );
}
