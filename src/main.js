import './style.css';
import { SceneManager } from './webgl/SceneManager.js';
import { ConnectorsScene } from './webgl/ConnectorsScene.js';
import { DepthCardMesh } from './webgl/DepthCardMesh.js';
import { initCustomCursor } from './animations/cursor.js';
import { initMagneticButtons } from './animations/magnetic.js';
import { initMenu } from './animations/menu.js';
import { initScrollAnimations } from './animations/scroll.js';
import { AudioManager } from './utils/audio.js';
import { textDecoder } from './utils/TextAnimationHelper.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('%c LUSION %c Real Physics & 2.5D Depth Engine Active ', 'background: #1a2ffb; color: #fff; font-weight: bold; padding: 4px 8px;', 'background: #c1ff00; color: #000; font-weight: bold; padding: 4px 8px;');

  // 1. Initialize Hero 3D Connectors Window (100% Authentic pmndrs.github.io/examples/lusion-connectors)
  const connectorsIframe = document.getElementById('hero-connectors-iframe');
  if (connectorsIframe) {
    connectorsIframe.addEventListener('load', () => {
      try {
        const iframeDoc = connectorsIframe.contentDocument || connectorsIframe.contentWindow.document;
        if (iframeDoc) {
          iframeDoc.addEventListener('pointermove', (e) => {
            const rect = connectorsIframe.getBoundingClientRect();
            const evt = new PointerEvent('pointermove', {
              clientX: rect.left + e.clientX,
              clientY: rect.top + e.clientY,
              bubbles: true
            });
            window.dispatchEvent(evt);
          });
          iframeDoc.addEventListener('pointerenter', () => {
            document.body.classList.add('cursor-hover-active', 'cursor-dark-theme', 'cursor-is-hand');
            const cursorText = document.getElementById('cursor-text');
            if (cursorText) cursorText.textContent = '';
          });
          iframeDoc.addEventListener('pointerleave', () => {
            document.body.classList.remove('cursor-hover-active', 'cursor-dark-theme', 'cursor-is-hand');
            const cursorText = document.getElementById('cursor-text');
            if (cursorText) cursorText.textContent = '';
          });
          iframeDoc.addEventListener('pointerdown', () => {
            document.body.classList.add('cursor-mouse-down');
          });
          iframeDoc.addEventListener('pointerup', () => {
            document.body.classList.remove('cursor-mouse-down');
          });
        }
      } catch (err) {
        console.warn('Iframe cursor sync note:', err);
      }
    });
  }

  // 2. Initialize WebGL Scene (Tunnel & Global Effects)
  const canvas = document.getElementById('canvas');
  let sceneManager = null;
  if (canvas) {
    try {
      sceneManager = new SceneManager(canvas);
      window.sceneManager = sceneManager;
    } catch (err) {
      console.warn('WebGL initialization error:', err);
    }
  }

  // 2. Initialize 2.5D Depth Displacement Shader for All 12 Project Cards
  const projectItems = document.querySelectorAll('.project-item');
  projectItems.forEach((item) => {
    const id = item.getAttribute('data-id');
    const wrapper = item.querySelector('.project-item-image-wrapper');
    const staticImg = item.querySelector('.project-item-image');

    if (id && wrapper) {
      const imageSrc = `/assets/projects/${id}/home.webp`;
      const depthSrc = `/assets/projects/${id}/home_depth.webp`;

      try {
        new DepthCardMesh(wrapper, imageSrc, depthSrc);
        // Fade out static image so WebGL depth shader shines
        if (staticImg) {
          staticImg.style.opacity = '0';
        }
      } catch (e) {
        console.warn('DepthCardMesh fallback for ' + id, e);
      }
    }
  });

  // 3. Matrix Character Scramble Decoder (TextAnimationHelper)
  textDecoder.bindHover('.project-item-line-2-inner');
  textDecoder.bindHover('.header-menu-link-inner');
  textDecoder.bindHover('.end-talk-btn');
  textDecoder.bindHover('#home-reel-cta');

  // 4. Custom Cursor with gsap.quickTo & SecondOrderDynamics
  initCustomCursor();

  // 5. Magnetic Hover Buttons
  initMagneticButtons();

  // 6. Fullscreen Navigation Menu
  initMenu();

  // 7. ScrollTrigger & Lenis Smooth Scroll
  initScrollAnimations(sceneManager);

  // 8. Header Audio Visualizer & Interactive Sound Feedback
  const audioManager = new AudioManager();

  document.querySelectorAll('a, button, .project-item').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      audioManager.playChime(880, 'sine'); // A5 high-tech hover tick
    });
  });

  // Click burst on canvas
  window.addEventListener('click', () => {
    audioManager.playChime(440, 'triangle');
  });
});
