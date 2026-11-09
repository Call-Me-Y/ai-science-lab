import MarkdownIt from 'markdown-it'
import katex from 'katex'

const md = new MarkdownIt({ html: true, breaks: true, typographer: false })
const formula = (value, displayMode = false) => katex.renderToString(value, { displayMode, throwOnError: true, strict: false, output: 'html' })
md.block.ruler.before('fence', 'math_block', (state, start, end, silent) => {
  const line = state.src.slice(state.bMarks[start] + state.tShift[start], state.eMarks[start]).trim()
  if (line !== '$$') return false
  let next = start + 1
  while (next < end && state.src.slice(state.bMarks[next], state.eMarks[next]).trim() !== '$$') next++
  if (next === end) return false
  if (!silent) {
    const token = state.push('math_block', 'div', 0)
    token.content = state.getLines(start + 1, next, 0, false).trim()
    state.line = next + 1
  }
  return true
})
md.inline.ruler.before('escape', 'math_inline', (state, silent) => {
  if (state.src[state.pos] !== '$') return false
  const end = state.src.indexOf('$', state.pos + 1)
  if (end < 0) return false
  if (!silent) { const token = state.push('math_inline', '', 0); token.content = state.src.slice(state.pos + 1, end).trim() }
  state.pos = end + 1
  return true
})
md.renderer.rules.math_inline = (tokens, index) => formula(tokens[index].content)
md.renderer.rules.math_block = (tokens, index) => formula(tokens[index].content, true)

export const renderMarkdown = value => md.render(value)
export const renderInline = value => md.renderInline(value)
export function parseManuscript(source) {
  const clean = source.replace(/&nbsp;?|&#(?:160|x0*a0);?/gi, ' ').replace(/\u00a0/g, ' ')
  const title = clean.match(/^# (.+)$/m)?.[1]?.trim()
  if (!title) throw new Error('Missing chapter title')
  const pages = [...clean.matchAll(/<!-- page: ([^;]+);[^>]*-->([\s\S]*?)<!-- end-page -->/g)].map(match => {
    const body = match[2]
    const blocks = [...body.matchAll(/<!-- text: ([^ ]+) -->\s*([\s\S]*?)(?=<!--|$)/g)].map(part => ({ id: part[1], raw: part[2].trim(), html: renderMarkdown(part[2].trim()) }))
    return { id: match[1], blocks: blocks.filter(b => !b.id.includes('.embedded')), embedded: blocks.filter(b => b.id.includes('.embedded')), module: body.match(/<!-- module: ([^;]+);/)?.[1] || null, illustration: body.match(/<!-- illustration: svg\/([^ ]+) -->/)?.[1] || null }
  })
  const copy = Object.fromEntries([...clean.matchAll(/^\| `([^`]+)` \| (.+) \|$/gm)].map(row => [row[1], row[2].replace(/&#32;/g, ' ')]))
  return { title, pages, copy }
}
