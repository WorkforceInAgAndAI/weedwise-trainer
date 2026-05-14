import { useState } from "react";
import { Tractor, Lightbulb, X } from "lucide-react";

/**
 * Floating, dismissible coach overlay.
 * - K-5: Farmer Joe panel always visible (collapsible) with a friendly tip.
 * - 6-8: Hint lightbulb that opens Farmer Joe on demand.
 * - 9-12: renders nothing.
 */
export default function FloatingCoach({
  grade, tip, position = "bottom-left",
}: { grade: "K-5" | "6-8" | "9-12" | string; tip: string; position?: "bottom-left" | "bottom-right" | "top-right" }) {
  const [open, setOpen] = useState(grade === "K-5");
  if (grade === "9-12") return null;

  const posCls =
    position === "bottom-right" ? "bottom-4 right-4"
    : position === "top-right" ? "top-20 right-4"
    : "bottom-4 left-4";

  return (
    <div className={`fixed ${posCls} z-[55] max-w-xs print:hidden`}>
      {open ? (
        <div className="bg-amber-50 dark:bg-amber-950/80 border-2 border-amber-500 rounded-2xl shadow-xl p-3 backdrop-blur">
          <div className="flex items-start gap-2">
            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/60 border-2 border-amber-500 flex items-center justify-center shrink-0">
              <Tractor className="w-5 h-5 text-amber-700 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">Farmer Joe</p>
              <p className="text-xs text-foreground leading-snug">{tip}</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Hide hint" className="shrink-0 text-amber-700 hover:text-amber-900 dark:text-amber-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          aria-label={grade === "6-8" ? "Get a hint" : "Show Farmer Joe"}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-amber-100 dark:bg-amber-900/60 border-2 border-amber-500 text-amber-800 dark:text-amber-300 text-xs font-bold shadow-lg hover:bg-amber-200"
        >
          <Lightbulb className="w-4 h-4" /> {grade === "6-8" ? "Hint" : "Farmer Joe"}
        </button>
      )}
    </div>
  );
}
