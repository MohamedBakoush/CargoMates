<script setup>
import { go, switchMode } from '../store.js'
import Tracker from './Tracker.vue'
import Icon from './Icon.vue'

defineProps({
  back: { type: String, default: '' },
  calendar: { type: Boolean, default: false },
})
</script>

<template>
  <div class="page">
    <header class="topbar">
      <button v-if="back" class="btn btn-round" aria-label="Back" @click="go(back)"><Icon name="back" /></button>
      <div class="brand">CargoMates</div>
      <div class="spacer" />
      <button class="btn btn-pill" @click="switchMode('driver')"><Icon name="truck" :size="20" />Driver</button>
      <button class="btn btn-pill" @click="go('history')"><Icon name="receipt" :size="20" />Orders</button>
      <button v-if="calendar" class="btn btn-pill" @click="go('calendar')"><Icon name="calendar" :size="20" />Calendar</button>
    </header>

    <div class="body">
      <aside class="rail"><Tracker /></aside>
      <main class="main">
        <div class="main-inner"><slot /></div>
      </main>
    </div>

    <footer class="actionbar"><slot name="actions" /></footer>
  </div>
</template>
