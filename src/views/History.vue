<script setup>
import { ref, computed } from 'vue'
import { state, go, fmtDay, kr, startNew } from '../store.js'
import Icon from '../components/Icon.vue'

const expandedId = ref(null)

const orders = computed(() =>
  [...state.history].sort((a, b) => (b.pickup || '').localeCompare(a.pickup || ''))
)

function toggle(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function statusLabel(s) {
  if (s === 'paid') return 'Paid'
  if (s === 'booked') return 'Booked'
  if (s === 'onway') return 'On the way'
  if (s === 'arrived') return 'Arrived'
  return s
}

function statusClass(s) {
  if (s === 'paid') return 'st-paid'
  if (s === 'booked' || s === 'onway') return 'st-active'
  return 'st-other'
}
</script>

<template>
  <div class="page">
    <header class="topbar">
      <button class="btn btn-round" aria-label="Back" @click="go('calendar')"><Icon name="back" /></button>
      <div class="brand">CargoMates</div>
      <div class="spacer" />
      <button class="btn btn-pill" @click="go('calendar')"><Icon name="calendar" :size="20" />Calendar</button>
    </header>

    <div class="body">
      <main class="main" style="flex: 1 1 100%">
        <div class="main-inner">
          <h1 class="h1">Order history</h1>
          <p class="sub">All your shipments in one place. Tap to see the full receipt.</p>

          <div v-if="!orders.length" class="empty">
            <p class="muted">No orders yet. Start your first shipment!</p>
          </div>

          <div v-for="order in orders" :key="order.id" class="receipt" :class="{ open: expandedId === order.id }">
            <button class="receipt-header" @click="toggle(order.id)">
              <div class="receipt-route">
                <span class="receipt-from">{{ order.from || 'Drammen' }}</span>
                <span class="receipt-arrow">→</span>
                <span class="receipt-to">{{ order.to || order.title }}</span>
              </div>
              <div class="receipt-summary">
                <span class="receipt-what">{{ order.what }}</span>
                <span class="receipt-date">{{ fmtDay(order.pickup) }}</span>
              </div>
              <div class="receipt-right">
                <span class="receipt-price">{{ kr(order.price || 0) }}</span>
                <span class="receipt-status" :class="statusClass(order.status)">{{ statusLabel(order.status) }}</span>
              </div>
              <Icon :name="expandedId === order.id ? 'chevron-down' : 'next'" :size="20" />
            </button>

            <Transition name="expand">
              <div v-if="expandedId === order.id" class="receipt-body">
                <div class="receipt-divider" />

                <div class="receipt-section">
                  <div class="receipt-logo">CargoMates</div>
                  <div class="receipt-id muted">Order #{{ order.id.replace('h', '') }}</div>
                </div>

                <div class="receipt-grid">
                  <div class="receipt-cell">
                    <span class="label">From</span>
                    <span class="val">{{ order.from || 'Drammen' }}</span>
                  </div>
                  <div class="receipt-cell">
                    <span class="label">To</span>
                    <span class="val">{{ order.to || order.title }}{{ order.toCountry ? ', ' + order.toCountry : '' }}</span>
                  </div>
                  <div class="receipt-cell">
                    <span class="label">Package</span>
                    <span class="val">{{ order.what }}</span>
                  </div>
                  <div class="receipt-cell">
                    <span class="label">Driver</span>
                    <span class="val">{{ order.driver || '—' }}</span>
                  </div>
                  <div class="receipt-cell">
                    <span class="label">Picked up</span>
                    <span class="val">{{ fmtDay(order.pickup) }}</span>
                  </div>
                  <div class="receipt-cell">
                    <span class="label">{{ order.status === 'paid' ? 'Arrived' : 'Est. arrival' }}</span>
                    <span class="val" :class="{ grayed: order.status !== 'paid' }">{{ fmtDay(order.arrive) }}</span>
                  </div>
                </div>

                <div v-if="order.hub" class="receipt-cell full">
                  <span class="label">Pickup point</span>
                  <span class="val">{{ order.hub }}</span>
                </div>

                <div v-if="order.code" class="receipt-cell full">
                  <span class="label">Pickup code</span>
                  <span class="val code-val">{{ order.code }}</span>
                </div>

                <div v-if="order.note" class="receipt-cell full">
                  <span class="label">Note to driver</span>
                  <span class="val note-val">{{ order.note }}</span>
                </div>

                <div class="receipt-divider" />

                <div class="receipt-total">
                  <div class="receipt-row">
                    <span>Shipping</span>
                    <span>{{ kr(order.price || 0) }}</span>
                  </div>
                  <div v-if="order.abroad" class="receipt-row muted">
                    <span>Customs & cover</span>
                    <span>included</span>
                  </div>
                  <div class="receipt-row total-row">
                    <span>Total</span>
                    <span>{{ kr(order.price || 0) }}</span>
                  </div>
                </div>

                <div v-if="order.paidDate" class="receipt-footer">
                  <span class="muted">Paid {{ fmtDay(order.paidDate) }} via {{ order.payMethod || 'Vipps' }}</span>
                </div>
                <div v-else class="receipt-footer">
                  <span class="muted unpaid">Payment pending · pay when it arrives</span>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </main>
    </div>

    <footer class="actionbar">
      <div class="info">
        <span class="big">{{ orders.length }} order{{ orders.length !== 1 ? 's' : '' }}</span>
        <span class="small">Tap any order for the full receipt</span>
      </div>
      <button class="btn btn-primary" @click="startNew">+ New shipment</button>
    </footer>
  </div>
</template>

<style scoped>
.empty {
  padding: 40px 0;
  text-align: center;
}

.receipt {
  background: var(--card);
  border-radius: var(--radius);
  overflow: hidden;
  border: 1.5px solid var(--line);
  transition: border-color 0.15s;
}
.receipt.open {
  border-color: var(--navy);
}
.receipt-header {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
  border: 0;
  background: none;
  text-align: left;
}
.receipt-route {
  flex: 1 1 160px;
  display: flex;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  min-width: 0;
}
.receipt-arrow { color: var(--muted); }
.receipt-summary {
  flex: 1 1 120px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.receipt-what { font-size: 15px; color: var(--muted); }
.receipt-date { font-size: 14px; color: var(--muted); }
.receipt-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  flex: none;
}
.receipt-price { font-size: 20px; font-weight: 700; }
.receipt-status {
  font-size: 13px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 8px;
}
.st-paid { background: #E8F5E9; color: #2E7D32; }
.st-active { background: #FFF3E0; color: #E65100; }
.st-other { background: var(--soft); color: var(--muted); }

.receipt-body {
  padding: 0 22px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.receipt-divider {
  height: 1px;
  background: var(--line);
  margin: 4px -22px;
  position: relative;
}
.receipt-divider::before,
.receipt-divider::after {
  content: '';
  position: absolute;
  top: -6px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--bg);
}
.receipt-divider::before { left: -6px; }
.receipt-divider::after { right: -6px; }

.receipt-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.receipt-logo { font-size: 20px; font-weight: 700; }
.receipt-id { font-size: 14px; }

.receipt-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.receipt-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.receipt-cell.full {
  grid-column: 1 / -1;
}
.val { font-size: 16px; font-weight: 500; }
.grayed { opacity: 0.45; }
.code-val { font-size: 24px; font-weight: 700; letter-spacing: 0.08em; }
.note-val { font-style: italic; }

.receipt-total {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.receipt-row {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
}
.total-row {
  font-weight: 700;
  font-size: 20px;
  padding-top: 6px;
  border-top: 1.5px solid var(--line);
}

.receipt-footer {
  text-align: center;
  font-size: 14px;
}
.unpaid { color: var(--accent); font-weight: 600; }

/* expand transition */
.expand-enter-active { animation: expand-in 0.25s ease-out; }
.expand-leave-active { animation: expand-in 0.2s ease-in reverse; }
@keyframes expand-in {
  from { opacity: 0; max-height: 0; }
  to { opacity: 1; max-height: 600px; }
}
</style>
