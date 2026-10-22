# CargoMates prototype (Vue 3)

Booking flow for small shippers: photo → one sentence → customs (only abroad) → how close → booked → on the way → arrived and pay, plus a calendar of every shipment. Built for iPad and computer, touch first.

## Run it

```bash
npm install
npm run dev      # opens on your network too, so you can open it on the iPad
```

## How it is put together

```
src/
  store.js              all state, mock data, pricing, tracker steps, tiny router
  style.css             shared tokens and classes (buttons, cards, options, sentence words)
  App.vue               picks the screen from the current route
  components/
    PageLayout.vue      top bar + tracker on the left + fixed action bar at the bottom
    Tracker.vue         the progress list ("You are here")
    Picker.vue          underlined word that opens a bottom sheet with big options
    AddressField.vue    destination input with suggestions
    Icon.vue            the few stroke icons used
  views/                one file per screen
```

## What is fake (swap later)

- **Pricing**: `priceFor()` in `store.js` is a made-up formula. Plug the real pricing engine in there.
- **Cities and distances**: `CITIES` in `store.js`. Replace with an address API.
- **Photo "AI"**: one package per photo, medium size. `addPhotos()` is where real detection goes.
- **Driver matching and dates**: `book()` picks a random driver and works out dates from distance.
- **Map and live position**: placeholder box and a fixed 55 % progress on the On the way screen.
- **Payment**: the Pay button just marks it paid.
- **Storage**: the draft and history live in `localStorage`, so a half-filled booking shows up in the calendar as "Not booked yet".

## Notes

- Routing is a tiny hash router in `store.js` (`go('details')`). Swap for vue-router when the app grows.
- `preview.html` loads the same `.vue` files straight in the browser (no build). Only used for the hosted preview.
