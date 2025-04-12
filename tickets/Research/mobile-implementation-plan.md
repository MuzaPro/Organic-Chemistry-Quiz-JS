# Organic Chemistry Quiz Game – Mobile UI Rescue Plan

## Table of Contents

1. Executive Summary
2. Objectives & Success Criteria
3. Current Pain Points
4. Design Principles
5. Mobile‑First Layout Architecture
6. CSS Strategy & Code Skeleton
7. HTML Adjustments
8. Phased Migration Roadmap
9. Testing & Quality Assurance
10. Performance & Accessibility
11. Risk Matrix & Mitigations
12. Future Enhancements

---

## 1. Executive Summary

Phone users currently view only a slice of the quiz interface. We will **re‑architect the layout with a mobile‑first CSS approach**, introducing sticky header/footer bars, scrollable content regions, and touch‑optimised interaction patterns. No JavaScript refactor is required beyond minor event‑hook additions.

## 2. Objectives & Success Criteria

| Goal                                    | KPI                                                   |
| --------------------------------------- | ----------------------------------------------------- |
| Full quiz usability on screens ≤ 425 px | 100 % of core UI elements visible without manual zoom |
| One‑hand operation                      | Primary controls reachable in bottom 50 % of viewport |
| Maintain desktop/tablet look            | ≤ 5 % visual regression issues on ≥ 768 px            |
| Zero JS bundle size growth              | < 1 KB added                                          |

## 3. Current Pain Points (from device lab & screenshots)

- **Fixed‑height containers** clip content vertically.
- **Reagent bank** and **controls** compete for space; neither is sticky.
- Media queries only shrink components; they don’t **re‑flow** them.
- Modal & bottom spacing push footer off‑screen.

## 4. Design Principles

1. **Mobile‑first**: Base styles assume ≤ 768 px, upscale with min‑width breakpoints.
2. **Sticky Critical Regions**: Header (progress) and bottom control bar remain in view.
3. **Scrollable Non‑Critical Regions**: Question text & reagent grid scroll inside flex boxes.
4. **Thumb‑Zone Priority**: Submit/Reset/Notes anchored at bottom for ergonomic reach.
5. **Single DOM‑tree**: No duplicate markup; rely solely on CSS order & `flex`.

## 5. Mobile‑First Layout Architecture

```
.quiz-root (flex‑column, h:100vh)
 ├─ .header‑sticky   (0 0 auto)
 ├─ .question‑scroll (1 1 auto, overflow‑y)
 ├─ .reaction‑fixed  (0 0 auto)
 ├─ .reagent‑scroll  (1 1 auto, overflow‑y)
 └─ .controls‑sticky (0 0 auto)
```

*Portrait*: vertical flow as above. *Landscape*: two‑column grid using CSS Grid; reaction + controls left, reagent bank right.

### Component Priorities

| Tier | Component                    | Behaviour                     |
| ---- | ---------------------------- | ----------------------------- |
| A    | Reaction area, Submit        | Always visible (sticky)       |
| B    | Reagent bank                 | Scrollable list/grid          |
| C    | Header details, score, notes | Collapsible / secondary views |

## 6. CSS Strategy & Code Skeleton

### 6.1 Base Mobile Styles ( ≤ 767 px )

```css
html,body{height:100%;margin:0;overflow:hidden}
.quiz-root{display:flex;flex-direction:column;height:100vh;overflow:hidden}
.header-sticky{position:sticky;top:0;z-index:20;background:#fff;border-bottom:1px solid var(--border-color);}
.controls-sticky{position:sticky;bottom:0;z-index:20;background:#fff;border-top:1px solid var(--border-color);display:flex;justify-content:space-between;padding:8px 12px;}
.question-scroll{flex:0 0 auto;max-height:20vh;overflow-y:auto;padding:8px 12px;}
.reaction-fixed{flex:0 0 auto;display:flex;justify-content:center;gap:12px;padding:10px;}
.reagent-scroll{flex:1 1 auto;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:8px;}
.reagent-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:8px;}
```

### 6.2 Landscape Override ( ≥ 568 px & orientation\:landscape )

```css
@media (orientation:landscape) and (max-height:500px){
  .quiz-root{display:grid;grid-template-columns:40% 60%;grid-template-rows:auto 1fr auto;height:100vh;}
  .header-sticky{grid-column:1/3;}
  .reaction-fixed{grid-column:1/2;grid-row:2/3;flex-direction:column;}
  .reagent-scroll{grid-column:2/3;grid-row:2/3;}
  .controls-sticky{grid-column:1/2;grid-row:3/4;}
}
```

### 6.3 Utility Enhancements

- `.scroll-y` – momentum scroll wrapper.
- `.hide-on-mobile` / `.show-on-mobile` – content toggles.
- `touch-action:none` on drag elements to prevent scroll interference.

## 7. HTML Adjustments

1. **Add wrapper** `<div class="quiz-root">` around existing `header`, `main`, `footer`.
2. Split existing `main` into:
   ```html
   <section class="question-scroll">…</section>
   <section class="reaction-fixed">…</section>
   <section class="reagent-scroll"><div class="reagent-grid" id="reagent-bank"></div></section>
   ```
3. Move action buttons (`Reset`, `Submit`, `Notes`) into `.controls-sticky` div after footer removal.
4. Update JS selectors once (IDs unchanged inside moved nodes).

## 8. Phased Migration Roadmap

| Phase | Scope                                          | Owner         | Est. hrs |
| ----- | ---------------------------------------------- | ------------- | -------- |
| 1     | Skeleton CSS + wrappers, no logic change       | Front‑end dev | 4        |
| 2     | Sticky header/footer polish, thumb‑zone sizing | Front‑end dev | 3        |
| 3     | Landscape grid & responsive fine‑tune          | Front‑end dev | 3        |
| 4     | QA on device matrix, bug‑fix                   | QA + dev      | 6        |
| 5     | Production merge & monitor                     | DevOps        | 1        |

## 9. Testing & Quality Assurance

### 9.1 Device Matrix

- iPhone SE / 13 / 15 Pro Max
- Pixel 5 / 8 Pro
- Galaxy S20 Ultra (portrait + landscape)
- iPad Mini & iPad Pro (split‑view)

### 9.2 Test Cases

1. Complete full quiz in portrait without scrolling entire page.
2. Rotate mid‑question – state persists.
3. Drag‑drop accuracy near screen edges.
4. Bottom sheet (notes) open/close does not shift layout.
5. VoiceOver / TalkBack announces dynamic content.

## 10. Performance & Accessibility

- Keep DOM depth unchanged to avoid reflow cost.
- Use `will-change: transform` on animated drag elements only.
- Respect `prefers-reduced-motion` (already implemented for background).
- Ensure 44 × 44 px tap targets.
- Contrast check after color tweaks.

## 11. Risk Matrix & Mitigations

| Risk                                           | Likelihood | Impact | Mitigation                                                                |
| ---------------------------------------------- | ---------- | ------ | ------------------------------------------------------------------------- |
| Overlapping sticky regions on foldable screens | M          | M      | Use `env(safe-area-inset-*)` padding & test on Galaxy Fold emulators      |
| Unexpected JS scroll‑locking bugs              | M          | H      | Keep global `overflow:hidden`; use `body.sheet-open` toggle only in modal |
| Drag‑drop performance degradation              | L          | M      | Hardware accelerate drag ghost (`translate3d`)                            |

## 12. Future Enhancements

- **Progress Mini‑Bar** inside bottom controls for constant visibility.
- **Gesture‑driven bottom sheet** for chemistry notes (swipe‑up/down).
- **Haptic feedback** via Vibration API on correct drop (Android only).

---

**Ready for implementation.**

> *“Mobile first, desktop best.”* – Let’s ship it.

