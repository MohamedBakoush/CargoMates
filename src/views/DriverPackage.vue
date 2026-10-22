<script setup>
import { ref, computed } from 'vue'
import { state, go, kr, driverBid, driverConfirmPickup, driverGoTracking } from '../store.js'
import Icon from '../components/Icon.vue'

const pkg = computed(() => state.driverActive)
const bidAmount = ref('')
const bidSending = ref(false)

function placeBid() {
  if (!pkg.value) return
  const amount = parseInt(bidAmount.value) || pkg.value.price
  bidSending.value = true
  driverBid(pkg.value.id, amount)
}

const canPickup = computed(() => pkg.value && pkg.value.status === 'accepted')
const canDropoff = computed(() => pkg.value && pkg.value.status === 'picked-up')
</script>

<template>
  <div class="page" v-if="pkg">
    <header class="topbar">
      <button class="btn btn-round" aria-label="Back" @click="go('d-packages')"><Icon name="back" /></button>
      <div class="brand">CargoMates</div>
      <div class="role-tag">Driver</div>
      <div class="spacer" />
    </header>

    <div class="body pkg-body">
      <div class="detail-card">
        <div class="detail-header">
          <div class="pkg-icon-lg"><Icon name="package" :size="36" /></div>
          <div>
            <h1 class="detail-route">{{ pkg.from }} → {{ pkg.to }}</h1>
            <p class="detail-what">{{ pkg.what }} · {{ pkg.weight }}</p>
          </div>
        </div>

        <div class="detail-grid">
          <div class="detail-cell">
            <span class="detail-label">Pickup</span>
            <span class="detail-value"><Icon name="pin" :size="16" /> {{ pkg.pickupAddr }}</span>
          </div>
          <div class="detail-cell">
            <span class="detail-label">Drop-off</span>
            <span class="detail-value"><Icon name="pin" :size="16" /> {{ pkg.dropAddr }}</span>
          </div>
          <div class="detail-cell">
            <span class="detail-label">Distance</span>
            <span class="detail-value">{{ pkg.km }} km</span>
          </div>
          <div class="detail-cell">
            <span class="detail-label">Sender</span>
            <span class="detail-value">{{ pkg.sender }}</span>
          </div>
        </div>

        <div v-if="pkg.note" class="note-bar">
          <strong>Note:</strong> {{ pkg.note }}
        </div>
      </div>

      <!-- Bid panel (for available packages) -->
      <div v-if="pkg.status === 'available'" class="bid-panel card">
        <h2 class="bid-title">Place your bid</h2>
        <p class="muted">Suggested: {{ kr(pkg.price) }}</p>
        <div class="bid-row">
          <label class="bid-label">Your price (kr)</label>
          <input v-model="bidAmount" type="number" class="bid-input" :placeholder="String(pkg.price)" />
        </div>
        <button class="btn btn-driver" @click="placeBid">
          <Icon name="truck" :size="20" /> Bid {{ kr(parseInt(bidAmount) || pkg.price) }}
        </button>
      </div>

      <!-- Bid sent -->
      <div v-else-if="pkg.status === 'bid-sent'" class="status-panel card">
        <div class="pulse-ring" />
        <h2>Bid sent — {{ kr(pkg.myBid) }}</h2>
        <p class="muted">Waiting for the sender to accept…</p>
      </div>

      <!-- Accepted → pickup -->
      <div v-else-if="canPickup" class="status-panel card accepted-panel">
        <div class="check-circle"><Icon name="check" :size="28" /></div>
        <h2>Accepted!</h2>
        <p class="muted">Go to {{ pkg.pickupAddr }} and confirm pickup.</p>
      </div>

      <!-- Picked up → tracking & dropoff -->
      <div v-else-if="canDropoff" class="status-panel card">
        <div class="check-circle transit-circle"><Icon name="truck" :size="28" /></div>
        <h2>In transit</h2>
        <p class="muted">Tracking: {{ pkg.trackingCode }}</p>
      </div>

      <!-- Delivered -->
      <div v-else-if="pkg.status === 'delivered'" class="status-panel card">
        <div class="check-circle done-circle"><Icon name="check" :size="28" /></div>
        <h2>Delivered</h2>
        <p class="muted">Completed on {{ pkg.deliveredDate }}</p>
      </div>
    </div>

    <footer class="actionbar" v-if="canPickup || canDropoff">
      <div class="info">
        <span class="big" v-if="canPickup">Ready for pickup</span>
        <span class="big" v-if="canDropoff">{{ pkg.trackingCode }}</span>
        <span class="small">{{ pkg.from }} → {{ pkg.to }}</span>
      </div>
      <button v-if="canPickup" class="btn btn-driver" @click="go('d-pickup')">
        <Icon name="camera" :size="20" /> Confirm pickup
      </button>
      <button v-if="canDropoff" class="btn btn-pill" @click="driverGoTracking">
        <Icon name="printer" :size="18" /> Print label
      </button>
      <button v-if="canDropoff" class="btn btn-driver" @click="go('d-dropoff')">
        <Icon name="check" :size="20" /> Confirm drop-off
      </button>
    </footer>
  </div>
</template>

<style scoped>
.role-tag { font-size: 14px; font-weight: 700; color: #fff; background: var(--navy); padding: 4px 12px; border-radius: 999px; }
.pkg-body { flex-direction: column; gap: 20px; padding: 8px 24px 40px; }

.detail-card { background: var(--card); border-radius: var(--radius); padding: 24px; display: flex; flex-direction: column; gap: 20px; max-width: 700px; }
.detail-header { display: flex; gap: 16px; align-items: center; }
.pkg-icon-lg { width: 64px; height: 64px; border-radius: 20px; background: var(--soft); display: flex; align-items: center; justify-content: center; flex: none; color: var(--navy); }
.detail-route { font-size: 24px; font-weight: 600; margin: 0; }
.detail-what { font-size: 17px; color: var(--muted); margin: 4px 0 0; }

.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.detail-cell { display: flex; flex-direction: column; gap: 4px; }
.detail-label { font-size: 13px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
.detail-value { font-size: 15px; display: flex; align-items: center; gap: 6px; }

.note-bar { background: #FFF8E1; border-left: 4px solid var(--accent); padding: 12px 16px; border-radius: 0 12px 12px 0; font-size: 15px; }

.bid-panel { max-width: 700px; display: flex; flex-direction: column; gap: 14px; }
.bid-title { font-size: 20px; font-weight: 600; margin: 0; }
.bid-row { display: flex; flex-direction: column; gap: 6px; }
.bid-label { font-size: 14px; font-weight: 600; color: var(--muted); }
.bid-input { padding: 14px 18px; border: 1.5px solid var(--line); border-radius: 14px; font-size: 20px; font-weight: 600; background: var(--card); }
.bid-input:focus { border-color: var(--navy); outline: none; }

.btn-driver { background: var(--navy); border-color: var(--navy); color: #fff; min-height: 56px; font-size: 17px; font-weight: 600; border-radius: 16px; border: 0; padding: 0 24px; display: inline-flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; }

.status-panel { max-width: 700px; display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 32px 24px; text-align: center; }
.status-panel h2 { margin: 0; font-size: 22px; }

.pulse-ring { width: 48px; height: 48px; border-radius: 50%; border: 3px solid var(--accent); animation: pulse-driver 1.5s ease-in-out infinite; }
@keyframes pulse-driver { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.15); opacity: 0.6; } }

.check-circle { width: 56px; height: 56px; border-radius: 50%; background: #E8F0FF; color: #1565C0; display: flex; align-items: center; justify-content: center; }
.transit-circle { background: #E0F2F1; color: #00695C; }
.done-circle { background: #E6F5E6; color: #2B8A3E; }

@media (max-width: 600px) {
  .detail-grid { grid-template-columns: 1fr; }
}
</style>
