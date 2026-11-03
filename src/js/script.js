/* ============================================================
   PORTFOLIO — script.js
   ============================================================ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const desktopHero = window.matchMedia('(min-width: 901px)');

/* ============================================================
   1. HERO — entrance animation, played as the loader lifts.
      On phones the portrait shows first, then fades away and
      the name takes its place.
   ============================================================ */
document.addEventListener('site:ready', () => {
  const wrapper = document.getElementById('heroWrapper');
  const first = document.getElementById('heroFirst');
  const last  = document.getElementById('heroLast');
  const meta  = document.querySelector('.hero__meta');
  const photo = document.getElementById('heroPhoto');
  const isPhone = window.matchMedia('(max-width: 640px)').matches;

  const showName = (delay) => {
    setTimeout(() => {
      if (first) first.classList.add('in');
      if (last)  last.classList.add('in');
      setTimeout(() => { if (meta) meta.classList.add('in'); }, 700);
    }, delay);
  };

  // small rAF delay so browser has painted
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (photo) photo.classList.add('in');

      if (!isPhone || !wrapper) {
        showName(0);
        return;
      }

      const FACE_MS = prefersReducedMotion ? 0 : 1500;   // how long the face stays
      setTimeout(() => {
        wrapper.classList.add('intro-done');               // face fades / lifts away
        showName(prefersReducedMotion ? 0 : 350);          // name slides in behind it
        setTimeout(() => wrapper.classList.add('intro-gone'), prefersReducedMotion ? 0 : 900);
      }, FACE_MS);
    });
  });
});

/* ============================================================
   2. SCROLL ANIMATION ENGINE — IntersectionObserver
   ============================================================ */
(function initScrollAnimations() {
  if (prefersReducedMotion) {
    document.querySelectorAll('.animate-target').forEach(el => {
      el.style.opacity = 1;
      el.style.transform = 'none';
    });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.animate-target').forEach(el => observer.observe(el));
})();

/* ============================================================
   3. NAV — scroll background + active section highlight
   ============================================================ */
(function initNav() {
  const nav = document.getElementById('nav');
  const links = document.querySelectorAll('.nav__link');

  // sticky background on scroll
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // active link = whichever section crosses the middle of the viewport.
  // (a ratio threshold never fires for sections taller than the screen)
  const targets = document.querySelectorAll('#hero, section[id], footer[id]');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    });
  }, { rootMargin: '-45% 0px -54% 0px', threshold: 0 });

  targets.forEach(s => sectionObserver.observe(s));
})();

/* ============================================================
   4. MOBILE MENU — burger toggle
   ============================================================ */
(function initMobileMenu() {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('mobileMenu');
  if (!burger || !menu) return;

  let isOpen = false;

  function setOpen(open) {
    isOpen = open;
    menu.classList.toggle('open', isOpen);
    nav.classList.toggle('menu-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  burger.addEventListener('click', () => setOpen(!isOpen));

  // close when a link is clicked
  menu.querySelectorAll('.mobile-menu__link').forEach(link => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) setOpen(false);
  });

  // menu only exists below 900px — close it if the screen grows past that
  desktopHero.addEventListener('change', (e) => {
    if (e.matches && isOpen) setOpen(false);
  });
})();

/* ============================================================
   5. CONTACT MODAL
   ============================================================ */
(function initContactModal() {
  const trigger = document.getElementById('emailTrigger');
  const modal = document.getElementById('contactModal');
  const closeBtn = document.getElementById('contactModalClose');
  const form = document.getElementById('contactForm');
  if (!trigger || !modal || !closeBtn || !form) return;
  const overlay = modal.querySelector('.contact-modal__overlay');

  const focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

  const openModal = (e) => {
    e.preventDefault();
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const firstInput = modal.querySelector('input, textarea');
    // don't pop the keyboard open on phones
    if (firstInput && finePointer.matches) firstInput.focus();
  };

  const closeModal = () => {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    trigger.focus({ preventScroll: true });
  };

  trigger.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
      closeModal();
    }
  });

  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusableEls = Array.from(modal.querySelectorAll(focusableSelectors)).filter(el => el.offsetParent !== null);
    if (focusableEls.length === 0) return;
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } else {
      if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const subject = encodeURIComponent(
      document.getElementById('contactSubject').value.trim()
    );

    const message = encodeURIComponent(
      document.getElementById('contactMessage').value.trim()
    );

    const gmailUrl =
      `https://mail.google.com/mail/?view=cm&fs=1&to=safayetgazisopan@gmail.com&su=${subject}&body=${message}`;

    window.open(gmailUrl, '_blank');

    closeModal();
  });
})();

/* ============================================================
   6. CONTACT HEADING — character reveal on scroll
   ============================================================ */
(function initContactReveal() {
  if (prefersReducedMotion) return;

  const heading = document.getElementById('contactHeading');
  if (!heading) return;

  const text = heading.textContent;
  heading.setAttribute('aria-label', text);
  heading.innerHTML = '';

  [...text].forEach((char, i) => {
    const span = document.createElement('span');
    span.classList.add('char');
    span.setAttribute('aria-hidden', 'true');
    span.textContent = char === ' ' ? ' ' : char;
    span.style.transitionDelay = `${i * 35}ms`;
    heading.appendChild(span);
  });

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        heading.classList.add('in');
        obs.unobserve(heading);
      }
    });
  }, { threshold: 0.5 });

  obs.observe(heading);
})();

/* ============================================================
   7. CUSTOM CURSOR — mouse only (hidden on phones / tablets)
   ============================================================ */
(function initCustomCursor() {
  const cursor = document.querySelector('.cursor');
  if (!cursor) return;

  const HOVER_TARGETS = 'a, button, .skill-item, .hero-hover';

  let mouseX = 0;
  let mouseY = 0;
  let currentX = 0;
  let currentY = 0;
  let seen = false;
  let running = false;

  function animate() {
    currentX += (mouseX - currentX) * 0.18;
    currentY += (mouseY - currentY) * 0.18;
    cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(animate);
  }

  document.addEventListener('mousemove', (e) => {
    if (!finePointer.matches) return;
    mouseX = e.clientX;
    mouseY = e.clientY;
    // first move: jump straight there instead of gliding in from the corner
    if (!seen) {
      currentX = mouseX;
      currentY = mouseY;
      seen = true;
    }
    cursor.classList.add('visible');
    if (!running) {
      running = true;
      animate();
    }
  });

  // hide it when the pointer leaves the window or enters an iframe (the Loom
  // video) — the page stops receiving mousemove there, so it would freeze
  document.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget) cursor.classList.remove('visible');
  });

  // hover state via delegation so it works for every link/button/skill;
  // switch to cream over the red footer so it stays visible
  document.addEventListener('mouseover', (e) => {
    cursor.classList.toggle('hover', !!e.target.closest(HOVER_TARGETS));
    // (the "Send a message" button turns cream on hover, so keep it red there)
    cursor.classList.toggle('on-dark', !!e.target.closest('.footer') && !e.target.closest('.footer__cta'));
  });
})();

/* ============================================================
   7b. ROLLING LINK TEXT — split into letters that roll on hover
   ============================================================ */
(function initRollingText() {
  document.querySelectorAll('.roll').forEach(el => {
    const text = el.textContent.trim();
    if (!text) return;

    const sr = document.createElement('span');
    sr.className = 'visually-hidden';
    sr.textContent = text;

    const inner = document.createElement('span');
    inner.className = 'roll__inner';
    inner.setAttribute('aria-hidden', 'true');

    [...text].forEach((ch, i) => {
      const c = document.createElement('span');
      c.className = 'roll__char';
      c.style.setProperty('--i', i);
      c.dataset.char = ch === ' ' ? '\u00A0' : ch;
      c.textContent = c.dataset.char;
      inner.appendChild(c);
    });

    el.textContent = '';
    el.append(sr, inner);
  });
})();

/* ============================================================
   8. BACKGROUND FX — kinetic dot grid that follows the mouse,
      or your finger when tapping / swiping on touch screens
   ============================================================ */
(function initBackgroundFx() {
  const canvas = document.getElementById('bgFx');
  if (!canvas || prefersReducedMotion) return;

  const ctx = canvas.getContext('2d');

  const SPACING = 32;      // distance between dots
  const DOT_MAX = 3.0;     // max dot size near cursor
  const WARP = 14;         // how far dots drift toward cursor
  const ACCENT = [139, 48, 34];   // deep accent (center)
  const WARM = [196, 122, 74];    // warm terracotta (edges)
  const MOUSE_IDLE_MS = 140;      // stillness before it starts to fade out
  const TOUCH_IDLE_MS = 450;      // lingers a little after a tap / swipe

  let RADIUS = 210;        // influence radius (smaller on phones)
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0, h = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    RADIUS = Math.max(130, Math.min(210, w * 0.4));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // smoothed pointer position; start off-screen so nothing shows until move
  let pointerX = -9999, pointerY = -9999;
  let curX = -9999, curY = -9999;

  // visibility: appears while moving, fades out when idle
  let intensity = 0;
  let target = 0;
  let lastMove = 0;
  let idleMs = MOUSE_IDLE_MS;
  let cleared = true;

  function moveTo(x, y, snap) {
    pointerX = x;
    pointerY = y;
    if (snap || curX < -1000) {
      curX = x;
      curY = y;
    }
    target = 1;
    lastMove = performance.now();
  }

  document.addEventListener('mousemove', (e) => {
    if (!finePointer.matches) return;
    idleMs = MOUSE_IDLE_MS;
    moveTo(e.clientX, e.clientY, false);
  });
  document.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget) target = 0;
  });

  // touch: a tap snaps the glow under the finger, a swipe drags it along
  const onTouch = (snap) => (e) => {
    const t = e.touches[0];
    if (!t) return;
    idleMs = TOUCH_IDLE_MS;
    moveTo(t.clientX, t.clientY, snap);
  };
  window.addEventListener('touchstart', onTouch(true), { passive: true });
  window.addEventListener('touchmove', onTouch(false), { passive: true });

  function frame() {
    requestAnimationFrame(frame);

    curX += (pointerX - curX) * 0.12;
    curY += (pointerY - curY) * 0.12;

    if (target === 1 && performance.now() - lastMove > idleMs) target = 0;
    intensity += (target - intensity) * 0.08;

    // nothing to draw while fully faded out
    if (intensity < 0.01) {
      if (!cleared) {
        ctx.clearRect(0, 0, w, h);
        cleared = true;
      }
      return;
    }

    ctx.clearRect(0, 0, w, h);
    cleared = false;

    // soft radial halo following the pointer
    const halo = ctx.createRadialGradient(curX, curY, 0, curX, curY, RADIUS);
    halo.addColorStop(0, `rgba(${ACCENT.join(',')}, ${0.07 * intensity})`);
    halo.addColorStop(0.5, `rgba(${WARM.join(',')}, ${0.035 * intensity})`);
    halo.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = halo;
    ctx.fillRect(curX - RADIUS, curY - RADIUS, RADIUS * 2, RADIUS * 2);

    // only iterate the grid cells inside the influence box
    const minCol = Math.floor((curX - RADIUS) / SPACING);
    const maxCol = Math.ceil((curX + RADIUS) / SPACING);
    const minRow = Math.floor((curY - RADIUS) / SPACING);
    const maxRow = Math.ceil((curY + RADIUS) / SPACING);

    ctx.shadowColor = `rgba(${ACCENT.join(',')}, 0.5)`;

    for (let col = minCol; col <= maxCol; col++) {
      for (let row = minRow; row <= maxRow; row++) {
        const baseX = col * SPACING;
        const baseY = row * SPACING;
        if (baseX < -SPACING || baseX > w + SPACING || baseY < -SPACING || baseY > h + SPACING) continue;

        const dx = baseX - curX;
        const dy = baseY - curY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > RADIUS) continue;

        const t = 1 - dist / RADIUS;       // 1 at center -> 0 at edge
        const ease = t * t;                // softer falloff
        const size = DOT_MAX * ease;
        if (size < 0.12) continue;

        // gentle warp: dots drift toward the pointer as it nears
        const pull = ease * WARP;
        const inv = dist > 0.001 ? 1 / dist : 0;
        const x = baseX - dx * inv * pull;
        const y = baseY - dy * inv * pull;

        // color shifts from warm (edge) to deep accent (center)
        const r = Math.round(WARM[0] + (ACCENT[0] - WARM[0]) * ease);
        const g = Math.round(WARM[1] + (ACCENT[1] - WARM[1]) * ease);
        const b = Math.round(WARM[2] + (ACCENT[2] - WARM[2]) * ease);

        ctx.beginPath();
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.6 * ease * intensity})`;
        ctx.shadowBlur = 8 * ease;
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.shadowBlur = 0;
  }
  frame();
})();

/* ============================================================
   9. HERO PHOTO PARALLAX — desktop layout only
   ============================================================ */
(function heroParallax() {
  const photo = document.getElementById('heroPhoto');
  if (!photo || prefersReducedMotion) return;

  let current = 0;
  let target = 0;

  function animate() {
    requestAnimationFrame(animate);

    // below 900px the photo sits in the normal flow — leave it alone
    if (!desktopHero.matches) {
      if (photo.style.transform) photo.style.transform = '';
      current = target;
      return;
    }

    if (Math.abs(target - current) < 0.1 && photo.style.transform) return;
    current += (target - current) * 0.08;
    photo.style.transform = `translateX(-50%) translateY(${current}px)`;
  }

  window.addEventListener('scroll', () => {
    // nothing to move once the hero is off screen
    target = Math.max(window.scrollY, 0) * -0.25;
    if (window.scrollY > window.innerHeight * 1.5) target = window.innerHeight * 1.5 * -0.25;
  }, { passive: true });

  animate();
})();

/* ============================================================
   10. SKILL TOOLTIP
       mouse: follows the pointer, flips/clamps at screen edges
       touch: tap a skill to open it under the item, tap again,
              tap elsewhere or scroll to close
   ============================================================ */
(function initSkillTooltip() {
  const tooltip = document.querySelector('.skill-tooltip');
  if (!tooltip) return;

  const eyebrow = tooltip.querySelector('.skill-tooltip__eyebrow');
  const title = tooltip.querySelector('.skill-tooltip__title');
  const text = tooltip.querySelector('.skill-tooltip__desc');
  const items = document.querySelectorAll('.skill-item');
  const EDGE = 12;

  let activeItem = null;
  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let lastMouseX = -1, lastMouseY = -1;
  let lastPointerType = '';
  let rafId = null;

  function clampToViewport(x, y, fromPointer) {
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    // flip to the left of the pointer when it would run off the right edge
    if (fromPointer && x + tw > window.innerWidth - EDGE) x = lastMouseX - tw - 24;
    x = Math.min(Math.max(x, EDGE), window.innerWidth - tw - EDGE);
    y = Math.min(Math.max(y, EDGE), window.innerHeight - th - EDGE);
    return [x, y];
  }

  function place() {
    tooltip.style.left = currentX + 'px';
    tooltip.style.top = currentY + 'px';
  }

  function tick() {
    currentX += (targetX - currentX) * 0.18;
    currentY += (targetY - currentY) * 0.18;
    place();
    rafId = activeItem ? requestAnimationFrame(tick) : null;
  }

  function show(item, x, y, fromPointer) {
    const wasHidden = !activeItem;
    if (activeItem && activeItem !== item) activeItem.classList.remove('is-active');
    activeItem = item;
    item.classList.add('is-active');
    const colHead = item.closest('.skills__col')?.querySelector('.skills__colhead');
    eyebrow.textContent = colHead ? colHead.textContent.trim() : 'Skill';
    title.textContent = item.dataset.title || item.textContent.trim();
    text.textContent = item.dataset.desc || '';

    [targetX, targetY] = clampToViewport(x, y, fromPointer);
    // appear right where it belongs instead of flying in from the last spot
    if (wasHidden) {
      currentX = targetX;
      currentY = targetY;
      place();
    }
    tooltip.classList.add('active');
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  function hide() {
    if (!activeItem) return;
    activeItem.classList.remove('is-active');
    activeItem = null;
    tooltip.classList.remove('active');
  }

  function showUnder(item) {
    const r = item.getBoundingClientRect();
    show(item, r.left, r.bottom + 8, false);
  }

  items.forEach(item => {
    item.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse') return;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      show(item, e.clientX + 24, e.clientY - 20, true);
    });

    item.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse' || activeItem !== item) return;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      [targetX, targetY] = clampToViewport(e.clientX + 24, e.clientY - 20, true);
    });

    item.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse') hide();
    });

    // touch / pen: tap to toggle (a mouse click is already handled by hover)
    item.addEventListener('click', () => {
      if (lastPointerType === 'mouse') return;
      if (activeItem === item) hide();
      else showUnder(item);
    });
  });

  // tap anywhere else closes it
  document.addEventListener('pointerdown', (e) => {
    lastPointerType = e.pointerType;
    if (activeItem && !e.target.closest('.skill-item')) hide();
  });

  // The bug: scrolling with the wheel moves the list out from under a still
  // mouse without firing pointerleave, so the tooltip stayed stuck on screen.
  // On scroll, re-check what is actually under the pointer.
  window.addEventListener('scroll', () => {
    if (!activeItem) return;
    if (!finePointer.matches || lastMouseX < 0) {
      hide();
      return;
    }
    const under = document.elementFromPoint(lastMouseX, lastMouseY);
    const item = under && under.closest('.skill-item');
    if (!item) hide();
    else if (item !== activeItem) show(item, lastMouseX + 24, lastMouseY - 20, true);
  }, { passive: true });

  window.addEventListener('resize', hide);
})();

/* ============================================================
   11. SOPAN SCRAMBLE HOVER (tap on touch screens)
   ============================================================ */
(function initHeroScramble() {
  const letters = "!@#^*(){}[];±?abcdefghijklmnopqrstuvwxyz";

  const target = document.querySelector(".hero-scramble");
  if (!target) return;

  const originalText = target.textContent;
  let running = false;

  target.addEventListener("pointerenter", () => {
    if (running) return;
    running = true;

    let iteration = 0;

    const interval = setInterval(() => {
      target.textContent = originalText
        .split("")
        .map((letter, index) => {
          if (index < iteration) return originalText[index];
          return letters[Math.floor(Math.random() * letters.length)];
        })
        .join("");

      if (iteration >= originalText.length) {
        clearInterval(interval);
        target.textContent = originalText;
        running = false;
      }

      iteration += 0.35;
    }, 25);
  });
})();

/* ============================================================
   12. WORK SLIDER — arrow buttons + swipe, buttons track position
   ============================================================ */
(function initWorkSlider() {
  const grid = document.querySelector('.work-grid');
  const next = document.getElementById('workNext');
  const prev = document.getElementById('workPrev');
  if (!grid || !next || !prev) return;

  const cards = Array.from(grid.querySelectorAll('.work-card'));
  if (!cards.length) return;

  const offsetOf = (i) => cards[i].offsetLeft - cards[0].offsetLeft;

  // the card whose left edge is closest to the current scroll position
  function currentIndex() {
    let best = 0;
    cards.forEach((_, i) => {
      if (Math.abs(offsetOf(i) - grid.scrollLeft) < Math.abs(offsetOf(best) - grid.scrollLeft)) best = i;
    });
    return best;
  }

  function goTo(index) {
    const i = Math.max(0, Math.min(index, cards.length - 1));
    grid.scrollTo({ left: offsetOf(i), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }

  function updateButtons() {
    const max = grid.scrollWidth - grid.clientWidth;
    prev.disabled = grid.scrollLeft <= 2;
    next.disabled = grid.scrollLeft >= max - 2;
  }

  next.addEventListener('click', () => goTo(currentIndex() + 1));
  prev.addEventListener('click', () => goTo(currentIndex() - 1));

  grid.addEventListener('scroll', updateButtons, { passive: true });
  window.addEventListener('resize', updateButtons);
  updateButtons();
})();

/* ============================================================
   13. FOOTER — slides up into place as it scrolls into view
   ============================================================ */
(function initFooterReveal() {
  const footer = document.getElementById('contact');
  const inner = document.getElementById('footerInner');
  if (!footer || !inner || prefersReducedMotion) return;

  let ticking = false;

  function update() {
    ticking = false;
    const rect = footer.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 when the footer's top edge is at the bottom of the screen,
    // 1 once it has scrolled up by a full screen (or its own height)
    const p = Math.min(Math.max((vh - rect.top) / Math.min(rect.height, vh), 0), 1);
    const eased = 1 - Math.pow(1 - p, 3);
    inner.style.transform = `translate3d(0, ${(1 - eased) * -22}vh, 0)`;
    inner.style.opacity = String(0.15 + 0.85 * eased);
  }

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

/* ============================================================
   14. NAME MARQUEE — drifts on its own, speeds up while you
       scroll and follows the scroll direction
   ============================================================ */
(function initMarquee() {
  const marquee = document.getElementById('marquee');
  const track = document.getElementById('marqueeTrack');
  if (!marquee || !track || prefersReducedMotion) return;

  const group = track.querySelector('.marquee__group');
  const BASE = 60;           // px per second
  let x = 0;
  let dir = -1;              // -1 = moving left
  let boost = 0;
  let lastY = window.scrollY;
  let lastT = performance.now();
  let visible = false;
  let rafId = null;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const dy = y - lastY;
    lastY = y;
    if (!visible || dy === 0) return;
    dir = dy > 0 ? -1 : 1;
    boost = Math.min(boost + Math.abs(dy) * 6, 1600);
  }, { passive: true });

  function frame(t) {
    const dt = Math.min((t - lastT) / 1000, 0.05);
    lastT = t;
    boost *= 0.92;

    const groupW = group.offsetWidth;
    x += dir * (BASE + boost) * dt;
    // loop seamlessly between the two identical groups
    if (x <= -groupW) x += groupW;
    if (x > 0) x -= groupW;
    track.style.transform = `translate3d(${x}px, 0, 0)`;

    rafId = visible ? requestAnimationFrame(frame) : null;
  }

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !rafId) {
      lastT = performance.now();
      rafId = requestAnimationFrame(frame);
    }
  }).observe(marquee);
})();

/* ============================================================
   15. LOADER — tracks the real page load, but never stays up
       longer than ~2s so the site is usable within 3 seconds
   ============================================================ */
(function initLoader() {
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loaderBar');

  const ready = () => document.dispatchEvent(new Event('site:ready'));

  if (!loader || !loaderBar) {
    ready();
    return;
  }

  const MIN_MS = 600;      // don't flash
  const MAX_MS = 1900;     // hard cap, then lift regardless
  const start = performance.now();
  let loaded = document.readyState === 'complete';
  let shown = 0;
  let finished = false;

  window.addEventListener('load', () => { loaded = true; });

  function tick(now) {
    if (finished) return;
    const elapsed = now - start;
    const done = (loaded && elapsed >= MIN_MS) || elapsed >= MAX_MS;
    // creep towards 90% while loading, then run to 100%
    const target = done ? 100 : Math.min(90, (elapsed / MAX_MS) * 100);
    shown += (target - shown) * (done ? 0.25 : 0.08);
    loaderBar.style.width = `${shown}%`;

    if (done && shown > 99.4) {
      finish();
      return;
    }
    requestAnimationFrame(tick);
  }

  function finish() {
    if (finished) return;
    finished = true;
    loaderBar.style.width = '100%';
    loader.classList.add('is-hidden');
    ready();
    setTimeout(() => loader.remove(), 900);
  }

  requestAnimationFrame(tick);
  // rAF pauses in background tabs — make sure we still finish on time
  setTimeout(finish, MAX_MS + 600);
})();
