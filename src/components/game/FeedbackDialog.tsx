import { useState } from "react";
import { X, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStudent } from "@/contexts/StudentContext";

const CATEGORIES = [
  { value: "what_works", label: "What's working well" },
  { value: "whats_bad", label: "What's not working" },
  { value: "suggestion", label: "Suggestion / could be changed" },
  { value: "factual_inaccuracy", label: "Factual inaccuracy" },
  { value: "bug", label: "Bug / error" },
  { value: "content_request", label: "Content request" },
  { value: "other", label: "Other" },
];

interface Props {
  onClose: () => void;
}

export default function FeedbackDialog({ onClose }: Props) {
  const { session } = useStudent();
  const [category, setCategory] = useState<string>(CATEGORIES[0].value);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    const trimmed = message.trim();
    if (trimmed.length < 1) {
      setError("Please type a short message before sending.");
      return;
    }
    if (trimmed.length > 5000) {
      setError("Feedback is limited to 5,000 characters.");
      return;
    }
    setSubmitting(true);
    const { error: insertError } = await supabase.from("feedback").insert({
      category,
      message: trimmed,
      page_url: typeof window !== "undefined" ? window.location.href : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
      nickname: session?.nickname ?? null,
      class_name: session?.className ?? null,
    });
    setSubmitting(false);
    if (insertError) {
      setError("Couldn't send feedback. Please try again in a moment.");
      return;
    }
    setDone(true);
    setMessage("");
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-card border border-border rounded-lg shadow-card-hover overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="font-display font-bold text-foreground">Send Feedback</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            aria-label="Close feedback"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {done ? (
          <div className="p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
            <h3 className="font-display font-bold text-foreground text-lg mb-1">Thanks!</h3>
            <p className="text-sm text-muted-foreground mb-5">
              Your feedback was recorded and will be reviewed.
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => setDone(false)}
                className="px-4 py-2 rounded-md border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary transition-colors"
              >
                Send another
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <p className="text-xs text-muted-foreground">
              Feedback is temporary and goes straight to the WeedNet team. Please don't include
              personal information.
            </p>

            <div className="space-y-1.5">
              <label htmlFor="fb-category" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Type of feedback
              </label>
              <select
                id="fb-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="fb-message" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Your feedback
              </label>
              <textarea
                id="fb-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                maxLength={5000}
                placeholder="Tell us what's good, what's off, or what could be better..."
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <div className="text-[11px] text-muted-foreground text-right">{message.length}/5000</div>
            </div>

            {error && (
              <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-md border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={submitting || message.trim().length === 0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {submitting ? "Sending..." : "Send feedback"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}