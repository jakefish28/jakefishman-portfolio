# Implement Jake Fishman Portfolio (from Claude Design)

Source: Claude Design project "Jake's Portfolio Prototype" (`f53455d8-647d-4d36-96c5-26a0152c0495`), file `Jake Fishman Portfolio.dc.html`.

## Plan
- [x] Pull design source via DesignSync (project + `.dc.html` content)
- [x] Attempt to pull real reference images from `.image-slots.state.json` — file exceeds the 256KB `get_file` cap and can't be paginated; the Claude Design site also isn't reachable from this browser session (not logged in). Using styled placeholder tiles with caption labels instead (same fallback look the design already uses), so Jake can drop in real images later.
- [x] Build `index.html` — semantic markup for all sections (nav, hero/about, about strip, résumé timeline, Concept Art House showcase, Bailey Brand Management showcase, ventures, side projects, skills, life, contact, footer)
- [x] Build `styles.css` — design tokens (clay/green/ecru palette, Playfair Display/Inter/DM Mono), responsive rules, hover states
- [x] Build `script.js` — mobile nav toggle, scroll-reveal via IntersectionObserver
- [x] Serve locally and visually check desktop + mobile
- [x] Review section below

## Review

Built a static, dependency-free 3-file site (`index.html`, `styles.css`, `script.js`) that faithfully implements every section of the current `.dc.html` design: hero/about stats, résumé timeline, Concept Art House showcase, Bailey Brand Management showcase, Ventures (NADefense/Sight Guard + CaddySpace), side projects, skills toolkit, life/outside, and contact.

**Bug caught during visual QA:** the mobile menu's `display: flex` CSS rule was overriding the `hidden` attribute, so the full-screen nav overlay showed on load at mobile widths. Fixed with an explicit `.mobile-menu[hidden] { display: none; }` rule. Verified fix + hamburger toggle at 375px and full desktop layout at 1440px via the local preview server.

**Images:** the design's `image-slot` reference photos (Diablo 4 key art, celebrity campaign shots, etc.) live in `.image-slots.state.json`, which exceeds the 256KB single-file read cap and can't be paginated, and the live claude.ai/design page isn't reachable from this browser session (not logged in). Used elegant labeled placeholder tiles (matching the design's own fallback style) in their place — drop real photos into an `images/` folder and swap the `.work-thumb`/`.venture-thumb`/`.project-thumb` divs for `<img>` tags whenever those are ready.

No framework/build step — open `index.html` directly or serve the folder with any static file server.
