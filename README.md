# Sepehr · Portfolio World

Portfolio built as a 3D arcade room (Next.js 16, React Three Fiber, Rapier, GLB models), with a 2D
"Lite" hub and classic pages for phones, crawlers and anyone who prefers plain HTML.
The plan lives in [`docs/sudo-sepehr.md`](docs/sudo-sepehr.md).

```bash
npm install
npm run dev        # http://localhost:3000 → redirects to /en or /fa
npm run typecheck && npm run lint && npm run build
```

## Mushroom world (default 3D)

The 3D view opens in a platformer world built around the two Mario GLBs in `public/models`
(they aren't rigged, so walking, jumping and landing are animated procedurally). Islands run left
to right like a level: ? blocks (About, Resume, Skills, Blog), skill bricks, a pipe per project
(stand on it and press ↓ to warp into the case study), the experience staircase, a flagpole and the
contact castle. There are 40+ coins, 6 hidden power-ups (an invisible block, a secret pipe to a bonus
room, a cloud past the staircase…), enemies to stomp, original chiptune music and sound effects.
Code: `components/Mario3D` (level layout in `level.ts`, physics in `physics.ts`); progress in
`lib/store/mario.ts`; audio in `lib/audio/mario.ts`. The HUD's "Neon arcade" button switches to the
previous synthwave world, which is still described below.

The 2D site (Classic view, phones) uses the same theme: `components/Mario2D`. The global palette is
in `app/globals.css`; `.theme-night` restores the synthwave tokens for the arcade games, the
terminal and the neon candidates in the component lab.

## Explore mode (neon arcade)

The 3D view opens in **Explore**: you walk a robot around the arcade and the neon world outside it
(WASD / arrows, Shift to run, Space to jump, E to use, B to dance, drag to look, scroll to zoom,
click the ground to walk). Anything clickable in the room can also be used with E when you stand
next to it. Outside there are 30 coins, 6 hidden relics (finding all of them turns your robot
gold), kickable balls, teleport pads and the Neon Drive truck. **Tour** switches back to the
hotspot camera. Code lives in `components/World` (layout and colliders in `layout.ts`); progress
is stored in `lib/store/world.ts`. Sound effects are synthesized in `lib/audio/sfx.ts`.

## Editing content

| What | Where |
|---|---|
| Projects (one MDX file = one cabinet) | `content/projects/{en,fa}/<slug>.mdx`, each exports `meta` |
| Blog posts | `content/blog/{en,fa}/<slug>.mdx` |
| Bio, skills, experience, links | `lib/content/profile.ts` |
| UI strings | `app/[lang]/dictionaries/{en,fa}.json` |
| Resume | `public/resume/{en,fa}.pdf` (placeholders now) |

Placeholder copy is marked `TODO`.

## 3D models

Everything in the room is a GLB in `public/models` (credits in `public/models/CREDITS.md`):

- The arcade cabinet, payphone, printer and desk computer are modelled in code:
  `scripts/models/build-cabinet.mjs` and `build-props.mjs`. Tweak and rebuild.
- The robot mascot, boombox and Kenney props (coins, ? block, trophy, drone, Neon Drive truck)
  are CC0 downloads, listed in `scripts/models/fetch-models.mjs`.

```bash
npm run models     # build + download + meshopt-compress everything into public/models
```

Components re-skin models by material name (e.g. `Trim` gets the neon color, `Screen` gets a
shader), so a replacement GLB only needs the same material names. See `components/Arcade/useModel.ts`.

## Component lab

Classic view (and `/en/lab`, `/fa/lab`) is a numbered gallery of 40 candidate sections for the 2D portfolio
(heroes, about, skills, projects, experience, blog, contact), all fed by the real content. Three of
them use [React Flow](https://reactflow.dev). Pick favourites in the page and copy the list. The
sections live in `components/Lab`, registered in `components/Lab/registry.ts`; the Lite hub
(`components/Lite/LiteHub.tsx`) is composed from a few of them, so swapping one in is an import.

## Environment

All optional. Without the Resend vars the contact form shows an error and the direct links still work.

| Variable | Use |
|---|---|
| `NEXT_PUBLIC_APP_BASE_URL` | Canonical URL for metadata, sitemap and JSON-LD |
| `RESEND_API_KEY` | Contact form email delivery |
| `CONTACT_TO_EMAIL` | Where contact messages go |
| `CONTACT_FROM_EMAIL` | Sender, defaults to `Portfolio <onboarding@resend.dev>` |

## Useful flags

- `?view=2d` forces the Lite hub; `?view=3d` forces the room on a capable device.
- `?webgl=off` simulates a device without WebGL2.
- `?tier=high` (or `medium` / `low`) pins the render quality instead of adapting to the frame rate.
- `` ` `` opens the terminal in the room; `Esc` steps back.
