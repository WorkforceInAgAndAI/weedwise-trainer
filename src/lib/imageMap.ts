// Eagerly import all weed images from src/assets/images via Vite glob
const weedModules = import.meta.glob<string>(
 '/src/assets/images/**/*.{jpg,jpeg,png,webp}',
 { eager: true, query: '?url', import: 'default' }
);

// Build a lookup: key = "weedId/filename" → value = resolved URL
// e.g. "Dandelion/veg_1.jpeg" → "/assets/images/Dandelion/veg_1-abc123.jpeg"
const imageMap: Record<string, string> = {};
// Also keep a lowercase-key lookup for case-insensitive resolution
const imageMapLower: Record<string, string> = {};

for (const [path, url] of Object.entries(weedModules)) {
 // path looks like "/src/assets/images/Dandelion/veg_1.jpeg"
 const match = path.match(/\/src\/assets\/images\/(.+)$/);
 if (match) {
  imageMap[match[1]] = url;
  imageMapLower[match[1].toLowerCase()] = url;
 }
}

// Also import crop images if they exist
const cropModules = import.meta.glob<string>(
 '/src/assets/crop-images/**/*.{jpg,jpeg,png,webp}',
 { eager: true, query: '?url', import: 'default' }
);

const cropImageMap: Record<string, string> = {};
for (const [path, url] of Object.entries(cropModules)) {
 const match = path.match(/\/src\/assets\/crop-images\/(.+)$/);
 if (match) {
  cropImageMap[match[1]] = url;
 }
}

// Herbicide injury images: src/assets/Herbicide-injury-images/G{group}_{br|gr}.jpg
const injuryModules = import.meta.glob<string>(
 '/src/assets/Herbicide-injury-images/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG}',
 { eager: true, query: '?url', import: 'default' }
);
const injuryMap: Record<string, string> = {};
for (const [path, url] of Object.entries(injuryModules)) {
 const m = path.match(/\/([^/]+)$/);
 if (m) injuryMap[m[1].toLowerCase()] = url;
}

/**
 * Resolve a herbicide injury image by WSSA group number and symptom type.
 * type: 'br' = broadleaf injury, 'gr' = grass injury.
 * Falls back to the other type if the requested one is missing.
 */
export function resolveInjuryImage(group: number, type: 'br' | 'gr'): string | null {
 // Strict: grass crops must use _gr, broadleaf crops must use _br.
 // No fallback to the wrong symptom type.
 return injuryMap[`g${group}_${type}.jpg`] || null;
}

/**
 * Species folders on disk still use the original dataset ids. Weed ids were
 * later renamed (casing, separators, and a handful of true renames), so every
 * lookup goes through a normalized folder index plus an explicit alias table.
 */
const normalizeKey = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const FOLDER_ALIASES: Record<string, string> = {
 henbit: 'Henbit_deadnettle',
 hemp: 'Marijuana',
 honeyvinemilkweed: 'Honey-vine_climbing_milkweed',
 commonsunflower: 'volunteer-sunflower',
 commonmorningglory: 'Tall_morningglory',
 fallpanicum: 'Smooth_Witchgrass',
 tallhedgemustard: 'False_London-rocket',
};

// normalized folder name → actual folder name on disk
const folderByNorm: Record<string, string> = {};
for (const key of Object.keys(imageMap)) {
 const folder = key.split('/')[0];
 const n = normalizeKey(folder);
 if (!(n in folderByNorm)) folderByNorm[n] = folder;
}

/** Resolve a weed id to the folder that actually holds its photos. */
export function resolveWeedFolder(weedId: string): string {
 const n = normalizeKey(weedId);
 const alias = FOLDER_ALIASES[n];
 if (alias && folderByNorm[normalizeKey(alias)]) return folderByNorm[normalizeKey(alias)];
 return folderByNorm[n] ?? weedId;
}

export function resolveImageUrl(weedId: string, filename: string): string | null {
 const folder = resolveWeedFolder(weedId);
 const key = `${folder}/${filename}`;
 return imageMap[key] || imageMapLower[key.toLowerCase()] || null;
}

/**
 * Resolve a crop image like "Corn/crop_1.jpg"
 */
export function resolveCropImageUrl(cropName: string, filename: string): string | null {
 const key = `${cropName}/${filename}`;
 return cropImageMap[key] || null;
}

/**
 * Check if a weed has a specific image file (e.g. male.jpg, female.jpg)
 */
export function hasImage(weedId: string, filename: string): boolean {
 const key = `${resolveWeedFolder(weedId)}/${filename}`;
 return !!(imageMap[key] || imageMapLower[key.toLowerCase()]);
}

/**
 * True when a weed has any image file starting with the given prefix
 * (e.g. "stem" matches stem_1.jpg, stem.png, stem_2.jpeg).
 * Used for optional gallery slots that appear as soon as photos are added.
 */
export function hasImagePrefix(weedId: string, prefix: string): boolean {
 const p = `${resolveWeedFolder(weedId)}/${prefix}`.toLowerCase();
 return Object.keys(imageMapLower).some(k => k.startsWith(p));
}

/**
 * Get all crop image URLs for a given crop name
 */
export function getCropImages(cropName: string): string[] {
 const prefix = `${cropName}/`;
 return Object.entries(cropImageMap)
  .filter(([key]) => key.startsWith(prefix))
  .map(([, url]) => url);
}

export default imageMap;
