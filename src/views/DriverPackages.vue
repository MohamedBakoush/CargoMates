<script setup>
import { computed } from 'vue'
import { state, go, kr, switchMode, driverViewPackage } from '../store.js'
import Icon from '../components/Icon.vue'

const available = computed(() => state.driverPackages.filter(p => p.status === 'available'))
const active = computed(() => state.driverPackages.filter(p => ['bid-sent', 'accepted', 'picked-up'].includes(p.status)))
const delivered = computed(() => state.driverPackages.filter(p => p.status === 'delivered'))

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
      <div class="role-tag">Driver</div>
      <div class="spacer" />
      <button class="btn btn-pill" @click="switchMode('sender')"><Icon name="back" :size="18" />Sender</button>
    </header>

    <div class="body col">
      <section class="pkg-section">
        <h2 class="section-title">Available packages</h2>
        <p v-if="!available.length" class="muted empty-msg">No packages available right now.</p>
        <button v-for="pkg in available" :key="pkg.id" class="pkg-card" @click="driverViewPackage(pkg.id)">
          <div class="pkg-icon"><Icon name="package" :size="28" /></div>
          <div class="pkg-info">
            <span class="pkg-route">{{ pkg.from }} → {{ pkg.to }}</span>
            <span class="pkg-what">{{ pkg.what }} · {{ pkg.weight }}</span>
            <span class="pkg-price">{{ kr(pkg.price) }} <span class="pkg-sender">· from {{ pkg.sender }}</span></span>
          </div>
          <Icon name="next" :size="18" class="muted" />
        </button>
      </section>

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
  </div>
</template>

<style scoped>
.pkg-section { display: flex; flex-direction: column; gap: 10px; }
.section-title { font-size: 20px; font-weight: 600; margin: 0 0 4px; }
.empty-msg { font-size: 16px; }

.pkg-card { width: 100%; display: flex; align-items: center; gap: 12px; border: 1.5px solid var(--line); border-radius: var(--radius); background: var(--card); text-align: left; padding: 14px 16px; }
.pkg-card:hover { border-color: var(--navy); }
.pkg-icon { width: 52px; height: 52px; border-radius: 16px; background: var(--soft); display: flex; align-items: center; justify-content: center; flex: none; color: var(--navy); }
.active-icon { background: #E8F0FF; color: #2B5EA7; }
.done-icon { background: #E6F5E6; color: #2B8A3E; }
.pkg-info { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.pkg-route { font-size: 17px; font-weight: 600; }
.pkg-what { font-size: 15px; color: var(--muted); }
.pkg-sender { font-size: 14px; font-weight: 400; color: var(--muted); }
.pkg-est { font-size: 13px; color: var(--navy); font-weight: 500; }
.pkg-price { font-size: 17px; font-weight: 700; }
.pkg-info .status-badge { align-self: flex-start; }



.done-card { opacity: 0.7; }
</style>
