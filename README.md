# Infinite Thinking — Creative Studio

**infinitethinking.studio** — Brand · Digital · Workflows, Geneva

Built with [Astro](https://astro.build) + Tailwind CSS.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # production build → dist/
npm run preview    # preview the build locally
```

## Project structure

```
src/
├── components/
│   ├── Nav.astro          # Fixed top navigation
│   ├── Hero.astro         # Full-width wave dot hero + canvas
│   ├── Marquee.astro      # Scrolling service ticker
│   ├── Services.astro     # Three service pillars
│   ├── Philosophy.astro   # Dark manifesto section
│   ├── Process.astro      # Four-step process grid
│   ├── CTA.astro          # Contact call-to-action
│   └── Footer.astro       # Footer + copyright bar
├── layouts/
│   └── Base.astro         # HTML shell, cursor, scroll reveal
├── pages/
│   └── index.astro        # Homepage — composes all sections
└── styles/
    └── global.css         # Design tokens, base reset, animations
```

## Design tokens

All colours are CSS custom properties defined in `src/styles/global.css`:

| Token           | Value     | Use                        |
|-----------------|-----------|----------------------------|
| `--ink`         | `#0d0d0b` | Primary text, backgrounds  |
| `--paper`       | `#f5f2ec` | Page background            |
| `--paper-warm`  | `#ede9e0` | Hover states, CTA bg       |
| `--accent`      | `#c8a96e` | Gold — wave peaks, borders |
| `--accent-dark` | `#9c7d47` | Gold — text, italic titles |
| `--muted`       | `#7a7670` | Secondary text             |
| `--line`        | `rgba(13,13,11,0.12)` | Borders, dividers |

## Deploy

Push to `main` → connect repo to [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
Both detect Astro automatically. Build command: `npm run build`, output: `dist/`.
