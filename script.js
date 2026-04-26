/* ═══════════════════════════════════════════════════════════════
   INES JRIDI – PORTFOLIO  |  script.js
   Three.js 3D Background · Typing · Scroll Animations · Cursor
═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────────────────────
   1. CUSTOM CURSOR
───────────────────────────────────────────────────────────── */
const cursor = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursorFollower');

if (cursor && window.matchMedia('(pointer: fine)').matches) {
  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top  = mouseY + 'px';
  });

  // Smooth follower
  function animateCursor() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    cursorFollower.style.left = followerX + 'px';
    cursorFollower.style.top  = followerY + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Hover effect on interactive elements
  const interactiveEls = document.querySelectorAll(
    'a, button, .project-card, .cert-card, .skill-group, .soft-tag, .stat-card'
  );
  interactiveEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hover');
      cursorFollower.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover');
      cursorFollower.classList.remove('hover');
    });
  });
}

/* ─────────────────────────────────────────────────────────────
   2. THREE.JS 3D HERO BACKGROUND
───────────────────────────────────────────────────────────── */
(function initThreeJS() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene    = new THREE.Scene();
  const camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  // ── Particle field ──
  const particleCount = 1800;
  const positions = new Float32Array(particleCount * 3);
  const colors    = new Float32Array(particleCount * 3);

  const palette = [
    [0.98, 0.66, 0.82], // rose-300
    [0.98, 0.50, 0.63], // rose-400
    [0.82, 0.49, 0.85], // purple
    [1.00, 1.00, 1.00], // white
  ];

  for (let i = 0; i < particleCount; i++) {
    // Spherical distribution
    const r     = 40 + Math.random() * 30;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);

    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3]     = c[0];
    colors[i * 3 + 1] = c[1];
    colors[i * 3 + 2] = c[2];
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.25,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // ── Floating geometric rings ──
  const rings = [];
  const ringColors = [0xfda4ba, 0xf43f75, 0xc084fc];
  [18, 24, 30].forEach((radius, i) => {
    const geo = new THREE.TorusGeometry(radius, 0.06, 8, 80);
    const mat = new THREE.MeshBasicMaterial({
      color: ringColors[i],
      transparent: true,
      opacity: 0.08 - i * 0.015,
      wireframe: false,
    });
    const torus = new THREE.Mesh(geo, mat);
    torus.rotation.x = (Math.random() - 0.5) * Math.PI;
    torus.rotation.y = (Math.random() - 0.5) * Math.PI;
    scene.add(torus);
    rings.push(torus);
  });

  // ── Icosahedron mesh ──
  const icoGeo = new THREE.IcosahedronGeometry(8, 1);
  const icoMat = new THREE.MeshBasicMaterial({
    color: 0xfda4ba,
    wireframe: true,
    transparent: true,
    opacity: 0.06,
  });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  scene.add(ico);

  // ── Mouse parallax ──
  let targetRotX = 0, targetRotY = 0;
  let currentRotX = 0, currentRotY = 0;

  document.addEventListener('mousemove', e => {
    targetRotY = ((e.clientX / window.innerWidth)  - 0.5) * 0.6;
    targetRotX = ((e.clientY / window.innerHeight) - 0.5) * 0.4;
  });

  // ── Animation loop ──
  const clock = new THREE.Clock();
  function animate() {
    const t = clock.getElapsedTime();

    // Smooth mouse follow
    currentRotX += (targetRotX - currentRotX) * 0.04;
    currentRotY += (targetRotY - currentRotY) * 0.04;

    particles.rotation.x = currentRotX * 0.3 + t * 0.015;
    particles.rotation.y = currentRotY * 0.3 + t * 0.018;

    rings.forEach((ring, i) => {
      ring.rotation.x += 0.003 * (i % 2 === 0 ? 1 : -1);
      ring.rotation.z += 0.002 * (i % 2 === 0 ? -1 : 1);
    });

    ico.rotation.x = t * 0.08;
    ico.rotation.y = t * 0.06;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

/* ─────────────────────────────────────────────────────────────
   3. FLOATING PARTICLES (CSS-based)
───────────────────────────────────────────────────────────── */
(function initParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;

  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 4 + 2;
    p.style.cssText = `
      position:absolute;
      width:${size}px;
      height:${size}px;
      background:rgba(249,168,212,${Math.random() * 0.4 + 0.1});
      border-radius:50%;
      left:${Math.random() * 100}%;
      top:${Math.random() * 100}%;
      animation:floatParticle ${6 + Math.random() * 8}s ${Math.random() * 6}s infinite ease-in-out;
      pointer-events:none;
    `;
    container.appendChild(p);
  }

  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatParticle {
      0%,100%{transform:translateY(0) scale(1);opacity:0.3}
      50%{transform:translateY(-${20 + Math.random()*30}px) scale(1.3);opacity:0.8}
    }
  `;
  document.head.appendChild(style);
})();

/* ─────────────────────────────────────────────────────────────
   4. TYPING EFFECT
───────────────────────────────────────────────────────────── */
(function initTyping() {
  const el = document.getElementById('typingText');
  if (!el) return;

  const words = [
    'Ingénierie Logicielle',
    'Full-Stack Development',
    'Business Intelligence',
    'Analyse de Données',
    'Systèmes d\'Information',
  ];

  let wordIdx = 0, charIdx = 0, isDeleting = false;

  function type() {
    const word = words[wordIdx];

    if (!isDeleting) {
      charIdx++;
      el.textContent = word.slice(0, charIdx);
      if (charIdx === word.length) {
        isDeleting = true;
        setTimeout(type, 1800);
        return;
      }
    } else {
      charIdx--;
      el.textContent = word.slice(0, charIdx);
      if (charIdx === 0) {
        isDeleting = false;
        wordIdx = (wordIdx + 1) % words.length;
      }
    }

    const speed = isDeleting ? 45 : 80;
    setTimeout(type, speed);
  }

  setTimeout(type, 1600);
})();

/* ─────────────────────────────────────────────────────────────
   5. NAVIGATION
───────────────────────────────────────────────────────────── */
(function initNav() {
  const nav       = document.getElementById('nav');
  const burger    = document.getElementById('navBurger');
  const mobileMenu = document.getElementById('mobileMenu');
  const navLinks  = document.querySelectorAll('.nav-link');
  const mobileLinks = document.querySelectorAll('.mobile-menu a');

  // Scroll class
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });

  // Burger toggle
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      document.body.classList.toggle('no-scroll');
    });
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.body.classList.remove('no-scroll');
      });
    });
  }

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  function setActiveNav() {
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (window.scrollY >= sectionTop) current = section.getAttribute('id');
    });
    navLinks.forEach(link => {
      link.classList.toggle(
        'active',
        link.getAttribute('href') === '#' + current
      );
    });
  }
  window.addEventListener('scroll', setActiveNav, { passive: true });
  setActiveNav();
})();

/* ─────────────────────────────────────────────────────────────
   6. THEME TOGGLE
───────────────────────────────────────────────────────────── */
(function initTheme() {
  const btn = document.getElementById('themeToggle');
  const html = document.documentElement;

  // Load saved preference
  const saved = localStorage.getItem('ij-theme') || 'dark';
  html.setAttribute('data-theme', saved);

  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('ij-theme', next);
  });
})();

/* ─────────────────────────────────────────────────────────────
   7. SCROLL REVEAL (Intersection Observer)
───────────────────────────────────────────────────────────── */
(function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  if (!('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // Stagger siblings
        const siblings = Array.from(el.parentElement.querySelectorAll('.reveal-up, .reveal-left, .reveal-right'));
        const idx = siblings.indexOf(el);
        setTimeout(() => {
          el.classList.add('revealed');
        }, idx * 80);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  reveals.forEach(el => observer.observe(el));
})();

/* ─────────────────────────────────────────────────────────────
   8. SKILL BARS ANIMATION
───────────────────────────────────────────────────────────── */
(function initSkillBars() {
  const bars = document.querySelectorAll('.skill-bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const width = bar.getAttribute('data-width');
        setTimeout(() => {
          bar.style.width = width + '%';
        }, 200);
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => observer.observe(bar));
})();

/* ─────────────────────────────────────────────────────────────
   9. CONTACT FORM
───────────────────────────────────────────────────────────── */
(function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"] span');
    btn.textContent = 'Envoi en cours…';

    // Simulate form submission
    setTimeout(() => {
      form.reset();
      btn.textContent = 'Envoyer le message';
      success.classList.add('visible');
      setTimeout(() => success.classList.remove('visible'), 4000);
    }, 1400);
  });
})();

/* ─────────────────────────────────────────────────────────────
   10. DOWNLOAD CV BUTTON
───────────────────────────────────────────────────────────── */
(function initCVDownload() {
  const btn = document.getElementById('downloadCV');
  if (!btn) return;

  btn.addEventListener('click', e => {
    e.preventDefault();
    // In a real deployment, replace this href with the actual CV file path
    // e.g., btn.href = 'assets/CV-Ines-Jridi.pdf';
    // For now, show a toast
    showToast('📄 CV disponible bientôt !');
  });
})();

/* ─────────────────────────────────────────────────────────────
   11. TOAST NOTIFICATION
───────────────────────────────────────────────────────────── */
function showToast(message) {
  let toast = document.querySelector('.ij-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'ij-toast';
    document.body.appendChild(toast);

    const style = document.createElement('style');
    style.textContent = `
      .ij-toast {
        position: fixed;
        bottom: 88px;
        right: 28px;
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: 12px;
        padding: 14px 22px;
        font-family: var(--font-body);
        font-size: 0.88rem;
        color: var(--text);
        box-shadow: 0 8px 40px rgba(0,0,0,0.3);
        z-index: 9999;
        transform: translateY(20px);
        opacity: 0;
        transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
        pointer-events: none;
      }
      .ij-toast.show {
        transform: translateY(0);
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }

  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ─────────────────────────────────────────────────────────────
   12. SMOOTH SECTION TRANSITIONS (tint on scroll)
───────────────────────────────────────────────────────────── */
(function initSectionGlow() {
  const sections = document.querySelectorAll('section[id]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.setProperty(
          '--section-glow', 'rgba(249,168,212,0.03)'
        );
      }
    });
  }, { threshold: 0.2 });

  sections.forEach(s => observer.observe(s));
})();

/* ─────────────────────────────────────────────────────────────
   13. STAT COUNTER ANIMATION
───────────────────────────────────────────────────────────── */
(function initCounters() {
  const stats = document.querySelectorAll('.stat-num');
  if (!stats.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const text = el.textContent;
        const num = parseFloat(text.replace(/[^0-9.]/g, ''));
        const suffix = text.replace(/[0-9.]/g, '');
        if (!isNaN(num)) animateCount(el, num, suffix);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  stats.forEach(s => observer.observe(s));

  function animateCount(el, target, suffix) {
    const start = 0;
    const duration = 1400;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(start + (target - start) * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }
})();

/* ─────────────────────────────────────────────────────────────
   14. MAGNETIC BUTTON EFFECT
───────────────────────────────────────────────────────────── */
(function initMagnetic() {
  const buttons = document.querySelectorAll('.btn-primary, .btn-ghost');

  buttons.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width  / 2;
      const y = e.clientY - rect.top  - rect.height / 2;
      btn.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });
})();

/* ─────────────────────────────────────────────────────────────
   15. TIMELINE ITEM ANIMATIONS (staggered)
───────────────────────────────────────────────────────────── */
(function initTimeline() {
  const items = document.querySelectorAll('.timeline-item');
  items.forEach((item, i) => {
    item.style.transitionDelay = `${i * 0.06}s`;
  });
})();

/* ─────────────────────────────────────────────────────────────
   INIT COMPLETE
───────────────────────────────────────────────────────────── */
console.log('%c✦ Inès Jridi Portfolio ✦', 'color:#f9a8d4;font-size:18px;font-weight:300;font-family:Georgia,serif');
console.log('%cBuilt with Three.js · GSAP · Pure JS', 'color:#c4b5d0;font-size:12px');
