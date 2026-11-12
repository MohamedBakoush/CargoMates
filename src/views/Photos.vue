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

function boxVol(p) {
  return (parseInt(p.length) || 0) * (parseInt(p.width) || 0) * (parseInt(p.height) || 0)
}
function volLabel(p) {
  const v = boxVol(p)
  if (v === 0) return ''
  if (v < 1000000) return (v / 1000).toFixed(1) + ' L'
  return (v / 1000000).toFixed(2) + ' m³'
}

const totalWeight = computed(() => s.photos.reduce((sum, p) => sum + (parseInt(p.weightKg) || 0), 0))
const totalVol = computed(() => {
  const v = s.photos.reduce((sum, p) => sum + boxVol(p), 0)
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
      <div class="box-list">
        <div v-for="(p, i) in s.photos" :key="p.id" class="box-row card">
          <div class="box-header">
            <div class="box-thumb" :style="{ backgroundImage: `url(${p.url})` }">
              <button class="remove" aria-label="Remove" @click="removePhoto(p.id)"><Icon name="close" :size="14" :stroke="2.4" /></button>
            </div>
            <div class="box-title-area">
              <span class="box-num">Box {{ i + 1 }}</span>
              <span v-if="volLabel(p)" class="box-vol">{{ volLabel(p) }}</span>
            </div>
          </div>
          <div class="dims-row">
            <div class="dim-field">
              <label class="dim-label">L (cm)</label>
              <input v-model="p.length" type="number" class="dim-input" placeholder="0" />
            </div>
            <span class="dim-x">×</span>
            <div class="dim-field">
              <label class="dim-label">W (cm)</label>
              <input v-model="p.width" type="number" class="dim-input" placeholder="0" />
            </div>
            <span class="dim-x">×</span>
            <div class="dim-field">
              <label class="dim-label">H (cm)</label>
              <input v-model="p.height" type="number" class="dim-input" placeholder="0" />
            </div>
            <div class="dim-field weight-field">
              <label class="dim-label">kg</label>
              <input v-model="p.weightKg" type="number" class="dim-input weight-input" placeholder="0" />
            </div>
          </div>
        </div>

        <button class="add-box" @click="picker.click()">
          <Icon name="plus" :size="22" /> Add another box
        </button>
      </div>

      <div class="totals card" v-if="s.photos.length > 1">
        <div class="total-row">
          <span class="total-label">{{ s.photos.length }} boxes</span>
          <span class="total-value">{{ totalWeight }} kg total</span>
          <span v-if="totalVol" class="total-value muted">{{ totalVol }}</span>
        </div>
      </div>

      <div class="found-row">
        <span class="label">Category</span>
        <span class="found-text">{{ packageLabel }}</span>
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

.box-list { display: flex; flex-direction: column; gap: 12px; }

.box-row { display: flex; flex-direction: column; gap: 12px; }
.box-header { display: flex; align-items: center; gap: 12px; }
.box-thumb { width: 56px; height: 56px; border-radius: 14px; background: #EDE7DD center / cover no-repeat; flex: none; position: relative; }
.box-thumb .remove { position: absolute; top: -6px; right: -6px; width: 24px; height: 24px; border-radius: 50%; border: 0; background: var(--ink); color: #fff; display: flex; align-items: center; justify-content: center; padding: 0; }
.box-title-area { display: flex; align-items: baseline; gap: 8px; }
.box-num { font-size: 17px; font-weight: 600; }
.box-vol { font-size: 14px; color: var(--muted); }

.dims-row { display: flex; align-items: flex-end; gap: 6px; }
.dim-field { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.dim-label { font-size: 12px; font-weight: 600; color: var(--muted); text-align: center; }
.dim-input { padding: 10px 6px; border: 1.5px solid var(--line); border-radius: 12px; font-size: 18px; font-weight: 600; background: var(--bg); text-align: center; width: 100%; }
.dim-input:focus { border-color: var(--navy); outline: none; }
.dim-x { font-size: 18px; color: var(--muted); padding-bottom: 12px; flex: none; }
.weight-field { flex: 1.1; }
.weight-input { border-color: var(--accent); }

.add-box { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 14px; border: 2px dashed var(--line-strong); border-radius: var(--radius); background: transparent; font-size: 16px; font-weight: 600; color: var(--muted); cursor: pointer; }
.add-box:hover { border-color: var(--navy); color: var(--ink); }

.totals { padding: 14px 18px; }
.total-row { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.total-label { font-size: 16px; font-weight: 600; }
.total-value { font-size: 15px; font-weight: 600; }

.found-row { display: flex; flex-direction: column; gap: 4px; }
.found-text { font-size: 22px; font-weight: 600; }

@media (max-width: 500px) {
  .dims-row { flex-wrap: wrap; }
  .dim-x { display: none; }
  .dim-field { flex-basis: 40%; }
}
</style>
