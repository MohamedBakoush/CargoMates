<script setup>
import { GUARANTEES } from '../store.js'
import Icon from './Icon.vue'

defineProps({
  compact: { type: Boolean, default: false },
})
</script>

<template>
  <div class="guarantees" :class="{ compact }">
    <div v-if="!compact" class="g-header">
      <Icon name="shield" :size="24" :stroke="2" />
      <span class="g-title">CargoMates Promise</span>
    </div>
    <div class="g-grid">
      <div v-for="g in GUARANTEES" :key="g.id" class="g-item">
        <span class="g-icon"><Icon :name="g.icon" :size="compact ? 18 : 22" :stroke="1.6" /></span>
        <div class="g-text">
          <span class="g-name">{{ g.title }}</span>
          <span v-if="!compact" class="g-desc">{{ g.desc }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.guarantees {
  background: linear-gradient(135deg, #0A1628 0%, #1A2A44 100%);
  color: #fff;
  border-radius: var(--radius);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.guarantees.compact {
  padding: 16px 18px;
  gap: 10px;
  background: #F0F4FA;
  color: var(--ink);
}

.g-header {
  display: flex;
  align-items: center;
  gap: 10px;
}
.g-title {
  font-size: 20px;
  font-weight: 700;
}

.g-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 20px;
}
.compact .g-grid {
  grid-template-columns: 1fr;
  gap: 8px;
}

.g-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.compact .g-item {
  align-items: center;
  gap: 8px;
}

.g-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255,255,255,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}
.compact .g-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: #DDE4F0;
  color: var(--navy);
}

.g-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.g-name {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;
}
.compact .g-name {
  font-size: 14px;
}
.g-desc {
  font-size: 13px;
  opacity: 0.75;
  line-height: 1.4;
}

@media (max-width: 600px) {
  .g-grid { grid-template-columns: 1fr; }
}
</style>
