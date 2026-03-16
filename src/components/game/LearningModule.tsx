import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import type { GradeLevel, Weed } from '@/types/game';
import { GRADE_NAMES, GRADE_RANGES } from '@/data/phases';
import WeedImage from './WeedImage';
import WeedDetailPopup from './WeedDetailPopup';
import { FAMILY_DESCRIPTIONS, HABITAT_DESCRIPTIONS, LIFECYCLE_DESCRIPTIONS } from '@/data/familyDescriptions';

type TopicId = 'names' | 'monocot-dicot' | 'native-introduced' | 'families' | 'habitats' | 'life-cycles' | 'life-stages' | 'look-alikes' | 'safety';

interface Topic {
  id: TopicId;
  name: string;
  icon: string;
  description: string;
  grades: GradeLevel[];
}

const TOPICS: Topic[] = [
  { id: 'names', name: 'Weed Names & ID', icon: '🏷️', description: 'Learn common names, scientific names, and key traits', grades: ['elementary', 'middle', 'high'] },
  { id: 'monocot-dicot', name: 'Monocot vs Dicot', icon: '🌾', description: 'Understand the difference between monocots and dicots', grades: ['elementary', 'middle', 'high'] },
  { id: 'life-stages', name: 'Life Stages', icon: '📸', description: 'Learn to identify weeds at seedling, vegetative, and reproductive stages', grades: ['elementary', 'middle', 'high'] },
  { id: 'native-introduced', name: 'Native vs Introduced', icon: '🌍', description: 'Which species are native and which were introduced', grades: ['elementary', 'middle', 'high'] },
  { id: 'families', name: 'Plant Families', icon: '🧬', description: 'Group weeds by their botanical families', grades: ['middle', 'high'] },
  { id: 'habitats', name: 'Habitats & Climate', icon: '🗺️', description: 'Where each weed thrives — warm, cool, wet, or dry', grades: ['middle', 'high'] },
  { id: 'life-cycles', name: 'Life Cycles', icon: '🔄', description: 'Annual, biennial, and perennial growth patterns', grades: ['middle', 'high'] },
  { id: 'look-alikes', name: 'Look-Alike Species', icon: '🔀', description: 'Compare easily confused species pairs', grades: ['middle', 'high'] },
  { id: 'safety', name: 'Safety & Toxicity', icon: '⚠️', description: 'Identify dangerous species and safety precautions', grades: ['elementary', 'middle', 'high'] },
];

function getTopicWeeds(topicId: TopicId): Weed[] {
  switch (topicId) {
    case 'look-alikes': return weeds.filter(w => weeds.some(x => x.id === w.lookAlike.id));
    case 'safety': return weeds.filter(w => w.safetyNote);
    default: return weeds;
  }
}

/** Clickable weed name that opens the detail popup */
function ClickableWeedName({ weed, onSelect, className = '' }: { weed: Weed; onSelect: (w: Weed) => void; className?: string }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onSelect(weed); }}
      className={`font-semibold text-foreground hover:text-primary hover:underline transition-colors cursor-pointer text-left ${className}`}
    >
      {weed.commonName}
    </button>
  );
}

/** Box view toggle button */
function ViewToggle({ view, onChange }: { view: 'list' | 'box'; onChange: (v: 'list' | 'box') => void }) {
  return (
    <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
      <button
        onClick={() => onChange('list')}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
      >
        📋 List View
      </button>
      <button
        onClick={() => onChange('box')}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === 'box' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
      >
        📦 Box View
      </button>
    </div>
  );
}

/** Box view subheading tile */
function SubheadingBox({ icon, label, count, description, weeds: groupWeeds, grade, onSelectWeed }: {
  icon: string; label: string; count: number; description: string;
  weeds: Weed[]; grade: GradeLevel; onSelectWeed: (w: Weed) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="bg-card border border-border rounded-xl p-6 text-left hover:border-primary/50 hover:shadow-lg transition-all"
      >
        <div className="text-3xl mb-2">{icon}</div>
        <div className="font-display font-bold text-foreground text-lg">{label}</div>
        <div className="text-sm text-muted-foreground mt-1">{count} species</div>
        <div className="text-xs text-primary mt-2">Click to explore →</div>
      </button>
    );
  }

  return (
    <div className="bg-card border border-primary/30 rounded-xl p-5 col-span-full space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-2xl mb-1">{icon}</div>
          <h3 className="font-display font-bold text-foreground text-lg">{label}</h3>
        </div>
        <button onClick={() => setExpanded(false)} className="px-3 py-1 rounded-lg border border-border hover:bg-secondary text-sm">✕ Close</button>
      </div>
      <div className="bg-muted/30 rounded-lg p-3 text-sm text-muted-foreground">{description}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {groupWeeds.map(w => (
          <div key={w.id} className="bg-secondary/30 border border-border rounded-lg p-3 flex gap-3">
            <div className="w-12 h-12 rounded overflow-hidden shrink-0"><WeedImage weedId={w.id} stage="whole" className="w-full h-full" /></div>
            <div>
              <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-sm" />
              {grade === 'high' && <div className="text-xs text-primary italic">{w.scientificName}</div>}
              <div className="text-xs text-muted-foreground">{w.plantType} • {w.lifeCycle}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface Props {
  onClose: () => void;
}

export default function LearningModule({ onClose }: Props) {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('elementary');
  const [selectedTopic, setSelectedTopic] = useState<TopicId | null>(null);
  const [selectedWeed, setSelectedWeed] = useState<Weed | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'box'>('list');

  const availableTopics = useMemo(
    () => TOPICS.filter(t => t.grades.includes(selectedGrade)),
    [selectedGrade]
  );

  const gradeCards: { grade: GradeLevel; icon: string; color: string }[] = [
    { grade: 'elementary', icon: '🌱', color: 'border-grade-elementary' },
    { grade: 'middle', icon: '🔬', color: 'border-grade-middle' },
    { grade: 'high', icon: '🧪', color: 'border-grade-high' },
  ];

  const topicNeedsViewToggle = selectedTopic === 'families' || selectedTopic === 'habitats' || selectedTopic === 'life-cycles';

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {selectedTopic && (
              <button onClick={() => { setSelectedTopic(null); setViewMode('list'); }} className="px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors text-sm">← Back</button>
            )}
            <h1 className="text-2xl font-display font-bold text-primary">📚 Learning Module</h1>
          </div>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors text-sm">✕ Close</button>
        </div>

        <div className="flex gap-2 mb-6">
          {gradeCards.map(({ grade, icon, color }) => (
            <button
              key={grade}
              onClick={() => { setSelectedGrade(grade); setSelectedTopic(null); }}
              className={`flex-1 py-2.5 rounded-lg border-2 text-center text-sm font-semibold transition-all ${
                selectedGrade === grade ? `${color} bg-card` : 'border-border text-muted-foreground hover:border-primary/30'
              }`}
            >
              {icon} {GRADE_NAMES[grade]} ({GRADE_RANGES[grade]})
            </button>
          ))}
        </div>

        {!selectedTopic ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableTopics.map(topic => (
              <button
                key={topic.id}
                onClick={() => setSelectedTopic(topic.id)}
                className="bg-card border border-border rounded-lg p-5 text-left hover:border-primary/50 hover:scale-[1.02] transition-all"
              >
                <div className="text-3xl mb-2">{topic.icon}</div>
                <div className="font-display font-bold text-foreground mb-1">{topic.name}</div>
                <div className="text-sm text-muted-foreground">{topic.description}</div>
                <div className="text-xs text-primary mt-2">{getTopicWeeds(topic.id).length} species →</div>
              </button>
            ))}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-foreground">
                {TOPICS.find(t => t.id === selectedTopic)?.icon} {TOPICS.find(t => t.id === selectedTopic)?.name}
              </h2>
              {topicNeedsViewToggle && <ViewToggle view={viewMode} onChange={setViewMode} />}
            </div>
            <TopicContent topicId={selectedTopic} grade={selectedGrade} topicWeeds={getTopicWeeds(selectedTopic)} onSelectWeed={setSelectedWeed} viewMode={viewMode} />
          </div>
        )}
      </div>

      {selectedWeed && <WeedDetailPopup weed={selectedWeed} onClose={() => setSelectedWeed(null)} />}
    </div>
  );
}

/** All topic content rendering */
function TopicContent({ topicId, grade, topicWeeds, onSelectWeed, viewMode }: {
  topicId: TopicId; grade: GradeLevel; topicWeeds: Weed[]; onSelectWeed: (w: Weed) => void; viewMode: 'list' | 'box';
}) {
  switch (topicId) {
    case 'names':
      return (
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold text-primary mb-2">📝 What You'll Learn</p>
            <p>Every weed has a <strong>common name</strong> (like "Waterhemp") and a <strong>scientific name</strong> (like <em>Amaranthus tuberculatus</em>). Scientific names help scientists worldwide talk about the exact same plant.</p>
            {grade !== 'elementary' && <p className="mt-2">Each species also has an <strong>EPPO code</strong> — a short code used internationally for pest management databases.</p>}
          </div>
          {topicWeeds.map(w => (
            <div key={w.id} className="bg-card border border-border rounded-lg p-4 flex gap-4">
              <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                <WeedImage weedId={w.id} stage="whole" className="w-full h-full" />
              </div>
              <div className="space-y-1">
                <ClickableWeedName weed={w} onSelect={onSelectWeed} className="font-bold" />
                {grade !== 'elementary' && <div className="text-sm text-primary italic">{w.scientificName}</div>}
                {grade === 'high' && <div className="text-xs text-muted-foreground">EPPO: {w.eppoCode}</div>}
                <ul className="text-xs text-muted-foreground space-y-0.5 mt-1">
                  {w.traits.slice(0, grade === 'elementary' ? 2 : 3).map((t, i) => (
                    <li key={i}>• {t}</li>
                  ))}
                </ul>
                <p className="text-xs text-primary">💡 {w.memoryHook}</p>
              </div>
            </div>
          ))}
        </div>
      );

    case 'life-stages': {
      const LIFE_STAGE_INFO = [
        { stage: 'seedling', label: '🌱 Seedling', desc: 'The earliest growth stage after germination. Cotyledons (seed leaves) are visible, and the first true leaves are emerging.' },
        { stage: 'vegetative', label: '🌿 Vegetative', desc: 'Active growth phase with expanding leaves and branching. Key ID features like leaf shape are most visible.' },
        { stage: 'flower', label: '🌸 Reproductive', desc: 'The plant is flowering and/or setting seed. Flower structure is a critical ID feature.' },
      ];
      return (
        <div className="space-y-6">
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground space-y-2">
            <p className="font-semibold text-primary">📸 Why Life Stages Matter</p>
            <p>Weeds look very different at each growth stage. Learning to recognize them <strong>early (seedling)</strong> is critical because that's when they're easiest to control.</p>
            {grade !== 'elementary' && (
              <p>In IPM, <strong>scouting timing</strong> is everything. Knowing what a weed looks like at each stage lets you catch it early and choose the right control method.</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {LIFE_STAGE_INFO.map(s => (
              <div key={s.stage} className="bg-card border border-border rounded-lg p-3 text-center">
                <div className="text-2xl mb-1">{s.label.split(' ')[0]}</div>
                <div className="text-xs font-bold text-foreground">{s.label.split(' ').slice(1).join(' ')}</div>
                <p className="text-[10px] text-muted-foreground mt-1">{s.desc.split('.')[0]}.</p>
              </div>
            ))}
          </div>

          {/* ALL weeds shown for all grade levels */}
          {topicWeeds.map(w => {
            const isGrass = w.plantType === 'Monocot';
            return (
              <div key={w.id} className="bg-card border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <ClickableWeedName weed={w} onSelect={onSelectWeed} className="font-display font-bold" />
                  {grade !== 'elementary' && <span className="text-xs text-primary italic">{w.scientificName}</span>}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{w.family}</span>
                </div>
                <div className={`grid ${isGrass ? 'grid-cols-4' : 'grid-cols-3'} gap-3`}>
                  {LIFE_STAGE_INFO.map(s => (
                    <div key={s.stage} className="space-y-1">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase text-center">{s.label}</div>
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <WeedImage weedId={w.id} stage={s.stage} className="w-full h-full" />
                      </div>
                    </div>
                  ))}
                  {isGrass && (
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-muted-foreground uppercase text-center">🔍 Ligule</div>
                      <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <WeedImage weedId={w.id} stage="ligule" className="w-full h-full" />
                      </div>
                    </div>
                  )}
                </div>
                {grade !== 'elementary' && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Best control timing:</span> {w.controlTiming}
                  </div>
                )}
                <p className="text-xs text-primary">💡 {w.memoryHook}</p>
              </div>
            );
          })}
        </div>
      );
    }

    case 'monocot-dicot': {
      const monocots = topicWeeds.filter(w => w.plantType === 'Monocot');
      const dicots = topicWeeds.filter(w => w.plantType === 'Dicot');
      return (
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground space-y-2">
            <p className="font-semibold text-primary">📝 Monocots vs Dicots</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card rounded-lg p-3 border border-border">
                <p className="font-bold text-foreground">🌾 Monocots</p>
                <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                  <li>• One seed leaf (cotyledon)</li>
                  <li>• Parallel leaf veins</li>
                  <li>• Fibrous root system</li>
                  <li>• Flower parts in multiples of 3</li>
                </ul>
              </div>
              <div className="bg-card rounded-lg p-3 border border-border">
                <p className="font-bold text-foreground">🍀 Dicots</p>
                <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                  <li>• Two seed leaves (cotyledons)</li>
                  <li>• Branching (net) leaf veins</li>
                  <li>• Taproot system</li>
                  <li>• Flower parts in multiples of 4 or 5</li>
                </ul>
              </div>
            </div>
          </div>
          <h3 className="font-semibold text-foreground text-sm">🌾 Monocots ({monocots.length} species)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {monocots.map(w => (
              <div key={w.id} className="bg-card border border-border rounded-lg p-3 text-center">
                <div className="w-12 h-12 mx-auto rounded overflow-hidden mb-1"><WeedImage weedId={w.id} stage="whole" className="w-full h-full" /></div>
                <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-xs" />
                <div className="text-[10px] text-muted-foreground">{w.family}</div>
              </div>
            ))}
          </div>
          <h3 className="font-semibold text-foreground text-sm">🍀 Dicots ({dicots.length} species)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {dicots.map(w => (
              <div key={w.id} className="bg-card border border-border rounded-lg p-3 text-center">
                <div className="w-12 h-12 mx-auto rounded overflow-hidden mb-1"><WeedImage weedId={w.id} stage="whole" className="w-full h-full" /></div>
                <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-xs" />
                <div className="text-[10px] text-muted-foreground">{w.family}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'native-introduced': {
      const natives = topicWeeds.filter(w => w.origin === 'Native');
      const introduced = topicWeeds.filter(w => w.origin === 'Introduced');
      return (
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground space-y-2">
            <p className="font-semibold text-primary">📝 Native vs Introduced Species</p>
            <p><strong>🏡 Native</strong> species have been in the Midwest for thousands of years and are part of the natural ecosystem.</p>
            <p><strong>🚢 Introduced</strong> species were brought from other regions (often accidentally). They can become invasive because they have fewer natural predators.</p>
          </div>
          <h3 className="font-semibold text-foreground text-sm">🏡 Native Species ({natives.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {natives.map(w => (
              <div key={w.id} className="bg-card border border-border rounded-lg p-3 flex gap-3">
                <div className="w-12 h-12 rounded overflow-hidden shrink-0"><WeedImage weedId={w.id} stage="whole" className="w-full h-full" /></div>
                <div><ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-sm" /><div className="text-xs text-muted-foreground">{w.habitat}</div></div>
              </div>
            ))}
          </div>
          <h3 className="font-semibold text-foreground text-sm">🚢 Introduced Species ({introduced.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {introduced.map(w => (
              <div key={w.id} className="bg-card border border-border rounded-lg p-3 flex gap-3">
                <div className="w-12 h-12 rounded overflow-hidden shrink-0"><WeedImage weedId={w.id} stage="whole" className="w-full h-full" /></div>
                <div><ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-sm" /><div className="text-xs text-muted-foreground">{w.habitat}</div></div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'habitats': {
      const habGroups = [
        { key: 'Warm-Season / Full Sun', icon: '☀️', label: 'Warm-Season / Full Sun' },
        { key: 'Cool-Season / Early Spring', icon: '❄️', label: 'Cool-Season / Early Spring' },
        { key: 'Wet / Poorly Drained', icon: '💧', label: 'Wet / Poorly Drained' },
        { key: 'Dry / Disturbed', icon: '🏜️', label: 'Dry / Disturbed' },
      ];

      if (viewMode === 'box') {
        return (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
              <p className="font-semibold text-primary mb-2">📝 Habitats & Climate</p>
              <p>Click a habitat tile below to explore the species that thrive in that environment.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {habGroups.map(g => {
                const grouped = topicWeeds.filter(w => w.primaryHabitat === g.key);
                return (
                  <SubheadingBox
                    key={g.key}
                    icon={g.icon}
                    label={g.label}
                    count={grouped.length}
                    description={HABITAT_DESCRIPTIONS[g.key] || ''}
                    weeds={grouped}
                    grade={grade}
                    onSelectWeed={onSelectWeed}
                  />
                );
              })}
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold text-primary mb-2">📝 Habitats & Climate</p>
            <p>Weeds are adapted to specific growing conditions. Understanding where a weed thrives helps predict where it will appear.</p>
          </div>
          {habGroups.map(g => {
            const grouped = topicWeeds.filter(w => w.primaryHabitat === g.key);
            return (
              <div key={g.key}>
                <h3 className="font-semibold text-foreground text-sm mb-2">{g.icon} {g.label} ({grouped.length})</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {grouped.map(w => (
                    <div key={w.id} className="bg-card border border-border rounded-lg p-3 text-center">
                      <div className="w-12 h-12 mx-auto rounded overflow-hidden mb-1"><WeedImage weedId={w.id} stage="whole" className="w-full h-full" /></div>
                      <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-xs" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    case 'families': {
      const famGroups = new Map<string, Weed[]>();
      topicWeeds.forEach(w => {
        const list = famGroups.get(w.family) || [];
        list.push(w);
        famGroups.set(w.family, list);
      });

      if (viewMode === 'box') {
        return (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
              <p className="font-semibold text-primary mb-2">📝 Plant Families</p>
              <p>Click a family tile to learn about its characteristics and see its species.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from(famGroups.entries()).sort().map(([family, members]) => (
                <SubheadingBox
                  key={family}
                  icon="🌿"
                  label={family}
                  count={members.length}
                  description={FAMILY_DESCRIPTIONS[family] || `The ${family} family includes ${members.length} weed species in this dataset.`}
                  weeds={members}
                  grade={grade}
                  onSelectWeed={onSelectWeed}
                />
              ))}
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold text-primary mb-2">📝 Plant Families</p>
            <p>Plants in the same family share key characteristics like flower structure, leaf arrangement, and seed type.</p>
          </div>
          {Array.from(famGroups.entries()).sort().map(([family, members]) => (
            <div key={family}>
              <h3 className="font-semibold text-foreground text-sm mb-2">🌿 {family} ({members.length} species)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {members.map(w => (
                  <div key={w.id} className="bg-card border border-border rounded-lg p-3 flex gap-3">
                    <div className="w-12 h-12 rounded overflow-hidden shrink-0"><WeedImage weedId={w.id} stage="whole" className="w-full h-full" /></div>
                    <div>
                      <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-sm" />
                      {grade === 'high' && <div className="text-xs text-primary italic">{w.scientificName}</div>}
                      <div className="text-xs text-muted-foreground">{w.plantType} • {w.lifeCycle}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    case 'life-cycles': {
      const lcGroups = [
        { key: 'Annual', icon: '🔄', desc: 'Completes its life cycle in one growing season.' },
        { key: 'Biennial', icon: '2️⃣', desc: 'Takes two years — rosette in year 1, flowers and seeds in year 2.' },
        { key: 'Perennial', icon: '♾️', desc: 'Lives for multiple years, regrowing from roots, rhizomes, or tubers.' },
      ];

      if (viewMode === 'box') {
        return (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
              <p className="font-semibold text-primary mb-2">📝 Life Cycles</p>
              <p>Click a life cycle tile to learn about the growth pattern and see its species.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {lcGroups.map(g => {
                const grouped = topicWeeds.filter(w => w.lifeCycle.includes(g.key));
                return (
                  <SubheadingBox
                    key={g.key}
                    icon={g.icon}
                    label={g.key}
                    count={grouped.length}
                    description={LIFECYCLE_DESCRIPTIONS[g.key] || g.desc}
                    weeds={grouped}
                    grade={grade}
                    onSelectWeed={onSelectWeed}
                  />
                );
              })}
            </div>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold text-primary mb-2">📝 Life Cycles</p>
            <p>A weed's life cycle determines when it germinates, when to scout for it, and the best time to control it.</p>
          </div>
          {lcGroups.map(g => {
            const grouped = topicWeeds.filter(w => w.lifeCycle.includes(g.key));
            return (
              <div key={g.key}>
                <h3 className="font-semibold text-foreground text-sm mb-1">{g.icon} {g.key} ({grouped.length})</h3>
                <p className="text-xs text-muted-foreground mb-2">{g.desc}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {grouped.map(w => (
                    <div key={w.id} className="bg-card border border-border rounded-lg p-3 text-center">
                      <div className="w-12 h-12 mx-auto rounded overflow-hidden mb-1"><WeedImage weedId={w.id} stage="whole" className="w-full h-full" /></div>
                      <ClickableWeedName weed={w} onSelect={onSelectWeed} className="text-xs" />
                      <div className="text-[10px] text-muted-foreground">{w.controlTiming}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    case 'look-alikes': {
      const seen = new Set<string>();
      const pairs: [Weed, Weed][] = [];
      topicWeeds.forEach(w => {
        const pairedWith = weeds.find(x => x.id === w.lookAlike.id);
        if (pairedWith && !seen.has(w.id) && !seen.has(pairedWith.id)) {
          seen.add(w.id);
          seen.add(pairedWith.id);
          pairs.push([w, pairedWith]);
        }
      });

      const stages = [
        { stage: 'seedling', label: '🌱 Seedling' },
        { stage: 'vegetative', label: '🌿 Vegetative' },
        { stage: 'flower', label: '🌸 Reproductive' },
        { stage: 'whole', label: '🪴 Whole Plant' },
      ];

      return (
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold text-primary mb-2">📝 Look-Alike Species</p>
            <p>Some weeds look very similar but require different management. Compare them at every growth stage to learn the key differences.</p>
          </div>
          {pairs.map(([a, b]) => {
            const aIsGrass = a.plantType === 'Monocot';
            const bIsGrass = b.plantType === 'Monocot';
            const showLigule = aIsGrass || bIsGrass;
            return (
              <div key={a.id} className="bg-card border border-border rounded-lg p-4 space-y-4">
                {/* Header */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <ClickableWeedName weed={a} onSelect={onSelectWeed} className="text-sm font-bold" />
                    {grade !== 'elementary' && <div className="text-xs text-primary italic">{a.scientificName}</div>}
                    <div className="text-[10px] text-muted-foreground">{a.family}</div>
                  </div>
                  <div className="text-center">
                    <ClickableWeedName weed={b} onSelect={onSelectWeed} className="text-sm font-bold" />
                    {grade !== 'elementary' && <div className="text-xs text-primary italic">{b.scientificName}</div>}
                    <div className="text-[10px] text-muted-foreground">{b.family}</div>
                  </div>
                </div>

                {/* All growth stages side by side */}
                {stages.map(s => (
                  <div key={s.stage}>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1 text-center">{s.label}</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                        <WeedImage weedId={a.id} stage={s.stage} className="w-full h-full" />
                      </div>
                      <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                        <WeedImage weedId={b.id} stage={s.stage} className="w-full h-full" />
                      </div>
                    </div>
                  </div>
                ))}

                {/* Ligule comparison for grasses */}
                {showLigule && (
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1 text-center">🔍 Ligule</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                        {aIsGrass ? <WeedImage weedId={a.id} stage="ligule" className="w-full h-full" /> : <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Not a grass</div>}
                      </div>
                      <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                        {bIsGrass ? <WeedImage weedId={b.id} stage="ligule" className="w-full h-full" /> : <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Not a grass</div>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Difference explanation */}
                <div className="bg-muted/30 rounded p-3 text-xs text-foreground">
                  <p className="font-semibold text-primary mb-1">How to tell them apart:</p>
                  <p>{a.lookAlike.difference}</p>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    case 'safety':
      return (
        <div className="space-y-4">
          <div className="bg-destructive/15 border border-destructive/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold text-destructive mb-2">⚠️ Safety First!</p>
            <p>Some weeds are <strong>dangerous to touch or handle</strong>. Always wear gloves when working near unknown plants.</p>
          </div>
          {topicWeeds.map(w => (
            <div key={w.id} className="bg-card border border-destructive/30 rounded-lg p-4 flex gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0"><WeedImage weedId={w.id} stage="whole" className="w-full h-full" /></div>
              <div>
                <ClickableWeedName weed={w} onSelect={onSelectWeed} className="font-bold" />
                <div className="text-sm text-destructive mt-1">{w.safetyNote}</div>
                <div className="text-xs text-muted-foreground mt-1">Management: {w.management}</div>
              </div>
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}
