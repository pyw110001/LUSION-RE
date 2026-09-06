import './style.css';
import gsap from 'gsap';
import { initMagneticButtons } from './animations/magnetic.js';
import { initMenu } from './animations/menu.js';
import { initScrollAnimations } from './animations/scroll.js';
import { AudioManager } from './utils/audio.js';
import { textDecoder } from './utils/TextAnimationHelper.js';

function initIframeCursor() {
  const iframe = document.getElementById('hero-connectors-iframe');
  if (!iframe) return;

  const enableNativePointer = () => {
    try {
      const iframeDoc = iframe.contentDocument;
      if (!iframeDoc || iframeDoc.getElementById('native-pointer-override')) return;

      const style = iframeDoc.createElement('style');
      style.id = 'native-pointer-override';
      style.textContent = 'html, body, canvas, #root, #root * { cursor: pointer !important; }';
      iframeDoc.head.appendChild(style);
      iframe.dataset.nativePointerReady = 'true';
    } catch (error) {
      console.warn('The connector scene is running without its pointer override.', error);
    }
  };

  iframe.addEventListener('load', enableNativePointer);
  if (iframe.contentDocument?.readyState === 'complete') enableNativePointer();
}

function initProjectCards() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.querySelectorAll('.project-item').forEach((card) => {
    const frame = card.querySelector('.project-item-main');
    const image = card.querySelector('.project-item-image');
    if (!frame || !image) return;

    card.addEventListener('click', (event) => {
      event.preventDefault();
      document.getElementById('project-placeholder')?.focus({ preventScroll: true });
    });

    if (reducedMotion) return;

    const rotateX = gsap.quickTo(frame, 'rotationX', { duration: 0.45, ease: 'power3.out' });
    const rotateY = gsap.quickTo(frame, 'rotationY', { duration: 0.45, ease: 'power3.out' });
    const imageX = gsap.quickTo(image, 'xPercent', { duration: 0.55, ease: 'power3.out' });
    const imageY = gsap.quickTo(image, 'yPercent', { duration: 0.55, ease: 'power3.out' });

    card.addEventListener('pointermove', (event) => {
      const rect = frame.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      rotateX(y * -4);
      rotateY(x * 5);
      imageX(x * -2.5);
      imageY(y * -2.5);
    }, { passive: true });

    card.addEventListener('pointerleave', () => {
      rotateX(0);
      rotateY(0);
      imageX(0);
      imageY(0);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initIframeCursor();
  initProjectCards();
  initMagneticButtons();
  initMenu();
  initScrollAnimations();

  textDecoder.bindHover('.project-item-line-2-inner');
  textDecoder.bindHover('.end-talk-btn');
  textDecoder.bindHover('#home-reel-cta');

  const audioManager = new AudioManager();
  document.querySelectorAll('a, button, .project-item').forEach((element) => {
    element.addEventListener('mouseenter', () => audioManager.playChime(880, 'sine'));
  });
  window.addEventListener('click', () => audioManager.playChime(440, 'triangle'));

  requestAnimationFrame(() => document.body.classList.add('is-ready'));
});
