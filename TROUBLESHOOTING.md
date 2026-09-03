# LUSION Interactive Web Experience — Troubleshooting & Technical Post-Mortem

This document records the architectural challenges, technical bottlenecks, root-cause analyses, and solutions implemented during the replication of the [Lusion.co](https://lusion.co) interactive web experience.

---

## 📑 Table of Contents

1. [3D Connectors Physics & Rapier WASM Path Resolution](#1-3d-connectors-physics--rapier-wasm-path-resolution)
2. [Iframe Boundary Friction & Custom Cursor Synchronization](#2-iframe-boundary-friction--custom-cursor-synchronization)
3. [Transparent Hand Gesture Cursor & White Disc Removal](#3-transparent-hand-gesture-cursor--white-disc-removal)
4. [2.5D Depth Map Parallax Card Ghosting & Silhouette Tearing](#4-25d-depth-map-parallax-card-ghosting--silhouette-tearing)
5. [Showreel 3D Blue Ribbon Lifetime & Section Confinement](#5-showreel-3d-blue-ribbon-lifetime--section-confinement)
6. [Lenis Smooth Scroll & GSAP ScrollTrigger Synchronization](#6-lenis-smooth-scroll--gsap-scrolltrigger-synchronization)
7. [Adaptive Dual-Stroke Cursor on High-Contrast Themes](#7-adaptive-dual-stroke-cursor-on-high-contrast-themes)

---

## 1. 3D Connectors Physics & Rapier WASM Path Resolution

### Symptom
When embedding the 3D connectors simulation into `#hero-window-container`, the viewport showed a blank canvas with browser console 404 errors attempting to load `rapier_wasm3d_bg.wasm` and `c-transformed-cSRImfZN.glb`.

### Root Cause
The production bundle imported from upstream examples contained hardcoded base paths formatted for `https://pmndrs.github.io/examples/lusion-connectors/`. When hosted on a local Vite root (`http://127.0.0.1:3000/`), relative asset resolution failed.

### Solution
1. Staged assets cleanly in `public/lusion-connectors/assets/`.
2. Patched chunk `public/lusion-connectors/assets/index-Bm0SHfPu.js` to reference local `/lusion-connectors/` paths.
3. Verified Vite serves `.wasm` binaries with `Content-Type: application/wasm` with HTTP 200.

---

## 2. Iframe Boundary Friction & Custom Cursor Synchronization

### Symptom
Moving the mouse from the main page into the 3D window caused the custom cursor to freeze at the top-left boundary of the iframe container. The cursor could not penetrate inside the 3D interaction space.

### Root Cause
The browser's native security model isolates `<iframe>` pointer events. Pointer movements inside an iframe do not bubble to the parent `window`. When the pointer crossed the container border, parent `pointermove` listeners stopped receiving events, causing the custom cursor follower to remain stuck at the border coordinates.

### Solution
Implemented a zero-latency bidirectional pointer bridge:
1. In `public/lusion-connectors/index.html`, added a lightweight event listener to forward pointer coordinates:
   ```javascript
   window.addEventListener('pointermove', (e) => {
     try {
       if (window.parent && window.parent.__onIframePointerMove) {
         window.parent.__onIframePointerMove(e.clientX, e.clientY);
       }
     } catch (err) {}
   });
   ```
2. In `src/animations/cursor.js`, computed parent client coordinates:
   ```javascript
   window.__onIframePointerMove = (iframeX, iframeY) => {
     const iframe = document.getElementById('hero-connectors-iframe');
     if (!iframe) return;
     const rect = iframe.getBoundingClientRect();
     xTo(rect.left + iframeX);
     yTo(rect.top + iframeY);
     cursorText.textContent = '';
     document.body.classList.add('cursor-hover-active', 'cursor-dark-theme', 'cursor-is-hand');
   };
   ```
3. Added `canvas { cursor: none !important; }` inside the iframe to hide the OS system cursor so the unified custom cursor glides effortlessly across the entire 3D window.

---

## 3. Transparent Hand Gesture Cursor & White Disc Removal

### Symptom
When hovering over the 3D window, the hand cursor displayed an unwanted solid white circular background plate, resembling a white disc rather than a clean gesture icon.

### Root Cause
The default hover state for buttons (`body.cursor-hover-active #cursor-ring`) enforced a 58px white circular pill with solid background and shadow for text labels.

### Solution
1. In `src/style.css`, created dedicated styling rules for `body.cursor-is-hand #cursor-ring`:
   ```css
   body.cursor-is-hand #cursor-ring {
     width: auto !important;
     height: auto !important;
     top: -15px !important;
     left: -15px !important;
     background: transparent !important;
     background-color: transparent !important;
     border: none !important;
     box-shadow: none !important;
   }
   ```
2. Styled the SVG hand icon with solid white fill (`fill="#ffffff"`), crisp dark outline (`stroke="#111111" stroke-width="1.5"`), and a subtle drop shadow (`filter: drop-shadow(0 3px 8px rgba(0, 0, 0, 0.65))`).
3. Added click/drag tactile feedback:
   ```css
   body.cursor-is-hand:active #cursor-hand-icon,
   body.cursor-is-hand.cursor-mouse-down #cursor-hand-icon {
     transform: scale(0.85);
   }
   ```

---

## 4. 2.5D Depth Map Parallax Card Ghosting & Silhouette Tearing

### Symptom
When hovering over project cards (such as "Spaace" or "Atlas Motion") and shaking the mouse left and right, high-contrast typography ("spaace") suffered from severe double images, ghosting ("重影"), and colored fringes.

### Root Cause
1. **Excessive Displacement Amplitude**: `u_strength` was set to `0.045`. On a 1000px card, a mouse offset of $\pm 0.8$ resulted in up to 30px of UV displacement.
2. **Pseudo-Chromatic Aberration**: Red, green, and blue channels were sampled at `1.03`, `1.0`, and `0.97` offsets, creating unnatural color-fringed duplicates.
3. **Occlusion Artifact (Double-Sampling)**: When foreground text was displaced, adjacent background pixels sampled from the shifted text region, creating a cloned ghost of the text next to the original letters.

### Solution
1. **Edge-Preserving Occlusion Filter** (`src/webgl/DepthCardMesh.js`):
   Sampled `targetDepth` at the displaced coordinate. If `targetDepth > depth` across a sharp discontinuity, displacement is smoothly attenuated:
   ```glsl
   float depth = texture2D(u_depthTexture, uv).r;
   vec2 offset = u_mouse * (depth - 0.5) * (u_strength * (0.3 + 0.7 * u_hover));
   vec2 targetUv = clamp(uv + offset, 0.0, 1.0);
   float targetDepth = texture2D(u_depthTexture, targetUv).r;

   // Prevent background pixels from bleeding into foreground text
   float depthJump = max(0.0, targetDepth - depth);
   vec2 finalUv = mix(targetUv, uv, smoothstep(0.06, 0.22, depthJump));

   gl_FragColor = texture2D(u_texture, finalUv);
   ```
2. **Calibrated Strength**: Lowered `u_strength` from `0.045` to `0.015`.
3. **Eliminated Color Separation**: Sampled RGB channels together to ensure solid, razor-sharp typography.

---

## 5. Showreel 3D Blue Ribbon Lifetime & Section Confinement

### Symptom
The 3D blue ribbon either leaked into subsequent project cards or disappeared abruptly when the user scrolled away from Showreel.

### Root Cause
The ribbon path control points were previously spanning across the entire page, and pin-spacer scroll offsets were interfering with subsequent sections.

### Solution
1. Restored the authentic 10-node CatmullRom spline strictly mapped to Section 2 (`#home-reel`):
   - Starts top-left: `(-18, 14, -2)`
   - Loops around the project card: `(-8, 3, 1.5) -> (-12, -1, 1.0) -> (-14, -6, 0.5)`
   - Sweeps under "Our Approach": `(0, -3, 1.0) -> (6, 1, 0.5)`
   - Curves down-right to exit: `(14, -12, -2)`
2. Bound lifecycle strictly in `src/animations/scroll.js`:
   ```javascript
   ScrollTrigger.create({
     trigger: "#home-reel",
     start: "top top",
     end: "+=2600",
     pin: true,
     scrub: 1,
     onEnter: () => sceneManager?.setRibbonVisible(true),
     onEnterBack: () => sceneManager?.setRibbonVisible(true),
     onLeave: () => sceneManager?.setRibbonVisible(false),
     onLeaveBack: () => sceneManager?.setRibbonVisible(false),
     onUpdate: (self) => sceneManager?.setRibbonProgress(self.progress)
   });
   ```
3. Exiting Section 2 downward immediately sets `visible = false`, guaranteeing subsequent sections remain clean.

---

## 6. Lenis Smooth Scroll & GSAP ScrollTrigger Synchronization

### Symptom
Programmatic jumps or rapid mouse-wheel inputs caused ScrollTrigger triggers to desynchronize or lag behind the actual scroll viewport position.

### Root Cause
Lenis manages its own smooth virtual scroll loop. If not explicitly bound to GSAP's ticker, ScrollTrigger evaluates native scroll positions that do not match Lenis's interpolated virtual positions.

### Solution
Bound Lenis to GSAP ticker in `src/animations/scroll.js`:
```javascript
lenis.on('scroll', (e) => {
  ScrollTrigger.update();
  if (sceneManager) {
    const scrollProgress = e.progress || (window.scrollY / (document.body.scrollHeight - window.innerHeight));
    sceneManager.setScrollProgress(scrollProgress);
  }
});

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);
```

---

## 7. Adaptive Dual-Stroke Cursor on High-Contrast Themes

### Symptom
A single-color custom cursor (white only or black only) became invisible when transitioning between light typography sections (`#ffffff` background) and dark 3D windows (`#0c0d12` background).

### Root Cause
Monochrome cursors rely on inversion filters or contrast with one background color, failing when encountering mixed content.

### Solution
Created a layered dual-stroke structure in `src/style.css`:
- `#cursor-dot`: Solid black core (`#000000`), surrounded by a 1.5px semi-transparent white border and a 3px drop-shadow.
- `#cursor-ring`: Dual border layers (inner dark border + outer light glow).
- When hovering over dark 3D containers (`#hero-window-container`), dynamically toggles `.cursor-dark-theme` to invert text and stroke contrast instantly.
