<script setup>
import { computed } from 'vue'
import { state, go } from '../store.js'
import Icon from '../components/Icon.vue'

const pkg = computed(() => state.driverActive)
</script>

<template>
  <div class="page" v-if="pkg">
    <header class="topbar">
      <button class="btn btn-round" aria-label="Back" @click="go('d-package')"><Icon name="back" /></button>
      <div class="brand">CargoMates</div>
      <div class="role-tag">Tracking</div>
      <div class="spacer" />
    </header>

    <div class="body tracking-body">
      <div class="label-card card">
        <h1 class="label-title">Tracking label</h1>
        <p class="muted">Print or screenshot this label and attach it to the package.</p>

        <div class="label-preview">
          <div class="label-inner">
            <div class="label-logo">CargoMates</div>

            <div class="barcode-area">
              <svg class="barcode" viewBox="0 0 200 60" preserveAspectRatio="none">
                <rect v-for="i in 30" :key="i" :x="i * 6 + (i % 3) * 1" y="0" :width="2 + (i % 2) * 2" height="50" fill="var(--ink)" />
                <text x="100" y="58" text-anchor="middle" font-size="8" fill="var(--muted)">{{ pkg.trackingCode }}</text>
              </svg>
            </div>

            <div class="label-details">
              <div class="label-row">
                <span class="label-key">FROM</span>
                <span class="label-val">{{ pkg.from }}</span>
              </div>
              <div class="label-row">
                <span class="label-key">TO</span>
                <span class="label-val">{{ pkg.to }}</span>
              </div>
              <div class="label-row">
                <span class="label-key">CONTENTS</span>
                <span class="label-val">{{ pkg.what }} · {{ pkg.weight }}</span>
              </div>
              <div class="label-row">
                <span class="label-key">PICKUP</span>
                <span class="label-val">{{ pkg.pickup }}</span>
              </div>
            </div>

            <div class="qr-area">
              <svg class="qr-mock" viewBox="0 0 80 80">
                <rect x="0" y="0" width="80" height="80" fill="#fff" rx="4" />
                <rect x="4" y="4" width="24" height="24" rx="2" fill="var(--ink)" />
                <rect x="8" y="8" width="16" height="16" rx="1" fill="#fff" />
                <rect x="11" y="11" width="10" height="10" fill="var(--ink)" />
                <rect x="52" y="4" width="24" height="24" rx="2" fill="var(--ink)" />
                <rect x="56" y="8" width="16" height="16" rx="1" fill="#fff" />
                <rect x="59" y="11" width="10" height="10" fill="var(--ink)" />
                <rect x="4" y="52" width="24" height="24" rx="2" fill="var(--ink)" />
                <rect x="8" y="56" width="16" height="16" rx="1" fill="#fff" />
                <rect x="11" y="59" width="10" height="10" fill="var(--ink)" />
                <rect v-for="i in 12" :key="'q'+i" :x="32 + (i % 4) * 12" :y="32 + Math.floor(i / 4) * 12" width="8" height="8" :fill="i % 3 ? 'var(--ink)' : '#fff'" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <footer class="actionbar">
      <div class="info">
        <span class="big">{{ pkg.trackingCode }}</span>
        <span class="small">Attach this label to the package</span>
      </div>
      <button class="btn btn-driver" @click="typeof window !== 'undefined' && window.print()">
        <Icon name="printer" :size="20" /> Print label
      </button>
      <button class="btn btn-primary" @click="go('d-dropoff')">
        Continue to drop-off →
      </button>
    </footer>
  </div>
</template>

<style scoped>
.role-tag { font-size: 14px; font-weight: 700; color: #fff; background: #6A1B9A; padding: 4px 12px; border-radius: 999px; }
.tracking-body { flex-direction: column; gap: 16px; padding: 8px 24px 40px; }
.label-card { max-width: 700px; display: flex; flex-direction: column; gap: 20px; }
.label-title { font-size: 26px; font-weight: 600; margin: 0; }

.label-preview { background: var(--soft); border-radius: 16px; padding: 24px; display: flex; justify-content: center; }
.label-inner { background: #fff; border: 2px dashed var(--line-strong); border-radius: 12px; padding: 24px; width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 16px; align-items: center; }
.label-logo { font-weight: 700; font-size: 20px; color: var(--navy); }

.barcode-area { width: 100%; }
.barcode { width: 100%; height: 60px; }

.label-details { width: 100%; display: flex; flex-direction: column; gap: 8px; }
.label-row { display: flex; gap: 12px; font-size: 14px; }
.label-key { font-weight: 700; color: var(--muted); min-width: 80px; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; }
.label-val { font-weight: 500; }

.qr-area { padding: 8px; }
.qr-mock { width: 80px; height: 80px; }

.btn-driver { background: var(--navy); color: #fff; min-height: 56px; font-size: 17px; font-weight: 600; border-radius: 16px; border: 0; padding: 0 24px; display: inline-flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; }

@media print {
  .topbar, .actionbar { display: none !important; }
  .tracking-body { padding: 0; }
  .label-card { box-shadow: none; border: 0; }
}
</style>
