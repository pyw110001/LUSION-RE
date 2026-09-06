import gsap from 'gsap';

export function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const cursorText = document.getElementById('cursor-text');
  if (!cursor || !cursorText) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) {
    cursor.remove();
    document.documentElement.classList.add('native-cursor');
    return;
  }

  gsap.set(cursor, { x: -120, y: -120, autoAlpha: 0 });
  const xTo = gsap.quickTo(cursor, 'x', { duration: 0.28, ease: 'power3.out' });
  const yTo = gsap.quickTo(cursor, 'y', { duration: 0.28, ease: 'power3.out' });
  let hasMoved = false;

  function revealCursor() {
    if (!hasMoved) {
      hasMoved = true;
      document.documentElement.classList.add('custom-cursor-ready');
      gsap.to(cursor, { autoAlpha: 1, duration: 0.18 });
    }
  }

  function moveCursor(x, y) {
    revealCursor();
    xTo(x);
    yTo(y);
  }

  function hideCursor() {
    hasMoved = false;
    document.documentElement.classList.remove('custom-cursor-ready');
    gsap.to(cursor, { autoAlpha: 0, duration: 0.12 });
  }

  window.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'touch') moveCursor(event.clientX, event.clientY);
  }, { passive: true });
  window.addEventListener('pointerdown', () => document.body.classList.add('cursor-mouse-down'));
  window.addEventListener('pointerup', () => document.body.classList.remove('cursor-mouse-down'));
  window.addEventListener('blur', hideCursor);
  document.addEventListener('pointerleave', (event) => {
    if (!event.relatedTarget) hideCursor();
  });

  window.__onIframePointerMove = (x, y, viewportCoordinates = false) => {
    if (viewportCoordinates) {
      moveCursor(x, y);
    } else {
      const rect = document.getElementById('hero-connectors-iframe')?.getBoundingClientRect();
      if (rect) moveCursor(rect.left + x, rect.top + y);
    }
    cursorText.textContent = '';
    document.body.classList.add('cursor-hover-active', 'cursor-dark-theme', 'cursor-is-hand');
  };
  window.__onIframePointerEnter = () => {
    cursorText.textContent = '';
    document.body.classList.add('cursor-hover-active', 'cursor-dark-theme', 'cursor-is-hand');
  };
  window.__onIframePointerLeave = () => {
    document.body.classList.remove('cursor-hover-active', 'cursor-dark-theme', 'cursor-is-hand', 'cursor-mouse-down');
  };
  window.__onIframePointerDown = () => document.body.classList.add('cursor-mouse-down');
  window.__onIframePointerUp = () => document.body.classList.remove('cursor-mouse-down');

  document.querySelectorAll('[data-cursor], a, button, .project-item').forEach((element) => {
    element.addEventListener('mouseenter', () => {
      const label = element.getAttribute('data-cursor') || 'VIEW';
      cursorText.textContent = label === 'HAND' ? '' : label;
      document.body.classList.add('cursor-hover-active');
      document.body.classList.toggle('cursor-is-hand', label === 'HAND');
      document.body.classList.toggle('cursor-dark-theme', Boolean(element.closest('#hero-window-container, #video-modal')));
      document.body.classList.toggle('cursor-hover-sound', label === 'SOUND');
    });
    element.addEventListener('mouseleave', () => {
      cursorText.textContent = '';
      document.body.classList.remove('cursor-hover-active', 'cursor-hover-sound', 'cursor-dark-theme', 'cursor-is-hand');
    });
  });
}
