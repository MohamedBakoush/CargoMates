<script setup>
// Destination field with big, touch-friendly suggestions while typing.
import { ref, computed } from 'vue'
import { CITIES, state } from '../store.js'

const focused = ref(false)
const s = state.shipment

const matches = computed(() => {
  const q = s.toQuery.trim().toLowerCase()
  if (!q) return CITIES.slice(0, 4)
  return CITIES.filter((c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)).slice(0, 5)
})

function onInput(e) {
  s.toQuery = e.target.value
  s.to = null
}

function choose(c) {
  s.to = c
  s.toQuery = c.name
  focused.value = false
}

function onBlur() {
  // let a tap on a suggestion land first
  setTimeout(() => { focused.value = false }, 150)
}
</script>

<template>
  <span class="wrap">
    <input
      class="word"
      :class="{ focus: focused, empty: !s.toQuery }"
      :value="s.toQuery"
      placeholder="city"
      aria-label="Deliver to"
      autocomplete="off"
      :style="{ width: Math.max(150, (s.toQuery.length || 4) * 17 + 40) + 'px' }"
      @input="onInput"
      @focus="focused = true"
      @blur="onBlur"
    >
    <span v-if="focused && matches.length" class="list" role="listbox">
      <button v-for="c in matches" :key="c.name" class="item" role="option" @mousedown.prevent @click="choose(c)">
        <span class="city">{{ c.name }}</span>
        <span class="country">{{ c.country }}</span>
      </button>
    </span>
  </span>
</template>

<style scoped>
.wrap { position: relative; display: inline-block; vertical-align: middle; }
.list { position: absolute; top: 100%; left: 0; margin-top: 8px; width: 340px; max-width: 80vw; background: var(--card); border-radius: 18px; box-shadow: 0 10px 32px rgba(31, 29, 26, 0.14); display: flex; flex-direction: column; overflow: hidden; z-index: 20; line-height: 1.3; }
.item { min-height: 64px; border: 0; border-bottom: 1px solid #EDE7DD; background: var(--card); text-align: left; padding: 10px 18px; display: flex; flex-direction: column; justify-content: center; }
.item:last-child { border-bottom: 0; }
.city { font-size: 18px; font-weight: 600; }
.country { font-size: 14px; color: var(--muted); }
</style>
