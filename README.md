# 🕹️ ProProject: The Ultimate Competitive Arcade Ecosystem

> **The Single Source of Truth for Console Dominance.**  
> ProProject is a high-fidelity, AI-verified competitive gaming platform that transforms the casual console experience into a high-stakes, professional arena. Powered by Gemini AI Vision and a real-time economic engine.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![AI Powered](https://img.shields.io/badge/AI-Gemini_1.5-blue?style=for-the-badge&logo=google-gemini)](https://deepmind.google/technologies/gemini/)

[**Explore the Arena »**](https://github.com/mandozza/p1vsp2.git)

[View Demo](https://github.com/mandozza/p1vsp2.git) · [Report Dispute](https://github.com/mandozza/p1vsp2.git/issues) · [Request Game Protocol](https://github.com/mandozza/p1vsp2.git/issues)

---

## 📖 Table of Contents
- [🚀 The Vision](#-the-vision)
- [🛡️ Core Pillars](#-core-pillars)
  - [AI Oracle Verification](#-ai-oracle-verification)
  - [The Credit Economy](#-the-credit-economy)
  - [Organized Championships](#-organized-championships)
- [🏗️ Technical Architecture](#-technical-architecture)
  - [System Workflow](#system-workflow)
  - [Tech Stack](#tech-stack)
- [🛠️ Getting Started](#️-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [🧠 AI Protocol Guide](#-ai-protocol-guide)
- [📊 Codebase Quality](#-codebase-quality)
- [🤝 Contributing](#-contributing)

---

## 🚀 The Vision
In the world of console gaming, disputes, "rage-quits," and manual score reporting often stifle true competition. **ProProject** eliminates these barriers. By utilizing **Gemini 1.5 Flash Vision**, we have built an automated pipeline that extracts match data directly from end-of-game screenshots. 

If it happened on your screen, our Oracle knows. No more manual entry. No more lies. Only dominance.

---

## 🛡️ Core Pillars

### 🔮 AI Oracle Verification
The heart of ProProject is the **AI Oracle**. It supports dynamic protocols for any game genre:
- **Fighting Games**: Automatically detects Winners, Methods (KO/SUB), Rounds, and Time.
- **Sports/Racing**: Identifies final scores, lap times, and podium positions.
- **Video Proof**: Integrates YouTube/Twitch clips into the Community Tribunal for undeniable evidence.
- **Bio-Code Protocol**: Secures gaming identities by verifying physical console account ownership via AI-analyzed profile screenshots.

### 💰 The Credit Economy
A high-stakes, atomic transaction system that brings "skin in the game" to every bout:
- **Wager Matches**: Players can bet credits on individual challenges.
- **Prize Pools**: Tournament entry fees automatically build massive pots for the Grand Finals.
- **Side-Betting**: The community can bet on high-stakes matches using AI-generated **Oracle Odds**.
- **Credit Ledger**: Every transaction is logged with 100% financial integrity using MongoDB atomic operations.

### 🏆 Organized Championships
A complete **Tournament Engine** that manages the entire lifecycle of a competition:
- **Automated Brackets**: Generates single-elimination brackets upon tournament start.
- **Real-time Advancement**: Winners are automatically moved to the next round the moment the AI Oracle verifies their match result.
- **The Sector Belt**: A virtual title that passes between rivals, visible on elite player profiles.

---

## 🏗️ Technical Architecture

### System Workflow
1. **Challenge**: Player A challenges Player B with a 500-credit wager.
2. **Acceptance**: Credits are escrowed in the **Credit Ledger**.
3. **Combat**: Players execute the match on their consoles.
4. **Submission**: Both players upload screenshots/clips to **AWS S3**.
5. **Verification**: **Gemini 1.5 Flash** extracts the outcome. 
   - *Consensus*: Winner takes the pot; ELO is updated.
   - *Conflict*: Match moves to the **Community Tribunal** for fan voting.
6. **Narration**: The **AI Narrator** generates 90s-style victory commentary for the sector.

### Tech Stack
- **Frontend**: Next.js 16 (App Router), React 19, Framer Motion, Tailwind CSS v4.
- **Backend**: Next.js Server Actions, MongoDB with Mongoose (Strict TypeScript).
- **Real-time**: Server-Sent Events (SSE) for Global Ticker, Personal Notifications, and Lobby Chat.
- **Intelligence**: Google Generative AI (Gemini 1.5 Pro & Flash).
- **Mobile**: Progressive Web App (PWA) with Web Push API for lock-screen alerts.

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js** (v20.0.0+)
- **MongoDB** (v6.0+ or Atlas)
- **Gemini API Key** (from Google AI Studio)
- **AWS S3 Bucket** (for proof uploads)

### Installation
1. **Clone the Sector**
   ```bash
   git clone https://github.com/mandozza/p1vsp2.git
   ```
2. **Install Protocols**
   ```bash
   npm install
   ```
3. **Initialize Environment**
   ```bash
   cp .env.example .env.local
   # Add your MONGODB_URI, GEMINI_API_KEY, AWS_ACCESS_KEY, etc.
   ```
4. **Seed the Arena**
   ```bash
   npm run db:seed # Populates demo players and UFC 6 game protocol
   ```
5. **Launch**
   ```bash
   npm run dev
   ```

---

## 🧠 AI Protocol Guide
ProProject is designed for rapid expansion. To add a new game, navigate to the **Admin Game Manager** and define a new **AI Protocol Prompt**:

**Example Madden Prompt:**
> "Analyze this Madden 26 end-game screen. Identify the 'Winner' based on the final score. Extract the 'Home Team Score' and 'Away Team Score'. Check if the game ended via 'Concede' or disconnection."

Gemini will automatically adapt its extraction logic to your instructions.

---

## 📊 Codebase Quality
ProProject is governed by **15+ enforced .mdc rules**, ensuring the highest level of type safety and architectural consistency.

- **Current Line Count**: ~8,500+ lines of TypeScript.
- **Audit Grade**: **10.0 / 10 (A+)** (See `reports/final-project-review.md`).
- **Test Coverage**: Comprehensive E2E "Gauntlet" suite using Playwright.

---

## 🤝 Contributing
Contributions are what make the competitive community thrive.
1. Fork the Project.
2. Create your Sector Branch (`git checkout -b feature/NewGameProtocol`).
3. Commit your Changes (`git commit -m 'feat: add Street Fighter 6 support'`).
4. Push to the Branch (`git push origin feature/NewGameProtocol`).
5. Open a Pull Request.

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

---

**Build Dominance. Verify Victories. Rule the Sector.**
