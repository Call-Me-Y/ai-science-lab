<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import LinearRegressionLab from './components/labs/LinearRegressionLab.vue'
import ARForecastLab from './components/labs/ARForecastLab.vue'
import GradientDescent1DLab from './components/labs/GradientDescent1DLab.vue'
import GradientDescentSurfaceLab from './components/labs/GradientDescentSurfaceLab.vue'
import GomokuLab from './components/labs/GomokuLab.vue'
import MnistCanvasLab from './components/labs/MnistCanvasLab.vue'
import HandDrawnConvolutionLab from './components/labs/HandDrawnConvolutionLab.vue'
import MultiChannelConvolutionLab from './components/labs/MultiChannelConvolutionLab.vue'
import { renderMarkdown } from './lib/manuscripts.mjs'
import cover01 from './assets/covers/chapter-01.svg?raw'
import cover02 from './assets/covers/chapter-02.svg?raw'
import cover03 from './assets/covers/chapter-03.svg?raw'
import cover04 from './assets/covers/chapter-04.svg?raw'
const coverArt = [cover01, cover02, cover03, cover04].map(svg => svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, ''))

const props = defineProps<{ boot: any }>()
let initialState: any = {}
try { initialState = JSON.parse(localStorage.getItem('ai-learning-lab.progress.v2') || '{}') } catch {}
const locale = ref<'zh' | 'en'>(initialState.locale === 'en' ? 'en' : 'zh')
const chapterId = ref<string | null>(props.boot.initialChapter || null)
const pageIndex = ref(initialState.positions?.[props.boot.initialChapter] || 0)
const completed = ref<Record<string, boolean>>(initialState.completed || {})
const positions = ref<Record<string, number>>(initialState.positions || {})
const furthest = ref<Record<string, number>>(initialState.furthest || {})
const read = ref<Record<string, boolean>>({})
const visible = ref<Record<string, string>>({})
const finished = ref(false)
const playerControls = ref<HTMLElement | null>(null)
const controlsHeight = ref(94)
let controlsObserver: ResizeObserver | undefined
function measureControls() {
  if (playerControls.value) controlsHeight.value = Math.ceil(playerControls.value.getBoundingClientRect().height)
}
watch(playerControls, element => {
  controlsObserver?.disconnect()
  if (!element) return
  measureControls()
  if (typeof ResizeObserver !== 'undefined') {
    controlsObserver = new ResizeObserver(measureControls)
    controlsObserver.observe(element)
  }
}, { flush: 'post' })
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
let timer: ReturnType<typeof setTimeout> | undefined
let generation = 0
const chapter = computed(() => props.boot.chapters.find((item: any) => item.id === chapterId.value))
const languageChapter = computed(() => chapter.value?.[locale.value])
const page = computed(() => languageChapter.value?.pages[pageIndex.value])
const hasAside = computed(() => page.value && (page.value.module || page.value.illustration || page.value.embedded.length))
const moduleMap: any = { 'linear-regression': LinearRegressionLab, 'ar-forecast': ARForecastLab, 'gradient-descent-1d': GradientDescent1DLab, 'gradient-descent-surface': GradientDescentSurfaceLab, 'gomoku-play': GomokuLab, 'gomoku-scores': GomokuLab, 'handwritten-digit-recognition': MnistCanvasLab, 'hand-drawn-convolution': HandDrawnConvolutionLab, 'multi-kernel-convolution': MultiChannelConvolutionLab }
const gateModules = new Set(['linear-regression', 'gradient-descent-1d', 'gradient-descent-surface'])
const gated = computed(() => gateModules.has(page.value?.module))
const passed = computed(() => !!completed.value[page.value?.id])
const mayContinue = computed(() => finished.value && (!gated.value || passed.value))
const words = computed(() => locale.value === 'zh' ? {
  brand: 'AI 科学实验馆', subtitle: '从一个数据点，到一个神经网络。', library: '交互课程', enter: '进入章节', pages: '页', progress: '学习进度', exit: '退出章节', previous: '上一页', reveal: '显示全文', next: '下一页', finish: '完成章节', playing: '讲解中', ready: '可以继续', locked: '完成任务后继续', passed: '已通过', task: '任务', experiment: '交互实验', illustration: '原理图解', formula: '公式推导', drag: '拖动数据点，使 R² > 0.9', minimum: '收敛到当前函数的全局最小值', surface: '到达当前曲面的一个全局最小值', reading: '阅读与探索', hint: '空格显示全文 · 方向键翻页', resume: '继续学习', section: '章节', offline: '独立 HTML · 中英双语', credits: '动手，才能看见原理。', audio: '文字逐字显示', restart: '重新开始'
} : {
  brand: 'AI Science Lab', subtitle: 'From a data point to a neural network.', library: 'Interactive lessons', enter: 'Open chapter', pages: 'pages', progress: 'Progress', exit: 'Exit chapter', previous: 'Previous', reveal: 'Reveal text', next: 'Next', finish: 'Finish chapter', playing: 'Narrating', ready: 'Ready to continue', locked: 'Complete the task to continue', passed: 'Completed', task: 'Challenge', experiment: 'Interactive experiment', illustration: 'Visual explanation', formula: 'Derivation', drag: 'Drag points until R² > 0.9', minimum: 'Converge to a global minimum of the selected function', surface: 'Reach a global minimum of the selected surface', reading: 'Read & explore', hint: 'Space reveals text · Arrow keys turn pages', resume: 'Continue', section: 'Chapter', offline: 'Standalone HTML · 中文 / English', credits: 'Understand it by doing it.', audio: 'Progressive narration', restart: 'Start over'
})
const chapterTitles = ['REGRESSION', 'OPTIMIZATION', 'NEURAL NETWORKS', 'CONVOLUTION']
const taskText = computed(() => page.value?.module === 'linear-regression' ? words.value.drag : page.value?.module === 'gradient-descent-1d' ? words.value.minimum : words.value.surface)
const image = computed(() => {
  if (!page.value?.illustration) return ''
  const name = page.value.illustration.replace('.svg', `.${locale.value}.svg`)
  const svg = props.boot.images[name]
  return svg ? `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}` : ''
})

function save() {
  try { localStorage.setItem('ai-learning-lab.progress.v2', JSON.stringify({ completed: completed.value, positions: positions.value, furthest: furthest.value, locale: locale.value })) } catch {}
}
function selectChapter(id: string, restart = false) {
  chapterId.value = id
  pageIndex.value = restart ? 0 : positions.value[id] || 0
  if (restart) {
    furthest.value[id] = 0
    Object.keys(completed.value).filter(key => key.startsWith(`ch${id.slice(-2)}.`)).forEach(key => { delete completed.value[key]; delete read.value[key] })
  }
}
function reveal() {
  clearTimeout(timer); generation++
  if (!page.value) return
  visible.value = Object.fromEntries(page.value.blocks.map((block: any) => [block.id, block.raw]))
  finished.value = true; read.value[page.value.id] = true
}
function typePage() {
  clearTimeout(timer); const token = ++generation
  visible.value = {}; finished.value = false
  if (!page.value) return
  if (read.value[page.value.id] || reducedMotion) { reveal(); return }
  const blocks = page.value.blocks
  let blockIndex = 0; let charIndex = 0
  const parts = blocks.map((block: any) => block.raw.match(/\$\$[\s\S]*?\$\$|\$[^$]+\$|<[^>]+>|[^]/gu) || [])
  const advance = () => {
    if (token !== generation) return
    if (blockIndex >= blocks.length) { finished.value = true; read.value[page.value.id] = true; return }
    const block = blocks[blockIndex]
    const atoms = parts[blockIndex]
    if (charIndex < atoms.length) {
      visible.value[block.id] = (visible.value[block.id] || '') + atoms[charIndex++]
      timer = setTimeout(advance, locale.value === 'zh' ? 38 : 14)
    } else { blockIndex++; charIndex = 0; timer = setTimeout(advance, 220) }
  }
  advance()
}
function next() {
  if (!mayContinue.value) return
  if (pageIndex.value + 1 === languageChapter.value.pages.length) { chapterId.value = null; return }
  pageIndex.value++
}
function previous() { if (pageIndex.value > 0) pageIndex.value-- }
function complete(id: string) { completed.value[id] = true; save() }
function keydown(event: KeyboardEvent) {
  if (!chapter.value || event.defaultPrevented || (event.target as HTMLElement)?.closest('.lab') || /INPUT|TEXTAREA|SELECT|BUTTON/.test((event.target as HTMLElement)?.tagName)) return
  if (event.code === 'Space') { event.preventDefault(); reveal() }
  if (event.key === 'ArrowRight') next()
  if (event.key === 'ArrowLeft') previous()
  if (event.key === 'Escape') chapterId.value = null
}
watch([chapterId, pageIndex, locale], () => {
  document.documentElement.lang = locale.value === 'zh' ? 'zh-CN' : 'en'
  if (chapter.value) {
    pageIndex.value = Math.max(0, Math.min(pageIndex.value, languageChapter.value.pages.length - 1))
    positions.value[chapter.value.id] = pageIndex.value
    furthest.value[chapter.value.id] = Math.max(furthest.value[chapter.value.id] || 0, pageIndex.value)
    document.title = languageChapter.value.title
  } else document.title = 'AI Learning Lab'
  nextTick(typePage); save()
}, { immediate: true })
watch([chapterId, pageIndex], () => nextTick(() => window.scrollTo({ top: 0, behavior: 'instant' })))
onMounted(() => {
  window.addEventListener('keydown', keydown)
  window.addEventListener('resize', measureControls)
})
onBeforeUnmount(() => { clearTimeout(timer); controlsObserver?.disconnect(); window.removeEventListener('keydown', keydown); window.removeEventListener('resize', measureControls) })
</script>

<template>
  <div class="application" :style="{ '--player-controls-height': `${controlsHeight}px` }">
    <header class="masthead">
      <button class="wordmark" @click="chapterId = null" aria-label="AI Learning Lab"><span class="brand-mark" aria-hidden="true"><span class="brand-letters"><span class="brand-a">a</span><span class="brand-i">i</span></span></span><span>AI LEARNING LAB<small>{{ words.brand }}</small></span></button>
      <div class="header-right"><span class="edition">INTERACTIVE FIELD NOTES / 01—04</span><div class="language-switch" aria-label="Language"><button :class="{ active: locale === 'zh' }" @click="locale = 'zh'">中</button><button :class="{ active: locale === 'en' }" @click="locale = 'en'">EN</button></div></div>
    </header>

    <main v-if="!chapter" class="library">
      <section class="library-intro"><div><p class="eyebrow"><span class="status-dot green"></span> {{ words.library }}</p><h1>{{ words.brand }}<span class="title-dot">.</span></h1><p class="intro-description">{{ words.subtitle }}</p></div><svg class="orbit-art" viewBox="0 0 220 160" aria-hidden="true"><g fill="none" stroke="currentColor"><ellipse cx="110" cy="80" rx="90" ry="34" transform="rotate(-28 110 80)"/><ellipse cx="110" cy="80" rx="90" ry="34" transform="rotate(28 110 80)"/><path d="M110 12v136M20 80h180" stroke-dasharray="2 5" opacity=".3"/></g><circle cx="110" cy="80" r="12" fill="currentColor"/><circle cx="178" cy="40" r="6" fill="#19834d"/><circle cx="37" cy="55" r="4" fill="#c84740"/></svg></section>
      <div class="chapter-grid"><article v-for="item in boot.chapters" :key="item.id" class="chapter-card"><div class="card-top"><span class="card-number">0{{ item.number }}</span><span class="micro-label">{{ chapterTitles[item.number - 1] }}</span></div><svg class="chapter-art" viewBox="0 0 300 130" aria-hidden="true" v-html="coverArt[item.number - 1]"></svg><h2>{{ item[locale].title.replace(/^(?:第.章：|Chapter \d+:)\s*[—：]*/, '') }}</h2><div class="card-bottom"><span>{{ item[locale].pages.length }} {{ words.pages }} <span v-if="positions[item.id]">/ {{ Math.round((positions[item.id] + 1) / item[locale].pages.length * 100) }}%</span></span><button class="open-chapter" @click="selectChapter(item.id)">{{ positions[item.id] ? words.resume : words.enter }} <span>↗</span></button></div></article></div>
      <footer class="library-footer"><span>{{ words.credits }}</span><span>{{ words.offline }}</span></footer>
    </main>

    <main v-else class="course" :class="{ 'with-aside': hasAside }">
      <div class="chapter-heading"><div><p class="eyebrow">{{ words.section }} {{ String(chapter.number).padStart(2, '0') }} / {{ chapterTitles[chapter.number - 1] }}</p><h1>{{ languageChapter.title }}</h1></div><span class="page-number">{{ String(pageIndex + 1).padStart(2, '0') }}<small>/ {{ String(languageChapter.pages.length).padStart(2, '0') }}</small></span></div>
      <section class="lesson-stage" :class="{ 'text-only': !hasAside }">
        <div class="narration-column"><div class="section-label"><span class="status-dot" :class="finished ? 'green' : 'gray'"></span>{{ finished ? words.reading : words.playing }}</div><div class="narration" @click="!finished && reveal()"><div v-for="block in page.blocks" :key="block.id" class="paragraph" :class="{ blank: /^<p>\s*<\/p>$/.test(block.raw) }"><div class="paragraph-reserve" aria-hidden="true" v-html="block.html"></div><div class="paragraph-visible" v-html="renderMarkdown(visible[block.id] || '')"></div></div><span v-if="!finished" class="typing-cursor" aria-hidden="true"></span></div><div v-if="gated" class="challenge-note" :class="{ success: passed }"><span>{{ passed ? '✓' : '↗' }}</span><div><strong>{{ passed ? words.passed : words.task }}</strong><p>{{ taskText }}</p></div></div><div v-else class="narration-tail"><span>—</span><span>{{ words.audio }}</span></div></div>
        <aside v-if="hasAside" class="experiment-column" :class="{ pending: !finished, 'has-illustration': !!page.illustration }"><div class="experiment-heading"><span>{{ page.module ? words.experiment : page.illustration ? words.illustration : words.formula }}</span><span class="micro-label">{{ String(chapter.number).padStart(2, '0') }}.{{ String(pageIndex + 1).padStart(2, '0') }}</span></div><div class="experiment-content"><KeepAlive :max="12"><component v-if="page.module" :is="moduleMap[page.module]" :key="page.id" :locale="locale" :copy="languageChapter.copy" :mode="page.module === 'gomoku-scores' ? 'score-visualization' : 'play'" :onComplete="complete.bind(null, page.id)" /></KeepAlive><object v-if="page.illustration" :key="page.illustration + locale" :data="image" type="image/svg+xml" class="lesson-illustration" :aria-label="words.illustration"></object><div v-if="page.embedded.length" class="embedded-math"><div v-for="block in page.embedded" :key="block.id" v-html="block.html"></div></div></div></aside>
      </section>
      <footer ref="playerControls" class="player-controls"><div class="traffic-controls"><button class="traffic red" :aria-label="words.exit" :title="words.exit" @click="chapterId = null"></button><button class="traffic gray" :aria-label="words.reveal" :title="words.reveal" @click="reveal"></button><button class="traffic green" :class="{ locked: !mayContinue }" :aria-label="pageIndex + 1 === languageChapter.pages.length ? words.finish : words.next" :title="!finished ? words.reveal : gated && !passed ? taskText : words.next" :disabled="!mayContinue" @click="next"></button></div><div class="page-track" :aria-label="words.progress"><button v-for="(item,index) in languageChapter.pages" :key="item.id" :class="{ current: index === pageIndex, visited: index < (furthest[chapter.id] || 0), complete: completed[item.id] }" :disabled="index > (furthest[chapter.id] || 0)" :aria-label="`${words.pages} ${index + 1}`" @click="pageIndex = index"></button></div><div class="control-end"><button class="back-page" :disabled="pageIndex === 0" @click="previous">← <span>{{ words.previous }}</span></button><span class="next-status" :class="{ success: passed }">{{ !finished ? words.playing : gated && !passed ? words.locked : passed ? words.passed : words.ready }}</span></div></footer>
    </main>
  </div>
</template>
