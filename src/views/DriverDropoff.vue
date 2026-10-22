<script setup>
import { ref, computed } from 'vue'
import { state, go, driverConfirmDropoff } from '../store.js'
import Icon from '../components/Icon.vue'

const pkg = computed(() => state.driverActive)
const photoPackage = ref(null)
const photoScan = ref(false)
const step = ref(1) // 1 = photo of package at destination, 2 = scan QR, 3 = confirm

function takePhoto(e) {
  const file = e.target.files && e.target.files[0]
  if (file) { photoPackage.value = URL.createObjectURL(file); step.value = 2 }
}

function scanQR() {
  photoScan.value = true
  setTimeout(() => { step.value = 3 }, 1500)
}

function confirm() {
  driverConfirmDropoff()
}
</script>

<template>
  <div class="page" v-if="pkg">
    <header class="topbar">
      <button class="btn btn-round" aria-label="Back" @click="go('d-package')"><Icon name="back" /></button>
      <div class="brand">CargoMates</div>
      <div class="role-tag">Drop-off</div>
      <div class="spacer" />
    </header>

    <div class="body dropoff-body">
      <div class="dropoff-card card">
        <h1 class="dropoff-title">Confirm drop-off</h1>
        <p class="muted">{{ pkg.to }} · {{ pkg.dropAddr }}</p>

        <div class="steps">
          <!-- Step 1: Photo -->
          <div class="step-item" :class="{ done: step > 1, current: step === 1 }">
            <div class="step-num">1</div>
            <div class="step-content">
              <span class="step-label">Photo of package at destination</span>
              <img v-if="photoPackage" :src="photoPackage" class="step-preview" />
              <label v-if="step === 1" class="photo-btn btn btn-driver">
                <Icon name="camera" :size="20" /> Take photo
                <input type="file" accept="image/*" capture="environment" @change="takePhoto" hidden />
              </label>
            </div>
          </div>

          <!-- Step 2: Scan QR -->
          <div class="step-item" :class="{ done: step > 2, current: step === 2, later: step < 2 }">
            <div class="step-num">2</div>
            <div class="step-content">
              <span class="step-label">Scan delivery QR code</span>
              <div v-if="step === 2 && !photoScan" class="scan-area">
                <button class="btn btn-driver" @click="scanQR">
                  <Icon name="qr" :size="20" /> Scan QR code
                </button>
              </div>
              <div v-if="photoScan && step === 2" class="scanning">
                <div class="pulse-ring" />
                <span class="muted">Verifying…</span>
              </div>
              <span v-if="step > 2" class="verified"><Icon name="check" :size="16" /> Verified</span>
            </div>
          </div>

          <!-- Step 3: Confirm -->
          <div class="step-item" :class="{ current: step === 3, later: step < 3 }">
            <div class="step-num">3</div>
            <div class="step-content">
              <span class="step-label">Confirm delivery</span>
              <p v-if="step === 3" class="muted">Package delivered to {{ pkg.to }}. Confirm to complete.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="skip-row">
        <button v-if="step === 1" class="btn btn-ghost" @click="step = 2">Skip photo →</button>
        <button v-if="step === 2" class="btn btn-ghost" @click="step = 3">Skip scan →</button>
      </div>
    </div>

    <footer class="actionbar" v-if="step === 3">
      <div class="info">
        <span class="big">Deliver to {{ pkg.to }}</span>
        <span class="small">{{ pkg.trackingCode }}</span>
      </div>
      <button class="btn btn-driver" @click="confirm">
        <Icon name="check" :size="20" /> Confirm delivery
      </button>
    </footer>
  </div>
</template>

<style scoped>
.role-tag { font-size: 14px; font-weight: 700; color: #fff; background: #C62828; padding: 4px 12px; border-radius: 999px; }
.dropoff-body { flex-direction: column; gap: 16px; padding: 8px 24px 40px; }
.dropoff-card { max-width: 700px; display: flex; flex-direction: column; gap: 20px; }
.dropoff-title { font-size: 26px; font-weight: 600; margin: 0; }

.steps { display: flex; flex-direction: column; }
.step-item { display: flex; gap: 16px; padding: 20px 0; border-bottom: 1px solid var(--line); }
.step-item:last-child { border-bottom: 0; }
.step-item.later { opacity: 0.4; }

.step-num { width: 36px; height: 36px; border-radius: 50%; background: var(--soft); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; flex: none; }
.step-item.current .step-num { background: var(--navy); color: #fff; }
.step-item.done .step-num { background: #2B8A3E; color: #fff; }

.step-content { flex: 1; display: flex; flex-direction: column; gap: 10px; }
.step-label { font-size: 17px; font-weight: 600; }
.step-preview { width: 120px; height: 90px; border-radius: 12px; object-fit: cover; }

.photo-btn { width: fit-content; }
.btn-driver { background: var(--navy); color: #fff; min-height: 52px; font-size: 16px; font-weight: 600; border-radius: 14px; border: 0; padding: 0 22px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; }

.scan-area { display: flex; }
.scanning { display: flex; align-items: center; gap: 12px; }
.pulse-ring { width: 32px; height: 32px; border-radius: 50%; border: 3px solid var(--accent); animation: pulse-d 1.5s ease-in-out infinite; }
@keyframes pulse-d { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.15); opacity: 0.6; } }

.verified { color: #2B8A3E; font-weight: 600; display: flex; align-items: center; gap: 6px; }

.skip-row { max-width: 700px; display: flex; justify-content: flex-end; }
</style>
