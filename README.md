# SpeakFlow AI — Personal English Speaking & Fluency Coaching Platform

SpeakFlow AI is a voice-first English speaking coaching platform that pairs learners with a patient, intelligent AI conversation partner powered by Gemini 3.8 Flash and Gemini Text-to-Speech (TTS).

---

## Key Features

1. **Voice-First Conversation Studio**
   - Natural speech interaction with live audio visualizer and responsive waveforms.
   - Powered by Gemini 3.8 Flash for low-latency conversational turns and `gemini-3.8-flash-lite-tts` for human-like spoken audio.
   - Microphone recording with Web Speech API integration, MediaRecorder audio capture, and graceful text-input fallback.
   - Audio interruption control, speech replay, and caption toggles.

2. **9 Core Practice Routes**
   - **Route A: Free Conversation**: Spontaneous discussions on any topic or open questions.
   - **Route B: Instant Correction Mode**: Immediate grammar, phrasing, and vocabulary breakdown after every turn.
   - **Route C: Uninterrupted Immersion**: Flowing conversation with full review deferred to the end.
   - **Route D: Fictional Roleplay**: 10+ realistic scenarios (dining at a bistro, thesis defense, investor pitch).
   - **Route E: Real-Life Situation Simulator**: Practical guided tasks (airport delayed connection, clinic visit, lease inquiry).
   - **Route F: Pronunciation Practice**: Word, minimal pairs, and sound drills with IPA guide, reference audio, and transcription fidelity comparison.
   - **Route G: Vocabulary Builder**: Personal word bank with spaced repetition flashcard review, definitions, and contextual examples.
   - **Route H: Grammar & Fluency Focus**: Targeted focus on verb tenses, prepositions, articles, and word order.
   - **Route I: Interview & Professional English**: HR behavioral rounds, technical project walkthroughs, and salary negotiations.

3. **5-Dimension Explainable Rubric Scoring (0–100 points)**
   - **Grammar & Sentence Construction** (25 pts)
   - **Vocabulary & Word Choice** (20 pts)
   - **Fluency & Coherence** (20 pts)
   - **Task Completion & Relevance** (20 pts)
   - **Communication Clarity** (15 pts)
   - Honest insufficient-evidence handling: Sessions with < 2 turns are respectfully identified rather than fabricating scores.

4. **Personalized Onboarding & Settings**
   - CEFR proficiency levels: Beginner (A1) to Advanced (C1-C2).
   - Multiple learning goals: Everyday conversation, job interviews, workplace, travel, academic.
   - AI coach voice selection: Kore, Puck, Fenrir, Zephyr.
   - Light and dark theme support.

---

## Tech Stack & Architecture

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons, Canvas-Confetti.
- **Backend**: Node.js & Express with full-stack Vite middleware integration in `server.ts`.
- **AI Engine**: `@google/genai` TypeScript SDK:
  - `gemini-3.8-flash` for conversation, turn corrections, and rubric evaluation.
  - `gemini-3.8-flash-lite-tts` for synthesized WAV speech audio.
  - `gemini-3.5-transcribe` for server-side audio transcription.
- **Data Persistence**: JSON database store in `data/speakflow_db.json`.

---

## Environment Configuration

Create a `.env` file or provide via environment variables:

```env
# Required for Gemini AI API calls
GEMINI_API_KEY="your-gemini-api-key"

# Port (defaults to 3000)
PORT=3000
```

---

## Startup Instructions

### Linux / macOS
```bash
npm install
npm run dev
```

### Windows (cmd / PowerShell)
```cmd
npm install
npm run dev
```

The application will be live at `http://localhost:3000`.
