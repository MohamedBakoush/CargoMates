<script setup>
// One profile page for both sides: #profile is the sender (links to Orders and Calendar),
// #d-profile is the driver (their completed jobs). Each shows that person's star rating.
import { computed } from 'vue'
import { state, go, eur, fmtDay, PROFILES, allOrders, rateSender } from '../store.js'
import Icon from '../components/Icon.vue'
import StarRating from '../components/StarRating.vue'

const asDriver = state.route === 'd-profile'
const me = asDriver ? PROFILES.driver : PROFILES.sender
const initials = me.name.split(' ').map((w) => w[0]).join('')

// Sender: every order. Driver: finished jobs, newest first.
const rows = computed(() => {
  if (!asDriver) {
    return [...allOrders.value]
      .sort((a, b) => (b.pickup || '').localeCompare(a.pickup || ''))
      .map((o) => ({
        id: o.id, route: `${o.from || 'Madrid'} → ${o.to || o.title}`, sub: `${o.what} · ${fmtDay(o.pickup)}`,
        price: o.price || 0, done: o.status === 'paid',
      }))
  }
  const now = state.driverPackages.filter((p) => p.status === 'delivered').map((p) => ({
    id: p.id, route: `${p.from} → ${p.to}`, sub: `${p.what} · ${fmtDay(p.deliveredDate)}`,
    price: p.myBid || p.price, rated: null, done: true, sender: p.sender, job: p,
  }))
  const past = state.driverPast.map((p) => ({
    id: p.id, route: `${p.from} → ${p.to}`, sub: `${p.what} · ${fmtDay(p.date)}`,
    price: p.price, rated: p.rated, done: true, sender: p.sender, job: p,
  }))
  return [...now, ...past]
})

const total = computed(() => rows.value.filter((r) => r.done).reduce((sum, r) => sum + r.price, 0))
const stats = computed(() => asDriver
  ? [{ n: rows.value.length, label: 'Completed' }, { n: eur(total.value), label: 'Earned' }, { n: '98%', label: 'On time' }]
  : [{ n: rows.value.length, label: 'Orders' }, { n: eur(total.value), label: 'Paid' }, { n: me.ratings, label: 'Ratings' }])

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

      <button v-if="!asDriver" class="card link-card" @click="go('history')">
        <span class="link-icon"><Icon name="receipt" :size="22" /></span>
        <span class="row-main">
          <span class="row-route">Orders</span>
          <span class="muted row-sub">{{ rows.length }} shipment{{ rows.length === 1 ? '' : 's' }} · receipts, tracking and payment</span>
        </span>
        <Icon name="next" :size="18" class="muted" />
      </button>

      <button v-if="!asDriver" class="card link-card" @click="go('calendar')">
        <span class="link-icon"><Icon name="calendar" :size="22" /></span>
        <span class="row-main">
          <span class="row-route">Calendar</span>
          <span class="muted row-sub">Pickups, deliveries and payments by date</span>
        </span>
        <Icon name="next" :size="18" class="muted" />
      </button>

      <section v-if="asDriver" class="list">
        <h2 class="section-title">Completed orders</h2>
        <p v-if="!rows.length" class="muted">No completed jobs yet.</p>
        <div v-for="r in rows" :key="r.id" class="row-card job-card">
          <div class="job-top">
            <span class="row-main">
              <span class="row-route">{{ r.route }}</span>
              <span class="muted row-sub">{{ r.sub }}</span>
            </span>
            <span class="row-price">{{ eur(r.price) }}</span>
          </div>
          <div class="job-rating">
            <span class="muted">{{ r.sender }} rated you</span>
            <span v-if="r.rated" class="row-stars">{{ '★'.repeat(r.rated) }}</span>
            <span v-else class="muted">not yet</span>
          </div>
          <div class="job-rating mine" :class="{ todo: !r.job.ratedSender }">
            <span :class="{ muted: r.job.ratedSender }">{{ r.job.ratedSender ? `You rated ${r.sender}` : `Rate ${r.sender}` }}</span>
            <StarRating :model-value="r.job.ratedSender || 0" :readonly="!!r.job.ratedSender" :label="`Rate ${r.sender}`"
                        @update:model-value="(n) => rateSender(r.job, n)" />
          </div>
        </div>
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
.row-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.row-route { font-size: 17px; font-weight: 600; }
.row-sub { font-size: 14px; }
.row-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex: none; }
.row-price { font-size: 17px; font-weight: 700; white-space: nowrap; }
.job-card { flex-direction: column; align-items: stretch; gap: 6px; }
.job-top { display: flex; align-items: center; gap: 12px; }
.job-rating { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0 8px; min-height: 28px; font-size: 14px; border-top: 1px solid var(--line); padding-top: 6px; }
.job-rating > span:first-child { white-space: nowrap; }
.job-rating.todo { margin: 2px -8px -6px; padding: 2px 4px 2px 12px; border-top: 0; border-radius: 12px; background: #FFF6EC; font-weight: 600; }
.row-stars { color: var(--accent); font-size: 14px; letter-spacing: 1px; }
</style>
