import { Leaf } from 'lucide-react';

interface Props {
  onClose?: () => void;
}

/**
 * Persistent WeedNet logo button that navigates home from any screen.
 */
export default function HomeButton({ onClose }: Props) {
  const goHome = () => {
    if (onClose) {
      onClose();
    } else {
      window.location.hash = '';
      window.location.reload();
    }
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
