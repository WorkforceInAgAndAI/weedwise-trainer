import { BookOpen, Target, Gamepad2, TrendingUp, X, User } from 'lucide-react';
import type { useAuth } from '@/hooks/useAuth';

interface Props {
  onClose: () => void;
  auth: ReturnType<typeof useAuth>;
}

const statCards = [
  { label: 'Weeds Learned', value: '—', total: '88', icon: BookOpen, note: 'Track your progress across all species' },
  { label: 'Practice Games Completed', value: '—', total: '47', icon: Target, note: 'Games across all grade levels' },
  { label: 'Seasons Played', value: '—', total: '—', icon: Gamepad2, note: 'Farm management simulations' },
  { label: 'Average Yield', value: '—', total: 'bu/acre', icon: TrendingUp, note: 'Your farm performance' },
];

export default function StatsPanel({ onClose, auth }: Props) {
  const userName = auth.isAuthenticated
    ? (auth.role === 'instructor' ? auth.instructor?.display_name : auth.user?.email?.split('@')[0]) || 'Student'
    : 'Guest';

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="max-w-[800px] mx-auto px-5 sm:px-10 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="font-display font-bold text-2xl text-foreground">Stats Dashboard</h1>
          <button onClick={onClose} className="w-9 h-9 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User card */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8 flex items-center gap-4 shadow-card">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-foreground">{userName}</h2>
            <p className="text-sm text-muted-foreground">Progress will update in a future version</p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {statCards.map(card => (
            <div key={card.label} className="bg-card border border-border rounded-lg p-6 shadow-card">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center">
                  <card.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-2xl font-display font-bold text-foreground">{card.value}</span>
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">{card.label}</h3>
              <p className="text-xs text-muted-foreground">{card.note}</p>
            </div>
          ))}
        </div>

        {/* Grade level progress placeholder */}
        <div className="mt-8 bg-card border border-border rounded-lg p-6 shadow-card">
          <h3 className="font-display font-bold text-foreground mb-4">Grade Level Progress</h3>
          <div className="space-y-4">
            {[
              { label: 'Elementary (K-5)', color: 'bg-grade-elementary' },
              { label: 'Middle School (6-8)', color: 'bg-grade-middle' },
              { label: 'High School (9-12)', color: 'bg-grade-high' },
            ].map(g => (
              <div key={g.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-foreground">{g.label}</span>
                  <span className="text-xs text-muted-foreground">Not started</span>
                </div>
                <div className="w-full h-2 rounded-full bg-muted">
                  <div className={`h-2 rounded-full ${g.color} opacity-20`} style={{ width: '0%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
