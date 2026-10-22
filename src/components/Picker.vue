<script setup>
// An underlined word in the sentence. Tapping it opens a bottom sheet with big options.
import { ref } from 'vue'
import Icon from './Icon.vue'

const props = defineProps({
  modelValue: { type: String, required: true },
  options: { type: Array, required: true }, // [{ id, label, hint }]
  title: { type: String, default: 'Choose one' },
  display: { type: String, default: '' }, // text shown in the sentence
})
const emit = defineEmits(['update:modelValue'])
const open = ref(false)

function pick(id) {
  emit('update:modelValue', id)
  open.value = false
}
</script>

<template>
  <button class="word" :aria-label="title" @click="open = true">
    {{ display || options.find((o) => o.id === modelValue)?.label }}
    <Icon name="chevron-down" :size="22" style="margin-left: 6px" />
  </button>

  <Teleport to="body">
    <div v-if="open" class="sheet-backdrop" @click.self="open = false">
      <div class="sheet" role="dialog" :aria-label="title">
        <div class="sheet-handle" />
        <p class="sheet-title">{{ title }}</p>
        <button v-for="o in options" :key="o.id" class="option" :class="{ selected: o.id === modelValue }" @click="pick(o.id)">
          <span class="grow">
            <span class="title">{{ o.title || o.label }}</span>
            <span v-if="o.hint" class="hint">{{ o.hint }}</span>
          </span>
          <span class="radio" />
        </button>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
