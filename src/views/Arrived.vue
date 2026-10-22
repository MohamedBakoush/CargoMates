<script setup>
import { state, go, fmtDay, kr, pay, startNew } from '../store.js'
import PageLayout from '../components/PageLayout.vue'
import Icon from '../components/Icon.vue'

const s = state.shipment
const METHODS = [
  { id: 'vipps', label: 'Vipps' },
  { id: 'card', label: 'Card' },
  { id: 'invoice', label: 'Invoice' },
]
</script>

<template>
  <PageLayout back="onway" calendar>
    <template v-if="s.booking">
      <template v-if="s.status !== 'paid'">
        <h1 class="h1">It arrived. {{ s.booking.hub ? 'Pick it up any time.' : 'Delivered to the door.' }}</h1>
        <p class="sub">
          <template v-if="s.booking.hub">At {{ s.booking.hub }} · open 08:00 to 18:00</template>
          <template v-else>{{ s.to.name }} · {{ fmtDay(s.booking.arrive) }}</template>
        </p>

        <div class="pair">
          <div v-if="s.booking.hub" class="card code">
            <span class="label">Show this code at the hub</span>
            <span class="digits">{{ s.booking.code }}</span>
          </div>
          <div class="drop">Photo at drop-off</div>
        </div>

        <div class="label" style="font-size: 17px; color: var(--ink)">Pay with</div>
        <div class="methods">
          <button v-for="m in METHODS" :key="m.id" class="method" :class="{ on: s.payMethod === m.id }" @click="s.payMethod = m.id">{{ m.label }}</button>
        </div>
        <button class="btn-ghost" style="align-self: flex-start">Something wrong? Tell us before you pay</button>
      </template>

      <template v-else>
        <div class="headline">
          <span class="ok"><Icon name="check" :size="30" :stroke="2.4" /></span>
          <h1 class="h1">Paid. Thanks!</h1>
        </div>
        <p class="sub">{{ s.from }} → {{ s.to.name }} is done. You can find it in your calendar.</p>
      </template>
    </template>
    <h1 v-else class="h1">Nothing has arrived yet</h1>

    <template #actions>
      <div class="info">
        <span class="big">{{ s.booking ? kr(s.booking.price) : '' }}</span>
        <span class="small">{{ s.to ? `${s.from} → ${s.to.name}` : '' }}</span>
      </div>
      <button class="btn" @click="startNew">Send another</button>
      <button v-if="s.status !== 'paid'" class="btn btn-primary" :disabled="!s.booking" @click="pay">
        Pay {{ s.booking ? kr(s.booking.price) : '' }} with {{ METHODS.find((m) => m.id === s.payMethod).label }}
      </button>
      <button v-else class="btn btn-primary" @click="go('calendar')">Open calendar</button>
    </template>
  </PageLayout>
</template>

<style scoped>
.pair { display: flex; gap: 16px; flex-wrap: wrap; }
.code { flex: 1 1 200px; display: flex; flex-direction: column; gap: 4px; }
.digits { font-size: 40px; font-weight: 700; letter-spacing: 0.1em; }
.drop { flex: 0 0 180px; height: 120px; border-radius: 22px; background: #EDE7DD; display: flex; align-items: flex-end; padding: 10px 12px; font-size: 13px; color: var(--muted); }
.methods { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.method { min-height: 72px; border-radius: 18px; border: 1.5px solid var(--line); background: var(--card); font-size: 18px; font-weight: 600; }
.method.on { border: 2.5px solid var(--navy); }
.headline { display: flex; align-items: center; gap: 16px; }
.ok { width: 60px; height: 60px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; flex: none; }
</style>
