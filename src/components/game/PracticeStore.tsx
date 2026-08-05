import { useState } from 'react';
import { Coins, Check, Lock, Shirt, Zap, Wrench, Tractor, ShoppingBag, Sparkles } from 'lucide-react';
import {
  usePracticeStore, BAND_TITLE,
  type StoreBand, type StoreItem, type StoreCategory,
} from '@/lib/practiceStore';
import { HeroCharacter } from './HeroCharacter';

const CATEGORY_META: Record<StoreCategory, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  outfit:    { label: 'Hero Gear',  Icon: Shirt },
  power:     { label: 'Powers',     Icon: Zap },
  tool:      { label: 'Tools',      Icon: Wrench },
  equipment: { label: 'Equipment',  Icon: Tractor },
};

const BAND_BLURB: Record<StoreBand, string> = {
  k5: 'Spend the coins you earned from badges to build your own Weed Control Superhero. Everything you buy comes with you into the Play farm!',
  ms: 'Earn coins from your badges, then equip real integrated pest management tools. Your gear unlocks new actions in the Play farm.',
  hs: 'Invest your earnings in real farm equipment. Every machine you own becomes an extra management option in the Play farm.',
};

/* --------------------------- K-5 hero preview --------------------------- */

function HeroPreview({ ownedIds }: { ownedIds: string[] }) {
  return (
    <div className="rounded-xl border-2 border-primary/30 bg-gradient-to-b from-sky-50 to-emerald-50 dark:from-sky-950 dark:to-emerald-950 p-4">
      <p className="text-center text-sm font-bold text-foreground mb-2">Your Weed Control Superhero</p>
      <HeroCharacter ownedIds={ownedIds} className="w-full max-w-[200px] mx-auto" />
      <p className="text-center text-xs text-muted-foreground mt-2">
        Buy gear below and watch your hero change!
      </p>
    </div>
  );
}

/* ------------------------------ Store screen ---------------------------- */

export default function PracticeStore({ band }: { band: StoreBand }) {
  const store = usePracticeStore(band);
  const [filter, setFilter] = useState<StoreCategory | 'all'>('all');

  const categories = Array.from(new Set(store.catalog.map(i => i.category))) as StoreCategory[];
  const visible = filter === 'all' ? store.catalog : store.catalog.filter(i => i.category === filter);

  const renderCard = (it: StoreItem) => {
    const has = store.owns(it.id);
    const afford = store.coins >= it.cost;
    const { Icon } = CATEGORY_META[it.category];
    return (
      <button
        key={it.id}
        onClick={() => store.buy(it)}
        disabled={has || !afford}
        className={`p-4 rounded-xl border-2 text-left transition-all ${
          has ? 'border-success bg-success/10'
            : afford ? 'border-border bg-card hover:border-primary hover:shadow-card-hover'
            : 'border-border bg-card opacity-60 cursor-not-allowed'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-foreground text-sm leading-tight">{it.name}</span>
              {has ? <Check className="w-4 h-4 text-success flex-shrink-0" />
                : !afford ? <span className="inline-flex items-center gap-1 text-[11px] font-bold text-muted-foreground flex-shrink-0"><Lock className="w-3 h-3" />{it.cost}</span>
                : <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 flex-shrink-0"><Coins className="w-3 h-3" />{it.cost}</span>}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{it.desc}</p>
            <p className="text-[11px] text-primary mt-1.5 font-medium">{it.farmPerk}</p>
            {has && <p className="text-[11px] font-bold text-success mt-1">Owned — ready in the Play farm</p>}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <ShoppingBag className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-[200px]">
          <h2 className="font-display font-bold text-xl text-foreground">{BAND_TITLE[band]}</h2>
          <p className="text-sm text-muted-foreground">{BAND_BLURB[band]}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/30">
          <Coins className="w-5 h-5 text-amber-600" />
          <span className="font-bold text-foreground">{store.coins}</span>
          <span className="text-xs text-muted-foreground">coins</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            filter === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:text-foreground'
          }`}
        >All</button>
        {categories.map(c => {
          const { label, Icon } = CATEGORY_META[c];
          return (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                filter === c ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
            ><Icon className="w-3.5 h-3.5" />{label}</button>
          );
        })}
      </div>

      <div className={band === 'k5' ? 'grid lg:grid-cols-[240px_1fr] gap-5 items-start' : ''}>
        {band === 'k5' && <HeroPreview ownedIds={store.ownedIds} />}
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {visible.map(renderCard)}
        </div>
      </div>

      <div className="mt-5 p-4 rounded-lg border border-border bg-card">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">How coins work</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Every badge you earn in a practice game pays out coins — and the higher your score, the bigger the payout.
          Come back after playing more games to afford the big items. Everything you own is waiting for you in the Play farm.
        </p>
        {store.owned.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">
            You own <strong className="text-foreground">{store.owned.length}</strong> item{store.owned.length === 1 ? '' : 's'}:{' '}
            {store.owned.map(i => i.name).join(', ')}.
          </p>
        )}
      </div>
    </div>
  );
}
