import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, BookOpen } from 'lucide-react';
import { getSessionCitations } from '@/data/imageReferences';

interface Props {
  /** Weed IDs shown in the current session/round */
  weedIds: string[];
  /** Image stages used (e.g. ['seed', 'seedling', 'vegetative', 'ligule']) */
  stages: string[];
}

export default function ImageReferencesBar({ weedIds, stages }: Props) {
  const [expanded, setExpanded] = useState(false);

  const citations = useMemo(
    () => getSessionCitations(weedIds, stages),
    [weedIds, stages]
  );

  if (citations.length === 0) return null;

  return (
    <div className="sticky bottom-0 z-20 bg-card border-t border-border">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between px-4 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          Image References ({citations.length})
        </span>
        {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {expanded && (
        <div className="max-h-48 overflow-y-auto px-4 pb-3 space-y-1 border-t border-border/50">
          <ol className="list-decimal list-inside space-y-1 pt-2">
            {citations.map((c, i) => (
              <li key={i} className="text-[10px] leading-relaxed text-muted-foreground break-words">
                {c}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
