
# 📱 Mobile Layout Refactor – Horizontal Reaction Layout (Portrait Mode)

## Goal
Ensure the question screen on mobile **fits the portrait orientation without scrolling**, by restructuring the reaction layout from vertical stacking to a **horizontal line**:

```
[drop-zone1] + [drop-zone2] → [product]
                  [Submit]
```

The reagent bank already fits well. This ticket focuses purely on restructuring the **question layout** to ensure:
- Everything fits within the mobile viewport
- Horizontal visual flow is preserved (no vertical drag behavior)
- The layout is intuitive and clean for small screens

---

## Tasks

### 1. **Update HTML structure of `.reaction-area`**
Make sure the reaction components are structured in the following order:

```html
<div class="reaction-area">
  <div class="drop-zone first-drop"></div>
  <div class="reaction-operator">+</div>
  <div class="drop-zone second-drop"></div>
  <div class="reaction-arrow">→</div>
  <div class="product-container"></div>
</div>

<div class="submit-row">
  <button class="submit-btn">Submit</button>
</div>
```

---

### 2. **Add Mobile-Responsive CSS Layout**
Create or update a media query for max-width 600px (typical phones):

```css
@media (max-width: 600px) {
  .reaction-area {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
    flex-wrap: nowrap;
    margin-bottom: 12px;
    max-width: 100%;
    overflow-x: auto; /* safety clamp */
  }

  .drop-zone, .product-container {
    width: 70px;
    height: 70px;
  }

  .reaction-operator, .reaction-arrow {
    font-size: 1.5rem;
    line-height: 1;
    margin: 0 4px;
  }

  .submit-row {
    text-align: center;
    margin-top: 8px;
  }

  .submit-btn {
    padding: 8px 12px;
    font-size: 1rem;
    width: auto;
  }
}
```

---

### 3. **(Optional) Button Compaction for Mobile**
Also consider condensing or rearranging:
- Reset / Chem-Notes / Next buttons
- Either reduce font + padding, or wrap them in a scrollable row

```css
@media (max-width: 600px) {
  .action-buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 6px;
  }

  .btn {
    font-size: 0.8rem;
    padding: 6px 8px;
  }

  .btn.read-notes {
    display: none; /* optional, toggle if needed */
  }
}
```

---

## Acceptance Criteria

- On iPhone SE-sized screens (320px × 568px), the question fits fully with no scrolling
- User can drag from answer bank to either drop-zone naturally
- Submit button is clearly visible and accessible
- Visual spacing is compact but readable and touchable

---

## Notes

- No changes are needed to answer bank layout
- Make sure drag logic remains intact
- Test both orientations, but this layout is optimized for **portrait mode**
- Touch experience is top priority – no hover dependencies

---

_Assigned to: Mobile Layout Refactor branch_
