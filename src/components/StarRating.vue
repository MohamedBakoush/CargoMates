<script setup>
// Five tappable stars. Read-only once a rating has been given.
import { ref } from 'vue'

defineProps({
  modelValue: { type: Number, default: 0 },
  readonly: { type: Boolean, default: false },
  label: { type: String, default: 'Rating' },
})
const emit = defineEmits(['update:modelValue'])
const hover = ref(0)
</script>

<template>
  <div class="stars-input" :class="{ readonly }" role="radiogroup" :aria-label="label">
    <button v-for="n in 5" :key="n" type="button" class="star" :class="{ on: n <= (hover || modelValue) }"
            role="radio" :aria-checked="n === modelValue" :aria-label="`${n} star${n > 1 ? 's' : ''}`"
            :disabled="readonly" @click="emit('update:modelValue', n)"
            @mouseenter="!readonly && (hover = n)" @mouseleave="hover = 0">★</button>
  </div>
</template>

<style scoped>
.stars-input { display: inline-flex; gap: 2px; }
.star { width: 44px; height: 44px; padding: 0; border: 0; background: none; font-size: 32px; line-height: 1; color: var(--line-strong); cursor: pointer; }
.star.on { color: var(--accent); }
.readonly .star { width: 22px; height: 22px; font-size: 20px; cursor: default; }
</style>
