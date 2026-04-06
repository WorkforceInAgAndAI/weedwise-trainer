// Eagerly import all weed images from src/assets/images via Vite glob
const weedModules = import.meta.glob<string>(
 '/src/assets/images/**/*.{jpg,jpeg,png,webp}',
 { eager: true, query: '?url', import: 'default' }
);

// Build a lookup: key = "weedId/filename" → value = resolved URL
// e.g. "Dandelion/veg_1.jpeg" → "/assets/images/Dandelion/veg_1-abc123.jpeg"
const imageMap: Record<string, string> = {};

for (const [path, url] of Object.entries(weedModules)) {
 // path looks like "/src/assets/images/Dandelion/veg_1.jpeg"
 const match = path.match(/\/src\/assets\/images\/(.+)$/);
 if (match) {
  imageMap[match[1]] = url;
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

export function resolveImageUrl(weedId: string, filename: string): string | null {
 const key = `${weedId}/${filename}`;
 return imageMap[key] || null;
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
 return !!imageMap[`${weedId}/${filename}`];
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
