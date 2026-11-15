<script setup>
import { ref, computed } from 'vue'
import { state, go, fmtDay, isAbroad, setStatus, postMessage } from '../store.js'
import PageLayout from '../components/PageLayout.vue'
import RouteMap from '../components/RouteMap.vue'

const s = state.shipment
const CLOSE_KM = 30
const progress = ref(55) // percent, comes from live GPS later
const callRequested = ref(s.messages.some((m) => m.kind === 'call-request'))

function requestCall() {
  callRequested.value = true
  postMessage(s.messages, 'system', `You asked ${s.booking.driver} to call you for directions.`)
  s.messages[s.messages.length - 1].kind = 'call-request'
}

const left = computed(() => (s.to ? Math.round(s.to.km * (1 - progress.value / 100)) : 0))
// The customer cannot call the driver. Once the truck is near they can ask the driver to call them.
const isClose = computed(() => left.value <= CLOSE_KM)

// Prototype control: first tap brings the truck close, second tap arrives
function skipAhead() {
  if (!isClose.value) {
    progress.value = Math.max(progress.value, Math.ceil(100 - (20 / s.to.km) * 100))
    return
  }
  setStatus('arrived')
  go('arrived')
}
</script>

<template>
  <PageLayout back="booked" calendar>
    <template v-if="s.booking">
      <h1 class="h1">{{ isClose ? 'Almost there.' : 'On the way.' }}{{ isAbroad && !isClose ? ' Border cleared.' : '' }}</h1>
      <p class="sub">
        Arrives {{ s.booking.hub ? 'at your pickup point' : 'at the door' }} {{ fmtDay(s.booking.arrive) }}, around 14:00.
      </p>

      <div class="card route">
        <RouteMap :from="s.from" :to="s.to.name" :progress="progress" />
        <div class="ends"><span>{{ s.from }}</span><span>{{ s.to.name }}</span></div>
        <div class="bar"><div class="fill" :style="{ width: progress + '%' }" /></div>
        <div class="muted">{{ left }} km to go</div>
      </div>

      <div class="card contact">
        <div class="name">Contact {{ s.booking.driver }}</div>
        <template v-if="callRequested">
          <div class="muted">Call requested. {{ s.booking.driver }} will ring you for directions.</div>
        </template>
        <template v-else-if="isClose">
          <div class="muted">The driver is close. Need to give directions? Ask them to call you.</div>
          <button class="btn" @click="requestCall">Ask driver to call me</button>
        </template>
        <div v-else class="muted">
          You can message the driver any time. Once they are within {{ CLOSE_KM }} km you can ask them to call you for directions.
        </div>
      </div>

      <button class="card preview" @click="skipAhead">
        <span class="grow">
          <span class="name">We tell you when it arrives</span>
          <span class="muted">Prototype: tap to {{ isClose ? 'skip to arrival' : 'move the truck close' }}</span>
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
      <button class="btn btn-primary" @click="go('chat')">Message driver</button>
    </template>
  </PageLayout>
</template>

<style scoped>
.route { display: flex; flex-direction: column; gap: 14px; }
.ends { display: flex; justify-content: space-between; font-weight: 600; }
.bar { height: 10px; background: #EDE7DD; border-radius: 5px; overflow: hidden; }
.fill { height: 100%; background: var(--accent); border-radius: 5px; transition: width 0.6s ease; }
.contact { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
.contact .btn { min-height: 52px; font-size: 16px; }
.preview { border: 0; background: var(--soft); text-align: left; display: flex; align-items: center; gap: 14px; min-height: 72px; width: 100%; }
.grow { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.name { font-size: 17px; font-weight: 600; }
</style>
