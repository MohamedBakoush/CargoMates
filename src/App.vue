<script setup>
import { computed } from 'vue'
import { state } from './store.js'
import Photos from './views/Photos.vue'
import Details from './views/Details.vue'
import Customs from './views/Customs.vue'
import Delivery from './views/Delivery.vue'
import Bidding from './views/Bidding.vue'
import Booked from './views/Booked.vue'
import OnTheWay from './views/OnTheWay.vue'
import Arrived from './views/Arrived.vue'
import Calendar from './views/Calendar.vue'
import History from './views/History.vue'
import DriverPackages from './views/DriverPackages.vue'
import DriverPackage from './views/DriverPackage.vue'
import DriverPickup from './views/DriverPickup.vue'
import DriverTracking from './views/DriverTracking.vue'
import DriverDropoff from './views/DriverDropoff.vue'

const VIEWS = {
  photos: Photos,
  details: Details,
  customs: Customs,
  delivery: Delivery,
  bidding: Bidding,
  booked: Booked,
  onway: OnTheWay,
  arrived: Arrived,
  calendar: Calendar,
  history: History,
  'd-packages': DriverPackages,
  'd-package': DriverPackage,
  'd-pickup': DriverPickup,
  'd-tracking': DriverTracking,
  'd-dropoff': DriverDropoff,
}

const view = computed(() => VIEWS[state.route] || Photos)
</script>

<template>
  <component :is="view" />
</template>
