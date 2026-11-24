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
      <button class="brand" aria-label="CargoMates home" @click="go('home')"><img class="logo" src="/logo.jpg" alt="CargoMates" width="44" height="44"></button>
      <button class="role-tag" aria-label="Driver home" @click="go('d-packages')">Driver</button>
      <div class="spacer" />
      <button class="btn btn-pill collapse" aria-label="Profile" @click="go('d-profile')"><Icon name="user" :size="20" /><span class="lbl">Profile</span></button>
    </header>

    <div class="body col">
      <div class="task-card card">
        <h1 class="task-title">Confirm pickup</h1>
        <p class="muted">{{ pkg.from }} → {{ pkg.to }} · {{ pkg.what }}</p>

        <div class="steps">
          <!-- Step 1 -->
          <div class="step-item" :class="{ done: step > 1, current: step === 1 }">
            <div class="step-num">1</div>
            <div class="step-content">
              <span class="step-label">Photo of the package</span>
              <img v-if="photoPackage" :src="photoPackage" class="step-preview" />
              <label v-if="step === 1" class="btn-driver">
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
              <label v-if="step === 2" class="btn-driver">
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
        <span class="big">Ready to confirm</span>
        <span class="small">A tracking label will be generated</span>
      </div>
      <button class="btn btn-driver" @click="confirm">
        <Icon name="check" :size="20" /> Confirm pickup
      </button>
    </footer>
  </div>
</template>

<style scoped>

</style>
