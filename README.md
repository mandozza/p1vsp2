# ProProject Boilerplate

A high-fidelity, production-ready starting point for modern full-stack applications.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, React 19, Server Components) |
| Styling | Tailwind CSS v4 + shadcn/ui + Framer Motion |
| Database | MongoDB + Mongoose (strict TypeScript, atomic updates) |
| Auth | NextAuth.js v4 (Credentials provider, JWT sessions) |
| Validation | Zod schemas at every boundary |
| Communication | WebSockets + SSE (Server-Sent Events) |
| Infrastructure | AWS S3 for storage |
| AI | Gemini API Integration |
| Testing | Vitest + Playwright |

---

## Features Built-in

- **Beta Gate**: Invite-only access control via secure codes and cookies.
- **Journey Tracking**: Silent chronological path logging for user analytics.
- **Admin Command Center**: Multi-role dashboards for logistics and intelligence.
- **Real-time Engine**: SSE and WebSocket plumbing for interactive states.
- **AI Integration**: Background agent loops ready for Gemini commentary or logic.
- **Governance**: 15+ enforced `.mdc` rules to maintain 10/10 quality.

---

## Getting Started

1. `npm install`
2. `cp .env.example .env.local`
3. Define your models in `src/models/`
4. Run development: `npm run dev`
