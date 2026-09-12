# J.A.R.V.I.S. Personal AI System — Command Center

A single-page futuristic command center that runs entirely in the browser, with an honest
architecture: everything that can genuinely work in a browser works, and everything that
would need a native helper is clearly labelled as such instead of faked.

## Look and feel

- Deep charcoal/near-black canvas, warm amber-orange accents, steel gray and soft white
  for secondary text. Thin glowing borders, corner brackets, faint scanline texture.
- Restrained motion: a pulsing core ring, soft fades on panels, no constant flashing.
- Works from a 1920x1080 desktop wall display down to a phone; on small screens the side
  navigation collapses into a drawer.

## Screens (all in one page, no reloads)

Top header (status, clock, connection pills) + left navigation + main area:

1. **Core** — the central animated visualizer plus voice control, live transcript, and chat.
2. **Console** — typed command entry with output history and command help.
3. **System** — real browser stats (online, memory when available, speech support,
   screen, battery) alongside OS-level rows marked "Bridge required".
4. **Memory** — saved notes, facts, preferences and command history; search, edit, delete,
   clear.
5. **Activity** — timestamped event log with severity filters.
6. **Settings** — assistant name, language, voice/rate/pitch, auto-listen, sound effects,
   AI provider choice, bridge status.

## Core state machine

`IDLE, LISTENING, THINKING, SPEAKING, ERROR, OFFLINE` in one store with `setState`/`getState`
and subscribers. Each state drives a distinct visualizer treatment (calm slow pulse, reactive
rings, orbiting arcs, waveform bars, red fracture, dimmed).

## Voice

- Speech recognition via the browser's Web Speech API, Persian (fa-IR) by default and
  English (en-US) selectable, mic toggle, interim + final transcripts, graceful message when
  the browser does not support it.
- Speech synthesis with voice picker, rate and pitch sliders; speaking automatically flips
  the core into SPEAKING and back.

## Chat and AI providers

Message history with timestamps, thinking indicator, streaming-style token reveal, and safe
markdown rendering (no raw HTML injection).

An `AIProvider` interface with three implementations:
- **Mock** (default) — a thoughtful simulated assistant, fully offline.
- **Local** — Ollama / llama.cpp bridge stub that reports it needs a local runtime.
- **Cloud** — architecture only; reads configuration at runtime, no secrets in the code.

## Commands and permissions

A parser/router for `help, time, date, status, memory, settings, clear, voice, listen, speak,
theme, log, whoami` and more. Every command carries a tier:
`PUBLIC, SAFE, CONFIRM, PRIVILEGED, BLOCKED`. `CONFIRM` opens a confirmation dialog,
`PRIVILEGED` requires an unlocked session, `BLOCKED` is refused with a reason.

## Native bridges — honest by design

`WindowsBridge` (getSystemStatus, openApplication, readDirectory, createFile, ...) and
`AndroidBridge` interfaces, each shipped with an "unavailable" implementation that returns a
clear "native bridge required" result. No invented CPU/RAM numbers anywhere.

## Persistence

Memory, settings and activity log all persist in browser storage and reload on next visit.

## Technical notes

- TanStack Start route at `/` with in-page view switching; no backend needed for the default
  Mock provider, so no Cloud enablement in this pass.
- `src/lib/jarvis/` holds core state, voice, speech, providers, commands, permissions,
  bridges, memory, settings, logger — plain TypeScript modules with React hooks on top.
- Design tokens (charcoal/amber/steel) added to `src/styles.css`; components use semantic
  tokens only.
- shadcn primitives (dialog, sliders, switches, tabs, scroll-area, input) for controls.
