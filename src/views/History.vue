<script setup>
import { ref, computed } from 'vue'
import { state, go, fmtDay, eur, startNew, senderHome, allOrders, payOrder, payLabel } from '../store.js'
import RouteMap from '../components/RouteMap.vue'
import Icon from '../components/Icon.vue'

const expandedId = ref(state.openOrder || (state.justPaid && state.history.length ? state.history[state.history.length - 1].id : null))
state.openOrder = null

const orders = computed(() =>
  [...allOrders.value].sort((a, b) => (state.justPaid ? b.id.localeCompare(a.id, undefined, { numeric: true }) : 0) || (b.pickup || '').localeCompare(a.pickup || ''))
)

function toggle(id) {
  expandedId.value = expandedId.value === id ? null : id
}

// What an unpaid order needs next: where it is, and what the sender can do about it
function pending(o) {
  if (o.status === 'arrived') return { text: 'It has arrived. Pay to finish.', progress: 100 }
  if (o.status === 'onway') return { text: `${o.driver} is on the way · arrives by ${fmtDay(o.arrive)}`, progress: 55 }
  return { text: `${o.driver} picks up ${fmtDay(o.pickup)} · delivery by ${fmtDay(o.arrive)}`, progress: 0 }
}
function track(o) {
  go(o.status === 'onway' ? 'onway' : 'booked')
}
function payNow(o) {
  if (o.current) go('arrived')
  else payOrder(o.id)
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
      <button class="btn btn-round" aria-label="Back" @click="go(senderHome())"><Icon name="back" /></button>
      <button class="brand" aria-label="CargoMates home" @click="go('home')"><img class="logo" src="/logo.jpg" alt="CargoMates" width="44" height="44"></button>
      <button class="role-tag" aria-label="Sender home" @click="go('photos')">Sender</button>
      <div class="spacer" />
      <button class="btn btn-pill collapse" aria-label="Profile" @click="go('profile')"><Icon name="user" :size="20" /><span class="lbl">Profile</span></button>
    </header>

    <div class="body">
      <main class="main" style="flex: 1 1 100%">
        <div class="main-inner">
          <div v-if="state.justPaid" class="paid-banner">
            <span class="paid-ok"><Icon name="check" :size="22" :stroke="2.4" /></span>
            <span><b>Paid. Thanks!</b><br>Your receipt is open below.</span>
          </div>
          <h1 class="h1">Orders</h1>

          <div v-if="!orders.length" class="empty">
            <p class="muted">No orders yet. Start your first shipment!</p>
          </div>

          <div v-for="order in orders" :key="order.id" class="receipt" :class="{ open: expandedId === order.id }">
            <button class="receipt-header" @click="toggle(order.id)">
              <div class="receipt-main">
                <span class="receipt-route">{{ order.from || 'Madrid' }} → {{ order.to || order.title }}</span>
                <span class="receipt-what">{{ order.what }} · {{ fmtDay(order.pickup) }}</span>
              </div>
              <div class="receipt-right">
                <span class="receipt-price">{{ eur(order.price || 0) }}</span>
                <span class="receipt-status" :class="statusClass(order.status)">{{ statusLabel(order.status) }}</span>
              </div>
              <Icon :name="expandedId === order.id ? 'chevron-down' : 'next'" :size="20" />
            </button>

            <Transition name="expand">
              <div v-if="expandedId === order.id" class="receipt-body">
                <div class="receipt-divider" />

                <div class="receipt-section">
                  <div class="receipt-logo">CargoMates</div>
                  <div class="receipt-id muted">{{ order.current ? 'In progress' : 'Order #' + order.id.replace('h', '') }}</div>
                </div>

                <div class="receipt-grid">
                  <div class="receipt-cell">
                    <span class="label">From</span>
                    <span class="val">{{ order.from || 'Madrid' }}</span>
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
                    <span class="label">Pickup</span>
                    <span class="val">{{ fmtDay(order.pickup) }}</span>
                  </div>
                  <div class="receipt-cell">
                    <span class="label">{{ order.status === 'paid' ? 'Arrived' : 'Delivery by' }}</span>
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
                    <span>{{ eur(order.price || 0) }}</span>
                  </div>
                  <div v-if="order.abroad" class="receipt-row muted">
                    <span>Customs & cover</span>
                    <span>included</span>
                  </div>
                  <div class="receipt-row total-row">
                    <span>Total</span>
                    <span>{{ eur(order.price || 0) }}</span>
                  </div>
                </div>

                <div v-if="order.paidDate" class="receipt-footer">
                  <span class="muted">Paid {{ fmtDay(order.paidDate) }} via {{ payLabel(order.payMethod) }}</span>
                </div>
                <div v-else class="pending">
                  <RouteMap :from="order.from || 'Madrid'" :to="order.to || order.title" :progress="pending(order).progress" />
                  <div class="pending-text">{{ pending(order).text }}</div>
                  <template v-if="order.status === 'arrived'">
                    <button class="btn btn-primary" @click="payNow(order)">Pay {{ eur(order.price || 0) }}</button>
                  </template>
                  <template v-else>
                    <div class="pending-actions">
                      <button v-if="order.current" class="btn btn-primary" @click="track(order)">{{ order.status === 'onway' ? 'Track shipment' : 'See booking' }}</button>
                      <button v-if="order.current" class="btn" @click="go('chat')">Message driver</button>
                    </div>
                    <span class="muted pay-later">Nothing to pay yet. You pay when it arrives.</span>
                  </template>
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
        <span class="small">Tap one for the receipt</span>
      </div>
      <button class="btn btn-primary" @click="startNew">+ New shipment</button>
    </footer>
  </div>
</template>

<style scoped>
.paid-banner { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: var(--radius); background: #E8F5E9; font-size: 16px; line-height: 1.35; }
.paid-ok { width: 40px; height: 40px; border-radius: 50%; background: #2E7D32; color: #fff; display: flex; align-items: center; justify-content: center; flex: none; }

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
  gap: 12px;
  padding: 16px 18px;
  border: 0;
  background: none;
  text-align: left;
}
.receipt-main { flex: 1; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.receipt-route { font-size: 18px; font-weight: 600; }
.receipt-what { font-size: 14px; color: var(--muted); }
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
.pending { display: flex; flex-direction: column; gap: 10px; }
.pending-text { font-size: 16px; font-weight: 600; }
.pending-actions { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
.pending .btn { min-height: 52px; min-width: 0; padding: 0 12px; font-size: 16px; }
.pay-later { font-size: 14px; text-align: center; }

/* expand transition */
.expand-enter-active { animation: expand-in 0.25s ease-out; }
.expand-leave-active { animation: expand-in 0.2s ease-in reverse; }
@keyframes expand-in {
  from { opacity: 0; max-height: 0; }
  to { opacity: 1; max-height: 1000px; }
}
</style>
