<script setup>
import { ref, computed } from 'vue'
import { state, go, packageLabel, isAbroad, startNew, switchMode } from '../store.js'
import Icon from '../components/Icon.vue'

const s = state.shipment
const offset = ref(0) // months from today
const monthStart = computed(() => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() + offset.value, 1)
})
const monthName = computed(() => monthStart.value.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }))

function iso(d) {
  const x = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return x.toISOString().slice(0, 10)
}
const todayIso = iso(new Date())

// All calendar events, from past shipments and the one in progress
const events = computed(() => {
  const list = []
  for (const h of state.history) {
    const paid = h.status === 'paid'
    if (!paid) list.push({ date: h.pickup, title: `Pickup · ${h.title}`, sub: h.what, needsYou: true })
    list.push({ date: h.arrive, title: `${paid ? 'Arrived' : 'Arrives'} · ${h.title}`, sub: paid ? 'Paid ✓' : h.what, needsYou: !paid })
  }
  const b = s.booking
  if (b && s.status !== 'paid' && s.status !== 'draft') {
    list.push({ date: b.pickup, title: `Pickup · ${s.to.name}`, sub: `${b.driver} · 08:00`, needsYou: s.status === 'booked', route: 'booked' })
    list.push({ date: b.arrive, title: `Arrives · pay`, sub: `${s.to.name} · 14:00`, needsYou: true, route: s.status === 'arrived' ? 'arrived' : 'onway' })
  }
  return list
})

const weeks = computed(() => {
  const first = monthStart.value
  const start = new Date(first)
  start.setDate(1 - ((first.getDay() + 6) % 7)) // back to Monday
  const out = []
  const cur = new Date(start)
  do {
    const week = []
    for (let i = 0; i < 7; i++) {
      const key = iso(cur)
      week.push({
        key,
        day: cur.getDate(),
        inMonth: cur.getMonth() === first.getMonth(),
        today: key === todayIso,
        events: events.value.filter((e) => e.date === key),
      })
      cur.setDate(cur.getDate() + 1)
    }
    out.push(week)
  } while (cur.getMonth() === first.getMonth())
  return out
})

const draft = computed(() => s.status === 'draft' && (s.count || s.to))
</script>

<template>
  <div class="page">
    <header class="topbar wrap">
      <div class="brand">CargoMates</div>
      <div class="title muted">Calendar</div>
      <div class="spacer" />
      <button class="btn btn-round" aria-label="Previous month" @click="offset--"><Icon name="back" /></button>
      <div class="month">{{ monthName }}</div>
      <button class="btn btn-round" aria-label="Next month" @click="offset++"><Icon name="next" /></button>
      <button class="btn btn-pill" @click="offset = 0">Today</button>
      <button class="btn btn-pill" @click="switchMode('driver')"><Icon name="truck" :size="20" />Driver</button>
      <button class="btn btn-pill" @click="go('history')"><Icon name="receipt" :size="20" />Orders</button>
    </header>

    <div class="body">
      <aside class="drafts">
        <div class="h">Not booked yet</div>
        <button v-if="draft" class="card draft" @click="go('details')">
          <span class="d-title">{{ s.from }} → {{ s.to ? s.to.name : '?' }}</span>
          <span class="muted">{{ packageLabel }} · tap to finish</span>
        </button>
        <p class="muted small">Unfinished bookings wait here.</p>
      </aside>

      <section class="month-grid">
        <div class="grid head">
          <div v-for="d in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']" :key="d">{{ d }}</div>
        </div>
        <div v-for="(w, i) in weeks" :key="i" class="grid">
          <div v-for="c in w" :key="c.key" class="cell" :class="{ out: !c.inMonth }">
            <span class="num" :class="{ today: c.today }">{{ c.day }}</span>
            <component :is="e.route ? 'button' : 'div'" v-for="(e, j) in c.events" :key="j"
                       class="event" :class="{ ring: e.needsYou }" @click="e.route && go(e.route)">
              <span class="e-title">{{ e.title }}</span>
              <span class="e-sub">{{ e.sub }}</span>
            </component>
          </div>
        </div>
      </section>
    </div>

    <footer class="actionbar">
      <div class="info legend"><span class="swatch" />Orange ring: you need to do something (have it ready, pay)</div>
      <button class="btn btn-primary" @click="startNew">+ New shipment</button>
    </footer>
  </div>
</template>

<style scoped>
.wrap { flex-wrap: wrap; }
.title { font-size: 20px; font-weight: 600; }
.month { font-size: 22px; font-weight: 600; min-width: 170px; text-align: center; }
.btn-round, .btn-pill { background: var(--card); }
.drafts { flex: 0 1 220px; min-width: 200px; display: flex; flex-direction: column; gap: 12px; }
.h { font-size: 17px; font-weight: 600; }
.draft { border: 0; text-align: left; display: flex; flex-direction: column; gap: 4px; min-height: 72px; }
.d-title { font-size: 16px; font-weight: 600; }
.small { font-size: 14px; margin: 0; }
.month-grid { flex: 999 1 640px; min-width: 0; max-height: 100%; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
.grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 10px; }
.head { font-size: 15px; font-weight: 600; color: var(--muted); text-align: center; }
.cell { min-height: 130px; background: #F6F1E8; border-radius: 16px; padding: 10px; display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.cell.out { opacity: 0.45; }
.num { font-size: 15px; font-weight: 600; align-self: flex-start; padding: 2px 8px; border-radius: 8px; }
.num.today { background: var(--accent); }
.event { min-height: 56px; border: 0; border-radius: 12px; background: var(--card); text-align: left; padding: 8px 10px; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.event.ring { box-shadow: 0 0 0 2.5px var(--accent); }
.e-title { font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.e-sub { font-size: 13px; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.legend { flex-direction: row; align-items: center; gap: 10px; font-size: 15px; color: var(--muted); }
.swatch { width: 28px; height: 20px; border-radius: 6px; background: var(--card); box-shadow: 0 0 0 2.5px var(--accent); flex: none; }
</style>
