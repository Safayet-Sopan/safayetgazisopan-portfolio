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
  if (!nav) return;   // the Beyond page has no nav
  const links = document.querySelectorAll('.nav__link, .mobile-menu__link');

  const footer = document.getElementById('contact');

  // sticky background on scroll; slide the nav away once the contact footer
  // reaches the top of the screen (it has its own menu, and the light bar
  // would otherwise sit on top of the red block)
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
    const overFooter = footer && footer.getBoundingClientRect().top <= nav.offsetHeight;
    nav.classList.toggle('nav--hidden', !!overFooter && !nav.classList.contains('menu-open'));
  };
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
  let settleTimer = null;

  function setOpen(open) {
    isOpen = open;
    menu.classList.toggle('open', isOpen);
    nav.classList.toggle('menu-open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    menu.setAttribute('aria-hidden', String(!isOpen));
    menu.inert = !isOpen;
    document.body.style.overflow = isOpen ? 'hidden' : '';

    // the staggered entrance takes ~1s; after that, hovers shouldn't wait on it
    clearTimeout(settleTimer);
    menu.classList.remove('is-settled');
    if (isOpen) settleTimer = setTimeout(() => menu.classList.add('is-settled'), 1100);
  }

  burger.addEventListener('click', () => setOpen(!isOpen));

  // close when a link is clicked
  menu.querySelectorAll('a').forEach(link => {
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
// Messages from the contact form are emailed to you by Web3Forms (free, no
// backend needed). Get a key at https://web3forms.com by entering your email,
// then paste it here. The key is safe to keep in public code: it can only
// send mail to the address it was created for.
const WEB3FORMS_KEY = 'aed9ed4a-122e-41ab-8dcf-dcdf31c8534b';
const CONTACT_EMAIL = 'safayetgazisopan@gmail.com';

(function initContactModal() {
  const trigger = document.getElementById('emailTrigger');
  const modal = document.getElementById('contactModal');
  const closeBtn = document.getElementById('contactModalClose');
  const form = document.getElementById('contactForm');
  if (!trigger || !modal || !closeBtn || !form) return;
  const overlay = modal.querySelector('.contact-modal__overlay');
  const sendBtn = document.getElementById('contactSend');
  const errorEl = document.getElementById('contactError');
  const doneClose = document.getElementById('contactDoneClose');
  const doneEmail = document.getElementById('contactDoneEmail');

  const focusableSelectors = 'a[href], button:not([disabled]), textarea, input:not([tabindex="-1"]), select, [tabindex]:not([tabindex="-1"])';

  const openModal = (e) => {
    e.preventDefault();
    modal.classList.remove('is-sent');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const firstInput = modal.querySelector('.contact-modal__input');
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
  doneClose.addEventListener('click', closeModal);

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

  const showError = (html) => {
    errorEl.innerHTML = html;
    errorEl.hidden = !html;
  };

  // clear a field's error as soon as the visitor fixes it
  form.addEventListener('input', (e) => {
    if (e.target.classList.contains('is-invalid') && e.target.checkValidity()) {
      e.target.classList.remove('is-invalid');
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fields = Array.from(form.querySelectorAll('.contact-modal__input'));
    const invalid = fields.filter(f => !f.value.trim() || !f.checkValidity());
    fields.forEach(f => f.classList.toggle('is-invalid', invalid.includes(f)));
    if (invalid.length) {
      showError(invalid.some(f => f.type === 'email' && f.value.trim())
        ? 'That email address doesn&rsquo;t look quite right.'
        : 'Please fill in every field so I can get back to you.');
      invalid[0].focus();
      return;
    }
    showError('');

    const data = Object.fromEntries(new FormData(form));
    const name = data.name.trim();
    const email = data.email.trim();
    const subject = data.subject.trim();
    const message = data.message.trim();

    // no key yet: fall back to opening a pre-filled Gmail draft
    if (!WEB3FORMS_KEY) {
      const body = `${message}\n\n${name} <${email}>`;
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
      closeModal();
      return;
    }

    sendBtn.classList.add('is-loading');
    sendBtn.setAttribute('aria-busy', 'true');

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `Portfolio: ${subject}`,
          from_name: name,
          name,
          email,            // Web3Forms sets this as Reply-To, so you can just hit reply
          message,
          botcheck: data.botcheck ? true : '',
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.message || res.statusText);

      doneEmail.textContent = email;
      form.reset();
      modal.classList.add('is-sent');
      doneClose.focus({ preventScroll: true });
    } catch (err) {
      showError(`Something went wrong sending that. Please try again, or email me at <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.`);
    } finally {
      sendBtn.classList.remove('is-loading');
      sendBtn.removeAttribute('aria-busy');
    }
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
    cursor.classList.toggle('on-dark', !!e.target.closest('.footer, .mobile-menu, .page-beyond') && !e.target.closest('.footer__cta'));
    // over the Beyond section the cursor becomes the Explore button
    cursor.classList.toggle('explore', !!e.target.closest('#beyond'));
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
   7c. TILT — school logos and the Beyond cards lean gently towards
       the pointer, gliding a little each frame so they never snap.
   ============================================================ */
(function initTilt() {
  if (prefersReducedMotion) return;

  const MAX_TILT = 6;      // degrees at the logo's edge
  const MAX_SHIFT = 3;     // px at the logo's edge
  const GLIDE = 0.07;      // share of the remaining distance covered per frame

  document.querySelectorAll('[data-tilt]').forEach((link) => {
    const card = link.querySelector('[data-tilt-card]');
    if (!card) return;

    let targetX = 0, targetY = 0;   // -1 to 1 across the logo
    let x = 0, y = 0;
    let frame = null;

    function glide() {
      x += (targetX - x) * GLIDE;
      y += (targetY - y) * GLIDE;

      card.style.setProperty('--card-x', `${x * MAX_SHIFT}px`);
      card.style.setProperty('--card-y', `${y * MAX_SHIFT}px`);
      card.style.setProperty('--card-rx', `${-y * MAX_TILT}deg`);
      card.style.setProperty('--card-ry', `${x * MAX_TILT}deg`);

      const settled = Math.abs(targetX - x) < 0.002 && Math.abs(targetY - y) < 0.002;
      frame = settled ? null : requestAnimationFrame(glide);
    }

    function aimAt(newX, newY) {
      targetX = newX;
      targetY = newY;
      if (!frame) frame = requestAnimationFrame(glide);
    }

    link.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const box = link.getBoundingClientRect();
      aimAt(
        (e.clientX - box.left) / box.width * 2 - 1,
        (e.clientY - box.top) / box.height * 2 - 1
      );
    });

    link.addEventListener('pointerleave', () => aimAt(0, 0));
  });
})();

/* ============================================================
   7d. BEYOND ENTRANCE — with a mouse, the whole section is the
       Explore button; on touch, the photo is. Clicking opens the
       button out until it fills the screen, and the Beyond page's
       own loader carries on from it in the same colour.
   ============================================================ */
(function initBeyondEntrance() {
  const section = document.getElementById('beyond');
  const link = section && section.querySelector('.beyond__portal');
  if (!link) return;

  const CURTAIN_MS = 900;
  let curtain = null;

  section.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;   // new tab etc.
    if (!finePointer.matches && !e.target.closest('.beyond__portal')) return;
    if (!window.getSelection().isCollapsed) return;                 // selecting text
    e.preventDefault();
    if (curtain) return;

    if (prefersReducedMotion) {
      window.location.href = link.href;
      return;
    }

    curtain = document.createElement('div');
    curtain.className = 'curtain';
    curtain.setAttribute('aria-hidden', 'true');
    document.body.appendChild(curtain);

    // open from the pointer, or from the photo when Enter pressed the link
    let x = e.clientX;
    let y = e.clientY;
    if (e.detail === 0) {
      const box = link.getBoundingClientRect();
      x = box.left + box.width / 2;
      y = box.top + box.height / 2;
    }
    const reach = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    curtain.animate(
      [{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${reach}px at ${x}px ${y}px)` }],
      { duration: CURTAIN_MS, easing: 'cubic-bezier(0.77, 0, 0.175, 1)', fill: 'forwards' }
    ).finished.then(() => {
      window.location.href = link.href;
    });
  });

  // coming back with the browser's back button restores this page as it was
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted || !curtain) return;
    curtain.remove();
    curtain = null;
  });
})();

/* ============================================================
   8. BACKGROUND — a full-screen grid of dots that swell and fade
      in slow waves, on every page. MAX_ALPHA sets how visible it
      is: barely, on purpose.
   ============================================================ */
(function initBackgroundFx() {
  const canvas = document.getElementById('bgFx');
  if (!canvas || prefersReducedMotion) return;

  const ctx = canvas.getContext('2d');

  const onDark = document.body.classList.contains('page-beyond');
  const DOT = onDark ? '237, 232, 220' : '139, 48, 34';   // cream on dark, accent on cream
  const MAX_ALPHA = onDark ? 0.06 : 0.09;

  const SPACING = 32;       // distance between dots
  const MIN_SIZE = 0.6;     // dot radius when exhaled
  const MAX_SIZE = 1.8;     // dot radius when inhaled
  const FRAME_MS = 33;      // the waves are slow, so 30 frames a second is plenty

  let w = 0, h = 0;
  let lastFrame = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // slow waves drifting across the grid: 0 = exhaled, 1 = inhaled
  function breathAt(x, y, now) {
    const wave = (
      Math.sin(x * 0.014 + now * 0.0008) +
      Math.sin(y * 0.018 - now * 0.0006) +
      Math.sin((x + y) * 0.009 + now * 0.0004)
    ) / 3;
    // three waves rarely peak together, so stretch them to use the full range
    return Math.max(0, Math.min(1, (wave * 1.7 + 1) / 2));
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (now - lastFrame < FRAME_MS) return;
    lastFrame = now;

    ctx.clearRect(0, 0, w, h);

    for (let x = SPACING / 2; x < w; x += SPACING) {
      for (let y = SPACING / 2; y < h; y += SPACING) {
        const breath = breathAt(x, y, now);
        ctx.beginPath();
        ctx.fillStyle = `rgba(${DOT}, ${MAX_ALPHA * breath})`;
        ctx.arc(x, y, MIN_SIZE + (MAX_SIZE - MIN_SIZE) * breath, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  requestAnimationFrame(frame);
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
   11. "CALL ME SOPAN" — "Safayet" and "Gazi" part, the letters of
       "Sopan" roll up and fade, and the logo's letters arrive the
       same way above it. Then the logo rolls out and the name returns.
       Plays once after the name arrives, then on hover or tap.
   ============================================================ */
(function initCallMe() {
  const wrapper = document.getElementById('heroWrapper');
  const first = document.getElementById('heroFirst');
  const last = document.getElementById('heroLast');
  const text = document.getElementById('heroLastText');
  if (!wrapper || !first || !last || !text || prefersReducedMotion) return;

  const AUTO_DELAY_MS = 800;   // pause after the name arrives
  const SHOWN_MS = 2800;       // from starting until the logo rolls out
  const LEAVE_MS = 1400;       // the return trip

  // split "Sopan" into letters, keeping the whole word for screen readers
  const word = text.textContent;
  const sr = document.createElement('span');
  sr.className = 'visually-hidden';
  sr.textContent = word;

  const chars = document.createElement('span');
  chars.setAttribute('aria-hidden', 'true');
  [...word].forEach((ch, i) => {
    const c = document.createElement('span');
    c.className = 'hero__char';
    c.style.setProperty('--n', i);
    c.textContent = ch;
    chars.appendChild(c);
  });

  text.textContent = '';
  text.append(sr, chars);

  let armed = false;
  let running = false;

  function play() {
    if (!armed || running) return;
    running = true;
    wrapper.classList.add('is-calling');

    setTimeout(() => {
      wrapper.classList.replace('is-calling', 'is-leaving');
      setTimeout(() => {
        wrapper.classList.remove('is-leaving');
        running = false;
      }, LEAVE_MS);
    }, SHOWN_MS);
  }

  last.addEventListener('animationend', (e) => {
    if (e.animationName !== 'slideFromRight') return;
    armed = true;
    setTimeout(play, AUTO_DELAY_MS);
  });

  [first, last].forEach((el) => {
    el.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse') play();
    });
    el.addEventListener('click', play);   // a tap on touch screens
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
   15. LOADER — a curtain: the logo's letters rise in while a thin
       line tracks the real page load, then the letters leave and
       the curtain lifts. Never waits long on a slow connection.
   ============================================================ */
(function initLoader() {
  const loader = document.getElementById('loader');
  const loaderRule = document.getElementById('loaderRule');

  const ready = () => document.dispatchEvent(new Event('site:ready'));

  if (!loader || !loaderRule) {
    ready();
    return;
  }

  const MIN_MS = prefersReducedMotion ? 300 : 1150;   // let the letters finish rising
  const MAX_MS = 2200;     // hard cap, then lift regardless
  const OUT_MS = prefersReducedMotion ? 0 : 500;      // letters leaving
  const LIFT_MS = prefersReducedMotion ? 300 : 800;   // curtain lifting
  const REVEAL_AT_MS = prefersReducedMotion ? 0 : 300;   // hero starts mid-lift

  const start = performance.now();
  let loaded = document.readyState === 'complete';
  let shown = 0;
  let finished = false;

  window.addEventListener('load', () => { loaded = true; });

  function tick(now) {
    if (finished) return;
    const elapsed = now - start;
    const done = (loaded && elapsed >= MIN_MS) || elapsed >= MAX_MS;
    // creep towards 85% while loading, then run to 100%
    const target = done ? 100 : Math.min(85, (elapsed / MAX_MS) * 100);
    shown += (target - shown) * (done ? 0.2 : 0.08);
    loaderRule.style.transform = `scaleX(${shown / 100})`;

    if (done && shown > 99.4) {
      finish();
      return;
    }
    requestAnimationFrame(tick);
  }

  function finish() {
    if (finished) return;
    finished = true;
    loaderRule.style.transform = 'scaleX(1)';
    loader.classList.add('is-out');

    setTimeout(() => {
      loaderRule.style.transform = '';
      loader.classList.add('is-lifting');
      setTimeout(ready, REVEAL_AT_MS);
      setTimeout(() => loader.remove(), LIFT_MS + 100);
    }, OUT_MS);
  }

  // two frames so the letters' start position paints before they rise
  requestAnimationFrame(() => {
    requestAnimationFrame(() => loader.classList.add('is-in'));
  });
  requestAnimationFrame(tick);
  // rAF pauses in background tabs — make sure we still finish on time
  setTimeout(finish, MAX_MS + 600);
})();
