<script setup>
import { computed } from 'vue'
import { state, eur, fmtDay, slotText, selectBid, cancelSelection, confirmBid, cancelBidding } from '../store.js'
import PageLayout from '../components/PageLayout.vue'
import Guarantees from '../components/Guarantees.vue'

const s = state.shipment
const sortedBids = computed(() => [...s.bids].sort((a, b) => a.price - b.price))
const hasBids = computed(() => s.bids.length > 0)
const stillWaiting = computed(() => s.status === 'bidding' && !s.bidsComplete)
const selected = computed(() => s.selectedBid)
</script>

<template>
  <PageLayout>
    <h1 class="h1">Offers for your shipment</h1>
    <p class="sub">Drivers on your route are bidding. Tap the offer you like.</p>

    <div v-if="stillWaiting && !hasBids" class="searching">
      <div class="pulse-ring" />
      <p class="search-text">Looking for drivers on the {{ s.from }} → {{ s.to ? s.to.name : '' }} route…</p>
    </div>

    <TransitionGroup name="bid" tag="div" class="bids">
      <button v-for="bid in sortedBids" :key="bid.id" class="bid-card" @click="selectBid(bid)">
        <span class="bid-top">
          <span class="bid-avatar">{{ bid.driver.avatar }}</span>
          <span class="bid-info">
            <span class="bid-name">{{ bid.driver.name }}</span>
            <span class="bid-meta"><span class="bid-stars">★ {{ bid.driver.rating }}</span> · {{ bid.driver.trips }} trips</span>
          </span>
          <span class="bid-price">{{ eur(bid.price) }}</span>
        </span>
        <span class="bid-dates">
          <span>Pickup <b>{{ fmtDay(bid.pickupDate) }}</b></span>
          <span>Delivered by <b>{{ fmtDay(bid.deliverBy) }}</b></span>
        </span>
      </button>
    </TransitionGroup>

    <p v-if="stillWaiting && hasBids" class="waiting-more">
      <span class="dot-pulse" /> Waiting for more offers…
    </p>

    <Guarantees v-if="hasBids" compact />

    <Teleport to="body">
      <div v-if="selected" class="sheet-backdrop" @click.self="cancelSelection">
        <div class="sheet" role="dialog" aria-label="Accept this offer">
          <div class="sheet-handle" />
          <p class="sheet-title">{{ selected.driver.name }} · {{ eur(selected.price) }}</p>
          <div class="sum">
            <div>Pickup <b>{{ fmtDay(selected.pickupDate) }}</b>, {{ slotText(s.pickupSlot) }}</div>
            <div>Guaranteed delivery by <b>{{ fmtDay(selected.deliverBy) }}</b></div>
          </div>
          <textarea v-model="s.driverNote" class="note-input" rows="2"
                    placeholder="Note to the driver (optional), e.g. ring the bell, 3rd floor" />
          <button class="btn btn-primary" @click="confirmBid">Accept {{ eur(selected.price) }}</button>
          <button class="btn-ghost" @click="cancelSelection">Back to offers</button>
        </div>
      </div>
    </Teleport>

    <template #actions>
      <div class="info">
        <span class="big">{{ hasBids ? sortedBids.length + ' offer' + (sortedBids.length !== 1 ? 's' : '') : 'Searching…' }}</span>
        <span class="small">{{ hasBids ? 'Lowest price first' : 'This usually takes a few seconds' }}</span>
      </div>
      <button class="btn" @click="cancelBidding">Change details</button>
    </template>
  </PageLayout>
</template>

<style scoped>
.searching { display: flex; flex-direction: column; align-items: center; gap: 20px; padding: 32px 0; }
.search-text { font-size: 17px; color: var(--muted); text-align: center; margin: 0; }

.bids { display: flex; flex-direction: column; gap: 12px; }
.bid-card { width: 100%; display: flex; flex-direction: column; gap: 12px; padding: 16px 18px; background: var(--card); border: 1.5px solid var(--line); border-radius: var(--radius); text-align: left; }
.bid-card:hover, .bid-card:focus-visible { border-color: var(--navy); }
.bid-top { display: flex; align-items: center; gap: 12px; }
.bid-avatar { width: 44px; height: 44px; border-radius: 50%; background: #EDE7DD; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 18px; flex: none; }
.bid-info { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.bid-name { font-size: 18px; font-weight: 600; }
.bid-meta { font-size: 14px; color: var(--muted); }
.bid-stars { color: var(--accent); font-weight: 600; }
.bid-price { font-size: 21px; font-weight: 700; white-space: nowrap; }
.bid-dates { display: flex; flex-wrap: wrap; gap: 4px 18px; font-size: 15px; color: var(--muted); padding-top: 10px; border-top: 1px solid var(--line); }
.bid-dates b { color: var(--ink); font-weight: 600; }

.waiting-more { display: flex; align-items: center; gap: 12px; font-size: 16px; color: var(--muted); margin: 0; }
.dot-pulse { width: 10px; height: 10px; border-radius: 50%; background: var(--accent); animation: pulse 1.6s ease-in-out infinite; flex: none; }

.sum { display: flex; flex-direction: column; gap: 4px; font-size: 16px; }
.note-input { width: 100%; border: 1.5px solid var(--line); border-radius: 14px; padding: 12px 14px; font: inherit; font-size: 16px; resize: vertical; background: var(--card); color: var(--ink); }
.note-input:focus { outline: none; border-color: var(--navy); }
.note-input::placeholder { color: var(--muted); }

.bid-enter-active { animation: slide-in 0.35s ease-out; }
@keyframes slide-in {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
