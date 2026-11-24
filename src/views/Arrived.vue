<script setup>
import { ref } from 'vue'
import { state, go, fmtDay, eur, pay, startNew, PAY_METHODS, payLabel } from '../store.js'
import PageLayout from '../components/PageLayout.vue'
import Icon from '../components/Icon.vue'

const s = state.shipment
const reported = ref(false)
const METHODS = PAY_METHODS
</script>

<template>
  <PageLayout back="onway">
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
          <figure class="drop">
            <!-- Stand-in for the driver's drop-off photo: a box on the doormat -->
            <svg viewBox="0 0 240 160" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Photo of the package left at the door">
              <rect width="240" height="160" fill="#E8E0D2" />
              <rect x="0" y="118" width="240" height="42" fill="#B9AD99" />
              <rect x="0" y="116" width="240" height="4" fill="#A2967F" />
              <rect x="72" y="8" width="96" height="112" rx="3" fill="#D9CFBE" />
              <rect x="80" y="14" width="80" height="104" fill="#5B4636" />
              <rect x="88" y="22" width="64" height="38" rx="2" fill="none" stroke="#4A3829" stroke-width="3" />
              <rect x="88" y="68" width="64" height="40" rx="2" fill="none" stroke="#4A3829" stroke-width="3" />
              <circle cx="148" cy="70" r="3.5" fill="#D8B45A" />
              <rect x="58" y="122" width="124" height="22" rx="4" fill="#6E7F5F" />
              <rect x="62" y="126" width="116" height="14" rx="2" fill="none" stroke="#5E6E50" stroke-width="2" stroke-dasharray="4 3" />
              <ellipse cx="121" cy="137" rx="46" ry="5" fill="#000" opacity="0.18" />
              <polygon points="76,92 142,92 160,80 94,80" fill="#D8A866" />
              <rect x="76" y="92" width="66" height="44" fill="#C8955A" />
              <polygon points="142,92 160,80 160,124 142,136" fill="#A97843" />
              <rect x="105" y="92" width="8" height="44" fill="#E7CB98" opacity="0.85" />
              <polygon points="105,92 113,92 131,80 123,80" fill="#EFD6A8" opacity="0.9" />
              <rect x="82" y="100" width="20" height="14" rx="1.5" fill="#FFFFFF" />
              <rect x="85" y="103" width="14" height="1.6" fill="#1F1D1A" />
              <rect x="85" y="106" width="10" height="1.6" fill="#1F1D1A" />
              <rect x="85" y="109.5" width="1.2" height="3" fill="#1F1D1A" />
              <rect x="87" y="109.5" width="0.8" height="3" fill="#1F1D1A" />
              <rect x="89" y="109.5" width="1.6" height="3" fill="#1F1D1A" />
              <rect x="91.6" y="109.5" width="0.8" height="3" fill="#1F1D1A" />
              <rect x="93.4" y="109.5" width="1.4" height="3" fill="#1F1D1A" />
              <rect x="95.8" y="109.5" width="0.8" height="3" fill="#1F1D1A" />
              <rect x="0" y="0" width="240" height="160" fill="url(#drop-light)" />
              <defs>
                <linearGradient id="drop-light" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.12" />
                  <stop offset="1" stop-color="#000000" stop-opacity="0.12" />
                </linearGradient>
              </defs>
            </svg>
            <figcaption>Photo at drop-off · {{ s.booking.driver }}</figcaption>
          </figure>
        </div>

        <div class="label" style="font-size: 17px; color: var(--ink)">Pay with</div>
        <div class="methods">
          <button v-for="m in METHODS" :key="m.id" class="method" :class="{ on: s.payMethod === m.id }" @click="s.payMethod = m.id">{{ m.label }}</button>
        </div>
        <div v-if="reported" class="card issue">
          <div class="issue-title">Payment is on hold</div>
          <div class="muted">Your CargoMates contact will call you within the hour to sort it out.</div>
          <button class="btn-ghost" @click="reported = false">It is fine after all</button>
        </div>
        <button v-else class="btn-ghost" style="align-self: flex-start" @click="reported = true">Something wrong? Tell us before you pay</button>
      </template>

      <template v-else>
        <div class="headline">
          <span class="ok"><Icon name="check" :size="30" :stroke="2.4" /></span>
          <h1 class="h1">Paid. Thanks!</h1>
        </div>
        <p class="sub">{{ s.from }} → {{ s.to.name }} is done. The receipt is under Orders.</p>
      </template>
    </template>
    <h1 v-else class="h1">Nothing has arrived yet</h1>

    <template #actions>
      <div class="info">
        <span class="big">{{ s.booking ? eur(s.booking.price) : '' }}</span>
        <span class="small">{{ s.to ? `${s.from} → ${s.to.name}` : '' }}</span>
      </div>
      <button v-if="s.status !== 'paid'" class="btn btn-primary" :disabled="!s.booking || reported" @click="pay">
        Pay with {{ payLabel(s.payMethod) }}
      </button>
      <template v-else>
        <button class="btn" @click="go('history')">Receipt</button>
        <button class="btn btn-primary" @click="startNew">Send another</button>
      </template>
    </template>
  </PageLayout>
</template>

<style scoped>
.pair { display: flex; gap: 16px; flex-wrap: wrap; }
.code { flex: 1 1 200px; display: flex; flex-direction: column; gap: 4px; }
.digits { font-size: 40px; font-weight: 700; letter-spacing: 0.1em; }
.drop { position: relative; flex: 0 0 220px; height: 148px; margin: 0; border-radius: 22px; overflow: hidden; background: #E8E0D2; }
.drop svg { display: block; width: 100%; height: 100%; }
.drop figcaption { position: absolute; left: 8px; top: 8px; padding: 3px 9px; border-radius: 999px; background: rgba(31, 29, 26, 0.62); color: #fff; font-size: 12px; font-weight: 600; }
.methods { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.method { min-height: 72px; border-radius: 18px; border: 1.5px solid var(--line); background: var(--card); font-size: 18px; font-weight: 600; }
.method.on { border: 2.5px solid var(--navy); }
.issue { display: flex; flex-direction: column; gap: 4px; align-items: flex-start; border-left: 3px solid var(--accent); }
.issue-title { font-size: 17px; font-weight: 600; }
.headline { display: flex; align-items: center; gap: 16px; }
.ok { width: 60px; height: 60px; border-radius: 50%; background: var(--accent); display: flex; align-items: center; justify-content: center; flex: none; }
</style>
