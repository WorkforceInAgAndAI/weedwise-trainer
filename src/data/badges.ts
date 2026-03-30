import type { BadgeDefinition } from '@/types/game';

export const BADGES: BadgeDefinition[] = [
 // Species mastery badges
 { id: 'master_5', name: 'Seedling Spotter', description: 'Master 5 weed species', icon: '', category: 'species', requirement: { type: 'species_mastered', count: 5 } },
 { id: 'master_10', name: 'Field Scout', description: 'Master 10 weed species', icon: '', category: 'species', requirement: { type: 'species_mastered', count: 10 } },
 { id: 'master_15', name: 'Weed Warrior', description: 'Master 15 weed species', icon: '', category: 'species', requirement: { type: 'species_mastered', count: 15 } },
 { id: 'master_25', name: 'Botanist', description: 'Master all 25 weed species', icon: '', category: 'species', requirement: { type: 'species_mastered', count: 25 } },

 // Topic completion badges
 { id: 'topic_monocot', name: 'Monocot Expert', description: 'Master all monocot species', icon: '', category: 'topic', requirement: { type: 'topic_complete', topic: 'monocot' } },
 { id: 'topic_dicot', name: 'Dicot Expert', description: 'Master all dicot species', icon: '', category: 'topic', requirement: { type: 'topic_complete', topic: 'dicot' } },
 { id: 'topic_native', name: 'Native Navigator', description: 'Master all native species', icon: '', category: 'topic', requirement: { type: 'topic_complete', topic: 'native' } },
 { id: 'topic_introduced', name: 'Invader Identifier', description: 'Master all introduced species', icon: '', category: 'topic', requirement: { type: 'topic_complete', topic: 'introduced' } },
 { id: 'topic_warm', name: 'Sun Seeker', description: 'Master all warm-season species', icon: '', category: 'topic', requirement: { type: 'topic_complete', topic: 'warm' } },
 { id: 'topic_cool', name: 'Frost Fighter', description: 'Master all cool-season species', icon: '', category: 'topic', requirement: { type: 'topic_complete', topic: 'cool' } },
 { id: 'topic_wet', name: 'Wetland Watcher', description: 'Master all wet habitat species', icon: '', category: 'topic', requirement: { type: 'topic_complete', topic: 'wet' } },
 { id: 'topic_dry', name: 'Dust Devil', description: 'Master all dry/disturbed species', icon: '', category: 'topic', requirement: { type: 'topic_complete', topic: 'dry' } },

 // Streak & performance badges
 { id: 'streak_5', name: 'Hot Start', description: 'Get 5 correct in a row', icon: '', category: 'streak', requirement: { type: 'streak', count: 5 } },
 { id: 'streak_10', name: 'On Fire', description: 'Get 10 correct in a row', icon: '', category: 'streak', requirement: { type: 'streak', count: 10 } },
 { id: 'streak_20', name: 'Unstoppable', description: 'Get 20 correct in a row', icon: '', category: 'streak', requirement: { type: 'streak', count: 20 } },
 { id: 'accuracy_90', name: 'Sharpshooter', description: 'Maintain 90%+ accuracy over 20+ questions', icon: '', category: 'streak', requirement: { type: 'accuracy', count: 90 } },
 { id: 'questions_50', name: 'Dedicated Learner', description: 'Answer 50 questions', icon: '', category: 'streak', requirement: { type: 'questions_answered', count: 50 } },
 { id: 'questions_100', name: 'Centurion', description: 'Answer 100 questions', icon: '', category: 'streak', requirement: { type: 'questions_answered', count: 100 } },

 // Phase completion badges
 { id: 'phase_e_all', name: 'Explorer Graduate', description: 'Complete all elementary phases', icon: '', category: 'phase', requirement: { type: 'phases_complete', grade: 'elementary' } },
 { id: 'phase_m_all', name: 'Scout Graduate', description: 'Complete all middle school phases', icon: '', category: 'phase', requirement: { type: 'phases_complete', grade: 'middle' } },
 { id: 'phase_h_all', name: 'Specialist Graduate', description: 'Complete all high school phases', icon: '', category: 'phase', requirement: { type: 'phases_complete', grade: 'high' } },
];

export const BADGE_MAP = Object.fromEntries(BADGES.map(b => [b.id, b]));
