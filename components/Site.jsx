'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, MotionConfig, useInView, useScroll, useTransform } from 'framer-motion'

// ---- Edit your wedding details here ----
const W = { a: 'Arya', b: 'Nikhil', date: '2027-04-14T10:30:00+05:30', dateText: '14 April 2027', city: 'Kochi, Kerala', whatsapp: '910000000000', venue: 'Venue name, Street, Kochi, Kerala', maps: 'https://www.google.com/maps/search/?api=1&query=Kochi', tag: '#AryaWedsNikhil',
  story: 'Two strangers. One delayed flight. A coffee that went cold because neither of us stopped talking. Five years, three cities and one very patient dog later, this is the scene we have been waiting to shoot. Be there for the best part.' }
const SHOWS = [['Haldi', '12 April', '10:00 am', 'Screen 1, Family courtyard'], ['Mehendi and Sangeet', '13 April', '6:00 pm', 'Screen 2, The Garden Hall'], ['The Wedding', '14 April', '10:30 am', 'Screen 3, Main auditorium'], ['Reception', '14 April', '7:00 pm', 'Screen 4, The Grand Ballroom']]
const CREDITS = [
  ['Parents of the Bride', 'Radha & Mohan Menon'],
  ['Parents of the Groom', 'Lakshmi & Suresh Kumar'],
  ['Best Friends', 'Rahul, Sneha, Ashwin & Meera'],
  ['Special Thanks', 'To our families & everyone celebrating with us']
]
const ease = [.16, 1, .3, 1]
const wa = (t) => `https://wa.me/${W.whatsapp}?text=${encodeURIComponent(t)}`

/* ---------- sound: movie soundtrack + cinematic sound effects ---------- */
let AC, SOUND = false, bgAudio = null, fadeTimer = null
const ac = () => { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === "suspended") AC.resume(); return AC }
const getAudio = () => {
  if (typeof window === "undefined") return null
  if (!bgAudio) {
    bgAudio = new Audio("/bgm.mp3")
    bgAudio.loop = true
    bgAudio.volume = 0
  }
  return bgAudio
}
const fadeAudio = (target, ms = 1500, done) => {
  const a = getAudio()
  if (!a) return
  if (fadeTimer) clearInterval(fadeTimer)
  const steps = 25, dt = ms / steps, dv = (target - a.volume) / steps
  let k = 0
  fadeTimer = setInterval(() => {
    k++
    a.volume = Math.min(1, Math.max(0, a.volume + dv))
    if (k >= steps) {
      clearInterval(fadeTimer)
      fadeTimer = null
      a.volume = target
      done?.()
    }
  }, dt)
}
const musicOn = () => {
  SOUND = true
  ac()
  const a = getAudio()
  if (a) {
    if (a.paused) a.play().catch(() => {})
    fadeAudio(0.85, 1800)
  }
}
const musicOff = () => {
  SOUND = false
  fadeAudio(0, 600, () => {
    const a = getAudio()
    if (a && !SOUND) a.pause()
  })
}
const noise = (dur, vol, hp) => { if (!SOUND) return; ac(); const b = AC.createBuffer(1, AC.sampleRate * dur, AC.sampleRate), a = b.getChannelData(0); for (let i = 0; i < a.length; i++) a[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / a.length, 3); const s = AC.createBufferSource(), g = AC.createGain(), f = AC.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp; g.gain.value = vol; s.buffer = b; s.connect(f).connect(g).connect(AC.destination); s.start() }
const tick = () => noise(.03, .4, 2000)
const clack = () => { noise(.12, .9, 800); if (!SOUND) return; const o = AC.createOscillator(), g = AC.createGain(); o.frequency.value = 110; g.gain.setValueAtTime(.5, AC.currentTime); g.gain.exponentialRampToValueAtTime(.001, AC.currentTime + .15); o.connect(g).connect(AC.destination); o.start(); o.stop(AC.currentTime + .2) }
const chime = () => { if (!SOUND) return; ac(); [880, 1318.5].forEach((f, i) => { const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + i * .12; o.type = 'sine'; o.frequency.value = f; g.gain.setValueAtTime(.2, t); g.gain.exponentialRampToValueAtTime(.001, t + 1); o.connect(g).connect(AC.destination); o.start(t); o.stop(t + 1) }) }

/* ---------- opening: play button, film leader countdown, clapperboard ---------- */
function Intro({ done }) {
  const [phase, setPhase] = useState("idle"), [n, setN] = useState(3), [snap, setSnap] = useState(false)
  const play = () => {
    musicOn(); setPhase("count"); let c = 3; tick()
    const iv = setInterval(() => { c--; if (c > 0) { setN(c); tick() } else { clearInterval(iv); setPhase("clap"); setTimeout(() => { clack(); setSnap(true); navigator.vibrate?.(30) }, 900); setTimeout(done, 2500) } }, 900)
  }
  return (
    <motion.div exit={{ opacity: 0 }} transition={{ duration: .9 }} className="fixed inset-0 z-[500] grid place-items-center bg-[#050505] px-4">
      {phase === "idle" && (
        <div className="text-center">
          <motion.button onClick={play} aria-label="Play" whileTap={{ scale: .92 }} className="relative mx-auto grid h-24 w-24 sm:h-28 sm:w-28 place-items-center rounded-full border-2 border-mari">
            <motion.span className="absolute inset-0 rounded-full border border-mari" animate={{ scale: [1, 1.7], opacity: [.8, 0] }} transition={{ duration: 1.6, repeat: Infinity }} />
            <svg viewBox="0 0 24 24" className="ml-1 h-9 w-9 sm:h-10 sm:w-10 fill-mari"><path d="M6 4l14 8-14 8z" /></svg>
          </motion.button>
          <p className="mt-6 sm:mt-8 font-label text-xl sm:text-2xl tracking-[.25em] sm:tracking-[.3em]">PRESS PLAY</p>
          <p className="mt-2 text-xs sm:text-sm opacity-60">Best with the sound on</p>
        </div>
      )}
      {phase === "count" && (
        <div className="relative grid h-[65vmin] w-[65vmin] max-w-[320px] max-h-[320px] place-items-center">
          <svg viewBox="0 0 200 200" className="absolute inset-0" fill="none" stroke="#F6EFE2" strokeWidth="1.5">
            <circle cx="100" cy="100" r="92" opacity=".5" />
            <path d="M8 100H192M100 8V192" opacity=".4" />
            <motion.circle key={n} cx="100" cy="100" r="70" stroke="#FFA63D" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: .9, ease: "linear" }} style={{ rotate: -90, transformOrigin: "100px 100px" }} />
          </svg>
          <motion.span key={`n${n}`} initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-[28vmin] sm:text-[34vmin] text-ivory">{n}</motion.span>
        </div>
      )}
      {phase === "clap" && (
        <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-[92vw] max-w-[480px]">
          <motion.div animate={{ rotate: snap ? 0 : -24 }} transition={{ type: "spring", stiffness: 700, damping: 22 }} style={{ originX: 0, originY: 1, background: "repeating-linear-gradient(115deg,#F6EFE2 0 24px,#050505 24px 48px)" }} className="h-10 sm:h-12 rounded-t-md" />
          <div className="border-2 border-t-0 border-ivory bg-[#0b0b0b] p-3.5 sm:p-5 font-label text-base sm:text-xl tracking-wider md:text-2xl">
            <div className="grid grid-cols-2 gap-x-2 gap-y-2 sm:gap-y-3">
              <p>SCENE <span className="text-mari">THE WEDDING</span></p>
              <p>TAKE <span className="text-mari">1</span></p>
              <p>DIRECTOR <span className="text-mari">LOVE</span></p>
              <p>DATE <span className="text-mari">{W.dateText.toUpperCase()}</span></p>
            </div>
            <p className="mt-3 sm:mt-4 text-center font-display text-2xl sm:text-3xl text-ivory">{W.a} &amp; {W.b}</p>
          </div>
          <AnimatePresence>{snap && <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: .5 }} className="fixed inset-0 bg-white" />}</AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  )
}

/* ---------- small pieces ---------- */
function Typewriter({ text }) {
  const ref = useRef(null), inV = useInView(ref, { once: true, amount: .3 }), [k, setK] = useState(0)
  useEffect(() => { if (!inV) return; const i = setInterval(() => setK((v) => { if (v >= text.length) { clearInterval(i); return v } if (v % 5 === 0) tick(); return v + 1 }), 32); return () => clearInterval(i) }, [inV])
  return <p ref={ref} className="font-sans text-lg sm:text-2xl leading-relaxed md:text-4xl font-light">{text.slice(0, k)}<span className="ml-1 inline-block h-[1em] w-[3px] translate-y-1 animate-pulse bg-mari" /></p>
}

function Ticket({ s, i }) {
  const [torn, setTorn] = useState(false)
  return (
    <motion.button onClick={() => { setTorn(!torn); clack(); navigator.vibrate?.(15) }} initial={{ opacity: 0, y: 50, rotate: i % 2 ? 2 : -2 }} whileInView={{ opacity: 1, y: 0, rotate: 0 }} viewport={{ once: true, amount: .2 }} transition={{ duration: .8, delay: i * .06, ease }} whileHover={{ y: -4, rotate: i % 2 ? -1 : 1 }} aria-label={`Admit one: ${s[0]}. Tap to tear the stub.`} className="relative flex w-full text-left overflow-hidden rounded-2xl shadow-lg">
      <div className="relative flex-1 bg-ivory p-3.5 sm:p-5 text-teal md:p-8">
        <p className="font-label text-[11px] sm:text-sm md:text-lg tracking-[.18em] sm:tracking-[.25em] text-rust">NOW SHOWING</p>
        <p className="font-display text-2xl sm:text-3xl md:text-5xl leading-none mt-1">{s[0]}</p>
        <p className="mt-2 text-xs sm:text-sm md:text-base opacity-80">{s[3]}</p>
        <span className="absolute -bottom-3 -right-3 z-10 h-6 w-6 rounded-full bg-deep" />
        <span className="absolute -right-3 -top-3 z-10 h-6 w-6 rounded-full bg-deep" />
      </div>
      <motion.div animate={torn ? { x: 12, y: 16, rotate: 6, opacity: .4 } : { x: 0, y: 0, rotate: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 160, damping: 14 }} className="flex w-24 sm:w-28 md:w-40 flex-col justify-center border-l-2 border-dashed border-teal/40 bg-mari p-2 sm:p-3 text-center text-teal">
        <p className="font-label text-sm sm:text-xl tracking-wider md:text-2xl">{s[1].toUpperCase()}</p>
        <p className="font-display text-base sm:text-xl md:text-3xl leading-tight">{s[2]}</p>
        <p className="mt-0.5 sm:mt-1 font-label text-[10px] sm:text-xs tracking-[.15em]">ADMIT ONE</p>
      </motion.div>
    </motion.button>
  )
}

function Reel() {
  const { scrollY } = useScroll(), r = useTransform(scrollY, (v) => v * .35)
  return <motion.svg style={{ rotate: r }} viewBox="-50 -50 100 100" className="pointer-events-none fixed bottom-3 left-3 z-[90] h-10 w-10 sm:h-14 sm:w-14 text-mari opacity-70 md:h-20 md:w-20" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden><circle r="46" />{[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 26} cy={Math.sin((a * Math.PI) / 180) * 26} r="9" />)}<circle r="5" /></motion.svg>
}

function Dust() {
  const bits = Array.from({ length: 26 }, (_, i) => ({ l: (i * 37) % 100, t: (i * 53) % 100, s: 1 + (i % 3), d: 8 + (i % 6) * 2 }))
  return <div className="pointer-events-none fixed inset-0 z-[80]" aria-hidden>{bits.map((b, i) => <motion.span key={i} className="absolute rounded-full bg-ivory" style={{ left: `${b.l}%`, top: `${b.t}%`, width: b.s, height: b.s }} animate={{ y: [0, -60, 0], x: [0, 20, -10, 0], opacity: [0, .6, 0] }} transition={{ duration: b.d, repeat: Infinity, delay: i * .4 }} />)}</div>
}

function Countdown() {
  const [n, setN] = useState(null)
  useEffect(() => { const f = () => setN(Math.max(0, new Date(W.date) - Date.now())); f(); const i = setInterval(f, 1000); return () => clearInterval(i) }, [])
  if (n === null) return null
  return <div className="grid grid-cols-4 gap-1.5 sm:gap-4 md:gap-8">{[["Days", Math.floor(n / 864e5)], ["Hours", Math.floor(n / 36e5) % 24], ["Mins", Math.floor(n / 6e4) % 60], ["Secs", Math.floor(n / 1e3) % 60]].map(([l, v]) => <div key={l} className="text-center"><div className="overflow-hidden"><AnimatePresence mode="popLayout" initial={false}><motion.p key={v} initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }} transition={{ duration: .45, ease }} className="font-display text-[12vw] sm:text-[14vw] md:text-[8rem] leading-none text-mari">{String(v).padStart(2, "0")}</motion.p></AnimatePresence></div><p className="mt-1 sm:mt-2 font-label text-xs sm:text-sm md:text-lg tracking-[.15em] sm:tracking-[.25em] md:tracking-[.3em]">{l.toUpperCase()}</p></div>)}</div>
}

export default function Site() {
  const [ready, setReady] = useState(false), [snd, setSnd] = useState(true)
  const [yes, setYes] = useState(true), [seats, setSeats] = useState(2), [name, setName] = useState(""), [printed, setPrinted] = useState(false)
  useEffect(() => { document.body.style.overflow = ready ? "" : "hidden" }, [ready])
  const toggle = () => { snd ? musicOff() : musicOn(); setSnd(!snd) }
  const send = (e) => { e.preventDefault(); clack(); setTimeout(chime, 500); setPrinted(true); navigator.vibrate?.([20, 40, 20]); setTimeout(() => open(wa(`Hi, this is ${name}.\n${yes ? `Reserve ${seats} seat${seats > 1 ? "s" : ""} for me.` : "I cannot make it, but sending love."}`), "_blank"), 1800) }
  const holes = Array.from({ length: 14 })

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence>{!ready && <Intro done={() => setReady(true)} />}</AnimatePresence>
      {ready && (
        <main className="bg-deep overflow-x-hidden">
          <Dust /><Reel />
          <button onClick={toggle} aria-label={snd ? "Mute sound" : "Turn sound on"} className="fixed right-3 sm:right-4 top-[max(12px,env(safe-area-inset-top))] z-[95] flex h-9 sm:h-11 items-center gap-1.5 sm:gap-2 rounded-full bg-black/60 px-3 sm:px-4 font-label text-sm sm:text-base md:text-lg tracking-widest backdrop-blur-md">{snd ? <span className="flex h-3.5 sm:h-4 items-end gap-[2px] sm:gap-[3px]">{[0, 1, 2, 3].map((i) => <span key={i} className="eq h-3.5 sm:h-4 w-[2px] sm:w-[3px] origin-bottom bg-mari" style={{ animationDelay: `${i * .15}s` }} />)}</span> : "MUTED"}SOUND</button>

          <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 py-16 sm:py-20 md:py-24 text-center">
            {/* Cinematic shutter curtains - open completely so no black dead zone on mobile */}
            <motion.div initial={{ height: "50%" }} animate={{ height: "0%" }} transition={{ duration: 1.6, delay: .2, ease }} className="absolute inset-x-0 top-0 z-30 bg-[#050505]" />
            <motion.div initial={{ height: "50%" }} animate={{ height: "0%" }} transition={{ duration: 1.6, delay: .2, ease }} className="absolute inset-x-0 bottom-0 z-30 bg-[#050505]" />
            <motion.div animate={{ opacity: [.15, .5, .2, .6, .15] }} transition={{ duration: 7, repeat: Infinity }} className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-rust blur-[100px] mix-blend-screen" />
            <motion.div animate={{ opacity: [.5, .15, .5] }} transition={{ duration: 9, repeat: Infinity }} className="absolute -right-20 bottom-20 h-72 w-72 rounded-full bg-mari blur-[110px] mix-blend-screen" />
            <div className="relative z-10 w-full max-w-4xl">
              <motion.div initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.6, delay: .4, ease }} className="relative mx-auto aspect-[16/10] sm:aspect-[16/9] md:aspect-[2.39/1] w-full overflow-hidden rounded-sm bg-teal shadow-2xl">
                <motion.img
                  src="/images/hero.jpg"
                  alt={`${W.a} & ${W.b}`}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 h-full w-full object-cover object-center filter brightness-[0.92] contrast-[1.05]"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
                {[0, 1].map((s) => <div key={s} className="pointer-events-none absolute inset-y-0 w-3 sm:w-4 overflow-hidden bg-black/90 md:w-6" style={{ [s ? "right" : "left"]: 0 }}><motion.div animate={{ y: [0, -40] }} transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }} className="flex flex-col gap-3 sm:gap-4 pt-2">{holes.map((_, i) => <span key={i} className="mx-auto h-3 sm:h-4 w-1.5 sm:w-2 rounded-sm bg-ivory/80 md:w-3" />)}</motion.div></div>)}
              </motion.div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="mt-5 sm:mt-6 md:mt-8 font-label text-sm sm:text-base md:text-2xl tracking-[.3em] md:tracking-[.5em] text-mari">A LOVE STORY</motion.p>
              <h1 className="mt-1 sm:mt-2 font-display leading-[.95] sm:leading-[.9]" aria-label={`${W.a} and ${W.b}`}>{[W.a.toUpperCase(), "&", W.b.toUpperCase()].map((n, i) => <span key={n} className={`block overflow-hidden pb-[.08em] ${i === 1 ? "text-3xl sm:text-4xl md:text-6xl text-mari my-0.5 sm:my-1" : "text-5xl sm:text-7xl md:text-9xl"}`}><motion.span initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ duration: 1.3, delay: 1.2 + i * .2, ease }} className="block">{n}</motion.span></span>)}</h1>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }} className="mt-4 sm:mt-6 font-label text-base sm:text-lg md:text-2xl tracking-[.18em] sm:tracking-[.25em] md:tracking-[.3em]">IN THEATRES {W.dateText.toUpperCase()}</motion.p>
            </div>
          </section>

          <section className="mx-auto max-w-4xl px-5 py-16 sm:py-24 md:py-28"><p className="mb-4 sm:mb-6 font-label text-xl sm:text-2xl tracking-[.3em] md:tracking-[.4em] text-mari">SYNOPSIS</p><Typewriter text={W.story} /></section>

          <section className="px-5 py-16 sm:py-24 md:px-16 overflow-hidden">
            <motion.p initial={{ opacity: 0, letterSpacing: ".6em" }} whileInView={{ opacity: 1, letterSpacing: ".35em" }} viewport={{ once: true }} transition={{ duration: 1.4 }} className="text-center font-label text-xl sm:text-2xl text-mari">STARRING</motion.p>
            <div className="mx-auto mt-8 sm:mt-10 grid max-w-5xl gap-8 md:grid-cols-2">{[[W.a, "The Bride", "/images/bride.jpg"], [W.b, "The Groom", "/images/groom.jpg"]].map(([n, r, img]) => (
              <motion.div key={n} initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} transition={{ duration: 1, ease }} className="text-center">
                <div className="group relative mx-auto aspect-[3/4] w-[75%] sm:w-[70%] max-w-[340px] overflow-hidden border-[6px] sm:border-[8px] md:border-[10px] border-ivory bg-teal shadow-2xl">
                  <img src={img} alt={n} className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
                <p className="mt-4 sm:mt-5 font-display text-4xl sm:text-5xl md:text-6xl text-mari">{n}</p><p className="mt-1 font-label text-base sm:text-xl tracking-[.25em] md:tracking-[.3em]">{r.toUpperCase()}</p></motion.div>))}</div>
          </section>

          <section className="px-5 py-16 sm:py-24 md:px-16"><h2 className="mb-8 sm:mb-10 text-center font-display text-4xl sm:text-5xl md:text-8xl">Showtimes</h2><div className="mx-auto max-w-3xl space-y-4 sm:space-y-5">{SHOWS.map((s, i) => <Ticket key={s[0]} s={s} i={i} />)}</div><p className="mt-5 sm:mt-6 text-center text-xs sm:text-sm opacity-60">Tap a ticket to tear the stub</p></section>

          <section className="bg-teal px-5 py-16 sm:py-24 text-center md:px-16"><p className="font-label text-xl sm:text-2xl tracking-[.3em] md:tracking-[.4em] text-mari">COMING SOON</p><div className="mt-6 sm:mt-8"><Countdown /></div><p className="mx-auto mt-8 sm:mt-12 max-w-md text-base sm:text-lg">Filming location: {W.venue}</p><a href={W.maps} target="_blank" rel="noreferrer" className="mt-5 sm:mt-6 inline-block rounded-full border border-mari px-6 sm:px-8 py-3.5 sm:py-4 font-label text-lg sm:text-xl tracking-[.18em] sm:tracking-[.2em] text-mari transition-colors hover:bg-mari hover:text-teal">OPEN IN GOOGLE MAPS</a></section>

          <section className="px-5 py-16 sm:py-24 md:px-16"><h2 className="text-center font-display text-4xl sm:text-5xl md:text-8xl">Reserve your seats</h2>
            <form onSubmit={send} className="mx-auto mt-8 sm:mt-10 max-w-md space-y-4 sm:space-y-5">
              <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full border-b-2 border-ivory/40 bg-transparent py-2.5 sm:py-3 text-lg sm:text-xl placeholder:text-ivory/40 focus:outline-none focus:border-mari" />
              <div className="flex gap-2 sm:gap-3">{[[true, "I will be there"], [false, "Cannot make it"]].map(([v, l]) => <button type="button" key={l} onClick={() => setYes(v)} className={`flex-1 rounded-full py-2.5 sm:py-3 font-label text-sm sm:text-base md:text-lg tracking-wider ring-1 ring-ivory transition-colors ${yes === v ? "bg-mari text-teal ring-mari" : ""}`}>{l.toUpperCase()}</button>)}</div>
              {yes && <div><div className="flex items-center gap-3 sm:gap-4"><span className="font-label text-base sm:text-xl tracking-wider">SEATS</span><button type="button" aria-label="Fewer" onClick={() => { setSeats(Math.max(1, seats - 1)); tick() }} className="h-9 w-9 sm:h-11 sm:w-11 rounded-full ring-1 ring-ivory">−</button><span className="w-6 text-center font-display text-2xl sm:text-3xl">{seats}</span><button type="button" aria-label="More" onClick={() => { setSeats(seats + 1); tick() }} className="h-9 w-9 sm:h-11 sm:w-11 rounded-full ring-1 ring-ivory">+</button></div>
                <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5">{Array.from({ length: Math.max(seats, 6) }, (_, i) => <motion.span key={i} animate={{ backgroundColor: i < seats ? "#FFA63D" : "rgba(246,239,226,.15)", y: i < seats ? 0 : 4 }} className="h-6 sm:h-7 w-5 sm:w-6 rounded-t-lg" />)}</div></div>}
              <button className="w-full rounded-full bg-mari py-3.5 sm:py-4 font-label text-xl sm:text-2xl tracking-[.2em] md:tracking-[.25em] text-teal transition-transform hover:scale-[1.02]">PRINT MY TICKET</button>
            </form>
            <AnimatePresence>{printed && <motion.div initial={{ y: 80, opacity: 0, rotate: -4 }} animate={{ y: 0, opacity: 1, rotate: -2 }} transition={{ type: "spring", stiffness: 120, damping: 12 }} className="mx-auto mt-8 max-w-md rounded-2xl bg-ivory p-5 sm:p-6 text-center text-teal shadow-xl"><p className="font-label text-base sm:text-lg tracking-[.25em] sm:tracking-[.3em] text-rust">ADMIT {yes ? seats : 0}</p><p className="font-display text-2xl sm:text-3xl">{name}</p><p className="mt-1 text-xs sm:text-sm">{W.a} &amp; {W.b}, {W.dateText}</p></motion.div>}</AnimatePresence>
          </section>

          <section className="relative min-h-[100dvh] overflow-hidden bg-[#050505] px-5 py-20 sm:py-28 md:py-32 text-center">
            {/* Cinematic projector beam & background glow */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-mari/10 via-rust/5 to-transparent blur-2xl" />
            
            <div className="relative mx-auto max-w-2xl space-y-12 sm:space-y-16">
              {/* Credits Title */}
              <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1, ease }}>
                <p className="font-label text-xs sm:text-sm tracking-[.4em] sm:tracking-[.5em] text-mari/70">ROLLING</p>
                <h2 className="mt-1 sm:mt-2 font-display text-5xl sm:text-6xl md:text-8xl">Credits</h2>
                <div className="mx-auto mt-4 sm:mt-6 flex w-28 sm:w-32 items-center justify-center gap-2">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent to-mari/50" />
                  <span className="h-2 w-2 rotate-45 border border-mari/60" />
                  <span className="h-px flex-1 bg-gradient-to-l from-transparent to-mari/50" />
                </div>
              </motion.div>

              {/* Credits List */}
              <div className="space-y-8 sm:space-y-10">
                {CREDITS.map(([r, nm], i) => (
                  <motion.div
                    key={r}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.8, delay: i * 0.06, ease }}
                    className="space-y-1 sm:space-y-1.5"
                  >
                    <p className="font-label text-[11px] sm:text-xs md:text-sm tracking-[.3em] md:tracking-[.4em] text-ivory/50">{r.toUpperCase()}</p>
                    <p className="font-sans text-xl sm:text-2xl md:text-3xl font-light tracking-wide text-ivory">{nm}</p>
                  </motion.div>
                ))}
              </div>

              {/* The End and Replay */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease }}
                className="pt-8 sm:pt-12"
              >
                <div className="mx-auto my-6 sm:my-8 flex w-40 sm:w-48 items-center justify-center gap-3">
                  <span className="h-px flex-1 bg-gradient-to-r from-transparent to-mari" />
                  <span className="font-label text-xs tracking-[.3em] text-mari">★ ★ ★</span>
                  <span className="h-px flex-1 bg-gradient-to-l from-transparent to-mari" />
                </div>

                <p className="font-display text-6xl sm:text-7xl md:text-9xl text-mari">The End</p>
                <p className="mt-3 sm:mt-4 font-label text-xl sm:text-2xl tracking-[.25em] sm:tracking-[.3em] text-ivory/80">{W.tag}</p>

                {/* Back to top / replay button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="mt-8 sm:mt-12 inline-flex items-center gap-2 sm:gap-3 rounded-full border border-mari/60 bg-mari/10 px-5 sm:px-6 py-2.5 sm:py-3 font-label text-sm sm:text-base tracking-[.2em] sm:tracking-[.25em] text-mari backdrop-blur-sm transition-colors hover:bg-mari hover:text-teal"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M12 4l-8 8h5v8h6v-8h5z" /></svg>
                  BACK TO TOP
                </motion.button>
              </motion.div>
            </div>
          </section>
        </main>)}
    </MotionConfig>
  )
}
