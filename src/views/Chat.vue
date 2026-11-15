<script setup>
// One chat page for both sides: #chat is the sender writing to their driver,
// #d-chat is the driver writing to the sender of the package they have open.
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { state, go, senderHome, postMessage, driverThread } from '../store.js'
import Icon from '../components/Icon.vue'

const asDriver = state.route === 'd-chat'
const me = asDriver ? 'driver' : 'sender'
const them = asDriver ? 'sender' : 'driver'
const s = state.shipment
const pkg = state.driverActive
if (asDriver && pkg) driverThread(pkg) // make sure the thread exists before anything reads it

const ready = computed(() => (asDriver ? !!pkg : !!s.booking))
const thread = computed(() => (!ready.value ? [] : asDriver ? pkg.messages : s.messages))
const name = computed(() => (!ready.value ? '' : asDriver ? pkg.sender : s.booking.driver))
const sub = computed(() => {
  if (!ready.value) return ''
  return asDriver ? `Sender · ${pkg.from} → ${pkg.to}` : `Your driver · ${s.from} → ${s.to.name}`
})

const draft = ref('')
const list = ref(null)
const typing = ref(false)
let replyTimer = null

// Mock replies from the other side. Replace with the real message feed.
const REPLIES = asDriver
  ? ['Thanks, that works for me.', 'Great. I will have it ready at the door.', 'Perfect, see you then.']
  : ['Got it, thanks.', 'No problem, I will take care of that.', 'Understood. I will message you when I am close.']
let replyIndex = 0

function send() {
  const text = draft.value.trim()
  if (!text) return
  postMessage(thread.value, me, text)
  draft.value = ''
  clearTimeout(replyTimer)
  typing.value = true
  replyTimer = setTimeout(() => {
    typing.value = false
    postMessage(thread.value, them, REPLIES[replyIndex++ % REPLIES.length])
  }, 1800)
}

function toBottom() {
  nextTick(() => { if (list.value) list.value.scrollTop = list.value.scrollHeight })
}
watch(() => [thread.value.length, typing.value], toBottom)
onMounted(toBottom)
onBeforeUnmount(() => clearTimeout(replyTimer))

function back() {
  go(asDriver ? 'd-package' : senderHome())
}
</script>

<template>
  <div class="page">
    <header class="topbar">
      <button class="btn btn-round" aria-label="Back" @click="back"><Icon name="back" /></button>
      <span class="avatar">{{ name[0] }}</span>
      <div class="who">
        <span class="who-name">{{ name }}</span>
        <span class="who-sub">{{ sub }}</span>
      </div>
    </header>

    <div ref="list" class="thread">
      <p v-if="!ready" class="muted empty">Nothing to talk about yet. Messages open once a shipment is booked.</p>
      <template v-else>
        <p v-if="!thread.length" class="muted empty">
          No messages yet. {{ asDriver ? 'Ask the sender anything about the pickup.' : 'Tell the driver anything they should know.' }}
        </p>
        <div v-for="msg in thread" :key="msg.id" class="row" :class="msg.from === 'system' ? 'system' : msg.from === me ? 'mine' : 'theirs'">
          <div class="bubble">
            {{ msg.text }}
            <span v-if="msg.from !== 'system'" class="time">{{ msg.time }}</span>
          </div>
        </div>
        <div v-if="typing" class="row theirs"><div class="bubble typing">{{ name }} is typing…</div></div>
      </template>
    </div>

    <form v-if="ready" class="composer" @submit.prevent="send">
      <input v-model="draft" class="field" type="text" aria-label="Message" autocomplete="off"
             :placeholder="`Message ${name}`">
      <button class="btn btn-primary send" type="submit" :disabled="!draft.trim()">Send</button>
    </form>
  </div>
</template>

<style scoped>
.avatar { width: 40px; height: 40px; border-radius: 50%; background: #EDE7DD; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 17px; flex: none; }
.who { display: flex; flex-direction: column; min-width: 0; }
.who-name { font-size: 17px; font-weight: 700; }
.who-sub { font-size: 13px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.thread { flex: 1; min-height: 0; overflow-y: auto; padding: 12px 16px 16px; display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 720px; margin: 0 auto; }
.empty { text-align: center; margin: 32px 12px; font-size: 15px; }
.row { display: flex; }
.mine { justify-content: flex-end; }
.system { justify-content: center; }
.bubble { max-width: 82%; padding: 10px 14px; border-radius: 18px; font-size: 16px; line-height: 1.35; background: var(--card); border-bottom-left-radius: 6px; overflow-wrap: anywhere; }
.mine .bubble { background: var(--navy); color: #fff; border-bottom-left-radius: 18px; border-bottom-right-radius: 6px; }
.system .bubble { max-width: 92%; background: var(--soft); color: var(--muted); font-size: 14px; border-radius: 12px; text-align: center; }
.time { display: block; margin-top: 2px; font-size: 11px; opacity: 0.6; text-align: right; }
.typing { color: var(--muted); font-size: 14px; font-style: italic; }

.composer { flex: none; display: flex; gap: 8px; padding: 10px max(16px, env(safe-area-inset-right, 0px)) calc(12px + env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px)); background: var(--card); box-shadow: 0 -6px 24px rgba(31, 29, 26, 0.06); }
.field { flex: 1; min-width: 0; min-height: 52px; padding: 0 16px; border: 1.5px solid var(--line); border-radius: 26px; background: var(--bg); font-size: 16px; }
.field:focus { outline: none; border-color: var(--navy); }
.send { min-width: 0; min-height: 52px; padding: 0 22px; border-radius: 26px; font-size: 16px; }
</style>
