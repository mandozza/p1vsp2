# AI Developer Instructions (AGENTS.md)

Welcome, AI Coding Assistant! To ensure you write clean, compliant, and type-safe code for **ProProject**, you MUST adhere to the following rules and structural patterns:

---

## ⚡ 1. Read & Follow Custom Rules First
*   Before writing any code, examine the rules inside the **`rules/`** directory. These files establish strict standards for Mongoose, TypeScript, React/Next.js App Router, Shadcn UI, Storybook, Git strategy, and Docblocks.
*   **Planning First**: You cannot start coding a new feature until a design plan is drafted in `plans/future/[feature-name].md` using the exact format of `plans/future/_template.md` and approved by the user.

---

## 🏗️ 2. Core Architecture & Stack Conventions
*   **Next.js App Router**: Build pages and layouts in `src/app/` using React Server Components (RSC) by default. Use Client Components (`"use client"`) strictly when client state or interactivity is required.
*   **Styling**: Use **Tailwind CSS v4 + Shadcn UI** for all styling. Never generate custom CSS or write Vanilla CSS. Note that Tailwind CSS v4 configures themes in `src/app/globals.css` using the `@theme` directive (do not create an obsolete `tailwind.config.js` file).
*   **Database**: Always connect to MongoDB using the cached connection wrapper in **`src/lib/db.ts`** to avoid connection pool leaks in Next.js hot-reload dev servers. Never perform direct MongoDB calls; always use Mongoose.
*   **Runtime Input Validation**: Validate all inputs at API endpoints or Server Action boundaries using **Zod** schemas.
*   **UI/UX "Make Pro"**: Always prioritize high-fidelity aesthetics. Use Framer Motion for transitions, Mesh Gradient backgrounds, and custom loading skeletons as established in the design system.

---

## 🔐 3. Authentication, Beta Gate & Route Protection
*   **Beta Gate**: The platform is protected by an invite-only gate. Middleware redirects users without the `pro-project_beta_access` cookie to `/beta`. Ensure all new public-facing pages are included in the middleware matcher.
*   **NextAuth.js**: Standard authentication options are defined in **`src/lib/auth.ts`**.
*   **User Journeys**: Every page transition MUST be tracked via the `<BetaTracker />` in the root layout. If adding custom tracking events, use the `trackPageView` server action.
*   **Route Protection**: Standard protected pages (`/dashboard`, `/admin`, `/profile`) are guarded in **`src/middleware.ts`**.

---

## 🤖 4. AI Narrator & Background Engines
*   **The Narrator**: Our Gemini-powered AI agent reacts to live events. 
    *   **Victory Commentary**: Every verified match automatically triggers the Narrator (Gemini 1.5 Flash) to generate 90s arcade-style commentary.
    *   **Background Watcher**: Ensure any new major platform event (e.g., a new machine type, a rare prize catch) is hooked into the `narrator-engine.ts` watcher.
*   **Background Processes**: The arcade relies on multiple engines (`hardware-simulator`, `narrator-engine`). Always ensure your changes don't break the event-driven communication (Change Streams/SSE) between these engines and the UI.

---

## 🔷 5. TypeScript & Mongoose Guidelines
*   **Zero `any`**: Avoid `any` under all circumstances. Use Zod schemas paired with `z.infer` for type casting and validation boundaries.
*   **Safe Mongoose `.lean()`**: When executing read queries, always append `.lean<InterfaceName>()` and explicitly type query results using your base domain interface to strip Mongoose document properties safely.
*   **Reference Implementation**: See **`src/models/User.ts`** for a flawless template of a co-located Mongoose schema, TypeScript interface declarations, and Zod validation parsing.
