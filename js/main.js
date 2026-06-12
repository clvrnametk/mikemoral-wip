/* =============================================
   main.js — mikemoral.es
   GSAP entrance + scroll system
   No scroll-jacking. Motion serves the content.
============================================= */

document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';

  /* ── Nav background: scroll-driven, 0–60px range ────────── */
  const nav = document.querySelector('.site-nav');
  if (nav) {
    const updateNav = () => {
      const p = Math.min(window.scrollY / 60, 1);
      nav.style.backgroundColor = 'rgba(15, 15, 60, ' + p + ')';
    };
    updateNav();
    window.addEventListener('scroll', updateNav, { passive: true });
  }

  /* ── Notes filter buttons (visual toggle only) ──────────── */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  /* ── Footer LinkedIn: open in new tab ───────────────────── */
  document.querySelectorAll('a[href*="linkedin.com"]').forEach(a => {
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
  });

  if (!hasGsap || reduceMotion) return;

  /* ── Hero headline: split into words, stagger reveal ────── */
  const heroTitle = document.querySelector('.hero h1');
  if (heroTitle && !heroTitle.dataset.split) {
    const words = heroTitle.textContent.trim().split(/\s+/);
    heroTitle.textContent = '';
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.className = 'w';
      span.textContent = word;
      heroTitle.appendChild(span);
      if (i < words.length - 1) heroTitle.appendChild(document.createTextNode(' '));
    });
    heroTitle.dataset.split = 'true';
  }

  const heroIntro = gsap.timeline({ defaults: { ease: 'power3.out' } });

  if (heroTitle) {
    heroIntro.from('.hero h1 .w', {
      y: 40,
      autoAlpha: 0,
      duration: 0.8,
      stagger: 0.08
    });
  }

  const heroFades = document.querySelectorAll('.hero [data-hero-fade]');
  if (heroFades.length) {
    heroIntro.from(heroFades, {
      y: 24,
      autoAlpha: 0,
      duration: 0.7,
      stagger: 0.1
    }, heroTitle ? '-=0.45' : 0);
  }

  const heroScroll = document.querySelector('.hero-scroll');
  if (heroScroll) {
    heroIntro.from(heroScroll, { autoAlpha: 0, duration: 0.9 }, '-=0.2');
  }

  /* ── Section content: fade up on scroll-enter ───────────── */
  if (typeof window.ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  const revealTargets = document.querySelectorAll([
    '[data-reveal]',
    '.cs-outcome',
    '.cs-meta',
    '.cs-body > *',
    '.note-body > *',
    '.work-entry',
    '.note-entry',
    '.related-section'
  ].join(', '));

  revealTargets.forEach(el => {
    gsap.from(el, {
      y: 32,
      autoAlpha: 0,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true
      }
    });
  });

});
