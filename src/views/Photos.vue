<script setup>
import { ref } from 'vue'
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
</script>

<template>
  <PageLayout>
    <h1 class="h1">What are you sending?</h1>
    <p class="sub">Add a photo of each package. We work out the size for you.</p>

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
      <div class="card found">
        <span class="label">We found</span>
        <span class="found-text">{{ packageLabel }}</span>
        <span class="muted">You can change this on the next page.</span>
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
.found { display: flex; flex-direction: column; gap: 4px; }
.found-text { font-size: 24px; font-weight: 600; }
</style>
