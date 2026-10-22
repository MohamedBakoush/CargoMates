<script setup>
import { ref, computed } from 'vue'
import { state, go, addPhotos, removePhoto, packageLabel } from '../store.js'
import PageLayout from '../components/PageLayout.vue'
import Icon from '../components/Icon.vue'

const s = state.shipment
const camera = ref(null)
const picker = ref(null)
const dragging = ref(false)

function onFiles(e) {
  const files = [...(e.target.files || [])].filter((f) => f.type.startsWith('image/'))
  if (files.length) addPhotos(files)
  e.target.value = ''
}

function onDrop(e) {
  dragging.value = false
  const files = [...(e.dataTransfer?.files || [])].filter((f) => f.type.startsWith('image/'))
  if (files.length) addPhotos(files)
}

function noPhoto() {
  if (!s.count) s.count = 1
  go('details')
}

const hasEstimate = computed(() => s.photos.length > 0)
const volume = computed(() => {
  const l = parseInt(s.length) || 0
  const w = parseInt(s.width) || 0
  const h = parseInt(s.height) || 0
  return l * w * h
})
const volumeLabel = computed(() => {
  const v = volume.value
  if (v === 0) return ''
  if (v < 1000000) return (v / 1000).toFixed(1) + ' litres'
  return (v / 1000000).toFixed(2) + ' m³'
})
</script>

<template>
  <PageLayout>
    <h1 class="h1">What are you sending?</h1>
    <p class="sub">Add a photo of each package. We analyse it to estimate the size.</p>

    <div v-if="!s.photos.length" class="tiles">
      <button class="tile" @click="camera.click()">
        <span class="circle"><Icon name="camera" :size="42" :stroke="1.6" /></span>
        <span class="tile-title">Take a photo</span>
        <span class="muted">Opens the camera</span>
      </button>
      <button class="tile dashed" :class="{ over: dragging }" @click="picker.click()"
              @dragover.prevent="dragging = true" @dragleave="dragging = false" @drop.prevent="onDrop">
        <span class="circle"><Icon name="upload" :size="42" :stroke="1.6" /></span>
        <span class="tile-title">Choose photos</span>
        <span class="muted">Or drag them here on a computer</span>
      </button>
    </div>

    <template v-else>
      <div class="thumbs">
        <div v-for="p in s.photos" :key="p.id" class="thumb" :style="{ backgroundImage: `url(${p.url})` }">
          <button class="remove" aria-label="Remove photo" @click="removePhoto(p.id)"><Icon name="close" :size="18" :stroke="2.4" /></button>
        </div>
        <button class="thumb add" aria-label="Add another photo" @click="picker.click()"><Icon name="plus" :size="34" /></button>
      </div>

      <div class="card estimate-card">
        <div class="est-header">
          <Icon name="check" :size="20" class="est-icon" />
          <span class="est-title">Estimated from photo</span>
        </div>
        <p class="est-sub">We estimated the dimensions below. Adjust if needed — accurate sizes help drivers bid better.</p>

        <div class="dims-grid">
          <div class="dim-field">
            <label class="dim-label">Length (cm)</label>
            <input v-model="s.length" type="number" class="dim-input" placeholder="0" />
          </div>
          <div class="dim-field">
            <label class="dim-label">Width (cm)</label>
            <input v-model="s.width" type="number" class="dim-input" placeholder="0" />
          </div>
          <div class="dim-field">
            <label class="dim-label">Height (cm)</label>
            <input v-model="s.height" type="number" class="dim-input" placeholder="0" />
          </div>
          <div class="dim-field">
            <label class="dim-label">Weight (kg)</label>
            <input v-model="s.weightKg" type="number" class="dim-input weight-input" placeholder="0" />
          </div>
        </div>

        <div v-if="volumeLabel" class="vol-row">
          <span class="vol-label">Volume</span>
          <span class="vol-value">{{ volumeLabel }}</span>
        </div>

        <div class="found-row">
          <span class="label">Category</span>
          <span class="found-text">{{ packageLabel }}</span>
        </div>
      </div>
    </template>

    <div class="chips">
      <span class="chip">One package per photo</span>
      <span class="chip">Show the whole box</span>
    </div>

    <input ref="camera" type="file" accept="image/*" capture="environment" hidden @change="onFiles">
    <input ref="picker" type="file" accept="image/*" multiple hidden @change="onFiles">

    <template #actions>
      <div class="info"><span class="small">Nothing to pay now. You pay when it arrives.</span></div>
      <button class="btn" @click="noPhoto">No photo, describe it</button>
      <button class="btn btn-primary" :disabled="!s.photos.length" @click="go('details')">Continue</button>
    </template>
  </PageLayout>
</template>

<style scoped>
.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
.tile { min-height: 280px; border: 0; border-radius: 28px; background: var(--card); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; font-size: 16px; }
.tile.dashed { border: 2px dashed var(--line-strong); }
.tile.over { border-color: var(--accent); background: #FFF7EF; }
.circle { width: 88px; height: 88px; border-radius: 50%; background: var(--soft); display: flex; align-items: center; justify-content: center; }
.tile-title { font-size: 22px; font-weight: 600; }
.thumbs { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; }
.thumb { position: relative; aspect-ratio: 1; border-radius: 20px; background: #EDE7DD center / cover no-repeat; border: 0; }
.thumb.add { border: 2px dashed var(--line-strong); background: var(--card); color: var(--muted); display: flex; align-items: center; justify-content: center; }
.remove { position: absolute; top: 6px; right: 6px; width: 44px; height: 44px; border-radius: 50%; border: 0; background: rgba(255, 255, 255, 0.92); display: flex; align-items: center; justify-content: center; }

.estimate-card { display: flex; flex-direction: column; gap: 16px; }
.est-header { display: flex; align-items: center; gap: 8px; }
.est-icon { color: #2B8A3E; }
.est-title { font-size: 18px; font-weight: 600; }
.est-sub { font-size: 15px; color: var(--muted); margin: 0; }

.dims-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.dim-field { display: flex; flex-direction: column; gap: 5px; }
.dim-label { font-size: 13px; font-weight: 600; color: var(--muted); }
.dim-input { padding: 12px 14px; border: 1.5px solid var(--line); border-radius: 14px; font-size: 20px; font-weight: 600; background: var(--bg); text-align: center; width: 100%; }
.dim-input:focus { border-color: var(--navy); outline: none; }
.weight-input { border-color: var(--accent); }

.vol-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--soft); border-radius: 12px; }
.vol-label { font-size: 14px; font-weight: 600; color: var(--muted); }
.vol-value { font-size: 16px; font-weight: 600; }

.found-row { display: flex; flex-direction: column; gap: 4px; }
.found-text { font-size: 22px; font-weight: 600; }

@media (max-width: 500px) {
  .dims-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
