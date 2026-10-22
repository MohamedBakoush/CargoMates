<script setup>
import { computed } from 'vue'
import { state, go, fmtDay, isAbroad, setStatus } from '../store.js'
import PageLayout from '../components/PageLayout.vue'

const s = state.shipment
const progress = 55 // percent, comes from live GPS later

const left = computed(() => (s.to ? Math.round(s.to.km * (1 - progress / 100)) : 0))

function simulateArrival() {
  setStatus('arrived')
  go('arrived')
}
</script>

<template>
  <PageLayout back="booked" calendar>
    <template v-if="s.booking">
      <h1 class="h1">On the way.{{ isAbroad ? ' Border cleared.' : '' }}</h1>
      <p class="sub">
        {{ isAbroad ? 'Customs is done. ' : '' }}Arrives {{ s.booking.hub ? 'at your pickup point' : 'at the door' }} {{ fmtDay(s.booking.arrive) }}, around 14:00.
      </p>

      <div class="card route">
        <div class="map">[Live map of the route]</div>
        <div class="ends"><span>{{ s.from }}</span><span>{{ s.to.name }}</span></div>
        <div class="bar"><div class="fill" :style="{ width: progress + '%' }" /></div>
        <div class="muted">{{ left }} km to go</div>
      </div>

      <button class="card preview" @click="simulateArrival">
        <span class="grow">
          <span class="name">We tell you when it arrives</span>
          <span class="muted">Then you pay. (Prototype: tap to skip ahead)</span>
        </span>
        <span class="name">Skip</span>
      </button>
    </template>
    <h1 v-else class="h1">Nothing on the way</h1>

    <template #actions>
      <div class="info">
        <span class="big" style="font-size: 20px">{{ s.booking ? `Arrives ${fmtDay(s.booking.arrive)}, about 14:00` : '' }}</span>
        <span class="small">{{ s.booking ? s.booking.driver : '' }} · on schedule</span>
      </div>
      <a class="btn" href="sms:">Message</a>
      <a class="btn btn-primary" href="tel:">Call driver</a>
    </template>
  </PageLayout>
</template>

<style scoped>
.route { display: flex; flex-direction: column; gap: 14px; }
.map { height: 200px; border-radius: 16px; background: var(--soft); display: flex; align-items: center; justify-content: center; color: var(--muted); }
.ends { display: flex; justify-content: space-between; font-weight: 600; }
.bar { height: 10px; background: #EDE7DD; border-radius: 5px; overflow: hidden; }
.fill { height: 100%; background: var(--accent); border-radius: 5px; }
.preview { border: 0; background: var(--soft); text-align: left; display: flex; align-items: center; gap: 14px; min-height: 72px; width: 100%; }
.grow { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.name { font-size: 17px; font-weight: 600; }
</style>
