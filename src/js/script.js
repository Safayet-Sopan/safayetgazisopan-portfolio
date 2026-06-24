/* ============================================================
   PORTFOLIO — script.js
   ============================================================ */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   1. HERO — load animation
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const first = document.getElementById('heroFirst');
  const last  = document.getElementById('heroLast');
  const meta  = document.querySelector('.hero__meta');
  const photo = document.getElementById('heroPhoto');

  // small rAF delay so browser has painted
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (first) first.classList.add('in');
      if (last)  last.classList.add('in');
      if (photo) photo.classList.add('in');
      setTimeout(() => { if (meta) meta.classList.add('in'); }, 700);
    });
  });
});

// /* ============================================================
//    2. HERO PHOTO — unfix / fade out once hero leaves view
//    ============================================================ */
// (function initHeroPhotoUnfix() {
//   const hero  = document.getElementById('hero');
//   const photo = document.getElementById('heroPhoto');
//   if (!hero || !photo) return;

//   const observer = new IntersectionObserver((entries) => {
//     entries.forEach(entry => {
//       // entry.isIntersecting is false once the hero section has fully
//       // scrolled out of view (using a small negative bottom margin so it
//       // triggers right as the hero bottom edge passes the viewport top)
//       if (!entry.isIntersecting) {
//         photo.classList.add('fixed-out');
//       } else {
//         photo.classList.remove('fixed-out');
//       }
//     });
//   }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });

//   observer.observe(hero);
// })();

/* ============================================================
   3. SCROLL ANIMATION ENGINE — IntersectionObserver
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
   4. NAV — scroll background + active section highlight
   ============================================================ */
(function initNav() {
  const nav = document.getElementById('nav');
  const links = document.querySelectorAll('.nav__link');

  // sticky background on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });

  // active link based on section in view
  const sections = document.querySelectorAll('section[id]');
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.getAttribute('id');
      if (entry.isIntersecting && id !== 'hero') {
        // activate corresponding nav link
        links.forEach(link => {
          const href = link.getAttribute('href').replace('#', '');
          link.classList.toggle('active', href === id);
        });
      } else if (entry.isIntersecting && id === 'hero') {
        // when hero is in view, remove all active states
        links.forEach(link => link.classList.remove('active'));
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => sectionObserver.observe(s));
})();

/* ============================================================
   5. MOBILE MENU — burger toggle
   ============================================================ */
(function initMobileMenu() {
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('mobileMenu');
  if (!burger || !menu) return;

  let isOpen = false;

  function toggle() {
    isOpen = !isOpen;
    menu.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    // animate burger spans
    const spans = burger.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
      spans[1].style.transform = 'translateY(-6.5px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.transform = '';
    }
  }

  burger.addEventListener('click', toggle);

  // close when a link is clicked
  menu.querySelectorAll('.mobile-menu__link').forEach(link => {
    link.addEventListener('click', () => {
      if (isOpen) toggle();
    });
  });
})();

/* ============================================================
   7. EMAIL COPY TO CLIPBOARD
   ============================================================ */
(function initContactModal() {
  const trigger = document.getElementById('emailTrigger');
  const modal = document.getElementById('contactModal');
  const overlay = modal.querySelector('.contact-modal__overlay');
  const closeBtn = document.getElementById('contactModalClose');
  const form = document.getElementById('contactForm');
  if (!trigger || !modal || !overlay || !closeBtn || !form) return;

  const focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

  const openModal = (e) => {
    e.preventDefault();
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const firstInput = modal.querySelector('input, textarea');
    firstInput && firstInput.focus();
  };

  const closeModal = () => {
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    trigger.focus();
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
   8. CONTACT HEADING — character reveal on scroll
   ============================================================ */
(function initContactReveal() {
  if (prefersReducedMotion) return;

  const heading = document.getElementById('contactHeading');
  if (!heading) return;

  const text = heading.textContent;
  heading.innerHTML = '';

  [...text].forEach((char, i) => {
    const span = document.createElement('span');
    span.classList.add('char');
    span.textContent = char === ' ' ? '\u00A0' : char;
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
   9. CUSTOM CURSOR
   ============================================================ */
(function initCustomCursor() {
  const cursor = document.querySelector('.cursor');
  if (!cursor) return;

  let mouseX = 0;
  let mouseY = 0;

  let currentX = 0;
  let currentY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animate() {
    currentX += (mouseX - currentX) * 0.18;
    currentY += (mouseY - currentY) * 0.18;

    cursor.style.left = currentX + 'px';
    cursor.style.top = currentY + 'px';

    requestAnimationFrame(animate);
  }

  animate();
})();

/* ============================================================
   9b. BACKGROUND CURSOR FX — kinetic dot grid
   ============================================================ */
(function initBackgroundFx() {
  const canvas = document.getElementById('bgFx');
  if (!canvas || prefersReducedMotion) return;
  if (window.matchMedia('(hover: none)').matches) return;

  const ctx = canvas.getContext('2d');

  const SPACING = 32;      // distance between dots
  const RADIUS = 210;      // cursor influence radius
  const DOT_MAX = 3.0;     // max dot size near cursor
  const WARP = 14;         // how far dots drift toward cursor
  const ACCENT = [139, 48, 34];   // deep accent (center)
  const WARM = [196, 122, 74];    // warm terracotta (edges)

  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let w = 0, h = 0;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // smoothed cursor position; start off-screen so nothing shows until move
  let mouseX = -9999, mouseY = -9999;
  let curX = -9999, curY = -9999;

  // visibility: appears while moving, fades out when the cursor is idle
  let intensity = 0;      // smoothed 0..1 master opacity
  let target = 0;         // where intensity is heading
  let lastMove = 0;       // timestamp of last movement
  const IDLE_MS = 140;    // stillness before it starts to fade out

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    target = 1;
    lastMove = performance.now();
  });
  document.addEventListener('mouseleave', () => {
    target = 0;
  });

  function frame() {
    curX += (mouseX - curX) * 0.12;
    curY += (mouseY - curY) * 0.12;

    // fade out once the cursor has been still for a moment
    if (target === 1 && performance.now() - lastMove > IDLE_MS) target = 0;
    intensity += (target - intensity) * 0.08;

    ctx.clearRect(0, 0, w, h);

    // nothing to draw while fully faded out
    if (intensity < 0.01) {
      requestAnimationFrame(frame);
      return;
    }

    const onScreen = curX > -1000;

    // soft radial halo following the cursor
    if (onScreen) {
      const halo = ctx.createRadialGradient(curX, curY, 0, curX, curY, RADIUS);
      halo.addColorStop(0, `rgba(${ACCENT.join(',')}, ${0.07 * intensity})`);
      halo.addColorStop(0.5, `rgba(${WARM.join(',')}, ${0.035 * intensity})`);
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(curX - RADIUS, curY - RADIUS, RADIUS * 2, RADIUS * 2);
    }

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

        // gentle warp: dots drift toward the cursor as it nears
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
    requestAnimationFrame(frame);
  }
  frame();
})();

/* ============================================================
   10. CURSOR HOVER EFFECT
   ============================================================ */
document
  .querySelectorAll('a, button')
  .forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.querySelector('.cursor').classList.add('hover');
    });

    el.addEventListener('mouseleave', () => {
      document.querySelector('.cursor').classList.remove('hover');
    });
  });

/* ============================================================
   HERO PHOTO PARALLAX
   ============================================================ */

(function heroParallax() {
  const photo = document.getElementById("heroPhoto");

  if (!photo) return;

  let current = 0;
  let target = 0;

  function animate() {
    current += (target - current) * 0.08;

    photo.style.transform =
      `translateX(-50%) translateY(${current}px)`;

    requestAnimationFrame(animate);
  }

  window.addEventListener("scroll", () => {
    target = window.scrollY * -0.25;
  });

  animate();
})();

/* ============================================================
   11. SKILL TOOLTIP
   ============================================================ */

(function initSkillTooltip() {

  const tooltip = document.querySelector('.skill-tooltip');

  if (!tooltip) return;

  const text = tooltip.querySelector('p');

  let mouseX = 0;
  let mouseY = 0;

  let currentX = 0;
  let currentY = 0;

  document.querySelectorAll('.skill-item').forEach(item => {

    item.addEventListener('mouseenter', () => {

      text.textContent = item.dataset.desc;

      tooltip.classList.add('active');

    });

    item.addEventListener('mouseleave', () => {

      tooltip.classList.remove('active');

    });

    item.addEventListener('mousemove', (e) => {

      mouseX = e.clientX + 40;
      mouseY = e.clientY - 20;

    });

  });

  function animateTooltip() {

    currentX += (mouseX - currentX) * 0.12;
    currentY += (mouseY - currentY) * 0.12;

    tooltip.style.left = currentX + 'px';
    tooltip.style.top = currentY + 'px';

    requestAnimationFrame(animateTooltip);

  }

  animateTooltip();

})();

/* ============================================================
   SOPAN SCRAMBLE HOVER
   ============================================================ */

(function initHeroScramble() {

  const letters =
  "!@#^*(){}[];±?abcdefghijklmnopqrstuvwxyz";

  const target = document.querySelector(".hero-scramble");

  if (!target) return;

  const originalText = target.innerText;

  let running = false;

  target.addEventListener("mouseenter", () => {

    if (running) return;

    running = true;

    let iteration = 0;

    const interval = setInterval(() => {

      target.innerText = originalText
        .split("")
        .map((letter, index) => {

          if (index < iteration) {
            return originalText[index];
          }

          return letters[
            Math.floor(Math.random() * letters.length)
          ];

        })
        .join("");

      if (iteration >= originalText.length) {

        clearInterval(interval);

        target.innerText = originalText;

        running = false;

      }

      iteration += 0.35;

    }, 25);

  });

})();

/* ============================================================
   WORK SLIDER — measures real card position, no snap needed
   ============================================================ */
(function initWorkSlider() {

  const grid = document.querySelector('.work-grid');
  const next = document.getElementById('workNext');
  const prev = document.getElementById('workPrev');

  if (!grid || !next || !prev) return;

  const cards = Array.from(grid.querySelectorAll('.work-card'));
  if (!cards.length) return;

  let currentIndex = 0;

  function goTo(index) {
    currentIndex = Math.max(0, Math.min(index, cards.length - 1));

    const gridRect = grid.getBoundingClientRect();
    const cardRect = cards[currentIndex].getBoundingClientRect();
    const offset = (cardRect.left - gridRect.left) + grid.scrollLeft;

    grid.scrollTo({
      left: offset,
      behavior: 'smooth'
    });
  }

  next.addEventListener('click', (e) => {
    e.preventDefault();
    goTo(currentIndex + 1);
  });

  prev.addEventListener('click', (e) => {
    e.preventDefault();
    goTo(currentIndex - 1);
  });

})();

const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loaderBar');

let progress = 0;

const loaderTimer = setInterval(() => {

  progress += 1;

  if(progress > 100){
    progress = 100;
  }

  loaderBar.style.width = `${progress}%`;

  if(progress >= 100){

    clearInterval(loaderTimer);

    setTimeout(() => {

      loader.classList.add('is-hidden');

      setTimeout(() => {
        loader.remove();
      },1200);

    },300);
  }

},15);