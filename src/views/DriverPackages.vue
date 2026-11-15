<script setup>
import { ref, computed } from 'vue'
import { go, state, kr, switchMode, driverViewPackage, driverMatches, DRIVER_PLACES, DRIVER_COUNTRIES } from '../store.js'
import Icon from '../components/Icon.vue'
import Picker from '../components/Picker.vue'
import RouteMap from '../components/RouteMap.vue'

const route = state.driverRoute
const m = driverMatches
const areaOpen = ref(false)

const active = computed(() => state.driverPackages.filter(p => ['bid-sent', 'accepted', 'picked-up'].includes(p.status)))
const delivered = computed(() => state.driverPackages.filter(p => p.status === 'delivered'))

const areaLabel = computed(() => {
  const c = route.countries
  if (!c.length) return 'Whole of Europe'
  return c.length <= 2 ? c.join(' and ') : `${c.length} countries`
})
function toggleCountry(c) {
  const i = route.countries.indexOf(c)
  if (i >= 0) route.countries.splice(i, 1)
  else route.countries.push(c)
}

// Package groups shown under the route card
const groups = computed(() => {
  if (!m.value.hasRoute) return [{ title: 'Available packages', rows: m.value.offRoute, empty: 'No packages in this area right now.' }]
  return [
    { title: 'On your route', rows: m.value.onRoute, empty: 'Nothing directly on this route yet.' },
    { title: 'A bit off your route', rows: m.value.offRoute, empty: '' },
  ].filter((g) => g.rows.length || g.empty)
})
const legs = computed(() => m.value.onRoute.map((x) => ({ from: x.pkg.from, to: x.pkg.to })))

function statusLabel(s) {
  return { 'bid-sent': 'Bid sent', 'accepted': 'Accepted', 'picked-up': 'In transit', 'delivered': 'Delivered' }[s] || s
}
function statusClass(s) {
  return { 'bid-sent': 'st-pending', 'accepted': 'st-accepted', 'picked-up': 'st-transit', 'delivered': 'st-done' }[s] || ''
}
</script>

<template>
  <div class="page">
    <header class="topbar">
      <div class="brand">CargoMates</div>
      <button class="role-tag" aria-label="Driver home" @click="go('d-packages')">Driver</button>
      <div class="spacer" />
      <button class="btn btn-pill collapse" aria-label="Profile" @click="go('d-profile')"><Icon name="user" :size="20" /><span class="lbl">Profile</span></button>
      <button class="btn btn-pill" @click="switchMode('sender')"><Icon name="back" :size="18" />Sender</button>
    </header>

    <div class="body col">
      <section class="card route-card">
        <div class="route-sentence">
          I am driving from
          <Picker v-model="route.from" :options="DRIVER_PLACES" title="Where do you start?" :display="route.from || 'start'" />
          to
          <Picker v-model="route.to" :options="DRIVER_PLACES" title="Where are you going?" :display="route.to || 'destination'" />.
        </div>
        <button class="area-btn" @click="areaOpen = true">
          <Icon name="pin" :size="18" />
          <span class="grow">Show packages in <b>{{ areaLabel }}</b></span>
          <span class="change">Change</span>
        </button>
        <RouteMap v-if="m.hasRoute" :from="route.from" :to="route.to" :legs="legs" />
        <p v-if="m.hasRoute" class="muted map-note">Dark lines are packages on your route.</p>
        <p v-else class="muted map-note">Pick a start and a destination to see which packages fit your trip.</p>
      </section>

      <section v-for="g in groups" :key="g.title" class="pkg-section">
        <h2 class="section-title">{{ g.title }} <span v-if="g.rows.length" class="count">{{ g.rows.length }}</span></h2>
        <p v-if="!g.rows.length" class="muted empty-msg">{{ g.empty }}</p>
        <button v-for="row in g.rows" :key="row.pkg.id" class="pkg-card" @click="driverViewPackage(row.pkg.id)">
          <div class="pkg-icon"><Icon name="package" :size="28" /></div>
          <div class="pkg-info">
            <span class="pkg-route">{{ row.pkg.from }} → {{ row.pkg.to }}</span>
            <span class="pkg-what">{{ row.pkg.what }} · {{ row.pkg.weight }}</span>
            <span class="pkg-price">{{ kr(row.pkg.price) }} <span class="pkg-sender">· {{ row.pkg.sender }} <span class="star">★ {{ row.pkg.senderRating.toFixed(1) }}</span></span></span>
            <span v-if="row.detour !== null" class="detour" :class="{ fit: row.detour <= 40 }">
              {{ row.detour <= 40 ? 'On your way' : `+${row.detour} km detour` }}
            </span>
          </div>
          <Icon name="next" :size="18" class="muted" />
        </button>
      </section>
      <p v-if="m.hidden" class="muted empty-msg">{{ m.hidden }} more outside your chosen countries.</p>

      <section v-if="active.length" class="pkg-section">
        <h2 class="section-title">Your active jobs</h2>
        <button v-for="pkg in active" :key="pkg.id" class="pkg-card" @click="driverViewPackage(pkg.id)">
          <div class="pkg-icon active-icon"><Icon name="truck" :size="24" /></div>
          <div class="pkg-info">
            <span class="pkg-route">{{ pkg.from }} → {{ pkg.to }}</span>
            <span class="pkg-what">{{ pkg.what }}</span>
            <span v-if="pkg.estPickupLabel" class="pkg-est">{{ pkg.estPickupLabel }} · {{ pkg.estLocationLabel }}</span>
            <span class="status-badge" :class="statusClass(pkg.status)">{{ statusLabel(pkg.status) }}</span>
          </div>
          <Icon name="next" :size="18" class="muted" />
        </button>
      </section>

      <section v-if="delivered.length" class="pkg-section">
        <h2 class="section-title">Completed</h2>
        <button v-for="pkg in delivered" :key="pkg.id" class="pkg-card done-card" @click="driverViewPackage(pkg.id)">
          <div class="pkg-icon done-icon"><Icon name="check" :size="22" /></div>
          <div class="pkg-info">
            <span class="pkg-route">{{ pkg.from }} → {{ pkg.to }}</span>
            <span class="pkg-what">{{ pkg.what }}</span>
            <span class="status-badge st-done">Delivered</span>
          </div>
        </button>
      </section>
    </div>

    <Teleport to="body">
      <div v-if="areaOpen" class="sheet-backdrop" @click.self="areaOpen = false">
        <div class="sheet" role="dialog" aria-label="Where do you take packages?">
          <div class="sheet-handle" />
          <p class="sheet-title">Where do you take packages?</p>
          <button class="option" :class="{ selected: !route.countries.length }" @click="route.countries.splice(0)">
            <span class="grow"><span class="title">Whole of Europe</span><span class="hint">Every country below</span></span>
            <span class="radio" />
          </button>
          <p class="label">Or only these countries</p>
          <div class="countries">
            <button v-for="c in DRIVER_COUNTRIES" :key="c" class="country" :class="{ on: route.countries.includes(c) }" @click="toggleCountry(c)">
              <Icon v-if="route.countries.includes(c)" name="check" :size="16" :stroke="2.6" />{{ c }}
            </button>
          </div>
          <button class="btn btn-primary" @click="areaOpen = false">Done</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.route-card { display: flex; flex-direction: column; gap: 12px; }
.route-sentence { font-size: 20px; font-weight: 500; line-height: 2.7; }
.route-sentence :deep(.word) { font-size: 20px; min-height: 44px; background: var(--bg); }
.area-btn { display: flex; align-items: center; gap: 10px; min-height: 48px; padding: 0 14px; border: 0; border-radius: 14px; background: var(--soft); text-align: left; font-size: 15px; }
.area-btn .grow { flex: 1; }
.change { font-size: 14px; font-weight: 600; text-decoration: underline; }
.map-note { margin: 0; font-size: 14px; }
.count { font-size: 14px; font-weight: 700; background: var(--soft); padding: 2px 9px; border-radius: 999px; vertical-align: middle; }
.detour { align-self: flex-start; font-size: 13px; font-weight: 600; padding: 2px 9px; border-radius: 999px; background: var(--soft); color: var(--muted); }
.detour.fit { background: #E6F5E6; color: #2B8A3E; }
.countries { display: flex; flex-wrap: wrap; gap: 8px; }
.country { min-height: 44px; padding: 0 16px; border-radius: 999px; border: 1.5px solid var(--line-strong); background: var(--card); font-size: 16px; display: inline-flex; align-items: center; gap: 6px; }
.country.on { border-color: var(--navy); background: var(--navy); color: #fff; }

.pkg-section { display: flex; flex-direction: column; gap: 10px; }
.section-title { font-size: 20px; font-weight: 600; margin: 0 0 4px; }
.empty-msg { font-size: 16px; margin: 0; }

.pkg-card { width: 100%; display: flex; align-items: center; gap: 12px; border: 1.5px solid var(--line); border-radius: var(--radius); background: var(--card); text-align: left; padding: 14px 16px; }
.pkg-card:hover { border-color: var(--navy); }
.pkg-icon { width: 52px; height: 52px; border-radius: 16px; background: var(--soft); display: flex; align-items: center; justify-content: center; flex: none; color: var(--navy); }
.active-icon { background: #E8F0FF; color: #2B5EA7; }
.done-icon { background: #E6F5E6; color: #2B8A3E; }
.pkg-info { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.pkg-route { font-size: 17px; font-weight: 600; }
.pkg-what { font-size: 15px; color: var(--muted); }
.pkg-sender { font-size: 14px; font-weight: 400; color: var(--muted); }
.star { color: var(--accent); font-weight: 600; }
.pkg-est { font-size: 13px; color: var(--navy); font-weight: 500; }
.pkg-price { font-size: 17px; font-weight: 700; }
.pkg-info .status-badge { align-self: flex-start; }



.done-card { opacity: 0.7; }
</style>
