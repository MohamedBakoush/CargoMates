<script setup>
import { steps, go } from '../store.js'
import Icon from './Icon.vue'
</script>

<template>
  <nav class="tracker" aria-label="Your shipment progress">
    <div class="label" style="margin-bottom: 16px">Your shipment</div>
    <ol>
      <li v-for="(s, i) in steps" :key="s.key" :class="{ done: s.done, now: s.now, later: s.later }">
        <div class="dot-col">
          <span class="dot">
            <Icon v-if="s.done" name="check" :size="14" :stroke="3" />
          </span>
          <span v-if="i < steps.length - 1" class="line" />
        </div>
        <component :is="s.canJump ? 'button' : 'div'" class="text" @click="s.canJump && go(s.key)">
          <span class="step-label">{{ s.label }}</span>
          <span v-if="s.now" class="here">You are here</span>
          <span v-else-if="s.done && s.summary" class="summary">{{ s.summary }}</span>
        </component>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
.tracker { background: var(--card); border-radius: 24px; padding: 20px; }
ol { list-style: none; margin: 0; padding: 0; }
li { display: flex; gap: 14px; }
.dot-col { display: flex; flex-direction: column; align-items: center; width: 26px; flex: none; }
.dot { width: 26px; height: 26px; border-radius: 50%; border: 2px solid var(--line-strong); background: var(--card); display: flex; align-items: center; justify-content: center; flex: none; }
.line { width: 2px; flex: 1; min-height: 16px; background: var(--line); }
.done .dot { background: var(--accent); border-color: var(--accent); color: var(--ink); }
.done .line { background: var(--accent); }
.now .dot { border: 3px solid var(--navy); }
.text { flex: 1; min-width: 0; min-height: 48px; padding: 0 0 12px; border: 0; background: none; text-align: left; display: flex; flex-direction: column; justify-content: flex-start; gap: 2px; }
button.text { cursor: pointer; }
.step-label { font-size: 16px; font-weight: 600; padding-top: 2px; }
.now .step-label { font-size: 17px; font-weight: 700; }
.later .step-label { font-weight: 400; color: var(--muted); }
.here { font-size: 13px; font-weight: 700; color: var(--navy); }
.summary { font-size: 14px; color: var(--muted); }
</style>
