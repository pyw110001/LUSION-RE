# LUSION-RE Troubleshooting / 排障指南

This guide documents the current implementation. It replaces earlier notes about a global custom cursor, per-card WebGL renderers, and a Three.js showreel tube, which are no longer active in the homepage runtime.

本文以当前代码为准。旧文档中描述的全局自定义光标、每张卡片独立 WebGL 渲染器以及 Three.js Showreel 管线均已退出首页运行链路。

## Quick checks / 快速检查

Run these commands from the repository root:

```bash
node --version
npm ci
npm run build
npm run dev
```

Expected development URL:

```text
http://localhost:3000/
```

If port 3000 is occupied, Vite may choose another port. Always use the exact URL printed in the terminal.

如果 3000 端口被占用，Vite 可能自动切换端口，请以终端实际输出为准。

## 1. The development page does not open / 开发页面打不开

### Symptoms / 现象

- Browser reports connection refused.
- The expected page is not available on port 3000.
- A previous Vite process appears to still be running.

### Checks and fixes / 检查与处理

```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
npm run dev
```

- Confirm that dependencies were installed with `npm ci`.
- Use the URL printed by Vite instead of assuming a port.
- If another application owns port 3000, stop that specific process or start Vite with another explicit port:

```bash
npm run dev -- --port 4173
```

不要仅凭“页面打不开”判断项目损坏，应先区分连接拒绝、资源 404、JavaScript 错误和 WebGL 渲染失败。

## 2. The hero 3D scene is blank / 首屏 3D 场景黑屏或空白

### Current architecture / 当前架构

The hero loads `/lusion-connectors/index.html` in a same-origin iframe. Its production bundle then loads the GLB model and Rapier WASM files from `public/lusion-connectors/assets/`.

首屏通过同源 iframe 加载 `/lusion-connectors/index.html`，内部 bundle 再从 `public/lusion-connectors/assets/` 读取 GLB 模型和 Rapier WASM。

### Checks / 检查

Open browser developer tools and verify that these categories return HTTP 200:

- `/lusion-connectors/index.html`
- `/lusion-connectors/assets/*.js`
- `/lusion-connectors/assets/*.glb`
- `/lusion-connectors/assets/*.wasm`

Also check that the browser supports WebGL and that hardware acceleration is enabled. A page can remain responsive while the embedded WebGL renderer fails.

### Common causes / 常见原因

- Serving `index.html` directly from the file system instead of through Vite.
- Deploying below a different base path without preserving `/lusion-connectors/` asset URLs.
- Missing or partially copied files under `public/lusion-connectors/assets/`.
- Disabled GPU acceleration or an unsupported WebGL environment.

## 3. The pointer disappears over the 3D scene / 光标进入 3D 区域后消失

The current build intentionally uses native OS cursors. `src/main.js` injects a `native-pointer-override` style into the same-origin iframe after it loads.

当前版本使用系统原生光标。`src/main.js` 会在同源 iframe 加载完成后注入 `native-pointer-override`，确保场景内显示手型光标。

Check in the console:

```javascript
document.querySelector('#hero-connectors-iframe')?.dataset.nativePointerReady
```

Expected value: `"true"`.

If it is absent:

1. Confirm the iframe URL is same-origin.
2. Reload without cache so the iframe `load` handler runs again.
3. Inspect the console for `The connector scene is running without its pointer override.`

`src/animations/cursor.js` is retained only as a legacy experiment and is not imported by `src/main.js`. Do not re-enable it unless the design intentionally returns to a custom cursor.

## 4. The sound button animates but no sound plays / 音频按钮有动画但没有声音

Browsers block Web Audio until a user gesture occurs. The first click on the sound button creates or resumes the `AudioContext`; only then are hover and click chimes enabled.

浏览器会阻止未经用户操作的 Web Audio。第一次点击音频按钮后才会创建或恢复 `AudioContext`，随后悬停和点击提示音才生效。

Checks:

- Verify the button has `aria-pressed="true"` and class `is-enabled`.
- Make sure the tab and operating system are not muted.
- Check whether `window.AudioContext` or `window.webkitAudioContext` exists.
- If the browser suspended audio after the tab was backgrounded, click the sound control again.

The dash-to-waveform transition is visual and independent of speaker volume. Its state lives in `src/utils/audio.js`; timing and easing live in `src/style.css`.

## 5. MENU/CLOSE or sound states switch abruptly / 菜单或音频状态出现硬切

The controls must not use `display: none` to swap visual states, because `display` cannot transition.

当前实现让两个状态占据同一网格位置，再通过 `opacity` 和 `transform` 过渡：

- Sound dash exit: `0.2s / 0.42s` opacity and transform.
- Waveform entry: `0.24s / 0.48s` opacity and transform.
- MENU/CLOSE labels: `0.24s / 0.46s` crossfade, vertical motion, and scale.
- Button background/shadow: `0.4s` eased transition.

If the transition still appears immediate:

1. Check whether the operating system has “Reduce motion” enabled. The `prefers-reduced-motion` rule intentionally shortens transitions to `0.01ms`.
2. Confirm the latest `src/style.css` is loaded and clear the Vite/browser cache.
3. Inspect whether another selector overrides `transition-duration`.

## 6. The floating menu does not close correctly / 悬浮菜单无法正常关闭

`src/animations/menu.js` owns the open state, GSAP panel timeline, ARIA values, focus loop, and Escape behavior.

Expected state changes:

| State | Button | Menu |
| --- | --- | --- |
| Closed | `aria-expanded="false"`, label “Open navigation” | `aria-hidden="true"`, no pointer events |
| Open | `aria-expanded="true"`, label “Close navigation” | `aria-hidden="false"`, panels animate into view |

If state becomes inconsistent, check for duplicate click bindings and verify that `body.menu-active` matches `aria-expanded`. Rapid reversal should reuse the same paused GSAP timeline rather than creating a new animation each click.

## 7. Scroll sections jump, overlap, or pin at the wrong height / 滚动段落跳动、重叠或钉住高度异常

`src/animations/scroll.js` connects Lenis to the GSAP ticker and uses viewport-relative ScrollTrigger end distances. The Showreel and tunnel sections are pinned independently.

Checks:

- Test at a desktop viewport at least 1024px wide; mobile behavior is outside project scope.
- Do not initialize Lenis or ScrollTrigger a second time.
- After changing media dimensions or fonts, reload the page so ScrollTrigger can measure the final layout.
- Use the reduced-motion path when validating without smooth scrolling.

For debugging in the browser console:

```javascript
window.lenis
document.querySelectorAll('.pin-spacer').length
```

## 8. The blue ribbon covers text or cards / 蓝色管线遮挡标题或卡片

The current ribbon is an SVG path inside the Showreel section, not a global Three.js tube. Its z-index must stay below the title, description, and media card.

当前蓝色管线是 Showreel 内部 SVG，不是全局 Three.js 管线。请保持以下层级关系：

- Ribbon SVG: background layer.
- Headline, description, and media: foreground layers.
- Ribbon visibility is reduced near the full-screen media phase by the Showreel timeline.

If it leaks into Featured Work, inspect the containing block and `overflow` rules on `#home-reel-pinned-wrapper`; do not solve it by raising the ribbon z-index.

## 9. Project cards are misaligned or slow / 作品卡片不齐或性能较差

The project list is a two-column CSS grid. Even and odd cards intentionally start at the same row height; there is no permanent right-column offset.

项目区为两列 CSS Grid，左右卡片顶部应对齐，不再给偶数卡片附加额外上边距。

Each card uses GSAP `quickTo` for small pointer-driven transforms. The old per-card depth-map WebGL renderers under `src/webgl/` are retained as experiments but are not initialized by the homepage.

If card performance regresses:

- Confirm no `.depth-card-canvas` elements are being created.
- Confirm only the connector iframe owns an active WebGL canvas.
- Avoid adding a separate requestAnimationFrame loop per card.

## 10. The showreel modal is black or will not play / Showreel 弹窗黑屏或无法播放

The modal plays `/assets/videos/reel-desktop.mp4`, a local H.264 file. It starts from time zero after the user clicks the reel card.

Checks:

- Request `/assets/videos/reel-desktop.mp4` directly and confirm HTTP 200.
- Verify the file response is video content, not an HTML error page saved with an `.mp4` extension.
- Confirm the click handler ran after a user gesture.
- Use Escape, backdrop click, or the close button to close; focus should return to the previous control.

## 11. Project cards do not navigate / 作品卡片点击后不跳转

This is intentional. All twelve cards currently point to `#project-placeholder`. `src/main.js` prevents navigation and focuses an accessible “Project details coming soon” message.

这是当前需求范围内的占位行为，不是路由故障。接入真实案例页时，需要同时更新 `href`、删除占位点击拦截，并验证键盘访问与返回路径。

## Build and release checklist / 构建与发布检查

```bash
npm ci
npm run build
git diff --check
git status --short
```

Before pushing:

- Review `design-qa.md` for the current desktop acceptance record.
- Confirm the large local video file is intentional.
- Confirm project links are still expected to be placeholders.
- Do not claim mobile support.
- Check third-party branding, model, media, and reference-asset rights before public or commercial deployment.

## Known non-blocking warning / 已知非阻断警告

The bundled connector demo may log a deprecation warning about initialization parameters. The current QA pass found no host-application errors, and this warning does not block the visible 3D interaction.

嵌入式 connector bundle 可能输出初始化参数弃用警告；当前验证中宿主页面没有应用级错误，该警告不影响可见交互。
