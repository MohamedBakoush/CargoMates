<script setup>
import { state, go, DELIVERY, priceFor, price, kr, isAbroad, book } from '../store.js'
import PageLayout from '../components/PageLayout.vue'
import Guarantees from '../components/Guarantees.vue'

const s = state.shipment
</script>

<template>
  <PageLayout :back="isAbroad ? 'customs' : 'details'">
    <h1 class="h1">How should we handle pickup?</h1>
    <p class="sub">We come to you by default — no need to drop anything off.</p>

    <button v-for="d in DELIVERY" :key="d.id" class="option" :class="{ selected: s.delivery === d.id }" @click="s.delivery = d.id">
      <span class="grow">
        <span class="title">{{ d.title }}</span>
        <span class="hint">{{ d.hint }} · {{ d.trucks }} trucks this week</span>
        <span v-if="d.tag" class="tag">{{ d.tag }}</span>
      </span>
      <span class="price">{{ kr(priceFor(d.id)) }}</span>
      <span class="radio" />
    </button>

    <Guarantees compact />

    <template #actions>
      <div class="info">
        <span class="big">{{ kr(price) }}</span>
        <span class="small">{{ isAbroad ? 'Customs and damage cover included' : 'All guarantees included' }} · pay when it arrives</span>
      </div>
      <button class="btn btn-primary" @click="book">Book</button>
    </template>
  </PageLayout>
</template>
