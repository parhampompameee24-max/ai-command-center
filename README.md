# AI Command Center

Build the J.A.R.V.I.S. Personal AI System command center web application following these specifications:

1. Design & UI:
- Original futuristic command-center interface (not a movie replica), dark charcoal/black background with deep orange/amber accents, steel gray/soft white secondary tones, subtle HUD styling, controlled animations, responsive across 1920x1080 down to mobile.
- Dashboard layout with Header, Sidebar, central JARVIS Core visualizer, Voice Control, Chat area, Command Console, System Status, Memory Manager, Activity Log, and Settings. Seamless navigation without page reloads.

2. JARVIS Core State Machine:
- States: IDLE, LISTENING, THINKING, SPEAKING, ERROR, OFFLINE with reactive visualizer animations for each state and clean setState/getState management.

3. Voice & Speech Engines:
- Web Speech API integration for speech recognition with support for Persian (fa-IR default) and English (en-US), microphone toggling, transcript handling, error fallbacks, and availability checks.
- Web Speech Synthesis for text-to-speech with voice selection, rate/pitch adjustments, and automatic SPEAKING state synchronization.

4. Chat & AI Provider Architecture:
- Full conversational chat with message history, timestamps, streaming/thinking states, and safe markdown rendering.
- Abstract AIProvider interface with MockAIProvider (thoughtful simulated assistant responses), LocalAIProvider (Ollama/llama.cpp bridge stub), and CloudAIProvider architecture without hardcoded secrets.

5. Command Router & Permission Manager:
- Internal command parser and router supporting built-in commands: help, time, date, status, memory, settings, clear, voice, etc.
- Permission tiers: PUBLIC, SAFE, CONFIRM, PRIVILEGED, BLOCKED with confirmation dialogs for dangerous actions.

6. Native Bridge Adapters (Honest Architecture):
- WindowsBridge interface with methods (getSystemStatus, openApplication, readDirectory, createFile, etc.) implemented via an UnavailableWindowsBridge that clearly reports native bridge required (no fake metrics).
- AndroidBridge interface with UnavailableAndroidBridge showing honest connection states.
- System Monitor accurately displaying browser-available stats (online status, memory if supported, speech API status) while cleanly marking OS-level metrics as 'Bridge Required' or 'Mock/Demo Mode'.

7. Memory & Settings Services:
- Persistent memory service (localStorage/state) for notes, preferences, facts, and command history with search, edit, delete, and clear capabilities.
- Persistent settings panel covering JARVIS name, voice engine preferences, language, auto-listen, sound effects, AI provider selection, and bridge connection statuses.
- Activity logger capturing system, voice, command, and AI events with timestamps and severity levels.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d6e92e0f-0f9e-4d5a-8628-fb768c376fc0).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
