/**
 * TextAnimationHelper - Recreating Lusion's signature Matrix character scramble decode
 * Based on Lusion's TextAnimationHelper reverse-engineered from hoisted.js
 */
export class TextAnimationHelper {
  constructor() {
    this.chars = '!<>-_\\/[]{}—=+*^?#________ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  }

  /**
   * Scramble decode an element's text content
   * @param {HTMLElement} element - Target DOM element
   * @param {string} originalText - The final resolved text
   * @param {number} duration - Total animation time in seconds
   */
  scramble(element, originalText = null, duration = 0.55) {
    if (!element) return;
    const targetText = originalText || element.getAttribute('data-original-text') || element.textContent.trim();
    if (!element.getAttribute('data-original-text')) {
      element.setAttribute('data-original-text', targetText);
    }

    if (element._scrambleAnimId) {
      cancelAnimationFrame(element._scrambleAnimId);
    }

    const startTime = performance.now();
    const length = targetText.length;

    const animate = (currentTime) => {
      const elapsed = (currentTime - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);

      // Number of resolved characters
      const resolvedCount = Math.floor(progress * length);

      let output = '';
      for (let i = 0; i < length; i++) {
        if (targetText[i] === ' ' || targetText[i] === '\n') {
          output += targetText[i];
        } else if (i < resolvedCount) {
          output += targetText[i];
        } else if (i < resolvedCount + 3 && progress < 1) {
          // Scrambling character window
          const char = this.chars[Math.floor(Math.random() * this.chars.length)];
          output += `<span style="color: #c1ff00; opacity: 0.9;">${char}</span>`;
        } else {
          // Unresolved character placeholder
          const char = this.chars[Math.floor(Math.random() * this.chars.length)];
          output += `<span style="opacity: 0.35;">${char}</span>`;
        }
      }

      element.innerHTML = output;

      if (progress < 1) {
        element._scrambleAnimId = requestAnimationFrame(animate);
      } else {
        element.textContent = targetText;
        element._scrambleAnimId = null;
      }
    };

    element._scrambleAnimId = requestAnimationFrame(animate);
  }

  /**
   * Bind hover scramble listener to a collection of elements
   */
  bindHover(selector) {
    const elements = typeof selector === 'string' ? document.querySelectorAll(selector) : selector;
    elements.forEach((el) => {
      const original = el.textContent.trim();
      el.setAttribute('data-original-text', original);

      el.addEventListener('mouseenter', () => {
        this.scramble(el, original, 0.45);
      });
    });
  }
}

export const textDecoder = new TextAnimationHelper();
