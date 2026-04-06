import { Leaf } from 'lucide-react';

/**
 * Persistent WeedNet logo button that navigates home from any screen.
 * Place at top-left of any fullscreen overlay.
 */
export default function HomeButton() {
  const goHome = () => {
    // Close all overlays by reloading at root
    window.location.hash = '';
    window.location.reload();
  };

  return (
    <button
      onClick={goHome}
      className="flex items-center gap-1.5 shrink-0 hover:opacity-80 transition-opacity"
      title="Back to Home"
    >
      <Leaf className="w-5 h-5 text-primary" strokeWidth={2.5} />
      <span className="font-display font-bold text-sm text-primary hidden sm:inline">WeedNet</span>
    </button>
  );
}
