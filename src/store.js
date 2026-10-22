import { reactive, computed, watch } from 'vue'

// ---------------------------------------------------------------------------
// Mock data. Swap these for real API calls later.
// ---------------------------------------------------------------------------

export const ORIGIN = { name: 'Drammen', country: 'Norway' }

// km from Drammen, rough road distance
export const CITIES = [
  { name: 'Oslo', country: 'Norway', km: 40 },
  { name: 'Kongsberg', country: 'Norway', km: 40 },
  { name: 'Kristiansand', country: 'Norway', km: 290 },
  { name: 'Bergen', country: 'Norway', km: 460 },
  { name: 'Stavanger', country: 'Norway', km: 520 },
  { name: 'Trondheim', country: 'Norway', km: 530 },
  { name: 'Gothenburg', country: 'Sweden', km: 300 },
  { name: 'Stockholm', country: 'Sweden', km: 560 },
  { name: 'Copenhagen', country: 'Denmark', km: 600 },
  { name: 'Hamburg', country: 'Germany', km: 900 },
  { name: 'Berlin', country: 'Germany', km: 1050 },
  { name: 'Amsterdam', country: 'Netherlands', km: 1230 },
  { name: 'Rotterdam', country: 'Netherlands', km: 1250 },
  { name: 'Rotterdam Port, Maasvlakte', country: 'Netherlands', km: 1290 },
  { name: 'Antwerp', country: 'Belgium', km: 1330 },
  { name: 'London', country: 'United Kingdom', km: 1500 },
]

// Inside the EU / EEA a short description is enough, we make the papers.
const EUROPE = ['Norway', 'Sweden', 'Denmark', 'Finland', 'Germany', 'Netherlands', 'Belgium', 'France', 'Poland', 'Spain', 'Italy']

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

export const DELIVERY = [
  { id: 'door', title: 'To the exact address', hint: 'Door to door', factor: 1.15, trucks: 2 },
  { id: 'hub', title: 'Close by, I pick it up', hint: 'At a hub within 60 km', factor: 0.8, trucks: 6, tag: 'Cheapest' },
  { id: 'lastmile', title: 'Close by, you do the last stretch', hint: 'Truck to a hub, we send a local van to the door', factor: 0.95, trucks: 6 },
]

const DRIVERS = [
  { name: 'Lars H.', rating: 4.8, trips: 312, avatar: 'L' },
  { name: 'Ingrid S.', rating: 4.9, trips: 547, avatar: 'I' },
  { name: 'Mehmet K.', rating: 4.7, trips: 189, avatar: 'M' },
  { name: 'Pieter V.', rating: 4.6, trips: 421, avatar: 'P' },
  { name: 'Anna B.', rating: 4.9, trips: 278, avatar: 'A' },
]

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Driver-side mock data
// ---------------------------------------------------------------------------

const MOCK_PACKAGES = [
  {
    id: 'pkg-1', from: 'Oslo', to: 'Bergen', what: '2 medium boxes', size: 'medium', count: 2,
    sender: 'Kari N.', price: 1650, km: 460, pickup: null, status: 'available',
    pickupAddr: 'Storgata 12, 0155 Oslo', dropAddr: 'Torgallmenningen 4, 5014 Bergen',
    weight: '10-50 kg', note: 'Fragile — contains ceramics',
  },
  {
    id: 'pkg-2', from: 'Drammen', to: 'Kristiansand', what: '1 pallet', size: 'pallet', count: 1,
    sender: 'Erik O.', price: 2280, km: 290, pickup: null, status: 'available',
    pickupAddr: 'Grønland 2, 3045 Drammen', dropAddr: 'Markens gate 20, 4611 Kristiansand',
    weight: '50-100 kg', note: '',
  },
  {
    id: 'pkg-3', from: 'Stavanger', to: 'Trondheim', what: '3 large items', size: 'large', count: 3,
    sender: 'Maja L.', price: 3410, km: 830, pickup: null, status: 'available',
    pickupAddr: 'Klubbgata 8, 4013 Stavanger', dropAddr: 'Nordre gate 15, 7011 Trondheim',
    weight: '100+ kg', note: 'Furniture — needs blankets',
  },
  {
    id: 'pkg-4', from: 'Kongsberg', to: 'Oslo', what: '1 small box', size: 'small', count: 1,
    sender: 'Thomas R.', price: 480, km: 80, pickup: null, status: 'available',
    pickupAddr: 'Kirkegata 3, 3611 Kongsberg', dropAddr: 'Karl Johans gate 22, 0159 Oslo',
    weight: 'Under 10 kg', note: 'Electronics — handle with care',
  },
]

const STORAGE_KEY = 'cargomates-v1'

function freshShipment() {
  return {
    photos: [], // { id, url }  (not persisted)
    count: 0,
    size: 'medium',
    weight: '10-50',
    from: ORIGIN.name,
    to: null, // city object
    toQuery: '',
    arrival: 'week',
    customsMode: 'describe', // 'describe' | 'faktura'
    contents: '',
    value: '',
    kind: 'sale',
    fakturaName: '',
    delivery: 'hub',
    status: 'draft', // draft | bidding | booked | onway | arrived | paid
    bids: [],        // { driver, price, eta, time }
    bidsComplete: false,
    selectedBid: null,
    driverNote: '',
    booking: null,
    payMethod: 'vipps',
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
  mode: 'sender', // 'sender' | 'driver'
  shipment: { ...freshShipment(), ...(saved && saved.shipment ? saved.shipment : {}), photos: [] },
  history: (saved && saved.history) || seedHistory(),
  driverPackages: MOCK_PACKAGES.map(p => ({ ...p })),
  driverActive: null, // the package the driver is currently working on
})

watch(
  () => ({ shipment: { ...state.shipment, photos: [] }, history: state.history }),
  (val) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(val)) } catch (e) { /* storage blocked, fine */ }
  },
  { deep: true }
)

function seedHistory() {
  const d = new Date()
  const iso = (offset) => { const x = new Date(d); x.setDate(x.getDate() + offset); return x.toISOString().slice(0, 10) }
  return [
    { id: 'h1', title: 'Oslo', from: 'Drammen', to: 'Oslo', toCountry: 'Norway', what: '1 pallet', size: 'pallet', count: 1, pickup: iso(-9), arrive: iso(-8), driver: 'Ingrid S.', hub: 'CargoMates hub Oslo', price: 1250, note: '', payMethod: 'vipps', paidDate: iso(-7), status: 'paid', abroad: false, code: '4821' },
    { id: 'h2', title: 'Gothenburg', from: 'Drammen', to: 'Gothenburg', toCountry: 'Sweden', what: '3 large items', size: 'large', count: 3, pickup: iso(3), arrive: iso(4), driver: 'Pieter V.', hub: null, price: 2840, note: 'Leave at the loading dock', payMethod: 'card', paidDate: null, status: 'booked', abroad: true, code: '7193' },
  ]
}

// ---------------------------------------------------------------------------
// Router (tiny hash router, swap for vue-router if the app grows)
// ---------------------------------------------------------------------------

const ROUTES = [
  'photos', 'details', 'customs', 'delivery', 'bidding', 'booked', 'onway', 'arrived', 'calendar', 'history',
  'd-packages', 'd-package', 'd-pickup', 'd-tracking', 'd-dropoff',
]

function readHash() {
  const r = (location.hash || '').replace(/^#\/?/, '')
  return ROUTES.includes(r) ? r : 'photos'
}

state.route = readHash()
window.addEventListener('hashchange', () => { state.route = readHash() })

export function go(route) {
  state.route = route
  try { if (location.hash !== '#' + route) location.hash = route } catch (e) { /* hash not allowed, state still moves */ }
}

// ---------------------------------------------------------------------------
// Derived values
// ---------------------------------------------------------------------------

export const isAbroad = computed(() => !!state.shipment.to && state.shipment.to.country !== ORIGIN.country)
export const needsFaktura = computed(() => isAbroad.value && !EUROPE.includes(state.shipment.to.country))

export const sizeObj = computed(() => SIZES.find((s) => s.id === state.shipment.size))
export const arrivalObj = computed(() => ARRIVALS.find((a) => a.id === state.shipment.arrival))
export const kindObj = computed(() => KINDS.find((k) => k.id === state.shipment.kind))
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
  let p = (180 + km * 0.85) * sizeObj.value.factor * Math.pow(n, 0.8)
  p *= arrivalObj.value.factor * d.factor
  if (isAbroad.value) p += 350 // customs papers
  return Math.round(p / 10) * 10
}

export const price = computed(() => priceFor(state.shipment.delivery))

export function kr(n) {
  return 'kr ' + n.toLocaleString('nb-NO').replace(/,/g, ' ')
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
    { key: 'delivery', label: 'How close', summary: deliveryObj.value.title },
    { key: 'bidding', label: 'Finding drivers', summary: s.status === 'bidding' ? `${s.bids.length} bid${s.bids.length !== 1 ? 's' : ''}` : s.bids.length ? 'Done' : '' },
    { key: 'booked', label: 'Booked', summary: b ? b.driver : '' },
    { key: 'onway', label: 'On the way', summary: b ? `Picked up ${fmtDay(b.pickup)}` : '' },
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
  for (const f of files) {
    state.shipment.photos.push({ id: Math.random().toString(36).slice(2), url: URL.createObjectURL(f) })
  }
  // Mock "AI": one package per photo, medium size by default
  state.shipment.count = state.shipment.photos.length
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
    const bidPrice = Math.round(basePrice * variance / 10) * 10
    const km = s.to ? s.to.km : 300
    const lead = s.arrival === 'asap' ? 1 : s.arrival === 'week' ? 3 : 6
    const etaDays = lead + Math.floor(Math.random() * 2)
    s.bids.push({
      id: 'bid-' + Date.now() + '-' + i,
      driver,
      price: bidPrice,
      etaDays,
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
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
  const km = s.to ? s.to.km : 300
  const today = new Date().toISOString().slice(0, 10)
  const travel = Math.max(1, Math.ceil(km / 600))
  const arrive = addDays(new Date(), travel)
  s.booking = {
    driver: bid.driver.name,
    pickup: today,
    arrive,
    arrived: false,
    window: 'Today',
    hub: s.delivery === 'door' ? null : `CargoMates hub ${s.to ? s.to.name : ''}`,
    code: String(Math.floor(1000 + Math.random() * 9000)),
    price: bid.price,
    note: s.driverNote || '',
  }
  s.selectedBid = null
  s.driverNote = ''
  s.status = 'booked'
  go('booked')
}

export function setStatus(status) {
  state.shipment.status = status
  if (status === 'arrived' && state.shipment.booking) {
    state.shipment.booking.arrived = true
    state.shipment.booking.arrivedDate = new Date().toISOString().slice(0, 10)
  }
}

export function pay() {
  const s = state.shipment
  s.status = 'paid'
  state.history.push({
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
    paidDate: new Date().toISOString().slice(0, 10),
    status: 'paid',
    abroad: isAbroad.value,
    code: s.booking.code,
  })
}

export function startNew() {
  if (bidTimer) { clearTimeout(bidTimer); bidTimer = null }
  Object.assign(state.shipment, freshShipment())
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

export function switchMode(mode) {
  state.mode = mode
  if (mode === 'driver') {
    go('d-packages')
  } else {
    go(state.shipment.status === 'draft' ? 'photos' : state.shipment.status)
  }
}

export const PICKUP_TIMES = [
  { id: 'today', label: 'Today', hint: 'Within a few hours' },
  { id: 'tomorrow', label: 'Tomorrow', hint: 'Morning pickup' },
  { id: '2days', label: 'In 2 days', hint: 'Flexible schedule' },
  { id: 'week', label: 'Within a week', hint: 'Cheapest for sender' },
]

export const PICKUP_LOCATIONS = [
  { id: 'sender', label: 'Sender address', hint: 'Go to the pickup address listed' },
  { id: 'hub', label: 'Nearest hub', hint: 'Sender drops it off at a CargoMates hub' },
  { id: 'custom', label: 'Custom meetup', hint: 'Agree on a location with the sender' },
]

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
  setTimeout(() => {
    if (pkg.status !== 'bid-sent') return
    pkg.status = 'accepted'
    const days = { today: 0, tomorrow: 1, '2days': 2, week: 5 }[pkg.estPickupTime] || 0
    const d = new Date(); d.setDate(d.getDate() + days)
    pkg.pickup = d.toISOString().slice(0, 10)
  }, 2000 + Math.random() * 2000)
}

export function driverViewPackage(pkgId) {
  const pkg = state.driverPackages.find(p => p.id === pkgId)
  if (pkg) { state.driverActive = pkg; go('d-package') }
}

export function driverConfirmPickup() {
  const pkg = state.driverActive
  if (!pkg) return
  pkg.status = 'picked-up'
  pkg.pickup = new Date().toISOString().slice(0, 10)
  pkg.trackingCode = 'CM-' + Math.random().toString(36).slice(2, 8).toUpperCase()
  go('d-tracking')
}

export function driverGoTracking() {
  go('d-tracking')
}

export function driverConfirmDropoff() {
  const pkg = state.driverActive
  if (!pkg) return
  pkg.status = 'delivered'
  pkg.deliveredDate = new Date().toISOString().slice(0, 10)
  go('d-packages')
}
