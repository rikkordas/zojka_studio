/* Strona działa bez bibliotek: animacje mają prosty fallback dla starszych przeglądarek. */
const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function smoothScroll(target) {
  const header = $('.site-header').offsetHeight;
  const start = scrollY;
  const end = Math.max(0, target.getBoundingClientRect().top + start - header - 14);
  const distance = end - start;
  const duration = Math.min(1800, Math.max(900, Math.abs(distance) * .38));
  const startAt = performance.now(); let cancelled = false;
  const stop = () => { cancelled = true; removeEventListener('wheel', stop); removeEventListener('touchstart', stop); };
  addEventListener('wheel', stop, { once: true, passive: true }); addEventListener('touchstart', stop, { once: true, passive: true });
  const ease = (x) => x < .5 ? 8 * x ** 4 : 1 - ((-2 * x + 2) ** 4) / 2;
  const frame = (now) => { const p = Math.min(1, (now - startAt) / duration); scrollTo(0, start + distance * ease(p)); if (p < 1 && !cancelled) requestAnimationFrame(frame); };
  if (reduceMotion) scrollTo(0, end); else requestAnimationFrame(frame);
}

function initNav() {
  const nav = $('.navigation'); const toggle = $('.menu-toggle'); const links = $$('.nav-group a');
  toggle?.addEventListener('click', () => { const open = nav.classList.toggle('menu-open'); toggle.setAttribute('aria-expanded', String(open)); });
  links.forEach((link) => link.addEventListener('click', (event) => { const target = $(link.hash); if (!target) return; event.preventDefault(); nav.classList.remove('menu-open'); toggle?.setAttribute('aria-expanded', 'false'); smoothScroll(target); }));
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) links.forEach((link) => link.classList.toggle('is-active', link.hash === `#${entry.target.id}`)); }), { rootMargin: '-40% 0px -50% 0px' });
  $$('main section[id]').forEach((section) => observer.observe(section));
}

function initReveals() {
  const elements = $$('section h2, .about-copy, .map-wrap, .care-steps li, .booking-form');
  elements.forEach((element) => element.classList.add('reveal'));
  if (!('IntersectionObserver' in window)) { elements.forEach((element) => element.classList.add('is-visible')); return; }
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: .12 });
  elements.forEach((element) => observer.observe(element));
}

function initAbout() {
  const cards = $$('.about-photo');
  const choose = (card) => { cards.forEach((item) => { const active = item === card; item.classList.toggle('is-active', active); item.setAttribute('aria-pressed', String(active)); }); };
  cards.forEach((card) => card.addEventListener('click', () => choose(card)));
}

function initPortfolio() {
  const cards = $$('.portfolio-gallery .work-card'); const gallery = $('.portfolio-gallery'); const count = $('.portfolio-count'); let visible = 12; let active = 0;
  const more = document.createElement('button'); more.className = 'portfolio-view'; more.type = 'button'; more.textContent = 'Pokaż więcej'; gallery.after(more);
  const paint = () => { cards.forEach((card, index) => card.classList.toggle('is-visible', index < visible)); count.textContent = `${Math.min(visible, cards.length)} / ${cards.length}`; more.hidden = visible >= cards.length; };
  more.addEventListener('click', () => { visible = Math.min(cards.length, visible + 12); paint(); });
  const modal = $('.lightbox'); const image = $('.lightbox img'); const open = (index) => { active = index; const img = $('img', cards[index]); image.src = img.src; image.alt = img.alt; modal.hidden = false; document.body.classList.add('has-lightbox'); $('.lightbox-close').focus(); };
  const close = () => { modal.hidden = true; document.body.classList.remove('has-lightbox'); };
  const step = (change) => open((active + change + cards.length) % cards.length);
  cards.forEach((card, index) => card.addEventListener('click', () => open(index))); $('.lightbox-close').addEventListener('click', close); $('.lightbox-prev').addEventListener('click', () => step(-1)); $('.lightbox-next').addEventListener('click', () => step(1)); modal.addEventListener('click', (event) => { if (event.target === modal) close(); });
  addEventListener('keydown', (event) => { if (modal.hidden) return; if (event.key === 'Escape') close(); if (event.key === 'ArrowLeft') step(-1); if (event.key === 'ArrowRight') step(1); }); paint();
}

function initBooking() {
  const form = $('#booking-form'); if (!form) return;
  form.addEventListener('submit', (event) => { event.preventDefault(); if (!form.checkValidity()) return form.reportValidity(); const data = new FormData(form); location.href = `mailto:kurczynska.sonia@gmail.com?subject=${encodeURIComponent(`Zapytanie o tatuaż: ${data.get('subject')}`)}&body=${encodeURIComponent(`E-mail: ${data.get('email')}\nTelefon: ${data.get('phone')}\n\nWiadomość:\n${data.get('message')}`)}`; });
}

function initFooter() { $('.footer-logo')?.addEventListener('click', (event) => { event.preventDefault(); smoothScroll($('#top')); }); }
initNav(); initReveals(); initAbout(); initPortfolio(); initBooking(); initFooter();
