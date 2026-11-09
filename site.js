// Scoreboard rail: one entry per section, highlighting the one in view.
const sections = [...document.querySelectorAll('[data-score]')];
const rail = document.querySelector('.score');
const items = sections.map((s) => {
  const li = document.createElement('li');
  li.innerHTML = `<a href="#${s.id}"><b>${s.dataset.score}</b><span>${s.dataset.label}</span></a>`;
  rail.appendChild(li);
  return li;
});

const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    items.forEach((li, i) => li.classList.toggle('on', sections[i] === e.target));
  }
}, { rootMargin: '-45% 0px -55% 0px' });
sections.forEach((s) => io.observe(s));

// The top bar appears once the hero has scrolled away.
const header = document.querySelector('.topbar');
new IntersectionObserver(([e]) => {
  header.classList.toggle('show', e.intersectionRatio < 0.15);
}, { threshold: 0.15 }).observe(document.querySelector('.hero'));

// The 3D court is decoration: load it after the page has painted so the text
// and links are ready first. If it can't load, the hero stays solid clay.
const loadCourt = () => import('./court.js').catch(() => document.body.classList.add('no-webgl'));
addEventListener('load', () => {
  if ('requestIdleCallback' in window) requestIdleCallback(loadCourt, { timeout: 1500 });
  else setTimeout(loadCourt, 200);
});
