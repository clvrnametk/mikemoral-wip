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
      nav.classList.toggle('scrolled', window.scrollY > 20);
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

  /* ── Streamer: top carousel (auto-advance gated on reduced-motion) ── */
  const carousel = document.querySelector('.strm-carousel');
  if (carousel) {
    const slides = carousel.querySelectorAll('.strm-slide');
    const dots = carousel.querySelectorAll('.strm-dot');
    let idx = 0, timer = null;
    const show = i => {
      idx = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle('is-active', n === idx));
      dots.forEach((d, n) => d.classList.toggle('is-active', n === idx));
    };
    const restart = () => {
      if (timer) clearInterval(timer);
      if (!reduceMotion) timer = setInterval(() => show(idx + 1), 4500);
    };
    dots.forEach((d, n) => d.addEventListener('click', () => { show(n); restart(); }));
    show(0);
    restart();
  }

  /* Stat numbers show their final value by default (so reduced-motion / no-JS still reads correctly) */
  document.querySelectorAll('.strm-stat-num[data-to]').forEach(el => {
    el.textContent = (+el.dataset.to).toLocaleString();
  });

  /* Bottom-locked scroll cue (work case studies): fade out once the reader scrolls */
  /* SummerQuest TV strip: center the middle screen (TV-03) on load, scrollable left/right */
  const sqTrack = document.querySelector('.sq-tvstrip');
  const sqImg = sqTrack && sqTrack.querySelector('.sq-tvstrip-img');
  if (sqImg) {
    const centerSq = () => { sqTrack.scrollLeft = (sqTrack.scrollWidth - sqTrack.clientWidth) / 2; };
    centerSq();
    window.addEventListener('load', centerSq);
    window.addEventListener('resize', centerSq);
    if (!sqImg.complete) sqImg.addEventListener('load', centerSq);
  }

  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const open = siteNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    siteNav.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => {
      siteNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    }));
  }

  const noteHero = document.querySelector('.hero-note');
  if (noteHero) {
    const nextLink = document.querySelector('.note-nav--next');
    const prevLink = document.querySelector('.note-nav--prev');
    let sx = 0, sy = 0;
    noteHero.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    noteHero.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0 && nextLink) window.location.href = nextLink.href;
        else if (dx > 0 && prevLink) window.location.href = prevLink.href;
      }
    }, { passive: true });
  }

  const csCue = document.querySelector('.cs-scrollcue');
  if (csCue) {
    const toggleCue = () => {
      const scrolled = window.scrollY > 60;
      csCue.classList.toggle('is-hidden', scrolled);
      document.documentElement.classList.toggle('cs-scrolled', scrolled);
    };
    window.addEventListener('scroll', toggleCue, { passive: true });
    toggleCue();
  }

  /* Work hero: cursor spotlight that reveals the colour image from the duotone.
     Mouse + fine-pointer only, and skipped for reduced-motion. */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
    document.querySelectorAll('.hero').forEach(hero => {
      const color = hero.querySelector('.cs-hero-color, .hero-glow');
      if (!color) return;
      let tx = 0, ty = 0, cx = 0, cy = 0, vx = 0, vy = 0, raf = null, active = false, inited = false;
      let t = 0, flick = 0, flickT = 0, grx = 440, gry = 440;
      const STIFF = 0.021, DAMP = 0.85;
      const loop = () => {
        t += 0.016;
        vx = vx * DAMP + (tx - cx) * STIFF; cx += vx;
        vy = vy * DAMP + (ty - cy) * STIFF; cy += vy;
        if (Math.random() < 0.035) flickT = Math.random() * 2 - 1;
        flick += (flickT - flick) * 0.05;
        const r = 440 + Math.sin(t * 0.85) * 60 + flick * 24 + Math.sin(t * 5.0) * 4;
        const sp = Math.hypot(vx, vy) || 0.0001;
        const ux = Math.abs(vx) / sp, uy = Math.abs(vy) / sp;
        const stretch = Math.min(sp * 0.03, 0.4);
        const rxT = r * (1 + stretch * ux - stretch * uy * 0.5);
        const ryT = r * (1 + stretch * uy - stretch * ux * 0.5);
        grx += (rxT - grx) * 0.2; gry += (ryT - gry) * 0.2;
        const ox = Math.cos(t * 0.8) * 8 + Math.sin(t * 2.1) * 3;
        const oy = Math.sin(t * 0.7) * 8 + Math.cos(t * 2.6) * 3;
        color.style.setProperty('--mx', (cx + ox) + 'px');
        color.style.setProperty('--my', (cy + oy) + 'px');
        color.style.setProperty('--glow-rx', grx + 'px');
        color.style.setProperty('--glow-ry', gry + 'px');
        const moving = Math.abs(vx) > 0.05 || Math.abs(vy) > 0.05 || Math.abs(tx - cx) > 0.5 || Math.abs(ty - cy) > 0.5;
        if (active || moving) { raf = requestAnimationFrame(loop); } else { raf = null; }
      };
      /* Track against the hero's bounds (not pointerenter/leave) so the glow stays lit
         when the cursor moves onto the nav that overlays the hero. */
      window.addEventListener('pointermove', e => {
        const r = hero.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        const inside = x >= 0 && x <= r.width && y >= 0 && y <= r.height;
        if (inside) {
          tx = x; ty = y;
          if (!inited) { cx = x; cy = y; vx = vy = 0; inited = true; }
          if (!active) { active = true; hero.classList.add('cs-glow-active'); }
          if (!raf) raf = requestAnimationFrame(loop);
        } else if (active) {
          active = false; inited = false; hero.classList.remove('cs-glow-active');
        }
      }, { passive: true });
    });
  }


  /* ── Section hero: WebGL cursor warp-lens (progressive enhancement) ──────────
     Falls back silently to the .hero-photo constellation if WebGL is unavailable,
     on touch, or for reduced-motion. */
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
    document.querySelectorAll('canvas.hero-gl').forEach(canvas => {
      const src = canvas.dataset.tex;
      const hero = canvas.closest('.hero');
      if (!src || !hero) { canvas.style.display = 'none'; return; }
      let gl = null;
      try { gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl'); } catch (e) {}
      if (!gl) { canvas.style.display = 'none'; return; }

      const VS = 'attribute vec2 a; varying vec2 v; void main(){ v = a*0.5+0.5; gl_Position = vec4(a,0.0,1.0); }';
      const FS = [
        'precision highp float;',
        'varying vec2 v;',
        'uniform sampler2D uTex;',
        'uniform vec2 uMouse;',
        'uniform vec2 uVel;',
        'uniform float uCA, uTA, uR, uStr, uBright, uMode;',
        'vec2 cover(vec2 p){ vec2 uv=p; if(uCA>uTA) uv.y=(p.y-0.5)*(uTA/uCA)+0.5; else uv.x=(p.x-0.5)*(uCA/uTA)+0.5; return uv; }',
        'void main(){',
        '  vec2 p = vec2(v.x, 1.0 - v.y);',
        '  vec2 d = p - uMouse; d.x *= uCA;',
        '  float f = smoothstep(uR, 0.0, length(d));',
        '  vec2 disp = mix((p - uMouse), uVel * 9.0, uMode) * f * uStr;',
        '  vec2 warped = p - disp;',
        '  vec3 col = texture2D(uTex, cover(warped)).rgb;',
        '  col += col * f * uBright;',
        '  gl_FragColor = vec4(col, 1.0);',
        '}'
      ].join('\n');
      const mkShader = (t, s) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); return gl.getShaderParameter(sh, gl.COMPILE_STATUS) ? sh : null; };
      const vs = mkShader(gl.VERTEX_SHADER, VS), fs = mkShader(gl.FRAGMENT_SHADER, FS);
      if (!vs || !fs) { canvas.style.display = 'none'; return; }
      const prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.style.display = 'none'; return; }
      gl.useProgram(prog);
      const quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
      const la = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(la); gl.vertexAttribPointer(la, 2, gl.FLOAT, false, 0, 0);
      const U = n => gl.getUniformLocation(prog, n);
      const uMouse = U('uMouse'), uVel = U('uVel'), uMode = U('uMode'), uCA = U('uCA'), uTA = U('uTA'), uR = U('uR'), uStr = U('uStr'), uBright = U('uBright');
      const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([15,15,60,255]));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      let texAspect = 1.78;
      const cssGlow = hero.querySelector('.hero-glow');
      let mx = 0.72, my = 0.5, tmx = 0.72, tmy = 0.5, act = 0, actT = 0, time = 0, rafId = null;
      const resize = () => { const r = hero.getBoundingClientRect(); const dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.max(1, Math.round(r.width * dpr)); canvas.height = Math.max(1, Math.round(r.height * dpr)); gl.viewport(0, 0, canvas.width, canvas.height); };
      resize(); window.addEventListener('resize', resize);
      window.addEventListener('pointermove', e => {
        const r = hero.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1;
        actT = inside ? 1 : 0;
        if (inside) { tmx = x; tmy = y; }
      }, { passive: true });
      const render = () => {
        time += 0.016;
        const pmx = mx, pmy = my;
        mx += (tmx - mx) * 0.08; my += (tmy - my) * 0.08;
        act += (actT - act) * 0.08;
        const ca = canvas.width / canvas.height;
        const R = 0.44 + Math.sin(time * 0.95) * 0.065;
        gl.useProgram(prog);
        gl.uniform2f(uMouse, mx, my);
        gl.uniform2f(uVel, mx - pmx, my - pmy);
        gl.uniform1f(uMode, 1.0);
        gl.uniform1f(uCA, ca); gl.uniform1f(uTA, texAspect);
        gl.uniform1f(uR, R); gl.uniform1f(uStr, 0.13 * act); gl.uniform1f(uBright, 0.14 * act);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
        rafId = requestAnimationFrame(render);
      };
      const fallback = () => { canvas.style.display = 'none'; if (cssGlow) cssGlow.style.display = ''; if (rafId) cancelAnimationFrame(rafId); };
      const img = new Image();
      img.onerror = fallback;
      img.onload = () => {
        try {
          texAspect = img.width / img.height;
          gl.bindTexture(gl.TEXTURE_2D, tex);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        } catch (e) { fallback(); return; }
        if (gl.getError() !== gl.NO_ERROR) { fallback(); return; }
        if (cssGlow) cssGlow.style.display = 'none';
        render();
      };
      img.crossOrigin = 'anonymous';
      img.src = src;
    });
  }

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
      /* Background image fades in to its resting opacity (like hero photos elsewhere) */
      const heroBg = document.querySelector('.hero-home--bgtest .hero-bg-layer');
      if (heroBg) heroIntro.from(heroBg, { opacity: 0, duration: 1.1, ease: 'power2.out' }, 0);
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

  /* ── Home intro: drift parallax on the sprint-scene bg ──── */
  const hiBg = document.querySelector('.home-intro--bg .hi-bg');
  if (hiBg) {
    gsap.fromTo(hiBg, { yPercent: -10 }, {
      yPercent: 10,
      ease: 'none',
      scrollTrigger: {
        trigger: '.home-intro--bg',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  /* ── SummerQuest: parallax on the kids quote band ───────── */
  const cqbBg = document.querySelector('.cs-quoteband .cqb-bg');
  if (cqbBg) {
    gsap.fromTo(cqbBg, { yPercent: -10 }, {
      yPercent: 10, ease: 'none',
      scrollTrigger: {
        trigger: '.cs-quoteband',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  /* ── SummerQuest: cities stagger up into view ───────────── */
  const sqCities = gsap.utils.toArray('.sq-city');
  if (sqCities.length) {
    gsap.from(sqCities, {
      y: 30, autoAlpha: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08,
      scrollTrigger: { trigger: '.sq-city-grid', start: 'top 82%', once: true }
    });
  }

  /* ── Streamer: "by the numbers" count-up ────────────────── */
  /* Streamer count-up — runs when the numbers block is revealed (see case-study reveal below) */
  const statNums = gsap.utils.toArray('.strm-stat-num');
  let streamerCounted = false;
  const runStreamerCount = () => {
    if (streamerCounted) return;
    streamerCounted = true;
    statNums.forEach(el => {
      const to = +el.dataset.to;
      const obj = { v: 0 };
      gsap.to(obj, {
        v: to, duration: 1.4, ease: 'power2.out',
        onUpdate() { el.textContent = Math.round(obj.v).toLocaleString(); }
      });
    });
  };

  /* ── Streamer filmstrip: continuous auto-drift marquee (CSS-driven); parallax removed ── */

  /* ── Streamer: brand tiles stagger in ───────────────────── */
  const strmBrands = gsap.utils.toArray('.strm-brand');
  if (strmBrands.length) {
    gsap.from(strmBrands, {
      y: 30, autoAlpha: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08,
      scrollTrigger: { trigger: '.strm-brands', start: 'top 82%', once: true }
    });
  }

  const revealTargets = document.querySelectorAll([
    '[data-reveal]',
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
      clearProps: 'transform,opacity,visibility',
      scrollTrigger: {
        trigger: el,
        start: 'top 85%',
        once: true
      }
    });
  });

  /* About timeline: logos pop in, staggered with a springy overshoot, per era row.
     Uses IntersectionObserver (reliable for this bottom-of-page section) instead of
     ScrollTrigger position math. Falls back to visible if IO is unavailable. */
  const tlRows = gsap.utils.toArray('.tl-era-row');
  if (tlRows.length && 'IntersectionObserver' in window) {
    tlRows.forEach(row => {
      const circles = row.querySelectorAll('.tl-circle');
      if (!circles.length) return;
      gsap.set(circles, { scale: 0, autoAlpha: 0 });
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return;
          gsap.to(circles, {
            scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(1.7)', stagger: 0.07,
            clearProps: 'transform,opacity,visibility'
          });
          obs.disconnect();
        });
      }, { threshold: 0.15 });
      io.observe(row);
    });
  }

  /* ── Work case studies: keep the first block; everything below it stays hidden
        until the reader scrolls, then fades/slides in. (Not revealed on load.) ── */
  const csRevealEls = gsap.utils.toArray('[data-reveal-cs]');
  if (csRevealEls.length) {
    document.documentElement.classList.add('cs-reveal');
    csRevealEls.forEach(el => gsap.set(el, { autoAlpha: 0, y: 28 }));
    const csReveal = () => {
      const atTop = window.scrollY <= 60;
      csRevealEls.forEach(el => {
        if (atTop) {
          /* Back at the top: animate the blocks out so the scroll cue has clear space */
          if (el._shown) {
            el._shown = false;
            gsap.to(el, { autoAlpha: 0, y: 28, duration: 0.4, ease: 'power2.in' });
          }
        } else if (!el._shown && el.getBoundingClientRect().top < window.innerHeight * 0.9) {
          el._shown = true;
          gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out' });
          if (el.classList.contains('strm-numbers')) runStreamerCount();
        }
      });
    };
    window.addEventListener('scroll', csReveal, { passive: true });
    /* intentionally NOT called on load — the blocks wait for the first scroll */
  }

});
