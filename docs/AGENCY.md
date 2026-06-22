# Creative Studio Specification

## Overview

Creative Studio is a static marketing site for Infinite Thinking, a Geneva-based studio focused on brand, digital experiences, and workflow design. The site presents the studio's positioning, service pillars, philosophy, working process, and a contact call-to-action.

The project is implemented with Astro and Tailwind CSS and is intended to build to static assets.

## Goals

- Communicate Infinite Thinking's core message: form and function are one.
- Present three primary service pillars: Design, Efficiency, and Ease.
- Explain the studio's working process from discovery through deployment.
- Encourage qualified visitors to start a conversation through the contact CTA.
- Keep the site fast, responsive, and deployable as a static build.

## Technology

- Framework: Astro
- Styling: Tailwind CSS integration plus global CSS custom properties
- Language mode: ES modules
- Build output: static files in `dist/`

Primary npm scripts:

```bash
npm run dev
npm run build
npm run preview
```

## Routing and Information Architecture

The current site has one public route:

- `/` - homepage composed from Astro components in `src/pages/index.astro`

Homepage sections:

1. Navigation
2. Hero
3. Service marquee
4. Service pillars
5. Philosophy
6. Process
7. Contact CTA
8. Footer

## Project Structure

```text
src/
  components/
    Nav.astro          Fixed top navigation
    Hero.astro         Animated dot-field hero
    Marquee.astro      Scrolling service ticker
    Services.astro     Three service pillar cards
    Philosophy.astro   Dark manifesto/statistics section
    Process.astro      Four-step process grid
    CTA.astro          Contact call-to-action and modal form
    Footer.astro       Footer and copyright area
  layouts/
    Base.astro         HTML shell, metadata, global styles, reveal behavior
  pages/
    index.astro        Homepage composition
  styles/
    global.css         Design tokens, reset, base styles, animations
```

## Design System

Global design tokens are defined in `src/styles/global.css`.

| Token | Value | Purpose |
| --- | --- | --- |
| `--ink` | `#0d0d0b` | Primary text and dark backgrounds |
| `--paper` | `#f5f2ec` | Main page background |
| `--paper-warm` | `#ede9e0` | Warm section and hover background |
| `--accent` | `#c8a96e` | Gold accents, borders, animated highlights |
| `--accent-dark` | `#9c7d47` | Dark gold text accents |
| `--muted` | `#7a7670` | Secondary text |
| `--line` | `rgba(13,13,11,0.12)` | Borders and dividers |

Typography:

- Serif display/body: Cormorant Garamond
- Monospace labels/navigation: DM Mono

Layout expectations:

- Desktop sections use generous spacing and grid-based layouts.
- Responsive breakpoints collapse multi-column layouts below `900px`.
- Horizontal overflow should be avoided.

## Functional Requirements

### Navigation

- Navigation remains fixed at the top of the viewport.
- Navigation links scroll to in-page sections.
- Navigation changes theme when overlapping dark sections such as Philosophy and Footer.
- Mobile navigation hides the link list below the existing responsive breakpoint.

### Hero

- The hero occupies at least the full viewport height.
- The animated canvas renders a dot field behind the hero copy.
- Dots avoid text exclusion zones so headings remain readable.
- Pointer movement repels nearby dots on pointer-capable devices.
- The hero includes a CTA link to the services area.

### Services

- The services section presents three pillars:
  - Design for credibility
  - Efficiency by design
  - Ease that retains
- Each card includes a number, title, description, and tags.
- Cards show an accent interaction on hover.

### Philosophy

- The section uses the dark `--ink` background.
- It reinforces the "Form and function are one" message.
- It includes supporting body copy and four statistics.

### Process

- The process section presents four steps:
  - Discover
  - Define
  - Design
  - Deploy
- Each step includes a short explanation.

### Contact CTA

- The CTA opens a native `dialog` modal.
- The contact form collects name, phone number, email, and message.
- Form submission creates a `mailto:` URL to `hello@infinitethinking.studio`.
- The modal can be closed by the close button, cancel button, or backdrop click.

## Accessibility and UX Requirements

- The base layout must include viewport and description metadata.
- The contact dialog must retain an accessible label through `aria-labelledby`.
- Interactive elements must be keyboard reachable.
- Text contrast should remain legible against paper and dark backgrounds.
- Motion should not obscure core content; copy remains present as HTML text.

## Performance Requirements

- The site should remain static-build friendly.
- Client-side JavaScript should stay scoped to interactions that need it:
  - scroll reveal
  - custom cursor
  - hero canvas animation
  - navigation theme updates
  - contact modal behavior
- Images or media added later should be optimized before deployment.

## Deployment

Astro builds the site into `dist/`.

Recommended production settings:

- Build command: `npm run build`
- Output directory: `dist`

The Astro config currently defines:

- `site`: `https://infinitethinking.studio`
- `base`: `/Creative-Studio`

Deploy targets such as Vercel, Netlify, and GitHub Pages should use the same build command and output directory.

## Acceptance Criteria

- `npm run build` completes successfully.
- The homepage renders all listed sections in order.
- In-page navigation links scroll to their target sections.
- The hero animation does not cover or reduce readability of hero text.
- The contact modal opens, closes, validates required fields, and generates a mailto enquiry.
- Layout remains usable on desktop and mobile widths.
