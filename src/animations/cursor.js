import gsap from 'gsap';

export function initCustomCursor() {
  const cursor = document.getElementById('custom-cursor');
  const cursorText = document.getElementById('cursor-text');
  if (!cursor) return;

  // Use gsap.quickTo for high-performance 120fps mouse follower as instructed by gsap-performance
  const xTo = gsap.quickTo(cursor, "x", { duration: 0.35, ease: "power3.out" });
  const yTo = gsap.quickTo(cursor, "y", { duration: 0.35, ease: "power3.out" });

  window.addEventListener('pointermove', (e) => {
    xTo(e.clientX);
    yTo(e.clientY);
  });

  window.addEventListener('mousedown', () => {
    document.body.classList.add('cursor-mouse-down');
  });

  window.addEventListener('mouseup', () => {
    document.body.classList.remove('cursor-mouse-down');
  });

  // Direct seamless bridge for 3D iframe pointer tracking
  window.__onIframePointerMove = (iframeX, iframeY) => {
    const iframe = document.getElementById('hero-connectors-iframe');
    if (!iframe) return;
    const rect = iframe.getBoundingClientRect();
    xTo(rect.left + iframeX);
    yTo(rect.top + iframeY);
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

  window.__onIframePointerDown = () => {
    document.body.classList.add('cursor-mouse-down');
  };

  window.__onIframePointerUp = () => {
    document.body.classList.remove('cursor-mouse-down');
  };

  // Track hover elements with data-cursor
  const interactiveElements = document.querySelectorAll('[data-cursor], a, button, .project-item');

  interactiveElements.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      const cursorType = el.getAttribute('data-cursor') || 'VIEW';
      
      if (cursorType === 'HAND') {
        cursorText.textContent = '';
        document.body.classList.add('cursor-hover-active', 'cursor-is-hand', 'cursor-dark-theme');
      } else {
        cursorText.textContent = cursorType;
        document.body.classList.add('cursor-hover-active');
        document.body.classList.remove('cursor-is-hand');
        
        if (el.closest('#hero-window-container') || el.closest('#video-modal')) {
          document.body.classList.add('cursor-dark-theme');
        } else {
          document.body.classList.remove('cursor-dark-theme');
        }
      }

      if (cursorType === 'SOUND') {
        document.body.classList.add('cursor-hover-sound');
      }
    });

    el.addEventListener('mouseleave', () => {
      cursorText.textContent = '';
      document.body.classList.remove('cursor-hover-active', 'cursor-hover-sound', 'cursor-dark-theme', 'cursor-is-hand');
    });
  });
}
