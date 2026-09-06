# Design QA — desktop homepage

Final result: passed

## Scope

- Desktop only. The latest interaction pass was validated at a 1280 × 720 CSS viewport with device-pixel ratio 1.5.
- Source visual truth for the latest pass: `C:\Users\123\AppData\Local\Temp\codex-clipboard-a63b33e1-9519-42b5-8307-7ab04147970b.png` (menu open / CLOSE state) and `C:\Users\123\AppData\Local\Temp\codex-clipboard-dba55ba4-4288-4501-8600-6e79cc1a909d.png` (enabled sound waveform state). Earlier native-cursor references remain applicable to pointer behavior.
- Implementation: `http://127.0.0.1:4173/`, captured in the Codex in-app browser. The accepted implementation screenshot is a session-local browser capture at 1280 × 720 CSS px / DPR 1.5. Pointer rendering itself is browser/OS chrome and is not included in automated screenshots, so the focused comparison combines the supplied photographic references with computed cursor states for each visible target.
- Project detail destinations are intentionally placeholders.
- Mobile layout is explicitly outside scope.

## Comparison summary

| Area | Source characteristics | Implemented result | Status |
| --- | --- | --- | --- |
| Hero geometry | 64px side margins, editorial copy offset from logo, large rounded interactive frame | Side margins, copy origin, type weight, frame height, corner radius and bottom markers aligned to the source composition | Passed |
| Hero interaction | Dense connector physics scene with direct pointer response | Existing Rapier/WASM scene preserved, enlarged and cropped for source-like density; cursor bridge remains interactive | Passed |
| Showreel | Thin oversized headline and media sit above the blue ribbon path | Ribbon now renders below the headline, copy and media (`z-index: 1` versus content at `4–8`) while retaining the pinned transition | Passed |
| Navigation | Transparent top area with three independent controls; compact menu cards remain over visible page content | Removed the full-width white header plate; retained separate sound, talk and menu pills; menu links, newsletter and Labs are stacked source-like panels | Passed |
| Sound state | Blue circular control with a smooth white animated waveform while sound is enabled | Replaced the four vertical bars with a rounded, continuously moving white waveform; the idle state remains a dash and `aria-pressed` stays synchronized | Passed |
| Control transitions | Sound dash/waveform and MENU/CLOSE states flow continuously instead of snapping between hidden elements | Both states now share one layout cell and crossfade with eased scale, rotation and vertical motion; button color and shadow also transition smoothly and reverse cleanly | Passed |
| Cursor | Standard arrow over passive page areas and standard hand pointer over interactive controls and the 3D canvas | Removed the custom ring/label/hand overlay; page computes to `auto`, controls and links to `pointer`, and an injected same-origin override makes the embedded canvas compute to `pointer` | Passed |
| Menu states | Single centered label per row; current item uses a status dot and hover uses a pale rounded highlight with arrow | Removed duplicate hover-label markup and decoder binding; all four 62px rows center one uppercase label and expose current/hover status separately | Passed |
| Featured work | Light editorial canvas with aligned two-column card rows | Left and right cards now share the same top edge; measured first-row tops differ by less than 0.1px and both have `margin-top: 0` | Passed |
| Project cards | Semantic links with restrained depth response | Twelve real anchors using a placeholder target; pointer tilt/parallax replaces twelve permanent WebGL render loops | Passed |
| Video dialog | Playable reel with clear close behavior | Corrupt HTML masquerading as MP4 replaced with a valid local H.264 source; focus moves to close, Escape restores focus | Passed |
| Performance | A small number of active graphics surfaces | One connector canvas at runtime; no project-card WebGL canvases; production JS reduced to roughly 148 KB | Passed |
| Accessibility | Keyboard-operable menu and media, motion fallback | ARIA state, dialog semantics, focus management, keyboard close/trap and reduced-motion behavior added | Passed |

## Runtime verification

- Production build completed successfully.
- Browser console contains no application errors.
- One warning remains inside the bundled third-party connector demo about a deprecated initialization signature; it does not affect the host application or visible interaction.
- Latest focused comparison: the references show the operating-system arrow and hand pointer without a surrounding ring or text label. The implementation no longer contains `#custom-cursor`; passive page space uses `auto`, while sound, talk, menu, project links and the embedded 3D canvas use `pointer`.
- Runtime checks: body `auto`; sound button `pointer`; talk link `pointer`; menu button `pointer`; iframe element `pointer`; iframe body `pointer`; iframe native-pointer override present; custom cursor element absent.
- Motion checks: sound button color/shadow `0.4s`, dash exit `0.2s/0.42s`, waveform entry `0.24s/0.48s`; MENU/CLOSE labels crossfade and slide/scale over `0.24s/0.46s`. Menu open/close and sound on/off were exercised in-browser, including restored idle state and synchronized ARIA values.

## Fixed findings

- P0: showreel asset was invalid HTML saved with an `.mp4` name — replaced and playback verified.
- P1: fixed-pixel selectors targeted missing hero IDs — timeline now targets the actual narrative element.
- P1: pinned sections did not reserve scroll space reliably — trigger/section geometry corrected.
- P1: fullscreen black menu diverged from the source — rebuilt as modular floating cards.
- P1: Featured Work inherited the black page theme — restored the light editorial surface.
- P1: duplicated menu labels were merged by the hover text decoder — simplified the markup and removed that binding.
- P1: the Showreel ribbon covered the headline and project media — moved it behind all primary content layers.
- P1: even Featured Work cards received an artificial 118px offset — removed the stagger so paired cards align.
- P1: the scrolled header created an oversized white backing plate — removed the plate and kept the controls as independent transparent-overlay pills.
- P2: menu active and hover states lacked the source hierarchy — added the current-dot state, lavender hover pill and right arrow.
- P2: sound feedback did not match the source control — added blue hover/active treatment and synchronized visualizer/ARIA state.
- P2: enabled sound used equalizer bars instead of the source waveform — replaced it with a smooth, animated canvas wave and verified the visible enabled state.
- P2: sound dash/waveform and MENU/CLOSE used immediate display swaps — replaced them with reversible opacity, transform, color and shadow transitions while preserving the existing menu-panel timeline.
- P2: hiding the native cursor before the custom cursor was ready could leave the page cursorless — native fallback now remains until actual pointer input.
- P2: cached iframe loads could miss the pointer bridge, and entering the 3D canvas did not itself reveal the cursor — the bridge now attaches immediately when possible and reveals the hand cursor on iframe entry/down.
- P2: custom cursor appeared at the top-left before input — it still starts offscreen and now fades in only after valid non-touch input.
- P2: the ring/dot and illustrated hand still differed from the newly supplied native-cursor references — removed the custom cursor system and restored the standard OS arrow/hand states, including inside the 3D iframe.
- P2: project cards created twelve permanent WebGL render loops — replaced with lightweight pointer transforms.
- P2: modal/menu keyboard and ARIA behavior was incomplete — implemented and verified.
