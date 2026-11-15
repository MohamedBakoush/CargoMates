<script setup>
// Route map: grey land, an orange curved route between two places, and a truck at `progress` percent.
import { computed } from 'vue'
import { placeOf } from '../store.js'
import { MAP, LAND } from '../mapData.js'

const props = defineProps({
  from: { type: String, required: true },
  to: { type: String, required: true },
  progress: { type: Number, default: null }, // 0-100, null hides the truck
  legs: { type: Array, default: () => [] }, // extra [{ from, to }] drawn as thin lines, e.g. packages along the way
})

function project(p) {
  const rad = Math.PI / 180
  return {
    x: MAP.scale * p.lon * rad + MAP.tx,
    y: MAP.ty - MAP.scale * Math.log(Math.tan(Math.PI / 4 + (p.lat * rad) / 2)),
  }
}

const geo = computed(() => {
  const a0 = placeOf(props.from)
  const b0 = placeOf(props.to)
  if (!a0 || !b0) return null
  const a = project(a0)
  const b = project(b0)
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1

  // Control point off to one side gives the route its curve
  // (north-south routes bend east so they follow land through Sweden and Denmark, not the North Sea)
  const vertical = Math.abs(dy) > Math.abs(dx)
  const bend = vertical ? Math.min(len * 0.3, 90) : Math.min(len * 0.22, 40)
  let nx = -dy / len
  let ny = dx / len
  if (vertical && nx < 0) { nx = -nx; ny = -ny }
  const c = { x: (a.x + b.x) / 2 + nx * bend, y: (a.y + b.y) / 2 + ny * bend }

  // Frame the route with room around it, 16:10, never zoomed in past ~170 km across
  const ratio = 1.6
  const spanX = Math.max(a.x, b.x, c.x) - Math.min(a.x, b.x, c.x)
  const spanY = Math.max(a.y, b.y, c.y) - Math.min(a.y, b.y, c.y)
  const w = Math.max(spanX * 1.9, spanY * 1.9 * ratio, 80)
  const h = w / ratio
  const cx = (a.x + b.x + c.x) / 3
  const cy = (a.y + b.y + c.y) / 3
  const u = w / 100 // one unit = 1% of the visible width

  const at = (t) => ({
    x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x,
    y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y,
  })
  const t = props.progress == null ? null : Math.min(1, Math.max(0, props.progress / 100))
  const truck = t == null ? null : at(t)
  // Split the curve at t so the travelled part can be drawn solid
  const split = t == null ? null : {
    c1: { x: a.x + (c.x - a.x) * t, y: a.y + (c.y - a.y) * t },
    c2: { x: c.x + (b.x - c.x) * t, y: c.y + (b.y - c.y) * t },
  }

  // Labels go on the outer side of each end so they do not sit on the line
  const side = (p, other) => (p.x <= other.x ? 'end' : 'start')

  const legs = props.legs.map((l) => ({ p: placeOf(l.from), d: placeOf(l.to) })).filter((l) => l.p && l.d)
    .map((l) => ({ p: project(l.p), d: project(l.d) }))

  return {
    a, b, c, u, truck, split, legs,
    viewBox: `${cx - w / 2} ${cy - h / 2} ${w} ${h}`,
    full: `M${a.x},${a.y} Q${c.x},${c.y} ${b.x},${b.y}`,
    done: split && `M${a.x},${a.y} Q${split.c1.x},${split.c1.y} ${truck.x},${truck.y}`,
    aAnchor: side(a, b),
    bAnchor: side(b, a),
  }
})
</script>

<template>
  <svg v-if="geo" class="route-map" :viewBox="geo.viewBox" preserveAspectRatio="xMidYMid slice"
       role="img" :aria-label="`Map of the route from ${from} to ${to}`">
    <path :d="LAND" class="land" />

    <g v-for="(l, i) in geo.legs" :key="i" class="leg">
      <line :x1="l.p.x" :y1="l.p.y" :x2="l.d.x" :y2="l.d.y" :stroke-width="geo.u * 0.5" />
      <circle :cx="l.p.x" :cy="l.p.y" :r="geo.u * 1" />
      <circle :cx="l.d.x" :cy="l.d.y" :r="geo.u * 1" />
    </g>

    <path :d="geo.full" class="line" :class="{ rest: geo.done }" :stroke-width="geo.u * 0.7"
          :stroke-dasharray="geo.done ? `${geo.u * 1.6} ${geo.u * 1.6}` : null" />
    <path v-if="geo.done" :d="geo.done" class="line" :stroke-width="geo.u * 0.9" />

    <circle :cx="geo.a.x" :cy="geo.a.y" :r="geo.u * 1.5" class="end" :stroke-width="geo.u * 0.7" />
    <text :x="geo.a.x + (geo.aAnchor === 'end' ? -1 : 1) * geo.u * 2.6" :y="geo.a.y + geo.u * 1.3"
          :text-anchor="geo.aAnchor" :font-size="geo.u * 3.8" class="place" :stroke-width="geo.u * 0.9">{{ from }}</text>

    <circle :cx="geo.b.x" :cy="geo.b.y" :r="geo.u * 1.9" class="dest" />
    <circle :cx="geo.b.x" :cy="geo.b.y" :r="geo.u * 0.7" fill="#fff" />
    <text :x="geo.b.x + (geo.bAnchor === 'end' ? -1 : 1) * geo.u * 3" :y="geo.b.y + geo.u * 1.3"
          :text-anchor="geo.bAnchor" :font-size="geo.u * 3.8" class="place" :stroke-width="geo.u * 0.9">{{ to }}</text>

    <g v-if="geo.truck" :transform="`translate(${geo.truck.x} ${geo.truck.y}) scale(${geo.u * 0.2})`">
      <circle r="17" class="truck-bg" />
      <g transform="translate(-12 -12)" class="truck-icon">
        <path d="M1 5h14v11H1z" /><path d="M15 9h4l3 3.5V16h-7z" /><circle cx="6" cy="17.5" r="2" /><circle cx="18" cy="17.5" r="2" />
      </g>
    </g>
  </svg>
</template>

<style scoped>
.route-map { display: block; width: 100%; aspect-ratio: 16 / 10; max-height: 340px; border-radius: 16px; background: #F5F3EE; }
.land { fill: #CBC8C2; }
.line { fill: none; stroke: var(--accent); stroke-linecap: round; }
.line.rest { opacity: 0.75; }
.leg line { stroke: var(--navy); stroke-linecap: round; }
.leg circle { fill: var(--navy); }
.end { fill: #fff; stroke: var(--accent); }
.dest { fill: var(--accent); }
.place { font-weight: 700; font-style: italic; fill: var(--ink); stroke: #F5F3EE; paint-order: stroke; stroke-linejoin: round; }
.truck-bg { fill: var(--navy); stroke: #fff; stroke-width: 2.5; }
.truck-icon { fill: none; stroke: #fff; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
</style>
