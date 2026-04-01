import { Medal, ChevronRight, ChevronLeft, Target } from 'lucide-react';
import { useGameProgress } from '@/contexts/GameProgressContext';

const TIER_ICONS = [Medal, Medal, Medal];
const TIER_LABELS = ['Bronze', 'Silver', 'Gold'];

function getTier(score: number, total: number) {
 const pct = total > 0 ? score / total : 0;
 if (pct >= 0.85) return 2;
 if (pct >= 0.6) return 1;
 return 0;
}

export default function GameProgressSidebar() {
 const { badges, totalBadges, sidebarOpen, setSidebarOpen } = useGameProgress();

 return (
 <>
 {/* Toggle button - always visible */}
 <button
 onClick={() => setSidebarOpen(!sidebarOpen)}
 className="fixed right-0 top-1/2 -translate-y-1/2 z-[60] bg-card border border-r-0 border-border rounded-l-lg p-2 shadow-md hover:bg-secondary transition-colors"
 title="Game Progress"
 >
 {sidebarOpen ? <ChevronRight className="w-4 h-4 text-foreground" /> : <ChevronLeft className="w-4 h-4 text-foreground" />}
 {totalBadges > 0 && !sidebarOpen && (
 <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
 {totalBadges}
 </span>
 )}
 </button>

 {/* Sidebar panel */}
 <div className={`fixed right-0 top-0 h-full w-72 bg-card border-l border-border z-[59] shadow-xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
 <div className="p-4 border-b border-border">
 <div className="flex items-center gap-2">
  <Medal className="w-5 h-5 text-primary" />
 <h2 className="font-display font-bold text-foreground">Progress</h2>
 <span className="ml-auto text-xs text-muted-foreground font-medium">{totalBadges} badges</span>
 </div>
 </div>

 <div className="overflow-y-auto h-[calc(100%-60px)] p-3">
 {badges.length === 0 ? (
 <div className="text-center py-8">
 <Target className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
 <p className="text-sm text-muted-foreground">Complete games to earn badges!</p>
 <p className="text-xs text-muted-foreground mt-1">Your progress will appear here.</p>
 </div>
 ) : (
 <div className="space-y-2">
 {badges.map((badge, i) => {
 const tier = getTier(badge.score, badge.total);
 const TierIcon = TIER_ICONS[tier];
 const tierColors = [
  'text-amber-700 bg-amber-100 border border-amber-300',
  'text-slate-600 bg-slate-100 border border-slate-300',
  'text-yellow-700 bg-yellow-100 border border-yellow-300',
 ];
 return (
 <div key={`${badge.gameId}-${badge.level}-${i}`} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/50 border border-border">
 <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${tierColors[tier]}`}>
 <TierIcon className="w-4 h-4" />
 </div>
 <div className="flex-1 min-w-0">
 <p className="text-xs font-bold text-foreground truncate">{badge.gameName}</p>
 <p className="text-[10px] text-muted-foreground">
 {badge.level} — {badge.score}/{badge.total} — {TIER_LABELS[tier]}
 </p>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </div>
 </>
 );
}
