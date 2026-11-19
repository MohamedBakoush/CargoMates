<script setup>
// Front door: explains CargoMates and sends people into the sender or driver side.
import { state, go, switchMode, senderHome } from '../store.js'
import Icon from '../components/Icon.vue'
import RouteMap from '../components/RouteMap.vue'
import Guarantees from '../components/Guarantees.vue'

const s = state.shipment
const inProgress = () => s.booking && !['draft', 'paid'].includes(s.status)

const SENDER_STEPS = [
  { icon: 'camera', title: 'Snap a photo', text: 'One photo per package. We estimate size and weight, you correct it if needed.' },
  { icon: 'calendar', title: 'Pick an offer', text: 'Drivers already on your route bid. Every offer has a price and a guaranteed delivery date.' },
  { icon: 'truck', title: 'Track it, then pay', text: 'We collect from your door. Follow the truck on the map and pay when it arrives.' },
]

const DRIVER_STEPS = [
  { icon: 'pin', title: 'Tell us your route', text: 'Madrid to Malmö, or just one country. You choose where you take jobs.' },
  { icon: 'package', title: 'Bid on what fits', text: 'Packages on your way come first, with the detour each one adds.' },
  { icon: 'check', title: 'Deliver and get rated', text: 'Photo at pickup and drop-off, paid on delivery, ratings both ways.' },
]

const EXTRAS = [
  { icon: 'headphones', title: 'Chat in the app', text: 'Sender and driver message each other. The driver calls when they need directions.' },
  { icon: 'star', title: 'Ratings both ways', text: 'See a driver’s stars before you accept, and a sender’s before you bid.' },
  { icon: 'receipt', title: 'Pay on arrival', text: 'Bizum, card or invoice. Nothing is charged until the goods arrive.' },
]

const LEGS = [
  { from: 'Hamburg', to: 'Malmö' },
  { from: 'Amsterdam', to: 'Copenhagen' },
  { from: 'Paris', to: 'Berlin' },
]
</script>

<template>
  <div class="landing">
    <header class="l-top">
      <span class="brand">CargoMates</span>
      <div class="spacer" />
      <button class="l-link" @click="switchMode('driver')">For drivers</button>
    </header>

    <main class="l-main">
      <section class="hero">
        <div class="hero-text">
          <p class="eyebrow">Shipping for small businesses in Europe</p>
          <h1 class="hero-title">Picked up at your door. Delivered on a date we guarantee.</h1>
          <p class="hero-sub">
            CargoMates matches your boxes and pallets with trucks already driving your route,
            so you get a fair price, a delivery date you can promise your customer, and one place to follow it all.
          </p>
          <div class="cta">
            <button class="btn btn-primary" @click="go('photos')"><Icon name="package" :size="20" />Send something</button>
            <button class="btn" @click="switchMode('driver')"><Icon name="truck" :size="20" />I’m a driver</button>
          </div>
          <button v-if="inProgress()" class="card resume" @click="go(senderHome())">
            <span class="resume-main">
              <span class="resume-title">{{ s.from }} → {{ s.to.name }}</span>
              <span class="muted">Your shipment in progress · {{ s.booking.driver }}</span>
            </span>
            <span class="resume-open">Open</span>
          </button>
        </div>
        <div class="hero-map card">
          <RouteMap from="Madrid" to="Malmö" :progress="45" :legs="LEGS" />
          <p class="muted map-caption">A driver heading from Madrid to Malmö picks up packages along the way.</p>
        </div>
      </section>

      <section class="block">
        <h2 class="h2">Sending something</h2>
        <ol class="steps-row">
          <li v-for="(st, i) in SENDER_STEPS" :key="st.title" class="card step">
            <span class="step-top"><span class="step-n">{{ i + 1 }}</span><Icon :name="st.icon" :size="22" /></span>
            <span class="step-title">{{ st.title }}</span>
            <span class="muted step-text">{{ st.text }}</span>
          </li>
        </ol>
      </section>

      <section class="block">
        <Guarantees />
      </section>

      <section class="block">
        <h2 class="h2">Driving anyway? Fill the empty space.</h2>
        <ol class="steps-row">
          <li v-for="(st, i) in DRIVER_STEPS" :key="st.title" class="card step">
            <span class="step-top"><span class="step-n">{{ i + 1 }}</span><Icon :name="st.icon" :size="22" /></span>
            <span class="step-title">{{ st.title }}</span>
            <span class="muted step-text">{{ st.text }}</span>
          </li>
        </ol>
        <button class="btn driver-cta" @click="switchMode('driver')">Find packages on my route</button>
      </section>

      <section class="block">
        <h2 class="h2">Built for both sides</h2>
        <div class="extras">
          <div v-for="x in EXTRAS" :key="x.title" class="extra">
            <span class="extra-icon"><Icon :name="x.icon" :size="20" /></span>
            <span class="extra-text">
              <span class="step-title">{{ x.title }}</span>
              <span class="muted step-text">{{ x.text }}</span>
            </span>
          </div>
        </div>
      </section>

      <section class="final card">
        <h2 class="h2">Ready to send?</h2>
        <p class="muted">Start with a photo. It takes about a minute to get offers.</p>
        <button class="btn btn-primary" @click="go('photos')">Send something</button>
      </section>

      <footer class="l-foot muted">CargoMates prototype. Prices, drivers and tracking are sample data.</footer>
    </main>
  </div>
</template>

<style scoped>
.landing { height: 100%; overflow-y: auto; background: var(--bg); }
.l-top { position: sticky; top: 0; z-index: 5; display: flex; align-items: center; gap: 12px; min-height: 60px; padding: 8px max(16px, env(safe-area-inset-left, 0px)); background: rgba(251, 248, 243, 0.92); backdrop-filter: blur(8px); }
.l-link { min-height: 44px; padding: 0 14px; border: 0; border-radius: 999px; background: var(--card); font-size: 15px; font-weight: 600; }

.l-main { max-width: 1040px; margin: 0 auto; padding: 8px 16px calc(32px + env(safe-area-inset-bottom, 0px)); display: flex; flex-direction: column; gap: 40px; }

.hero { display: grid; gap: 20px; padding-top: 8px; }
.hero-text { display: flex; flex-direction: column; gap: 14px; }
.eyebrow { margin: 0; font-size: 14px; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.06em; }
.hero-title { margin: 0; font-size: 34px; line-height: 1.12; font-weight: 700; }
.hero-sub { margin: 0; font-size: 17px; line-height: 1.5; color: var(--muted); }
.cta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 4px; }
.cta .btn { flex: 1 1 200px; min-width: 0; min-height: 56px; font-size: 17px; }
.resume { width: 100%; border: 1.5px solid var(--navy); text-align: left; display: flex; align-items: center; gap: 12px; }
.resume-main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; font-size: 15px; }
.resume-title { font-size: 17px; font-weight: 600; }
.resume-open { font-size: 16px; font-weight: 600; text-decoration: underline; }
.hero-map { padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.map-caption { margin: 0 4px 2px; font-size: 14px; }

.block { display: flex; flex-direction: column; gap: 14px; }
.h2 { margin: 0; font-size: 24px; font-weight: 700; line-height: 1.2; }
.steps-row { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.step { display: flex; flex-direction: column; gap: 6px; }
.step-top { display: flex; align-items: center; justify-content: space-between; color: var(--navy); }
.step-n { width: 30px; height: 30px; border-radius: 50%; background: var(--navy); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 15px; }
.step-title { font-size: 17px; font-weight: 600; }
.step-text { font-size: 15px; line-height: 1.45; }
.driver-cta { align-self: flex-start; min-height: 52px; font-size: 16px; }

.extras { display: grid; gap: 14px; }
.extra { display: flex; gap: 12px; align-items: flex-start; }
.extra-icon { width: 40px; height: 40px; border-radius: 12px; background: var(--soft); color: var(--navy); display: flex; align-items: center; justify-content: center; flex: none; }
.extra-text { display: flex; flex-direction: column; gap: 2px; }

.final { display: flex; flex-direction: column; gap: 10px; align-items: flex-start; padding: 22px; }
.final p { margin: 0; font-size: 16px; }
.final .btn { min-width: 0; align-self: stretch; }
.l-foot { font-size: 13px; text-align: center; }

@media (min-width: 760px) {
  .l-top { padding-inline: 32px; }
  .l-main { padding-inline: 32px; gap: 56px; }
  .hero { grid-template-columns: 1.05fr 1fr; align-items: center; gap: 36px; padding-top: 32px; }
  .hero-title { font-size: 46px; }
  .steps-row, .extras { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .final { align-items: center; text-align: center; }
  .final .btn { align-self: center; min-width: 280px; }
}
</style>
