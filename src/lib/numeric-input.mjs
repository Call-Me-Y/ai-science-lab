// Kernel controls use decimal notation, including temporary prefixes while typing.
export function isDecimalDraft(value) { return typeof value==='string' && /^[+-]?(?:\d*(?:\.\d*)?)$/.test(value) }
export function parseFiniteDecimal(value) {
  if(typeof value==='number')return Number.isFinite(value)?value:null
  if(typeof value!=='string'||!(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/).test(value))return null
  const parsed=Number(value)
  return Number.isFinite(parsed)?parsed:null
}
export function formatFiniteDecimal(value) {
  if(!Number.isFinite(value))throw new TypeError('A finite number is required')
  const raw=String(value)
  if(!/[eE]/.test(raw))return raw
  const negative=raw.startsWith('-'),[mantissa,exponent]=raw.replace(/^-/, '').toLowerCase().split('e')
  const [whole,fraction='']=mantissa.split('.'),digits=whole+fraction,position=whole.length+Number(exponent)
  const decimal=position<=0?'0.'+'0'.repeat(-position)+digits:position>=digits.length?digits+'0'.repeat(position-digits.length):digits.slice(0,position)+'.'+digits.slice(position)
  return (negative?'-':'')+decimal
}
export function parseKernel(values) {
  const parsed=values.map(parseFiniteDecimal)
  return parsed.length===9&&parsed.every(value=>value!==null)?parsed:null
}
