<script setup>
import { state, DELIVERY, PICKUP_SLOTS, priceFor, price, eur, isAbroad, book } from '../store.js'
import PageLayout from '../components/PageLayout.vue'
import Guarantees from '../components/Guarantees.vue'

const s = state.shipment
</script>

<template>
  <PageLayout :back="isAbroad ? 'customs' : 'details'">
    <h1 class="h1">Pickup and delivery</h1>

    <section class="block">
      <h2 class="h2">We pick up at your door in {{ s.from }}</h2>
      <p class="muted">Choose a half-day slot. Each offer tells you the date.</p>
      <div class="seg">
        <button v-for="p in PICKUP_SLOTS" :key="p.id" :class="{ on: s.pickupSlot === p.id }" @click="s.pickupSlot = p.id">
          {{ p.label }} <span class="slot-hint">{{ p.hint }}</span>
        </button>
      </div>
    </section>

    <section class="block">
      <h2 class="h2">Delivery in {{ s.to ? s.to.name : 'the destination' }}</h2>
      <button v-for="d in DELIVERY" :key="d.id" class="option" :class="{ selected: s.delivery === d.id }" @click="s.delivery = d.id">
        <span class="grow">
          <span class="title">{{ d.title }}</span>
          <span class="hint">{{ d.hint }}</span>
          <span v-if="d.tag" class="tag">{{ d.tag }}</span>
        </span>
        <span class="price">{{ eur(priceFor(d.id)) }}</span>
        <span class="radio" />
      </button>
    </section>

    <Guarantees compact />

    <template #actions>
      <div class="info">
        <span class="big">about {{ eur(price) }}</span>
        <span class="small">{{ isAbroad ? 'Customs included · ' : '' }}Pay when it arrives</span>
      </div>
      <button class="btn btn-primary" @click="book">Get offers</button>
    </template>
  </PageLayout>
</template>

<style scoped>
.block { display: flex; flex-direction: column; gap: 10px; }
.h2 { font-size: 19px; font-weight: 600; margin: 0; }
.block .muted { margin: 0; font-size: 15px; }
.seg button { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; }
.slot-hint { font-size: 13px; font-weight: 400; color: var(--muted); }
</style>
