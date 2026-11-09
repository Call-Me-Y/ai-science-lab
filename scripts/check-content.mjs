import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { parseManuscript } from '../src/lib/manuscripts.mjs'

export function readChapters() {
  return [1, 2, 3, 4].map(number => {
    const id = `chapter-${String(number).padStart(2, '0')}`
    const chapter = { id, number }
    for (const language of ['zh', 'en']) {
      const raw = readFileSync(new URL(`../content/${id}-${language}.md`, import.meta.url), 'utf8')
      chapter[language] = parseManuscript(raw)
      assert.equal(chapter[language].pages.length, [5,8,7,16][number-1], `${id}/${language} page count`)
      for (const page of chapter[language].pages) {
        for (const block of [...page.blocks, ...page.embedded]) {
          assert(block.html.trim(), `Unrendered paragraph: ${block.id}`)
          assert(!block.html.includes('katex-error'), `Invalid formula: ${block.id}`)
        }
      }
    }
    assert.deepEqual(chapter.zh.pages.map(page => [page.id, page.module, page.illustration, [...page.blocks,...page.embedded].map(block=>block.id)]), chapter.en.pages.map(page => [page.id, page.module, page.illustration, [...page.blocks,...page.embedded].map(block=>block.id)]), `${id} translation structure`)
    assert.deepEqual(Object.keys(chapter.zh.copy).sort(), Object.keys(chapter.en.copy).sort(), `${id} interface translation keys`)
    return chapter
  })
}
const chapters = readChapters()
console.log(`Validated ${chapters.length} bilingual chapters, ${chapters.reduce((n,c)=>n+c.zh.pages.length,0)} pages; all formulas render and translations align.`)
