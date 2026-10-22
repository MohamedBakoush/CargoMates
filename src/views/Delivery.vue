<script setup>
import { state, go, DELIVERY, priceFor, price, kr, isAbroad, book } from '../store.js'
import PageLayout from '../components/PageLayout.vue'

const s = state.shipment
</script>

<template>
  <PageLayout :back="isAbroad ? 'customs' : 'details'">
    <h1 class="h1">How close to {{ s.to ? s.to.name : 'the destination' }} is good enough?</h1>
    <p class="sub">Close by is cheaper and finds a truck sooner. We'll notify you when you have a new offer.</p>

    <button v-for="d in DELIVERY" :key="d.id" class="option" :class="{ selected: s.delivery === d.id }" @click="s.delivery = d.id">
      <span class="grow">
        <span class="title">{{ d.title }}</span>
        <span class="hint">{{ d.hint }} · {{ d.trucks }} trucks this week</span>
        <span v-if="d.tag" class="tag">{{ d.tag }}</span>
      </span>
      <span class="price">{{ kr(priceFor(d.id)) }}</span>
      <span class="radio" />
    </button>

    <template #actions>
      <div class="info">
        <span class="big">{{ kr(price) }}</span>
        <span class="small">{{ isAbroad ? 'Customs and damage cover included' : 'Damage cover included' }} · pay when it arrives</span>
      </div>
      <button class="btn btn-primary" @click="book">Book</button>
    </template>
  </PageLayout>
</template>
