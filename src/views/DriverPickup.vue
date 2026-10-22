<script setup>
import { ref, computed } from 'vue'
import { state, go, driverConfirmPickup } from '../store.js'
import Icon from '../components/Icon.vue'

const pkg = computed(() => state.driverActive)
const photoPackage = ref(null)
const photoLocation = ref(null)
const step = ref(1) // 1 = photo of package, 2 = photo at location, 3 = confirm

function takePackagePhoto(e) {
  const file = e.target.files && e.target.files[0]
  if (file) { photoPackage.value = URL.createObjectURL(file); step.value = 2 }
}
function takeLocationPhoto(e) {
  const file = e.target.files && e.target.files[0]
  if (file) { photoLocation.value = URL.createObjectURL(file); step.value = 3 }
}

function confirm() {
  driverConfirmPickup()
}
</script>

<template>
  <div class="page" v-if="pkg">
    <header class="topbar">
      <button class="btn btn-round" aria-label="Back" @click="go('d-package')"><Icon name="back" /></button>
      <div class="brand">CargoMates</div>
      <div class="role-tag">Pickup</div>
      <div class="spacer" />
    </header>

    <div class="body pickup-body">
      <div class="pickup-card card">
        <h1 class="pickup-title">Confirm pickup</h1>
        <p class="muted">{{ pkg.from }} → {{ pkg.to }} · {{ pkg.what }}</p>

        <div class="steps">
          <!-- Step 1 -->
          <div class="step-item" :class="{ done: step > 1, current: step === 1 }">
            <div class="step-num">1</div>
            <div class="step-content">
              <span class="step-label">Photo of the package</span>
              <img v-if="photoPackage" :src="photoPackage" class="step-preview" />
              <label v-if="step === 1" class="photo-btn btn btn-driver">
                <Icon name="camera" :size="20" /> Take photo
                <input type="file" accept="image/*" capture="environment" @change="takePackagePhoto" hidden />
              </label>
              <span v-if="step > 1 && !photoPackage" class="muted">Skipped</span>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="step-item" :class="{ done: step > 2, current: step === 2, later: step < 2 }">
            <div class="step-num">2</div>
            <div class="step-content">
              <span class="step-label">Photo at pickup location</span>
              <img v-if="photoLocation" :src="photoLocation" class="step-preview" />
              <label v-if="step === 2" class="photo-btn btn btn-driver">
                <Icon name="camera" :size="20" /> Take photo
                <input type="file" accept="image/*" capture="environment" @change="takeLocationPhoto" hidden />
              </label>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="step-item" :class="{ current: step === 3, later: step < 3 }">
            <div class="step-num">3</div>
            <div class="step-content">
              <span class="step-label">Confirm & get tracking</span>
              <p v-if="step === 3" class="muted">Everything looks good? Confirm to get the tracking label.</p>
            </div>
          </div>
        </div>
      </div>

      <div class="skip-row">
        <button v-if="step === 1" class="btn btn-ghost" @click="step = 2">Skip photo →</button>
        <button v-if="step === 2" class="btn btn-ghost" @click="step = 3">Skip photo →</button>
      </div>
    </div>

    <footer class="actionbar" v-if="step === 3">
      <div class="info">
        <span class="big">Pickup confirmed</span>
        <span class="small">A tracking label will be generated</span>
      </div>
      <button class="btn btn-driver" @click="confirm">
        <Icon name="check" :size="20" /> Confirm pickup
      </button>
    </footer>
  </div>
</template>

<style scoped>
.role-tag { font-size: 14px; font-weight: 700; color: #fff; background: #2B8A3E; padding: 4px 12px; border-radius: 999px; }
.pickup-body { flex-direction: column; gap: 16px; padding: 8px 24px 40px; }
.pickup-card { max-width: 700px; display: flex; flex-direction: column; gap: 20px; }
.pickup-title { font-size: 26px; font-weight: 600; margin: 0; }

.steps { display: flex; flex-direction: column; gap: 0; }
.step-item { display: flex; gap: 16px; padding: 20px 0; border-bottom: 1px solid var(--line); position: relative; }
.step-item:last-child { border-bottom: 0; }
.step-item.later { opacity: 0.4; }

.step-num { width: 36px; height: 36px; border-radius: 50%; background: var(--soft); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; flex: none; }
.step-item.current .step-num { background: var(--navy); color: #fff; }
.step-item.done .step-num { background: #2B8A3E; color: #fff; }

.step-content { flex: 1; display: flex; flex-direction: column; gap: 10px; }
.step-label { font-size: 17px; font-weight: 600; }

.step-preview { width: 120px; height: 90px; border-radius: 12px; object-fit: cover; }

.photo-btn { width: fit-content; }
.btn-driver { background: var(--navy); border-color: var(--navy); color: #fff; min-height: 52px; font-size: 16px; font-weight: 600; border-radius: 14px; border: 0; padding: 0 22px; display: inline-flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; }

.skip-row { max-width: 700px; display: flex; justify-content: flex-end; }
</style>
