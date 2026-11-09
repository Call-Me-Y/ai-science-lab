import { parseManuscript } from './manuscripts.mjs'
const sources = import.meta.glob('../../content/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const illustrations = import.meta.glob('../assets/illustrations/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
export function devData() {
  const chapters = [1, 2, 3, 4].map(number => {
    const id = `chapter-${String(number).padStart(2, '0')}`
    return { id, number, zh: parseManuscript(sources[`../../content/${id}-zh.md`]), en: parseManuscript(sources[`../../content/${id}-en.md`]) }
  })
  return { chapters, images: Object.fromEntries(Object.entries(illustrations).map(([path, text]) => [path.split('/').pop(), text])), initialChapter: null }
}
