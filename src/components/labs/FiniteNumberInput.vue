<script setup lang="ts">
import {computed,ref,watch} from 'vue'
import {formatFiniteDecimal,isDecimalDraft,parseFiniteDecimal} from '../../lib/numeric-input.mjs'
const props=defineProps<{modelValue:number|string,locale:'zh'|'en',label:string}>()
const emit=defineEmits<{'update:modelValue':[value:number|string]}>()
const parsed=computed(()=>parseFiniteDecimal(props.modelValue))
const display=computed(()=>typeof props.modelValue==='number'?formatFiniteDecimal(props.modelValue):props.modelValue)
const lastValid=ref(parsed.value??0)
const hint=computed(()=>props.locale==='zh'?'请输入有限数字，可使用负数和小数；未完成输入会恢复为最近的有效值。':'Enter a finite decimal number; negatives are allowed. Incomplete input restores the last valid value.')
watch(parsed,value=>{if(value!==null)lastValid.value=value},{flush:'sync'})
function beforeInput(event:InputEvent){
  if(event.isComposing||!event.inputType.startsWith('insert')||event.data===null)return
  const input=event.target as HTMLInputElement
  const next=input.value.slice(0,input.selectionStart??0)+event.data+input.value.slice(input.selectionEnd??input.value.length)
  if(!isDecimalDraft(next))event.preventDefault()
}
function input(event:Event){
  const element=event.target as HTMLInputElement,value=element.value
  if(!isDecimalDraft(value)||(value.match(/\d/)&&parseFiniteDecimal(value)===null)) {element.value=display.value;return}
  const number=parseFiniteDecimal(value)
  if(number!==null)lastValid.value=number
  // Preserve a valid decimal draft such as -0. or 1. while the user is typing.
  emit('update:modelValue',value)
}
function commit(event:Event){
  const number=parsed.value??lastValid.value
  const element=event.target as HTMLInputElement
  element.value=formatFiniteDecimal(number)
  emit('update:modelValue',number)
}
</script>
<template><input :value="display" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" :aria-label="label" :aria-invalid="parsed===null" :title="hint" @beforeinput="beforeInput" @input="input" @blur="commit" @keydown.enter.prevent="commit"/></template>
<style scoped>input[aria-invalid="true"]{border-color:#b44b42;outline-color:#b44b42}</style>
