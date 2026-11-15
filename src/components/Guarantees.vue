<script setup>
// Full panel on the landing page; elsewhere one line that opens the same list in a sheet.
import { ref } from 'vue'
import { GUARANTEES } from '../store.js'
import Icon from './Icon.vue'

defineProps({
  compact: { type: Boolean, default: false },
})
const open = ref(false)
</script>

<template>
  <button v-if="compact" class="promise-line" @click="open = true">
    <Icon name="shield" :size="20" :stroke="2" />
    <span class="grow">Covered by the CargoMates Promise</span>
    <span class="see">See all</span>
  </button>

  <div v-else class="panel">
    <div class="g-header">
      <Icon name="shield" :size="24" :stroke="2" />
      <span class="g-title">The CargoMates Promise</span>
    </div>
    <div class="g-grid">
      <div v-for="g in GUARANTEES" :key="g.id" class="g-item">
        <span class="g-icon"><Icon :name="g.icon" :size="20" :stroke="1.6" /></span>
        <span class="g-text">
          <span class="g-name">{{ g.title }}</span>
          <span class="g-desc">{{ g.desc }}</span>
        </span>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="open" class="sheet-backdrop" @click.self="open = false">
      <div class="sheet" role="dialog" aria-label="The CargoMates Promise">
        <div class="sheet-handle" />
        <p class="sheet-title">The CargoMates Promise</p>
        <div v-for="g in GUARANTEES" :key="g.id" class="g-item">
          <span class="g-icon light"><Icon :name="g.icon" :size="20" :stroke="1.6" /></span>
          <span class="g-text">
            <span class="g-name">{{ g.title }}</span>
            <span class="g-desc">{{ g.desc }}</span>
          </span>
        </div>
        <button class="btn" @click="open = false">Close</button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.promise-line { width: 100%; min-height: 52px; display: flex; align-items: center; gap: 10px; padding: 0 16px; border: 0; border-radius: 14px; background: #EEF2FA; color: var(--navy); font-size: 15px; font-weight: 600; text-align: left; }
.grow { flex: 1; }
.see { font-size: 14px; font-weight: 500; text-decoration: underline; }

.panel { background: var(--navy); color: #fff; border-radius: var(--radius); padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.g-header { display: flex; align-items: center; gap: 10px; }
.g-title { font-size: 19px; font-weight: 700; }
.g-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 20px; }
.g-item { display: flex; align-items: flex-start; gap: 10px; }
.g-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(255, 255, 255, 0.12); display: flex; align-items: center; justify-content: center; flex: none; }
.g-icon.light { background: #DDE4F0; color: var(--navy); }
.g-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.g-name { font-size: 15px; font-weight: 600; line-height: 1.3; }
.g-desc { font-size: 13px; opacity: 0.75; line-height: 1.4; }

@media (max-width: 600px) {
  .g-grid { grid-template-columns: 1fr; gap: 12px; }
}
</style>
