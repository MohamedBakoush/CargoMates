<script setup>
import { ref, computed } from 'vue'
import { state, go, fmtDay, eur, slotText, setStatus } from '../store.js'
import PageLayout from '../components/PageLayout.vue'
import Icon from '../components/Icon.vue'

const s = state.shipment
const hasArrived = computed(() => s.booking && s.booking.arrived)
const shared = ref(false)
const lastMessage = computed(() => {
  const m = s.messages[s.messages.length - 1]
  if (!m) return 'No messages yet'
  return (m.from === 'sender' ? 'You: ' : m.from === 'driver' ? s.booking.driver + ': ' : '') + m.text
})

function track() {
  if (s.status === 'booked') setStatus('onway')
  go('onway')
}

async function share() {
  const text = `Your shipment from ${s.from} arrives by ${fmtDay(s.booking.arrive)}. Track it with CargoMates.`
  try {
    if (navigator.share) await navigator.share({ title: 'CargoMates shipment', text })
    else await navigator.clipboard.writeText(text)
    shared.value = true
  } catch (e) { /* share sheet dismissed */ }
}
</script>

<template>
  <PageLayout>
    <template v-if="s.booking">
      <div class="headline">
        <span class="ok"><Icon name="check" :size="26" :stroke="2.4" /></span>
        <h1 class="h1">Booked with {{ s.booking.driver }} <span v-if="s.booking.driverRating" class="star">★ {{ s.booking.driverRating }}</span></h1>
      </div>

      <div class="card timeline">
        <div class="tl-row">
          <span class="tl-dot now-dot" />
          <div class="tl-content">
            <div class="name">Pickup at your door</div>
            <div class="muted">{{ fmtDay(s.booking.pickup) }}, {{ slotText(s.booking.slot) }} · {{ s.from }}</div>
          </div>
        </div>
        <div class="tl-line" />
        <div class="tl-row">
          <span class="tl-dot" :class="hasArrived ? 'now-dot' : 'next-dot'" />
          <div class="tl-content">
            <div class="name">{{ hasArrived ? 'Delivered' : 'Delivery' }} <span v-if="!hasArrived" class="g-tag">Guaranteed</span></div>
            <div class="muted">
              {{ hasArrived ? '' : 'By ' }}{{ fmtDay(s.booking.arrive) }} ·
              {{ s.booking.hub ? s.booking.hub + ', open 08:00 to 18:00' : 'to the door in ' + s.to.name }}
            </div>
          </div>
        </div>
      </div>

      <button class="card chat-card" @click="go('chat')">
        <span class="chat-main">
          <span class="name">Messages with {{ s.booking.driver }}</span>
          <span class="muted last">{{ lastMessage }}</span>
        </span>
        <span class="open">{{ s.messages.length ? 'Open' : 'Write' }}</span>
      </button>
      <p class="muted contact-note">The driver calls you if they need directions. You can ask for a call once they are close.</p>
      <div class="pair">
        <button class="btn" @click="go('calendar')"><Icon name="calendar" :size="20" />In your calendar</button>
        <button class="btn" @click="share">{{ shared ? 'Shared ✓' : 'Share with receiver' }}</button>
      </div>
    </template>
    <template v-else>
      <h1 class="h1">Nothing booked yet</h1>
      <button class="btn" @click="go('photos')">Start a shipment</button>
    </template>

    <template #actions>
      <div v-if="s.booking" class="info">
        <span class="big">{{ eur(s.booking.price) }}</span>
        <span class="small">Nothing to pay until it arrives</span>
      </div>
      <button class="btn btn-primary" :disabled="!s.booking" @click="track">Track shipment</button>
    </template>
  </PageLayout>
</template>

<style scoped>
.star { color: var(--accent); font-size: 0.6em; white-space: nowrap; }
.headline { display: flex; align-items: center; gap: 14px; }
.ok { width: 52px; height: 52px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; flex: none; }
.name { font-size: 18px; font-weight: 600; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.pair { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.contact-note { margin: -6px 0 0; font-size: 14px; }
.pair .btn { min-height: 56px; padding: 0 12px; font-size: 16px; }

.chat-card { width: 100%; border: 0; text-align: left; display: flex; align-items: center; gap: 12px; min-height: 72px; }
.chat-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.last { font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.open { font-size: 16px; font-weight: 600; text-decoration: underline; }

.timeline { display: flex; flex-direction: column; padding: 20px; }
.tl-row { display: flex; align-items: flex-start; gap: 14px; }
.tl-dot { width: 14px; height: 14px; border-radius: 50%; flex: none; margin-top: 5px; }
.now-dot { background: var(--accent); }
.next-dot { background: var(--card); border: 2.5px solid var(--navy); }
.tl-line { width: 2px; height: 24px; background: var(--line); margin-left: 6px; }
.tl-content { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.g-tag { font-size: 12px; font-weight: 700; color: var(--navy); background: #EEF2FA; padding: 2px 8px; border-radius: 6px; }
</style>
