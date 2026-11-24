<script setup>
// One profile page for both sides: #profile is the sender (their orders),
// #d-profile is the driver (their completed jobs). Each shows that person's star rating.
import { computed } from 'vue'
import { state, go, eur, fmtDay, PROFILES, allOrders } from '../store.js'
import Icon from '../components/Icon.vue'

const asDriver = state.route === 'd-profile'
const me = asDriver ? PROFILES.driver : PROFILES.sender
const initials = me.name.split(' ').map((w) => w[0]).join('')

const STATUS = { paid: 'Paid', booked: 'Booked', onway: 'On the way', arrived: 'Arrived' }

// Sender: every order. Driver: finished jobs, newest first.
const rows = computed(() => {
  if (!asDriver) {
    return [...allOrders.value]
      .sort((a, b) => (b.pickup || '').localeCompare(a.pickup || ''))
      .map((o) => ({
        id: o.id, route: `${o.from || 'Madrid'} → ${o.to || o.title}`, sub: `${o.what} · ${fmtDay(o.pickup)}`,
        price: o.price || 0, badge: STATUS[o.status] || o.status, done: o.status === 'paid', open: () => openOrder(o.id),
      }))
  }
  const now = state.driverPackages.filter((p) => p.status === 'delivered').map((p) => ({
    id: p.id, route: `${p.from} → ${p.to}`, sub: `${p.what} · ${fmtDay(p.deliveredDate)} · ${p.sender}`,
    price: p.myBid || p.price, rated: null, done: true,
  }))
  const past = state.driverPast.map((p) => ({
    id: p.id, route: `${p.from} → ${p.to}`, sub: `${p.what} · ${fmtDay(p.date)} · ${p.sender}`,
    price: p.price, rated: p.rated, done: true,
  }))
  return [...now, ...past]
})

const total = computed(() => rows.value.filter((r) => r.done).reduce((sum, r) => sum + r.price, 0))
const stats = computed(() => asDriver
  ? [{ n: rows.value.length, label: 'Completed' }, { n: eur(total.value), label: 'Earned' }, { n: '98%', label: 'On time' }]
  : [{ n: rows.value.length, label: 'Orders' }, { n: eur(total.value), label: 'Paid' }, { n: me.ratings, label: 'Ratings' }])

function openOrder(id) {
  state.openOrder = id
  go('history')
}
function back() {
  go(asDriver ? 'd-packages' : 'photos')
}
</script>

<template>
  <div class="page">
    <header class="topbar">
      <button class="btn btn-round" aria-label="Back" @click="back"><Icon name="back" /></button>
      <div class="brand keep">Profile</div>
      <button class="role-tag" :aria-label="asDriver ? 'Driver home' : 'Sender home'" @click="back">{{ asDriver ? 'Driver' : 'Sender' }}</button>
      <div class="spacer" />
    </header>

    <div class="body col">
      <section class="card me">
        <span class="avatar">{{ initials }}</span>
        <div class="me-text">
          <h1 class="me-name">{{ me.name }}</h1>
          <div class="rating" :aria-label="`Rated ${me.rating} out of 5`">
            <span class="stars">
              <span class="stars-fill" :style="{ width: (me.rating / 5) * 100 + '%' }">★★★★★</span>★★★★★
            </span>
            <b>{{ me.rating.toFixed(1) }}</b>
            <span class="muted">({{ me.ratings }})</span>
          </div>
          <span class="muted since">{{ asDriver ? 'Driver' : 'Sender' }} since {{ me.since }}</span>
        </div>
      </section>

      <section class="stats">
        <div v-for="st in stats" :key="st.label" class="card stat">
          <span class="stat-n">{{ st.n }}</span>
          <span class="muted stat-label">{{ st.label }}</span>
        </div>
      </section>

      <button v-if="!asDriver" class="card link-card" @click="go('calendar')">
        <span class="link-icon"><Icon name="calendar" :size="22" /></span>
        <span class="row-main">
          <span class="row-route">Calendar</span>
          <span class="muted row-sub">Pickups, deliveries and payments by date</span>
        </span>
        <Icon name="next" :size="18" class="muted" />
      </button>

      <section class="list">
        <h2 class="section-title">{{ asDriver ? 'Completed orders' : 'Your orders' }}</h2>
        <p v-if="!rows.length" class="muted">{{ asDriver ? 'No completed jobs yet.' : 'No orders yet.' }}</p>
        <component :is="r.open ? 'button' : 'div'" v-for="r in rows" :key="r.id" class="row-card" @click="r.open && r.open()">
          <span class="row-main">
            <span class="row-route">{{ r.route }}</span>
            <span class="muted row-sub">{{ r.sub }}</span>
          </span>
          <span class="row-right">
            <span class="row-price">{{ eur(r.price) }}</span>
            <span v-if="r.badge" class="status-badge" :class="r.done ? 'st-done' : 'st-pending'">{{ r.badge }}</span>
            <span v-else-if="r.rated" class="row-stars">{{ '★'.repeat(r.rated) }}</span>
            <span v-else class="muted row-sub">Not rated yet</span>
          </span>
          <Icon v-if="r.open" name="next" :size="18" class="muted" />
        </component>
      </section>
    </div>
  </div>
</template>

<style scoped>
.me { display: flex; align-items: center; gap: 16px; }
.avatar { width: 72px; height: 72px; border-radius: 50%; background: var(--navy); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 26px; font-weight: 700; flex: none; }
.me-text { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.me-name { font-size: 24px; font-weight: 700; margin: 0; }
.rating { display: flex; align-items: center; gap: 6px; font-size: 16px; }
.stars { position: relative; display: inline-block; color: var(--line-strong); font-size: 18px; letter-spacing: 1px; line-height: 1; }
.stars-fill { position: absolute; left: 0; top: 0; overflow: hidden; white-space: nowrap; color: var(--accent); }
.since { font-size: 14px; }

.stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.stat { display: flex; flex-direction: column; gap: 2px; padding: 14px 12px; text-align: center; }
.stat-n { font-size: 19px; font-weight: 700; white-space: nowrap; }
.stat-label { font-size: 13px; }

.link-card { width: 100%; border: 0; text-align: left; display: flex; align-items: center; gap: 12px; min-height: 68px; }
.link-icon { width: 44px; height: 44px; border-radius: 12px; background: var(--soft); color: var(--navy); display: flex; align-items: center; justify-content: center; flex: none; }
.list { display: flex; flex-direction: column; gap: 10px; }
.section-title { font-size: 20px; font-weight: 600; margin: 4px 0 0; }
.row-card { width: 100%; display: flex; align-items: center; gap: 12px; padding: 14px 16px; border: 1.5px solid var(--line); border-radius: var(--radius); background: var(--card); text-align: left; }
button.row-card:hover { border-color: var(--navy); }
.row-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.row-route { font-size: 17px; font-weight: 600; }
.row-sub { font-size: 14px; }
.row-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex: none; }
.row-price { font-size: 17px; font-weight: 700; white-space: nowrap; }
.row-stars { color: var(--accent); font-size: 14px; letter-spacing: 1px; }
</style>
