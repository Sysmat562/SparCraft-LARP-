# SparCraft: Realistic Hands-Free Voice Conversation Sparring

SparCraft is a high-fidelity, hands-free voice training platform designed to sharpen conversational agility, quick thinking, and improvisation under social pressure with dynamic AI characters.

### User Review & Critical Decisions

> [!IMPORTANT]
> The foundational design principle confirmed by the user is **hyper-realistic real-life conversational immersion**:
> - **100% Hands-Free Voice Flow**: Natural voice activity detection with conversational pause detection (1.4s cadence) so users speak without holding buttons or breaking eye contact.
> - **Realistic Conversationalist, Not an Interrogator**: AI characters react with organic human mannerisms, spontaneous opinions, skepticism, and humor—challenging vague answers naturally rather than turning rounds into rigid quizzes.
> - **Dual Credibility vs. Accuracy Engine**: Separates factual accuracy from convincing delivery (vital for bluffing scenarios like pretending to know Chicago deep dish or vintage watch movements).

---

### 1. Overview & Core Concept

- **What It Does**: Puts the user in dynamic real-world voice simulations (bluffing niche topics, defending hot takes, breaking into ongoing banter, handling unexpected curveballs, or spinning consistent stories). The AI responds verbally with personality, questions vague assertions, and challenges inconsistencies.
- **Target Audience**: Professionals, public speakers, debaters, interviewees, and anyone wanting to overcome social hesitation and master spontaneous communication.
- **Key Value**: Delivers low-stakes, high-repetition practice with instant objective feedback, moment-by-moment quote breakdowns, interactive retries of weak moments, and a competitive Elo rating system that tracks long-term growth.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Lobby & Scenario Deck**:
   - Browse curated scenario archetypes (*Bluff the Expert*, *Defend Harmless Hot Take*, *Infiltrate the Circle*, *The Curveball Interview*, *Improvised Alibi*) or launch a **Random Drill** with one click.
   - Customize or tune parameters: Topic, Difficulty (*Novice*, *Adept*, *Master*, *Grandmaster*), and Round Length (*60s Blitz*, *90s Standard*, *120s Extended*, or *Freeform*).
   - Custom Scenario creator modal to test any unique niche (e.g., quantum computing at a family barbecue).
2. **The Sparring Arena (Hands-Free Voice Round)**:
   - Immersive full-screen sparring stage with a dynamic dual audio visualizer (user voice waveform + AI vocal resonance sphere).
   - Hands-free continuous speech recognition with natural silence detection (1.4s conversational pause trigger).
   - Real-time live transcript feed with speaker differentiation and live timer display.
   - Fluid controls for muting, manual turn nudge if in a loud environment, and "Conclude Spar" early.
3. **Diagnostic Scorecard & Debrief**:
   - 5-Dimensional Performance Matrix:
     - **Relevance**: Topic adherence and contextual framing.
     - **Specificity**: Concrete nouns, examples, and vivid details vs. vague fluff.
     - **Conversational Flow**: Natural pacing, transitions, and conversational volley balance.
     - **Adaptability**: Rolling with curveballs and pushback.
     - **Credibility vs. Factual Accuracy**: Distinct dual-metric comparing convincing swagger against objective truth.
   - **Moment-by-Moment Quotations**: Direct transcript excerpts labeled as "Effective Volley" or "Hesitant / Vague Moment", with concrete alternative responses and linguistic coaching.
   - **Interactive "Retry Moment"**: Instant 1-on-1 drill right from the scorecard to practice the exact weak exchange until mastered.
4. **Elo Progression & Vault**:
   - Chess-style Elo rating calculation factoring scenario difficulty and performance delta.
   - Transparent narrative rating explanations (e.g., `+19 Elo: Adept Bluff achieved high Credibility (94) despite low Accuracy (28), demonstrating mastery of improvisational confidence`).
   - Saved history with audio replays, full transcripts, and mastery trend charts.

#### Visual Identity & Theme
- **Aesthetic Direction**: Sleek, moody debate salon with warm bronze/amber accents and deep charcoal canvases. Clean architectural lines inspired by executive coaching suites.
- **Color Palette**:
  - Background Canvas: Deep Charcoal Slate (`#0B0F17`, `bg-slate-950`)
  - Structural Cards: Muted Obsidian with hairline slate borders (`#151D2A`, `border-slate-800/80`)
  - Primary Accent: Radiant Warm Amber (`#F59E0B` / `#D97706`) for active voice energy and Elo progress
  - Secondary Accent: Atmospheric Cyan/Teal (`#0EA5E9` / `#14B8A6`) for AI audio resonance
  - Typography: `Plus Jakarta Sans` for clean, confident display titles; `DM Sans` for body text; `IBM Plex Mono` for tabular Elo and round countdowns.
- **Anti-Slop Discipline**:
  - No decorative purple glow or static pill badge sandwiches.
  - Metadata styled with quiet typographic separators (`Topic · 90s · Master Difficulty`).
  - Active audio indicators bound strictly to real Web Audio Analyser data.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Hands-Free Voice Detection Architecture**
  - *Chosen Approach*: Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`) combined with an active Web Audio API `AudioContext` silence-detector (measuring RMS volume levels and utterance timestamps) paired with server-side Gemini audio generation / Web Speech Synthesis fallback.
  - *Why*: Allows true hands-free natural back-and-forth conversation without requiring the user to hold down buttons, exactly mirroring natural social environments.
  - *Fallback*: Seamless manual "Send / Push-to-Talk" and text input affordances for noisy environments or browsers lacking speech recognition permissions.
- **Decision 2: Elo Rating Calculation Engine**
  - *Chosen Approach*: Standard FIDE-style Elo expected score formula where scenario difficulties have baseline ratings (Novice: 1000, Adept: 1300, Master: 1600, Grandmaster: 1900). A player's normalized performance score (0.0 to 1.0) compared to the expected outcome dictates rating delta with a dynamic K-factor and plain-English explanation.
  - *Why*: Provides genuine stakes, gamification, and measurable long-term conversational progress.
- **Decision 3: Server-Side Gemini API Proxy with Structured Evaluation**
  - *Chosen Approach*: Express server routes (`/api/spar/chat`, `/api/spar/evaluate`, `/api/spar/tts`) using `@google/genai` with `gemini-3.8-flash` and `gemini-3.8-flash-lite-tts`.
  - *Why*: Ensures prompt injection safety, secures API keys server-side, enables structured JSON evaluation matrices, and produces high-quality voice audio for realistic characters.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          BROWSER CLIENT (React 19)                     │
│                                                                        │
│  ┌───────────────────────┐  ┌────────────────────────────────────────┐  │
│  │     Lobby & Setup     │  │          Sparring Arena (Live)         │  │
│  │ - Scenario Selector   │  │ - Hands-free Voice Activity (WebAudio) │  │
│  │ - Difficulty & Length │  │ - Web Speech Recognition Engine        │  │
│  │ - Elo Tier Badges     │  │ - Dynamic Waveform & Sphere Visualizer │  │
│  └───────────────────────┘  │ - Turn taking & Interruption Manager   │  │
│                             └────────────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  ┌────────────────────────────┐  │
│  │      Post-Round Scorecard         │  │      Vault & History       │  │
│  │ - 5D Metric Scores (0-100)        │  │ - Saved Sparring Transcripts│ │
│  │ - Credibility vs. Accuracy Split  │  │ - Elo Progression Chart    │  │
│  │ - Moment Quotes & Coaching Tips   │  │ - Mastery Breakdown Stats  │  │
│  │ - Interactive "Retry Moment" Modal│  └────────────────────────────┘  │
│  └───────────────────────────────────┘                                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON & Audio Blobs
┌───────────────────────────────────▼────────────────────────────────────┐
│                         NODE.JS / EXPRESS SERVER                       │
│                                                                        │
│  ┌────────────────────┐  ┌─────────────────────┐  ┌─────────────────┐  │
│  │  POST /api/spar/   │  │  POST /api/spar/    │  │ POST /api/spar/ │  │
│  │       turn         │  │     evaluate        │  │       tts       │  │
│  │ (Character Response│  │ (5-Score Rubric +   │  │ (Gemini 3.8     │  │
│  │  & Follow-up Logic)│  │  Quotes & Elo Delta)│  │  Flash Lite TTS)│  │
│  └─────────┬──────────┘  └──────────┬──────────┘  └────────┬────────┘  │
│            └────────────────────────┼──────────────────────┘            │
│                                     ▼                                   │
│                        @google/genai Client                             │
│                  gemini-3.8-flash & gemini-3.8-flash-lite-tts           │
└────────────────────────────────────────────────────────────────────────┘
```

#### Core Data Entities
```typescript
interface Scenario {
  id: string;
  category: 'bluff_expert' | 'defend_hot_take' | 'join_ongoing' | 'curveball_question' | 'improv_story';
  title: string;
  topic: string;
  premise: string;
  character: {
    name: string;
    role: string;
    voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
    personality: string;
    challengeStyle: string; // e.g., "Skeptical, probes for specific ratios and techniques"
  };
  difficulty: 'novice' | 'adept' | 'master' | 'grandmaster';
  targetDurationSeconds: number;
  initialMessage: string;
}

interface PerformanceEvaluation {
  overallScore: number;
  scores: {
    relevance: number;        // 0-100
    specificity: number;      // 0-100
    conversationalFlow: number;// 0-100
    adaptability: number;     // 0-100
    credibility: number;      // 0-100 (convincing delivery)
    factualAccuracy: number;  // 0-100 (truthfulness)
  };
  deliveryVsAccuracyAnalysis: string;
  moments: Array<{
    userQuote: string;
    aiQuote: string;
    assessment: 'strength' | 'weakness';
    feedback: string;
    suggestedAlternative: string;
    retryPrompt: string; // Used for interactive "Retry Moment" drill
  }>;
  eloChange: {
    previousElo: number;
    newElo: number;
    delta: number;
    explanation: string;
  };
  generalAdvice: string;
}
```

#### Key Implementation Steps
1. **Server API Layer (`server.ts`)**:
   - Integrate Express server with `@google/genai` to serve character turns with natural interruptions, full structured evaluation, and TTS audio synthesis.
2. **Hands-Free Speech Engine**:
   - Combine continuous Web Speech Recognition, Web Audio Analyser for real-time waveform visualizers, and silence timer for organic turn transitions.
3. **Conversational Stage UI**:
   - Build dual-speaker visual stage with live pulsing waveforms, active speaker status, transcript feed, and timer.
4. **Diagnostic Scorecard with Interactive Retry**:
   - Render radial and bar metrics, credibility vs. accuracy analysis, quoted weak moments, and a dedicated retry modal that simulates the exact moment.
5. **Progress & Elo Dashboard**:
   - LocalStorage persistence with Elo rating tracking, session review, and historical transcript playback.
