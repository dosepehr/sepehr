# Sepehr · Synthwave Arcade

Portfolio built as a 3D arcade room (Next.js 16, React Three Fiber, Rapier, GLB models), with a 2D
"Lite" hub and classic pages for phones, crawlers and anyone who prefers plain HTML.
The plan lives in [`docs/sudo-sepehr.md`](docs/sudo-sepehr.md).

```bash
npm install
npm run dev        # http://localhost:3000 → redirects to /en or /fa
npm run typecheck && npm run lint && npm run build
```

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
