// Eagerly import all weed images from src/assets/images via Vite glob
const modules = import.meta.glob<string>(
  '/src/assets/images/**/*.{jpg,jpeg,png,webp}',
  { eager: true, query: '?url', import: 'default' }
);

// Build a lookup: key = "weedId/filename" → value = resolved URL
// e.g. "Dandelion/veg_1.jpeg" → "/assets/images/Dandelion/veg_1-abc123.jpeg"
const imageMap: Record<string, string> = {};

for (const [path, url] of Object.entries(modules)) {
  // path looks like "/src/assets/images/Dandelion/veg_1.jpeg"
  const match = path.match(/\/src\/assets\/images\/(.+)$/);
  if (match) {
    imageMap[match[1]] = url;
  }
}

export function resolveImageUrl(weedId: string, filename: string): string | null {
  const key = `${weedId}/${filename}`;
  return imageMap[key] || null;
}

export default imageMap;
