import { useState, useMemo } from 'react';
import { weeds } from '@/data/weeds';
import type { GradeLevel, Weed } from '@/types/game';
import { GRADE_NAMES, GRADE_RANGES } from '@/data/phases';
import WeedImage from './WeedImage';

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
  { id: 'habitats', name: 'Habitats & Climate', icon: '🗺️', description: 'Where each weed thrives — warm, cool, wet, or dry', grades: ['elementary', 'middle', 'high'] },
  { id: 'life-cycles', name: 'Life Cycles', icon: '🔄', description: 'Annual, biennial, and perennial growth patterns', grades: ['middle', 'high'] },
  { id: 'look-alikes', name: 'Look-Alike Species', icon: '🔀', description: 'Compare easily confused species pairs', grades: ['middle', 'high'] },
  { id: 'safety', name: 'Safety & Toxicity', icon: '⚠️', description: 'Identify dangerous species and safety precautions', grades: ['elementary', 'middle', 'high'] },
];

function getTopicWeeds(topicId: TopicId): Weed[] {
  switch (topicId) {
    case 'names': return weeds;
    case 'monocot-dicot': return weeds;
    case 'native-introduced': return weeds;
    case 'families': return weeds;
    case 'habitats': return weeds;
    case 'life-cycles': return weeds;
    case 'look-alikes': return weeds.filter(w => weeds.some(x => x.id === w.lookAlike.id));
    case 'safety': return weeds.filter(w => w.safetyNote);
    default: return weeds;
  }
}

function renderTopicContent(topicId: TopicId, grade: GradeLevel, topicWeeds: Weed[]) {
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
                <div className="font-bold text-foreground">{w.commonName}</div>
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

    case 'monocot-dicot':
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
                <div className="text-xs font-semibold text-foreground">{w.commonName}</div>
                <div className="text-[10px] text-muted-foreground">{w.family}</div>
              </div>
            ))}
          </div>
          <h3 className="font-semibold text-foreground text-sm">🍀 Dicots ({dicots.length} species)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {dicots.map(w => (
              <div key={w.id} className="bg-card border border-border rounded-lg p-3 text-center">
                <div className="w-12 h-12 mx-auto rounded overflow-hidden mb-1"><WeedImage weedId={w.id} stage="whole" className="w-full h-full" /></div>
                <div className="text-xs font-semibold text-foreground">{w.commonName}</div>
                <div className="text-[10px] text-muted-foreground">{w.family}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'native-introduced':
      const natives = topicWeeds.filter(w => w.origin === 'Native');
      const introduced = topicWeeds.filter(w => w.origin === 'Introduced');
      return (
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground space-y-2">
            <p className="font-semibold text-primary">📝 Native vs Introduced Species</p>
            <p><strong>🏡 Native</strong> species have been in the Midwest for thousands of years and are part of the natural ecosystem. Some provide value to pollinators and wildlife.</p>
            <p><strong>🚢 Introduced</strong> species were brought from other regions (often accidentally). They can become invasive because they have fewer natural predators.</p>
          </div>
          <h3 className="font-semibold text-foreground text-sm">🏡 Native Species ({natives.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {natives.map(w => (
              <div key={w.id} className="bg-card border border-border rounded-lg p-3 flex gap-3">
                <div className="w-12 h-12 rounded overflow-hidden shrink-0"><WeedImage weedId={w.id} stage="whole" className="w-full h-full" /></div>
                <div><div className="text-sm font-semibold text-foreground">{w.commonName}</div><div className="text-xs text-muted-foreground">{w.habitat}</div></div>
              </div>
            ))}
          </div>
          <h3 className="font-semibold text-foreground text-sm">🚢 Introduced Species ({introduced.length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {introduced.map(w => (
              <div key={w.id} className="bg-card border border-border rounded-lg p-3 flex gap-3">
                <div className="w-12 h-12 rounded overflow-hidden shrink-0"><WeedImage weedId={w.id} stage="whole" className="w-full h-full" /></div>
                <div><div className="text-sm font-semibold text-foreground">{w.commonName}</div><div className="text-xs text-muted-foreground">{w.habitat}</div></div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'habitats':
      const habGroups = [
        { key: 'Warm-Season / Full Sun', icon: '☀️', label: 'Warm-Season / Full Sun' },
        { key: 'Cool-Season / Early Spring', icon: '❄️', label: 'Cool-Season / Early Spring' },
        { key: 'Wet / Poorly Drained', icon: '💧', label: 'Wet / Poorly Drained' },
        { key: 'Dry / Disturbed', icon: '🏜️', label: 'Dry / Disturbed' },
      ];
      return (
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold text-primary mb-2">📝 Habitats & Climate</p>
            <p>Weeds are adapted to specific growing conditions. Understanding where a weed thrives helps predict where it will appear and when it will be most active.</p>
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
                      <div className="text-xs font-semibold text-foreground">{w.commonName}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );

    case 'families':
      const famGroups = new Map<string, Weed[]>();
      topicWeeds.forEach(w => {
        const list = famGroups.get(w.family) || [];
        list.push(w);
        famGroups.set(w.family, list);
      });
      return (
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold text-primary mb-2">📝 Plant Families</p>
            <p>Plants in the same family share key characteristics like flower structure, leaf arrangement, and seed type. Knowing the family helps you identify unknown species by relating them to ones you already know.</p>
          </div>
          {Array.from(famGroups.entries()).sort().map(([family, members]) => (
            <div key={family}>
              <h3 className="font-semibold text-foreground text-sm mb-2">🌿 {family} ({members.length} species)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {members.map(w => (
                  <div key={w.id} className="bg-card border border-border rounded-lg p-3 flex gap-3">
                    <div className="w-12 h-12 rounded overflow-hidden shrink-0"><WeedImage weedId={w.id} stage="whole" className="w-full h-full" /></div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{w.commonName}</div>
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

    case 'life-cycles':
      const lcGroups = [
        { key: 'Annual', icon: '🔄', desc: 'Completes its life cycle in one growing season (germination → seed → death).' },
        { key: 'Biennial', icon: '2️⃣', desc: 'Takes two years — rosette in year 1, flowers and seeds in year 2.' },
        { key: 'Perennial', icon: '♾️', desc: 'Lives for multiple years, regrowing from roots, rhizomes, or tubers.' },
      ];
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
                      <div className="text-xs font-semibold text-foreground">{w.commonName}</div>
                      <div className="text-[10px] text-muted-foreground">{w.controlTiming}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );

    case 'look-alikes':
      // Deduplicate pairs
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
      return (
        <div className="space-y-4">
          <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold text-primary mb-2">📝 Look-Alike Species</p>
            <p>Some weeds look very similar but require different management. Learning to tell them apart is critical for effective identification.</p>
          </div>
          {pairs.map(([a, b]) => (
            <div key={a.id} className="bg-card border border-border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-lg overflow-hidden mb-1"><WeedImage weedId={a.id} stage="vegetative" className="w-full h-full" /></div>
                  <div className="text-sm font-bold text-foreground">{a.commonName}</div>
                  {grade !== 'elementary' && <div className="text-xs text-primary italic">{a.scientificName}</div>}
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-lg overflow-hidden mb-1"><WeedImage weedId={b.id} stage="vegetative" className="w-full h-full" /></div>
                  <div className="text-sm font-bold text-foreground">{b.commonName}</div>
                  {grade !== 'elementary' && <div className="text-xs text-primary italic">{b.scientificName}</div>}
                </div>
              </div>
              <div className="bg-muted/30 rounded p-3 text-xs text-foreground">
                <p className="font-semibold text-primary mb-1">How to tell them apart:</p>
                <p>{a.lookAlike.difference}</p>
              </div>
            </div>
          ))}
        </div>
      );

    case 'safety':
      return (
        <div className="space-y-4">
          <div className="bg-destructive/15 border border-destructive/30 rounded-lg p-4 text-sm text-foreground">
            <p className="font-semibold text-destructive mb-2">⚠️ Safety First!</p>
            <p>Some weeds are <strong>dangerous to touch or handle</strong>. Always wear gloves when working near unknown plants, and never eat any wild plant unless you are 100% sure of its identity.</p>
          </div>
          {topicWeeds.map(w => (
            <div key={w.id} className="bg-card border border-destructive/30 rounded-lg p-4 flex gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0"><WeedImage weedId={w.id} stage="whole" className="w-full h-full" /></div>
              <div>
                <div className="font-bold text-foreground">{w.commonName}</div>
                <div className="text-sm text-destructive mt-1">{w.safetyNote}</div>
                <div className="text-xs text-muted-foreground mt-1">Management: {w.management}</div>
              </div>
            </div>
          ))}
        </div>
      );
  }
}

interface Props {
  onClose: () => void;
}

export default function LearningModule({ onClose }: Props) {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>('elementary');
  const [selectedTopic, setSelectedTopic] = useState<TopicId | null>(null);

  const availableTopics = useMemo(
    () => TOPICS.filter(t => t.grades.includes(selectedGrade)),
    [selectedGrade]
  );

  const gradeCards: { grade: GradeLevel; icon: string; color: string }[] = [
    { grade: 'elementary', icon: '🌱', color: 'border-grade-elementary' },
    { grade: 'middle', icon: '🔬', color: 'border-grade-middle' },
    { grade: 'high', icon: '🧪', color: 'border-grade-high' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {selectedTopic && (
              <button onClick={() => setSelectedTopic(null)} className="px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors text-sm">← Back</button>
            )}
            <h1 className="text-2xl font-display font-bold text-primary">📚 Learning Module</h1>
          </div>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border hover:bg-secondary transition-colors text-sm">✕ Close</button>
        </div>

        {/* Grade selector */}
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
          /* Topic grid */
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
          /* Topic content */
          <div>
            <h2 className="text-lg font-display font-bold text-foreground mb-4">
              {TOPICS.find(t => t.id === selectedTopic)?.icon} {TOPICS.find(t => t.id === selectedTopic)?.name}
            </h2>
            {renderTopicContent(selectedTopic, selectedGrade, getTopicWeeds(selectedTopic))}
          </div>
        )}
      </div>
    </div>
  );
}
