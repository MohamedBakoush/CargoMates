import { reactive, computed, watch, ref } from 'vue'

// ---------------------------------------------------------------------------
// Mock data. Swap these for real API calls later.
// ---------------------------------------------------------------------------

export const ORIGIN = { name: 'Madrid', country: 'Spain', lat: 40.42, lon: -3.7 }

// km from Madrid, rough road distance
export const CITIES = [
  { name: 'Toledo', country: 'Spain', km: 72, lat: 39.86, lon: -4.02 },
  { name: 'Zaragoza', country: 'Spain', km: 315, lat: 41.65, lon: -0.88 },
  { name: 'Valencia', country: 'Spain', km: 355, lat: 39.47, lon: -0.38 },
  { name: 'Bilbao', country: 'Spain', km: 395, lat: 43.26, lon: -2.93 },
  { name: 'Seville', country: 'Spain', km: 530, lat: 37.39, lon: -5.98 },
  { name: 'Málaga', country: 'Spain', km: 530, lat: 36.72, lon: -4.42 },
  { name: 'Barcelona', country: 'Spain', km: 620, lat: 41.39, lon: 2.17 },
  { name: 'Porto', country: 'Portugal', km: 560, lat: 41.15, lon: -8.61 },
  { name: 'Lisbon', country: 'Portugal', km: 625, lat: 38.72, lon: -9.14 },
  { name: 'Bordeaux', country: 'France', km: 690, lat: 44.84, lon: -0.58 },
  { name: 'Lyon', country: 'France', km: 1050, lat: 45.76, lon: 4.84 },
  { name: 'Paris', country: 'France', km: 1270, lat: 48.86, lon: 2.35 },
  { name: 'Zurich', country: 'Switzerland', km: 1450, lat: 47.38, lon: 8.54 },
  { name: 'Milan', country: 'Italy', km: 1580, lat: 45.46, lon: 9.19 },
  { name: 'Brussels', country: 'Belgium', km: 1580, lat: 50.85, lon: 4.35 },
  { name: 'London', country: 'United Kingdom', km: 1730, lat: 51.51, lon: -0.13 },
  { name: 'Amsterdam', country: 'Netherlands', km: 1770, lat: 52.37, lon: 4.9 },
  { name: 'Rotterdam Port, Maasvlakte', country: 'Netherlands', km: 1780, lat: 51.95, lon: 4.03 },
  { name: 'Hamburg', country: 'Germany', km: 2200, lat: 53.55, lon: 9.99 },
  { name: 'Berlin', country: 'Germany', km: 2320, lat: 52.52, lon: 13.4 },
  { name: 'Copenhagen', country: 'Denmark', km: 2500, lat: 55.68, lon: 12.57 },
]

// Places a driver can route through that are not sender destinations yet
const EXTRA_PLACES = [
  { name: 'Malmö', country: 'Sweden', lat: 55.6, lon: 13.0 },
  { name: 'Frankfurt', country: 'Germany', lat: 50.11, lon: 8.68 },
  { name: 'Munich', country: 'Germany', lat: 48.14, lon: 11.58 },
]
const PLACES = [ORIGIN, ...CITIES, ...EXTRA_PLACES]

// Coordinates by place name, for the route map and route matching
export function placeOf(name) {
  return PLACES.find((c) => c.name === name) || null
}
export const DRIVER_PLACES = PLACES
  .filter((c) => !c.name.includes(','))
  .map((c) => ({ id: c.name, label: c.name, hint: c.country }))
  .sort((a, b) => a.label.localeCompare(b.label))
export const DRIVER_COUNTRIES = [...new Set(PLACES.map((c) => c.country))].sort()

// Rough road distance between two places
function roadKm(a, b) {
  const rad = Math.PI / 180
  const h = Math.sin(((b.lat - a.lat) * rad) / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(((b.lon - a.lon) * rad) / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(h)) * 1.25
}

// Inside the EU a short description is enough, we make the papers. Outside it customs needs an invoice.
const EU = ['Spain', 'Portugal', 'France', 'Italy', 'Germany', 'Netherlands', 'Belgium', 'Denmark', 'Sweden', 'Finland', 'Poland', 'Austria', 'Ireland']

export const SIZES = [
  { id: 'small', label: 'small', plural: 'small boxes', hint: 'Fits in a shoebox', factor: 0.35 },
  { id: 'medium', label: 'medium box', plural: 'medium boxes', hint: 'Like a moving box', factor: 1 },
  { id: 'large', label: 'large item', plural: 'large items', hint: 'Like a chair or a washing machine', factor: 2.4 },
  { id: 'pallet', label: 'pallet', plural: 'pallets', hint: 'Needs a forklift', factor: 5.5 },
]

export const ARRIVALS = [
  { id: 'asap', label: 'as soon as possible', hint: 'Fastest, costs more', factor: 1.4, days: 0 },
  { id: 'week', label: 'within a week', hint: 'Cheaper, more trucks to choose from', factor: 1, days: 5 },
  { id: 'flex', label: 'within two weeks', hint: 'Cheapest', factor: 0.85, days: 10 },
]

export const KINDS = [
  { id: 'sale', label: 'sale', hint: 'Sold to a customer' },
  { id: 'gift', label: 'gift', hint: 'No payment involved' },
  { id: 'own', label: 'my own things', hint: 'Moving or storing your own goods' },
]

// Pickup is always at the sender's door. They only choose a half-day slot.
export const PICKUP_SLOTS = [
  { id: 'am', label: 'Morning', hint: '08:00 to 12:00' },
  { id: 'pm', label: 'Afternoon', hint: '12:00 to 17:00' },
]

// How the goods reach the receiver.
export const DELIVERY = [
  { id: 'door', title: 'To the door', hint: 'Delivered to the exact address', factor: 1.15, trucks: 2 },
  { id: 'hub', title: 'Receiver collects at a hub', hint: 'A hub within 60 km of the address', factor: 0.8, trucks: 6, tag: 'Cheapest' },
  { id: 'lastmile', title: 'Hub, then a local van', hint: 'Truck to a hub, local van to the door', factor: 0.95, trucks: 6 },
]

export const GUARANTEES = [
  { id: 'date', icon: 'calendar', title: 'Guaranteed delivery date', desc: 'Every offer comes with a date we commit to.' },
  { id: 'late', icon: 'clock', title: '€40 back if we are late', desc: 'Paid automatically if delivery is even one day late.' },
  { id: 'replace', icon: 'refresh', title: 'Replacement truck in 48 hours', desc: 'If the carrier cannot make it, we find another one.' },
  { id: 'noshow', icon: 'shield', title: 'Full refund + €25 for a no-show', desc: 'If nobody picks up your goods, you get everything back plus credit.' },
  { id: 'contact', icon: 'headphones', title: 'One contact for everything', desc: 'Damage, loss or delay: one person at CargoMates handles it.' },
  { id: 'window', icon: 'door', title: 'Half-day pickup slot', desc: 'Morning or afternoon, so you do not wait in all day.' },
]

const DRIVERS = [
  { name: 'Javier M.', rating: 4.8, trips: 312, avatar: 'J' },
  { name: 'Lucía S.', rating: 4.9, trips: 547, avatar: 'L' },
  { name: 'Mehmet K.', rating: 4.7, trips: 189, avatar: 'M' },
  { name: 'Pieter V.', rating: 4.6, trips: 421, avatar: 'P' },
  { name: 'Ana B.', rating: 4.9, trips: 278, avatar: 'A' },
]

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Driver-side mock data
// ---------------------------------------------------------------------------

const MOCK_PACKAGES = [
  {
    id: 'pkg-1', from: 'Madrid', to: 'Barcelona', what: '2 medium boxes', size: 'medium', count: 2,
    sender: 'Lucía G.', senderRating: 4.9, price: 75, km: 620, pickup: null, status: 'available',
    pickupAddr: 'Calle de Alcalá 120, 28009 Madrid', dropAddr: 'Carrer de Mallorca 250, 08008 Barcelona',
    weight: '10-50 kg', note: 'Fragile — contains ceramics',
  },
  {
    id: 'pkg-2', from: 'Valencia', to: 'Madrid', what: '1 pallet', size: 'pallet', count: 1,
    sender: 'Javier R.', senderRating: 4.7, price: 180, km: 355, pickup: null, status: 'available',
    pickupAddr: 'Avinguda del Port 12, 46023 Valencia', dropAddr: 'Calle de Embajadores 180, 28045 Madrid',
    weight: '50-100 kg', note: '',
  },
  {
    id: 'pkg-3', from: 'Seville', to: 'Bilbao', what: '3 large items', size: 'large', count: 3,
    sender: 'Carmen L.', senderRating: 5.0, price: 260, km: 860, pickup: null, status: 'available',
    pickupAddr: 'Calle Sierpes 45, 41004 Seville', dropAddr: 'Gran Vía 30, 48009 Bilbao',
    weight: '100+ kg', note: 'Furniture — needs blankets',
  },
  {
    id: 'pkg-4', from: 'Toledo', to: 'Madrid', what: '1 small box', size: 'small', count: 1,
    sender: 'Diego S.', senderRating: 4.6, price: 15, km: 72, pickup: null, status: 'available',
    pickupAddr: 'Calle del Comercio 10, 45001 Toledo', dropAddr: 'Calle de Serrano 50, 28001 Madrid',
    weight: 'Under 10 kg', note: 'Electronics — handle with care',
  },
  {
    id: 'pkg-5', from: 'Bordeaux', to: 'Paris', what: '2 pallets', size: 'pallet', count: 2,
    sender: 'Camille D.', senderRating: 4.8, price: 380, km: 585, pickup: null, status: 'available',
    pickupAddr: 'Cours de l’Intendance 20, 33000 Bordeaux', dropAddr: 'Rue de Rivoli 80, 75004 Paris',
    weight: '100+ kg', note: 'Wine — keep upright',
  },
  {
    id: 'pkg-6', from: 'Amsterdam', to: 'Copenhagen', what: '2 pallets', size: 'pallet', count: 2,
    sender: 'Sanne D.', senderRating: 4.8, price: 600, km: 780, pickup: null, status: 'available',
    pickupAddr: 'Herengracht 120, 1015 Amsterdam', dropAddr: 'Vesterbrogade 40, 1620 Copenhagen',
    weight: '100+ kg', note: '',
  },
  {
    id: 'pkg-7', from: 'Paris', to: 'Berlin', what: '6 medium boxes', size: 'medium', count: 6,
    sender: 'Luc M.', senderRating: 4.9, price: 470, km: 1050, pickup: null, status: 'available',
    pickupAddr: 'Rue de Rivoli 80, 75004 Paris', dropAddr: 'Torstraße 60, 10119 Berlin',
    weight: '50-100 kg', note: 'Trade-fair materials',
  },
  {
    id: 'pkg-8', from: 'Hamburg', to: 'Malmö', what: '1 large item', size: 'large', count: 1,
    sender: 'Jonas W.', senderRating: 4.7, price: 270, km: 480, pickup: null, status: 'available',
    pickupAddr: 'Mönckebergstraße 7, 20095 Hamburg', dropAddr: 'Stortorget 2, 211 22 Malmö',
    weight: '10-50 kg', note: '',
  },
]

// The two people using this prototype. Ratings come from the other side after each job.
export const PROFILES = {
  sender: { name: 'Alex Moreno', rating: 4.9, ratings: 14, since: '2024' },
  driver: { name: 'Marco Ruiz', rating: 4.8, ratings: 212, since: '2022' },
}

// Jobs the driver finished before this session, with the rating each sender gave
function seedDriverPast() {
  const d = new Date()
  const iso = (offset) => { const x = new Date(d); x.setDate(x.getDate() + offset); return x.toISOString().slice(0, 10) }
  return [
    { id: 'past-1', from: 'Madrid', to: 'Valencia', what: '2 pallets', price: 210, date: iso(-4), sender: 'Pablo T.', rated: 5 },
    { id: 'past-2', from: 'Barcelona', to: 'Lyon', what: '4 medium boxes', price: 160, date: iso(-11), sender: 'Marta P.', rated: 5, ratedSender: 5 },
    { id: 'past-3', from: 'Hamburg', to: 'Copenhagen', what: '1 large item', price: 235, date: iso(-19), sender: 'Mette K.', rated: 4, ratedSender: 4 },
  ]
}

const STORAGE_KEY = 'cargomates-v3' // v3: sender based in Madrid

function freshShipment() {
  return {
    photos: [], // { id, url, length, width, height, weightKg }  (not persisted)
    count: 0,
    size: 'medium',
    from: ORIGIN.name,
    to: null, // city object
    toQuery: '',
    arrival: 'week',
    customsMode: 'describe', // 'describe' | 'invoice'
    contents: '',
    value: '',
    kind: 'sale',
    invoiceName: '',
    pickupSlot: 'am',
    delivery: 'door',
    status: 'draft', // draft | bidding | booked | onway | arrived | paid
    bids: [],        // { driver, price, eta, time }
    bidsComplete: false,
    selectedBid: null,
    driverNote: '',
    messages: [], // chat with the driver: { id, from: 'sender' | 'driver' | 'system', text, time }
    booking: null,
    payMethod: 'bizum',
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

const saved = load()

export const state = reactive({
  route: 'photos',
  justPaid: false,
  mode: 'sender', // 'sender' | 'driver'
  shipment: { ...freshShipment(), ...(saved && saved.shipment ? saved.shipment : {}), photos: [] },
  history: (saved && saved.history) || seedHistory(),
  driverPackages: MOCK_PACKAGES.map(p => ({ ...p })),
  driverActive: null, // the package the driver is currently working on
  driverPast: seedDriverPast(),
  driverNotice: null, // banner on the driver dashboard: { kind: 'sent' | 'accepted', text, pkgId }
  // where the driver is going, and which countries they take jobs in (empty = all of Europe)
  driverRoute: { from: '', to: '', countries: [], ...(saved && saved.driverRoute ? saved.driverRoute : {}) },
})

watch(
  () => ({ shipment: { ...state.shipment, photos: [] }, history: state.history, driverRoute: state.driverRoute }),
  (val) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(val)) } catch (e) { /* storage blocked, fine */ }
  },
  { deep: true }
)

function seedHistory() {
  const d = new Date()
  const iso = (offset) => { const x = new Date(d); x.setDate(x.getDate() + offset); return x.toISOString().slice(0, 10) }
  return [
    { id: 'h1', title: 'Valencia', from: 'Madrid', to: 'Valencia', toCountry: 'Spain', what: '1 pallet', size: 'pallet', count: 1, pickup: iso(-9), arrive: iso(-8), driver: 'Lucía S.', hub: 'CargoMates hub Valencia', price: 95, note: '', payMethod: 'bizum', paidDate: iso(-7), status: 'paid', abroad: false, code: '4821' },
    { id: 'h2', title: 'Lisbon', from: 'Madrid', to: 'Lisbon', toCountry: 'Portugal', what: '3 large items', size: 'large', count: 3, pickup: iso(3), arrive: iso(4), driver: 'Pieter V.', hub: null, price: 230, note: 'Leave at the loading dock', payMethod: 'card', paidDate: null, status: 'booked', abroad: true, code: '7193' },
  ]
}

// ---------------------------------------------------------------------------
// Router (tiny hash router, swap for vue-router if the app grows)
// ---------------------------------------------------------------------------

const ROUTES = [
  'home', 'photos', 'details', 'customs', 'delivery', 'bidding', 'booked', 'onway', 'arrived', 'calendar', 'history',
  'd-packages', 'd-package', 'd-pickup', 'd-tracking', 'd-dropoff', 'chat', 'd-chat', 'profile', 'd-profile',
]

function readHash() {
  const r = (location.hash || '').replace(/^#\/?/, '')
  return ROUTES.includes(r) ? r : 'home'
}

state.route = readHash()
window.addEventListener('hashchange', () => { state.route = readHash() })
window.addEventListener('popstate', () => { state.route = readHash() })

export function go(route) {
  state.route = route
  try {
    // The landing page lives at the bare URL, everything else in the hash
    if (route === 'home') { if (location.hash) history.pushState(null, '', location.pathname + location.search) }
    else if (location.hash !== '#' + route) location.hash = route
  } catch (e) { /* hash not allowed, state still moves */ }
}

// ---------------------------------------------------------------------------
// Derived values
// ---------------------------------------------------------------------------

export const isAbroad = computed(() => !!state.shipment.to && state.shipment.to.country !== ORIGIN.country)
export const needsInvoice = computed(() => isAbroad.value && !EU.includes(state.shipment.to.country))

export const sizeObj = computed(() => SIZES.find((s) => s.id === state.shipment.size))
export const arrivalObj = computed(() => ARRIVALS.find((a) => a.id === state.shipment.arrival))
export const kindObj = computed(() => KINDS.find((k) => k.id === state.shipment.kind))
export const slotObj = computed(() => PICKUP_SLOTS.find((o) => o.id === state.shipment.pickupSlot) || PICKUP_SLOTS[0])
export function slotText(id) {
  const o = PICKUP_SLOTS.find((x) => x.id === id) || PICKUP_SLOTS[0]
  return `${o.label.toLowerCase()} (${o.hint})`
}
export const deliveryObj = computed(() => DELIVERY.find((o) => o.id === state.shipment.delivery))

export const packageLabel = computed(() => {
  const n = Math.max(state.shipment.count, 1)
  const s = sizeObj.value
  return n === 1 ? `1 ${s.label}` : `${n} ${s.plural}`
})

// Placeholder pricing. Replace with the real pricing engine.
export function priceFor(deliveryId) {
  const s = state.shipment
  const km = s.to ? s.to.km : 300
  const n = Math.max(s.count, 1)
  const d = DELIVERY.find((o) => o.id === deliveryId) || DELIVERY[1]
  let p = (16 + km * 0.075) * sizeObj.value.factor * Math.pow(n, 0.8)
  p *= arrivalObj.value.factor * d.factor
  if (isAbroad.value) p += 30 // customs papers
  return Math.max(5, Math.round(p / 5) * 5)
}

export const price = computed(() => priceFor(state.shipment.delivery))

const EUR = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
export function eur(n) {
  return EUR.format(n)
}

export const PAY_METHODS = [
  { id: 'bizum', label: 'Bizum' },
  { id: 'card', label: 'Card' },
  { id: 'invoice', label: 'Invoice' },
]
export function payLabel(id) {
  return (PAY_METHODS.find((m) => m.id === id) || PAY_METHODS[0]).label
}

// ---------------------------------------------------------------------------
// Progress tracker
// ---------------------------------------------------------------------------

export const steps = computed(() => {
  const s = state.shipment
  const b = s.booking
  const list = [
    { key: 'photos', label: 'Photos', summary: s.count ? packageLabel.value : '' },
    { key: 'details', label: 'What and where', summary: s.to ? `${s.from} → ${s.to.name}` : '' },
  ]
  if (isAbroad.value) list.push({ key: 'customs', label: 'Customs', summary: s.contents ? `${s.contents}, ${kindObj.value.label}` : '' })
  list.push(
    { key: 'delivery', label: 'Pickup and delivery', summary: `${slotObj.value.label} pickup · ${deliveryObj.value.title}` },
    { key: 'bidding', label: 'Offers', summary: s.status === 'bidding' ? `${s.bids.length} offer${s.bids.length !== 1 ? 's' : ''}` : s.bids.length ? 'Done' : '' },
    { key: 'booked', label: 'Booked', summary: b ? b.driver : '' },
    { key: 'onway', label: 'On the way', summary: b ? `Arrives ${fmtDay(b.arrive)}` : '' },
    { key: 'arrived', label: 'Arrived, pay', summary: s.status === 'paid' ? 'Paid' : '' }
  )

  let current = list.findIndex((x) => x.key === state.route)
  if (current < 0) current = 0
  const bookedIdx = list.findIndex((x) => x.key === 'booked')
  const paidHere = s.status === 'paid' && list[current].key === 'arrived'

  // Before booking you can jump back to any done step.
  // After booking the booking questions are locked, only the tracking pages stay tappable.
  return list.map((x, i) => ({
    ...x,
    done: i < current || (paidHere && i === current),
    now: i === current && !paidHere,
    later: i > current,
    canJump: i < current && (s.status === 'draft' || i >= bookedIdx),
  }))
})

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export function addPhotos(files) {
  if (!state.shipment.photos.length) beginShipment()
  for (const f of files) {
    const estL = 30 + Math.floor(Math.random() * 50)
    const estW = 20 + Math.floor(Math.random() * 30)
    const estH = 15 + Math.floor(Math.random() * 35)
    const vol = estL * estW * estH
    const estKg = Math.max(1, Math.round(vol / 5000 * (1.5 + Math.random())))
    state.shipment.photos.push({
      id: Math.random().toString(36).slice(2),
      url: URL.createObjectURL(f),
      length: String(estL), width: String(estW), height: String(estH),
      weightKg: String(estKg),
    })
  }
  state.shipment.count = state.shipment.photos.length
  updateSizeFromPhotos()
}

function updateSizeFromPhotos() {
  const photos = state.shipment.photos
  if (!photos.length) return
  let maxVol = 0
  for (const p of photos) {
    const v = (parseInt(p.length) || 0) * (parseInt(p.width) || 0) * (parseInt(p.height) || 0)
    if (v > maxVol) maxVol = v
  }
  if (maxVol < 20000) state.shipment.size = 'small'
  else if (maxVol < 100000) state.shipment.size = 'medium'
  else if (maxVol < 400000) state.shipment.size = 'large'
  else state.shipment.size = 'pallet'
}

export function removePhoto(id) {
  state.shipment.photos = state.shipment.photos.filter((p) => p.id !== id)
  state.shipment.count = Math.max(state.shipment.photos.length, state.shipment.count ? 1 : 0)
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  // skip weekends for pickups
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

export function book() {
  const s = state.shipment
  s.bids = []
  s.bidsComplete = false
  s.status = 'bidding'
  go('bidding')
  startBidding()
}

let bidTimer = null

function startBidding() {
  const s = state.shipment
  const basePrice = price.value
  const shuffled = [...DRIVERS].sort(() => Math.random() - 0.5)
  const count = 2 + Math.floor(Math.random() * 3) // 2-4 bids
  let i = 0

  function nextBid() {
    if (i >= count || s.status !== 'bidding') return
    const driver = shuffled[i % shuffled.length]
    const variance = 0.85 + Math.random() * 0.3
    const bidPrice = Math.max(5, Math.round(basePrice * variance / 5) * 5)
    const km = s.to ? s.to.km : 300
    const lead = s.arrival === 'asap' ? 1 : s.arrival === 'week' ? 2 : 5
    const pickupDate = addDays(new Date(), lead + Math.floor(Math.random() * 2))
    const deliverBy = addDays(pickupDate, Math.max(1, Math.ceil(km / 600)))
    s.bids.push({
      id: 'bid-' + Date.now() + '-' + i,
      driver,
      price: bidPrice,
      pickupDate,
      deliverBy,
    })
    i++
    if (i < count && s.status === 'bidding') {
      bidTimer = setTimeout(nextBid, 2000 + Math.random() * 3000)
    } else {
      s.bidsComplete = true
    }
  }

  bidTimer = setTimeout(nextBid, 1500 + Math.random() * 2000)
}

export function cancelBidding() {
  if (bidTimer) { clearTimeout(bidTimer); bidTimer = null }
  const s = state.shipment
  s.status = 'draft'
  s.bids = []
  s.selectedBid = null
  go('delivery')
}

export function selectBid(bid) {
  state.shipment.selectedBid = bid
}

export function cancelSelection() {
  state.shipment.selectedBid = null
  state.shipment.driverNote = ''
}

export function confirmBid() {
  const s = state.shipment
  const bid = s.selectedBid
  if (!bid) return
  if (bidTimer) { clearTimeout(bidTimer); bidTimer = null }
  s.booking = {
    driver: bid.driver.name,
    driverRating: bid.driver.rating,
    pickup: bid.pickupDate,
    arrive: bid.deliverBy,
    arrived: false,
    slot: s.pickupSlot,
    hub: s.delivery === 'door' ? null : `CargoMates hub ${s.to ? s.to.name : ''}`,
    code: String(Math.floor(1000 + Math.random() * 9000)),
    price: bid.price,
    note: s.driverNote || '',
  }
  // The note written while accepting the offer opens the conversation
  s.messages = []
  if (s.booking.note) postMessage(s.messages, 'sender', s.booking.note)
  s.selectedBid = null
  s.driverNote = ''
  s.status = 'booked'
  go('booked')
}

// ---------------------------------------------------------------------------
// Messages between sender and driver
// ---------------------------------------------------------------------------

export function postMessage(thread, from, text) {
  thread.push({
    id: Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    from,
    text,
    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
  })
}

// Driver side: each package has its own thread, opened by the sender's note on the package
export function driverThread(pkg) {
  if (!pkg.messages) {
    pkg.messages = []
    if (pkg.note) postMessage(pkg.messages, 'sender', pkg.note)
  }
  return pkg.messages
}

export function setStatus(status) {
  state.shipment.status = status
  if (status === 'arrived' && state.shipment.booking) {
    state.shipment.booking.arrived = true
    state.shipment.booking.arrivedDate = new Date().toISOString().slice(0, 10)
  }
}

// The current shipment as an entry in the order history
function orderFromShipment(status) {
  const s = state.shipment
  return {
    id: 'h' + Date.now(),
    title: s.to ? s.to.name : '',
    from: s.from,
    to: s.to ? s.to.name : '',
    toCountry: s.to ? s.to.country : '',
    what: packageLabel.value,
    size: s.size,
    count: Math.max(s.count, 1),
    pickup: s.booking.pickup,
    arrive: s.booking.arrivedDate || s.booking.arrive,
    driver: s.booking.driver,
    hub: s.booking.hub || null,
    price: s.booking.price,
    note: s.booking.note || '',
    payMethod: s.payMethod,
    paidDate: status === 'paid' ? new Date().toISOString().slice(0, 10) : null,
    status,
    abroad: isAbroad.value,
    code: s.booking.hub ? s.booking.code : '', // a pickup code only matters when the receiver collects at a hub
  }
}

export function pay() {
  state.shipment.status = 'paid'
  state.history.push(orderFromShipment('paid'))
  state.justPaid = true
  go('history')
}

// Starting from the empty start page always begins a clean shipment.
// One that is still under way moves into the order history first, so it is not overwritten.
export function beginShipment() {
  const s = state.shipment
  if (bidTimer) { clearTimeout(bidTimer); bidTimer = null }
  if (s.booking && ['booked', 'onway', 'arrived'].includes(s.status)) state.history.push(orderFromShipment(s.status))
  Object.assign(s, freshShipment())
  state.justPaid = false
}

// Every order the sender has: past ones plus the shipment in progress (not in history until paid)
export const allOrders = computed(() => {
  const s = state.shipment
  const list = [...state.history]
  if (s.booking && ['booked', 'onway', 'arrived'].includes(s.status)) {
    list.push({
      id: 'current', current: true, title: s.to.name, from: s.from, to: s.to.name, toCountry: s.to.country,
      what: packageLabel.value, pickup: s.booking.pickup, arrive: s.booking.arrive, driver: s.booking.driver,
      hub: s.booking.hub || null, price: s.booking.price, note: s.booking.note || '', payMethod: s.payMethod,
      paidDate: null, status: s.status, abroad: isAbroad.value, code: s.booking.hub ? s.booking.code : '',
    })
  }
  return list
})

// Ratings given by this sender and this driver (the other side's rating of you is mock data)
export function rateDriver(order, stars) {
  if (!order.ratedDriver) order.ratedDriver = stars
}
export function rateSender(pkg, stars) {
  if (!pkg.ratedSender) pkg.ratedSender = stars
}

// Pay a past order straight from its receipt
export function payOrder(id) {
  const o = state.history.find((x) => x.id === id)
  if (!o) return
  o.status = 'paid'
  o.paidDate = new Date().toISOString().slice(0, 10)
}

export function startNew() {
  beginShipment()
  go('photos')
}

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

export function fmtDay(iso) {
  if (!iso) return ''
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

// ---------------------------------------------------------------------------
// Driver-side actions
// ---------------------------------------------------------------------------

export function senderHome() {
  const st = state.shipment.status
  return st === 'draft' ? 'photos' : st === 'paid' ? 'arrived' : st
}

export function switchMode(mode) {
  state.mode = mode
  if (mode === 'driver') {
    go('d-packages')
  } else {
    go('photos')
  }
}

export const PICKUP_TIMES = [
  { id: 'today', label: 'Today', hint: 'Within a few hours' },
  { id: 'tomorrow', label: 'Tomorrow', hint: 'Morning pickup' },
  { id: '2days', label: 'In 2 days', hint: 'Flexible schedule' },
  { id: 'week', label: 'Within a week', hint: 'Cheapest for sender' },
]

export const PICKUP_LOCATIONS = [
  { id: 'sender', label: "Sender's door", hint: 'Collect at the pickup address' },
  { id: 'custom', label: 'Agreed meetup', hint: 'Arrange another spot with the sender' },
]

// Available packages for the driver: inside the chosen countries, split by how well they fit the route.
// Detour = extra km to drive via the package's pickup and drop-off instead of going straight.
export const driverMatches = computed(() => {
  const r = state.driverRoute
  const a = placeOf(r.from)
  const b = placeOf(r.to)
  const inArea = (pkg) => {
    if (!r.countries.length) return true
    const p = placeOf(pkg.from)
    const d = placeOf(pkg.to)
    return !!p && !!d && r.countries.includes(p.country) && r.countries.includes(d.country)
  }
  const pool = state.driverPackages.filter((p) => p.status === 'available')
  const available = pool.filter(inArea)
  const hidden = pool.length - available.length
  if (!a || !b || a === b) return { hasRoute: false, onRoute: [], offRoute: available.map((pkg) => ({ pkg, detour: null })), hidden }

  const direct = roadKm(a, b)
  const rows = available.map((pkg) => {
    const p = placeOf(pkg.from)
    const d = placeOf(pkg.to)
    const extra = p && d ? roadKm(a, p) + roadKm(p, d) + roadKm(d, b) - direct : Infinity
    return { pkg, detour: Math.max(0, Math.round(extra / 10) * 10) }
  }).sort((x, y) => x.detour - y.detour)
  const limit = Math.max(40, direct * 0.05)
  return {
    hasRoute: true,
    onRoute: rows.filter((x) => x.detour <= limit),
    offRoute: rows.filter((x) => x.detour > limit),
    hidden,
  }
})

export function driverBid(pkgId, amount, pickupTime, pickupLocation) {
  const pkg = state.driverPackages.find(p => p.id === pkgId)
  if (!pkg || pkg.status !== 'available') return
  pkg.status = 'bid-sent'
  pkg.myBid = amount
  pkg.estPickupTime = pickupTime || 'today'
  pkg.estPickupLocation = pickupLocation || 'sender'
  const timeObj = PICKUP_TIMES.find(t => t.id === pkg.estPickupTime)
  const locObj = PICKUP_LOCATIONS.find(l => l.id === pkg.estPickupLocation)
  pkg.estPickupLabel = timeObj ? timeObj.label : pkg.estPickupTime
  pkg.estLocationLabel = locObj ? locObj.label : pkg.estPickupLocation
  state.driverNotice = { kind: 'sent', icon: 'clock', pkgId, text: `Bid sent: ${eur(amount)} to ${pkg.sender.replace(/\.?$/, '.')} Their answer will show under Your active jobs.` }
  go('d-packages')

  // Mock: the sender answers a few seconds later. Replace with the real notification.
  pkg.acceptTimer = setTimeout(() => driverAccept(pkg), 6000 + Math.random() * 3000)
}

// The sender accepts a waiting bid (also the prototype's "accept now" skip)
export function driverAccept(pkg) {
  if (!pkg || pkg.status !== 'bid-sent') return
  clearTimeout(pkg.acceptTimer)
  pkg.status = 'accepted'
  // highlight it on the dashboard unless the driver is looking at it right now
  pkg.updated = !(state.route === 'd-package' && state.driverActive === pkg)
  const days = { today: 0, tomorrow: 1, '2days': 2, week: 5 }[pkg.estPickupTime] || 0
  const d = new Date(); d.setDate(d.getDate() + days)
  pkg.pickup = d.toISOString().slice(0, 10)
  state.driverNotice = { kind: 'accepted', icon: 'check', pkgId: pkg.id, text: `${pkg.sender} accepted your bid for ${pkg.from} → ${pkg.to}. Pickup ${pkg.estPickupLabel.toLowerCase()}.` }
}

export function driverViewPackage(pkgId) {
  const pkg = state.driverPackages.find(p => p.id === pkgId)
  if (!pkg) return
  pkg.updated = false
  if (state.driverNotice && state.driverNotice.pkgId === pkgId) state.driverNotice = null
  state.driverActive = pkg
  go('d-package')
}

// A ticking clock so in-transit progress moves on screen
export const now = ref(Date.now())
setInterval(() => { now.value = Date.now() }, 1000)

// Percent of the drive done for a picked-up package (mocked as a short timed drive)
export function transitPercent(pkg) {
  if (pkg.status === 'at-destination' || pkg.status === 'delivered') return 100
  if (pkg.status !== 'picked-up' || !pkg.transitStart) return null
  return Math.min(99, Math.max(0, Math.round(((now.value - pkg.transitStart) / pkg.transitMs) * 100)))
}
export function kmLeft(pkg) {
  const p = transitPercent(pkg)
  return p === null ? null : Math.max(1, Math.round(pkg.km * (1 - p / 100)))
}

export function driverConfirmPickup() {
  const pkg = state.driverActive
  if (!pkg) return
  pkg.status = 'picked-up'
  pkg.pickup = new Date().toISOString().slice(0, 10)
  pkg.trackingCode = 'CM-' + Math.random().toString(36).slice(2, 8).toUpperCase()
  // Mock drive: the driver "arrives" after a short while. Replace with live GPS.
  pkg.transitStart = Date.now()
  pkg.transitMs = 15000 + Math.random() * 5000
  pkg.arriveTimer = setTimeout(() => driverArrive(pkg), pkg.transitMs)
  go('d-tracking')
}

// After the label: back to the job list while driving
export function driverBackToJobs() {
  const pkg = state.driverActive
  if (pkg && pkg.status === 'picked-up') {
    state.driverNotice = { kind: 'sent', icon: 'truck', pkgId: pkg.id, text: `On your way to ${pkg.to}. Drop-off unlocks when you arrive.` }
  }
  go('d-packages')
}

export function driverArrive(pkg) {
  if (!pkg || pkg.status !== 'picked-up') return
  clearTimeout(pkg.arriveTimer)
  pkg.status = 'at-destination'
  pkg.updated = true
  state.driverNotice = { kind: 'accepted', icon: 'pin', pkgId: pkg.id, text: `You have reached ${pkg.to}. Confirm drop-off at ${pkg.dropAddr}.` }
}

export function driverGoTracking() {
  go('d-tracking')
}

export function driverConfirmDropoff() {
  const pkg = state.driverActive
  if (!pkg) return
  pkg.status = 'delivered'
  pkg.updated = false
  pkg.deliveredDate = new Date().toISOString().slice(0, 10)
}

// After the rating step on the drop-off screen: back to the job list
export function driverFinishDelivery() {
  const pkg = state.driverActive
  if (pkg) {
    state.driverNotice = pkg.ratedSender
      ? { kind: 'accepted', icon: 'check', pkgId: pkg.id, text: `Delivered to ${pkg.to}. Thanks for rating ${pkg.sender.replace(/\.?$/, '.')}` }
      : { kind: 'accepted', icon: 'check', pkgId: pkg.id, text: `Delivered to ${pkg.to}. You can still rate ${pkg.sender} under Completed.` }
  }
  go('d-packages')
}
