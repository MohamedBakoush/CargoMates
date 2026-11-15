<script setup>
import { ref, computed, watch } from 'vue'
import { state, go, switchMode, steps, senderHome } from '../store.js'
import Tracker from './Tracker.vue'
import Icon from './Icon.vue'

defineProps({
  back: { type: String, default: '' },
  calendar: { type: Boolean, default: false },
})

const showSteps = ref(false)
watch(() => state.route, () => { showSteps.value = false })

const stepNow = computed(() => {
  const list = steps.value
  const i = Math.max(0, list.findIndex((x) => x.now || (x.done && x.key === state.route)))
  return { n: i + 1, total: list.length, label: list[i].label }
})
</script>

<template>
  <div class="page">
    <header class="topbar">
      <button v-if="back" class="btn btn-round" aria-label="Back" @click="go(back)"><Icon name="back" /></button>
      <div class="brand">CargoMates</div>
      <button class="role-tag" aria-label="Sender home" @click="go(senderHome())">Sender</button>
      <div class="spacer" />
      <button class="btn btn-pill collapse" aria-label="Driver" @click="switchMode('driver')"><Icon name="truck" :size="20" /><span class="lbl">Driver</span></button>
      <button class="btn btn-pill collapse" aria-label="Orders" @click="go('history')"><Icon name="receipt" :size="20" /><span class="lbl">Orders</span></button>
      <button v-if="calendar" class="btn btn-pill collapse" aria-label="Calendar" @click="go('calendar')"><Icon name="calendar" :size="20" /><span class="lbl">Calendar</span></button>
    </header>

    <div class="body">
      <button class="stepbar" aria-label="Show all steps" @click="showSteps = true">
        <span>Step {{ stepNow.n }} of {{ stepNow.total }} · <b>{{ stepNow.label }}</b></span>
        <span class="stepbar-track"><span class="stepbar-fill" :style="{ width: (stepNow.n / stepNow.total) * 100 + '%' }" /></span>
      </button>
      <aside class="rail"><Tracker /></aside>
      <main class="main">
        <div class="main-inner"><slot /></div>
      </main>
    </div>

    <footer class="actionbar"><slot name="actions" /></footer>

    <Teleport to="body">
      <div v-if="showSteps" class="sheet-backdrop" @click.self="showSteps = false">
        <div class="sheet" role="dialog" aria-label="Your shipment progress">
          <div class="sheet-handle" />
          <Tracker />
        </div>
      </div>
    </Teleport>
  </div>
</template>
