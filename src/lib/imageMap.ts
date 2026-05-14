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
 const primary = injuryMap[`g${group}_${type}.jpg`];
 if (primary) return primary;
 const other: 'br' | 'gr' = type === 'br' ? 'gr' : 'br';
 return injuryMap[`g${group}_${other}.jpg`] || null;
}

export function resolveImageUrl(weedId: string, filename: string): string | null {
 const key = `${weedId}/${filename}`;
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
 const key = `${weedId}/${filename}`;
 return !!(imageMap[key] || imageMapLower[key.toLowerCase()]);
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
