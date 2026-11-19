<script setup>
import { computed } from 'vue'
import { state } from './store.js'
import Photos from './views/Photos.vue'
import Landing from './views/Landing.vue'
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
import Chat from './views/Chat.vue'
import Profile from './views/Profile.vue'

const VIEWS = {
  home: Landing,
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
  chat: Chat,
  'd-chat': Chat,
  profile: Profile,
  'd-profile': Profile,
}

const view = computed(() => VIEWS[state.route] || Landing)
</script>

<template>
  <component :is="view" :key="state.route" />
</template>
