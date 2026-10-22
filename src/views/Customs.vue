<script setup>
import { ref, computed, watchEffect } from 'vue'
import { state, go, KINDS, needsFaktura } from '../store.js'
import PageLayout from '../components/PageLayout.vue'
import Picker from '../components/Picker.vue'
import Icon from '../components/Icon.vue'

const s = state.shipment
const file = ref(null)

// Outside Europe a faktura is required
watchEffect(() => { if (needsFaktura.value) s.customsMode = 'faktura' })

const ready = computed(() =>
  s.customsMode === 'faktura' ? !!s.fakturaName : s.contents.trim() && String(s.value).trim()
)

function onFile(e) {
  const f = e.target.files && e.target.files[0]
  if (f) s.fakturaName = f.name
}
</script>

<template>
  <PageLayout back="details">
    <h1 class="h1">It is going abroad. What is inside?</h1>
    <p class="sub">Customs needs to know. You only see this page when crossing a border.</p>

    <div class="seg" role="tablist">
      <button :class="{ on: s.customsMode === 'describe' }" :disabled="needsFaktura" @click="s.customsMode = 'describe'">Describe it</button>
      <button :class="{ on: s.customsMode === 'faktura' }" @click="s.customsMode = 'faktura'">Upload faktura</button>
    </div>

    <div v-if="s.customsMode === 'describe'" class="sentence">
      It is
      <input v-model="s.contents" class="word" :class="{ empty: !s.contents }" placeholder="what" aria-label="What is inside"
             :style="{ width: Math.max(150, s.contents.length * 17 + 40) + 'px' }">
      worth
      <input v-model="s.value" class="word" :class="{ empty: !s.value }" placeholder="5 000 kr" inputmode="numeric" aria-label="Total value"
             :style="{ width: Math.max(150, String(s.value).length * 17 + 40) + 'px' }">,
      and it is a
      <Picker v-model="s.kind" :options="KINDS" title="What kind of shipment?" />.
    </div>

    <div v-else class="faktura">
      <button class="option" :class="{ selected: s.fakturaName }" @click="file.click()">
        <Icon name="upload" :size="28" />
        <span class="grow">
          <span class="title">{{ s.fakturaName || 'Upload your faktura (invoice)' }}</span>
          <span class="hint">{{ s.fakturaName ? 'Tap to replace' : 'PDF or a photo of it' }}</span>
        </span>
      </button>
      <input ref="file" type="file" accept="application/pdf,image/*" hidden @change="onFile">
    </div>

    <div class="card">
      <template v-if="needsFaktura">{{ s.to.country }} is outside Europe, so customs needs your faktura.</template>
      <template v-else>Within Europe a short description is enough, we make the papers. Outside Europe, upload your faktura.</template>
    </div>

    <template #actions>
      <div class="info">
        <span class="big">Customs papers included</span>
        <span class="small">We send them with the truck</span>
      </div>
      <button class="btn btn-primary" :disabled="!ready" @click="go('delivery')">Continue</button>
    </template>
  </PageLayout>
</template>

<style scoped>
.seg button:disabled { opacity: 0.4; cursor: not-allowed; }
.faktura { display: flex; flex-direction: column; gap: 12px; }
.card { font-size: 16px; }
</style>
