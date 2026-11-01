document.documentElement.classList.add('js');

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.navigation');
const navLinks = document.querySelectorAll('.nav-group a');

toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('menu-open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.querySelector('.sr-only').textContent = open ? 'Zamknij menu' : 'Otwórz menu';
});

navLinks.forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('menu-open');
  toggle.setAttribute('aria-expanded', 'false');
}));

document.querySelectorAll('a[href^="#"]:not(.skip-link)').forEach((link) => {
  link.addEventListener('click', (event) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (!target) return;
    event.preventDefault();
    const start = window.scrollY;
    const destination = target.getBoundingClientRect().top + start - 86;
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1250;
    const startTime = performance.now();
    const ease = (value) => value < .5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;

    const scroll = (now) => {
      const elapsed = duration === 0 ? 1 : Math.min((now - startTime) / duration, 1);
      window.scrollTo(0, start + (destination - start) * ease(elapsed));
      if (elapsed < 1) requestAnimationFrame(scroll);
      else {
        target.classList.add('section-focus');
        setTimeout(() => target.classList.remove('section-focus'), 700);
      }
    };
    requestAnimationFrame(scroll);
  });
});

const sections = document.querySelectorAll('main section');
const reveal = new IntersectionObserver((entries) => {
  entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('is-visible'); });
}, { threshold: 0.12 });
sections.forEach((section) => reveal.observe(section));

const bookingForm = document.querySelector('#booking-form');
bookingForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(bookingForm);
  const subject = `Zapytanie o tatuaż: ${data.get('subject')}`;
  const body = `E-mail: ${data.get('email')}\nTelefon: ${data.get('phone')}\n\nWiadomość:\n${data.get('message')}`;
  window.location.href = `mailto:zojkastudio@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
