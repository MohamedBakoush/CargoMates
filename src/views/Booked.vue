<script setup>
import { computed } from 'vue'
import { state, go, fmtDay, kr, setStatus } from '../store.js'
import PageLayout from '../components/PageLayout.vue'
import Icon from '../components/Icon.vue'

const s = state.shipment
const hasArrived = computed(() => s.booking && s.booking.arrived)

function track() {
  if (s.status === 'booked') setStatus('onway')
  go('onway')
}
</script>

<template>
  <PageLayout calendar>
    <template v-if="s.booking">
      <div class="headline">
        <span class="ok"><Icon name="check" :size="30" :stroke="2.4" /></span>
        <h1 class="h1">Booked. {{ s.booking.driver }} is on it.</h1>
      </div>

      <div class="card row">
        <span class="avatar">{{ s.booking.driver[0] }}</span>
        <div class="grow">
          <div class="name">{{ s.booking.driver }}</div>
          <div class="muted">Picked up today</div>
        </div>
        <a class="btn" href="sms:">Message</a>
        <a class="btn" href="tel:">Call</a>
      </div>

      <div v-if="s.booking.note" class="card note-card">
        <div class="label">Your note to the driver</div>
        <div class="note-text">{{ s.booking.note }}</div>
      </div>

      <div class="card timeline">
        <div class="tl-row done">
          <span class="tl-dot done-dot" />
          <div class="tl-content">
            <div class="name">Picked up</div>
            <div class="muted">{{ fmtDay(s.booking.pickup) }} · {{ s.from }}</div>
          </div>
        </div>
        <div class="tl-line" />
        <div class="tl-row" :class="{ done: hasArrived, estimate: !hasArrived }">
          <span class="tl-dot" :class="{ 'done-dot': hasArrived, 'est-dot': !hasArrived }" />
          <div class="tl-content">
            <div class="name" :class="{ grayed: !hasArrived }">
              {{ hasArrived ? 'Arrived' : 'Estimated arrival' }}
            </div>
            <div class="muted" :class="{ grayed: !hasArrived }">
              {{ fmtDay(s.booking.arrive) }} · {{ s.to ? s.to.name : '' }}
            </div>
            <span v-if="!hasArrived" class="est-tag">Estimate</span>
          </div>
        </div>
      </div>

      <div v-if="s.booking.hub" class="card">
        <div class="label">Your pickup point</div>
        <div class="name">{{ s.booking.hub }}</div>
        <div class="muted">Open 08:00 to 18:00 · ready from {{ fmtDay(s.booking.arrive) }}</div>
      </div>
      <div v-else class="card">
        <div class="label">Delivered to</div>
        <div class="name">{{ s.to.name }}, {{ s.to.country }}</div>
      </div>

      <button class="card row link" @click="go('calendar')">
        <Icon name="calendar" :size="28" />
        <span class="grow">
          <span class="name">Added to your calendar</span>
          <span class="muted">Pickup today · arrival {{ fmtDay(s.booking.arrive) }}</span>
        </span>
        <span class="name">Open</span>
      </button>
    </template>
    <template v-else>
      <h1 class="h1">Nothing booked yet</h1>
      <button class="btn" @click="go('photos')">Start a shipment</button>
    </template>

    <template #actions>
      <div class="info">
        <span class="big" style="font-size: 20px">{{ s.booking ? 'Picked up today' : '' }}</span>
        <span class="small">Nothing paid yet · {{ s.booking ? kr(s.booking.price) : '' }} when it arrives</span>
      </div>
      <button class="btn">Share with receiver</button>
      <button class="btn btn-primary" :disabled="!s.booking" @click="track">Track shipment</button>
    </template>
  </PageLayout>
</template>

<style scoped>
.headline { display: flex; align-items: center; gap: 16px; }
.ok { width: 60px; height: 60px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; flex: none; }
.row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.row .btn { min-height: 56px; padding: 0 22px; font-size: 17px; }
.grow { flex: 1 1 180px; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.avatar { width: 56px; height: 56px; border-radius: 50%; background: #EDE7DD; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 20px; flex: none; }
.name { font-size: 19px; font-weight: 600; }
.link { border: 0; background: var(--soft); text-align: left; min-height: 72px; width: 100%; }

.note-card { border-left: 3px solid var(--accent); }
.note-text { font-size: 17px; margin-top: 4px; font-style: italic; }

.timeline { display: flex; flex-direction: column; gap: 0; padding: 20px 22px; }
.tl-row { display: flex; align-items: flex-start; gap: 14px; }
.tl-dot { width: 14px; height: 14px; border-radius: 50%; flex: none; margin-top: 4px; }
.done-dot { background: var(--accent); }
.est-dot { background: var(--line-strong); }
.tl-line { width: 2px; height: 28px; background: var(--line); margin-left: 6px; }
.tl-content { display: flex; flex-direction: column; gap: 2px; }
.grayed { opacity: 0.45; }
.est-tag { font-size: 13px; font-weight: 600; color: var(--muted); background: var(--soft); padding: 2px 10px; border-radius: 8px; align-self: flex-start; margin-top: 4px; }
</style>
