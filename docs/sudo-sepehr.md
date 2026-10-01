# Plan: Synthwave Arcade Portfolio (Next.js 16 + React Three Fiber)

## Context

Sepehr (frontend/fullstack dev) wants a portfolio that is memorable rather than a template: a **3D arcade/game-console room** in a **neon synthwave** style, with **playable games, physics toys and hidden easter-egg quests**. Choices from the Q&A:

| Topic | Decision |
|---|---|
| Concept | Arcade room (Three.js). Cabinets = projects, CRT desk = about/terminal, etc. |
| Style | Neon synthwave / cyberpunk (bloom, grid, glow) |
| Games | Skill-themed mini-games, 3D physics toy, hidden easter-egg quests |
| Content | Projects/case studies, About + skills + experience, Contact + resume, Blog |
| Languages | English + Persian (RTL) |
| Mobile | "Lite": no WebGL, 2D neon hub with the same content |
| 3D assets | 100% procedural (primitives, shaders, canvas textures), no model files |
| Blog | MDX files in the repo |

Starting point: a fresh Next 16.3.6 / React 19.2.8 / Tailwind 4 / shadcn scaffold with an unused template layer (axios, react-query, PWA helpers, a big `components/ui` library). No 3D code exists yet. `app/page.tsx` has one uncommitted line (Button import path). The plan replaces that file, so nothing is lost.

**Guiding principles**
1. **Content is single-source, with two presentation layers.** Typed content (MDX + dictionaries) feeds both the 3D room and plain 2D pages. 2D pages give SEO, accessibility, the mobile Lite mode and a "Classic view" escape hatch for recruiters.
2. **Ship in vertical slices.** The site is usable and deployable after Phase 2, before any 3D exists.
3. **3D is lazy and optional.** The three.js chunk loads only on capable desktop devices. It never loads on Lite, in `prefers-reduced-motion` low-power cases, or when WebGL fails.
4. **Prose lives in the DOM, not in WebGL.** Persian shaping and RTL are free in the DOM. In-scene text is limited to short labels.

## Architecture

```
proxy.ts                         locale redirect (cookie -> Accept-Language -> en)
mdx-components.tsx               required by @next/mdx (App Router)
content/{blog,projects}/{en,fa}/<slug>.mdx     each exports `meta`
app/[lang]/                      root layout lives here (per Next i18n guide)
  layout.tsx page.tsx            html lang/dir, fonts, providers; hub (Experience switch)
  dictionaries.ts + dictionaries/{en,fa}.json
  projects/[slug]  blog  blog/[slug]  about  contact  secret   (2D pages)
  opengraph-image.tsx  (+ app/sitemap.ts, app/robots.ts)
components/                      (repo convention: PascalCase folder, index.tsx default export, *.types.ts)
  Arcade/    Experience (client; picks full vs lite), Scene, Room, Cabinet, CrtDesk,
             CameraRig, Hotspots, Effects, PhysicsToy, Loader, hotspots.ts (id -> camera pose)
  Games/     GameShell, TechCatcher, BugBlaster, NeonDrive (3D), engine/ (loop, input, canvas)
  Hud/       Hud, Nav, QuestTracker, Terminal, SoundToggle, LocaleSwitch, ClassicViewLink
  Lite/      LiteHub (2D neon menu)
  Panels/    neon Dialog panels reusing the same content components as the 2D pages
lib/
  content/   getProjects / getPosts / getProfile (fs listing + dynamic import of MDX)
  quests.ts  store/{stage,quests,audio,scores}.ts  audio/sfx.ts  hooks/useExperience.ts
```

**Routing and i18n (native Next 16, no next-intl).** Follow `node_modules/next/dist/docs/01-app/02-guides/internationalization.md`:
- `proxy.ts` (Next 16 name for middleware) redirects locale-less paths. It parses Accept-Language by hand for the two locales, so no extra deps. The matcher skips `_next`, files and `api`.
- Move `app/layout.tsx` and `app/page.tsx` into `app/[lang]/`.
- `hasLocale()` + `notFound()` guard bad locales.
- `next/root-params` (`lang()`) gives the locale in deep server components. No config flag was found in the docs.
- Layout sets `<html lang dir>`.
- Client components (HUD, panels) get strings through a small `DictionaryProvider`; the JSON is tiny.
- RTL: Tailwind logical utilities (`ms-/ps-/start-/end-`) in all new DOM code. Wrap the app in the existing `components/ui/direction` `DirectionProvider`. Set `components.json` `"rtl": true` so future shadcn adds are RTL-aware. The 3D room is **not** mirrored; the DOM overlays are.
- Fonts via `next/font/google`: Geist (already there) + a synthwave display face for `en`; Vazirmatn for `fa`.

**Blog and case studies (MDX).** Follow `docs/01-app/02-guides/mdx.md`:
- Add `@next/mdx` with `pageExtensions` including mdx.
- Each file does `export const meta = {title, date, summary, tags, ...}`; no remark frontmatter plugins needed. Turbopack can't take function plugins, so avoid plugins.
- Index pages list slugs with `fs` on the server. Detail pages do `await import(`@/content/blog/${lang}/${slug}.mdx`)` with `generateStaticParams` and `dynamicParams = false`.
- Style MDX through `mdx-components.tsx`. Cabinets in the 3D room are generated from `getProjects(lang)`, so adding a project file adds a cabinet.

**Experience switch (`useExperience`).** Returns `pending | full | lite`. It is `lite` when any of these is true: viewport under 768px, `pointer: coarse`, no WebGL2, or `?view=2d` / persisted "Classic view". `pending` renders only a server-rendered hero and a CSS neon-grid backdrop, so the heavy canvas never mounts and then swaps. The existing `lib/hooks/useIsMobile.ts` defaults to a 1280px breakpoint, so call it with 768 or write a sibling hook. `Experience` is a client component that does `next/dynamic(() => import('./Scene'), { ssr: false })` (per `docs/.../lazy-loading.md`, `ssr:false` must live in a Client Component), wrapped in the existing `components/ui/ErrorBoundary`, whose fallback flips to Lite on WebGL failure.

**3D room.**
- Stack: `three`, `@react-three/fiber` 9 (peer: React `>=19 <19.4`; we have 19.2.8), `@react-three/drei` 10, `@react-three/rapier` 2, `@react-three/postprocessing` 3 + `postprocessing`.
- Composition: reflective-looking neon grid floor, wall neon strips, back-wall name marquee. Left side: blog rack (VHS/newspaper stand). Center: project cabinets. Right: CRT desk (About + terminal) and a high-score board (skills). Front: payphone/mailbox (contact), printer (resume download), physics corner.
- Lighting is fake: emissive materials + Bloom + at most 2-3 real lights; one `ContactShadows`; instancing for repeated strips.
- Camera: drei `CameraControls`; `setLookAt(..., true)` to hotspot poses from `hotspots.ts`; idle pointer parallax; Esc returns to overview.
- Interaction: hover glow + cursor change; click focuses the hotspot and opens its overlay panel.
- Overlay panels are neon-styled Radix `Dialog`s (existing `components/ui/Dialog`) for focus trap and aria. They reuse the 2D page content components and animate with `motion`.
- In-scene labels use a `useCanvasTexture(text)` helper (Canvas2D → texture). The browser handles Persian shaping/bidi correctly. Do a Persian-label spike before building anything that depends on `drei <Text>`.
- Perf tiers `high | medium | low`: seeded from DPR/`hardwareConcurrency`/`deviceMemory`, then adjusted by drei `PerformanceMonitor`. Tiers control DPR, Bloom, reflector, particles and AA. Set `frameloop` to `never` while a 2D game covers the canvas.
- Loading: an `Arcade/Loader` splash built on the existing `Progress`/`Spinner`. Assets are fonts and procedural data only, so loading is fast.

**Games.**
- Presentation: clicking a cabinet dollies the camera into its screen, then crossfades to a fullscreen `GameShell` (Esc exits). Cabinet screens show a procedural attract-mode shader. 2D games stay playable in Lite.
- Engine: `lib`/`engine` has a fixed-timestep rAF loop, a keyboard + pointer/touch input abstraction, a DPR-aware canvas hook, auto-pause on blur/`visibilitychange`, touch D-pad on coarse pointers, and mute/pause/restart. **Game rules are pure functions** (`logic.ts`) so they can be unit-tested.
- Game 1, **Tech Catcher** (2D): catch falling stack icons (React, Next, TS, Node, Postgres...), dodge "bugs". Each icon caught unlocks that skill's entry in the skills board.
- Game 2, **Bug Blaster** (2D): invaders are `undefined`, `NaN`, `404`, `null`; you shoot semicolons; the boss is "Friday deploy".
- Game 3, **Neon Drive** (3D, desktop only): synthwave endless runner in the same Canvas. The Room unmounts while it runs; chase camera; 3 lanes; instanced obstacles. Hidden on Lite since no three.js loads there.
- High scores in `localStorage` through a persisted store.

**Physics toy (rapier).** "Stack Jenga": a tower of tech-logo blocks. Click-drag fires a ball, so you knock the stack over. Fixed timestep, sleeping bodies, and a block cap keep it cheap. Stretch: a coin-drop that starts a cabinet.

**Easter-egg quests.** A persisted zustand store (`lib/store/quests.ts`) with `discover(id)`. Discovery fires a sonner toast (the repo has `components/ui/Toast`) plus a synthesized SFX. The HUD shows `Secrets n/7` with vague clues. Initial set:
1. Konami code recolors the room to a vaporwave sunset.
2. Click the "OUT OF ORDER" cabinet 5 times and it boots.
3. `sudo hire-me` in the terminal.
4. A golden coin hidden in the physics blocks.
5. A score of 1337 or more in any 2D game.
6. A clue in the browser console (ASCII art + `secret()`).
7. A rare neon cat on the roof.

Reward when all 7 are found: a **secret cabinet** (bonus game mode) and `/[lang]/secret` (behind-the-scenes page + Hall of Fame). **Contact details and the form are never gated**, because a recruiter must be able to reach you.

**Terminal (CRT desk).** A DOM overlay with commands `help, about, skills, projects, blog, contact, lang, theme, sudo hire-me`. It doubles as full keyboard navigation of the site.

**Audio.** Procedural WebAudio chiptune SFX (no asset files). Muted by default (autoplay policy and courtesy); toggle in the HUD and persisted. Background music is optional and needs a CC0 loop that you pick.

**Contact.** `react-hook-form` + `zod` + existing `Field/Input/Textarea/Button` → a Server Action → Resend. Add a honeypot and a minimum-time check. Always show email/GitHub/LinkedIn as plain links. `public/resume/{en,fa}.pdf` is served by the printer hotspot and a link.

**Theme/styling.** Dark-only synthwave. Rewrite the `.dark`/`:root` tokens in `app/globals.css` to oklch indigo/magenta/cyan, add `--neon-*` tokens and `@utility` helpers (glow text/borders, scanlines). Set `forcedTheme="dark"`.
**Conflict to fix:** `components/theme-provider.tsx` has a `ThemeHotkey` that toggles the theme on the **`d`** key. It would fire during games and WASD, so remove it.

**Existing code to reuse:** `Button`, `Dialog`, `Tooltip`, `Kbd` (shows key hints in the HUD), `ErrorBoundary`, `Toast`, `Skeleton/Spinner/Progress`, `Field/Input/Textarea`, `Badge/Card/Tabs`, `direction`, `useIsMobile`, `lib/funcs/cn.ts`, `lib/store/createStore.ts` (zustand + devtools), `motion`, `sonner`, `react-hook-form`, `zod`.
**Left untouched and unwired:** axios/react-query stack (`lib/api/*`), PWA/service-worker helpers. `lib/env.ts` is only imported by that API layer, so it won't throw. I'll extend its schema for `NEXT_PUBLIC_APP_BASE_URL`, `RESEND_API_KEY` and `CONTACT_TO_EMAIL`, and make `BACKEND_URL` optional.

## Phases

0. **Foundations.** Install deps (3D stack, `@next/mdx @mdx-js/loader @mdx-js/react @types/mdx`, `resend`). Add `proxy.ts`. Move into `app/[lang]`. Add dictionaries/`DictionaryProvider`/fonts/`dir`/`DirectionProvider`. Retheme tokens. Remove the `d` hotkey. Mount `Toaster`. Add `createPersistedStore` next to `createStore` (same devtools config). *Spike: Persian label via canvas texture.*
1. **Content layer.** `next.config.ts` with `withMDX`, `mdx-components.tsx`, `lib/content/*`, placeholder MDX for 3-4 projects and 2 posts per locale (clearly marked TODO).
2. **Classic 2D site + Lite hub.** Projects, blog, about, contact (+ form action), `LiteHub`, locale switch, Classic-view toggle. **First deployable milestone.**
3. **3D room.** Scene, Room, procedural cabinets/desk/props, `CameraRig`, hotspots + panels, Effects, perf tiers, Loader, `useExperience`, error fallback to Lite.
4. **HUD, terminal, audio.** Nav list (keyboard path to every hotspot), terminal, sound toggle, quest tracker shell.
5. **Games.** Engine + GameShell → Tech Catcher → Bug Blaster → Neon Drive.
6. **Physics toy.**
7. **Quests and secret.** All 7 eggs, secret cabinet, `/secret`.
8. **Polish.** `generateMetadata` + hreflang alternates, `sitemap.ts`, `robots.ts`, `opengraph-image.tsx`, JSON-LD `Person` (`docs/.../json-ld.md`), a11y pass, perf pass, deploy (Vercel).

## Conventions and gotchas

- **Read the matching doc in `node_modules/next/dist/docs/` before each Next-specific piece**, per AGENTS.md: proxy, internationalization, mdx, lazy-loading, metadata-and-og-images, json-ld, `next/root-params`. Also check how `not-found` behaves when the root layout sits in a dynamic segment.
- Follow the existing component layout (PascalCase folder, `index.tsx` default export, `*.types.ts`).
- **Formatting:** existing `components/ui` and `lib` files use 4-space/single-quote/semicolons while `.prettierrc` says 2-space/no-semi/double-quote. Running `npm run format` would rewrite ~100 files. Run `npx prettier --write` only on new or changed files.
- Mark every R3F-touching file `'use client'`; keep `three` out of server code. Do not enable the React Compiler (it fights imperative `useFrame` mutation).
- Everything hot-path in `useFrame` must avoid allocation and React state. Use refs and zustand's `getState()`.
- `prefers-reduced-motion`: cut instead of ease, reduce flicker/bloom pulsing, disable camera drift.

## Verification

- Static: `npm run typecheck`, `npm run lint`, `npm run build` (confirm the `/[lang]` routes prerender and MDX compiles under Turbopack).
- Run `npm run dev` and drive it in the browser (the `run`/browser skills):
  - `/` redirects to `/en` or `/fa` by Accept-Language/cookie; `/fa` is RTL with Vazirmatn; labels in the 3D room render correct Persian.
  - Desktop: room loads, every hotspot focuses the camera and opens its panel, Esc returns, "Classic view" works. Every cabinet launches its game and exits cleanly with no console errors.
  - Network tab: no `three`/R3F chunk on `/en/blog` or in Lite.
  - Emulate a phone (DevTools): Lite hub appears, 2D games are playable by touch, no canvas mounted.
  - Force failure (`?webgl=off` dev flag or blocking WebGL): fallback to Lite.
  - Performance: drei `Stats` on a mid-tier profile is steady near 60fps at `medium`; the tier drops automatically under CPU throttling. Lighthouse: ≥90 on blog/lite pages.
  - Quests: discover each egg, reload to confirm persistence, and confirm the secret cabinet and `/secret` unlock only after all 7.
  - Contact form: validation errors, honeypot rejection, and a successful send with a test Resend key.
  - Keyboard-only run (Tab through the HUD nav) and a reduced-motion run.
- Optional: add Vitest for pure logic only (`quests` store, `TechCatcher/logic`, `BugBlaster/logic`) so game rules stay regression-proof.

## Assumptions to veto at approval, and inputs needed later

Assumptions I made:
- Contact is never gated behind quests.
- Neon Drive (a real 3D game) is in scope.
- Native Next i18n instead of next-intl.
- Resend for email.
- Procedural WebAudio SFX, with music optional.
- PWA/API scaffolding stays unused.

I'll scaffold with placeholder content. Later I'll need from you:
- Real bio, project write-ups, skills list and work history.
- Social links.
- Resume PDFs (en/fa).
- A Resend API key and the destination email.
- Review of the Persian copy.
- An optional CC0 music loop.
