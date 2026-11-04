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
  header.classList.toggle('show', !e.isIntersecting);
}, { threshold: 0.15 }).observe(document.querySelector('.hero'));
