<script setup>
defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: 22 },
  stroke: { type: Number, default: 1.8 },
})
</script>

<template>
  <svg :width="size" :height="size" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       :stroke-width="stroke" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path v-if="name === 'back'" d="M15 5l-7 7 7 7" />
    <path v-else-if="name === 'next'" d="M9 5l7 7-7 7" />
    <path v-else-if="name === 'check'" d="M5 12.5l4.5 4.5L19 7.5" />
    <path v-else-if="name === 'upload'" d="M12 16V5M7 10l5-5 5 5M5 19h14" />
    <path v-else-if="name === 'plus'" d="M12 5v14M5 12h14" />
    <path v-else-if="name === 'close'" d="M6 6l12 12M18 6L6 18" />
    <g v-else-if="name === 'camera'"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></g>
    <g v-else-if="name === 'calendar'"><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></g>
    <path v-else-if="name === 'chevron-down'" d="M6 9l6 6 6-6" />
    <g v-else-if="name === 'receipt'"><path d="M5 4h14v17l-2.5-2-2.5 2-2.5-2L9 21l-2.5-2L4 21V4a1 1 0 011-1z" /><path d="M9 8h6M9 12h4" /></g>
    <g v-else-if="name === 'truck'"><path d="M1 3h15v13H1z" /><path d="M16 8h4l3 4v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></g>
    <g v-else-if="name === 'package'"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" /></g>
    <g v-else-if="name === 'qr'"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><path d="M14 14h3v3h-3zM20 14v7h-3M20 18h-3" /></g>
    <g v-else-if="name === 'pin'"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></g>
    <g v-else-if="name === 'photo'"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></g>
    <g v-else-if="name === 'printer'"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></g>
    <g v-else-if="name === 'shield'"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></g>
    <g v-else-if="name === 'clock'"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></g>
    <g v-else-if="name === 'refresh'"><path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15" /></g>
    <g v-else-if="name === 'headphones'"><path d="M3 18v-6a9 9 0 0118 0v6" /><path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z" /></g>
    <g v-else-if="name === 'star'"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></g>
    <path v-else-if="name === 'phone'" d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1 1 .4 1.9.7 2.8a2 2 0 01-.5 2.1L8.1 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.8.7a2 2 0 011.7 2z" />
    <g v-else-if="name === 'door'"><rect x="5" y="2" width="14" height="20" rx="1" /><circle cx="15" cy="12" r="1" fill="currentColor" /></g>
  </svg>
</template>
