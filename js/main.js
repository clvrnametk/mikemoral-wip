/* =============================================
   main.js — mikemoral.es
   GSAP entrance + scroll system
   No scroll-jacking. Motion serves the content.
============================================= */

document.addEventListener('DOMContentLoaded', () => {

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined';

  /* ── Preloader (index only, first visit per session) ────── */
  const preloader = document.getElementById('preloader');
  const runPreloader = preloader && hasGsap && !reduceMotion && !sessionStorage.getItem('mm_preloaded');
  if (preloader && !runPreloader) preloader.remove();

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

  /* ── Hero headline: split into words for stagger ────────── */
  /* Skipped when the h1 contains markup (home canvas, about
     accent span) — those are pre-split or animated whole. */
  const heroTitle = document.querySelector('.hero h1');
  if (heroTitle && !heroTitle.dataset.split && heroTitle.children.length === 0) {
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

  /* ── Hero entrance ───────────────────────────────────────── */
  const runHeroIntro = () => {
    const heroIntro = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (document.querySelector('.hero-home')) {
      /* Stacked headline rises in, scattered metadata fades after */
      heroIntro
        .from('.hc-build, .hc-things', { y: 40, autoAlpha: 0, duration: 0.8, stagger: 0.12 }, 0.1)
        .from('.hc-id, .hc-sub, .hc-label-city, .hc-cta', { autoAlpha: 0, duration: 0.6, stagger: 0.12 }, 0.6);
    } else {
      const heroPhoto = document.querySelector('.hero-photo');
      if (heroPhoto) {
        heroIntro.fromTo(heroPhoto, { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.1, ease: 'power2.out' }, 0);
      }

      const wordEls = document.querySelectorAll('.hero h1 .w');
      if (wordEls.length) {
        heroIntro.from(wordEls, {
          y: 40,
          autoAlpha: 0,
          duration: 0.8,
          stagger: 0.08
        }, 0);
      }

      const heroFades = document.querySelectorAll('.hero [data-hero-fade]');
      if (heroFades.length) {
        heroIntro.from(heroFades, {
          y: 24,
          autoAlpha: 0,
          duration: 0.7,
          stagger: 0.1
        }, wordEls.length ? '-=0.45' : 0);
      }
    }

    const heroScroll = document.querySelector('.hero-scroll');
    if (heroScroll) {
      heroIntro.from(heroScroll, { autoAlpha: 0, duration: 0.9 }, '-=0.2');
    }
  };

  if (runPreloader) {
    const counter = document.getElementById('preloader-count');
    const count = { val: 0 };
    gsap.to(count, {
      val: 100,
      duration: 0.7,
      ease: 'power2.in',
      onUpdate() { counter.textContent = Math.round(count.val); },
      onComplete() {
        sessionStorage.setItem('mm_preloaded', '1');
        gsap.to(preloader, {
          autoAlpha: 0,
          duration: 0.25,
          onComplete() { preloader.remove(); }
        });
        runHeroIntro();
      }
    });
  } else {
    runHeroIntro();
  }

  /* ── Topo contour drift: slow ambient movement ───────────── */
  /* Direct children only: the route map group stays anchored. */
  document.querySelectorAll('.hero-topo > path').forEach((path, i) => {
    gsap.to(path, {
      x: (i % 2 === 0 ? 1 : -1) * (12 + i * 3),
      y: (i % 3 === 0 ? 1 : -1) * (8 + i * 2),
      duration: 10 + i * 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: i * 0.7
    });
  });

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
