# Editorial redesign of jakefishman.com (branch: redesign-editorial)

## Plan
- [x] Pull latest live content (site had been edited via Vercel/GitHub since last session)
- [x] Research reference personal sites (patrickcollison.com, nat.org, paco.me, rauno.me, craigmod.com, sive.rs, frankchimero.com)
- [x] Audit current site against the brief's constraints
- [x] Rebuild: one serif (Newsreader), four colors, margin-column ledger grid, no nav/cards/tags/italics/emoji/animation
- [x] Collapse Resumé + Studio + Brands + Ventures into one reverse-chronological Work ledger
- [x] Drop Toolkit (skill pills) and the stat-card grid; fold the "I don't specialize" line into the intro
- [x] Serve images from the repo (Vercel is Git-connected now) instead of jsDelivr
- [x] Remove script.js (nav toggle + reveal animations no longer exist)
- [x] Regenerate OG image to match (still centered name, per Jake's earlier request)
- [x] Verify desktop (1440) and mobile (375): no overflow, spacing, image crops
- [ ] Jake reviews the Vercel preview, then merge to main

## Review
- Pass 1 bug: `.section > .row + .entry` matched every entry (entries are rows), collapsing the space between them. Fixed with an explicit `.section-label + .entry`.
- Pass 1 issue: venture photos too dominant (portrait CaddySpace shot ~680px tall). Now 4:3 crops capped at 440px.
- Content conflict on the old site: the CaddySpace timeline said it recouped its investment in 12 months; the earlier venture card said six months; the newest revision dropped the claim and calls it paused, not sunset. Redesign follows the newest revision and omits the payback figure until Jake confirms it.
