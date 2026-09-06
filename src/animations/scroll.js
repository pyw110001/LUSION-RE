import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

function initShowreelModal(lenis) {
  const reelCard = document.getElementById('home-reel-card');
  const modal = document.getElementById('video-modal');
  const modalClose = document.getElementById('modal-close-btn');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalVideo = document.getElementById('modal-video');
  let previousFocus = null;

  function openModal() {
    previousFocus = document.activeElement;
    modal?.classList.add('is-open');
    modal?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-active');
    lenis?.stop();
    window.setTimeout(() => modalClose?.focus(), 60);
    if (modalVideo) {
      modalVideo.currentTime = 0;
      modalVideo.play().catch(() => {});
    }
  }

  function closeModal() {
    modal?.classList.remove('is-open');
    modal?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-active');
    modalVideo?.pause();
    lenis?.start();
    previousFocus?.focus?.();
  }

  reelCard?.addEventListener('click', openModal);
  modalClose?.addEventListener('click', closeModal);
  modalBackdrop?.addEventListener('click', closeModal);
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal?.classList.contains('is-open')) closeModal();
  });

  modal?.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const focusable = [modalClose, modalVideo].filter(Boolean);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}

export function initScrollAnimations() {
  gsap.registerPlugin(ScrollTrigger);

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lenis = reducedMotion ? null : new Lenis({
    duration: 1.05,
    easing: (t) => 1 - Math.pow(1 - t, 4),
    smoothWheel: true,
    wheelMultiplier: 0.9,
  });

  if (lenis) {
    window.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const header = document.getElementById('header');
  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => header?.classList.toggle('scrolled', self.scroll() > 36),
  });

  initShowreelModal(lenis);

  if (reducedMotion) {
    document.querySelectorAll('.reel-card-choo, .reel-card-play-label').forEach((element) => {
      element.style.opacity = '1';
    });
    return;
  }

  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .fromTo('#home-hero-narrative', { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9 }, 0.1)
    .fromTo('#hero-window-container', { y: 38, scale: 0.975, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 1.15 }, 0.18)
    .fromTo('#home-hero-bottom-bar', { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7 }, 0.65);

  gsap.to('#home-hero-narrative', {
    yPercent: -42,
    autoAlpha: 0.18,
    ease: 'none',
    scrollTrigger: {
      trigger: '#home-hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 0.7,
    },
  });

  gsap.to('#hero-connectors-iframe', {
    scale: 1.22,
    ease: 'none',
    scrollTrigger: {
      trigger: '#home-hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 0.8,
    },
  });

  const ribbonPath = document.getElementById('reel-ribbon-path');
  const ribbonTip = document.getElementById('reel-ribbon-tip');
  const ribbonLength = ribbonPath?.getTotalLength() || 3000;

  if (ribbonPath) {
    gsap.set(ribbonPath, { strokeDasharray: ribbonLength, strokeDashoffset: ribbonLength });
  }

  const reelTimeline = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '#home-reel-pinned-wrapper',
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * 3.2)}`,
      pin: '#home-reel-pinned-wrapper',
      scrub: 0.75,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  if (ribbonPath) {
    reelTimeline.to(ribbonPath, {
      strokeDashoffset: 0,
      duration: 0.72,
      onUpdate() {
        const offset = Number(gsap.getProperty(ribbonPath, 'strokeDashoffset'));
        const distance = Math.max(0, Math.min(ribbonLength, ribbonLength - offset));
        const point = ribbonPath.getPointAtLength(distance);
        ribbonTip?.setAttribute('cx', point.x);
        ribbonTip?.setAttribute('cy', point.y);
        if (ribbonTip) ribbonTip.style.opacity = distance > 8 ? '1' : '0';
      },
    }, 0);
  }

  reelTimeline
    .to('#home-reel-title', { yPercent: -105, autoAlpha: 0, duration: 0.22, ease: 'power2.in' }, 0.12)
    .fromTo('#home-reel-desc-wrap', { y: 54, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.24, ease: 'power2.out' }, 0.12)
    .to('.reel-card-soda', { autoAlpha: 0, duration: 0.2, ease: 'power1.inOut' }, 0.25)
    .to('.reel-card-choo', { autoAlpha: 1, duration: 0.2, ease: 'power1.inOut' }, 0.25)
    .to('#home-reel-desc-wrap', { y: -44, autoAlpha: 0, duration: 0.16, ease: 'power1.in' }, 0.38)
    .to('#home-reel-card-wrapper', {
      width: () => window.innerWidth - 128,
      height: () => window.innerHeight - 128,
      bottom: 64,
      duration: 0.34,
      ease: 'power3.inOut',
    }, 0.38)
    .to('#reel-ribbon-svg', { autoAlpha: 0.14, duration: 0.18 }, 0.55)
    .fromTo('.reel-card-play-label', { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.18, ease: 'power2.out' }, 0.58)
    .fromTo('#home-reel-bg-text', { autoAlpha: 0 }, { autoAlpha: 0.09, duration: 0.18 }, 0.62);

  gsap.fromTo('#home-featured-header',
    { y: 70, autoAlpha: 0 },
    {
      y: 0,
      autoAlpha: 1,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: '#home-featured', start: 'top 78%', toggleActions: 'play none none reverse' },
    });

  ScrollTrigger.batch('.project-item', {
    start: 'top 90%',
    interval: 0.12,
    batchMax: 2,
    onEnter: (batch) => gsap.fromTo(batch,
      { y: 74, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out', overwrite: true }),
  });

  const tunnelTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: '#home-goal-pinned-wrapper',
      start: 'top top',
      end: () => `+=${Math.round(window.innerHeight * 2.6)}`,
      pin: true,
      scrub: 0.8,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  tunnelTimeline
    .to('#home-goal-context', { autoAlpha: 0, y: -90, duration: 0.35, ease: 'power2.in' }, 0)
    .fromTo('#home-goal-image-in-inner', { scale: 0.68 }, { scale: 2.3, duration: 1, ease: 'power1.inOut' }, 0)
    .fromTo('#home-goal-tunnel-title', { scale: 0.62, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.38 }, 0.18)
    .to('#home-goal-tunnel-title', { scale: 2.15, autoAlpha: 0, duration: 0.36 }, 0.64);

  gsap.fromTo('#end-section-content', { y: 70, autoAlpha: 0 }, {
    y: 0,
    autoAlpha: 1,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: { trigger: '#end-section', start: 'top 72%', toggleActions: 'play none none reverse' },
  });

  window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}
