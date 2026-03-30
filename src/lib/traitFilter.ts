/**
 * Filters weed traits to remove any that contain words from the weed's common name,
 * preventing the answer from being given away in "Name That Weed" style questions.
 */

// Words too generic to filter on (would remove too many valid traits)
const SKIP_WORDS = new Set([
 'common', 'field', 'giant', 'large', 'small', 'tall', 'wild', 'yellow',
 'white', 'eastern', 'false', 'smooth', 'rough', 'mat', 'long', 'short',
 'asian', 'spotted', 'prickly', 'venice', 'star', 'water', 'corn',
]);

export function filterTraitsForQuestion(traits: string[], commonName: string): string[] {
 // Extract significant words from the common name
 const nameWords = commonName
 .toLowerCase()
 .replace(/[^a-z\s-]/g, '') // remove non-alpha except hyphens
 .split(/[\s\-\/]+/)
 .filter(w => w.length >= 3 && !SKIP_WORDS.has(w));

 if (nameWords.length === 0) return traits;

 const filtered = traits.filter(trait => {
 const traitLower = trait.toLowerCase();
 return !nameWords.some(word => traitLower.includes(word));
 });

 // Always return at least 2 traits; if too many filtered, return originals
 return filtered.length >= 2 ? filtered : traits.slice(0, 3);
}