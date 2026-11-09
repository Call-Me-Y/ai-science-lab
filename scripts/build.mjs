import { build } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { readChapters } from './check-content.mjs'

const chapters = readChapters()
const images = Object.fromEntries(readdirSync('src/assets/illustrations').filter(file=>file.endsWith('.svg')).map(file => [file,readFileSync(`src/assets/illustrations/${file}`,'utf8')]))
const result = await build({
  configFile: false, plugins: [vue()],
  define: { 'import.meta.env.DEV': 'false', 'process.env.NODE_ENV': '"production"' },
  build: { target: 'es2022', write: false, minify: 'esbuild', cssCodeSplit: false, reportCompressedSize: false,
    lib: { entry: resolve('src/main.ts'), name: 'AiLearningLab', formats: ['iife'], fileName: 'course' },
    rollupOptions: { output: { inlineDynamicImports: true } }
  }
})
const output = (Array.isArray(result) ? result[0] : result).output
const script = output.filter(item => item.type === 'chunk').map(item=>item.code).join('\n').replace(/<\/script/gi,'<\\/script')
const css = output.filter(item => item.type === 'asset' && item.fileName.endsWith('.css')).map(item=>String(item.source)).join('\n')
if (!script || !css) throw new Error('Missing inlined application assets')
for (const url of css.matchAll(/url\(([^)]+)\)/g)) {
  if (!/^['"]?data:/.test(url[1])) throw new Error(`External CSS dependency: ${url[1]}`)
}
const serialize = value => JSON.stringify(value).replace(/</g,'\\u003c')
const escape = value => value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;')
mkdirSync('dist', { recursive: true })
for (const selection of [null, ...chapters.map(chapter=>chapter.id)]) {
  const selected = selection ? chapters.filter(chapter=>chapter.id===selection) : chapters
  const required = new Set(selected.flatMap(chapter=>chapter.zh.pages.map(page=>page.illustration?.replace('.svg','')).filter(Boolean)))
  const selectedImages = Object.fromEntries(Object.entries(images).filter(([name])=>required.has(name.replace(/\.(zh|en)\.svg$/,''))))
  const boot = { chapters: selected, images: selectedImages, initialChapter: selection }
  const html = `<!doctype html>\n<html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="color-scheme" content="light"><title>${escape(selection ? selected[0].zh.title : 'AI Learning Lab')}</title><style>${css}</style></head><body><div id="app"></div><script>window.__LAB_BOOT__=${serialize(boot)};</script><script>${script}</script></body></html>`
  if (/<(?:script[^>]+src|link[^>]+href|img[^>]+src=["'](?:https?:|\/))/i.test(html)) throw new Error('Unexpected linked runtime dependency')
  const filename = selection ? `${selection}.html` : 'index.html'
  writeFileSync(`dist/${filename}`, html)
  if (!selection) writeFileSync('dist/ai-learning-lab.html',html)
  console.log(`${filename}: ${(Buffer.byteLength(html)/1024/1024).toFixed(2)} MiB, standalone`)
}
