<script setup lang="ts">
import { computed, onActivated, onBeforeUnmount, onDeactivated, ref } from 'vue'
import { renderCopy } from '../../lib/copy'
const props = withDefaults(defineProps<{ locale: 'zh' | 'en'; copy: Record<string, string>; mode?: 'play' | 'score-visualization' }>(), { mode: 'play' })
const emit = defineEmits<{ complete: [] }>()
const board = ref<number[][]>([])
const scores = ref<number[][]>([])
const busy = ref(false)
const outcome = ref<'playerWin' | 'aiWin' | 'draw' | null>(null)
const lastMove = ref<[number, number] | null>(null)
let turnTimer: ReturnType<typeof setTimeout> | undefined
const text = computed(() => props.locale === 'zh' ? { turn: '白棋轮到你', thinking: '黑棋正在计算', empty: '空位', score: '候选位置评分', hint: '你执白棋。点击空位落子，横、竖或斜向连成五子获胜。', legend: '黑棋 · AI　 /　 白棋 · 你', row: '行', column: '列' } : { turn: 'White — your turn', thinking: 'Black is calculating', empty: 'Empty intersection', score: 'Candidate scores', hint: 'You play white. Select an empty intersection. Connect five stones horizontally, vertically or diagonally.', legend: 'Black · AI　 /　 White · you', row: 'Row', column: 'column' })
const ui = (key: string) => renderCopy(props.copy, key)
const directions: [number, number][] = [[0, 1], [1, 0], [1, 1], [1, -1]]
function inside(r: number, c: number) { return r >= 0 && r < 15 && c >= 0 && c < 15 }
function evaluate(r: number, c: number, player: number) {
  let score = 0
  for (const [dr, dc] of directions) {
    let left = 0, right = 0
    while (inside(r - (left + 1) * dr, c - (left + 1) * dc) && board.value[r - (left + 1) * dr][c - (left + 1) * dc] === player) left++
    while (inside(r + (right + 1) * dr, c + (right + 1) * dc) && board.value[r + (right + 1) * dr][c + (right + 1) * dc] === player) right++
    const lr = r - (left + 1) * dr, lc = c - (left + 1) * dc
    const rr = r + (right + 1) * dr, rc = c + (right + 1) * dc
    const blockedLeft = !inside(lr, lc) || board.value[lr][lc] !== 0
    const blockedRight = !inside(rr, rc) || board.value[rr][rc] !== 0
    const total = left + right + 1
    if (total >= 5) score += 100000
    else if (total === 4) score += !blockedLeft && !blockedRight ? 10000 : (!blockedLeft || !blockedRight) ? 1000 : 0
    else if (total === 3) score += !blockedLeft && !blockedRight ? 1000 : (!blockedLeft || !blockedRight) ? 500 : 0
    else if (total === 2) score += !blockedLeft && !blockedRight ? 200 : (!blockedLeft || !blockedRight) ? 50 : 0
  }
  return score
}
function calculateScores() {
  scores.value = board.value.map((row, r) => row.map((cell, c) => cell ? 0 : evaluate(r, c, 1) + 1.2 * evaluate(r, c, 2) - 10 * (Math.abs(r - 7) + Math.abs(c - 7))))
}
const highest = computed(() => Math.max(...scores.value.flat(), 1))
function wins(r: number, c: number, player: number) {
  return directions.some(([dr, dc]) => {
    let count = 1
    for (const sign of [-1, 1]) {
      let distance = 1
      while (inside(r + sign * distance * dr, c + sign * distance * dc) && board.value[r + sign * distance * dr][c + sign * distance * dc] === player) { count++; distance++ }
    }
    return count >= 5
  })
}
function finish(value: 'playerWin' | 'aiWin' | 'draw') { outcome.value = value; busy.value = false; emit('complete') }
function move(r: number, c: number) {
  if (board.value[r][c] || busy.value || outcome.value) return
  board.value[r][c] = 2; lastMove.value = [r, c]
  if (wins(r, c, 2)) { finish('playerWin'); return }
  if (board.value.every(row => row.every(Boolean))) { finish('draw'); return }
  busy.value = true
  scheduleResponse()
}
function scheduleResponse() {
  clearTimeout(turnTimer)
  turnTimer = setTimeout(() => {
    calculateScores()
    let best = -Infinity, selection: [number, number] | undefined
    board.value.forEach((row, ar) => row.forEach((cell, ac) => { if (!cell && scores.value[ar][ac] > best) { best = scores.value[ar][ac]; selection = [ar, ac] } }))
    if (selection) {
      const [ar, ac] = selection
      board.value[ar][ac] = 1; lastMove.value = [ar, ac]
      if (wins(ar, ac, 1)) { finish('aiWin'); return }
    }
    busy.value = false
    if (board.value.every(row => row.every(Boolean))) finish('draw')
    calculateScores()
  }, 220)
}
function reset() {
  clearTimeout(turnTimer); busy.value = false; outcome.value = null; lastMove.value = null
  board.value = Array.from({ length: 15 }, () => Array(15).fill(0)); board.value[7][7] = 1
  calculateScores()
}
function scoreLabel(value: number) { return value >= 10000 ? `${(value / 1000).toFixed(0)}k` : Math.round(value).toString() }
onDeactivated(() => clearTimeout(turnTimer))
onActivated(() => { if (busy.value && !outcome.value) scheduleResponse() })
onBeforeUnmount(() => clearTimeout(turnTimer))
reset()
</script>

<template>
  <section class="lab gomoku-lab">
    <div class="game-toolbar"><span class="turn-label"><span class="status-dot" :class="{ waiting: busy }"></span><span v-if="outcome" v-html="ui(`gomoku.${outcome}`)"></span><span v-else>{{ busy ? text.thinking : text.turn }}</span></span><button type="button" @click="reset" v-html="ui('gomoku.nextGame')"></button></div>
    <div class="gomoku-board" role="group" :aria-label="copy['gomoku.documentTitle']" :aria-busy="busy">
      <template v-for="(row, r) in board" :key="r">
        <button v-for="(cell, c) in row" :key="`${r}-${c}`" type="button" class="intersection" :class="{ occupied: cell, 'last-move': lastMove?.[0] === r && lastMove?.[1] === c }" :disabled="Boolean(cell || busy || outcome)" :aria-label="`${text.row} ${r + 1}, ${text.column} ${c + 1}${mode === 'score-visualization' && !cell ? `, ${text.score} ${Math.round(scores[r][c])}` : ''}`" @click="move(r, c)">
          <span v-if="cell" class="stone" :class="cell === 1 ? 'black' : 'white'"></span>
          <span v-else-if="mode === 'score-visualization'" class="score" :class="{ strongest: scores[r][c] === highest }">{{ scoreLabel(scores[r][c]) }}</span>
          <span v-else-if="[3, 7, 11].includes(r) && [3, 7, 11].includes(c)" class="star-point"></span>
        </button>
      </template>
    </div>
    <p class="lab-hint legend">{{ text.legend }}</p>
    <p class="lab-hint">{{ text.hint }}</p>
  </section>
</template>

<style scoped>
.gomoku-lab{max-width:740px;margin:auto}.game-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}.turn-label{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600}.status-dot{width:7px;height:7px;border-radius:50%;background:#218158}.status-dot.waiting{background:#888}.gomoku-board{display:grid;grid-template-columns:repeat(15,minmax(0,1fr));width:min(100%,580px);aspect-ratio:1;margin:auto;padding:12px;background:#eeefec;border:1px solid #d4d6d1;border-radius:6px;box-shadow:0 8px 30px #00000006}.intersection{position:relative;min-width:0;padding:0;border:0;border-radius:0;aspect-ratio:1;touch-action:manipulation;background:linear-gradient(#a9ada6,#a9ada6) center/1px 100% no-repeat,linear-gradient(#a9ada6,#a9ada6) center/100% 1px no-repeat;cursor:pointer;box-shadow:none!important}.intersection:hover:not(:disabled){background-color:#d5e5db}.intersection:focus-visible{outline:2px solid #218158;outline-offset:0;z-index:2}.intersection:disabled{opacity:1;cursor:default}.stone{position:absolute;inset:10%;border-radius:50%;box-shadow:0 2px 4px #0003}.stone.black{background:radial-gradient(circle at 32% 25%,#535353,#171717 65%);border:1px solid #111}.stone.white{background:radial-gradient(circle at 32% 25%,#fff,#e4e4e1 75%);border:1px solid #a9aaa6}.last-move .stone:after{content:'';position:absolute;inset:38%;border-radius:50%;background:#b3423c}.score{position:absolute;inset:0;display:grid;place-items:center;background:#eeefecbb;font-size:clamp(7px,1.2vw,10px);color:#697068;font-variant-numeric:tabular-nums}.score.strongest{color:#147345;font-weight:800;background:#d6eadd}.star-point{position:absolute;inset:43%;border-radius:50%;background:#777}.legend{text-align:center;font-size:12px!important;margin-bottom:5px!important}@media(max-width:500px){.gomoku-board{padding:5px}.score{font-size:7px}.game-toolbar{gap:5px}.turn-label{font-size:12px}.game-toolbar button{font-size:12px;padding:7px 10px}}
</style>
