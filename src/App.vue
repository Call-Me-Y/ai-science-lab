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
  brand: 'AI 科学实验馆', subtitle: '从一个数据点，到一个神经网络。', library: '交互课程', enter: '进入章节', pages: '页', progress: '学习进度', exit: '退出章节', previous: '上一页', reveal: '显示全文', next: '下一页', finish: '完成章节', playing: '讲解中', ready: '可以继续', locked: '完成任务后继续', passed: '已通过', task: '任务', experiment: '交互实验', illustration: '原理图解', formula: '公式推导', drag: '拖动数据点，使 R² > 0.9', minimum: '找到右侧全局最小值', surface: '让小球到达曲面最低点', reading: '阅读与探索', hint: '空格显示全文 · 方向键翻页', resume: '继续学习', section: '章节', offline: '独立 HTML · 中英双语', credits: '动手，才能看见原理。', audio: '文字逐字显示', restart: '重新开始'
} : {
  brand: 'AI Science Lab', subtitle: 'From a data point to a neural network.', library: 'Interactive lessons', enter: 'Open chapter', pages: 'pages', progress: 'Progress', exit: 'Exit chapter', previous: 'Previous', reveal: 'Reveal text', next: 'Next', finish: 'Finish chapter', playing: 'Narrating', ready: 'Ready to continue', locked: 'Complete the task to continue', passed: 'Completed', task: 'Challenge', experiment: 'Interactive experiment', illustration: 'Visual explanation', formula: 'Derivation', drag: 'Drag points until R² > 0.9', minimum: 'Find the global minimum on the right', surface: 'Reach the lowest point of the surface', reading: 'Read & explore', hint: 'Space reveals text · Arrow keys turn pages', resume: 'Continue', section: 'Chapter', offline: 'Standalone HTML · 中文 / English', credits: 'Understand it by doing it.', audio: 'Progressive narration', restart: 'Start over'
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
})
onBeforeUnmount(() => { clearTimeout(timer); window.removeEventListener('keydown', keydown) })
</script>

<template>
  <div class="application">
    <header class="masthead">
      <button class="wordmark" @click="chapterId = null" aria-label="AI Learning Lab"><span class="brand-mark">a<span>i</span></span><span>AI LEARNING LAB<small>{{ words.brand }}</small></span></button>
      <div class="header-right"><span class="edition">INTERACTIVE FIELD NOTES / 01—04</span><div class="language-switch" aria-label="Language"><button :class="{ active: locale === 'zh' }" @click="locale = 'zh'">中</button><button :class="{ active: locale === 'en' }" @click="locale = 'en'">EN</button></div></div>
    </header>

    <main v-if="!chapter" class="library">
      <section class="library-intro"><div><p class="eyebrow"><span class="status-dot green"></span> {{ words.library }}</p><h1>{{ words.brand }}<span class="title-dot">.</span></h1><p class="intro-description">{{ words.subtitle }}</p></div><svg class="orbit-art" viewBox="0 0 220 160" aria-hidden="true"><g fill="none" stroke="currentColor"><ellipse cx="110" cy="80" rx="90" ry="34" transform="rotate(-28 110 80)"/><ellipse cx="110" cy="80" rx="90" ry="34" transform="rotate(28 110 80)"/><path d="M110 12v136M20 80h180" stroke-dasharray="2 5" opacity=".3"/></g><circle cx="110" cy="80" r="12" fill="currentColor"/><circle cx="178" cy="40" r="6" fill="#19834d"/><circle cx="37" cy="55" r="4" fill="#c84740"/></svg></section>
      <div class="chapter-grid"><article v-for="item in boot.chapters" :key="item.id" class="chapter-card"><div class="card-top"><span class="card-number">0{{ item.number }}</span><span class="micro-label">{{ chapterTitles[item.number - 1] }}</span></div><svg class="chapter-art" viewBox="0 0 300 130" aria-hidden="true"><g v-if="item.number === 1"><path d="M25 110L275 20" stroke="currentColor" fill="none"/><circle v-for="(y,i) in [93,102,76,83,48,57,29,35]" :key="i" :cx="35+i*31" :cy="y" r="4" :fill="i===5?'#19834d':'currentColor'"/></g><g v-else-if="item.number === 2" fill="none" stroke="currentColor"><path d="M20 22C60 180 98 50 135 60S210 170 280 15"/><path d="M20 116H280" stroke-dasharray="2 5"/><circle cx="219" cy="98" r="6" fill="#19834d" stroke="none"/></g><g v-else-if="item.number === 3" stroke="currentColor"><template v-for="j in 3" :key="j"><line v-for="k in 3" :key="k" x1="90" :y1="j*31" x2="210" :y2="k*31" stroke-opacity=".2"/></template><circle v-for="i in 3" :key="i" cx="90" :cy="i*31" r="7" fill="white"/><circle v-for="i in 3" :key="i" cx="210" :cy="i*31" r="7" :fill="i===2?'#19834d':'white'"/></g><g v-else><rect v-for="i in 30" :key="i" :x="65+((i-1)%6)*27" :y="3+Math.floor((i-1)/6)*25" width="22" height="20" :fill="[8,9,14,15,20,21].includes(i)?'#19834d':'#e8e8e4'"/><rect x="142" y="24" width="84" height="75" fill="none" stroke="currentColor"/></g></svg><h2>{{ item[locale].title.replace(/^(?:第.章：|Chapter \d+:)\s*[—：]*/, '') }}</h2><div class="card-bottom"><span>{{ item[locale].pages.length }} {{ words.pages }} <span v-if="positions[item.id]">/ {{ Math.round((positions[item.id] + 1) / item[locale].pages.length * 100) }}%</span></span><button class="open-chapter" @click="selectChapter(item.id)">{{ positions[item.id] ? words.resume : words.enter }} <span>↗</span></button></div></article></div>
      <footer class="library-footer"><span>{{ words.credits }}</span><span>{{ words.offline }}</span></footer>
    </main>

    <main v-else class="course" :class="{ 'with-aside': hasAside }">
      <div class="chapter-heading"><div><p class="eyebrow">{{ words.section }} {{ String(chapter.number).padStart(2, '0') }} / {{ chapterTitles[chapter.number - 1] }}</p><h1>{{ languageChapter.title }}</h1></div><span class="page-number">{{ String(pageIndex + 1).padStart(2, '0') }}<small>/ {{ String(languageChapter.pages.length).padStart(2, '0') }}</small></span></div>
      <section class="lesson-stage" :class="{ 'text-only': !hasAside }">
        <div class="narration-column"><div class="section-label"><span class="status-dot" :class="finished ? 'green' : 'gray'"></span>{{ finished ? words.reading : words.playing }}</div><div class="narration" @click="!finished && reveal()"><div v-for="block in page.blocks" :key="block.id" class="paragraph" :class="{ blank: /^<p>\s*<\/p>$/.test(block.raw) }"><div class="paragraph-reserve" aria-hidden="true" v-html="block.html"></div><div class="paragraph-visible" v-html="renderMarkdown(visible[block.id] || '')"></div></div><span v-if="!finished" class="typing-cursor" aria-hidden="true"></span></div><div v-if="gated" class="challenge-note" :class="{ success: passed }"><span>{{ passed ? '✓' : '↗' }}</span><div><strong>{{ passed ? words.passed : words.task }}</strong><p>{{ taskText }}</p></div></div><div v-else class="narration-tail"><span>—</span><span>{{ words.audio }}</span></div></div>
        <aside v-if="hasAside" class="experiment-column" :class="{ pending: !finished }"><div class="experiment-heading"><span>{{ page.module ? words.experiment : page.illustration ? words.illustration : words.formula }}</span><span class="micro-label">{{ String(chapter.number).padStart(2, '0') }}.{{ String(pageIndex + 1).padStart(2, '0') }}</span></div><div class="experiment-content"><KeepAlive :max="12"><component v-if="page.module" :is="moduleMap[page.module]" :key="page.id" :locale="locale" :copy="languageChapter.copy" :mode="page.module === 'gomoku-scores' ? 'score-visualization' : 'play'" :onComplete="complete.bind(null, page.id)" /></KeepAlive><object v-if="page.illustration" :key="page.illustration + locale" :data="image" type="image/svg+xml" class="lesson-illustration" :aria-label="words.illustration"></object><div v-if="page.embedded.length" class="embedded-math"><div v-for="block in page.embedded" :key="block.id" v-html="block.html"></div></div></div></aside>
      </section>
      <footer class="player-controls"><div class="traffic-controls"><button class="traffic red" :aria-label="words.exit" :title="words.exit" @click="chapterId = null">×</button><button class="traffic gray" :aria-label="words.reveal" :title="words.reveal" @click="reveal">»</button><button class="traffic green" :class="{ locked: !mayContinue }" :aria-label="pageIndex + 1 === languageChapter.pages.length ? words.finish : words.next" :title="!finished ? words.reveal : gated && !passed ? taskText : words.next" :disabled="!mayContinue" @click="next">→</button></div><div class="page-track" :aria-label="words.progress"><button v-for="(item,index) in languageChapter.pages" :key="item.id" :class="{ current: index === pageIndex, visited: index < (furthest[chapter.id] || 0), complete: completed[item.id] }" :disabled="index > (furthest[chapter.id] || 0)" :aria-label="`${words.pages} ${index + 1}`" @click="pageIndex = index"></button></div><div class="control-end"><button class="back-page" :disabled="pageIndex === 0" @click="previous">← <span>{{ words.previous }}</span></button><span class="next-status" :class="{ success: passed }">{{ !finished ? words.playing : gated && !passed ? words.locked : passed ? words.passed : words.ready }}</span></div></footer>
    </main>
  </div>
</template>
