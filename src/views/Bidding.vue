<script setup>
import { computed } from 'vue'
import { state, go, kr, selectBid, cancelSelection, confirmBid } from '../store.js'
import PageLayout from '../components/PageLayout.vue'

const s = state.shipment
const sortedBids = computed(() => [...s.bids].sort((a, b) => a.price - b.price))
const hasBids = computed(() => s.bids.length > 0)
const stillWaiting = computed(() => s.status === 'bidding' && !s.bidsComplete)
const selected = computed(() => s.selectedBid)
</script>

<template>
  <PageLayout back="delivery">
    <h1 class="h1">Drivers are bidding on your shipment</h1>
    <p class="sub">Sit tight — drivers on your route are reviewing and placing bids. You pick the one you like.</p>

    <div v-if="stillWaiting && !hasBids" class="searching">
      <div class="pulse-ring" />
      <p class="search-text">Looking for drivers on the {{ s.from }} → {{ s.to ? s.to.name : '' }} route…</p>
    </div>

    <TransitionGroup name="bid" tag="div" class="bids">
      <button
        v-for="bid in sortedBids"
        :key="bid.id"
        class="bid-card"
        :class="{ selected: selected && selected.id === bid.id }"
        @click="selectBid(bid)"
      >
        <span class="bid-avatar">{{ bid.driver.avatar }}</span>
        <span class="bid-info">
          <span class="bid-name">{{ bid.driver.name }}</span>
          <span class="bid-meta">
            <span class="bid-stars">★ {{ bid.driver.rating }}</span>
            <span class="bid-trips">· {{ bid.driver.trips }} trips</span>
          </span>
          <span class="bid-eta">Picks up in {{ bid.etaDays }} day{{ bid.etaDays !== 1 ? 's' : '' }}</span>
        </span>
        <span class="bid-price-col">
          <span class="bid-price">{{ kr(bid.price) }}</span>
          <span class="bid-time">{{ bid.time }}</span>
        </span>
      </button>
    </TransitionGroup>

    <p v-if="stillWaiting && hasBids" class="waiting-more">
      <span class="dot-pulse" /> Waiting for more bids…
    </p>

    <!-- Note to driver panel -->
    <Transition name="note">
      <div v-if="selected" class="note-panel">
        <div class="note-header">
          <span class="note-title">Send {{ selected.driver.name }} a note</span>
          <button class="btn-ghost" @click="cancelSelection">Cancel</button>
        </div>
        <textarea
          v-model="s.driverNote"
          class="note-input"
          placeholder="e.g. Ring the doorbell, it's on the 3rd floor. Handle with care."
          rows="3"
        />
        <button class="btn btn-primary note-confirm" @click="confirmBid">
          Accept {{ kr(selected.price) }} · {{ selected.driver.name }}
        </button>
      </div>
    </Transition>

    <template #actions>
      <div class="info">
        <span class="big">{{ hasBids ? sortedBids.length + ' bid' + (sortedBids.length !== 1 ? 's' : '') : 'Searching…' }}</span>
        <span class="small">{{ selected ? 'Add a note and confirm' : 'Tap a bid to accept it' }}</span>
      </div>
      <button class="btn" @click="go('delivery')">Cancel</button>
    </template>
  </PageLayout>
</template>

<style scoped>
.searching {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px 0;
}
.pulse-ring {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 3px solid var(--accent);
  animation: pulse 1.6s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { transform: scale(0.9); opacity: 0.5; }
  50% { transform: scale(1.1); opacity: 1; }
}
.search-text {
  font-size: 18px;
  color: var(--muted);
  text-align: center;
}

.bids {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.bid-card {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
  background: var(--card);
  border: 1.5px solid var(--line);
  border-radius: var(--radius);
  text-align: left;
  transition: border-color 0.15s;
}
.bid-card:hover, .bid-card:focus-visible {
  border-color: var(--navy);
}
.bid-card.selected {
  border: 2.5px solid var(--navy);
  padding: 17px 21px;
}
.bid-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #EDE7DD;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 20px;
  flex: none;
}
.bid-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}
.bid-name {
  font-size: 19px;
  font-weight: 600;
}
.bid-meta {
  font-size: 15px;
  color: var(--muted);
  display: flex;
  gap: 4px;
}
.bid-stars { color: var(--accent); font-weight: 600; }
.bid-eta {
  font-size: 15px;
  color: var(--muted);
}
.bid-price-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex: none;
}
.bid-price {
  font-size: 22px;
  font-weight: 700;
}
.bid-time {
  font-size: 14px;
  color: var(--muted);
}

.waiting-more {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  color: var(--muted);
  padding: 8px 0;
}
.dot-pulse {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  animation: pulse 1.6s ease-in-out infinite;
  flex: none;
}

/* Note panel */
.note-panel {
  background: var(--card);
  border-radius: var(--radius);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  border: 2px solid var(--navy);
}
.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.note-title {
  font-size: 18px;
  font-weight: 600;
}
.note-input {
  width: 100%;
  border: 1.5px solid var(--line);
  border-radius: 14px;
  padding: 14px 16px;
  font: inherit;
  font-size: 17px;
  resize: vertical;
  background: var(--bg);
  color: var(--ink);
}
.note-input:focus {
  outline: none;
  border-color: var(--navy);
}
.note-input::placeholder {
  color: var(--muted);
}
.note-confirm {
  min-width: 0;
  width: 100%;
}

/* transitions */
.bid-enter-active { animation: slide-in 0.35s ease-out; }
@keyframes slide-in {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.note-enter-active { animation: slide-in 0.25s ease-out; }
.note-leave-active { animation: slide-in 0.2s ease-in reverse; }
</style>
