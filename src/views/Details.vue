<script setup>
import { computed } from 'vue'
import { state, go, SIZES, ARRIVALS, isAbroad, priceFor, kr, packageLabel, DELIVERY } from '../store.js'
import PageLayout from '../components/PageLayout.vue'
import Picker from '../components/Picker.vue'
import AddressField from '../components/AddressField.vue'

const s = state.shipment
const sizeOptions = computed(() => SIZES.map((x) => ({ id: x.id, label: x.plural, title: x.label[0].toUpperCase() + x.label.slice(1), hint: x.hint })))

const cheapest = computed(() => Math.min(...DELIVERY.map((d) => priceFor(d.id))))
const sizeWord = computed(() => packageLabel.value.replace(/^\d+ /, ''))

function next() {
  go(isAbroad.value ? 'customs' : 'delivery')
}
</script>

<template>
  <PageLayout back="photos">
    <div v-if="s.photos.length" class="mini">
      <div v-for="p in s.photos.slice(0, 4)" :key="p.id" class="mini-thumb" :style="{ backgroundImage: `url(${p.url})` }" />
      <span class="muted">We filled in the size from your photos</span>
    </div>

    <h1 class="h1">Where is it going?</h1>

    <div class="sentence">
      Send
      <span class="stepper">
        <button class="word" aria-label="Fewer packages" @click="s.count = Math.max(1, s.count - 1)">−</button>
        <span class="count">{{ Math.max(s.count, 1) }}</span>
        <button class="word" aria-label="More packages" @click="s.count = Math.max(1, s.count) + 1">+</button>
      </span>
      <Picker v-model="s.size" :options="sizeOptions" title="How big is each package?" :display="sizeWord" />
      from
      <input v-model="s.from" class="word" aria-label="Pick up from" :style="{ width: Math.max(140, s.from.length * 17 + 40) + 'px' }">
      to
      <AddressField />,
      arriving
      <Picker v-model="s.arrival" :options="ARRIVALS" title="When should it arrive?" />.
    </div>
    <p class="muted" style="margin: 0; font-size: 16px">Tap any underlined word to change it.</p>

    <template #actions>
      <div class="info">
        <span class="big">from {{ kr(cheapest) }}</span>
        <span class="small">{{ s.to ? `${s.to.name}, ${s.to.country}` : 'Pick a destination to see trucks on your route' }}</span>
      </div>
      <button class="btn btn-primary" :disabled="!s.to" @click="next">Continue</button>
    </template>
  </PageLayout>
</template>

<style scoped>
.mini { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; font-size: 15px; }
.mini-thumb { width: 64px; height: 64px; border-radius: 14px; background: #EDE7DD center / cover no-repeat; }
.stepper { display: inline-flex; align-items: center; gap: 6px; vertical-align: middle; }
.stepper .word { width: 56px; justify-content: center; padding: 0; box-shadow: none; border: 1.5px solid var(--line-strong); }
.count { min-width: 36px; text-align: center; font-weight: 700; }
</style>
