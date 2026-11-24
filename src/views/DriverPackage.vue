<script setup>
import { ref, computed } from 'vue'
import { state, go, eur, driverBid, driverConfirmPickup, driverGoTracking, PICKUP_TIMES, PICKUP_LOCATIONS, transitPercent, kmLeft, driverArrive, driverAccept } from '../store.js'
import Icon from '../components/Icon.vue'
import RouteMap from '../components/RouteMap.vue'

const pkg = computed(() => state.driverActive)
const bidAmount = ref('')
const pickupTime = ref('today')
const pickupLocation = ref('sender')

function placeBid() {
  if (!pkg.value) return
  const amount = parseInt(bidAmount.value) || pkg.value.price
  driverBid(pkg.value.id, amount, pickupTime.value, pickupLocation.value)
}

const canPickup = computed(() => pkg.value && pkg.value.status === 'accepted')
const inTransit = computed(() => pkg.value && pkg.value.status === 'picked-up')
const canDropoff = computed(() => pkg.value && pkg.value.status === 'at-destination')
</script>

<template>
  <div class="page" v-if="pkg">
    <header class="topbar">
      <button class="btn btn-round" aria-label="Back" @click="go('d-packages')"><Icon name="back" /></button>
      <button class="brand" aria-label="CargoMates home" @click="go('home')"><img class="logo" src="/logo.jpg" alt="CargoMates" width="44" height="44"></button>
      <button class="role-tag" aria-label="Driver home" @click="go('d-packages')">Driver</button>
      <div class="spacer" />
      <button class="btn btn-pill collapse" aria-label="Profile" @click="go('d-profile')"><Icon name="user" :size="20" /><span class="lbl">Profile</span></button>
    </header>

    <div class="body col">
      <div class="detail-card">
        <div class="detail-header">
          <div class="pkg-icon-lg"><Icon name="package" :size="36" /></div>
          <div>
            <h1 class="detail-route">{{ pkg.from }} → {{ pkg.to }}</h1>
            <p class="detail-what">{{ pkg.what }} · {{ pkg.weight }}</p>
          </div>
        </div>

        <RouteMap :from="pkg.from" :to="pkg.to" :progress="transitPercent(pkg)" />

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
            <span class="detail-value">{{ pkg.sender }} <span class="star">★ {{ pkg.senderRating.toFixed(1) }}</span></span>
          </div>
        </div>

        <div v-if="canPickup || inTransit || canDropoff" class="contact-row">
          <button class="btn" @click="go('d-chat')">Message {{ pkg.sender }}</button>
          <a class="btn" href="tel:"><Icon name="phone" :size="18" />Call {{ pkg.sender }}</a>
        </div>

        <div v-if="pkg.note" class="note-bar">
          <strong>Note:</strong> {{ pkg.note }}
        </div>
      </div>

      <!-- Bid panel (for available packages) -->
      <div v-if="pkg.status === 'available'" class="bid-panel card">
        <h2 class="bid-title">Place your bid</h2>
        <p class="muted">Suggested: {{ eur(pkg.price) }}</p>

        <div class="bid-row">
          <label class="bid-label">Your price (€)</label>
          <input v-model="bidAmount" type="number" inputmode="numeric" class="bid-input" :placeholder="String(pkg.price)" />
        </div>

        <div class="bid-row">
          <label class="bid-label">Estimated pickup time</label>
          <div class="option-grid">
            <button v-for="t in PICKUP_TIMES" :key="t.id"
                    class="opt-card" :class="{ selected: pickupTime === t.id }"
                    @click="pickupTime = t.id">
              <span class="opt-label">{{ t.label }}</span>
              <span class="opt-hint">{{ t.hint }}</span>
            </button>
          </div>
        </div>

        <div class="bid-row">
          <label class="bid-label">Where do you pick up?</label>
          <div class="option-grid">
            <button v-for="l in PICKUP_LOCATIONS" :key="l.id"
                    class="opt-card" :class="{ selected: pickupLocation === l.id }"
                    @click="pickupLocation = l.id">
              <span class="opt-label">{{ l.label }}</span>
              <span class="opt-hint">{{ l.hint }}</span>
            </button>
          </div>
        </div>

        <button class="btn btn-driver" @click="placeBid">
          <Icon name="truck" :size="20" /> Send bid {{ eur(parseInt(bidAmount) || pkg.price) }}
        </button>
      </div>

      <!-- Bid sent -->
      <div v-else-if="pkg.status === 'bid-sent'" class="status-panel card">
        <div class="pulse-ring" />
        <h2>Bid sent — {{ eur(pkg.myBid) }}</h2>
        <p class="muted">Waiting for the sender to accept…</p>
        <div class="est-summary">
          <span class="est-chip"><Icon name="calendar" :size="14" /> {{ pkg.estPickupLabel }}</span>
          <span class="est-chip"><Icon name="pin" :size="14" /> {{ pkg.estLocationLabel }}</span>
        </div>
        <button class="btn-ghost" @click="driverAccept(pkg)">Prototype: accept now</button>
      </div>

      <!-- Accepted → pickup -->
      <div v-else-if="canPickup" class="status-panel card accepted-panel">
        <div class="check-circle"><Icon name="check" :size="28" /></div>
        <h2>Accepted!</h2>
        <p class="muted">Go to {{ pkg.estPickupLocation === 'sender' ? pkg.pickupAddr : 'the agreed meetup point' }} and confirm pickup.</p>
        <div class="est-summary">
          <span class="est-chip"><Icon name="calendar" :size="14" /> {{ pkg.estPickupLabel }}</span>
          <span class="est-chip"><Icon name="pin" :size="14" /> {{ pkg.estLocationLabel }}</span>
        </div>
      </div>

      <!-- Picked up, driving -->
      <div v-else-if="inTransit" class="status-panel card">
        <div class="check-circle transit-circle"><Icon name="truck" :size="28" /></div>
        <h2>On the way to {{ pkg.to }}</h2>
        <p class="muted">About {{ kmLeft(pkg) }} km left · tracking {{ pkg.trackingCode }}</p>
        <span class="transit-bar"><span class="transit-fill" :style="{ width: transitPercent(pkg) + '%' }" /></span>
        <p class="muted">Drop-off unlocks when you reach {{ pkg.dropAddr }}.</p>
        <button class="btn-ghost" @click="driverArrive(pkg)">Prototype: arrive now</button>
      </div>

      <!-- Arrived → drop-off -->
      <div v-else-if="canDropoff" class="status-panel card">
        <div class="check-circle done-circle"><Icon name="pin" :size="28" /></div>
        <h2>You have arrived</h2>
        <p class="muted">Confirm drop-off at {{ pkg.dropAddr }}.</p>
      </div>

      <!-- Delivered -->
      <div v-else-if="pkg.status === 'delivered'" class="status-panel card">
        <div class="check-circle done-circle"><Icon name="check" :size="28" /></div>
        <h2>Delivered</h2>
        <p class="muted">Completed on {{ pkg.deliveredDate }}</p>
      </div>
    </div>

    <footer class="actionbar" v-if="canPickup || inTransit || canDropoff">
      <div class="info">
        <span class="big" v-if="canPickup">Ready for pickup</span>
        <span class="big" v-else-if="inTransit">In transit · {{ kmLeft(pkg) }} km left</span>
        <span class="big" v-else>Arrived</span>
        <span class="small">{{ pkg.from }} → {{ pkg.to }}</span>
      </div>
      <button v-if="canPickup" class="btn btn-driver" @click="go('d-pickup')">
        <Icon name="camera" :size="20" /> Confirm pickup
      </button>
      <button v-if="inTransit || canDropoff" class="btn btn-pill" @click="driverGoTracking">
        <Icon name="printer" :size="18" /> Label
      </button>
      <button v-if="inTransit" class="btn btn-driver" disabled>Drop-off when you arrive</button>
      <button v-if="canDropoff" class="btn btn-driver" @click="go('d-dropoff')">
        <Icon name="check" :size="20" /> Confirm drop-off
      </button>
    </footer>
  </div>
</template>

<style scoped>

.detail-card { background: var(--card); border-radius: var(--radius); padding: 20px; display: flex; flex-direction: column; gap: 20px; }
.detail-header { display: flex; gap: 16px; align-items: center; }
.pkg-icon-lg { width: 52px; height: 52px; border-radius: 20px; background: var(--soft); display: flex; align-items: center; justify-content: center; flex: none; color: var(--navy); }
.detail-route { font-size: 22px; font-weight: 600; margin: 0; }
.detail-what { font-size: 17px; color: var(--muted); margin: 4px 0 0; }

.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.detail-cell { display: flex; flex-direction: column; gap: 4px; }
.detail-label { font-size: 13px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; }
.detail-value { font-size: 15px; display: flex; align-items: center; gap: 6px; }

.contact-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.contact-row .btn { min-height: 52px; padding: 0 10px; font-size: 15px; }
.star { color: var(--accent); font-weight: 600; }
.note-bar { background: #FFF8E1; border-left: 4px solid var(--accent); padding: 12px 16px; border-radius: 0 12px 12px 0; font-size: 15px; }

.bid-panel { display: flex; flex-direction: column; gap: 14px; }
.bid-title { font-size: 20px; font-weight: 600; margin: 0; }
.bid-row { display: flex; flex-direction: column; gap: 6px; }
.bid-label { font-size: 14px; font-weight: 600; color: var(--muted); }
.bid-input { width: 100%; padding: 14px 18px; border: 1.5px solid var(--line); border-radius: 14px; font-size: 20px; font-weight: 600; background: var(--card); }
.bid-input:focus { border-color: var(--navy); outline: none; }


.option-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.opt-card { border: 1.5px solid var(--line); border-radius: 14px; background: var(--card); padding: 12px 14px; text-align: left; display: flex; flex-direction: column; gap: 3px; cursor: pointer; }
.opt-card:hover { border-color: var(--navy); }
.opt-card.selected { border: 2.5px solid var(--navy); background: #F0F4FA; }
.opt-label { font-size: 15px; font-weight: 600; }
.opt-hint { font-size: 13px; color: var(--muted); }

.est-summary { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.est-chip { display: inline-flex; align-items: center; gap: 5px; font-size: 14px; font-weight: 500; background: var(--soft); padding: 6px 12px; border-radius: 999px; color: var(--navy); }

.status-panel { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 32px 24px; text-align: center; }
.status-panel h2 { margin: 0; font-size: 22px; }
.status-panel p { margin: 0; }
.transit-bar { display: block; width: 100%; height: 8px; border-radius: 4px; background: var(--line); overflow: hidden; }
.transit-fill { display: block; height: 100%; background: var(--accent); border-radius: 4px; transition: width 0.9s linear; }
.btn-driver:disabled { opacity: 0.45; cursor: not-allowed; }


.check-circle { width: 56px; height: 56px; border-radius: 50%; background: #E8F0FF; color: #1565C0; display: flex; align-items: center; justify-content: center; }
.transit-circle { background: #E0F2F1; color: #00695C; }
.done-circle { background: #E6F5E6; color: #2B8A3E; }

@media (max-width: 600px) {
  .detail-grid { grid-template-columns: 1fr; }
}
</style>
